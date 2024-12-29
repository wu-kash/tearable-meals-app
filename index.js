import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { canCreateRecipe, isValidRecipe } from './validation/validation.js';
import { createCustomerRecipe, deleteCustomerRecipe, updateCustomerRecipe } from './user/recipeHandler.js';
import { aiGenerateUrlRecipe, aiGenerateIngredientRecipe } from './alessio/processing.js';

//https://shopify.dev/docs/api/admin-graphql/2024-10/mutations/metaobjectCreate

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
	origin: 'https://www.tearablemeals.com', // Replace with your Shopify domain
}));
app.use(express.json()); // To parse JSON request bodies

// Validation
app.get('/canCreateRecipe/:customerID', canCreateRecipe);
app.get('/isValidRID/:customerID/:recipeID', isValidRecipe);

// Recipe Handling
app.post('/create_customer_recipe', createCustomerRecipe);
app.post('/update_customer_recipe', updateCustomerRecipe);
app.post('/delete_customer_recipe', deleteCustomerRecipe);

// AI Processing
app.post('/generate_url_recipe', aiGenerateUrlRecipe);
app.post('/generate_ingredient_recipe', aiGenerateIngredientRecipe);

// Start the server
app.listen(PORT, "0.0.0.0", function () {
	console.info(`Backend API live ${PORT}`);
});