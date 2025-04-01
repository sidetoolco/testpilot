import { Variant, SurveyData, VariationType } from '../models/insight';
import { supabase } from '../../../../../lib/supabase';
import { TestDetails } from '../utils/types';
// Sends a prompt to a specified endpoint and returns the response.
// Parameters:
//   - prompt (string): The prompt to be sent to the endpoint.
// Returns: The response data from the endpoint or null if an error occurs.
export const callPromptEndpoint = async (prompt: string) => {
  if (!prompt || typeof prompt !== 'string') {
    console.error('Invalid prompt provided.');
    return null;
  }

  try {
    const response = await fetch(`https://testpilot.app.n8n.cloud/webhook/17877886-d0c8-4fc7-8e34-87df696fdbb1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Convertir la respuesta a JSON
    const data = await response.json();
    console.log('Response:', data);
    return data;
  } catch (error: any) {
    console.error('Error calling the endpoint:', error);
    return Promise.reject(error);
  }
};


// Sends a prompt and data to the OpenAI API and retrieves the response.
// Parameters:
//   - prompt (string): The prompt to be sent to OpenAI.
//   - dataToAnalyze (string): The data to be analyzed by OpenAI.
// Returns: The content of the response from OpenAI or an error message if the request fails.
export const fetchOpenAIResponse = async (prompt: string, dataToAnalyze: any) => {
  if (!prompt.trim()) return;

  try {
    const dataString = (typeof dataToAnalyze === 'object' || Array.isArray(dataToAnalyze))
      ? JSON.stringify(dataToAnalyze)
      : dataToAnalyze;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "user", content: `${prompt}, this is the data to analyze: ${dataString}` },
        ],
        max_tokens: 500,
      }),
    });

    const data = await res.json();
    return data.choices[0].message.content;
  } catch (error) {
    return "Error fetching response. Check your API Key.";
  }
};

// Checks for insights by sending a prompt to OpenAI and then calling a specific endpoint.
// Parameters:
//   - input (string): The input data for the prompt.
//   - promptName (string): The name of the prompt to be used.
// Returns: The response from the endpoint after processing the prompt.
export const checkIaInsight = async (input: string, promptName: string) => {
  const prompt = await fetchOpenAIResponse(input, promptName);
  const response = await callPromptEndpoint(prompt);
  console.log(response);
  return response;
};

// Checks if a given ID exists in the ia_insights table.
// Parameters:
//   - id (string): The ID to be checked.
// Returns: The first matching record or false if no match is found.
export const checkIdInIaInsights = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('ia_insights')
      .select('*') // Select all columns
      .eq('test_id', id);

    if (error) {
      console.error('Error fetching data:', error);
      return false;
    }

    return data.length > 0 ? data[0] : false; // Return the first match or false
  } catch (error) {
    console.error('Error checking ID:', error);
    return false;
  }
};

// Checks the status of a test by its ID.
// Parameters:
//   - id (string): The ID of the test to be checked.
// Returns: true if the test status is 'complete', otherwise false.
export const checkTestStatus = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('status')
      .eq('id', id);

    if (error) {
      console.error('Error fetching data:', error);
      return false;
    }

    return data.length > 0 && data[0].status === 'complete';
  } catch (error) {
    console.error('Error checking ID:', error);
    return false;
  }
};

const prompt = ["comparison-between-variants", "purchase-drivers", "competitive-insights"]



// Writes the response from a prompt into the ia_insights database.
// Parameters:
//   - promptResponse (string): The response from the prompt.
//   - testId (string): The ID of the test associated with the response.
// Returns: None.
const writePromptResponseInDatabase = async (promptResponses: string[], testId: string) => {
  if (promptResponses.length === 0) return null;
  try {
    const { data, error } = await supabase
      .from('ia_insights')
      .insert({
        test_id: testId,
        comparison_between_variants: promptResponses[0],
        purchase_drivers: promptResponses[1],
        competitive_insights: promptResponses[2],
        recommendations: promptResponses[3]
      } as any);

    if (error) {
      console.error('Error writing prompt response in database:', error);
      return null;
    } else {
      console.log('Prompt response written in database:', data);
      return {
        test_id: testId,
        comparison_between_variants: promptResponses[0],
        purchase_drivers: promptResponses[1],
        competitive_insights: promptResponses[2],
        recommendations: promptResponses[3]
      };
    }
  } catch (parseError) {
    console.error('Error parsing prompt response:', parseError);
    return null;
  }
}

// Processes test information to extract relevant data for prompts.
// Parameters:
//   - testInfo (any): The test information to be processed.
// Returns: An array of objects containing variant_name.
const processPromptData = async (testInfo: any) => {
  const variantsArray = [testInfo.variations.a, testInfo.variations.b, testInfo.variations.c].filter(v => v);
  const promptData = await Promise.all(
    variantsArray.map((variant, index) => processVariantData(variant, index, testInfo.id, testInfo.responses.surveys, testInfo.responses.comparisons))
  );
  const LABELS = ['Value', 'Aesthetics', 'Utility', 'Trust', 'Convenience'];
  const COLORS = ["#34A270", "#075532", "#E0D30D"];
  const purchaseDriversData = processSurveyData(testInfo.responses.surveys, LABELS, COLORS)

  const competitiveInsightsData = processCompetitiveInsightsData(testInfo.responses.comparisons)
  return {
    "comparison-between-variants": promptData,
    "purchase-drivers": purchaseDriversData,
    "competitive-insights": competitiveInsightsData,
  };
}

export const processCompetitiveInsightsData = (comparisons: { a: any[]; b: any[]; c: any[] }) => {
  const processArray = (array: any[]) => {
    return array.reduce((acc: any, item: any) => {
      const key = item.competitor_id;
      if (!acc[key]) {
        acc[key] = {
          title: item.amazon_products.title,
          count: 1,
          shopper_count: array.length,
          value: item.value,
          appearance: item.appearance,
          convenience: item.convenience,
          brand: item.brand,
          confidence: item.confidence
        };
      } else {
        acc[key].value += item.value;
        acc[key].appearance += item.appearance;
        acc[key].convenience += item.convenience;
        acc[key].brand += item.brand;
        acc[key].confidence += item.confidence;
        acc[key].count += 1;
      }
      return acc;
    }, {});
  };

  const combineResults = (groupedComparison: any) => {
    return Object.values(groupedComparison).map((item: any) => ({
      ...item,
      value: item.value / item.count,
      appearance: item.appearance / item.count,
      convenience: item.convenience / item.count,
      brand: item.brand / item.count,
      confidence: item.confidence / item.count,
      share: parseFloat(((item.count / item.shopper_count) * 100).toFixed(2)),
    }));
  };

  const result: any = {};

  if (comparisons.a && comparisons.a.length > 0) {
    const groupedComparisonA = processArray(comparisons.a);
    result.a = combineResults(groupedComparisonA);
  }

  if (comparisons.b && comparisons.b.length > 0) {
    const groupedComparisonB = processArray(comparisons.b);
    result.b = combineResults(groupedComparisonB);
  }

  if (comparisons.c && comparisons.c.length > 0) {
    const groupedComparisonC = processArray(comparisons.c);
    result.c = combineResults(groupedComparisonC);
  }

  return result;
}

// Retrieves insights for a test. If insights do not exist, it checks the test status and processes the data if the test is complete.
// Parameters:
//   - testId (string): The ID of "comparison-between-variants": promptData,
//   - testInfo (any): Information about the test.
// Returns: The insights data or null if the test is not complete.
export const getIaInsight = async (testId: string, testInfo: any) => {
  const allResponses: string[] = [];
  let iaInsight;
  try {
    iaInsight = await checkIdInIaInsights(testId);
    if (iaInsight) {
      return iaInsight;
    }
    const testIsCompleted = await checkTestStatus(testId);
    if (!testIsCompleted) {
      return null;
    }
    const promptData = await processPromptData(testInfo);
    console.log('Prompt Data:', promptData);

    for (const promptName of prompt) {
      try {
        const promptResponse = await callPromptEndpoint(promptName);
        if (promptResponse && promptResponse[0]) {
          console.log('Prompt Response:', promptResponse[0].prompt);
          const iaResponse = await fetchOpenAIResponse(promptResponse[0].prompt, promptData[promptName]);
          console.log('IA Response:', iaResponse);
          // Store the response in the array
          allResponses.push(iaResponse);
        }
      } catch (error) {
        console.error('Error processing prompt:', error);
      }
    }
  } catch (error) {
    console.error('Error in getIaInsight:', error);
    return null;
  }

  if (!iaInsight) {
    try {
      await fetchOpenAIResponse("recomendations", allResponses).then(async (response) => {
        console.log('Recomendations:', response);
        allResponses.push(response);
        const result = await writePromptResponseInDatabase(allResponses, testId);
        return result;
      });
      console.log('All IA Responses saved:', allResponses);
    } catch (error) {
      console.error('Error saving responses to database:', error);
    }
  }
}

export const processVariantData = async (variant: Variant, index: number, testerId: string, surveys: SurveyData, comparision: SurveyData): Promise<string[]> => {
  const variationType: VariationType = index === 0 ? 'a' : index === 1 ? 'b' : 'c';

  const [appearances, totalClicks] = await Promise.all([
    countVariationAppearances(variant.id),
    countClicksPerProduct(testerId, variationType)
  ]);

  const shareOfClicks = calculatePercentage(appearances, totalClicks);

  const totalSurveys = surveys[variationType]?.length || 0;
  const totalComparisions = comparision[variationType]?.length || 0;
  const sumCheckouts = totalSurveys + totalComparisions;
  const shareOfBuy = sumCheckouts > 0 ? (totalSurveys / sumCheckouts) * 100 : 0;

  const scores = surveys[variationType]?.map(survey => {
    const metrics = [
      survey.appearance,
      survey.confidence,
      survey.value,
      survey.convenience,
      survey.brand
    ];
    return calculateAverageScore(metrics);
  }) || [];

  const valueScore = scores.length ? calculateAverageScore(scores) : 0;

  return Promise.resolve([
    `Variant #${index + 1}: ${variant.title}`,
    formatPercentage(parseFloat(shareOfClicks)),
    formatPercentage(shareOfBuy),
    valueScore.toFixed(1),
    totalClicks >= 30 ? 'Yes' : 'No'
  ]);
};

const calculatePercentage = (numerator: number, denominator: number): string => {
  if (denominator === 0 || numerator === 0) return '0.0';
  return ((numerator / denominator) * 100).toFixed(1);
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const calculateAverageScore = (scores: number[]): number => {
  if (!scores.length) return 0;
  const validScores = scores.filter(score => typeof score === 'number' && !isNaN(score));
  return validScores.length ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
};

export async function countVariationAppearances(variationId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('test_times')
      .select('*', { count: 'exact' })
      .eq('product_id', variationId);

    if (error) {
      console.error('Error counting variation appearances:', error);
      throw error;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error in countVariationAppearances:', error);
    throw error;
  }
}


export async function countClicksPerProduct(testId: string, variationType: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('test_times')
      .select('*, testers_session!inner(*)')
      .eq('testers_session.test_id', testId)
      .eq('testers_session.variation_type', variationType);

    if (error) {
      console.error('Error counting clicks per product:', error);
      throw error;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error in countClicksPerProduct:', error);
    throw error;
  }
}

// Iterate over each variation type
export const variationAverages = (surveys: Record<string, Survey[]>) => Object.entries(surveys).map(([variationType, surveyArray]) => {
  const total = surveyArray.length;
  const avgRatings = surveyArray.reduce(
    (acc: number[], survey: Survey) => {
      acc[0] += survey.value;
      acc[1] += survey.appearance;
      acc[2] += survey.confidence;
      acc[3] += survey.brand;
      acc[4] += survey.convenience;
      return acc;
    },
    [0, 0, 0, 0, 0]
  ).map((val: number) => val / total);

  return {
    variationType,
    avgRatings
  };
});


interface Survey {
  product_id: string;
  products: { title: string };
  value: number;
  appearance: number;
  confidence: number;
  brand: number;
  convenience: number;
  tester_id: { variation_type: string };
}

interface GroupedSurvey {
  [key: string]: Survey[];
}
const getProductName = (productId: string): string => {
  return `Variant ${productId.substring(0, 40)}...`;
};

export const processSurveyData = (surveys: { [key: string]: Survey[] }, LABELS: string[], COLORS: string[]): any[] => {
  const groupedSurveys: GroupedSurvey = Object.entries(surveys).reduce((acc: GroupedSurvey, [variationType, surveyArray]) => {
    if (!acc[variationType]) acc[variationType] = [];
    acc[variationType].push(...surveyArray);
    return acc;
  }, {} as GroupedSurvey);

  const productIds = Object.keys(groupedSurveys);

  return productIds.map((productId, productIndex) => {
    const surveys = groupedSurveys[productId];
    const total = surveys.length;
    const avgRatings = surveys.reduce(
      (acc: number[], survey: Survey) => {
        acc[0] += survey.value;
        acc[1] += survey.appearance;
        acc[2] += survey.confidence;
        acc[3] += survey.brand;
        acc[4] += survey.convenience;
        return acc;
      },
      [0, 0, 0, 0, 0]
    ).map(val => val / total);

    return {
      label: getProductName(productId + ': ' + surveys[0].products.title),
      data: avgRatings,
      productId,
      keys: LABELS.map((label, index) => ({ key: label, value: avgRatings[index] })),
      backgroundColor: COLORS[productIndex % COLORS.length],
      borderRadius: 5,
    };
  });
};

interface SummaryRow {
  title: string;
  shareOfClicks: string;
  shareOfBuy: string;
  valueScore: string;
  isWinner: string;
}

export const getSummaryData = async (testDetails: TestDetails): Promise<{
  rows: SummaryRow[];
  error: string | null;
}> => {
  console.log('Me ejecuto');

  if (!testDetails || !testDetails.variations) {
    return {
      rows: [],
      error: 'Not enough data for analysis.'
    };
  }

  try {
    const variations = testDetails.variations;
    // Convert the variations object into an array of entries with their types
    const variationEntries = Object.entries(variations)
      .filter(([_, variant]) => variant !== null); // Filter out null variations

    if (variationEntries.length === 0) {
      return {
        rows: [],
        error: 'No variations found.'
      };
    }

    const rows = await Promise.all(
      variationEntries.map(async ([variationType, variant]) => {
        // Get appearances count
        const { data: appearancesData, error: appearancesError } = await supabase
          .from('test_times')
          .select('*', { count: 'exact' })
          .eq('product_id', variant.id);

        if (appearancesError) throw appearancesError;
        const appearances = appearancesData?.length || 0;

        // Get total clicks
        const { data: clicksData, error: clicksError } = await supabase
          .from('test_times')
          .select('*, testers_session!inner(*)')
          .eq('testers_session.variation_type', variationType);

        if (clicksError) throw clicksError;
        const totalClicks = clicksData?.length || 0;

        // Calculate share of clicks
        const shareOfClicks = totalClicks > 0 ? (appearances / totalClicks) * 100 : 0;

        // Calculate share of buy
        const surveys = testDetails.responses.surveys[variationType] || [];
        const shareOfBuy = surveys.length > 0 ? (surveys.length / totalClicks) * 100 : 0;

        // Calculate value score
        const scores = surveys.map(survey => {
          const metrics = [
            survey.appearance,
            survey.confidence,
            survey.value,
            survey.convenience,
            survey.brand
          ];
          return calculateAverageScore(metrics);
        });
        const valueScore = scores.length ? calculateAverageScore(scores) : 0;

        return {
          title: variant.title,
          shareOfClicks: formatPercentage(shareOfClicks),
          shareOfBuy: formatPercentage(shareOfBuy),
          valueScore: valueScore.toFixed(1),
          isWinner: totalClicks >= 30 ? 'Yes' : 'No'
        };
      })
    );

    return {
      rows,
      error: null
    };
  } catch (error) {
    console.error('Error loading summary data:', error);
    return {
      rows: [],
      error: 'Failed to load summary data. Please try again.'
    };
  }
};




