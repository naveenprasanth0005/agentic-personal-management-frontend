
$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "          HUSKY SETUP STARTED" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# --------------------------------------------------
# 1. Paths and configuration
# --------------------------------------------------

$FrontendPath = $PSScriptRoot
$PackagePath = Join-Path $FrontendPath "package.json"
$HuskyPath = Join-Path $FrontendPath ".husky"
$Utf8NoBom = New-Object System.Text.UTF8Encoding $false

$RepoRoot = (git -C $FrontendPath rev-parse --show-toplevel).Trim()

if ($LASTEXITCODE -ne 0 -or !$RepoRoot) {
    throw "Could not determine Git repository root."
}

Write-Host "Repository root: $RepoRoot" -ForegroundColor Gray
Write-Host "Frontend path:   $FrontendPath`n" -ForegroundColor Gray

if (!(Test-Path $PackagePath)) {
    throw "package.json not found."
}

$ResolvedFrontend = [System.IO.Path]::GetFullPath($FrontendPath).TrimEnd('\')
$ResolvedRoot = [System.IO.Path]::GetFullPath($RepoRoot).TrimEnd('\')

if ((Split-Path $ResolvedFrontend -Parent) -ne $ResolvedRoot) {
    throw "The frontend folder must be directly inside the Git repository root."
}

# --------------------------------------------------
# Helper functions
# --------------------------------------------------

function Write-Utf8NoBom {
    param(
        [string]$Path,
        [string]$Content
    )

    $Directory = Split-Path $Path -Parent

    if (!(Test-Path $Directory)) {
        New-Item -ItemType Directory -Path $Directory -Force | Out-Null
    }

    $Content = $Content -replace "`r`n", "`n"
    $Content = $Content -replace "`r", "`n"

    [System.IO.File]::WriteAllText(
        $Path,
        $Content.TrimEnd("`n") + "`n",
        $Utf8NoBom
    )
}

function Assert-LastExitCode {
    param([string]$Message)

    if ($LASTEXITCODE -ne 0) {
        throw $Message
    }
}

# --------------------------------------------------
# 2. Update package.json
# --------------------------------------------------

Write-Host "[1/7] Updating package.json..." -ForegroundColor Yellow

$PackageContent = [System.IO.File]::ReadAllText($PackagePath)

if ($PackageContent.Length -gt 0 -and $PackageContent[0] -eq [char]0xFEFF) {
    $PackageContent = $PackageContent.Substring(1)
}

$Package = $PackageContent | ConvertFrom-Json

if (!$Package.scripts) {
    $Package | Add-Member `
        -MemberType NoteProperty `
        -Name "scripts" `
        -Value ([PSCustomObject]@{})
}

$ExistingPrepare = $Package.scripts.prepare

if ([string]::IsNullOrWhiteSpace($ExistingPrepare)) {
    $Package.scripts | Add-Member `
        -MemberType NoteProperty `
        -Name "prepare" `
        -Value "cd .. && husky frontend/.husky"
}
elseif ($ExistingPrepare -notmatch "husky\s+frontend/\.husky") {
    $Package.scripts.prepare = "$ExistingPrepare && cd .. && husky frontend/.husky"
}

$PackageJson = $Package | ConvertTo-Json -Depth 100
Write-Utf8NoBom -Path $PackagePath -Content $PackageJson

# --------------------------------------------------
# 3. Create configuration files
# --------------------------------------------------

Write-Host "[2/7] Creating configuration files..." -ForegroundColor Yellow

$LintStagedConfig = @'
{
  "*.{js,jsx,ts,tsx}": "prettier --write",
  "*.{json,jsonc,css,scss,md,html,yml,yaml}": "prettier --write"
}
'@

Write-Utf8NoBom `
    -Path (Join-Path $FrontendPath ".lintstagedrc.json") `
    -Content $LintStagedConfig

$CommitlintConfig = @'
export default {
  extends: ["@commitlint/config-conventional"],
};
'@

Write-Utf8NoBom `
    -Path (Join-Path $FrontendPath "commitlint.config.mjs") `
    -Content $CommitlintConfig

# --------------------------------------------------
# 4. Create Husky hooks
# --------------------------------------------------

Write-Host "[3/7] Creating Git hooks..." -ForegroundColor Yellow

if (!(Test-Path $HuskyPath)) {
    New-Item -ItemType Directory -Path $HuskyPath -Force | Out-Null
}

# Pre-commit
$PreCommitHook = @'
cd frontend || exit 1
npx lint-staged
'@

Write-Utf8NoBom `
    -Path (Join-Path $HuskyPath "pre-commit") `
    -Content $PreCommitHook

# Commit-msg
$CommitMsgHook = @'
commit_msg_file="$(git rev-parse --path-format=absolute --git-path COMMIT_EDITMSG)" || exit 1
cd frontend || exit 1
npx --no -- commitlint --edit "$commit_msg_file"
'@

Write-Utf8NoBom `
    -Path (Join-Path $HuskyPath "commit-msg") `
    -Content $CommitMsgHook

# Pre-push
$HasLint = $null -ne $Package.scripts.lint
$HasBuild = $null -ne $Package.scripts.build

if ($HasLint -and $HasBuild) {
    $PrePushHook = @'
cd frontend || exit 1
npm run lint || exit $?
npm run build || exit $?
'@

    Write-Utf8NoBom `
        -Path (Join-Path $HuskyPath "pre-push") `
        -Content $PrePushHook
}
else {
    $PrePushPath = Join-Path $HuskyPath "pre-push"

    if (Test-Path $PrePushPath) {
        Remove-Item $PrePushPath -Force
    }

    Write-Host "Warning: lint/build scripts are missing. Pre-push hook was not created." -ForegroundColor DarkYellow
}

# --------------------------------------------------
# 5. Install dependencies and initialize Husky
# --------------------------------------------------

Write-Host "[4/7] Installing development dependencies..." -ForegroundColor Yellow

Push-Location $FrontendPath

try {
    npm install --save-dev `
        husky `
        lint-staged `
        prettier `
        eslint-config-prettier `
        @commitlint/cli `
        @commitlint/config-conventional

    Assert-LastExitCode "Failed to install development dependencies."

    Write-Host "`nInitializing Husky..." -ForegroundColor Yellow

    npm run prepare

    Assert-LastExitCode "Husky initialization failed."
}
finally {
    Pop-Location
}

# --------------------------------------------------
# 6. Normalize encoding and validate JSON using Node.js
# --------------------------------------------------

Write-Host "[5/7] Normalizing configuration file encoding..." -ForegroundColor Yellow

$JsonFiles = @(
    (Join-Path $FrontendPath "package.json"),
    (Join-Path $FrontendPath "package-lock.json"),
    (Join-Path $FrontendPath ".lintstagedrc.json")
)

foreach ($File in $JsonFiles) {

    if (!(Test-Path $File)) {
        throw "JSON file not found: $File"
    }

    $Content = [System.IO.File]::ReadAllText($File)

    if ($Content.Length -gt 0 -and $Content[0] -eq [char]0xFEFF) {
        $Content = $Content.Substring(1)
    }

    [System.IO.File]::WriteAllText(
        $File,
        $Content,
        $Utf8NoBom
    )
}

Write-Host "`nValidating JSON files using Node.js..." -ForegroundColor Yellow

# Create a temporary JavaScript validator.
$ValidatorPath = Join-Path $FrontendPath ".validate-json.cjs"

$ValidatorContent = @'
const fs = require("node:fs");
const path = require("node:path");

const files = process.argv.slice(2);

if (files.length === 0) {
    console.error("No JSON files provided.");
    process.exit(1);
}

for (const file of files) {
    try {
        const content = fs.readFileSync(file, "utf8");

        if (content.charCodeAt(0) === 0xFEFF) {
            throw new Error("UTF-8 BOM detected.");
        }

        JSON.parse(content);

        console.log(`${path.basename(file)}: Valid JSON`);
    } catch (error) {
        console.error(`${path.basename(file)}: Invalid JSON`);
        console.error(error.message);
        process.exitCode = 1;
    }
}
'@

Write-Utf8NoBom -Path $ValidatorPath -Content $ValidatorContent

try {
    node $ValidatorPath @JsonFiles
    Assert-LastExitCode "JSON validation failed."
}
finally {
    if (Test-Path $ValidatorPath) {
        Remove-Item $ValidatorPath -Force
    }
}

# --------------------------------------------------
# 7. Verify Husky configuration
# --------------------------------------------------

Write-Host "`n[6/7] Verifying Husky configuration..." -ForegroundColor Yellow

$HooksPath = git -C $RepoRoot config core.hooksPath

Assert-LastExitCode "Could not read Git hooksPath configuration."

$HooksPath = $HooksPath.Trim()

if ($HooksPath -ne "frontend/.husky/_") {
    throw "Unexpected hooksPath: $HooksPath. Expected: frontend/.husky/_"
}

$HuskyInternalPath = Join-Path $HuskyPath "_"

if (!(Test-Path $HuskyInternalPath)) {
    throw "Husky internal hooks directory was not created."
}

$HookNames = @("pre-commit", "commit-msg")

if ($HasLint -and $HasBuild) {
    $HookNames += "pre-push"
}

foreach ($HookName in $HookNames) {

    $HookFile = Join-Path $HuskyPath $HookName

    if (!(Test-Path $HookFile)) {
        throw "Missing hook: $HookFile"
    }

    $HookContent = [System.IO.File]::ReadAllText($HookFile)

    if ($HookContent.Length -gt 0 -and $HookContent[0] -eq [char]0xFEFF) {
        throw "UTF-8 BOM detected in hook: $HookName"
    }

    Write-Host "$HookName : Verified" -ForegroundColor Green
}

Write-Host "Git hooks path: $HooksPath" -ForegroundColor Green

# --------------------------------------------------
# Summary
# --------------------------------------------------

Write-Host "`n[7/7] Husky setup completed successfully!" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "             SETUP SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Pre-commit : lint-staged + Prettier"
Write-Host "Commit-msg : Conventional Commit validation"

if ($HasLint -and $HasBuild) {
    Write-Host "Pre-push   : ESLint + Build"
}
else {
    Write-Host "Pre-push   : Not configured"
}

Write-Host "Encoding   : UTF-8 without BOM"
Write-Host "Hooks path : $HooksPath"

Write-Host "`nHusky setup finished successfully." -ForegroundColor Green
