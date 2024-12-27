import { openai, OPENAI_MODEL } from './openai.js';
import { createAndLinkCustomerRecipe } from '../user/recipeHandler.js'
import { getGlobalID } from '../util/util.js'

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

    await createAndLinkCustomerRecipe(recipeData, customerGID);

    const responseMessage = {
        success: true,
        message: 'URL processed',
        receivedData: url, // Echo back the received data
        recipeData: recipeData
    };

    // Respond to the frontend
    res.json(responseMessage);


};