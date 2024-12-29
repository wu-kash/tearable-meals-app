import { shopify } from './shopify.js';

const recipeLimit = parseInt(process.env.MAX_CUSTOMER_RECIPES_FREE);

export async function getCustomerMetafields(customerGID, recipeType) {

    const useMetafieldKey = `custom.${recipeType}s`;
  
    console.log(`Getting customer '${customerGID}' Metafields`);
    const query = `
      query CustomerMetafields($ownerId: ID!, $keys: [String!]) {
          customer(id: $ownerId) {
            metafields(first: 1, keys:$keys) {
              edges {
                node {
                  id
                  value
                }
              }
            }
          }
        }
      `;
  
    const variables = {
      ownerId: customerGID,
      keys: [useMetafieldKey]
    };
  
    try {
      const response = await shopify.graphql(query, variables);
  
      if ( response.customer.metafields.edges.length > 0 ) {
        const customerRecipeMetafieldID = response.customer.metafields.edges[0].node.id;
        const customerMetaobjectIDs = JSON.parse(response.customer.metafields.edges[0].node.value);
        console.log(`Customer Recipe Metafield ID '${customerRecipeMetafieldID}'`);
        console.log(`Customer Metaobject IDs:`);
        console.log(customerMetaobjectIDs);
        return [customerRecipeMetafieldID, customerMetaobjectIDs];
      } else {
        console.log('No existing customer_recipe metaobjects found');
        return [null, null];
      }
    } catch(err) {
      console.error(err);
      throw err;
    }
  }

export async function getManualRecipes(customerGID) {

  const metaObjectType = 'customer_recipe';
  console.log(`[INFO] Getting metaobjects ${metaObjectType}`);
  const [metafieldGID, existingMetaobjectGIDs] = await getCustomerMetafields(customerGID, metaObjectType);

  var canCreate = true;
  if (existingMetaobjectGIDs.length > recipeLimit) {
    canCreate = false;
  } 

  const customerRecipes = {
    'type': metaObjectType,
    'metafield_gid': metafieldGID,
    'metaobjects_gid': existingMetaobjectGIDs,
    'num_recipes': existingMetaobjectGIDs.length,
    'can_create': canCreate 
  }

  return customerRecipes
}

export async function getGeneratedRecipes(customerGID) {

  const metaObjectType = 'generated_recipe';
  console.log(`[INFO] Getting metaobjects ${metaObjectType}`);
  const [metafieldGID, existingMetaobjectGIDs] = await getCustomerMetafields(customerGID, metaObjectType);

  var canCreate = true;
  if (existingMetaobjectGIDs.length > recipeLimit) {
    canCreate = false;
  } 

  const generatedRecipes = {
    'type': metaObjectType,
    'metafield_gid': metafieldGID,
    'metaobjects_gid': existingMetaobjectGIDs,
    'num_recipes': existingMetaobjectGIDs.length,
    'can_create': canCreate 
  }

  return generatedRecipes
}

export async function getAllRecipes(customerGID) {

  const manualRecipes = await getManualRecipes(customerGID);
  const generatedRecipes = await getGeneratedRecipes(customerGID);

  const allRecipes = {
    'customer_recipes': manualRecipes,
    'generated_recipes': generatedRecipes,
  }
  
  return allRecipes;
}