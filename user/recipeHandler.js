import { shopify } from '../shopify/shopify.js'
import { queryCustomerMetaField } from '../shopify/query.js'
import { createMetaobjectRecipe, deleteMetaobject } from '../shopify/metaobject.js'
import { getGlobalID } from '../util/util.js'
import { recipeDataToFieldsArray } from '../util/recipe.js';

// recipeData = 
// {
//   cooking_steps: [],
//   cooking_time: '',
//   ingredients: [],
//   portions: '',
//   preparation_steps: [],
//   preparation_time: '',
//   source: '',
//   title: '',
// }

export async function createCustomerRecipe(req, res) {
    
    console.log('Received data from Shopify ...');
    const recipeData = req.body.recipe_data; // The data sent from the frontend
    const customerID = req.body.customer_id;
    const baseUrl = req.body.base_url
    const customerGID = getGlobalID('customer', customerID);

    try {
        const Metaobject = await createAndLinkCustomerRecipe(recipeData, customerGID);
        var responseMessage = {
            success: true,
            message: 'Successfully created recipe!',
            receivedData: recipeData, 
            redirectUrl: `${baseUrl}/pages/my-recipe-view/${Metaobject.handle}`
        };
    } catch(err) {
        console.error(err);
        var responseMessage = {
            success: false,
            message: 'Failed to create recipe',
            receivedData: recipeData, 
            redirectUrl: `${baseUrl}/pages/recipe-vault`
        };
    };


    res.json(responseMessage);
}

export async function createAndLinkCustomerRecipe(recipeData, customerGID) {
    
    // First create the recipe metaobject
    const Metaobject = await createMetaobjectRecipe(recipeData, 'customer_recipe');
    const metaobjectGID = Metaobject.id;

    // Update the customer data with the new metaobject
    try {
        await linkRecipeToCustomer(customerGID, metaobjectGID);
        return Metaobject;
    } catch(err) {
        console.error(err);
        // If the linking fails in anyway, delete the created metaobject
        await deleteCustomerRecipe(metaobjectGID);
        return null;
    }
}




export async function updateCustomerRecipe(req, res) {
    
    const recipeData = req.body.recipe_data; // The data sent from the frontend
    const recipeID = req.body.recipe_id;
    const baseUrl = req.body.base_url;
    const recipeGID = getGlobalID('metaobject', recipeID);

    const query = `
        mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) {
            metaobjectUpdate(id: $id, metaobject: $metaobject) {
                metaobject {
                    id
                    handle
                    fields {
                        key
                        value
                    }
                }
                userErrors {
                    field
                    message
                    code
                }
            }
        }
    `;

    const variables = {
        id: recipeGID,
        metaobject: {
            fields: recipeDataToFieldsArray(recipeData),
        }
    };

    var redirectUrl = `${baseUrl}/pages/recipe-vault`;
    try {
        const response = await shopify.graphql(query, variables);
        redirectUrl = `${baseUrl}/pages/my-recipe-view/${response.metaobjectUpdate.metaobject.handle}`;
        console.log(`Updated Metaobject (ID: ${recipeGID})`);
        console.log(`Redirect to: ${redirectUrl}`);

        var responseMessage = {
            success: true,
            message: 'Successfully updated recipe',
            receivedData: recipeData, 
            redirectUrl: redirectUrl
        };
        
    } catch(err) {
        console.error(err);

        console.log(`Failed to update Metaobject (ID: ${recipeGID})`);
        console.log(`Redirect to: ${redirectUrl}`);

        var responseMessage = {
            success: false,
            message: `Failed to update recipe: ${err}`,
            receivedData: recipeData, 
            redirectUrl: redirectUrl
        };
        
    }

    res.json(responseMessage);
}

export async function deleteCustomerRecipe(req, res) {

    const recipeID = req.body.recipe_id; 
    const customerID = req.body.customer_id;
    const recipeGID = getGlobalID('metaobject', recipeID);

    console.log(`Deleting recipe ID '${recipeID} for customer ID '${customerID}`);

    await deleteMetaobject(recipeGID);

    const responseMessage = {
        success: true,
        message: 'Deleted recipe',
    };

    // Respond to the frontend
    res.json(responseMessage)
};



export async function linkRecipeToCustomer(customerGID, metaobjectGID) {

    // To link a recipe to a customer
    // 1) Get the metafield ID containing the metaobjects
    // 2) Get the existing metaobjects under the metafield
    // 3) Append the new metaobject ID to existing metaobjects
    // 4) Do customerUpdate mutation

    console.log(`Customer GID: ${customerGID}`);
    console.log(`New Metaobject GID: ${metaobjectGID}`);

    const MetaField = await queryCustomerMetaField(customerGID, 'customer_recipe');

    const useMetafieldKey = `customer_recipe`;
    var skipQuery = false;
    
    if (MetaField) {

        console.log(`Metafield GID: ${MetaField.id}`);
        console.log(`Existing Metaobject GIDs: ${MetaField.metaobjects}`);
        console.log('Adding another recipe for customer');

        // Add new ID to existing IDs
        if (MetaField.metaobjects.includes(metaobjectGID)) {
            console.warn('Link to recipe metaobject already exists for customer. Skipping query')
            skipQuery = true;
        } else {
            MetaField.metaobjects.push(metaobjectGID);
            let updatedMetaobjectGIDs = JSON.stringify(MetaField.metaobjects);
            const escapedMetaobjectGIDs = updatedMetaobjectGIDs.replace(/"(.*?)"/g, `\\"$1\\"`);

            var query = `
            mutation {
                customerUpdate(
                input: {
                    id: "${customerGID}",
                    metafields: [
                    {
                        id: "${MetaField.id}"
                        value: "${escapedMetaobjectGIDs}"
                        }
                    ],
                }
                ) {
                customer {
                    id
                    metafields(first: 10) {
                    edges {
                        node {
                        namespace
                        key
                        value
                        }
                    }
                    }
                }
                userErrors {
                    field
                    message
                }
                }
            }
        `;

        }

        

    } else {

        console.log('Creating customers first recipe');
        let array = [];
        array.push(metaobjectGID);
        let updatedMetaobjectGIDs = JSON.stringify(array);
        const escapedMetaobjectGIDs = updatedMetaobjectGIDs.replace(/"(.*?)"/g, `\\"$1\\"`);

        

        var query = `
            mutation {
                customerUpdate(
                    input: {
                    id: "${customerGID}",
                    metafields: [
                        {
                        namespace: "custom"
                        key: "${useMetafieldKey}"
                        type: "list.metaobject_reference"
                        value: "${escapedMetaobjectGIDs}"
                        }
                    ],
                    }
                ) {
                    customer {
                    id
                    metafields(first: 10) {
                        edges {
                        node {
                            namespace
                            key
                            value
                        }
                        }
                    }
                    }
                    userErrors {
                    field
                    message
                    }
                }
            }
        `;
    }

    if (!skipQuery) {
        try {
            const response = await shopify.graphql(query);
            console.log(response);
          } catch(err) {
            console.error(err);
            throw err;
          }
    }

    
  }

