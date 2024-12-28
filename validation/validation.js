import { getCustomerMetafields, getAllRecipes } from "../shopify/customer.js";
import { getMetaobjectData } from "../shopify/metaobject.js";

const recipeLimit = parseInt(process.env.MAX_CUSTOMER_RECIPES_FREE);

export async function canCreateRecipe(req, res) {
    
    const customerID = req.params.customerID;
    console.log(`Checking if customer '${customerID}' can create recipe`);
  
    const customerGID =  `gid://shopify/Customer/${customerID}`;

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

    const recipeGID =  `gid://shopify/Metaobject/${recipeID}`;
    const customerGID =  `gid://shopify/Customer/${customerID}`;

    const [metafieldGID, existingMetaobjectGIDs] = await getCustomerMetafields(customerGID, 'customer_recipe');

    if (existingMetaobjectGIDs.includes(recipeGID)) {
    console.log('Recipe ID exists for customer ID'); 
    const recipeData = await getMetaobjectData(recipeGID);

    res.json({ 
        isValidRecipeID: true,
        recipeData: recipeData 
    });

    } else {
    console.log('[ERROR] Recipe ID does not exist for customer ID');
    
    res.json({ 
        isValidRecipeID: false,
        recipeData: null 
    });
    }
};