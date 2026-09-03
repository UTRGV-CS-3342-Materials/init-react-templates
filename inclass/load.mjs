#!/usr/bin/env node
// Checkpoint loader for live-coding lessons. See ../LIVECODE.md for the design.
// Deliberately not named/worded like a git command — this isn't `git
// checkout`, it's a full swap of the working directory's content.
//
// Usage (from inclass/, or anywhere):
//   node load.mjs V1
//
// What it does, in order:
//   0. If HEAD isn't on a branch (detached — e.g. a student went looking at
//      old history with a real `git checkout <sha>` and forgot to come
//      back), says so and asks before switching back to main. Committing
//      from a detached HEAD would strand the commit the moment they switch
//      branches, so this has to happen before anything else.
//   1. Shows `git status` for whatever's currently in this directory and
//      asks before committing it — labeled with the checkpoint that work was
//      done FROM (read out of .checkpoint-version before anything is
//      touched), not the one being loaded. Answering no aborts: nothing is
//      committed, nothing is loaded.
//   2. Wipes this directory (except node_modules/ and .lesson/) and copies in
//      the requested checkpoint from .lesson/<version>/, writes that version
//      into .checkpoint-version, and commits *that* as its own "checkpoint:
//      Vx" commit (no prompt — it's just bookkeeping, not a student
//      decision), skipped if it wouldn't change anything.
//   3. If the checkpoint's package.json differs from the one you had, prints
//      a note to run `npm install` yourself — it doesn't run it for you, so
//      a plain load stays instant and nothing runs behind your back.
//
// Pushing is NOT automatic (see the commented-out block near the end) —
// re-enable it there if you want it back.
//
// Committing the checkpoint load itself (step 2) is what makes step 1's
// "did the student actually edit anything" check meaningful on the *next*
// run — otherwise every load would look dirty regardless of whether any
// class work happened, since the freshly-loaded files would never have been
// committed yet.
//
// .checkpoint-version is tracked in git like any other student file, so a
// real `git checkout` back to an old commit carries the version that work
// was based on right in the tree, not just in the commit message.
//
// Uses .mjs (not .js) on purpose: package.json gets replaced by each
// checkpoint's own copy, so this script can't depend on "type": "module"
// living there.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";

const dir = path.dirname(fileURLToPath(import.meta.url)); // inclass/
const lessonDir = path.join(dir, ".lesson");
const selfName = path.basename(fileURLToPath(import.meta.url));
const versionFile = path.join(dir, ".checkpoint-version");
const HOME_BRANCH = "main";

// Never delete these when loading a checkpoint.
const KEEP = new Set([".lesson", "node_modules", selfName]);

function run(cmd, args) {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  return execFileSync(cmd, args, { cwd: dir, stdio: "inherit" });
}

function runCapture(cmd, args) {
  return execFileSync(cmd, args, { cwd: dir }).toString();
}

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${question} [y/N] `);
  rl.close();
  return answer.trim().toLowerCase() === "y";
}

// null when HEAD is detached (not on a branch).
function currentBranch() {
  try {
    return runCapture("git", ["symbolic-ref", "-q", "--short", "HEAD"]).trim();
  } catch {
    return null;
  }
}

// Stages everything under `dir` and commits only if that actually staged a
// change. Returns whether it committed.
function commitIfDirty(message) {
  run("git", ["add", "-A", "."]);
  const status = runCapture("git", ["status", "--porcelain", "--", "."]);
  if (!status.trim()) {
    console.log("(nothing to commit)");
    return false;
  }
  run("git", ["commit", "-m", message]);
  return true;
}

function listVersions() {
  if (!fs.existsSync(lessonDir)) return [];
  return fs
    .readdirSync(lessonDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

async function main() {
  const requested = process.argv[2];
  const versions = listVersions();

  if (!requested) {
    console.error(`Usage: node load.mjs <version>`);
    console.error(
      versions.length
        ? `Available: ${versions.join(", ")}`
        : `No checkpoints found in .lesson/`,
    );
    process.exit(1);
  }

  // Accept "v1" or "V1".
  const target =
    versions.find((v) => v.toLowerCase() === requested.toLowerCase()) ??
    requested;
  const srcDir = path.join(lessonDir, target);

  if (!fs.existsSync(srcDir)) {
    console.error(`✗ No checkpoint "${requested}" in .lesson/`);
    console.error(
      versions.length
        ? `Available: ${versions.join(", ")}`
        : `No checkpoints found.`,
    );
    process.exit(1);
  }

  // 0. Refuse to commit onto a detached HEAD — that commit would become
  // unreachable the moment the student switches back to a branch.
  if (currentBranch() === null) {
    console.log(
      `⚠ You're not on a branch right now (detached HEAD) — probably from looking at old history.`,
    );
    const ok = await confirm(`Switch back to "${HOME_BRANCH}" and continue?`);
    if (!ok) {
      console.log("Stopped — nothing changed.");
      process.exit(1);
    }
    run("git", ["checkout", HOME_BRANCH]);
  }

  // Read this *before* touching anything — it's the checkpoint the current
  // working tree was loaded from, i.e. what the work about to be committed
  // was done on top of.
  const workingFrom = fs.existsSync(versionFile)
    ? fs.readFileSync(versionFile, "utf8").trim()
    : "start";

  // 1. Show what's changed here and ask before saving it. Deliberately
  // checks status without staging first — `git status --porcelain` already
  // reports untracked/unstaged changes, and staging before the prompt would
  // leave things staged even on a decline.
  console.log("Checking your current work...");
  const status = runCapture("git", ["status", "--porcelain", "--", "."]);
  let savedWork = false;
  if (status.trim()) {
    console.log("You have uncommitted work that would be discarded:");
    console.log(status);
    const ok = await confirm(
      `Commit this as "student work: from ${workingFrom}" and load ${target}?`,
    );
    if (!ok) {
      console.log("Stopped — nothing changed. Your edits are still here.");
      process.exit(1);
    }
    run("git", ["add", "-A", "."]);
    run("git", ["commit", "-m", `student work: from ${workingFrom}`]);
    savedWork = true;
  } else {
    console.log("(no changes to save)");
  }

  // Remember the current package.json so we can tell if the checkpoint
  // actually changes dependencies.
  const pkgPath = path.join(dir, "package.json");
  const oldPkg = fs.existsSync(pkgPath) ? fs.readFileSync(pkgPath, "utf8") : null;

  // 2. Wipe everything except node_modules/ and .lesson/, then copy in the checkpoint.
  console.log(`Loading ${target}...`);
  for (const entry of fs.readdirSync(dir)) {
    if (KEEP.has(entry)) continue;
    fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
  }
  fs.cpSync(srcDir, dir, { recursive: true });
  fs.writeFileSync(versionFile, `${target}\n`);

  // Note whether package.json changed — we don't install for them (see the
  // note printed at the end), just flag it.
  const newPkg = fs.existsSync(pkgPath) ? fs.readFileSync(pkgPath, "utf8") : null;
  const pkgChanged = newPkg !== oldPkg;

  // Commit the checkpoint load itself (no prompt — this is bookkeeping, not
  // a student decision), so next time this script runs, step 1 only sees a
  // diff if real student edits happened since this point.
  console.log(`Recording checkpoint ${target}...`);
  commitIfDirty(`checkpoint: ${target}`);

  // Not auto-pushing — the two commits above stay local until the student
  // (or instructor) pushes deliberately. Uncomment to bring it back:
  // if (savedWork || loadedCheckpoint) {
  //   try {
  //     run("git", ["push"]);
  //   } catch {
  //     console.log(
  //       "⚠ Push failed (offline? no upstream?) — your work is committed locally, continuing.",
  //     );
  //   }
  // }

  console.log(`✓ Loaded ${target}`);

  if (pkgChanged) {
    console.log();
    console.log("package.json has changed — run npm install to update packages.");
  }
}

main();
