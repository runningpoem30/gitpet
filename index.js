#!/usr/bin/env node
import logUpdate from "log-update";
import cliCursor from "cli-cursor";
import { getLastCommitEpoch } from "./src/git.js";
import { TerminalPet } from "./src/pet.js";



// Hide the terminal cursor for clean animations
cliCursor.hide();

const pet = new TerminalPet();
let lastCommitEpoch = null;

// Only check Git every 5 seconds to avoid spamming child processes
function syncGitStatus() {
  lastCommitEpoch = getLastCommitEpoch();
}

syncGitStatus();
setInterval(syncGitStatus, 5000);

// Run the animation loop at ~8 FPS (120ms)
const animationLoop = setInterval(() => {
  pet.updateMood(lastCommitEpoch);
  
  // If the pet is dead, stop it from moving
  if (pet.mood !== "DEAD") {
    pet.move();
  } else {
    // Just cycle the rattling animation
    pet.frameIndex = (pet.frameIndex + 1) % 2; 
  }
  
  logUpdate(pet.render());
}, 120);

// Cleanup gracefully on Ctrl+C
process.on("SIGINT", () => {
  clearInterval(animationLoop);
  logUpdate.clear();
  cliCursor.show();
  console.log("GitPet went to sleep.");
  process.exit();
});