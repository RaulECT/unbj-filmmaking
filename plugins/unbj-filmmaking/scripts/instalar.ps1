# Instala lo necesario en Windows, sin winget y sin permisos de administrador. Todo queda en %USERPROFILE%\.unbj-filmmaking
# (para desinstalar, se borra esa carpeta). Es seguro volver a correrlo.
# Uso: powershell -ExecutionPolicy Bypass -File instalar.ps1 [-Camara]
#  · Node.js portátil oficial (nodejs.org), verificado con SHA-256
#  · motor de video (Remotion), que trae su propio ffmpeg y descarga su navegador de render
#  · con -Camara: uv (astral.sh) -> Python 3.12 + faster-whisper + OpenCV
param([switch]$Camara)
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$NODE_V = "22.12.0"
$UV_V = "0.5.11"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$casa = Join-Path $HOME ".unbj-filmmaking"
$desc = Join-Path $casa "descargas"
New-Item -ItemType Directory -Force -Path (Join-Path $casa "bin"), $desc | Out-Null
$arm = $env:PROCESSOR_ARCHITECTURE -eq "ARM64"
$na = if ($arm) { "arm64" } else { "x64" }

function Baja($url, $dest) {
  try { Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing } catch { Write-Host "No se pudo descargar $url (hay internet?)"; exit 1 }
}

$node = Join-Path $casa "node\node.exe"
if (-not (Test-Path $node) -or ((& $node -v) -ne "v$NODE_V")) {
  Write-Host "-> Descargando Node.js $NODE_V..."
  $f = "node-v$NODE_V-win-$na.zip"
  Baja "https://nodejs.org/dist/v$NODE_V/$f" (Join-Path $desc $f)
  Baja "https://nodejs.org/dist/v$NODE_V/SHASUMS256.txt" (Join-Path $desc "SHASUMS256.txt")
  $esperado = ((Get-Content (Join-Path $desc "SHASUMS256.txt")) | Where-Object { $_ -match " $([regex]::Escape($f))$" }) -split " " | Select-Object -First 1
  $real = (Get-FileHash (Join-Path $desc $f) -Algorithm SHA256).Hash.ToLower()
  if (-not $esperado -or $esperado -ne $real) { Write-Host "La descarga de Node.js no coincide con su firma SHA-256. Vuelve a intentarlo."; exit 1 }
  $tmp = Join-Path $desc "node-x"
  Expand-Archive -Path (Join-Path $desc $f) -DestinationPath $tmp -Force
  if (Test-Path (Join-Path $casa "node")) { Remove-Item -Recurse -Force (Join-Path $casa "node") }
  Move-Item (Join-Path $tmp "node-v$NODE_V-win-$na") (Join-Path $casa "node")
}
$env:Path = (Join-Path $casa "node") + ";" + $env:Path

if ($Camara) {
  $uv = Join-Path $casa "bin\uv.exe"
  if (-not (Test-Path $uv)) {
    Write-Host "-> Descargando uv $UV_V (gestor de Python)..."
    $ua = if ($arm) { "aarch64" } else { "x86_64" }
    $f = "uv-$ua-pc-windows-msvc.zip"
    Baja "https://github.com/astral-sh/uv/releases/download/$UV_V/$f" (Join-Path $desc $f)
    Baja "https://github.com/astral-sh/uv/releases/download/$UV_V/$f.sha256" (Join-Path $desc "$f.sha256")
    $esperado = ((Get-Content (Join-Path $desc "$f.sha256")) -split " ")[0]
    if ($esperado -ne (Get-FileHash (Join-Path $desc $f) -Algorithm SHA256).Hash.ToLower()) { Write-Host "La descarga de uv no coincide con su firma SHA-256."; exit 1 }
    Expand-Archive -Path (Join-Path $desc $f) -DestinationPath (Join-Path $casa "bin") -Force
  }
  $env:UV_PYTHON_INSTALL_DIR = Join-Path $casa "pythons"
  $env:UV_CACHE_DIR = Join-Path $casa "uv-cache"
  $py = Join-Path $casa "python\Scripts\python.exe"
  if (-not (Test-Path $py)) { & $uv venv --python 3.12 (Join-Path $casa "python") }
  & $py -c "import faster_whisper, cv2, av" 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "-> Instalando transcripcion (faster-whisper) y deteccion de cara..."
    & $uv pip install --python $py -q faster-whisper opencv-python-headless
  }
}

& $node (Join-Path $dir "preparar.mjs") --solo-motor
Remove-Item -Recurse -Force $desc, (Join-Path $casa "uv-cache") -ErrorAction SilentlyContinue
Write-Host "Listo. Node: $node"
