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
          picture: recipeObject.strMealThumb,
          origin: recipeObject.strArea,
          // ...added youTube
          youtube: recipeObject.strYoutube,
          // ... added recipe link
          source: recipeObject.strSource
        };
        app.recipesArray.push(meal);
      });

      if (!app.checkDuplicateRecipes(app.recipesArray)) {
        app.appendImage();
        app.randomRecipeList();
      } else {
        app.getRandomMeals();
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
  // Grab the recipe name that was clicked and the winning recipe name
  const recipeClicked = $(this).data('name');
  const winningRecipe = app.recipesArray[0].name;
  const origin = app.recipesArray[0].origin;

  // Disable the other recipe name buttons
  app.$randomList.addClass('active');

  // Create popup elements for each scenario
  const winningElement = `
    <div class="second-screen__popup">
      <h2>Correct!</h2>
      <p>The recipe is ${winningRecipe}</p>
      <button class="button second-screen__winner-button" id="winnerButton">Continue</button>
    </div>
  `;
  
  const wrongElement = `
    <div class="second-screen__popup">
      <h2>Incorrect!</h2>
      <p>Hint: It is a ${origin} dish.</p>
      <button class="button second-screen__loser-button" id="loserButton">Try again</button>
    </div>
  `;

  if (recipeClicked === winningRecipe) {
    app.$secondScreen.after($(winningElement));

    $('#winnerButton').on('click', function() {
      $('.second-screen__popup').addClass('remove');
      // ... should move the second screen to -200vh instead
      app.$secondScreen.addClass('screen-two-move-up');
      // ... did end screen
      app.$endScreen.addClass('complete')
      // ... added append source
      app.appendLinks();
    });
  } else {
    
    app.$secondScreen.after($(wrongElement));

    $('#loserButton').on('click', function() {
      app.$randomList.removeClass('active');
      $('.second-screen__popup').slideUp(1000);
    });
  }
}

// ... added the external links
// ... function appendLinks
// ... added list items that are external links to youtube 
app.appendLinks = () => {
  const youtube = app.recipesArray[0].youtube;
  const source = app.recipesArray[0].source;
  $('#externalLinks').append(`<li><a href="${youtube}">YouTube Link</a></li>`);
  $('#externalLinks').append(`<li><a href="${source}">Recipe Link</a></li>`);
}

// Function: Init
app.init = function () {
  // Caching selectors
  app.$randomList = $('#randomRecipes');
  app.$secondScreen = $('#secondScreen');
  // ... added end screen
  app.$endScreen = $('#endScreen');
  app.getRandomMeals();
  // on click for start button
  $('#startButton').on('click', function () {
    $('#firstScreen').addClass('complete');
    app.$secondScreen.addClass('complete');
  });
}

// Function: Document Ready
$(function () {
  app.init();
});