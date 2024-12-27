import { shopify } from '../shopify/shopify.js'
import { getCustomerMetafields } from '../shopify/customer.js'
import { createMetaobjectCustomerRecipe, deleteMetaobject } from '../shopify/metaobject.js'
import { getGlobalID } from '../util/util.js'

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
    const customerGID = getGlobalID('customer', customerID);

    await createAndLinkCustomerRecipe(recipeData, customerGID);

    // Process the data (e.g., store in a database, send to another API, etc.)
    const responseMessage = {
        success: true,
        message: 'Data received successfully',
        receivedData: recipeData, // Echo back the received data
    };

    // Respond to the frontend
    res.json(responseMessage);
}

export async function createAndLinkCustomerRecipe(recipeData, customerGID) {

    var createdMetaobjectGID = null;
    try {
        createdMetaobjectGID = await createMetaobjectCustomerRecipe(recipeData);

        // Get the customer_recipes metafield ID and the existing metaobjects 
        const [metafieldGID, existingMetaobjectGIDs] = await getCustomerMetafields(customerGID);

        if (metafieldGID == null) {
            console.log('Metafield GID is null, create new metafield');
            await createFirstRecipeForCustomer(customerGID, createdMetaobjectGID);

        } else if (existingMetaobjectGIDs == null) {
            console.log('Metaobjects GIDs is null');
        } else {
            console.log('Link new Metaobject GID to Customer GID');
            await linkRecipeToCustomer(customerGID, metafieldGID, existingMetaobjectGIDs, createdMetaobjectGID)
        }
    
    } catch(err) {
        // Delete the recipe if it was unable to link to customer
        if (createdMetaobjectGID != null) {
            deleteCustomerRecipe(createdMetaobjectGID);
        }
        console.error(err);
        throw err;
    }

}

export async function updateCustomerRecipe(req, res) {
    
    console.log('Received data from Shopify ...');
    const recipeData = req.body.recipe_data; // The data sent from the frontend
    const recipeID = req.body.recipe_id;
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
            fields: [
            { key: "title", value: recipeData.title },
            { key: "source", value: recipeData.source },
            { key: "portions", value: recipeData.portions },
            { key: "preparation_time", value: recipeData.preparation_time },
            { key: "cooking_time", value: recipeData.cooking_time },
            { key: "ingredients", value: JSON.stringify(recipeData.ingredients) },
            { key: "preparation_steps", value: JSON.stringify(recipeData.preparation_steps) },
            { key: "cooking_steps", value: JSON.stringify(recipeData.cooking_steps) },
            ],
        }
    };

    var redirectUrl = `https://www.tearablemeals.com/404`;
    try {
        const response = await shopify.graphql(query, variables);
        redirectUrl = `https://www.tearablemeals.com/pages/view-my-recipe/${response.metaobjectUpdate.metaobject.handle}`;
        console.log(`Updated Metaobject (ID: ${recipeGID})`);
    
    } catch(err) {
        console.error(err);
    throw err;
    }


    // Process the data (e.g., store in a database, send to another API, etc.)
    const responseMessage = {
        success: true,
        message: 'Data received successfully',
        receivedData: recipeData, 
        redirectUrl: redirectUrl
    };

    // Respond to the frontend
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

async function linkRecipeToCustomer(customerGID, metafieldGID, existingMetaobjectGIDs, createdMetaobjectGID) {

    console.log(`Customer GID: ${customerGID}`);
    console.log(`Metafield GID: ${metafieldGID}`);
    console.log(`Existing Metaobject GIDs: ${existingMetaobjectGIDs}`);
    console.log(`Created Metaobject GID: ${createdMetaobjectGID}`);
  
    let array = JSON.parse(existingMetaobjectGIDs)
    array.push(createdMetaobjectGID);
    let updatedMetaobjectGIDs = JSON.stringify(array);
    const escapedMetaobjectGIDs = updatedMetaobjectGIDs.replace(/"(.*?)"/g, `\\"$1\\"`);
  
    const query = `
          mutation {
            customerUpdate(
              input: {
                id: "${customerGID}",
                metafields: [
                  {
                    id: "${metafieldGID}"
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
  
    try {
      const response = await shopify.graphql(query);
      console.log(response);
    } catch(err) {
      console.error(err);
      throw err;
    }
  }

async function createFirstRecipeForCustomer(customerGID, createdMetaobjectGID) {

    console.log(`Customer GID: ${customerGID}`);
    console.log(`Created Metaobject GID: ${createdMetaobjectGID}`);
    console.log('Creating new metafield');

    let array = [];
    array.push(createdMetaobjectGID);
    let updatedMetaobjectGIDs = JSON.stringify(array);
    const escapedMetaobjectGIDs = updatedMetaobjectGIDs.replace(/"(.*?)"/g, `\\"$1\\"`);

    const query = `
        mutation {
            customerUpdate(
                input: {
                id: "${customerGID}",
                metafields: [
                    {
                    namespace: "custom"
                    key: "customer_recipes"
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

    try {
        const response = await shopify.graphql(query);
        console.log('Created first recipe!');
        console.log(response);
    } catch(err) {
        console.error(err);
        throw err;
}
}