import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MOOD_ASSETS = {
    CONFUSED: path.join(__dirname, "assets/pet_confused.gif"),
    THRIVING: path.join(__dirname, "assets/pet_thriving.gif"),
    HUNGRY:   path.join(__dirname, "assets/pet_hungry.gif"),
    DEAD:     path.join(__dirname, "assets/pet_dead.gif")
};

const MOOD_DIALOGUE = {
    CONFUSED: "Where is the .git folder?",
    THRIVING: "The local repository commits are delicious! Keep feeding me code, aryapathak!",
    HUNGRY:   "I need code... please... just a single fix commit...",
    DEAD:     "Killed by inactivity. Git push to revive..."
};

export class TerminalPet {
  constructor() {
    this.x = 20;
    this.y = 10;
    this.vx = 0.5;
    this.vy = 0.2;
    this.mood = "CONFUSED";
    this.width = 8;
    this.height = 4;
    this.images = {};
    this._loadImages();
  }

  _loadImages() {
    for (const [mood, p] of Object.entries(MOOD_ASSETS)) {
      if (fs.existsSync(p)) {
        this.images[mood] = fs.readFileSync(p).toString('base64');
      } else {
        this.images[mood] = "";
      }
    }
  }

  updateMood(lastCommitEpoch) {
    if (!lastCommitEpoch) {
      this.mood = "CONFUSED";
      return;
    }
    const hoursSince = (Date.now() / 1000 - lastCommitEpoch) / 3600;
    if (hoursSince < 12) this.mood = "THRIVING";
    else if (hoursSince < 48) this.mood = "HUNGRY";
    else this.mood = "DEAD";
  }

  move(termWidth, termHeight) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x > termWidth - this.width || this.x < 1) {
      this.vx *= -1;
    }
    if (this.y > termHeight - this.height || this.y < 3) {
      this.vy *= -1;
    }
  }

  getDialogue() {
    return MOOD_DIALOGUE[this.mood];
  }

  getItermImage() {
    const base64 = this.images[this.mood];
    if (!base64) return "ERROR: No Image";
    return `\x1b]1337;File=inline=1;width=${this.width};height=${this.height};preserveAspectRatio=1:${base64}\x07`;
  }
}
