#!/bin/bash
# Instala lo necesario en Mac (una sola vez; es seguro volver a correrlo).
# Uso: bash instalar.sh [--camara]   (--camara agrega Python y la transcripción para videos con persona a cámara)
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
if ! command -v brew >/dev/null; then
  echo "→ Instalando Homebrew (te pedirá la contraseña de la Mac)…"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv)"
fi
command -v node >/dev/null || { echo "→ Instalando Node.js…"; brew install node; }
command -v ffmpeg >/dev/null || { echo "→ Instalando ffmpeg…"; brew install ffmpeg; }
if [ "$1" = "--camara" ]; then
  command -v python3 >/dev/null || brew install python
  V="$HOME/.unbj-filmmaking/python"
  [ -x "$V/bin/python" ] || python3 -m venv "$V"
  "$V/bin/python" -c "import faster_whisper, cv2" 2>/dev/null || {
    echo "→ Instalando transcripción (faster-whisper) y detección de cara…"
    "$V/bin/pip" install -q --upgrade pip
    "$V/bin/pip" install -q faster-whisper opencv-python-headless
  }
fi
node "$DIR/preparar.mjs" --solo-motor
echo "✅ Listo"
