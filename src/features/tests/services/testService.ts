import { supabase } from '../../../lib/supabase';
import { TestData } from '../types';
import { toast } from 'sonner';
import { validateProducts } from '../utils/validators/productValidator';
import { validateTestData } from '../utils/validators/testDataValidator';
import { TestCreationError } from '../utils/errors';

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
      await this.insertCompetitors(test.id, testData.competitors);

      // Step 4: Insertar variaciones
      await this.insertVariations(test.id, testData.variations);

      // Step 5: Insertar datos demográficos
      await this.insertDemographics(test.id, testData.demographics);

      // Step 6: Crear proyecto en Respondent
      await this.createRespondentProject(test, testData);

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
        settings: {}
      })
      .select()
      .single();

    if (error) {
      throw new TestCreationError('Failed to create test', { error });
    }

    return test;
  },

  // Función para insertar competidores
  async insertCompetitors(testId: string, competitors: TestData['competitors']) {
    for (const competitor of competitors) {
      const { error } = await supabase
        .from('test_competitors')
        .insert({
          test_id: testId,
          product_id: competitor.id
        });

      if (error) {
        await supabase.from('tests').delete().eq('id', testId);
        throw new TestCreationError('Failed to add competitor', { error });
      }
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
          });

        if (error) {
          await supabase.from('tests').delete().eq('id', testId);
          throw new TestCreationError('Failed to add variation', { error });
        }
      }
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
      });

    if (error) {
      await supabase.from('tests').delete().eq('id', testId);
      throw new TestCreationError('Failed to add demographics', { error });
    }
  },

  // Función para crear el proyecto en Respondent
  async createRespondentProject(test: any, testData: TestData) {
    const respondentProjectData = {
      publicTitle: `Seeking ${testData.demographics.interests[0]} to shop ${test.id}`,
      publicInternalName: `${test.id}`,
      participantTimeRequiredMinutes: 12,
      incentiveAmount: 12,
      targetNumberOfParticipants: testData.demographics.testerCount,
      externalResearcher: {
        researcherId: test.company_id,
        researcherName: 'Test Researcher'
      }
    };

    try {
      const response = await fetch('/webhook-test/create-proyect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(respondentProjectData),
        mode: 'no-cors'
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create Respondent project: ${errorData}`);
      }

      const respondentProject = await response.json();
      console.log('Respondent project created:', respondentProject);
    } catch (error) {
      console.error('Respondent integration failed:', error);
      toast.warning('Test created but participant recruitment setup failed');
    }
  }
};
