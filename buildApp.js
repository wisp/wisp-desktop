#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require('fs');

if (fs.existsSync('./dist')) {
    console.log("Clearing dist folder...");
    fs.rmdirSync('./dist', { recursive: true });
}

console.log("Building React UI...");
execSync("npm run build");

console.log("Building Python app...");
execSync("pyinstaller main.py --windowed --name=WISP_Desktop");

console.log("Copying UI to dist...");
fs.renameSync('./build', './dist/build');

console.log("Done building!");
console.log("Run the app with the executable in dist");