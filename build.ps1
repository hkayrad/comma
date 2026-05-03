
# This script builds the common, client and server projects for bare-metal deployment.

$ErrorActionPreference = "Stop"

# Navigate to the script's directory
Push-Location $PSScriptRoot

function Invoke-NpmCommand {
    param([string]$Arguments)
    # Using npm.cmd directly for Windows compatibility
    Write-Host "Running: npm $Arguments" -ForegroundColor Gray
    $process = Start-Process -FilePath "npm.cmd" -ArgumentList $Arguments -Wait -NoNewWindow -PassThru
    if ($process.ExitCode -ne 0) {
        throw "npm $Arguments failed with exit code $($process.ExitCode)"
    }
}

try {
    # --- Configuration ---
    $COMMON_DIR = ".\common"
    $CLIENT_DIR = ".\client"
    $SERVER_DIR = ".\server"
    $BUILD_ROOT = ".\build"

    # Clear build directory
    if (Test-Path $BUILD_ROOT) {
        Write-Host "Cleaning build directory..." -ForegroundColor Cyan
        Remove-Item -Recurse -Force $BUILD_ROOT
    }

    # 1. Build common (Shared types/schemas)
    Write-Host "Building common workspace..." -ForegroundColor Cyan
    Push-Location $COMMON_DIR
    Invoke-NpmCommand "run build"
    Pop-Location

    # 2. Build server
    Write-Host "Building server project..." -ForegroundColor Cyan
    Push-Location $SERVER_DIR

    Invoke-NpmCommand "run build"
    Invoke-NpmCommand "run postbuild"

    $apiBuildDir = "..\build\api.orhandogan.com.tr"
    New-Item -ItemType Directory -Force -Path $apiBuildDir | Out-Null
    
    Write-Host "Copying server assets to $apiBuildDir" -ForegroundColor Gray
    Copy-Item -Path ".\dist\*" -Destination $apiBuildDir -Recurse -Force
    Remove-Item -Recurse -Force ".\dist"

    Pop-Location

    # 3. Build client
    Write-Host "Building client project..." -ForegroundColor Cyan
    Push-Location $CLIENT_DIR

    Invoke-NpmCommand "run build"

    $clientBuildDir = "..\build\comma.orhandogan.com.tr"
    New-Item -ItemType Directory -Force -Path $clientBuildDir | Out-Null
    
    Write-Host "Copying client assets to $clientBuildDir" -ForegroundColor Gray
    Copy-Item -Path ".\dist\*" -Destination $clientBuildDir -Recurse -Force
    Remove-Item -Recurse -Force ".\dist"

    Pop-Location

    Write-Host "`nSuccessfully built all projects." -ForegroundColor Green
    Write-Host "Server: $apiBuildDir" -ForegroundColor Gray
    Write-Host "Client: $clientBuildDir" -ForegroundColor Gray
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}

