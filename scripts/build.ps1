#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Windows build script for XhinkingTodo
.DESCRIPTION
    Builds NSIS installer and portable exe with version number in filename
#>

param(
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

# Get version from package.json
$packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
$version = $packageJson.version
$productName = "XhinkingTodo"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building $productName v$version for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Build the application
if (-not $SkipBuild) {
    Write-Host "`n[1/4] Building Tauri application..." -ForegroundColor Yellow
    npm run tauri:build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed!" -ForegroundColor Red
        exit 1
    }
}

# Define paths
$tauriTarget = "src-tauri\target\release"
$bundleDir = "$tauriTarget\bundle"
$nsisDir = "$bundleDir\nsis"
$outputDir = "release\windows"

# Create output directory
Write-Host "`n[2/4] Preparing output directory..." -ForegroundColor Yellow
if (Test-Path $outputDir) {
    Remove-Item -Path $outputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

# Copy NSIS installer with version
Write-Host "`n[3/4] Packaging NSIS installer..." -ForegroundColor Yellow
$nsisInstaller = Get-ChildItem -Path $nsisDir -Filter "*.exe" | Select-Object -First 1
if ($nsisInstaller) {
    $installerName = "${productName}_${version}_x64-setup.exe"
    Copy-Item -Path $nsisInstaller.FullName -Destination "$outputDir\$installerName"
    Write-Host "  Created: $installerName" -ForegroundColor Green
} else {
    Write-Host "  Warning: NSIS installer not found" -ForegroundColor Yellow
}

# Create portable version
Write-Host "`n[4/4] Creating portable version..." -ForegroundColor Yellow
$exePath = "$tauriTarget\$productName.exe"
if (Test-Path $exePath) {
    $portableName = "${productName}_${version}_x64_portable.exe"
    Copy-Item -Path $exePath -Destination "$outputDir\$portableName"
    Write-Host "  Created: $portableName" -ForegroundColor Green
} else {
    Write-Host "  Warning: Executable not found at $exePath" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Build completed!" -ForegroundColor Green
Write-Host "Output directory: $outputDir" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# List output files
Write-Host "`nGenerated files:" -ForegroundColor Yellow
Get-ChildItem -Path $outputDir | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  - $($_.Name) ($size MB)" -ForegroundColor White
}
