import chalk from "chalk";

const FRAMES = {
  CONFUSED: {
    color: chalk.gray,
    dialogue: "Where is the .git folder?",
    art: [
      "  (?.?)  \n  /   \\  ",
      "  (?.?)  \n   \\ /   "
    ]
  },
  THRIVING: {
    color: chalk.greenBright,
    dialogue: "Commits are delicious!",
    art: [
      " ૮(˶˃ ᵕ ˂˶)ა \n   /|  |\\  ",
      " ૮(˶˃ ᵕ ˂˶)ა \n   /| /|   "
    ]
  },
  HUNGRY: {
    color: chalk.yellow,
    dialogue: "I need code... please...",
    art: [
      "  ( •_•)  \n  /|  |\\  ",
      "  ( •_•)  \n  /| /|   "
    ]
  },
  DEAD: {
    color: chalk.red,
    dialogue: "Git push to revive...",
    art: [
      "   💀    \n  /|\\   ",
      "   💀    \n   /|\\  " // Slight rattle
    ]
  }
};

export class TerminalPet {
  constructor() {
    this.x = 0;
    this.direction = 1; // 1 for right, -1 for left
    this.frameIndex = 0;
    this.mood = "CONFUSED";
  }

  updateMood(lastCommitEpoch) {
    if (!lastCommitEpoch) {
      this.mood = "CONFUSED";
      return;
    }

    const hoursSince = (Date.now() / 1000 - lastCommitEpoch) / 3600;

    if (hoursSince < 12) {
      this.mood = "THRIVING";
    } else if (hoursSince < 48) {
      this.mood = "HUNGRY";
    } else {
      this.mood = "DEAD";
    }
  }

  move() {
    const termWidth = process.stdout.columns || 80;
    const petWidth = 14; // Approximate width of the ASCII art

    // Move
    this.x += this.direction;

    // Bounce off walls
    if (this.x >= termWidth - petWidth) {
      this.x = termWidth - petWidth;
      this.direction = -1;
    } else if (this.x <= 0) {
      this.x = 0;
      this.direction = 1;
    }

    // Advance animation frame
    this.frameIndex = (this.frameIndex + 1) % 2;
  }

  render() {
    const state = FRAMES[this.mood];
    const currentArt = state.art[this.frameIndex];
    
    // Create the blank space padding to push the pet to the correct X coordinate
    const padding = " ".repeat(Math.max(0, this.x));

    // Apply padding to all lines of the ASCII art
    const paddedArt = currentArt
      .split("\n")
      .map(line => padding + line)
      .join("\n");

    const header = padding + state.color(`[ ${this.mood} ]`);
    const chatBubble = padding + chalk.italic(state.dialogue);

    return `\n${header}\n${paddedArt}\n${chatBubble}\n`;
  }
}
