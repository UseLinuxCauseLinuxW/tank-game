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

const controlsDiv = document.createElement("div");
controlsDiv.id = "controls";
controlsDiv.innerHTML = `
  <h3>Controls</h3>
  <p><b>Player 1 (Blue Tank)</b></p>
  <p>Move: ZQSD</p>
  <p>Shoot: F</p>
  <p><b>Player 2 (Red Tank)</b></p>
  <p>Move: Arrow Keys</p>
  <p>Shoot: O</p>
`;
document.body.appendChild(controlsDiv);

document.body.style.display = "flex";
document.body.style.justifyContent = "space-between";

document.getElementById("controls").style.position = "absolute";
document.getElementById("controls").style.right = "10px";
document.getElementById("controls").style.top = "10px";
document.getElementById("controls").style.background = "rgba(255, 255, 255, 0.8)";
document.getElementById("controls").style.padding = "10px";
document.getElementById("controls").style.borderRadius = "5px";
document.getElementById("controls").style.fontFamily = "Arial, sans-serif";
document.getElementById("controls").style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";

document.getElementById("gameCanvas").style.border = "2px solid black";

document.body.style.padding = "20px";

document.body.style.height = "100vh";

document.body.style.overflow = "hidden";

class Tank {
  constructor(x, y, color, controls) {
    this.x = x;
    this.y = y;
    this.size = 40;
    this.speed = 3;
    this.color = color;
    this.bullets = [];
    this.controls = controls;
  }

  move() {
    if (keys[this.controls.up] && this.y > 0) this.y -= this.speed;
    if (keys[this.controls.down] && this.y + this.size < canvas.height) this.y += this.speed;
    if (keys[this.controls.left] && this.x > 0) this.x -= this.speed;
    if (keys[this.controls.right] && this.x + this.size < canvas.width) this.x += this.speed;
  }

  shoot() {
    if (keys[this.controls.shoot]) {
      this.bullets.push(new Bullet(this.x + this.size / 2, this.y + this.size / 2, 5, 0));
      keys[this.controls.shoot] = false;
    }
  }

  update() {
    this.move();
    this.shoot();
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

const player1 = new Tank(100, 100, "blue", { up: "z", down: "s", left: "q", right: "d", shoot: "f" });
const player2 = new Tank(600, 400, "red", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "o" });

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player1.update();
  player2.update();
  player1.draw();
  player2.draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
