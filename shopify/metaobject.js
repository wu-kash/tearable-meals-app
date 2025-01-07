import { shopify } from './shopify.js';
import { recipeDataToFieldsArray } from '../util/recipe.js';

export async function createMetaobjectRecipe(recipeData, recipeType) {

	console.info(`Creating Metaobject: ${recipeType}`);

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
		type: recipeType,
		fields: recipeDataToFieldsArray(recipeData),
		}
	};

	try {
		const response = await shopify.graphql(query, variables);
		const metaobject = response.metaobjectCreate.metaobject;
		console.info(`Created Metaobject (ID: ${metaobject.id})`);
		console.log(metaobject);
		return metaobject;
	} catch(err) {
		console.error(`Failed to create metaobject "${recipeType}"`);
		console.error(err);
		return null;
	}

}

export async function deleteMetaobject(metaobjectGID) {

	console.warn(`Deleting metaobject "${metaobjectGID}"`)

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
		console.warn(`Deleted Metaobject: ${metaobjectGID}`);
	} catch(err) {
		console.error(err);
		throw err;
	}
}