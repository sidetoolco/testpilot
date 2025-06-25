import { supabase } from '../../../lib/supabase';
import { CustomScreening, TestData } from '../types';
import { toast } from 'sonner';
import { validateProducts } from '../utils/validators/productValidator';
import { validateTestData } from '../utils/validators/testDataValidator';
import { TestCreationError } from '../utils/errors';
import apiClient from '../../../lib/api';
import { Profile } from '../../../lib/db';

interface TestResponse {
  id: string;
  name: string;
  search_term: string;
  status: string;
  competitors: any[];
  variations: any[];
  demographics: any[];
  created_at: string;
  updated_at: string;
}

export const testService = {
  async createTest(testData: TestData) {
    try {
      // Step 1: Validar datos de entrada
      const validation = validateTestData(testData);
      if (!validation.isValid) {
        throw new TestCreationError('Validation failed', { errors: validation.errors });
      }

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

      // Validar productos relacionados
      const productIds = Object.values(testData.variations)
        .filter((v): v is NonNullable<typeof v> => v !== null)
        .map(v => v.id);

      await validateProducts(typedProfile.company_id, productIds);

      // Step 2: Crear test principal
      const test = await this.insertTest(testData, user.id, typedProfile.company_id);

      // Step 3: Insertar competidores
      await this.saveAmazonProducts(test.id, testData.competitors);

      // Step 4: Insertar variaciones
      await this.insertVariations(test.id, testData.variations);

      // Step 5: Insertar datos demográficos
      await this.insertDemographics(test.id, testData.demographics);

      // Step 6: Guardar custom screening questions (if applicable)
      if (testData.demographics.customScreening.enabled) {
        await this.saveCustomScreeningQuestion(test.id, testData.demographics.customScreening);
      }

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
    } as any);

    if (error) {
      await supabase.from('tests').delete().eq('id', testId);
      throw new TestCreationError('Failed to add demographics', { error });
    }
  },
  generateDynamicTitle(searchTerm: string): string {
    return `Amazon shopping: Discover '${searchTerm}'!`;
  },
  // Función para crear el proyecto en Respondent
  async createProlificProjectsForVariations(test: any, testData: TestData) {
    for (const [variationType, variation] of Object.entries(testData.variations)) {
      if (variation) {
        const respondentProjectData = {
          publicTitle: this.generateDynamicTitle(test.search_term),
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
          const response = await apiClient.post('/tests', respondentProjectData);

          console.log(`Response status for variation ${variationType}:`, response.status);
          console.log(`Response data for variation ${variationType}:`, response.data);
        } catch (error) {
          await supabase.from('tests').delete().eq('id', test.id);
          throw new TestCreationError('Failed to create Prolific project', { error });
        }
      }
    }
  },
  async getAllTests(): Promise<TestResponse[]> {
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
      if (typedProfile?.role !== 'admin') {
        // For non-admin users, only fetch tests from their company
        const { data: tests, error: testsError } = await supabase
          .from('tests')
          .select(
            `
           *,
            competitors:test_competitors(
            product:amazon_products(
            *,
            company:companies(name)
            )),
            variations:test_variations(
            product:products(
            *,
            company:companies(name)),
            variation_type
                ),
                demographics:test_demographics(*)
          `
          )
          .eq('company_id', typedProfile.company_id as any)
          .order('created_at', { ascending: false });

        if (testsError) {
          throw new TestCreationError('Error fetching tests');
        }

        return tests as unknown as TestResponse[];
      }

      // For admin users, fetch all tests
      const { data: tests, error: testsError } = await supabase
        .from('tests')
        .select(
          `
         *,
          competitors:test_competitors(
          product:amazon_products(
          *,
          company:companies(name)
          )),
          variations:test_variations(
          product:products(
          *,
          company:companies(name)),
          variation_type
              ),
              demographics:test_demographics(*)
        `
        )
        .order('created_at', { ascending: false });

      if (testsError) {
        throw new TestCreationError('Error fetching tests');
      }

      return tests as unknown as TestResponse[];
    } catch (error) {
      console.error('Error fetching all tests:', error);
      if (error instanceof TestCreationError) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred while fetching tests');
      }
      throw error;
    }
  },

  // Función para eliminar un test
  async deleteTest(testId: string) {
    try {
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', testId as any);

      if (error) {
        throw new TestCreationError('Failed to delete test', { error });
      }

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
            return 'search_term'; // El primer paso se mapea a search_term
          case 'search':
            return 'search_term';
          case 'competitors':
            return 'competitors';
          case 'variations':
            return 'variants';
          case 'demographics':
            return 'demographics';
          case 'preview':
            return 'preview';
          case 'review':
            return 'review';
          default:
            return 'search_term'; // Valor por defecto
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
        step: currentStep ? mapStepToEnum(currentStep) : 'search_term', // Guardar el paso actual en la columna step
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

      // Guardar datos relacionados según el paso actual (replicando createTest)
      // Step 3: Insertar competidores (si estamos en paso competitors o posterior)
      if (testData.competitors && testData.competitors.length > 0) {
        await this.saveAmazonProducts(test.id, testData.competitors);
      }

      // Step 4: Insertar variaciones (si estamos en paso variations o posterior)
      if (testData.variations) {
        await this.insertVariations(test.id, testData.variations);
      }

      // Step 5: Insertar datos demográficos (si estamos en paso demographics o posterior)
      if (testData.demographics) {
        await this.insertDemographics(test.id, testData.demographics);
      }

      // Step 6: Guardar custom screening questions (si está habilitado y estamos en paso demographics o posterior)
      if (testData.demographics?.customScreening?.enabled) {
        await this.saveCustomScreeningQuestion(test.id, testData.demographics.customScreening);
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

  // Función para cargar un test incompleto con todos sus datos relacionados
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

      // Cargar competidores si existen
      const { data: competitors, error: competitorsError } = await supabase
        .from('test_competitors')
        .select(`
          product:amazon_products(*)
        `)
        .eq('test_id', testId as any);

      if (competitorsError) {
        console.warn('Error loading competitors:', competitorsError);
      }

      // Cargar variaciones si existen
      const { data: variations, error: variationsError } = await supabase
        .from('test_variations')
        .select(`
          product:products(*),
          variation_type
        `)
        .eq('test_id', testId as any);

      if (variationsError) {
        console.warn('Error loading variations:', variationsError);
      }

      // Cargar datos demográficos si existen
      const { data: demographics, error: demographicsError } = await supabase
        .from('test_demographics')
        .select('*')
        .eq('test_id', testId as any)
        .maybeSingle();

      if (demographicsError) {
        console.warn('Error loading demographics:', demographicsError);
      }

      // Cargar custom screening si existe
      const { data: customScreening, error: screeningError } = await supabase
        .from('custom_screening')
        .select('*')
        .eq('test_id', testId as any)
        .maybeSingle();

      if (screeningError) {
        console.warn('Error loading custom screening:', screeningError);
      }

      // Mapear el paso del enum a los valores internos
      const mapEnumToStep = (step: string): string => {
        switch (step) {
          case 'search_term':
            return 'search';
          case 'variants':
            return 'variations';
          default:
            return step; // competitors, demographics, preview, review
        }
      };

      // Usar el paso guardado en la columna step
      const lastCompletedStep = (test as any).step ? mapEnumToStep((test as any).step) : 'objective';

      // Construir el objeto TestData
      const testData: TestData = {
        name: (test as any).name || '',
        searchTerm: (test as any).search_term || '',
        objective: (test as any).objective,
        competitors: competitors?.map((c: any) => c.product) || [],
        variations: {
          a: (variations as any)?.find((v: any) => v.variation_type === 'a')?.product || null,
          b: (variations as any)?.find((v: any) => v.variation_type === 'b')?.product || null,
          c: (variations as any)?.find((v: any) => v.variation_type === 'c')?.product || null,
        },
        demographics: {
          ageRanges: (demographics as any)?.age_ranges || [],
          gender: (demographics as any)?.genders || [],
          locations: (demographics as any)?.locations || [],
          interests: (demographics as any)?.interests || [],
          testerCount: (demographics as any)?.tester_count || 25,
          customScreening: {
            enabled: !!customScreening,
            question: (customScreening as any)?.question || '',
            validAnswer: (customScreening as any)?.valid_option as 'Yes' | 'No' || undefined,
            isValidating: false,
          },
        },
      };

      return {
        testData,
        lastCompletedStep,
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
    const steps = ['objective', 'search', 'competitors', 'variations', 'demographics', 'preview', 'review'];
    const currentIndex = steps.indexOf(lastCompletedStep);
    
    if (currentIndex === -1 || currentIndex === steps.length - 1) {
      return 'objective';
    }
    
    return steps[currentIndex + 1];
  }
};
