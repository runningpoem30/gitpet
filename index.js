#!/usr/bin/env node
import process from "node:process";
import { TerminalPet } from "./src/pet.js";
import { getLastCommitEpoch } from "./src/git.js";

// Removed early check. Will check at the bottom.


const pet = new TerminalPet();
const TARGET_FPS = 12;
const GIT_SYNC_INTERVAL = 5000;

let loopTimeout = null;

function terminate() {
    if (loopTimeout) clearTimeout(loopTimeout);
    // Show cursor, exit alternate screen, and aggressively turn off ANY mouse tracking
    // that previous runs or other tools might have left broken in the terminal state.
    process.stdout.write("\x1b[?25h\x1b[?1049l\x1b[?1000l\x1b[?1002l\x1b[?1003l\x1b[?1006l");
    process.exit(0);
}

process.on("SIGINT", terminate);
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", (key) => {
    // Ctrl+C is \u0003
    if (key === "\u0003") {
        terminate();
    }
});

function syncGitStatus() {
    pet.updateMood(getLastCommitEpoch());
}

let lastRenderedState = { x: -1, y: -1, mood: "" };
let isCongested = false;

function runGameLoop() {
    try {
        // If the terminal is congested (e.g., user is clicking/scrolling and paused the PTY),
        // skip this frame to prevent buffering 100s of GIFs and flooding the terminal when it unfreezes.
        if (isCongested) {
            loopTimeout = setTimeout(runGameLoop, 1000 / TARGET_FPS);
            return;
        }

        const terminalWidth = process.stdout.columns || 80;
        const terminalHeight = process.stdout.rows || 24;

        pet.move(terminalWidth, terminalHeight);

        const petY = Math.round(pet.y);
        const petX = Math.round(pet.x);

        // Only redraw if the integer position or mood has actually changed
        if (petX !== lastRenderedState.x || petY !== lastRenderedState.y || pet.mood !== lastRenderedState.mood) {
            
            let out = "";
            
            // Start Synchronized Update (prevents screen tearing and glitching during rapid redraws)
            out += "\x1b[?2026h";
            
            if (lastRenderedState.x === -1) {
                // First frame: Clear Screen and go Home
                out += "\x1b[2J\x1b[H";
            } else {
                // Subsequent frames: WIPE the old image with spaces to safely destroy the iTerm2 attachment
                // without triggering a full-screen clear which causes scrollback flooding.
                for (let i = 0; i < pet.height; i++) {
                    out += `\x1b[${lastRenderedState.y + i};${lastRenderedState.x}H${" ".repeat(pet.width)}`;
                }
            }

            // 2. Draw UI Header & Dialogue (pad with spaces to overwrite old coordinates cleanly)
            out += `\x1b[1;1H\x1b[0m[ GIT TAMAGOTCHI: ${pet.mood} ] \x1b[90m(Movement: Hovering X:${petX} Y:${petY})      `;
            
            // Draw Dialogue on Line 2 (Clear rest of line with \x1b[K)
            out += `\x1b[2;1H\x1b[3m\x1b[32m${pet.getDialogue()}\x1b[0m\x1b[K`; 
            
            // Draw Separator on Line 3
            out += `\x1b[3;1H\x1b[0m${"\u2500".repeat(terminalWidth)}`;

            // 3. Draw Pet Image natively using iTerm2 protocol
            out += `\x1b[${petY};${petX}H${pet.getItermImage()}`;

            // 4. CRITICAL: Move cursor back to top-left (1;1)
            out += "\x1b[1;1H";

            // End Synchronized Update
            out += "\x1b[?2026l";

            // Commit frame with backpressure handling
            isCongested = !process.stdout.write(out, () => {
                isCongested = false;
            });

            lastRenderedState = { x: petX, y: petY, mood: pet.mood };
        }

    } catch (e) {
        // Ignore frame errors to keep loop alive
    }

    loopTimeout = setTimeout(runGameLoop, 1000 / TARGET_FPS);
}

function init() {
    // Enter alternate screen and hide cursor
    process.stdout.write("\x1b[?1049h\x1b[?25l");
    
    syncGitStatus();
    setInterval(syncGitStatus, GIT_SYNC_INTERVAL);
    
    runGameLoop();
}

const isITermOrSixel = process.env.TERM_PROGRAM === "iTerm.app" || 
                       process.env.TERM_PROGRAM === "WezTerm" ||
                       process.env.LC_TERMINAL === "iTerm2" ||
                       process.env.TERM?.includes("sixel");

if (!isITermOrSixel) {
    console.log("GitPet graphics mode requires iTerm2 or a Sixel-compatible terminal. Attempting to run anyway in 2 seconds...");
    setTimeout(init, 2000);
} else {
    init();
}