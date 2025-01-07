import { shopify } from './shopify.js';
import { getGlobalID } from "../util/util.js";

export async function queryMetaObject(metaobjectGID) {
    
    metaobjectGID = getGlobalID('metaobject', metaobjectGID);

    const query = `
    query  {
        metaobject(id: "${metaobjectGID}") {
          type
          fields {
              key
              value
          }
        }
      }
    `;

    try {
      const response = await shopify.graphql(query);
      console.log(response);

      const fields = response.metaobject.fields

      // Take the fields array and process into dictionary
      const Metaobject = fields.reduce((acc, field) => {
        try {
          acc[field.key] = JSON.parse(field.value);
        } catch {
          acc[field.key] = field.value;
        }
        
        return acc;
      }, {});

      return Metaobject;
    } catch(err) {
      console.error(err);
      throw err;
    }
}

export async function queryCustomerMetaField(customerGID, metafieldKey) {

    const useMetafieldKey = `custom.${metafieldKey}`;
    console.log(`Getting customer '${customerGID}' metafield key: ${useMetafieldKey}`);

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

      const customer = response.customer;
      if (customer) {
        if ( response.customer.metafields.edges.length > 0 ) {
          const customerRecipeMetafieldID = response.customer.metafields.edges[0].node.id;
          const customerMetaobjectIDs = JSON.parse(response.customer.metafields.edges[0].node.value);
          console.log(`Customer Recipe Metafield ID '${customerRecipeMetafieldID}'`);
          console.log(`Customer Metaobject IDs:`);
          console.log(customerMetaobjectIDs);
  
          const MetaFields = {
              type: useMetafieldKey,
              id: customerRecipeMetafieldID,
              metaobjects: customerMetaobjectIDs
          }
  
          return MetaFields;
        } else {
          console.warn(`No existing '${useMetafieldKey}' metafields found`);

          return null;
        }
      }
    else {
      console.log('Customer does not exist')
      return null;
    }
  
      
    } catch(err) {
      console.error(err);
      throw err;
    }
  }