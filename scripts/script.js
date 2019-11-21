// Namespace Object
const app = {};

// All of the recipes retrieved from the API
app.recipesArray = [];

// API details
app.baseUrl = "https://www.themealdb.com/api/json/v1/1/";
app.randomMealEndpoint = "random.php";

// Function: Get Random Meals
// Retrieves 5 meals from TheMealDB API
app.getRandomMeals = function () {

  // Save 5 different API Promises
  recipesArray = [];
  for (let i = 0; i < 5; i++) {
    const randomRecipe = $.ajax({
      url: app.baseUrl + app.randomMealEndpoint,
      method: 'GET',
      dataType: 'json'
    });
    recipesArray.push(randomRecipe);
  }

  // When all 5 Promises are fulfilled, take out the information we need to use and save it to the global scope
  $.when(...recipesArray)
    .then((...retreivedRecipes) => {
      retreivedRecipes.forEach(recipe => {
        const recipeObject = recipe[0].meals[0];
        const meal = {
          name: recipeObject.strMeal,
          picture: recipeObject.strMealThumb
        };
        app.recipesArray.push(meal);
        // Take the names and put it into the DOM
        $('#randomRecipes').append(`<li><button>${recipeObject.strMeal}</button></li>`);
      });
      app.appendImage();
    })
    .catch(error => console.log(error));
}

// Function: appendImage
// Call the info for first picture and append onto the DOM
app.appendImage = () => {
  $('.winningRecipeImage').append(`<img src="${app.recipesArray[0].picture}">`);
};

// Function: randomRecipeList
// shuffled the array recipe list
app.randomRecipeList = () => {
  const originalArray = app.recipesArray;
  const shuffledRecipeList = ([...originalArray]) => {
    let arrayLength = originalArray.length;
    while (arrayLength) {
      const i = Math.floor(Math.random() * arrayLength--);
      [originalArray[arrayLength], originalArray[i]] = [originalArray[i], originalArray[arrayLength]];
    }
    return originalArray;
  }
  shuffledRecipeList(originalArray);
}

app.randomRecipeList();

// Function: Init
app.init = function () {
  app.getRandomMeals();
}

// Function: Document Ready
$(function () {
  app.init();
});