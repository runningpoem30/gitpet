import { execSync } from "node:child_process";

export function getLastCommitEpoch() {
  try {
    // First check if we are actually inside a git repository
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    
    // Get the timestamp of the last commit
    const stdout = execSync("git log -1 --format=%ct", { stdio: ["ignore", "pipe", "ignore"] });
    const epoch = parseInt(stdout.toString().trim(), 10);
    
    return isNaN(epoch) ? null : epoch;
  } catch {
    // Returns null if not a git repo, or if there are zero commits
    return null; 
  }
}