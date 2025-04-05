import Monster from './Monster.js';
import throttle from './throttle.js';
import Clock from './Clock.js';

const monsterSprites = [
    ["monsters/green-1.png", "monsters/green-2.png", "monsters/green-3.png"],
    ["monsters/pink-1.png", "monsters/pink-2.png", "monsters/pink-3.png"],
    ["monsters/blue-1.png", "monsters/blue-2.png", "monsters/blue-3.png"],
    ["monsters/yellow-1.png", "monsters/yellow-2.png", "monsters/yellow-3.png"],
    ["monsters/orange-1.png", "monsters/orange-2.png", "monsters/orange-3.png"],
    ["monsters/neon-1.png", "monsters/neon-2.png", "monsters/neon-3.png"],
    ["monsters/cyan-1.png", "monsters/cyan-2.png", "monsters/cyan-3.png"],

]

const monsterSounds = [
    "./monsters/green.mp3",
    "./monsters/pink.mp3",
    "./monsters/blue.mp3",
    "./monsters/yellow.mp3",
    "./monsters/orange.mp3",
    "./monsters/neon.mp3",
    "./monsters/cyan.mp3",
]

// Game objects that hold the game state and settings 
const game = {
    // game setting defa
    difficulty: 3,
    monsterCircleRadius: 200,
    monsterDiameter: "200px",
    clockInterval: 500,

    // Game state variables
    monsters: [],
    sequence: [],
    userSequence: [],
    playingSequence: false,
    running: false,
    credits: false,
    help: false,
    highscore: 0,
    nextStepSubscription: null,
    translations: {},
    clock: null,

    // Game html elements
    monsterContainer: null,
    gameArea: null,
    highScoreElement: null,
}

// Button html elements
const bt =  {
    startButton: null,
    pauseButton: null,
    replayButton: null,
    difficultyOptions: null,
    languageOptions: null,
    creditsButton: null,
    helpButton: null,
}

// Overlay html elements
const overlays = {
    credits: null,
    help: null,
}


// Game state change functions

function startGame() {
    // Handle startbutton state
    bt.startButton.setAttribute("trans", "stop-button");
    bt.startButton.textContent = game.translations["stop-button"];
    bt.startButton.setAttribute("col", "red");
    
    // Reset game state
    game.sequence = [];
    game.userSequence = [];
    game.playingSequence = false;
    game.running = true;

    // Reset game graphics and overlays
    game.gameArea.setAttribute("col", "playing");
    game.help && helpScreen();
    game.credits && creditScreen();

    // Start the game loop
    gameLoop();
}

function stopGame() {
    // Handle startbutton state
    bt.replayButton.disabled = true;
    bt.startButton.setAttribute("trans", "start-button");
    bt.startButton.textContent = game.translations["start-button"];
    bt.startButton.setAttribute("col", "green");

    // Reset game state
    game.running = false;
    game.playingSequence = false;
    game.sequence = [];
    game.userSequence = [];

    // Reset game graphics
    game.gameArea.setAttribute("col", "notplaying");

    // Remove sequence animation subscription from clock
    if (game.nextStepSubscription) {
        game.clock.unsubscribe(game.nextStepSubscription);
        game.nextStepSubscription = null;
    }
}

function pauseGame() {
    bt.pauseButton.setAttribute("trans", "continue-button");
    bt.pauseButton.setAttribute("col", "green");
    bt.pauseButton.textContent = game.translations["continue-button"];
    game.clock.stop();
}

function continueGame() {
    bt.pauseButton.setAttribute("trans", "pause-button");
    bt.pauseButton.setAttribute("col", "red");
    bt.pauseButton.textContent = game.translations["pause-button"];
    game.clock.start();
}


// Game button functions

function startButton() {
    if (game.running) {
        stopGame();
    } else {
        startGame();
    }
}
window.startButton = startButton;

function pauseButton() {
    if (game.clock.on) {
        pauseGame();
    } else {
        continueGame();
    }
}
window.pauseButton = pauseButton;

// When difficulty is changed, stop the game and arrange the monsters again
function difficultyChange() {
    const difSetting = bt.difficultyOptions.value;
    switch (difSetting) {
        case "easy":
            game.difficulty = 3;
            break;
        case "medium":
            game.difficulty = 5;
            break;
        case "hard":
            game.difficulty = 7;
            break;
        default:
            console.error("Invalid difficulty setting");
    }
    stopGame();
    arrangeMonsters();
}
window.difficultyChange = difficultyChange;

function languageChange() {
    const langSetting = bt.languageOptions.value;
    
    // Fetch the language file based on the selected language
    const langFile = `./lang/${langSetting}.json`;
    fetch(langFile)
        .then(response => response.json())
        .then(translations => {
            // Store the translations in the game object
            game.translations = translations;
            // update the text elements with the new language data
            document.querySelectorAll("[trans]").forEach((element) => {
                const key = element.getAttribute("trans");
                element.textContent = translations[key] || element.textContent;
            })
        })
        .catch(error => console.error('Error loading language file:', error));
}
window.languageChange = languageChange;

function replaySequence() {
    // Stop the current sequence and replay it
    game.nextStepSubscription && game.clock.unsubscribe(game.nextStepSubscription);
    game.nextStepSubscription = null;
    playSequence();
}
window.replaySequence = replaySequence;


// Game screen functions

function creditScreen() {
    if (!game.credits) {
        // Show the credits overlay
        overlays.credits.style.display = "flex";
        game.credits = true;
        game.clock.stop();
    } else {
        // Hide the credits overlay
        overlays.credits.style.display = "none";
        game.credits = false;
        game.clock.start();
    }
}
window.creditScreen = creditScreen;

function helpScreen() {
    if (!game.help) {
        // Show the help overlay
        overlays.help.style.display = "flex";
        game.help = true;
        game.clock.stop();
    } else {
        // Hide the help overlay
        overlays.help.style.display = "none";
        game.help = false;
        game.clock.start();
    }
}
window.helpScreen = helpScreen;


// Monster handling functions

function addMonster(idx, diameter) {
    // Add a new monster based on the circle index and monster
    const newMon = new Monster(monsterSprites[idx], monsterSounds[idx], idx, diameter, game.monsterContainer, game.clock.interval);
    game.clock.subscribe(newMon.animate.bind(newMon));
    return newMon;
}

function arrangeMonsters() {
    // Clear existing monsters
    game.monsters.forEach(monster => {
        monster.element.remove();
        game.clock.unsubscribe(monster.animate.bind(monster));
    });
    game.monsters = [];

    // Add new monsters based on the difficulty level
    for (let i = 0; i < game.difficulty; i++) {
        game.monsters.push(addMonster(i, game.monsterDiameter));
    }
    const {monsters, monsterContainer} = game;

    // Calculate the center of the monsterCircle
    const centerX = monsterContainer.clientWidth / 2;
    const centerY = monsterContainer.clientHeight / 2;

    // Change monster diameter based on the number of monsters and the monstecontainer size
    const monsterDiameter = `${Math.min(monsterContainer.clientWidth, monsterContainer.clientHeight) / (monsters.length + 1)}px`;
    game.monsterDiameter = monsterDiameter;

    // Change the monsterCircleRadius based on the number of monsters and the monsterContainer size
    const monsterCircleRadius = Math.min(monsterContainer.clientWidth, monsterContainer.clientHeight) / 2 - parseInt(monsterDiameter);
    game.monsterCircleRadius = monsterCircleRadius;

    // Calculate the angle step (angle difference between monsters) based on the number of monsters
    const angleStep = (2 * Math.PI) / monsters.length;

    // Position each monster on the circle
    monsters.forEach((monster, index) => {
        monster.changeDiameter(monsterDiameter);
        const angle = index * angleStep;
        monster.positionOnCircle(centerX, centerY, monsterCircleRadius, angle);
    });
}

function monsterClick(monster) {
    // Add the clicked monster to the the quessed sequence and display its animation
    game.userSequence.push(monster.idx);
    monster.burb(true);

    // If the sequence is complete, check if the user sequence is correct
    if (game.userSequence.length >= game.sequence.length) {
        // Check if the user sequence is correct
        const isCorrect = game.userSequence.every((idx, index) => idx === game.sequence[index]);
        game.userSequence = [];
        if (isCorrect) {
            // Update graphics
            flashBackground("flash-correct");
            updateHighscore(game.sequence.length);
            
            // Wait for a second before starting the next sequence
            setTimeout(() => {
                game.gameArea.setAttribute("col", "playing");;
                gameLoop();
            }, 1000);
        } else {
            // Handle ending the game and showing that sequence is incorrect
            stopGame();
            flashBackground("flash-incorrect");
            setTimeout(() => {
                game.gameArea.setAttribute("col", "notplaying");;
            }, 1000);
            updateHighscore(game.sequence.length);
        }
    }
}

// Game event functions

function updateHighscore(score) {
    game.highscore = Math.max(game.highscore, score);
    game.highScoreElement.textContent = `${score}/${game.highscore}`;
}

function flashBackground(colorClass) {
    // Display a flash animation on the game area background
    game.gameArea.classList.remove('flash-correct', 'flash-incorrect');
    void game.gameArea.offsetWidth; // Trigger reflow to restart animation
    game.gameArea.classList.add(colorClass);
    game.gameArea.addEventListener('animationend', () => {
        game.gameArea.classList.remove(colorClass);
    }, { once: true });
}

function playSequence() {
    // function that is called by the clock to animate the next step in the sequence
    function animateNextStep() {
        if (!game.running) {return;}
        if (i >= game.sequence.length) {
            game.clock.unsubscribe(animateNextStep);
            game.nextStepSubscription = null;
            game.playingSequence = false;
            bt.replayButton.disabled = false;
            return;
        }
        step++;
        step = step % 2;
        if (step !== 0) {
            return;
        }
        const monster= game.monsters[game.sequence[i]];
        monster.burb();
        i++;
    }
    let i = 0; // Sequence index
    let step = 0; // Step index for animation (to skip every other frame)

    game.playingSequence = true;
    bt.replayButton.disabled = true;

    // Add the animation function to the clock (Priority -1 to run before the monster animation)
    game.nextStepSubscription = game.clock.subscribe(animateNextStep, -1); 
}

function gameLoop() {
    // Game loop calculates next monster in sequence and displays the sequence of monsters
    game.sequence.push(Math.floor(Math.random() * game.difficulty));
    playSequence();
}


// Initialize the game when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {

    // Adding monsters and monster state objects
    game.monsterContainer = document.getElementById("monster-container");
    game.clock = new Clock(game.clockInterval);
    arrangeMonsters();
    game.monsterContainer.addEventListener("click", (event) => {
        if (!game.playingSequence && event.target && event.target.className === "monster") {
            const monster = game.monsters.find(m => m.element === event.target);
            if (monster) {
                monsterClick(monster);
            }
        }
    });

    // Game elements
    game.highScoreElement = document.getElementById("highscore");
    game.gameArea = document.getElementById("game-area"),

    // Overlay elements
    overlays.credits = document.getElementById("credit-overlay");
    overlays.help = document.getElementById("help-overlay");

    // Button elements
    bt.replayButton = document.getElementById("replay-sequence"),
    bt.startButton = document.getElementById("start-button"),
    bt.pauseButton = document.getElementById("pause-button"),
    bt.creditsButton = document.getElementById("credits-button"),
    bt.helpButton = document.getElementById("help-button"),
    bt.difficultyOptions = document.getElementById("difficulty-options"),
    bt.languageOptions = document.getElementById("language-options"),

    // Trigger language change to remove default text
    languageChange();

    // Start the game clock that handles the monster animation
    game.clock.start();
});

// Window resize event to adjust monster positions and sizes
// This function is throttled to avoid excessive calls during resize events
window.addEventListener('resize', throttle(function() {
    arrangeMonsters();
}, 200)); 



