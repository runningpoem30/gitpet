# gitagotchi 

A virtual pet that lives in your terminal and feeds entirely on your git commits. If you stop pushing code, your pet gets sad, hungry, and eventually dies. Keep coding to keep it thriving.

## requirements

**IMPORTANT**: Gitagotchi renders actual HD GIFs natively in your terminal. It does NOT use blocky ASCII art fallbacks. 
Because of this, it **REQUIRES iTerm2** (on macOS) or a **Sixel-compatible terminal**. Standard terminals like macOS Terminal.app or VS Code's integrated terminal will just print out raw image data!


## Installation

Install it globally via npm:

```bash
npm install -g gitagotchi
```

## Usage

Navigate to any git repository in your terminal and summon your pet:

```bash
gitpet
```

Your pet will read your recent commit history and react accordingly. 

## Features
* **Native Terminal Graphics:** Renders a floating, animated GIF right in your terminal. No ASCII art fallbacks.
* **Commit-driven Moods:** Thriving, Hungry, Confused, or Dead based on when you last made a commit.
* **Smart rendering:** Pauses rendering when you click or scroll to prevent scrollback bloat. 
