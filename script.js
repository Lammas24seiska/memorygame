import Monster from './Monster.js';
import throttle from './throttle.js';
import Clock from './Clock.js';

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
}

function addMonster(idx, diameter) {
    const newMon = new Monster(["monsters/green-1.png", "monsters/green-2.png", "monsters/green-3.png"], idx, diameter, game.monsterContainer);
    game.clock.subscribe(newMon.animate.bind(newMon));
    return newMon;
}

function arrangeMonsters() {
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

function playSequence(callback) {

    function animateNextStep() {
        if (i >= game.sequence.length) {
            game.clock.unsubscribe(animateNextStep);
            if (callback)  callback();
            return;
        }
        now++;
        now = now % 4;
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

    let i = 0;
    let now = 0;

    // 
    game.clock.subscribe(animateNextStep, -1);
}

function monsterClick(monster) {
    console.log("Clicked on monster", monster.idx);
    game.userSequence.push(monster.idx);
    monster.burb(true);
    if (game.userSequence.length >= game.sequence.length) {
        // Check if the user sequence is correct
        const isCorrect = game.userSequence.every((idx, index) => idx === game.sequence[index]);
        game.userSequence = [];
        if (isCorrect) {
            console.log("Correct sequence!");
            // Call gameLoop again
            gameLoop();
        } else {
            console.log("Incorrect sequence!");
            // Update highscore and go to game start screen
        }
    }
}

function gameLoop() {
    // Play sequence asynchronously and wait for sequency to finish
    game.playingSequence = true;
    playSequence( () => {
        // Wait for user to click n times
        game.playingSequence = false;
    });
}

document.addEventListener("DOMContentLoaded", () => {

    game.clock = new Clock(game.clockInterval);

    game.monsterContainer = document.getElementById("monster-container");
    for (let i = 0; i < game.difficulty; i++) {
        game.monsters.push(addMonster(i, game.monsterDiameter));
    }
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
    gameLoop();
});

window.addEventListener('resize', throttle(function() {
    arrangeMonsters();
}, 200)); 



