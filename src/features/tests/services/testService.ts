import { supabase } from '../../../lib/supabase';
import { TestData } from '../types';
import { toast } from 'sonner';
import { validateProducts } from '../utils/validators/productValidator';
import { validateTestData } from '../utils/validators/testDataValidator';
import { TestCreationError } from '../utils/errors';

export const testService = {
  async createTest(testData: TestData) {
    try {
      // Validate test data structure first
      const validation = validateTestData(testData);
      if (!validation.isValid) {
        throw new TestCreationError('Validation failed', { errors: validation.errors });
      }

      // Get user and company info
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new TestCreationError('Not authenticated');
      }

      // Get company profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.company_id) {
        throw new TestCreationError('Company profile not found');
      }

      // Validate all products exist and belong to company
      const productIds = [
        ...testData.competitors.map(c => c.id),
        ...Object.values(testData.variations)
          .filter((v): v is NonNullable<typeof v> => v !== null)
          .map(v => v.id)
      ];

      await validateProducts(profile.company_id, productIds);

      // Create test
      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
          name: testData.name.trim(),
          search_term: testData.searchTerm.trim(),
          status: 'draft',
          company_id: profile.company_id,
          user_id: user.id,
          settings: {}
        })
        .select()
        .single();

      if (testError) throw testError;

      // Add competitors one by one to handle errors better
      for (const competitor of testData.competitors) {
        const { error: competitorError } = await supabase
          .from('test_competitors')
          .insert({
            test_id: test.id,
            product_id: competitor.id
          });

        if (competitorError) {
          // Clean up the test if competitor insertion fails
          await supabase.from('tests').delete().eq('id', test.id);
          throw new TestCreationError('Failed to add competitor', { error: competitorError });
        }
      }

      // Add variations one by one
      for (const [type, variation] of Object.entries(testData.variations)) {
        if (variation) {
          const { error: variationError } = await supabase
            .from('test_variations')
            .insert({
              test_id: test.id,
              product_id: variation.id,
              variation_type: type
            });

          if (variationError) {
            // Clean up the test if variation insertion fails
            await supabase.from('tests').delete().eq('id', test.id);
            throw new TestCreationError('Failed to add variation', { error: variationError });
          }
        }
      }

      // Add demographics
      const { error: demographicsError } = await supabase
        .from('test_demographics')
        .insert({
          test_id: test.id,
          age_ranges: testData.demographics.ageRanges,
          genders: testData.demographics.gender,
          locations: testData.demographics.locations,
          interests: testData.demographics.interests,
          tester_count: testData.demographics.testerCount
        });

      if (demographicsError) {
        // Clean up the test if demographics insertion fails
        await supabase.from('tests').delete().eq('id', test.id);
        throw new TestCreationError('Failed to add demographics', { error: demographicsError });
      }

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
  }
};