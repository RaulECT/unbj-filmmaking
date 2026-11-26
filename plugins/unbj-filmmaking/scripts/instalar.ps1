# Instala lo necesario en Windows (una sola vez; es seguro volver a correrlo).
# Uso: powershell -ExecutionPolicy Bypass -File instalar.ps1 [-Camara]
param([switch]$Camara)
$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
function Tiene($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }
function Refrescar { $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User") }
if (-not (Tiene winget)) { Write-Host "Falta winget (App Installer). Instalalo desde Microsoft Store y vuelve a correr esto."; exit 1 }
if (-not (Tiene node)) { Write-Host "-> Instalando Node.js..."; winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements; Refrescar }
if (-not (Tiene ffmpeg)) { Write-Host "-> Instalando ffmpeg..."; winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements; Refrescar }
if ($Camara) {
  if (-not (Tiene python)) { winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements; Refrescar }
  $v = Join-Path $HOME ".unbj-filmmaking\python"
  if (-not (Test-Path "$v\Scripts\python.exe")) { python -m venv $v }
  & "$v\Scripts\python.exe" -c "import faster_whisper, cv2" 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "-> Instalando transcripcion (faster-whisper) y deteccion de cara..."
    & "$v\Scripts\pip.exe" install -q faster-whisper opencv-python-headless
  }
}
node (Join-Path $dir "preparar.mjs") --solo-motor
Write-Host "Listo"
