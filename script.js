const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

document.body.innerHTML += `
  <div id="controls">
    <h3>Controls</h3>
    <p><b>Player 1 (Blue Tank)</b></p>
    <p>Move: ZQSD</p>
    <p>Shoot: F</p>
    <p><b>Player 2 (Red Tank)</b></p>
    <p>Move: Arrow Keys</p>
    <p>Shoot: O</p>
  </div>
`;

document.body.style.display = "flex";
document.body.style.flexDirection = "row";

document.getElementById("controls").style.marginLeft = "20px";
document.getElementById("controls").style.fontFamily = "Arial, sans-serif";

document.getElementById("gameCanvas").style.border = "2px solid black";

type="text/css">
#controls {
  position: absolute;
  right: 20px;
  top: 20px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
}
</style>

class Tank {
  constructor(x, y, color, controls, direction) {
    this.x = x;
    this.y = y;
    this.size = 40;
    this.speed = 3;
    this.color = color;
    this.bullets = [];
    this.controls = controls;
    this.lives = 3;
    this.tripleShot = false;
    this.direction = direction;
  }

  move() {
    if (keys[this.controls.up]) this.y -= this.speed;
    if (keys[this.controls.down]) this.y += this.speed;
    if (keys[this.controls.left]) this.x -= this.speed;
    if (keys[this.controls.right]) this.x += this.speed;
  }

  shoot() {
    if (keys[this.controls.shoot]) {
      let speedX = this.direction === "right" ? 5 : -5;
      let speedY = 0;
      
      if (this.tripleShot) {
        this.bullets.push(new Bullet(this.x + this.size / 2, this.y + this.size / 2, speedX, speedY));
        this.bullets.push(new Bullet(this.x + this.size / 2, this.y + this.size / 2, speedX, -2));
        this.bullets.push(new Bullet(this.x + this.size / 2, this.y + this.size / 2, speedX, 2));
      } else {
        this.bullets.push(new Bullet(this.x + this.size / 2, this.y + this.size / 2, speedX, speedY));
      }
      keys[this.controls.shoot] = false;
    }
  }

  checkBonusCollision() {
    bonuses.forEach((bonus, index) => {
      if (
        this.x < bonus.x + bonus.size &&
        this.x + this.size > bonus.x &&
        this.y < bonus.y + bonus.size &&
        this.y + this.size > bonus.y
      ) {
        if (bonus.type === "triple") this.tripleShot = true;
        if (bonus.type === "speed") this.speed += 1;
        if (bonus.type === "life") this.lives += 1;
        bonuses.splice(index, 1);
      }
    });
  }

  update() {
    this.move();
    this.shoot();
    this.checkBonusCollision();
    this.bullets.forEach((bullet) => bullet.update());
    this.bullets = this.bullets.filter((bullet) => bullet.bounces < 2);
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    this.bullets.forEach((bullet) => bullet.draw());
  }
}

class Bullet {
  constructor(x, y, speedX, speedY) {
    this.x = x;
    this.y = y;
    this.size = 8;
    this.speedX = speedX;
    this.speedY = speedY;
    this.bounces = 0;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    
    if (this.x <= 0 || this.x >= canvas.width) {
      this.speedX *= -1;
      this.bounces++;
    }
    if (this.y <= 0 || this.y >= canvas.height) {
      this.speedY *= -1;
      this.bounces++;
    }
  }

  draw() {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Bonus {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
