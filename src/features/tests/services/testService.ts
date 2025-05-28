import { supabase } from '../../../lib/supabase';
import { CustomScreening, TestData } from '../types';
import { toast } from 'sonner';
import { validateProducts } from '../utils/validators/productValidator';
import { validateTestData } from '../utils/validators/testDataValidator';
import { TestCreationError } from '../utils/errors';
import apiClient from '../../../lib/api';

interface Profile {
  role?: string;
}

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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new TestCreationError('Not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.company_id) {
        throw new TestCreationError('Company profile not found');
      }

      // Validar productos relacionados
      const productIds = Object.values(testData.variations)
        .filter((v): v is NonNullable<typeof v> => v !== null)
        .map(v => v.id);

      await validateProducts(profile.company_id, productIds);

      // Step 2: Crear test principal
      const test = await this.insertTest(testData, user.id, profile.company_id);

      // Step 3: Insertar competidores
      await this.saveAmazonProducts(test.id, testData.competitors);

      // Step 4: Insertar variaciones
      await this.insertVariations(test.id, testData.variations);

      // Step 5: Insertar datos demográficos
      await this.insertDemographics(test.id, testData.demographics);

      // Step 6: Guardar custom screening questions (if applicable)
      if(testData.demographics.customScreening.enabled) {
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
        objective: testData.objective
      })
      .select()
      .single();

    if (error) {
      throw new TestCreationError('Failed to create test', { error });
    }

    return test;
  },

  async saveAmazonProducts(testId: string, products: any[])  {
    try {
      await apiClient.post(`/amazon/products/${testId}`, { products })
    } catch(error) {
      console.error(error);
      throw new TestCreationError('Failed to save competitors', { error });
    }
  },

  // Función para insertar variaciones
  async insertVariations(testId: string, variations: TestData['variations']) {
    for (const [type, variation] of Object.entries(variations)) {
      if (variation) {
        const { error } = await supabase
          .from('test_variations')
          .insert({
            test_id: testId,
            product_id: variation.id,
            variation_type: type
          } as any);

        if (error) {
          await supabase.from('tests').delete().eq('id', testId);
          throw new TestCreationError('Failed to add variation', { error });
        }
      }
    }
  },

  async saveCustomScreeningQuestion(
    testId: string,
    customScreening: CustomScreening
  ) {
    const { error } = await supabase.from('custom_screening').insert({
      test_id: testId,
      question: customScreening.question,
      valid_option: customScreening.validAnswer,
      invalid_option: customScreening.validAnswer === 'Yes' ? 'No' : 'Yes'
    } as any);

    if(error) {
      await supabase.from('tests').delete().eq('id', testId);
      throw new TestCreationError('Failed to save custom screening question', { error });
    }
  },

  // Función para insertar datos demográficos
  async insertDemographics(testId: string, demographics: TestData['demographics']) {
    const { error } = await supabase
      .from('test_demographics')
      .insert({
        test_id: testId,
        age_ranges: demographics.ageRanges,
        genders: demographics.gender,
        locations: demographics.locations,
        interests: demographics.interests,
        tester_count: demographics.testerCount
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
            researcherName: 'Company Researcher'
          },
          demographics: {
            ageRanges: testData.demographics.ageRanges,
            genders: Array.isArray(testData.demographics.gender) ? testData.demographics.gender[0] : testData.demographics.gender,
            locations: testData.demographics.locations,
            interests: testData.demographics.interests
          },
          testId: test.id,
          variationType,
          customScreeningEnabled: testData.demographics.customScreening?.enabled || false
        };

        try {
          const response = await apiClient.post('/tests', respondentProjectData);

          console.log(`Response status for variation ${variationType}:`, response.status);
          console.log(`Response data for variation ${variationType}:`, response.data);

        } catch (error) {
          console.error(`Prolific integration failed for variation ${variationType}:`, error);
        } finally {
          console.log(`Prolific project being created for variation ${variationType}`);
        }
      }
    }
  },
  async getAllTests(): Promise<TestResponse[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new TestCreationError('Not authenticated');
      }

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new TestCreationError('Error fetching user profile');
      }

      const typedProfile = profile as Profile;
      if (typedProfile?.role !== 'admin') {
        throw new TestCreationError('Unauthorized: Admin access required');
      }

      // Fetch all tests with their relationships
      const { data: tests, error: testsError } = await supabase
        .from('tests')
        .select(`
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
        `)
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
  }
};
