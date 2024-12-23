import { getCustomerMetafields } from "../shopify/customer.js";
import { getMetaobjectData } from "../shopify/metaobject.js";

export async function canCreateRecipe(req, res) {
    
    const customerID = req.params.customerID;
    console.log(`Checking if customer '${customerID}' can create recipe`);
  
    const customerGID =  `gid://shopify/Customer/${customerID}`;
    const [metafieldGID, existingMetaobjectGIDs] = await getCustomerMetafields(customerGID);
  
    const customerMetaobjectGIDs = JSON.parse(existingMetaobjectGIDs);
    const recipeLimit = parseInt(process.env.MAX_CUSTOMER_RECIPES_FREE);

    var numCustomerRecipes = 0;
    if (customerMetaobjectGIDs != null) {
        numCustomerRecipes = customerMetaobjectGIDs.length;
    }

    var canCreateRecipe = false;
    if (numCustomerRecipes == recipeLimit) {
      console.log(`Customer recipe limit reached! (${numCustomerRecipes}/${recipeLimit})`);
    } else if (numCustomerRecipes > recipeLimit) {
      console.log(`Customer recipe limit exceeded! (${numCustomerRecipes}/${recipeLimit})`);
    } else {
      console.log(`Customer can create recipe (${numCustomerRecipes}/${recipeLimit})`);
      canCreateRecipe = true;
    }
  
    res.json({ 
      canCreateRecipe: canCreateRecipe,
      numCustomerRecipes: numCustomerRecipes,
      recipeLimit: recipeLimit
    });
  
};

export async function isValidRecipe(req, res) {
    const recipeID = req.params.recipeID;
    const customerID = req.params.customerID;
    console.log(`Checking if recipe ID is valid: ${recipeID}`);

    const recipeGID =  `gid://shopify/Metaobject/${recipeID}`;
    const customerGID =  `gid://shopify/Customer/${customerID}`;

    const [metafieldGID, existingMetaobjectGIDs] = await getCustomerMetafields(customerGID);

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