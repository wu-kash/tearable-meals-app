import { shopify } from './shopify.js';

export async function getCustomerMetafields(customerGID) {

    // customerGID: "gid://shopify/Customer/<id>"
  
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
      keys: ["custom.customer_recipes"]
    };
  
    try {
      const response = await shopify.graphql(query, variables);
  
      if ( response.customer.metafields.edges.length > 0 ) {
        const customerRecipeMetafieldID = response.customer.metafields.edges[0].node.id;
        const customerMetaobjectIDs = response.customer.metafields.edges[0].node.value;
        console.log(`Customer Recipe Metafield ID '${customerRecipeMetafieldID}'`);
        console.log(`Customer Metaobject IDs:`);
        console.log(JSON.parse(customerMetaobjectIDs));
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