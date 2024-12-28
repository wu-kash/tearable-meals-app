import { openai } from './openai.js';
import { createAndLinkCustomerRecipe } from '../user/recipeHandler.js'
import { getGlobalID } from '../util/util.js'
import { json } from 'express';

export async function aiGenerateUrlRecipe(req, res) {

    const customerID = req.body.customer_id;
    const url = decodeURIComponent(req.body.url); // The data sent from the frontend

    console.log(`Customer ID: ${customerID}`);
    console.log(`Processing URL: ${url}`);
    const messageRole = 'user';
    const messageContent = `<url>${url}</url>`;
    const customerGID = getGlobalID('customer', customerID);


    console.log('Create thread and run')
    let run = await openai.beta.threads.createAndRunPoll({
        assistant_id: "asst_lMI1Xx8WZR8aTp5OZwuifrq8",
        thread: {
            messages: [
                {
                    role: messageRole,
                    content: messageContent
                },
            ],
        },
    });

    var recipeData = null;
    if (run.status === 'completed') {
        console.log('Run completed');
        const messages = await openai.beta.threads.messages.list(run.thread_id);
    
        for (const message of messages.data.reverse()) {

            const submessage = message.content[0].text.value;

            console.log(`${message.role} > ${submessage}`);

            if (submessage.includes('<url>') && submessage.includes('</url>')) {

            } else {
                recipeData = JSON.parse(message.content[0].text.value);
                const processedIngredients = recipeData.ingredients.map(
                    item => `${item.name}, ${item.value}, ${item.units}`
                );
                recipeData.ingredients = processedIngredients;
            }
        }
        
    } else {
        console.log(run.status);
    }

    await createAndLinkCustomerRecipe(recipeData, customerGID, 'generated_recipe');

    const responseMessage = {
        success: true,
        message: 'URL processed',
        receivedData: url, // Echo back the received data
        recipeData: recipeData
    };

    // Respond to the frontend
    res.json(responseMessage);

};

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
    const messageContent = ingredientsString.substring(1, ingredientsString.length-1).replaceAll('\"', ''); // Remove [] surrounding string and quote marks
    const customerGID = getGlobalID('customer', customerID);


    console.log('Create thread and run')
    let run = await openai.beta.threads.createAndRunPoll({
        assistant_id: "asst_LMtlFSKoMH1WO3jk3kC6qset",
        thread: {
            messages: [
                {
                    role: messageRole,
                    content: messageContent
                },
            ],
        },
    });

    var recipeData = null;
    if (run.status === 'completed') {
        console.log('Run completed');
        const messages = await openai.beta.threads.messages.list(run.thread_id);
    
        for (const message of messages.data.reverse()) {

            const submessage = message.content[0].text.value;
            console.log(message)
            console.log(`${message.role} > ${submessage}`);
        }
        
    } else {
        console.log(run.status);
        console.log(run);
    }

    recipeData = JSON.parse(run.required_action.submit_tool_outputs.tool_calls[0].function.arguments);
    const processedIngredients = recipeData.ingredients.map(
        item => `${item.name}, ${item.value}, ${item.units}`
    );
    recipeData.ingredients = processedIngredients;
    recipeData.source = 'Alessio';

    await createAndLinkCustomerRecipe(recipeData, customerGID, 'generated_recipe');

    const responseMessage = {
        success: true,
        message: 'URL processed',
        receivedData: ingredients, // Echo back the received data
        recipeData: recipeData
    };

    // Respond to the frontend
    res.json(responseMessage);


};