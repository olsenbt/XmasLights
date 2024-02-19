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

    while (pokedex.firstChild) {
        pokedex.removeChild(pokedex.firstChild);
    }

    const filteredPokemon = allPokemonData.filter(pokemon => pokemon.name.startsWith(searchTerm));

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
    let pokedexEntry = document.createElement('div'); // grid_item
    pokedexEntry.classList.add("grid_item");
    pokedexEntry.setAttribute('id',pokemon.id);

    let card = document.createElement('div'); // card
    card.classList.add("card");

    let pokemonImg = document.createElement('img'); // card_img
    pokemonImg.src = pokemon.sprites.front_default;

    let cardContent = document.createElement('div'); // card_content
    cardContent.classList.add("card_content");

    let pokemonName = document.createElement('p'); // card_text
    pokemonName.innerHTML = capitalizeFirstLetter(pokemon.name);
    pokemonName.classList.add("card_text");

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