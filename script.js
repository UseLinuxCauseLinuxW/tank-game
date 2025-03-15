const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

const keys = {};
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

function drawText(text, x, y, color) {
  ctx.fillStyle = color;
  ctx.font = "20px Arial";
  ctx.fillText(text, x, y);
}

function showGameOver(winner) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.fillText(`${winner} a gagné !`, canvas.width / 2 - 100, canvas.height / 2 - 20);
  
  let button = document.createElement("button");
  button.innerText = "Recommencer";
  button.style.position = "absolute";
  button.style.top = "50%";
  button.style.left = "50%";
  button.style.transform = "translate(-50%, 50px)";
  button.style.padding = "10px 20px";
  button.style.fontSize = "20px";
  document.body.appendChild(button);
  button.addEventListener("click", () => location.reload());
}

class Tank {
  constructor(x, y, color, controls) {
    this.x = x;
    this.y = y;
    this.size = 40;
    this.speed = 3;
    this.color = color;
    this.bullets = [];
    this.controls = controls;
    this.lives = 3;
    this.tripleShot = false;
    this.lastShotTime = 0;
  }

  move() {
    if (keys[this.controls.up] && this.y > 0) this.y -= this.speed;
    if (keys[this.controls.down] && this.y < canvas.height - this.size) this.y += this.speed;
    if (keys[this.controls.left] && this.x > 0) this.x -= this.speed;
    if (keys[this.controls.right] && this.x < canvas.width - this.size) this.x += this.speed;
  }

  shoot() {
    let now = Date.now();
    if (keys[this.controls.shoot] && now - this.lastShotTime > 2000) {
      let bullets = [new Bullet(this.x + this.size / 2, this.y, 5, 0)];
      if (this.tripleShot) {
        bullets.push(new Bullet(this.x + this.size / 2, this.y, 5, -2));
        bullets.push(new Bullet(this.x + this.size / 2, this.y, 5, 2));
      }
      this.bullets.push(...bullets);
      this.lastShotTime = now;
    }
  }

  checkBonusCollision(bonuses) {
    bonuses.forEach((bonus, index) => {
      if (this.x < bonus.x + bonus.size && this.x + this.size > bonus.x && this.y < bonus.y + bonus.size && this.y + this.size > bonus.y) {
        if (bonus.type === "triple") this.tripleShot = true;
        if (bonus.type === "speed") this.speed += 1;
        if (bonus.type === "life") this.lives += 1;
        bonuses.splice(index, 1);
      }
    });
  }

  checkBulletCollision(enemyBullets) {
    enemyBullets.forEach((bullet, index) => {
      if (this.x < bullet.x + bullet.size && this.x + this.size > bullet.x && this.y < bullet.y + bullet.size && this.y + this.size > bullet.y) {
        this.lives--;
        enemyBullets.splice(index, 1);
      }
    });
  }

  update(bonuses, enemyBullets) {
    this.move();
    this.shoot();
    this.checkBonusCollision(bonuses);
    this.checkBulletCollision(enemyBullets);
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
    if (this.x <= 0 || this.x >= canvas.width) { this.speedX *= -1; this.bounces++; }
    if (this.y <= 0 || this.y >= canvas.height) { this.speedY *= -1; this.bounces++; }
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

const bonuses = [new Bonus(200, 200, "triple"), new Bonus(400, 300, "speed"), new Bonus(600, 100, "life")];
const player1 = new Tank(100, 100, "blue", { up: "z", down: "s", left: "q", right: "d", shoot: "f" });
const player2 = new Tank(600, 400, "red", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "o" });

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawText("Vies: " + player1.lives, 10, 20, "blue");
  drawText("Vies: " + player2.lives, canvas.width - 80, 20, "red");
  bonuses.forEach((bonus) => bonus.draw());
  player1.update(bonuses, player2.bullets);
  player2.update(bonuses, player1.bullets);
  player1.draw();
  player2.draw();

  if (player1.lives <= 0) return showGameOver("Joueur Rouge");
  if (player2.lives <= 0) return showGameOver("Joueur Bleu");

  requestAnimationFrame(gameLoop);
}

gameLoop();

