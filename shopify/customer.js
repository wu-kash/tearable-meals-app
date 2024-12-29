import { queryCustomerMetaField } from "../shopify/query.js";

const recipeLimit = parseInt(process.env.MAX_CUSTOMER_RECIPES_FREE);

export async function getManualRecipes(customerGID) {

  const metaObjectType = 'customer_recipe';
  console.log(`[INFO] Getting metaobjects ${metaObjectType}`);
  const MetaField = await queryCustomerMetaField(customerGID, metaObjectType);

  var canCreate = true;
  if (MetaField.metaobjects.length > recipeLimit) {
    canCreate = false;
  } 

  const customerRecipes = {
    'type': metaObjectType,
    'metafield_gid': MetaField.id,
    'metaobjects_gid': MetaField.metaobjects,
    'num_recipes': MetaField.metaobjects.length,
    'can_create': canCreate 
  }

  return customerRecipes
}

export async function getGeneratedRecipes(customerGID) {

  const metaObjectType = 'generated_recipe';
  console.log(`[INFO] Getting metaobjects ${metaObjectType}`);
  const MetaField = await queryCustomerMetaField(customerGID, metaObjectType);

  var canCreate = true;
  if (MetaField.metaobjects.length > recipeLimit) {
    canCreate = false;
  } 

  const generatedRecipes = {
    'type': metaObjectType,
    'metafield_gid': MetaField.id,
    'metaobjects_gid': MetaField.metaobjects,
    'num_recipes': MetaField.metaobjects.length,
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