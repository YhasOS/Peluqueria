$ErrorActionPreference = "Stop"
$project = Get-Location
$package = Split-Path -Parent $MyInvocation.MyCommand.Path

$source = Join-Path $package "src\pages\staff\checkout.tsx"
$destination = Join-Path $project "src\pages\staff\checkout.tsx"

if (-not (Test-Path $source)) { throw "No se encuentra el archivo checkout.tsx del paquete." }
if (-not (Test-Path (Split-Path -Parent $destination))) { throw "No se encuentra la carpeta src\pages\staff del proyecto." }

Copy-Item -Force $source $destination
Write-Host "V22 instalada correctamente. Ejecuta npm run build." -ForegroundColor Green
