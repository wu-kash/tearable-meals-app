import { queryCustomerMetaField } from "../shopify/query.js";

const recipeLimit = parseInt(process.env.MAX_CUSTOMER_RECIPES_FREE);

export async function getCustomerRecipes(customerGID) {

  // Assuming the metaobject is of type 'object', in the customer data, 
  // it is defined as 'objects', e.g. custom.objects

  const metaObjectType = 'customer_recipe';
  console.log(`[INFO] Getting customer metaobjects ${metaObjectType}`);
  const Metafield = await queryCustomerMetaField(customerGID, metaObjectType);

  var metafieldGID = null;
  var metaobjectGIDs = null;
  var numRecipes = 0;
  var canCreate = true;

  if (Metafield && Metafield.metaobjects) {
    if (Metafield.metaobjects.length >= recipeLimit) {
      canCreate = false;
    } 
    metafieldGID = Metafield.id;
    metaobjectGIDs = Metafield.metaobjects;
    numRecipes = Metafield.metaobjects.length;

  }

  const customerRecipes = {
    'type': metaObjectType,
    'metafield_gid': metafieldGID,
    'metaobjects_gid': metaobjectGIDs,
    'num_recipes': numRecipes,
    'can_create': canCreate 
  }

  return customerRecipes
}