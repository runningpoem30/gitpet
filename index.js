#!/usr/bin/env node
import termKit from "terminal-kit";
import cliCursor from "cli-cursor";
import process from "node:process";
import { TerminalPet } from "./src/pet.js";
import { getLastCommitEpoch } from "./src/git.js";

// Ensure iTerm2 or Sixel compatible terminal
if (process.env.TERM_PROGRAM !== "iTerm.app" && !process.env.TERM?.includes("sixel")) {
    console.log("GitPet graphics mode requires iTerm2 or a Sixel-compatible terminal.");
    process.exit(1);
}

const term = termKit.terminal;
cliCursor.hide();

const pet = new TerminalPet();
const TARGET_FPS = 12;
const GIT_SYNC_INTERVAL = 5000;

let loopTimeout = null;

function terminate() {
    if (loopTimeout) clearTimeout(loopTimeout);
    term.grabInput(false);
    term.fullscreen(false);
    term.clear();
    cliCursor.show();
    process.exit(0);
}

term.on("key", (name) => {
    if (name === "CTRL_C") { terminate(); }
});

process.on("SIGINT", terminate);

function syncGitStatus() {
    pet.updateMood(getLastCommitEpoch());
}

function runGameLoop() {
    try {
        const terminalWidth = term.width || 80;
        const terminalHeight = term.height || 24;

        pet.move(terminalWidth, terminalHeight);

        // CLEAR THE SCREEN EVERY FRAME
        term.clear();

        // Draw UI Header
        term.moveTo(1, 1).styleReset();
        term(`[ GIT TAMAGOTCHI: ${pet.mood} ] `);
        term.gray(`(Movement: Hovering X:${Math.round(pet.x)} Y:${Math.round(pet.y)})\n`);
        term("\u2500".repeat(terminalWidth) + "\n");

        // Draw Dialogue
        const dialogueY = Math.min(terminalHeight - 2, Math.round(pet.y) + pet.height + 2);
        term.moveTo(1, dialogueY).styleReset();
        term.italic().green(`${pet.getDialogue()}\n`);

        // Draw Pet Image natively using stdout to bypass terminal-kit escape code mangling
        term.moveTo(Math.round(pet.x), Math.round(pet.y));
        process.stdout.write(pet.getItermImage());

    } catch (e) {
        // Ignore frame errors to keep loop alive
    }

    loopTimeout = setTimeout(runGameLoop, 1000 / TARGET_FPS);
}

function init() {
    term.fullscreen(true);
    term.grabInput(true);
    
    syncGitStatus();
    setInterval(syncGitStatus, GIT_SYNC_INTERVAL);
    
    runGameLoop();
}

init();