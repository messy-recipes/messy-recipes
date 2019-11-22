// Namespace Object
const app = {};

// All of the recipes retrieved from the API
app.allRecipes = [];

app.currentRecipes = [];

// API details
app.baseUrl = "https://www.themealdb.com/api/json/v1/1/";
app.randomMealEndpoint = "random.php";

// Function: Get Random Meals
// Retrieves 10 random meals from TheMealDB API and stores them in the global reipes array
app.getRandomMeals = function() {
  // Check that there are less than 5 meals available to show to the user
  if(app.allRecipes.length < 5) {
    const radomRecipes = $.ajax({
      url: `${appConfig.baseUrl}/${appConfig.apiKey}/${appConfig.randomMeals}`,
      method: 'GET',
      dataType: 'json'
    }).then(response => { 
      // Take the array response and add it to the global recipes array
      app.allRecipes.push(...response.meals);
      app.showRandomMeals();
    }).catch(error => console.log(error));
  } else {
    app.showRandomMeals();
  }
}

// Function: Show Random Meals
// Takes 5 meals from the recipes array
app.showRandomMeals = function() {
  // Take 5 meals out of the global array
  app.currentRecipes = [];
  while (app.currentRecipes.length < 5) {
    const meal = app.allRecipes.shift();
    app.currentRecipes.push(meal);
  }

  app.appendImage();
  app.randomRecipeList();
}

// Function: appendImage
// Call the info for first picture and append onto the DOM
app.appendImage = () => {
  $('.winningRecipeImage').append(`<img src="${app.currentRecipes[0].strMealThumb}">`);
};

// Function: shuffle array
// Takes an array and shuffles it
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
  const originalArray = app.currentRecipes;
  const recipeNameElement = originalArray.map(recipe => {
    return `
      <li>
        <button data-name="${recipe.strMeal}" class="recipe-button">
          ${recipe.strMeal}
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
  const winningRecipe = app.currentRecipes[0].strMeal;
  const origin = app.currentRecipes[0].strArea;

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
      app.$secondScreen.removeClass('complete');
      app.$secondScreen.addClass('screen-two-move-up');
      app.$endScreen.addClass('complete');
      app.$randomList.removeClass('active');
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

// Function appendLinks
// Added list items that are external links to youtube 
app.appendLinks = () => {
  const youtube = app.currentRecipes[0].strYoutube;
  const source = app.currentRecipes[0].strSource;
  $('#externalLinks').append(`<li><a href="${youtube}">YouTube Link</a></li>`);
  $('#externalLinks').append(`<li><a href="${source}">Recipe Link</a></li>`);
}

// Function: Init
app.init = function () {
  // Caching selectors
  app.$randomList = $('#randomRecipes');
  app.$secondScreen = $('#secondScreen');
  app.$endScreen = $('#endScreen');
  app.getRandomMeals();
  // On click for start button
  $('#startButton').on('click', function () {
    $('#firstScreen').addClass('complete');
    app.$secondScreen.addClass('complete');
  });
  // On click button for play again button  
  $('#playAgain').on('click', function() {
    app.getRandomMeals();
    $('#firstScreen').removeClass('complete');
    app.$secondScreen.removeClass('screen-two-move-up');
    app.$endScreen.removeClass('complete')
  })
}

// Function: Document Ready
$(function () {
  app.init();
});