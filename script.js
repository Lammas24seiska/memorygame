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
    nextStepSubscription: null,
    translations: {},
    gameArea: null,
    highScoreElement: null,
}

const bt =  {
    startButton: null,
    pauseButton: null,
    replayButton: null,
    difficultyOptions: null,
    languageOptions: null,
    creditsButton: null,
    helpButton: null,
}

const overlays = {
    credits: null,
    help: null,
}

function startGame() {
    bt.startButton.setAttribute("trans", "stop-button");
    bt.startButton.textContent = game.translations["stop-button"];
    bt.startButton.setAttribute("col", "red");
    game.sequence = [];
    game.userSequence = [];
    game.playingSequence = false;
    game.gameArea.setAttribute("col", "playing");
    game.help && helpScreen();
    game.credits && creditScreen();
    game.running = true;
    gameLoop();
}

function stopGame() {
    bt.replayButton.disabled = true;
    bt.startButton.setAttribute("trans", "start-button");
    bt.startButton.textContent = game.translations["start-button"];
    bt.startButton.setAttribute("col", "green");
    game.running = false;
    game.playingSequence = false;
    game.sequence = [];
    game.userSequence = [];
    game.gameArea.setAttribute("col", "notplaying");
    if (game.nextStepSubscription) {
        game.clock.unsubscribe(game.nextStepSubscription);
        game.nextStepSubscription = null;
    }
}

function pauseGame() {
    game.clock.stop();
}

function continueGame() {
    game.clock.start();
}

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
        bt.pauseButton.setAttribute("trans", "continue-button");
        bt.pauseButton.setAttribute("col", "green");
        bt.pauseButton.textContent = game.translations["continue-button"];
        pauseGame();
    } else {
        bt.pauseButton.setAttribute("trans", "pause-button");
        bt.pauseButton.setAttribute("col", "red");
        bt.pauseButton.textContent = game.translations["pause-button"];
        continueGame();
    }
}
window.pauseButton = pauseButton;

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
    // get the selected language from the dropdown
    const langSetting = bt.languageOptions.value;
    // open the language file
    const langFile = `./lang/${langSetting}.json`;
    fetch(langFile)
        .then(response => response.json())
        .then(translations => {
            // Store thje translations in the game object
            game.translations = translations;

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
        // Show the credits overlay
        overlays.help.style.display = "flex";
        game.help = true;
        game.clock.stop();
    } else {
        // Hide the credits overlay
        overlays.help.style.display = "none";
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
    game.highScoreElement.textContent = `${score}/${game.highscore}`;
}

function replaySequence() {
    game.nextStepSubscription && game.clock.unsubscribe(game.nextStepSubscription);
    game.nextStepSubscription = null;
    playSequence();
}
window.replaySequence = replaySequence;

function flashBackground(colorClass) {
    game.gameArea.classList.remove('flash-correct', 'flash-incorrect');
    void game.gameArea.offsetWidth; // Trigger reflow to restart animation
    game.gameArea.classList.add(colorClass);
    game.gameArea.addEventListener('animationend', () => {
        game.gameArea.classList.remove(colorClass);
    }, { once: true });
}

function playSequence() {
    let i = 0;
    let now = 0;

    game.playingSequence = true;
    bt.replayButton.disabled = true;

    function animateNextStep() {
        if (!game.running) {return;}
        if (i >= game.sequence.length) {
            game.clock.unsubscribe(animateNextStep);
            game.nextStepSubscription = null;
            game.playingSequence = false;
            bt.replayButton.disabled = false;
            return;
        }
        now++;
        now = now % 2;
        if (now !== 0) {
            return;
        }
        const monster= game.monsters[game.sequence[i]];
        monster.burb();
        i++;
    }
    game.nextStepSubscription = game.clock.subscribe(animateNextStep, -1);
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
            flashBackground("flash-correct");
            updateHighscore(game.sequence.length);
            // wait for a short time before playing the next sequence
            setTimeout(() => {
                game.gameArea.setAttribute("col", "playing");;
                gameLoop();
            }, 1000);
        } else {
            stopGame();
            flashBackground("flash-incorrect");
            setTimeout(() => {
                game.gameArea.setAttribute("col", "notplaying");;
            }, 1000);
            // Update highscore and go to game start screen
            updateHighscore(game.sequence.length);
        }
    }
}

function gameLoop() {
    game.sequence.push(Math.floor(Math.random() * game.difficulty));
    playSequence();
}

document.addEventListener("DOMContentLoaded", () => {

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

    game.highScoreElement = document.getElementById("highscore");

    overlays.credits = document.getElementById("credit-overlay");
    overlays.help = document.getElementById("help-overlay");

    game.gameArea = document.getElementById("game-area"),

    bt.replayButton = document.getElementById("replay-sequence"),
    bt.startButton = document.getElementById("start-button"),
    bt.pauseButton = document.getElementById("pause-button"),
    bt.creditsButton = document.getElementById("credits-button"),
    bt.helpButton = document.getElementById("help-button"),
    bt.difficultyOptions = document.getElementById("difficulty-options"),
    bt.languageOptions = document.getElementById("language-options"),
    languageChange();

    // Start game clock and game loop
    game.clock.start();
});

window.addEventListener('resize', throttle(function() {
    arrangeMonsters();
}, 200)); 



