import Monster from './Monster.js';
import throttle from './throttle.js';

const game = {
    monsters: [],
    monsterContainer: null,
    difficulty: 4,
    monsterCircleRadius: 200,
    monsterDiameter: "200px",
}

function addMonster(idx, diameter) {
    return new Monster("monsters/frame-1.png", idx, diameter, game.monsterContainer);
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

document.addEventListener("DOMContentLoaded", () => {
    game.monsterContainer = document.getElementById("monster-container");
    for (let i = 0; i < game.difficulty; i++) {
        game.monsters.push(addMonster(i, game.monsterDiameter));
    }
    arrangeMonsters();
});

window.addEventListener('resize', throttle(function() {
    arrangeMonsters();
}, 200)); 