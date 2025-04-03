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

const game = {
    monsters: [],
    monsterContainer: null,
    difficulty: 3,
    monsterCircleRadius: 200,
    monsterDiameter: "200px",
    clock: null,
    sequence: [],
    clockInterval: 500,
    userSequence: [],
    playingSequence: false,
    running: false,
    credits: false,
    help: false,
    highscore: 0,
}

function startButton() {
    game.running = true;
    // Change backgorund of the game-area to white
    const gameArea = document.getElementById("game-area");
    gameArea.style.backgroundColor = "white";
    gameLoop();
}
window.startButton = startButton;

function stopButton() {
    const button = document.getElementById("stop-button");
    if (game.clock.on) {
        button.textContent = "Continue";
        game.clock.stop();
    } else {
        button.textContent = "Stop game";
        game.clock.start();
    }
}
window.stopButton = stopButton;

function difficultyChange() {
    const difSetting = document.getElementById("difficulty-options").value;
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
    arrangeMonsters();

    // Restart the game if it's already running
    if (game.running) {
        game.sequence = [];
        game.userSequence = [];
        game.playingSequence = false;
        gameLoop();
    }
}
window.difficultyChange = difficultyChange;

function languageChange() {
    // get the selected language from the dropdown
    const langSetting = document.getElementById("language-options").value;
    // open the language file
    const langFile = `./lang/${langSetting}.json`;
    fetch(langFile)
        .then(response => response.json())
        .then(translations => {
            // update the text elements with the new language data
            document.querySelectorAll("[trans]").forEach((element) => {
                //change the text of the element to the new language
                const key = element.getAttribute("trans");
                element.textContent = translations[key] || element.textContent;
            })
        })
        .catch(error => console.error('Error loading language file:', error));
}
window.languageChange = languageChange;

function creditScreen() {
    const credits = document.getElementById("credit-overlay");
    if (!game.credits) {
        // Show the credits overlay
        credits.style.display = "flex";
        game.credits = true;
        game.clock.stop();
    } else {
        // Hide the credits overlay
        credits.style.display = "none";
        game.credits = false;
        game.clock.start();
    }
}
window.creditScreen = creditScreen;

function helpScreen() {
    const help = document.getElementById("help-overlay");
    if (!game.help) {
        // Show the credits overlay
        help.style.display = "flex";
        game.help = true;
        game.clock.stop();
    } else {
        // Hide the credits overlay
        help.style.display = "none";
        game.help = false;
        game.clock.start();
    }
}
window.helpScreen = helpScreen;


function addMonster(idx, diameter) {
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
    game.monsterContainer = document.getElementById("monster-container");
    for (let i = 0; i < game.difficulty; i++) {
        game.monsters.push(addMonster(i, game.monsterDiameter));
    }
    const {monsters, monsterContainer} = game;
    const centerX = monsterContainer.clientWidth / 2;
    const centerY = monsterContainer.clientHeight / 2;

    // Change monster diameter based on the number of monsters and the monstecontainer size
    const monsterDiameter = `${Math.min(monsterContainer.clientWidth, monsterContainer.clientHeight) / (monsters.length + 1)}px`;
    game.monsterDiameter = monsterDiameter;

    // Change the monsterCircleRadius based on the number of monsters and the monsterContainer size
    const monsterCircleRadius = Math.min(monsterContainer.clientWidth, monsterContainer.clientHeight) / 2 - parseInt(monsterDiameter);
    game.monsterCircleRadius = monsterCircleRadius;

    const angleStep = (2 * Math.PI) / monsters.length;

    monsters.forEach((monster, index) => {
        monster.changeDiameter(monsterDiameter);
        const angle = index * angleStep;
        monster.positionOnCircle(centerX, centerY, monsterCircleRadius, angle);
    });
}

function updateHighscore(score) {
    game.highscore = Math.max(game.highscore, score);
    const highscoreElement = document.getElementById("highscore");
    highscoreElement.textContent = `Score: ${score}/${game.highscore}`;
}

function playSequence(callback) {
    let i = 0;
    let now = 0;

    function animateNextStep() {
        console.log("next up", game.sequence[i]);
        if (i >= game.sequence.length) {
            game.clock.unsubscribe(animateNextStep);
            if (callback)  callback();
            return;
        }
        now++;
        now = now % 2;
        if (now !== 0) {
            return;
        }
        // Animate the next step in the sequence
        const monster= game.monsters[game.sequence[i]];

        monster.burb();
        i++;
    }

    // Calculate next item in sequence
    game.sequence.push(Math.floor(Math.random() * game.difficulty));


    // 
    game.clock.subscribe(animateNextStep, -1);
}

function monsterClick(monster) {
    game.userSequence.push(monster.idx);
    monster.burb(true);
    if (game.userSequence.length >= game.sequence.length) {
        // Check if the user sequence is correct
        const isCorrect = game.userSequence.every((idx, index) => idx === game.sequence[index]);
        game.userSequence = [];
        if (isCorrect) {
            // set background color to light green
            const gameArea = document.getElementById("game-area");
            gameArea.style.backgroundColor = "lightgreen";
            updateHighscore(game.sequence.length);
            // wait for a short time before playing the next sequence
            setTimeout(() => {
                gameArea.style.backgroundColor = "white";
                gameLoop();
            }, 1000);
        } else {
            game.running = false;
            // set background color to pink
            const gameArea = document.getElementById("game-area");
            gameArea.style.backgroundColor = "pink";
            setTimeout(() => {
                gameArea.style.backgroundColor = "";
            }, 1000);
            // Update highscore and go to game start screen
            updateHighscore(game.sequence.length);
            game.sequence = [];
            game.playingSequence = false;
        }
    }
}

function gameLoop() {
    
    // Play sequence asynchronously and wait for sequence to finish
    game.playingSequence = true;
    playSequence( () => {
        game.playingSequence = false;
    });
}

document.addEventListener("DOMContentLoaded", () => {

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

    // Start game clock and game loop
    game.clock.start();
});

window.addEventListener('resize', throttle(function() {
    arrangeMonsters();
}, 200)); 



