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
      const MetaObject = fields.reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {});

      const processedIngredients = [];
      JSON.parse(MetaObject.ingredients).forEach(ingredient => {
        var ingredientParts = ingredient.split(",").map(function(item) {
          return item.trim();
        });
        // Name, Quantity, Units
        const ingredientObj = {
          'name': ingredientParts[0],
          'value': ingredientParts[1],
          'unit': ingredientParts[2],
        }
        processedIngredients.push(ingredientObj)
    });

    var preparationTimeParts = MetaObject.preparation_time.split(",").map(function(item) {
      return item.trim();
    });

      MetaObject.preparation_time = {
        'value': preparationTimeParts[0],
        'unit': preparationTimeParts[1],
      }

      var cookingTimeParts = MetaObject.cooking_time.split(",").map(function(item) {
        return item.trim();
      });

      MetaObject.cooking_time = {
        'value': cookingTimeParts[0],
        'unit': cookingTimeParts[1],
      }

      MetaObject.ingredients = processedIngredients;
      MetaObject.preparation_steps = JSON.parse(MetaObject.preparation_steps);
      MetaObject.cooking_steps = JSON.parse(MetaObject.cooking_steps);

      return MetaObject;
    } catch(err) {
      console.error(err);
      throw err;
    }
}

export async function queryCustomerMetaField(customerGID, metafieldKey) {

    const useMetafieldKey = `custom.${metafieldKey}s`;
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
        console.log(`No existing ${useMetafieldKey} metafields found`);
        return null;
      }
    } catch(err) {
      console.error(err);
      throw err;
    }
  }