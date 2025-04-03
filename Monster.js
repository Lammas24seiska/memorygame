
class Monster {
  constructor(image, num, diameter, monsterContainer) {
    this.image = image;
    this.createElement(this.image, num, diameter, monsterContainer);
  }
  
  createElement(image, num, diameter, monsterContainer) {
    this.element = document.createElement("img");
    this.element.src = image;
    this.element.className = "monster";
    this.element.id = num;
    this.element.alt = `Monster ${num}`;
    this.element.style.position = "absolute";
    this.element.style.width = diameter;
    this.element.style.height = diameter;
    monsterContainer.appendChild(this.element);
  }

  positionOnCircle(centerX, centerY, radius, angle) {
    const x = centerX + radius * Math.cos(angle) - this.element.clientWidth / 2;
    const y = centerY + radius * Math.sin(angle) - this.element.clientHeight / 2;
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }

  changeDiameter(diameter) {
    this.element.style.width = diameter;
    this.element.style.height = diameter;

    this.element.offsetWidth;
  }
  
}
export default Monster;