import { getCustomerMetafields, getAllRecipes } from "../shopify/customer.js";
import { getMetaobjectData } from "../shopify/metaobject.js";
import { getGlobalID } from '../util/util.js'

const recipeLimit = parseInt(process.env.MAX_CUSTOMER_RECIPES_FREE);

export async function canCreateRecipe(req, res) {
    
    const customerID = req.params.customerID;
    console.log(`Checking if customer '${customerID}' can create recipe`);
  
    const customerGID = getGlobalID('customer', customerID);

    const allRecipes = await getAllRecipes(customerGID);
    const customerRecipes = allRecipes.customer_recipes;
    const generatedRecipes = allRecipes.generated_recipes;
  

  
    res.json({ 
      canCreateRecipe: customerRecipes.can_create,
      numCustomerRecipes: customerRecipes.num_recipes,
      canGenerateRecipe: generatedRecipes.can_create,
      numGeneratedRecipes: generatedRecipes.num_recipes,
      recipeLimit: recipeLimit
    });
  
};

export async function isValidRecipe(req, res) {
    const recipeID = req.params.recipeID;
    const customerID = req.params.customerID;
    console.log(`Checking if recipe ID is valid: ${recipeID}`);

    const recipeGID =  getGlobalID('metaobject', recipeID);
    const customerGID = getGlobalID('customer', customerID);

    const allRecipes = await getAllRecipes(customerGID);

    let isValidRecipeID = false;
    let recipeData = null;
    if (allRecipes.customer_recipes.metaobjects_gid.includes(recipeGID)) {
        console.log(`Recipe ID exists for customer ID as '${allRecipes.customer_recipes.type}'`); 
        isValidRecipeID = true;
        
    } else if (allRecipes.generated_recipes.metaobjects_gid.includes(recipeGID)) {
        console.log(`Recipe ID exists for customer ID as '${allRecipes.generated_recipes.type}'`); 
        isValidRecipeID = true;
    } else {
        console.log('[ERROR] Recipe ID does not exist for customer ID');
    }

    if (isValidRecipeID) {
        recipeData = await getMetaobjectData(recipeGID);
    }

    res.json({ 
        isValidRecipeID: isValidRecipeID,
        recipeData: recipeData 
    });

};