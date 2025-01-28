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
      //change for n8n endpoint
      await this.addCompetitorsBulletsDescriptions(testData.competitors);

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
    // Preparar todos los registros para una inserción masiva
    const competitorsData = competitors.map(competitor => ({
      test_id: testId,
      product_id: competitor.id
    }));

    const { error } = await supabase
      .from('test_competitors')
      .insert(competitorsData as any);

    if (error) {
      await supabase.from('tests').delete().eq('id', testId);
      throw new TestCreationError('Failed to add competitors', { error });
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
  generateDynamicTitle(interests: string[], searchTerm: string): string {
    const interestsList = interests.map(interest => interest.toLowerCase()).join(', ');
    return `Amazon shopping for ${interestsList}: Discover '${searchTerm}'!`;
  },
  // Función para crear el proyecto en Respondent
  async createRespondentProject(test: any, testData: TestData) {
    const respondentProjectData = {
        publicTitle: this.generateDynamicTitle(testData.demographics.interests, test.search_term),
        publicInternalName: `${test.id}`,
        participantTimeRequiredMinutes: 12,
        incentiveAmount: 12,
        targetNumberOfParticipants: testData.demographics.testerCount,
        externalResearcher: {
            researcherId: test.company_id,
            researcherName: 'Company Researcher'
        },
        demographics: {
            ageRanges: testData.demographics.ageRanges,
            genders: Array.isArray(testData.demographics.gender) ? testData.demographics.gender[0] : testData.demographics.gender,
            locations: testData.demographics.locations
        }
    };

    try {
        const response = await fetch('https://sidetool.app.n8n.cloud/webhook/prolific-create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(respondentProjectData),
            mode: 'no-cors'
        });

        // Mostrar en consola el estado de la respuesta
        console.log('Response status:', response.status);

        // Intentar leer el cuerpo de la respuesta si es posible
        const responseData = await response.json();
        console.log('Response data:', responseData);

    } catch (error) {
        console.error('Prolific integration failed:', error);
    } finally {
        console.log('Prolific project being created');
    }
},

  // Función addbulletdescriptions
  async addCompetitorsBulletsDescriptions(competitors: any) {

    try {
      await fetch('https://sidetool.app.n8n.cloud/webhook/details/f54493cb-3297-4d51-a765-f19ca4ba3d9d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(competitors),
        mode: 'no-cors'
      });
    } catch (error) {
      console.error('Bullets descriptions failed:', error);
    } finally {
      console.log('Bullets descriptions added');
    }
  }
};
