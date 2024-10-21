const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=200&offset=0";
const pokeLimit = 20; // Anzahl der Pokemon die Pro Klick angezeigt werden sollen, immer wieder neu.
let displayedPokemonCount = 0; // der aktuelle Stand immer anzeigen wie viel Pokemon angezeigt sind.
let resultsArray = []; // globale Variable für die Pokemon-Daten
let currentPokemonIndex = 0;

const defaultColors = {
    grass: '#78C850',
    fire: '#F08030',
    water: '#6890F0',
    bug: '#A8B820',
    normal: '#A8A878',
    poison: '#A040A0',
    electric: '#F8D030',
    ground: '#E0C068',
    fairy: '#EE99AC',
    fighting: '#C03028',
    psychic: '#F85888',
    rock: '#B8A038',
    ghost: '#705898',
    ice: '#98D8D8',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    flying: '#A890F0'
};

function onloadFunc() {
    fetchPokemons(BASE_URL);
}

async function fetchPokemons(url) {
    let response = await fetch(url);
    let responseToJson = await response.json();

    resultsArray = responseToJson.results;

    for (let i = 0; i < pokeLimit; i++) {
        const singleCharacter = resultsArray[i];
        let details = await fetchPokemonDetails(singleCharacter.url);
        document.getElementById('content').innerHTML += createPokemonCard(singleCharacter, details);
    }
    displayedPokemonCount += pokeLimit;

    
    addCardEventListeners();
}

async function fetchPokemonDetails(url) {
    let response = await fetch(url);
    let responseToJson = await response.json();
    return responseToJson;
}

function getBackgroundColor(types) {
    for (let i = 0; i < types.length; i++) {
        let type = types[i].type.name;
        if (defaultColors[type]) {
            return defaultColors[type];
        }
    }
    return '#f0f0f0';
}

function createPokemonCard(singleCharacter, details) {
    const types = getPokemonTypes(details.types);
    const backgroundColor = getBackgroundColor(details.types);
    return `
        <div class="pokemon-card" style="background-color: ${backgroundColor}">
            <div class="pokemon-id">#${details.id}</div>
            <div class="pokemon-name">${singleCharacter.name}</div>
            <img src="${details.sprites.front_default}" alt="${singleCharacter.name}">
            <div class="pokemon-types">
                ${types.map(type => `<div class="pokemon-type">${type}</div>`).join('')}
            </div>
        </div>
    `;
}

function getPokemonTypes(types) {
    let typesString = [];
    for (let i = 0; i < types.length; i++) {
        typesString.push(types[i].type.name);
    }
    return typesString;
}

async function buttonNextPokemon() {
    let newStart = displayedPokemonCount;
    let newEnd = Math.min(displayedPokemonCount + pokeLimit, resultsArray.length);

    for (let i = newStart; i < newEnd; i++) {
        const singleCharacter = resultsArray[i];
        let details = await fetchPokemonDetails(singleCharacter.url);
        document.getElementById('content').innerHTML += createPokemonCard(singleCharacter, details);
    }
    displayedPokemonCount = newEnd;

    
    addCardEventListeners();
}

function clickSearch() {
    let searchInput = document.getElementById('idSearch').value.toLowerCase();
    if (searchInput.length > 2) {
        let findContentJson = resultsArray.filter(pokemon => pokemon.name.toLowerCase().includes(searchInput));
        
        document.getElementById('content').innerHTML = '';

        findContentJson.forEach(async (pokemon) => {
            let details = await fetchPokemonDetails(pokemon.url);
            document.getElementById('content').innerHTML += createPokemonCard(pokemon, details);
        });

        
        addCardEventListeners();
    } else {
        console.log('Please enter at least 3 characters.');
    }
}

function addCardEventListeners() {
    const pokemonCards = document.querySelectorAll('.pokemon-card');
    pokemonCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            currentPokemonIndex = index;
            openModal(index);
        });
    });
}

function openModal(index) {
    const pokemon = resultsArray[index];
    fetchPokemonDetails(pokemon.url).then(details => {
        displayPokemonDetails(details);
        document.getElementById('pokemonModal').style.display = 'block';
        document.body.style.overflow = 'hidden'; // scrollen verhindern
    });
}

function closeModal() {
    document.getElementById('pokemonModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // scrollen verhindern
}

function displayPokemonDetails(details) {
    const modalContent = `
        <h2>${details.name}</h2>
        <img src="${details.sprites.front_default}" alt="${details.name}">
        <p>ID: ${details.id}</p>
        <p>HP: ${details.stats[0].base_stat}</p>
        <p>Attack: ${details.stats[1].base_stat}</p>
        <p>Defense: ${details.stats[2].base_stat}</p>
        <p>Type: ${details.types.map(type => type.type.name).join(', ')}</p>
    `;
    document.getElementById('pokemonDetails').innerHTML = modalContent;
}

function showPrevious() {
    if (currentPokemonIndex > 0) {
        currentPokemonIndex--;
        openModal(currentPokemonIndex);
    }
}

function showNext() {
    if (currentPokemonIndex < resultsArray.length - 1) {
        currentPokemonIndex++;
        openModal(currentPokemonIndex);
    }
}
