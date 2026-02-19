import { supabase } from '../../../lib/supabase';
import { CustomScreening, TestData } from '../types';
import { toast } from 'sonner';
import { validateProducts } from '../utils/validators/productValidator';
import { validateTestData } from '../utils/validators/testDataValidator';
import { TestCreationError } from '../utils/errors';
import apiClient from '../../../lib/api';
import { Profile } from '../../../lib/db';
import { walmartService } from '../../walmart/services/walmartService';
import { tiktokService } from '../../tiktok/services/tiktokService';

interface TestResponse {
  id: string;
  name: string;
  search_term: string;
  status: string;
  competitors: any[];
  variations: any[];
  demographics: any[];
  custom_screening: any[];
  created_at: string;
  updated_at: string;
  block?: boolean; 
  company?: { name: string }; 
}

export const testService = {
  async createTest(testData: TestData) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new TestCreationError('Not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id as any)
        .single();

      const typedProfile = profile as Profile;

      if (profileError || !typedProfile?.company_id) {
        throw new TestCreationError('Company profile not found');
      }

      const isAdmin = typedProfile.role === 'admin';
   
      // Step 1: Validar datos de entrada
      const validation = validateTestData(testData, isAdmin);
      if (!validation.isValid) {
        console.error('❌ Validation failed:', validation.errors);
        throw new TestCreationError('Validation failed', { errors: validation.errors });
      }

      // Validar productos relacionados
      const productIds = Object.values(testData.variations)
        .filter((v): v is NonNullable<typeof v> => v !== null)
        .map(v => v.id);

      await validateProducts(typedProfile.company_id, productIds);

      // Step 2: Crear test principal
      const test = await this.insertTest(testData, user.id, typedProfile.company_id);

      // Step 3: Insertar variaciones
      await this.insertVariations(test.id, testData.variations);

      // Step 4: Insertar competidores
      await this.saveCompetitors(test.id, testData.competitors, testData.skin);

      // Step 5: Insertar datos demográficos
      await this.insertDemographics(test.id, testData.demographics);

      // Step 6: Guardar custom screening questions (if applicable)
      if (testData.demographics.customScreening?.enabled) {
        await this.saveCustomScreeningQuestion(test.id, testData.demographics.customScreening);
      }

      // Step 7: Guardar survey questions (use defaults if expert mode is disabled)
      const defaultQuestions = ['value', 'appearance', 'confidence', 'brand', 'convenience'];
      await this.insertSurveyQuestions(test.id, testData.surveyQuestions || defaultQuestions);

      // Step 7: Crear proyecto en Respondent
      await this.createProlificProjectsForVariations(test, testData);


      return test;
    } catch (error) {
      console.error('Test creation error:', error);

      if (error instanceof TestCreationError) {
        const message = error.details?.errors?.join('. ') || error.message;
        toast.error(message);
      } else {
        toast.error('An unexpected error occurred');
      }

      throw error;
    }
  },

  // Method to save test as draft with less strict validation
  async saveDraft(testData: TestData) {
    try {    
      // Basic validation for draft - only require essential fields
      const errors: string[] = [];
      
      if (!testData?.name?.trim()) {
        errors.push('Test name is required');
      }

      if (!testData?.searchTerm?.trim()) {
        errors.push('Search term is required');
      }

      if (errors.length > 0) {
        console.error('❌ Draft validation failed:', errors);
        throw new TestCreationError('Validation failed', { errors });
      }
      console.log('✅ Draft validation passed');

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new TestCreationError('Not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id as any)
        .single();

      const typedProfile = profile as Profile;

      if (profileError || !typedProfile?.company_id) {
        throw new TestCreationError('Company profile not found');
      }

      // Create test as draft with minimal required data
      const test = await this.insertTest(testData, user.id, typedProfile.company_id);

      // Insert variations if available (optional for drafts)
      if (testData.variations && Object.values(testData.variations).some(v => v !== null)) {
        await this.insertVariations(test.id, testData.variations);
      }

      // Insert competitors if available (optional for drafts)
      if (testData.competitors && testData.competitors.length > 0) {
        await this.saveCompetitors(test.id, testData.competitors, testData.skin);
      }

      // Insert demographics if available (optional for drafts)
      if (testData.demographics && testData.demographics.ageRanges && testData.demographics.ageRanges.length > 0) {
        await this.insertDemographics(test.id, testData.demographics);
      }

      // Save custom screening if enabled (optional for drafts)
      if (testData.demographics?.customScreening?.enabled && testData.demographics.customScreening.question) {
        await this.saveCustomScreeningQuestion(test.id, testData.demographics.customScreening);
      }

      // Save survey questions (use defaults if not specified)
      const defaultQuestions = ['value', 'appearance', 'confidence', 'brand', 'convenience'];
      await this.insertSurveyQuestions(test.id, testData.surveyQuestions || defaultQuestions);

      // Create Prolific projects for variations (same as in createTest)
      await this.createProlificProjectsForVariations(test, testData);
      return test;
    } catch (error) {
      console.error('Draft save error:', error);

      if (error instanceof TestCreationError) {
        const message = error.details?.errors?.join('. ') || error.message;
        toast.error(message);
      } else {
        toast.error('An unexpected error occurred while saving draft');
      }

      throw error;
    }
  },

  // Función para insertar el test principal
  async insertTest(testData: TestData, userId: string, companyId: string) {
    const { data: test, error } = await supabase
      .from('tests')
      .insert({
        name: testData.name.trim(),
        search_term: testData.searchTerm.trim(),
        status: 'draft',
        company_id: companyId,
        user_id: userId,
        settings: {},
        objective: testData.objective,
        skin: testData.skin || 'amazon',
      })
      .select()
      .single();

    if (error) {
      throw new TestCreationError('Failed to create test', { error });
    }

    return test;
  },

  async saveAmazonProducts(testId: string, products: any[]) {
    try {
      await apiClient.post(`/amazon/products/${testId}`, { products });
    } catch (error) {
      console.error(error);
      throw new TestCreationError('Failed to save competitors', { error });
    }
  },

  async saveWalmartProducts(testId: string, products: any[]) {
    try {
      // Use the correct Walmart service method
      await walmartService.saveProductsWithTest(products, testId);
    } catch (error) {
      console.error('Walmart products save error:', error);
      throw new TestCreationError('Failed to save Walmart competitors', { error });
    }
  },

  async saveTikTokProducts(testId: string, products: any[]) {
    try {
      await tiktokService.saveProductsWithTest(products, testId);
    } catch (error) {
      console.error('TikTok products save error:', error);
      throw new TestCreationError('Failed to save TikTok competitors', { error });
    }
  },

  async saveCompetitors(testId: string, products: any[], skin: 'amazon' | 'walmart' | 'tiktokshop') {
    try {
      if (skin === 'amazon') {
        await this.saveAmazonProducts(testId, products);
      } else if (skin === 'walmart') {
        await this.saveWalmartProducts(testId, products);
      } else if (skin === 'tiktokshop') {
        await this.saveTikTokProducts(testId, products);
      }
    } catch (error) {
      console.error(error);
      throw new TestCreationError('Failed to save competitors', { error });
    }
  },

  // Función para insertar variaciones
  async insertVariations(testId: string, variations: TestData['variations']) {
    for (const [type, variation] of Object.entries(variations)) {
      if (variation) {
        const { error } = await supabase.from('test_variations').insert({
          test_id: testId,
          product_id: variation.id,
          variation_type: type,
        } as any);

        if (error) {
          await supabase.from('tests').delete().eq('id', testId);
          throw new TestCreationError('Failed to add variation', { error });
        }
      }
    }
  },

  async saveCustomScreeningQuestion(testId: string, customScreening: CustomScreening) {
    const { error } = await supabase.from('custom_screening').insert({
      test_id: testId,
      question: customScreening.question,
      valid_option: customScreening.validAnswer,
      invalid_option: customScreening.validAnswer === 'Yes' ? 'No' : 'Yes',
    } as any);

    if (error) {
      await supabase.from('tests').delete().eq('id', testId);
      throw new TestCreationError('Failed to save custom screening question', { error });
    }
  },

  // Función para insertar datos demográficos
  async insertDemographics(testId: string, demographics: TestData['demographics']) {
    const { error } = await supabase.from('test_demographics').insert({
      test_id: testId,
      age_ranges: demographics.ageRanges,
      genders: demographics.gender,
      locations: demographics.locations,
      interests: demographics.interests,
      tester_count: demographics.testerCount,
      custom_screening_enabled: demographics.customScreening?.enabled || false,
    } as any);

    if (error) {
      await supabase.from('tests').delete().eq('id', testId);
      throw new TestCreationError('Failed to add demographics', { error });
    }
  },

  // Función para insertar survey questions
  async insertSurveyQuestions(testId: string, surveyQuestions: string[]) {
    const { data, error } = await supabase.from('test_survey_questions').insert({
      test_id: testId,
      selected_questions: surveyQuestions,
    } as any);

    if (error) {
      await supabase.from('tests').delete().eq('id', testId);
      throw new TestCreationError('Failed to add survey questions', { error });
    }
  },
  generateDynamicTitle(searchTerm: string, skin: 'amazon' | 'walmart' | 'tiktokshop' = 'amazon'): string {
    const storeName = skin === 'walmart' ? 'Walmart' : skin === 'tiktokshop' ? 'TikTok Shop' : 'Amazon';
    return `${storeName} shopping: Discover '${searchTerm}'!`;
  },
  // Función para crear el proyecto en Respondent
  async createProlificProjectsForVariations(test: any, testData: TestData) {
    for (const [variationType, variation] of Object.entries(testData.variations)) {
      if (variation) {
        const respondentProjectData = {
          publicTitle: this.generateDynamicTitle(test.search_term, testData.skin),
          publicInternalName: `${test.id}-${variationType}`,
          participantTimeRequiredMinutes: 10,
          incentiveAmount: Math.round((20 / 60) * 10 * 100),
          targetNumberOfParticipants: testData.demographics.testerCount,
          externalResearcher: {
            researcherId: test.company_id,
            researcherName: 'Company Researcher',
          },
          demographics: {
            ageRanges: testData.demographics.ageRanges,
            genders: Array.isArray(testData.demographics.gender)
              ? testData.demographics.gender
              : [testData.demographics.gender],
            locations: testData.demographics.locations,
            interests: testData.demographics.interests,
          },
          testId: test.id,
          variationType,
          customScreeningEnabled: testData.demographics.customScreening?.enabled || false,
        };

        try {
          console.log(`Creating Prolific project for variation ${variationType}:`, respondentProjectData);
          const response = await apiClient.post('/tests', respondentProjectData);

          console.log(`Response status for variation ${variationType}:`, response.status);
          console.log(`Response data for variation ${variationType}:`, response.data);
        } catch (error: any) {
          console.error(`Failed to create Prolific project for variation ${variationType}:`, {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
          });
          
          // Only delete the test if it's a critical error, not a Prolific API issue
          if (error.response?.status >= 500) {
            await supabase.from('tests').delete().eq('id', test.id);
            throw new TestCreationError('Failed to create Prolific project - server error', { error });
          } else {
            // For client errors (400-499), keep the test but show warning
            console.warn(`Prolific project creation failed for variation ${variationType}, but keeping test in database`);
            throw new TestCreationError(`Failed to create Prolific project for variation ${variationType}: ${error.response?.data?.message || error.message}`, { error });
          }
        }
      }
    }
  },
  async getAllTests(): Promise<any[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new TestCreationError('Not authenticated');
      }

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id as any)
        .single();

      if (profileError) {
        throw new TestCreationError('Error fetching user profile');
      }

      const typedProfile = profile as Profile;
      
      // Fetch test data with necessary joins for credit calculation
      let query = supabase
        .from('tests')
        .select(`
          *,
          company:companies(name),
          demographics:test_demographics(
            age_ranges,
            genders,
            locations,
            interests,
            tester_count
          ),
          variations:test_variations(
            product:products(id, title, image_url, price),
            variation_type
          ),
          custom_screening:custom_screening(
            question,
            valid_option
          )
        `)
        .order('created_at', { ascending: false });

      // For non-admin users, only fetch tests from their company
      if (typedProfile?.role !== 'admin') {
        query = query.eq('company_id', typedProfile.company_id as any);
      }

      const { data: tests, error: testsError } = await query;

      if (testsError) {
        console.error('Supabase query error:', testsError);
        throw new TestCreationError('Error fetching tests');
      }

      console.log('✅ Tests fetched successfully:', tests?.length || 0);
      return tests as unknown as any[];
    } catch (error) {
      console.error('Error fetching all tests:', error);
      throw new TestCreationError('Error fetching tests');
    }
  },

  // Función para eliminar un test con cascade deletion
  async deleteTest(testId: string) {
    try {
      console.log(`Starting deletion process for test: ${testId}`);
      
      // First, let's check what data exists for this test
      const { data: testData, error: testCheckError } = await supabase
        .from('tests')
        .select('id, name, skin')
        .eq('id', testId as any)
        .single();

      if (testCheckError) {
        throw new TestCreationError('Test not found', { error: testCheckError });
      }

      console.log(`Deleting test: ${testData.name} (${testData.skin})`);

      // First, delete the test from Prolific platform
      console.log('Deleting test from Prolific platform...');
      try {
        await apiClient.delete(`/tests/${testId}`);
        console.log('Test deleted from Prolific platform successfully');
      } catch (prolificError: any) {
        console.warn('Failed to delete test from Prolific platform:', prolificError.message);
        // Continue with local deletion even if Prolific deletion fails
        // This ensures the local database is cleaned up
      }

      // Delete in the correct order to respect foreign key constraints
      // 1. Delete responses first (they reference test_id)
      console.log('Deleting survey responses...');
      const { error: responsesError } = await supabase
        .from('responses_surveys')
        .delete()
        .eq('test_id', testId as any);

      if (responsesError) {
        console.error('Error deleting survey responses:', responsesError);
      } else {
        console.log('Survey responses deleted successfully');
      }

      // 2. Delete comparison responses (Amazon)
      console.log('Deleting Amazon comparison responses...');
      const { error: comparisonsError } = await supabase
        .from('responses_comparisons')
        .delete()
        .eq('test_id', testId as any);

      if (comparisonsError) {
        console.error('Error deleting comparison responses:', comparisonsError);
      } else {
        console.log('Amazon comparison responses deleted successfully');
      }

      // 3. Delete comparison responses (Walmart) - This is the problematic one
      console.log('Deleting Walmart comparison responses...');
      const { error: walmartComparisonsError } = await supabase
        .from('responses_comparisons_walmart')
        .delete()
        .eq('test_id', testId as any);

      if (walmartComparisonsError) {
        console.error('Error deleting Walmart comparison responses:', walmartComparisonsError);
        // Try to get more details about the error
        console.error('Walmart comparison error details:', {
          code: walmartComparisonsError.code,
          message: walmartComparisonsError.message,
          details: walmartComparisonsError.details,
          hint: walmartComparisonsError.hint
        });
        
        // Check if there are any records that couldn't be deleted
        const { data: remainingRecords, error: checkError } = await supabase
          .from('responses_comparisons_walmart')
          .select('id, test_id, tester_id')
          .eq('test_id', testId as any);
        
        if (checkError) {
          console.error('Error checking remaining Walmart records:', checkError);
        } else {
          console.log('Remaining Walmart records:', remainingRecords);
        }
      } else {
        console.log('Walmart comparison responses deleted successfully');
      }

      // 3.1 Delete comparison responses (TikTok)
      console.log('Deleting TikTok comparison responses...');
      const { error: tiktokComparisonsError } = await supabase
        .from('responses_comparisons_tiktok')
        .delete()
        .eq('test_id', testId as any);

      if (tiktokComparisonsError) {
        console.error('Error deleting TikTok comparison responses:', tiktokComparisonsError);
      } else {
        console.log('TikTok comparison responses deleted successfully');
      }

      // 4. Delete test times (check if table exists first)
      console.log('Deleting test times...');
      const { error: timesError } = await supabase
        .from('test_times')
        .delete()
        .eq('testers_session', testId as any);

      if (timesError) {
        console.log('test_times table uses different column name, trying alternative...');
        // Try with test_id column name as fallback
        const { error: timesError2 } = await supabase
          .from('test_times')
          .delete()
          .eq('test_id', testId as any);
        
        if (timesError2) {
          console.log('Skipping test_times deletion - table structure may be different');
        } else {
          console.log('Test times deleted successfully with alternative column');
        }
      } else {
        console.log('Test times deleted successfully');
      }

      // 5. Delete test sessions
      console.log('Deleting test sessions...');
      const { error: sessionsError } = await supabase
        .from('testers_session')
        .delete()
        .eq('test_id', testId as any);

      if (sessionsError) {
        console.error('Error deleting test sessions:', sessionsError);
      } else {
        console.log('Test sessions deleted successfully');
      }

      // 6. Delete test variations
      console.log('Deleting test variations...');
      const { error: variationsError } = await supabase
        .from('test_variations')
        .delete()
        .eq('test_id', testId as any);

      if (variationsError) {
        console.error('Error deleting test variations:', variationsError);
      } else {
        console.log('Test variations deleted successfully');
      }

      // 7. Delete test competitors
      console.log('Deleting test competitors...');
      const { error: competitorsError } = await supabase
        .from('test_competitors')
        .delete()
        .eq('test_id', testId as any);

      if (competitorsError) {
        console.error('Error deleting test competitors:', competitorsError);
      } else {
        console.log('Test competitors deleted successfully');
      }

      // 8. Delete test demographics
      console.log('Deleting test demographics...');
      const { error: demographicsError } = await supabase
        .from('test_demographics')
        .delete()
        .eq('test_id', testId as any);

      if (demographicsError) {
        console.error('Error deleting test demographics:', demographicsError);
      } else {
        console.log('Test demographics deleted successfully');
      }

      // 9. Delete custom screening
      console.log('Deleting custom screening...');
      const { error: screeningError } = await supabase
        .from('custom_screening')
        .delete()
        .eq('test_id', testId as any);

      if (screeningError) {
        console.error('Error deleting custom screening:', screeningError);
      } else {
        console.log('Custom screening deleted successfully');
      }

      // 10. Delete survey questions (check if table exists first)
      console.log('Deleting survey questions...');
      const { error: questionsError } = await supabase
        .from('survey_questions')
        .delete()
        .eq('test_id', testId as any);

      if (questionsError) {
        if (questionsError.code === '42P01') {
          console.log('survey_questions table does not exist, skipping...');
        } else {
          console.error('Error deleting survey questions:', questionsError);
        }
      } else {
        console.log('Survey questions deleted successfully');
      }

      // 11. Finally, delete the test itself
      console.log('Deleting test record...');
      const { error: testError } = await supabase
        .from('tests')
        .delete()
        .eq('id', testId as any);

      if (testError) {
        console.error('Error deleting test record:', testError);
        throw new TestCreationError('Failed to delete test', { error: testError });
      } else {
        console.log('Test record deleted successfully');
      }

      console.log(`Test ${testId} deleted successfully`);
      return true;
    } catch (error) {
      console.error('Test deletion error:', error);
      if (error instanceof TestCreationError) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
      throw error;
    }
  },

  // Función para crear o actualizar test incompleto con datos parciales
  async saveIncompleteTest(testData: any, existingTestId?: string, currentStep?: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new TestCreationError('Not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id as any)
        .single();

      const typedProfile = profile as Profile;

      if (profileError || !typedProfile?.company_id) {
        throw new TestCreationError('Company profile not found');
      }

      // Mapear el paso actual a los valores del enum
      const mapStepToEnum = (step: string): string => {
        switch (step) {
          case 'objective':
            return 'objective'; // Distinguir objective de search
          case 'variations':
            return 'variants';
          case 'search-term':
            return 'search_term';
          case 'search':
            return 'search_term';
          case 'competitors':
            return 'competitors';
          case 'demographics':
            return 'demographics';
          case 'preview':
            return 'preview';
          case 'review':
            return 'review';
          default:
            return 'objective'; // Valor por defecto
        }
      };

      // Preparar datos básicos para el test
      const testPayload = {
        name: testData.name || `Test - ${new Date().toLocaleDateString()}`,
        search_term: testData.searchTerm || '',
        status: 'incomplete',
        company_id: typedProfile.company_id,
        user_id: user.id,
        objective: testData.objective || null,
        settings: {},
        skin: testData.skin || 'amazon',
        step: currentStep ? mapStepToEnum(currentStep) : 'objective', // Guardar el paso actual en la columna step
      } as any;

      let test;

      if (existingTestId) {
        // Actualizar test existente
        const { data, error } = await supabase
          .from('tests')
          .update(testPayload)
          .eq('id', existingTestId as any)
          .select()
          .single();

        if (error) {
          throw new TestCreationError('Failed to update incomplete test', { error });
        }
        test = data;
      } else {
        // Crear nuevo test
        const { data, error } = await supabase.from('tests').insert(testPayload).select().single();

        if (error) {
          throw new TestCreationError('Failed to create incomplete test', { error });
        }
        test = data;
      }

      // ULTRA OPTIMIZACIÓN: Solo operaciones de base de datos locales, sin APIs externas
      const allOperations: Promise<any>[] = [];

      // Competidores - OPTIMIZADO: Inserción directa sin API externa
      if (testData.competitors && testData.competitors.length > 0) {
        allOperations.push(this.saveCompetitorsBatch(test.id, testData.competitors, testData.skin));
      }

      // Variaciones
      if (testData.variations) {
        allOperations.push(this.insertVariationsBatch(test.id, testData.variations));
      }

      // Demográficos
      if (testData.demographics) {
        allOperations.push(this.insertDemographicsBatch(test.id, testData.demographics));
      }

      // Custom screening
      if (testData.demographics?.customScreening?.enabled) {
        allOperations.push(
          this.saveCustomScreeningBatch(test.id, testData.demographics.customScreening!)
        );
      }

      // Ejecutar TODAS las operaciones en paralelo
      if (allOperations.length > 0) {
        await Promise.all(allOperations);
      }

      return test;
    } catch (error) {
      console.error('Save incomplete test error:', error);
      if (error instanceof TestCreationError) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
      throw error;
    }
  },

  // Nueva función optimizada para guardar competidores sin API externa
  async saveCompetitorsBatch(
    testId: string,
    competitors: any[],
    skin: 'amazon' | 'walmart' | 'tiktokshop' = 'amazon'
  ) {
    if (!competitors || competitors.length === 0) return;

    try {
      console.log('saveCompetitorsBatch - Datos de entrada:', {
        testId,
        competitorsCount: competitors.length,
        competitors: competitors.map(c => ({
          id: c.id,
          asin: c.asin,
          title: c.title,
          hasId: !!c.id,
          hasAsin: !!c.asin,
        })),
      });

      // Primero, limpiar competidores existentes para este test
      await supabase
        .from('test_competitors')
        .delete()
        .eq('test_id', testId as any);

      // Obtener el company_id del usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new TestCreationError('Not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id as any)
        .single();

      if (profileError || !profile?.company_id) {
        throw new TestCreationError('Company profile not found');
      }

      // Find product IDs in the corresponding source table
      const productIds: string[] = [];

      for (const competitor of competitors) {
        const sourceTable = skin === 'walmart' ? 'walmart_products' : skin === 'tiktokshop' ? 'tiktok_products' : 'amazon_products';
        const sourceKey = skin === 'walmart' ? 'walmart_id' : skin === 'tiktokshop' ? 'tiktok_id' : 'asin';
        const lookupValue = competitor[sourceKey];

        if (!lookupValue) {
          continue;
        }

        const { data: existingProduct, error: searchError } = await supabase
          .from(sourceTable as any)
          .select('id')
          .eq(sourceKey, lookupValue)
          .limit(1)
          .maybeSingle();

        if (searchError) {
          console.error('Error buscando producto:', searchError);
          continue; // Saltar este producto si hay error
        }

        if (!existingProduct) {
          continue; // Saltar este producto si no existe
        }

        const productId = (existingProduct as any).id;
        productIds.push(productId);
      }

      console.log(`Total de productos encontrados: ${productIds.length} de ${competitors.length}`);

      if (productIds.length === 0) {
        console.warn('No se encontraron productos válidos en amazon_products');
        return;
      }

      // Crear registros en test_competitors usando los IDs correctos
      const competitorData = productIds.map(productId => ({
        test_id: testId,
        product_id: productId,
      }));

      console.log('Inserting competitor data with correct product IDs:', competitorData);

      // Insertar competidores
      const { data, error } = await supabase.from('test_competitors').insert(competitorData as any);

      if (error) {
        console.error('Supabase error details:', error);
        throw new TestCreationError('Failed to save competitors', { error });
      }

      console.log('Competitors saved successfully:', data);
    } catch (error) {
      console.error('Error in saveCompetitorsBatch:', error);
      throw error;
    }
  },

  // Versión batch de insertVariations
  async insertVariationsBatch(testId: string, variations: TestData['variations']) {
    const variationData = Object.entries(variations)
      .filter(([_, variation]) => variation !== null)
      .map(([type, variation]) => ({
        test_id: testId,
        product_id: variation!.id,
        variation_type: type,
      }));

    if (variationData.length === 0) return;

    const { error } = await supabase.from('test_variations').insert(variationData as any);

    if (error) {
      await supabase.from('tests').delete().eq('id', testId);
      throw new TestCreationError('Failed to add variations', { error });
    }
  },

  // Versión batch de insertDemographics
  async insertDemographicsBatch(testId: string, demographics: TestData['demographics']) {
    const { error } = await supabase.from('test_demographics').insert({
      test_id: testId,
      age_ranges: demographics.ageRanges,
      genders: demographics.gender,
      locations: demographics.locations,
      interests: demographics.interests,
      tester_count: demographics.testerCount,
      custom_screening_enabled: demographics.customScreening?.enabled || false,
    } as any);

    if (error) {
      await supabase.from('tests').delete().eq('id', testId);
      throw new TestCreationError('Failed to add demographics', { error });
    }
  },

  // Versión batch de saveCustomScreening
  async saveCustomScreeningBatch(testId: string, customScreening: CustomScreening) {
    const { error } = await supabase.from('custom_screening').insert({
      test_id: testId,
      question: customScreening.question,
      valid_option: customScreening.validAnswer,
      invalid_option: customScreening.validAnswer === 'Yes' ? 'No' : 'Yes',
    } as any);

    if (error) {
      await supabase.from('tests').delete().eq('id', testId);
      throw new TestCreationError('Failed to save custom screening question', { error });
    }
  },

  // Función para cargar un test incompleto con todos sus datos relacionados (MEJORADA)
  async loadIncompleteTest(testId: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new TestCreationError('Not authenticated');
      }

      // Cargar el test principal
      const { data: test, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId as any)
        .single();

      if (testError) {
        throw new TestCreationError('Failed to load test', { error: testError });
      }

      if (!test) {
        throw new TestCreationError('Test not found');
      }

      // Cargar todos los datos relacionados en paralelo para mejor rendimiento
      const [competitorsResult, variationsResult, demographicsResult, customScreeningResult] =
        await Promise.all([
          // Cargar competidores desde test_competitors -> competitor_products
          supabase
            .from('test_competitors')
            .select(
              `
            product:competitor_products(*)
          `
            )
            .eq('test_id', testId as any),

          // Cargar variaciones desde test_variations -> products
          supabase
            .from('test_variations')
            .select(
              `
            product:products(*),
            variation_type
          `
            )
            .eq('test_id', testId as any),

          // Cargar demográficos
          supabase
            .from('test_demographics')
            .select('*')
            .eq('test_id', testId as any)
            .maybeSingle(),

          // Cargar custom screening
          supabase
            .from('custom_screening')
            .select('*')
            .eq('test_id', testId as any)
            .maybeSingle(),
        ]);

      // Procesar competidores (manejar caso vacío)
      const competitors = competitorsResult.error
        ? []
        : (competitorsResult.data || []).map((c: any) => c.product).filter(Boolean);

      // Procesar variaciones (manejar caso vacío)
      const variations = variationsResult.error
        ? { a: null, b: null, c: null }
        : (variationsResult.data || []).reduce(
            (acc: any, v: any) => {
              if (v.product && v.variation_type) {
                acc[v.variation_type] = v.product;
              }
              return acc;
            },
            { a: null, b: null, c: null }
          );

      // Procesar demográficos (manejar caso vacío)
      const demographics =
        demographicsResult.error || !demographicsResult.data
          ? {
              ageRanges: [],
              gender: [],
              locations: [],
              interests: [],
              testerCount: 25,
              customScreening: {
                enabled: false,
                question: '',
                validAnswer: undefined,
                isValidating: false,
              },
            }
          : {
              ageRanges: demographicsResult.data.age_ranges || [],
              gender: demographicsResult.data.genders || [],
              locations: demographicsResult.data.locations || [],
              interests: demographicsResult.data.interests || [],
              testerCount: demographicsResult.data.tester_count || 25,
              customScreening: {
                enabled: !!customScreeningResult.data,
                question: customScreeningResult.data?.question || '',
                validAnswer:
                  (customScreeningResult.data?.valid_option as 'Yes' | 'No') || undefined,
                isValidating: false,
              },
            };

      // Mapear el paso del enum a los valores internos de la UI
      const mapEnumToStep = (step: string): string => {
        switch (step) {
          case 'objective':
            return 'objective';
          case 'search_term':
            return 'search-competitors';
          case 'variants':
            return 'variations';
          case 'competitors':
            return 'search-competitors';
          case 'demographics':
            return 'demographics';
          case 'preview':
            return 'preview';
          case 'review':
            return 'review';
          default:
            return 'objective'; // Si no hay paso guardado, empezar desde el principio
        }
      };

      // Determinar el último paso completado basado en los datos disponibles
      let lastCompletedStep = 'objective';

      // Check if objective is set (this is the first step)
      if ((test as any).objective) {
        lastCompletedStep = 'objective';
      }
      
      // Check if variations are set (this comes before search in new order)
      if (variations.a || variations.b || variations.c) {
        lastCompletedStep = 'variations';
      }
      
      // Check if search-competitors step is fully completed (exactly 11 competitors)
      if (competitors.length === 11) {
        lastCompletedStep = 'search-competitors';
      }
      
      if (demographics.ageRanges.length > 0 || demographics.gender.length > 0) {
        lastCompletedStep = 'demographics';
      }

      // Si hay un paso guardado en la columna step, usarlo; si no, usar el determinado por los datos
      const currentStep = (test as any).step
        ? mapEnumToStep((test as any).step)
        : lastCompletedStep;

      // Construir el objeto TestData completo
      const testData = {
        name: (test as any).name || '',
        searchTerm: (test as any).search_term || '',
        objective: (test as any).objective,
        competitors: competitors,
        variations: variations,
        demographics: demographics,
      };

      return {
        testData,
        lastCompletedStep,
        currentStep,
        testId: (test as any).id,
      };
    } catch (error) {
      console.error('Load incomplete test error:', error);
      if (error instanceof TestCreationError) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred while loading the test');
      }
      throw error;
    }
  },

  // Función para determinar el siguiente paso basado en el último completado
  getNextStep(lastCompletedStep: string): string {
    const steps = [
      'objective',
      'variations',
      'search',
      'competitors',
      'demographics',
      'preview',
      'review',
    ];
    const currentIndex = steps.indexOf(lastCompletedStep);

    if (currentIndex === -1 || currentIndex === steps.length - 1) {
      return 'objective';
    }

    return steps[currentIndex + 1];
  },

  // Función helper para continuar un test incompleto
  async continueIncompleteTest(testId: string) {
    try {
      // Cargar todos los datos del test
      const { testData, currentStep, lastCompletedStep } = await this.loadIncompleteTest(testId);

      // Usar currentStep como el paso al que navegar (donde se quedó el usuario)
      // No necesitamos nextStep, queremos ir al paso actual

      console.log('ContinueIncompleteTest - Datos cargados:', {
        testId,
        currentStep,
        lastCompletedStep,
        testDataKeys: Object.keys(testData),
      });

      return {
        testData,
        currentStep,
        lastCompletedStep,
        nextStep: currentStep, // Mantener compatibilidad con la interfaz existente
        testId,
      };
    } catch (error) {
      console.error('Continue incomplete test error:', error);
      throw error;
    }
  },

  // Función para actualizar un test incompleto a draft y actualizar sus datos
  async updateIncompleteTestToDraft(testId: string, testData: TestData) {
    try {
      console.log('Actualizando test incompleto a draft:', testId);

      // 1. Actualizar el test principal a draft
      const { error: updateError } = await supabase
        .from('tests')
        .update({
          name: testData.name.trim(),
          search_term: testData.searchTerm.trim(),
          status: 'draft',
          objective: testData.objective,
          skin: testData.skin || 'amazon',
        })
        .eq('id', testId as any);

      if (updateError) {
        throw new TestCreationError('Failed to update test status', { error: updateError });
      }

      // 2. Actualizar datos relacionados en paralelo
      const updateOperations: Promise<any>[] = [];

      // Limpiar datos existentes primero
      updateOperations.push(
        supabase
          .from('test_competitors')
          .delete()
          .eq('test_id', testId as any),
        supabase
          .from('test_variations')
          .delete()
          .eq('test_id', testId as any),
        supabase
          .from('test_demographics')
          .delete()
          .eq('test_id', testId as any),
        supabase
          .from('custom_screening')
          .delete()
          .eq('test_id', testId as any)
      );

      await Promise.all(updateOperations);

      // 3. Insertar datos actualizados
      const insertOperations: Promise<any>[] = [];

      // Competidores
      if (testData.competitors && testData.competitors.length > 0) {
        insertOperations.push(this.saveCompetitorsBatch(testId, testData.competitors, testData.skin));
      }

      // Variaciones
      if (testData.variations) {
        insertOperations.push(this.insertVariationsBatch(testId, testData.variations));
      }

      // Demográficos
      if (testData.demographics) {
        insertOperations.push(this.insertDemographicsBatch(testId, testData.demographics));
      }

      // Custom screening
      if (testData.demographics?.customScreening?.enabled) {
        insertOperations.push(
          this.saveCustomScreeningBatch(testId, testData.demographics.customScreening!)
        );
      }

      // Ejecutar todas las inserciones en paralelo
      if (insertOperations.length > 0) {
        await Promise.all(insertOperations);
      }

      console.log('Test incompleto actualizado exitosamente a draft:', testId);
    } catch (error) {
      console.error('Error actualizando test incompleto a draft:', error);
      throw error;
    }
  },

  // Función para crear proyectos en Prolific para un test existente
  async createProlificProjectsForTest(testId: string, testData: TestData) {
    try {
      console.log('Creando proyectos Prolific para test existente:', testId);

      // Obtener información del test
      const { data: test, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId as any)
        .single();

      if (testError || !test) {
        throw new TestCreationError('Failed to get test information', { error: testError });
      }

      // Crear proyectos en Prolific para cada variación
      for (const [variationType, variation] of Object.entries(testData.variations)) {
        if (variation) {
          const respondentProjectData = {
            publicTitle: this.generateDynamicTitle(testData.searchTerm, testData.skin),
            publicInternalName: `${testId}-${variationType}`,
            participantTimeRequiredMinutes: 10,
            incentiveAmount: Math.round((20 / 60) * 10 * 100),
            targetNumberOfParticipants: testData.demographics.testerCount,
            externalResearcher: {
              researcherId: (test as any).company_id,
              researcherName: 'Company Researcher',
            },
            demographics: {
              ageRanges: testData.demographics.ageRanges,
              genders: Array.isArray(testData.demographics.gender)
                ? testData.demographics.gender
                : [testData.demographics.gender],
              locations: testData.demographics.locations,
              interests: testData.demographics.interests,
            },
            testId: testId,
            variationType,
            customScreeningEnabled: testData.demographics.customScreening?.enabled || false,
          };

          try {
            console.log(`Creating Prolific project for variation ${variationType}:`, respondentProjectData);
            const response = await apiClient.post('/tests', respondentProjectData);
            console.log(
              `Prolific project created for variation ${variationType}:`,
              response.status,
              response.data
            );
          } catch (error: any) {
            console.error(
              `Failed to create Prolific project for variation ${variationType}:`,
              {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url,
                method: error.config?.method,
                data: error.config?.data
              }
            );
            throw new TestCreationError('Failed to create Prolific project', { error });
          }
        }
      }

      console.log('Proyectos Prolific creados exitosamente para test:', testId);
    } catch (error) {
      console.error('Error creando proyectos Prolific:', error);
      throw error;
    }
  },
};
