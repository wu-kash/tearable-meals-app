import { shopify } from './shopify.js';
import { getGlobalID } from "../util/util.js";

export async function createMetaobjectCustomerRecipe(recipeData) {

  const query = `
        mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
            metaobjectCreate(metaobject: $metaobject) {
            metaobject {
                id
                type
                handle
                fields {
                key
                value
                }
            }
            userErrors {
                field
                message
            }
            }
        }
        `;

    const variables = {
            metaobject: {
            type: "customer_recipe",
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

    try {
        const response = await shopify.graphql(query, variables);
        const createdMetaobjectGID = response.metaobjectCreate.metaobject.id;
        console.log(`Created Metaobject (ID: ${createdMetaobjectGID})`);
        return createdMetaobjectGID;
    } catch(err) {
        console.log(`Failed to created metaobject 'customer_recipe'`);
        console.error(err);
        return null;
    }

}

export async function deleteMetaobject(metaobjectGID) {

  const query = `
        mutation DeleteMetaobject($id: ID!) {
            metaobjectDelete(id: $id) {
            deletedId
            userErrors {
                field
                message
                code
            }
            }
        }
        `;

    const variables = {
            id: metaobjectGID
    };

    try {
        const response = await shopify.graphql(query, variables);
        console.log(`Deleted Metaobject: ${metaobjectGID}`);
    } catch(err) {
        console.error(err);
        throw err;
    }
}


export async function getMetaobjectData(metaobjectGID) {
    
    metaobjectGID = getGlobalID('metaobject', metaobjectGID);

    const query = `
    query  {
        metaobject(id: "${metaobjectGID}") {
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
      const recipeData = fields.reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {});

      return recipeData;


    } catch(err) {
      console.error(err);
      throw err;
    }
}