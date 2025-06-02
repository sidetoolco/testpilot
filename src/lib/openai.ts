import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey:
    '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',
});

const openai = new OpenAIApi(configuration);

export async function suggestDemographics(product: any) {
  try {
    const prompt = `Given this product:
Name: ${product.name}
Description: ${product.description}
Price: $${product.price}
Category: ${product.category}

Suggest target demographics in this JSON format:
{
  "ageRanges": ["18-24", "25-34", "35-44", "45-54", "55+"],
  "gender": ["Male", "Female", "Non-binary"],
  "interests": ["Primary Household Shopper", "Uses Cleaning Products Weekly", "Price Conscious", "Brand Conscious", "Eco-friendly Focused", "Has Children at Home", "Pet Owner", "Sensitive Skin/Allergies", "Buys Premium Products", "Bulk Shopper"]
}

Only include relevant age ranges, genders, and interests that best match this product. Keep the response concise and focused on the most likely demographics.`;

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a market research expert who specializes in consumer product demographics.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const suggestion = JSON.parse(response.data.choices[0].message?.content || '{}');
    return {
      ...suggestion,
      locations: ['United States'], // Default location
      testerCount: 10, // Default tester count
    };
  } catch (error) {
    console.error('Error suggesting demographics:', error);
    return null;
  }
}
