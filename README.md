# Gitagotchi 👾

A virtual pet that lives in your terminal and feeds entirely on your git commits. If you stop pushing code, your pet gets sad, hungry, and eventually dies. Keep coding to keep it thriving.

*Note: The graphics engine requires **iTerm2** (macOS) or a **Sixel-compatible terminal**.*

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
