import { shopify } from './shopify.js';
import { getGlobalID } from "../util/util.js";

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