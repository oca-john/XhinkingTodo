#!/usr/bin/env node
/**
 * Cross-platform packaging script for XhinkingTodo
 * Detects OS and runs appropriate build script
 */

const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

const platform = os.platform();
const projectRoot = path.resolve(__dirname, '..');

console.log('========================================');
console.log('XhinkingTodo Cross-Platform Packager');
console.log(`Detected OS: ${platform}`);
console.log('========================================\n');

let command, args, options;

if (platform === 'win32') {
    // Windows: Build NSIS installer and portable exe
    console.log('Building for Windows...\n');
    command = 'powershell';
    args = ['-ExecutionPolicy', 'Bypass', '-File', 'scripts/build.ps1'];
    options = {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true
    };
} else if (platform === 'linux') {
    // Linux: Build deb, rpm, and tar.gz
    console.log('Building for Linux...\n');
    command = 'bash';
    args = ['scripts/build.sh'];
    options = {
        cwd: projectRoot,
        stdio: 'inherit'
    };
} else if (platform === 'darwin') {
    // macOS: Not fully supported yet, but can run tauri build
    console.log('Building for macOS...\n');
    console.log('Note: macOS packaging uses default Tauri build\n');
    command = 'npm';
    args = ['run', 'tauri:build'];
    options = {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true
    };
} else {
    console.error(`Unsupported platform: ${platform}`);
    process.exit(1);
}

const child = spawn(command, args, options);

child.on('error', (err) => {
    console.error('Failed to start build process:', err);
    process.exit(1);
});

child.on('close', (code) => {
    if (code !== 0) {
        console.error(`Build process exited with code ${code}`);
        process.exit(code);
    }
    console.log('\nPackaging completed successfully!');
});
