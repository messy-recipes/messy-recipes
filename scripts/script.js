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
        <button data-name="${recipe.strMeal}" class="recipe-button" disabled>
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
      <button class="button second-screen__winner-button" id="winnerButton" disabled>Continue</button>
    </div>
  `;
  
  const wrongElement = `
    <div class="second-screen__popup">
      <h2>Incorrect!</h2>
      <p>Hint: It is a ${origin} dish.</p>
      <button class="button second-screen__loser-button" id="loserButton" disabled>Try again</button>
    </div>
  `;

  // Check the recipe name that was clicked against the winning recipe name
  if (recipeClicked === winningRecipe) {
    // Show the winning popup element
    app.$secondScreen.after($(winningElement));

    // Enable the [CONTINUE] button
    $('#winnerButton').attr('disabled', false);

    $('#winnerButton').on('click', function() {
      $('.second-screen__popup').addClass('remove');
      app.$secondScreen.removeClass('complete');
      app.$secondScreen.addClass('screen-two-move-up');
      app.$endScreen.addClass('complete');
      app.$randomList.removeClass('active');
      app.addLinks();

      // Disable the winner button, and enable the next screen's focusable elements
      $(this).attr('disabled', true);
      $('.endScreenLinks').attr('tabIndex', 1);
      app.$playAgain.attr('disabled', false);
    });
  } else {
    // Show the wrong popup
    app.$secondScreen.after($(wrongElement));

    // Enable the loser button to be clicked
    $('#loserButton').attr('disabled', false);

    $('#loserButton').on('click', function () {
      app.$randomList.removeClass('active');
      $('.second-screen__popup').slideUp(1000);

      // Disable this button, and allow the recipe names to be clicked
      $(this).attr('disabled', true);
      $('.recipe-button').attr('disabled', false);
    });
  }
}

// Function Add Links
// Added list items that are external links to youtube 
app.addLinks = () => {
  const youtube = app.currentRecipes[0].strYoutube;
  const source = app.currentRecipes[0].strSource;
  const linkElements = `
    <li><a href="${youtube}" class="endScreenLinks recipe-external-link" tabIndex="-1">YouTube Link</a></li>
    <li><a href="${source}" class="endScreenLinks recipe-external-link" tabIndex="-1">Recipe Link</a></li>
  `;
  $('#externalLinks').html(linkElements);
}

// Function: Init
app.init = function () {
  // Caching selectors
  app.$startbutton = $('#startButton');
  app.$playAgain = $('#playAgain');
  app.$randomList = $('#randomRecipes');
  app.$secondScreen = $('#secondScreen');
  app.$endScreen = $('#endScreen');
  app.getRandomMeals();

  // On click for start button
  app.$startbutton.on('click', function () {
    $('#firstScreen').addClass('complete');
    app.$secondScreen.addClass('complete');
    
    // Disable this button, allow the recipe name elements to be clicked
    $(this).attr('disabled', true);
    $('.recipe-button').attr('disabled', false);
  });

  // On click button for play again button  
  app.$playAgain.on('click', function() {
    // Disable this button and the anchor tags, enable the start button to be clicked
    $(this).attr('disabled', true);
    $('.endScreenLinks').attr('tabIndex', -1);
    app.$startbutton.attr('disabled', false);

    app.getRandomMeals();
    $('#firstScreen').removeClass('complete');
    app.$secondScreen.removeClass('screen-two-move-up');
    app.$endScreen.removeClass('complete');
  })
}

// Function: Document Ready
$(function () {
  app.init();
});