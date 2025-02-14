import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// Load environment variables
dotenv.config();

import { aiGenerateIngredientRecipe, aiGenerateUrlRecipe } from './alessio/processing.js';
import { printCustomerRecipe } from './print/printHandler.js';
import { createCustomerRecipe, deleteCustomerRecipe, updateCustomerRecipe } from './user/recipeHandler.js';
import { canCreateRecipe, isValidRecipe } from './validation/validation.js';


//https://shopify.dev/docs/api/admin-graphql/2024-10/mutations/metaobjectCreate

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

// Middleware
app.use(cors({
	origin: 'https://www.tearablemeals.com', // Replace with your Shopify domain
}));

app.use(express.json()); // To parse JSON request bodies

// Validation
app.get('/canCreateRecipe/:customerID', canCreateRecipe);
app.get('/isValidRID/:customerID/:recipeID', isValidRecipe);
app.get('/test', test);

function test(req, res) {
    console.log('Testing')

	res.json({ 
        Test: 'Success'
    });
};

// Recipe Handling
app.post('/create_customer_recipe', createCustomerRecipe);
app.post('/update_customer_recipe', updateCustomerRecipe);
app.post('/delete_customer_recipe', deleteCustomerRecipe);
app.post('/print_customer_recipe', printCustomerRecipe);

// AI Processing
app.post('/generate_url_recipe', aiGenerateUrlRecipe);
app.post('/generate_ingredient_recipe', aiGenerateIngredientRecipe);

// Start the server
app.listen(PORT, "0.0.0.0", function () {
	console.info(`Backend API live ${PORT}`);
});