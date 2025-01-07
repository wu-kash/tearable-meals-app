import { getCustomerRecipes } from "../shopify/customer.js";
import { queryMetaObject } from "../shopify/query.js";
import { getGlobalID } from '../util/util.js'

const recipeLimit = parseInt(process.env.MAX_CUSTOMER_RECIPES_FREE);

export async function canCreateRecipe(req, res) {
    
    const customerID = req.params.customerID;
    console.log(`Checking if customer '${customerID}' can create recipe`);
  
    const customerGID = getGlobalID('customer', customerID);

    const customerRecipes = await getCustomerRecipes(customerGID);
  
    res.json({ 
      canCreateRecipe: customerRecipes.can_create,
      numCustomerRecipes: customerRecipes.num_recipes,
      recipeLimit: recipeLimit
    });
  
};

export async function isValidRecipe(req, res) {
    const recipeID = req.params.recipeID;
    const customerID = req.params.customerID;
    console.log(`Checking if recipe ID is valid: ${recipeID}`);

    const recipeGID =  getGlobalID('metaobject', recipeID);
    const customerGID = getGlobalID('customer', customerID);

    const customerRecipes = await getCustomerRecipes(customerGID);

    let isValidRecipeID = false;
    let recipeData = null;
    if (customerRecipes.metaobjects_gid.includes(recipeGID)) {
        console.log(`Recipe ID exists for customer ID as '${customerRecipes.type}'`); 
        isValidRecipeID = true;
    } else {
        console.log('[ERROR] Recipe ID does not exist for customer ID');
    }

    if (isValidRecipeID) {
        recipeData = await queryMetaObject(recipeGID);
    }

    res.json({ 
        isValidRecipeID: isValidRecipeID,
        recipeData: recipeData 
    });

};