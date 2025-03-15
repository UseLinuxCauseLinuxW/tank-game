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

document.getElementById("controls").style.position = "absolute";
document.getElementById("controls").style.right = "20px";
document.getElementById("controls").style.top = "20px";
document.getElementById("controls").style.background = "rgba(255, 255, 255, 0.8)";
document.getElementById("controls").style.padding = "10px";
document.getElementById("controls").style.borderRadius = "5px";
document.getElementById("controls").style.fontFamily = "Arial, sans-serif";

document.getElementById("gameCanvas").style.border = "2px solid black";

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
    if (keys[this.controls.up] && this.y > 0) this.y -= this.speed;
    if (keys[this.controls.down] && this.y + this.size < canvas.height) this.y += this.speed;
    if (keys[this.controls.left] && this.x > 0) this.x -= this.speed;
    if (keys[this.controls.right] && this.x + this.size < canvas.width) this.x += this.speed;
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
    this.size = 20;
    this.type = type;
  }

  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

const bonuses = [
  new Bonus(200, 200, "triple"),
  new Bonus(400, 300, "speed"),
  new Bonus(600, 100, "life")
];

const player1 = new Tank(100, 100, "blue", { up: "z", down: "s", left: "q", right: "d", shoot: "f" }, "right");
const player2 = new Tank(600, 400, "red", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "o" }, "left");

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bonuses.forEach((bonus) => bonus.draw());
  player1.update();
  player2.update();
  player1.draw();
  player2.draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
