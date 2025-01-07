export function recipeDataToFieldsArray(recipeData) {

    const fieldsArray = [
        { key: "title", value: recipeData.title },
        { key: "source", value: recipeData.source },
        { key: "portions", value: recipeData.portions },
        { key: "origin", value: recipeData.origin },
        { key: "preparation_time", value: JSON.stringify(recipeData.preparation_time) },
        { key: "cooking_time", value: JSON.stringify(recipeData.cooking_time) },
        { key: "ingredients", value: JSON.stringify(recipeData.ingredients) },
        { key: "preparation_steps", value: JSON.stringify(recipeData.preparation_steps) },
        { key: "cooking_steps", value: JSON.stringify(recipeData.cooking_steps) },
    ];

    return fieldsArray;

}