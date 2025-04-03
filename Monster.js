
class Monster {
  constructor(images, idx, diameter, monsterContainer) {
    this.images = images;
    this.idx = idx;
    this.diameter = diameter;
    this.preloadedImages = [];
    this.preloadImages();
    this.createElement(idx, diameter, monsterContainer);
    this.animate();
    this.animationFrame = 1;
    this.oldFrame = 0;
    this.burbComing = false;
  }
  
  createElement(num, diameter, monsterContainer) {
    this.element = document.createElement("img");
    this.element.src = this.images[0];
    this.element.className = "monster";
    this.element.id = num;
    this.element.alt = `Monster ${num}`;
    this.element.style.position = "absolute";
    this.element.style.transition = "transform 0.2s ease-in-out, opacity 0.2s ease-in-out";
    this.element.style.width = diameter;
    this.element.style.height = diameter;
    monsterContainer.appendChild(this.element);
  }

  preloadImages() {
    this.images.forEach(src => {
      const img = new Image();
      img.src = src;
      this.preloadedImages.push(img);
    });
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

  burbEffects() {
    this.element.src = this.preloadedImages[2].src;
    this.element.style.transform = `scale(1.5)`;

  }

  animate() {
    const changeImage = () => {
      if (this.burbComing === true) {
        this.burbEffects();
        this.burbComing = false;
      } else {
        this.element.style.transform = `scale(1)`;
        this.element.src = this.preloadedImages[this.animationFrame].src;
      }
      this.animationFrame = (this.oldFrame+ 1) % 2;
      this.oldFrame = this.animationFrame;
    };
    requestAnimationFrame(changeImage);
  }

  burb(click=false) {
    if (click) {
      requestAnimationFrame(() => this.burbEffects());
    }
    this.burbComing = true;
  }
}
export default Monster;