import { getGlobalID } from '../util/util.js';
import { queryMetaObject, queryCustomerMetaField } from '../shopify/query.js';
import { createMetaobjectRecipe} from '../shopify/metaobject.js'
import { linkRecipeToCustomer } from '../user/recipeHandler.js'

const recipeData = {
        title: "Another Test Recipe",
        portions: "4",
        preparation_time: {
          value: "10",
          unit: "minutes",
        },
        cooking_time: {
          value: "15",
          unit: "minutes",
        },
        ingredients: [
          {
            name: "Peeled Prawns",
            value: "500",
            unit: "g",
          },
          {
            name: "Coconut Milk",
            value: "200",
            unit: "ml",
          },
          {
            name: "Garlic",
            value: "4",
            unit: "cloves",
          },
          {
            name: "Ginger Root",
            value: "2",
            unit: "cm",
          },
          {
            name: "Red Chillies",
            value: "2",
            unit: "",
          },
          {
            name: "Fresh Coriander",
            value: "15",
            unit: "g",
          },
          {
            name: "Sunflower Oil",
            value: "2",
            unit: "tbsp",
          },
          {
            name: "Lemon Juice",
            value: "1",
            unit: "tbsp",
          },
          {
            name: "Tomato Puree",
            value: "1",
            unit: "tbsp",
          },
          {
            name: "Garam Masala",
            value: "1",
            unit: "tsp",
          },
          {
            name: "Salt",
            value: "1",
            unit: "tsp",
          },
        ],
        preparation_steps: [
          "Peel and crush the INGREDIENT{garlic} and the INGREDIENT{ginger root}. Chop the INGREDIENT{chilli} into pieces. Wash and cut the INGREDIENT{coriander}.",
        ],
        cooking_steps: [
          "Put the INGREDIENT{oil} in a frying pan over moderate heat. Fry the crushed INGREDIENT{garlic} and INGREDIENT{ginger root} for about 3 minutes, keep stirring.",
          "Add the INGREDIENT{prawns} and INGREDIENT{chillies} and fry for another 3 minutes.",
          "Add the INGREDIENT{lemon juice}, INGREDIENT{tomato puree}, INGREDIENT{coconut milk}, INGREDIENT{garam masala} and INGREDIENT{salt}. Bring to a boil, then turn down the heat until it is just simmering.",
          "Cover and cook for another 5 minutes.",
          "Sprinkle the INGREDIENT{coriander} over the INGREDIENT{chilli prawns} before serving.",
        ],
        source: "Cooking For Blokes (p. 242)",
        cooked: "true",
        origin: "Test"
    }

var recipeType = '';
var metaobject_id = '';
var metaobject_gid = '';
var customer_id = '';
var customer_gid = '';


// const metaobject_id = '105645310252'; // Test Recipe
metaobject_id = '105645408556'; // Another Test Recipe

metaobject_gid = getGlobalID('Metaobject', metaobject_id)
customer_id = '8645581308204';
customer_gid = getGlobalID('Customer', customer_id);


///////// Create Metaobject Recipe

// recipeType = 'customer_recipe';
// recipeType = 'recipe';
// recipeData.title = 'This Recipe'
// await createMetaobjectRecipe(recipeData, recipeType)

///////// Metaobject


// const Metaobject = await queryMetaObject(metaobject_gid);

// const metafield_key = 'customer_recipe';
// const CustomerMetafields = await queryCustomerMetaField(customer_gid, metafield_key);

////// Create and Link a metaobject to a customer

recipeType = 'customer_recipe';
recipeData.title = 'My Customer Recipe'
const Metaobject = await createMetaobjectRecipe(recipeData, recipeType)

customer_id = '8645581308204';
customer_gid = getGlobalID('Customer', customer_id);
metaobject_gid = Metaobject.id;
await linkRecipeToCustomer(customer_gid, metaobject_gid)

console.log('Done');

