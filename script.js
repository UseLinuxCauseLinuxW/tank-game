document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  canvas.width = 800;
  canvas.height = 600;
  document.body.style.display = "flex";
  document.body.style.justifyContent = "space-between";

  // Affichage des contrôles
  const controlsDiv = document.createElement("div");
  controlsDiv.innerHTML = `
    <h3>Contrôles</h3>
    <p><b>Joueur 1 (Tank Bleu)</b></p>
    <p>Déplacement : ZQSD</p>
    <p>Tirer : F</p>
    <p><b>Joueur 2 (Tank Rouge)</b></p>
    <p>Déplacement : Flèches</p>
    <p>Tirer : O</p>
  `;
  document.body.appendChild(controlsDiv);

  controlsDiv.style.padding = "10px";
  controlsDiv.style.background = "rgba(255, 255, 255, 0.8)";
  controlsDiv.style.border = "1px solid black";
  controlsDiv.style.width = "200px";

  // Tank class
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

    move(keys) {
      if (keys[this.controls.up]) this.y -= this.speed;
      if (keys[this.controls.down]) this.y += this.speed;
      if (keys[this.controls.left]) this.x -= this.speed;
      if (keys[this.controls.right]) this.x += this.speed;
    }

    shoot(keys) {
      if (keys[this.controls.shoot]) {
        this.bullets.push({ x: this.x + this.size / 2, y: this.y, speed: 5 });
        keys[this.controls.shoot] = false;
      }
    }

    update(keys) {
      this.move(keys);
      this.shoot(keys);
      this.bullets.forEach((b) => (b.y -= b.speed));
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
      ctx.fillStyle = "black";
      this.bullets.forEach((b) => {
        ctx.fillRect(b.x, b.y, 5, 10);
      });
    }
  }

  // Définition des joueurs
  const player1 = new Tank(100, 500, "blue", { up: "z", down: "s", left: "q", right: "d", shoot: "f" });
  const player2 = new Tank(600, 500, "red", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "o" });
  const keys = {};

  document.addEventListener("keydown", (e) => (keys[e.key] = true));
  document.addEventListener("keyup", (e) => (keys[e.key] = false));

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player1.update(keys);
    player2.update(keys);
    player1.draw();
    player2.draw();
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
});
