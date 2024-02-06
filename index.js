let currentPage = null;

let debouncedSetLights = debounce(setLights, 300); // Adjust delay as needed

document.addEventListener('DOMContentLoaded', function () {
  currentPage = localStorage.getItem('password') ? document.getElementById('buttonsPage') : document.getElementById('loginPage');
  showPage(currentPage.id);

  // Add event listener to login form
  var loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var password = document.getElementById('password').value;
    localStorage.setItem('password', password);
    showPage('buttonsPage');
  });

  // Load Pokemon Page
  loadPokemonSprites();
  document.getElementById('searchBar').addEventListener('input', filterPokemon);

  // Add event listeners to navigation buttons
  var buttons = document.querySelectorAll('.nav-item');
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      // Reset color for all buttons
      buttons.forEach(function (otherButton) {
        otherButton.classList.remove('active');
      });

      // Set the clicked button to active
      this.classList.add('active');

      var pageId = this.getAttribute('data-page');
      showPage(pageId);
    });
  });

  // Initialize the iro.js color picker with color wheel and darkness slider
  var colorPicker = new iro.ColorPicker('#colorControls', {
    width: 300,
    borderWidth: 1,
    borderColor: '#fff',
    layout: [{
        component: iro.ui.Wheel
      },
      {
        component: iro.ui.Slider,
        options: {
          sliderType: 'value'
        }
      }
    ],
    color: "#ff0000" // Default color
  });

  // Event listener for color changes


  colorPicker.on('color:change', function (color) {
    // Update the input field with the selected color in HEX format
    document.getElementById('colorPicker').value = color.hexString;
    // Make an API call to set the lights
    debouncedSetLights(color.rgb.r, color.rgb.g, color.rgb.b);
  });

  // Event listener for darkness slider changes
  colorPicker.on('input:change', function (color) {
    // Check if color object is defined
    if (color && color._color && typeof color._color.v !== 'undefined') {
      // Synchronize the darkness slider with the color wheel
      var brightness = 1 - color._color.v; // Invert the darkness value
      colorPicker.color.set({
        v: brightness
      }); // Set the brightness value
    }
  });

  // Show login page if password is not stored
  if (localStorage.getItem('password') == null) {
    showLoginPage();
  }
});

function setLights(r, g, b) {
  // Update the apiUrl with the new API endpoint and IP address
  var apiUrl = `https://bennettolsen.us:5000/set_lights?password=${localStorage.getItem('password')}&r=${r}&g=${g}&b=${b}`;

  // Send a GET request to the updated API endpoint
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.text();
    })
    .then(result => {
      console.log(result);
    })
    .catch(error => {
      console.error(error);
      alert(`Error executing Set Lights script: ${error.message}`);
    });
}

function debounce(func, delay) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      func.apply(context, args);
    }, delay);
  };
}

function showPage(pageId) {
  var pages = document.querySelectorAll('[id$="Page"]');

  pages.forEach(function (page) {
    page.style.display = (page.id === pageId) ? 'flex' : 'none';
  });

  var navbar = document.getElementById('navbar');
  navbar.style.display = (pageId === 'loginPage') ? 'none' : 'flex';
}

function runScript(scriptName) {
  // Update the apiUrl with the new API endpoint and IP address
  let apiUrl = `https://bennettolsen.us:5000/${scriptName}?password=${localStorage.getItem('password')}`;

  if(scriptName == "warm") {
    apiUrl = `https://bennettolsen.us:5000/set_lights?password=${localStorage.getItem('password')}&r=224&g=233&b=40`;
  }

  // Send a GET request to the updated API endpoint
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.text();
    })
    .then(result => {
      console.log(result);
    })
    .catch(error => {
      console.error(error);
      alert(`Error executing ${scriptName} script: ${error.message}`);
    });
}

function showLoginPage() {
  // Show the login page and hide other content
  document.getElementById('navbar').style.display = 'none';
  var pages = document.querySelectorAll('[id$="Page"]');
  pages.forEach(function (page) {
    page.style.display = 'none';
  });

  var loginPage = document.getElementById('loginPage');
  loginPage.style.display = 'block';
}

/////// Pokemon Code

// global variables
let pokemonImgs = null; // Stores all pokemon images
let allPokemonData = []; // New array to store original Pokémon data
let selectedPokemonId = null; // Variable to store the currently selected Pokémon ID


// Function that loads all Pokémon sprites from JSON file and stores them in an object.
async function loadPokemonSprites() {
    const totalPokemon = 1025; 
    const pokedex = document.getElementById("pokedex");

    const promises = [];

    for (let i = 1; i <= totalPokemon; i++) {
        promises.push(getPokemonData(i));
    }

    try {
        const pokemon = await Promise.all(promises);
        allPokemonData = pokemon;
        pokemon.forEach((pokemon, i) => {
            let pokedexEntry = genPokedexEntry(pokemon);
            pokedexEntry.addEventListener('click', () => handlePokemonClick(pokemon.id));
            pokedex.appendChild(pokedexEntry);
        });
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
    }
}

// Filters pokemon based on the search term
function filterPokemon() {
    const searchBar = document.getElementById('searchBar');
    const searchTerm = searchBar.value.toLowerCase();
    const pokedex = document.getElementById('pokedex');

    // Clear pokedex
    while (pokedex.firstChild) {
        pokedex.removeChild(pokedex.firstChild);
    }

    // Filter Pokémon based on the search term
    const filteredPokemon = allPokemonData.filter(pokemon => pokemon.name.startsWith(searchTerm));

    // Display the filtered Pokémon
    filteredPokemon.forEach((pokemon, i) => {
        let pokedexEntry = genPokedexEntry(pokemon);
        pokedexEntry.addEventListener('click', () => handlePokemonClick(pokemon.id));
        pokedex.appendChild(pokedexEntry);
    });
}

// API call to get pokemon data for a specific pokemon
async function getPokemonData(pokemonId) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    const data = await response.json();
    return data;
}

// Generates HTML elements for a single pokedex entry
function genPokedexEntry(pokemon) {
    // grid_item
    let pokedexEntry = document.createElement('div');
    pokedexEntry.classList.add("grid_item");
    pokedexEntry.setAttribute('id',pokemon.id);

    // card
    let card = document.createElement('div');
    card.classList.add("card");

    // card_img
    let pokemonImg = document.createElement('img');
    pokemonImg.src = pokemon.sprites.front_default;

    // card_content
    let cardContent = document.createElement('div');
    cardContent.classList.add("card_content");

    // card_text
    let pokemonName = document.createElement('p');
    pokemonName.innerHTML = capitalizeFirstLetter(pokemon.name);
    pokemonName.classList.add("card_text");

    // Append content
    cardContent.appendChild(pokemonName);

    card.appendChild(pokemonImg);
    card.appendChild(cardContent);

    pokedexEntry.appendChild(card);

    return pokedexEntry;
}

// Helper function to capitalize first letter of a string
function capitalizeFirstLetter(string) {
    return string.replace(/\b\w/g, (char) => char.toUpperCase());
}


function handlePokemonClick(id) {
    // Remove the highlight from the previously selected Pokémon button
    highlightSelectedPokemon(null);

    // Read the color information from the pokemonColors.json file
    fetch('pokemonColors.json')
        .then(response => response.json())
        .then(pokemonColors => {
            // Get the color information for the clicked Pokémon ID
            const colors = pokemonColors[id].map(color => color.replace('#', ''));

            const apiUrl = `https://bennettolsen.us:5000/set_colors?password=candycane72&color1=${colors[0]}&color2=${colors[1]}&color3=${colors[2]}`;
            console.log(apiUrl);
            fetch(apiUrl)
                .then(apiResponse => {
                    if (!apiResponse.ok) {
                        throw new Error(`API request failed with status: ${apiResponse.status}`);
                    }
                    return apiResponse.text();
                })
                .then(responseText => {
                    console.log(responseText); // Log the response from the server
                })
                .catch(error => {
                    console.error('Error making API request:', error);
                });

            // Highlight the clicked Pokémon button
            highlightSelectedPokemon(id);
        })
        .catch(error => {
            console.error('Error reading pokemonColors.json:', error);
        });
}

function chooseRandomPokemon() {
    const pokedex = document.getElementById('pokedex');
    
    // Clear existing Pokémon entries
    while (pokedex.firstChild) {
        pokedex.removeChild(pokedex.firstChild);
    }

    // Choose a random Pokémon from the original data
    const randomIndex = Math.floor(Math.random() * allPokemonData.length);
    const randomPokemon = allPokemonData[randomIndex];

    // Display the randomly chosen Pokémon
    let pokedexEntry = genPokedexEntry(randomPokemon);
    pokedexEntry.addEventListener('click', () => handlePokemonClick(randomPokemon.id));
    pokedex.appendChild(pokedexEntry);
    
    // Scroll to the selected Pokémon
    pokedexEntry.scrollIntoView({ behavior: 'smooth' });

    // Update the search bar value
    document.getElementById('searchBar').value = ''; // Clear the search bar

    // Highlight the selected Pokémon button
    highlightSelectedPokemon(randomPokemon.id);
}

function highlightSelectedPokemon(pokemonId) {
    // Remove the highlight from the previously selected Pokémon button
    if (selectedPokemonId !== null) {
        const prevSelectedButton = document.getElementById(selectedPokemonId);
        if (prevSelectedButton) {
            prevSelectedButton.style.backgroundColor = ''; // Remove the background color
        }
    }

    // Highlight the current selected Pokémon button
    const selectedButton = document.getElementById(pokemonId);
    if (selectedButton) {
        selectedButton.style.backgroundColor = '#ffcccb'; // Set the background color as desired
        selectedPokemonId = pokemonId; // Update the selected Pokémon ID
    }
}