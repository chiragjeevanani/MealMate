import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, Step } from '../types';

// Fix: Initialize GoogleGenAI with a named apiKey parameter from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "The name of the recipe." },
    description: { type: Type.STRING, description: "A short, enticing description of the dish." },
    category: { type: Type.STRING, description: "A suitable category for the recipe, like 'Vegetarian', 'Quick Meals', or 'Desserts'." },
    prepTime: { type: Type.INTEGER, description: "The preparation time in minutes." },
    cookTime: { type: Type.INTEGER, description: "The cooking time in minutes." },
    servings: { type: Type.INTEGER, description: "The number of servings this recipe makes." },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of ingredients with quantities and units."
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "A single step in the cooking instructions." },
          time: { type: Type.INTEGER, description: "Estimated time for this step in SECONDS. For example, a 5-minute step should have a time value of 300. Use 0 for steps without a specific duration." }
        },
        required: ["description", "time"]
      },
      description: "The step-by-step instructions for preparing the dish."
    },
  },
  required: ["name", "description", "category", "prepTime", "cookTime", "servings", "ingredients", "steps"]
};

const recipesArraySchema = {
  type: Type.ARRAY,
  items: recipeSchema
};

const updatedRecipeSchema = {
  type: Type.OBJECT,
  properties: {
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "The updated list of ingredients based on what the user has available."
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "A single step in the updated cooking instructions." },
          time: { type: Type.INTEGER, description: "Estimated time for this step in SECONDS. For example, a 5-minute step should have a time value of 300. Use 0 for steps without a specific duration." }
        },
        required: ["description", "time"]
      },
      description: "The updated step-by-step instructions for preparing the dish with the available ingredients."
    }
  },
  required: ["ingredients", "steps"]
};

const substituteSchema = {
  type: Type.OBJECT,
  properties: {
    substitute: { type: Type.STRING, description: "The specific ingredient to use as a substitute, including quantity. E.g., '1 tsp baking powder'." },
    explanation: { type: Type.STRING, description: "A brief explanation of why this is a good substitute or how to use it." }
  },
  required: ["substitute", "explanation"]
};

const translatedRecipeSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "The translated name of the recipe." },
    description: { type: Type.STRING, description: "The translated short description of the dish." },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "The translated list of ingredients."
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "The translated instruction for this single step." },
          time: { type: Type.INTEGER, description: "The original time in seconds for this step. This should NOT be translated or changed." }
        },
        required: ["description", "time"]
      },
      description: "The translated step-by-step instructions."
    },
  },
  required: ["name", "description", "ingredients", "steps"]
};

const cooktopAdjustedRecipeSchema = {
  type: Type.OBJECT,
  properties: {
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "A single step in the updated cooking instructions." },
          time: { type: Type.INTEGER, description: "Estimated time for this step in SECONDS. The original time value should be preserved." }
        },
        required: ["description", "time"]
      },
      description: "The updated step-by-step instructions for preparing the dish on the specified cooktop."
    }
  },
  required: ["steps"]
};

// A utility to parse the AI response
const parseAiResponse = (responseText: string): Omit<Recipe, 'id' | 'imageUrl' | 'isGenerated'> | null => {
  try {
    // Fix: Trim whitespace and handle potential JSON parsing errors.
    const cleanJsonString = responseText.trim().replace(/^```json/, '').replace(/```$/, '');
    const parsed = JSON.parse(cleanJsonString);
    if (parsed && parsed.name && Array.isArray(parsed.ingredients) && Array.isArray(parsed.steps)) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.error("Failed to parse AI response:", error, "Response text:", responseText);
    return null;
  }
};

export const generateImageForRecipe = async (recipeName: string, recipeDescription: string): Promise<string | null> => {
  try {
    const imagePrompt = `A delicious, vibrant, professionally photographed plate of "${recipeName}", suitable for a recipe book. ${recipeDescription}`;
    const imageResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '4:3',
      },
    });

    if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
      const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (imageError) {
    console.error("Error generating recipe image:", imageError);
    return null;
  }
};


const callGemini = async (prompt: string, generateImage: boolean): Promise<Recipe | null> => {
  try {
    // Step 1: Generate the recipe text content
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema
      }
    });

    const text = response.text;
    if (!text) {
      console.error("No text in Gemini response");
      return null;
    }

    const recipeData = parseAiResponse(text);

    if (!recipeData) {
      console.error("Parsed recipe data is invalid");
      return null;
    }
    
    let imageUrl = ''; // Default to no image
    
    // Step 2: Conditionally generate a relevant image for the recipe
    if (generateImage) {
        const generatedImageUrl = await generateImageForRecipe(recipeData.name, recipeData.description);
        if (generatedImageUrl) {
            imageUrl = generatedImageUrl;
        }
    }

    // Step 3: Assemble the final recipe object
    const id = `generated-${recipeData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    const newRecipe: Recipe = {
      ...recipeData,
      id,
      imageUrl,
      isGenerated: true,
    };

    return newRecipe;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
};

export const generateRecipe = async (searchTerm: string): Promise<Recipe | null> => {
  const prompt = `Generate a recipe for "${searchTerm}". The recipe should be creative and something a home cook can make. Provide all the details needed to be displayed in a recipe app.`;
  return callGemini(prompt, false); // Always generate without an image initially
};

export const generateRecipeFromIngredients = async (ingredients: string[]): Promise<Recipe | null> => {
  const prompt = `Generate a creative recipe that primarily uses the following ingredients: ${ingredients.join(', ')}. It's okay to add a few common pantry staples. Provide all the details needed to be displayed in a recipe app.`;
  return callGemini(prompt, false); // Always generate without an image initially
};

export const generateRecipesFromSearch = async (searchTerm: string): Promise<Recipe[] | null> => {
  const prompt = `Generate a list of 5 diverse and creative recipes related to "${searchTerm}". For example, if the search is 'chicken curry', suggest different regional varieties or styles of chicken curry. The recipes should be suitable for a home cook and include all necessary fields: name, description, category, prepTime, cookTime, servings, ingredients, and steps with timings.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipesArraySchema
      }
    });

    const text = response.text;
    if (!text) {
      console.error("No text in Gemini response for search recipes");
      return null;
    }
    
    const cleanJsonString = text.trim().replace(/^```json/, '').replace(/```$/, '');
    const recipeDataArray = JSON.parse(cleanJsonString);

    if (Array.isArray(recipeDataArray)) {
      return recipeDataArray.map((recipeData: Omit<Recipe, 'id' | 'imageUrl' | 'isGenerated'>) => {
        const id = `generated-${recipeData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        return {
          ...recipeData,
          id,
          imageUrl: '', // Always generate without an image initially
          isGenerated: true,
        };
      });
    }

    return null;
  } catch (error) {
    console.error(`Error generating recipes for search term ${searchTerm}:`, error);
    return null;
  }
};

export const generateRecipesForCategory = async (category: string): Promise<Recipe[] | null> => {
  const prompt = `Generate a list of 5 creative and diverse Indian recipes for the category: "${category}". For example, if the category is 'Desserts', suggest Indian desserts. The recipes should be suitable for a home cook and include name, description, category, prep time, cook time, servings, ingredients, and steps with timings.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipesArraySchema
      }
    });

    const text = response.text;
    if (!text) {
      console.error("No text in Gemini response for category recipes");
      return null;
    }
    
    const cleanJsonString = text.trim().replace(/^```json/, '').replace(/```$/, '');
    const recipeDataArray = JSON.parse(cleanJsonString);

    if (Array.isArray(recipeDataArray)) {
      return recipeDataArray.map((recipeData: Omit<Recipe, 'id' | 'imageUrl' | 'isGenerated'>) => {
        const id = `generated-${recipeData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        return {
          ...recipeData,
          id,
          imageUrl: '', // Always generate without an image initially
          isGenerated: true,
        };
      });
    }

    return null;
  } catch (error) {
    console.error(`Error generating recipes for category ${category}:`, error);
    return null;
  }
};


export const getChefsTip = async (recipeName: string, stepDescription: string): Promise<string> => {
  try {
    const prompt = `I am making a recipe called "${recipeName}". I am on the following step: "${stepDescription}". Give me a single, concise, and helpful "chef's tip" for this specific step. The tip should be encouraging and easy to understand for a beginner cook. Do not start with "Chef's Tip:". Just provide the tip itself.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // Fix: Correctly access the generated text using response.text.
    return response.text.trim();
  } catch (error) {
    console.error("Error getting chef's tip:", error);
    return "Sorry, I couldn't get a tip right now. Please try again later.";
  }
};

export const getIngredientSubstitute = async (recipeName: string, allIngredients: string[], missingIngredient: string): Promise<{ substitute: string; explanation: string; } | null> => {
  const prompt = `I am making a recipe called "${recipeName}". The full list of ingredients is: ${allIngredients.join(', ')}. I do not have "${missingIngredient}". Provide a specific ingredient substitute including quantity (e.g., '1 cup vegetable broth'), and a brief explanation of why it works or how to use it.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: substituteSchema
      }
    });

    const text = response.text;
    if (!text) {
      console.error("No text in Gemini response for substitute");
      return null;
    }
    
    const cleanJsonString = text.trim().replace(/^```json/, '').replace(/```$/, '');
    const data = JSON.parse(cleanJsonString);

    if (data && data.substitute && data.explanation) {
      return data;
    }

    return null;
  } catch (error) {
    console.error("Error getting ingredient substitute:", error);
    return null;
  }
};

export const updateRecipeWithIngredients = async (
  recipeName: string,
  originalIngredients: string[],
  availableIngredients: string[],
  originalSteps: Step[]
): Promise<{ ingredients: string[]; steps: Step[] } | null> => {
  const prompt = `I am making a recipe called "${recipeName}".
The original ingredients are: ${originalIngredients.join(', ')}.
The original steps are: ${originalSteps.map((s, i) => `${i + 1}. ${s.description}`).join(' ')}.

However, I only have the following ingredients: ${availableIngredients.join(', ')}.

Please update the recipe instructions to work with ONLY the ingredients I have. Also, provide the final list of ingredients that will be used in the updated recipe. The cooking and prep times might change, but focus on adjusting the steps. Make the new instructions clear and complete.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: updatedRecipeSchema
      }
    });

    const text = response.text;
    if (!text) {
      console.error("No text in Gemini response for recipe update");
      return null;
    }
    
    const cleanJsonString = text.trim().replace(/^```json/, '').replace(/```$/, '');
    const updatedData = JSON.parse(cleanJsonString);

    if (updatedData && Array.isArray(updatedData.ingredients) && Array.isArray(updatedData.steps)) {
      return updatedData;
    }

    return null;
  } catch (error) {
    console.error("Error updating recipe with Gemini:", error);
    return null;
  }
};

export const translateRecipe = async (
  recipe: Recipe,
  language: 'Hindi' | 'Hinglish'
): Promise<{ name: string; description: string; ingredients: string[]; steps: Step[] } | null> => {
    const translatableContent = {
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        steps: recipe.steps.map(step => ({ description: step.description, time: step.time }))
    };

    const prompt = `Translate the following recipe's text fields ('name', 'description', 'ingredients' array, and 'description' within each step) into ${language}.
Maintain the exact JSON structure provided.
Ensure the 'time' value for each step remains an unchanged integer (in seconds).
Do not add any extra explanations or text outside of the JSON object.

Recipe to translate:
${JSON.stringify(translatableContent, null, 2)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: translatedRecipeSchema
      }
    });

    const text = response.text;
    if (!text) {
      console.error("No text in Gemini response for translation");
      return null;
    }
    
    const cleanJsonString = text.trim().replace(/^```json/, '').replace(/```$/, '');
    const translatedData = JSON.parse(cleanJsonString);

    if (translatedData && translatedData.name && Array.isArray(translatedData.ingredients) && Array.isArray(translatedData.steps)) {
      const areStepsValid = translatedData.steps.every((s: any) => typeof s.description === 'string' && typeof s.time === 'number');
      if (areStepsValid) {
        return translatedData;
      }
    }

    console.error("Parsed translated data is invalid", translatedData);
    return null;
  } catch (error)
 {
    console.error(`Error translating recipe to ${language}:`, error);
    return null;
  }
};

export const updateRecipeForCooktop = async (
  recipe: Recipe,
  cooktop: 'Induction Cooktop' | 'Simple Electric Kettle'
): Promise<{ steps: Step[] } | null> => {
  let specificInstructions = '';

  if (cooktop === 'Induction Cooktop') {
    specificInstructions = `Adjust instructions about heat levels and cooking methods. For any instruction about flame or heat level (e.g., 'medium flame', 'low heat'), you MUST replace it with a specific temperature in Celsius AND a power setting in watts, appropriate for a standard home induction cooktop. The format MUST be 'TEMPERATURE°C / POWERW' (e.g., '120°C / 1000W').`;
  } else { // Simple Electric Kettle
    specificInstructions = `Adjust the instructions to be achievable using only a simple electric kettle. Focus on steps involving boiling water, steeping, or creating hot water baths. If a step cannot be done with a kettle, modify it to the closest possible alternative.`;
  }

  const prompt = `I am making a recipe called "${recipe.name}".
The original instructions are: ${recipe.steps.map((s, i) => `${i + 1}. ${s.description}`).join(' ')}.

Please modify these instructions to be suitable for cooking on a '${cooktop}'.
${specificInstructions}
Return ONLY the modified steps array in the specified JSON format. Keep the JSON structure and preserve the original 'time' values for each step. Do not add any extra commentary.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: cooktopAdjustedRecipeSchema
      }
    });

    const text = response.text;
    if (!text) {
      console.error("No text in Gemini response for cooktop update");
      return null;
    }
    
    const cleanJsonString = text.trim().replace(/^```json/, '').replace(/```$/, '');
    const updatedData = JSON.parse(cleanJsonString);

    if (updatedData && Array.isArray(updatedData.steps)) {
      return updatedData;
    }

    return null;
  } catch (error) {
    console.error(`Error updating recipe for ${cooktop}:`, error);
    return null;
  }
};
