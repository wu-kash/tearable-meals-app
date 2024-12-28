
import dotenv from 'dotenv';
import z from 'zod';
import { OpenAI} from "openai";

dotenv.config();

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

export const RecipeInformationEvent = z.object({
    Title: z.string(),
    Portions: z.string(),
    PreparationTime: z.string(),
    CookingTime: z.string(),
    Ingredients: z.array(
        z.object({
            Name: z.string(),
            Value: z.string(),
            Units: z.string(),
        }),
    ),
    PreparationSteps: z.array(
        z.string(),
    ),
    CookingSteps: z.array(
        z.string(),
    ),
});