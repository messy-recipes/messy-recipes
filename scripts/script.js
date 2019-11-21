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

  // Function: Check Duplicate Recipes
  // returns true if there are duplicates that exist
  app.checkDuplicateRecipes = (recipesArray) => new Set(recipesArray).size !== recipesArray.length;

  // Save 5 different API Promises
  recipePromises = [];
  for (let i = 0; i < 5; i++) {
    const randomRecipe = $.ajax({
      url: app.baseUrl + app.randomMealEndpoint,
      method: 'GET',
      dataType: 'json'
    });
    recipePromises.push(randomRecipe);
  }

  // When all 5 Promises are fulfilled, take out the information we need to use and save it to the global scope
  $.when(...recipePromises)
    .then((...retreivedRecipes) => {
      retreivedRecipes.forEach(recipe => {
        const recipeObject = recipe[0].meals[0];
        const meal = {
          name: recipeObject.strMeal,
          picture: recipeObject.strMealThumb
        };
        
        app.recipesArray.push(meal);
      });

      if (!app.checkDuplicateRecipes(app.recipesArray)) {
        console.log('no duplicates');
        app.appendImage();
        app.randomRecipeList();
      } else {
        app.getRandomMeals();
        console.log('duplicates');
      }

    })
    .catch(error => console.log(error));
}

// Function: appendImage
// Call the info for first picture and append onto the DOM
app.appendImage = () => {
  $('.winningRecipeImage').append(`<img src="${app.recipesArray[0].picture}">`);
};

// Function: shuffle array
// takes an array and shuffles it
app.shuffleArray = ([...originalArray]) => {
  let arrayLength = originalArray.length;
  while (arrayLength) {
    const i = Math.floor(Math.random() * arrayLength--);
    [originalArray[arrayLength], originalArray[i]] = [originalArray[i], originalArray[arrayLength]];
  }
  return originalArray;
}

// Function: randomRecipeList
// shuffled the array recipe list and put it on DOM
app.randomRecipeList = () => {
  const originalArray = app.recipesArray;
  const recipeNameElement = originalArray.map(recipe => {
    return `
      <li>
        <button data-name="${recipe.name}" class="recipe-button">
          ${recipe.name}
        </button>
      </li>
      `
    });

  const shuffledArray = app.shuffleArray(recipeNameElement);
  $('#randomRecipes').html(shuffledArray);

  // Listen for a click on one of the recipe names
  $('.recipe-button').on('click', app.recipeNameCheck);
}

// Function: Recipe name check
// Check if the button that was clicked was the winning recipe
app.recipeNameCheck = function() {
  const recipeClicked = $(this).data('name');
  const winningRecipe = app.recipesArray[0].name;

  if (recipeClicked === winningRecipe) {
    console.log('winner');
  } else {
    console.log('loser');
  }
}

// Function: Init
app.init = function () {
  app.getRandomMeals();
}

// Function: Document Ready
$(function () {
  app.init();
});