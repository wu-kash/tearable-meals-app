
import z from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

import { openai } from './openai.js';
import { createAndLinkCustomerRecipe } from '../user/recipeHandler.js'
import { getGlobalID, toTitleCase } from '../util/util.js'

const INPUT_URL = 'URL';
const INPUT_ING = 'INGREDIENTS';
const MODIFIER_TAG = '{INPUT_MODIFIER}'

const INPUT_URL_MODIFIER = ', extract the recipe data from the url webpage to provide the data required by recipeData in JSON format'
const INPUT_ING_MODIFIER = ', generate a recipe using the list of ingredients and provide the data required by recipeData in JSON format'


const PROMP_MSG = `Reset all previous history when receiving input ${MODIFIER_TAG}. Pay attention to these notes:\na) Provide the cooking steps first, if any preparation steps can be obtained from the cooking steps add them to the preparation steps. All preparation steps should be done before any cooking steps. \nb) If an ingredient is used in a preparation or cooking step, place INGREDIENT{<ingredient name>} around the ingredient.\nc) If a temperature is provided in a step, replace the value with TEMPF{<value>} or TEMPC{<value>}, whether its given in fahrenheit or celsius, respectively.\nd) Do not attempt to try fill in missing information that is not provided on the webpage. Do not use user comments as source of data from the webpage.`;

const RecipeData = z.object({
	title: z.string(),
	portions: z.number(),
	preparation_time: 
		z.object(
			{
				value: z.number(),
				unit: z.string()
			}
	),
	cooking_time: 
		z.object(
			{
				value: z.number(),
				unit: z.string()
			}
	),
	ingredients: z.array(
			z.object({
					name: z.string(),
					value: z.string(),
					unit: z.string(),
			}),
	),
	preparation_steps: z.array(
			z.string(),
	),
	cooking_steps: z.array(
			z.string(),
	),
});

async function runPrompt(inputType, inputMessage) {

	let promptMessage = '';
	if (inputType == INPUT_URL) {
		promptMessage = PROMP_MSG.replace(MODIFIER_TAG, INPUT_URL_MODIFIER);
	} else if (inputType == INPUT_ING) {
		promptMessage = PROMP_MSG.replace(MODIFIER_TAG, INPUT_ING_MODIFIER);
	}

	const response = await openai.chat.completions.create({
		model: "gpt-4o",
		messages: [
			{
				"role": "system",
				"content": [
					{
						"type": "text",
						"text": promptMessage
					}
				]
			},
			{
				"role": "user",
				"content": [
					{
						"type": "text",
						"text": inputMessage
					}
				]
			},
		],
		response_format: zodResponseFormat(RecipeData, 'recipeData'),
		temperature: 0.05,
		max_completion_tokens: 2048,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0
	});

	console.log(`Prompt Tokens: ${response.usage.prompt_tokens}`);
	console.log(`Completion Tokens: ${response.usage.completion_tokens}`);
	console.log(`Total Tokens: ${response.usage.total_tokens}`);

	const recipeData = JSON.parse(response.choices[0].message.content);

	// Post process
	recipeData.portions = `${recipeData.portions}`;
	recipeData.preparation_time = `${recipeData.preparation_time.value}, ${recipeData.preparation_time.unit}`;
	recipeData.cooking_time = `${recipeData.cooking_time.value}, ${recipeData.cooking_time.unit}`;
	const processedIngredients = recipeData.ingredients.map(
			item => `${toTitleCase(item.name)}, ${item.value}, ${item.unit}`
	);
	recipeData.ingredients = processedIngredients;
 
	if (inputType == INPUT_URL) {
		recipeData.source = inputMessage;
	} else if (inputType == INPUT_ING) {
		recipeData.source = 'Alessio';
	}

	console.log(recipeData);

	return recipeData
}


export async function aiGenerateUrlRecipe(req, res) {

		const customerID = req.body.customer_id;
		const url = decodeURIComponent(req.body.url); // The data sent from the frontend

		console.log(`Customer ID: ${customerID}`);
		console.log(`Processing URL: ${url}`);
		const customerGID = getGlobalID('customer', customerID);

		const recipeData = await runPrompt(INPUT_URL, url);

		await createAndLinkCustomerRecipe(recipeData, customerGID, 'generated_recipe');

		const responseMessage = {
				success: true,
				message: 'URL processed',
				receivedData: url, // Echo back the received data
				recipeData: recipeData
		};

		// Respond to the frontend
		res.json(responseMessage);
}

export async function aiGenerateIngredientRecipe(req, res) {

		const customerID = req.body.customer_id;
		const ingredients = req.body.ingredients; // The data sent from the frontend

		console.log(`Customer ID: ${customerID}`);
		console.log(`Processing Ingredients:`);
		ingredients.forEach(ingredient => {
				console.log(ingredient);
		});
		const messageRole = 'user';
		const ingredientsString = `${JSON.stringify(ingredients)}`
		const ingredientsListString = ingredientsString.substring(1, ingredientsString.length-1).replaceAll('\"', ''); // Remove [] surrounding string and quote marks
		const customerGID = getGlobalID('customer', customerID);

		const recipeData = await runPrompt(INPUT_ING, ingredientsListString);

		await createAndLinkCustomerRecipe(recipeData, customerGID, 'generated_recipe');

		const responseMessage = {
				success: true,
				message: 'Ingredients processed',
				receivedData: ingredients, // Echo back the received data
				recipeData: recipeData
		};

		// Respond to the frontend
		res.json(responseMessage);


};