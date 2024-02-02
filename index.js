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

// Function to fetch Pokémon data
async function getPokemonData(pokemonId) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
  const data = await response.json();
  return data;
}

// Function to load Pokémon sprites on the website
async function loadPokemonSprites() {
  const totalPokemon = 1025; // You can change this to the total number of Pokémon
  const pokedex = document.getElementById("pokedex");

  const promises = [];

  for (let i = 1; i <= totalPokemon; i++) {
    promises.push(getPokemonData(i));
  }

  try {
    const pokemon = await Promise.all(promises);

    // Once all promises are resolved, update the DOM
    pokemon.forEach((pokemon, i) => {
      let pokedexEntry = genPokedexEntry(pokemon);
      pokedexEntry.addEventListener('click', () => handlePokemonClick(pokemon.id));
      pokedex.appendChild(pokedexEntry);
    });
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
  }
}

function genPokedexEntry(pokemon) {
  let pokedexEntry = document.createElement('div');
  pokedexEntry.classList.add("card");
  let pokemonImg = document.createElement('img');
  pokemonImg.src = pokemon.sprites.front_default;
  let pokemonName = document.createElement('p');
  pokemonName.innerHTML = capitalizeFirstLetter(pokemon.name);

  let colorBox1 = document.createElement('div');
  //colorBox1.body.style = 
  let colorBox2 = document.createElement('div');
  let colorBox3 = document.createElement('div');

  pokedexEntry.appendChild(pokemonImg);
  pokedexEntry.appendChild(pokemonName);
  return pokedexEntry;
}

function capitalizeFirstLetter(string) {
  return string.replace(/\b\w/g, (char) => char.toUpperCase());
}

function handlePokemonClick(id) {
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

      // Set the background colors of divs color1, color2, and color3
      let div = document.getElementById("color1");
      div.style.backgroundColor = "#" + colors[0];

      div = document.getElementById("color2");
      div.style.backgroundColor = "#" + colors[1];

      div = document.getElementById("color3");
      div.style.backgroundColor = "#" + colors[2];
    })
    .catch(error => {
      console.error('Error reading pokemonColors.json:', error);
    });
}