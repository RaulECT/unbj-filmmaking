#!/bin/bash
# Instala lo necesario en Mac, sin Homebrew y sin contraseña de administrador. Todo queda en ~/.unbj-filmmaking
# (para desinstalar, se borra esa carpeta). Es seguro volver a correrlo.
# Uso: bash instalar.sh [--camara]   (--camara agrega Python y la transcripción para videos con persona a cámara)
#  · Node.js portátil oficial (nodejs.org), verificado con SHA-256
#  · motor de video (Remotion), que trae su propio ffmpeg y descarga su navegador de render
#  · con --camara: uv (astral.sh) → Python 3.12 + faster-whisper + OpenCV
set -e
NODE_V=22.12.0
UV_V=0.5.11
DIR="$(cd "$(dirname "$0")" && pwd)"
CASA="$HOME/.unbj-filmmaking"
mkdir -p "$CASA/bin" "$CASA/descargas"
case "$(uname -m)" in arm64) NA=arm64; UA=aarch64 ;; *) NA=x64; UA=x86_64 ;; esac

baja() { # url destino
  curl -fL --retry 3 --progress-bar -o "$2" "$1" || { echo "❌ No se pudo descargar $1 (¿hay internet?)"; exit 1; }
}

if [ ! -x "$CASA/node/bin/node" ] || [ "$("$CASA/node/bin/node" -v)" != "v$NODE_V" ]; then
  echo "→ Descargando Node.js $NODE_V…"
  F="node-v$NODE_V-darwin-$NA.tar.gz"
  baja "https://nodejs.org/dist/v$NODE_V/$F" "$CASA/descargas/$F"
  baja "https://nodejs.org/dist/v$NODE_V/SHASUMS256.txt" "$CASA/descargas/SHASUMS256.txt"
  ESPERADO=$(grep " $F\$" "$CASA/descargas/SHASUMS256.txt" | cut -d' ' -f1)
  REAL=$(shasum -a 256 "$CASA/descargas/$F" | cut -d' ' -f1)
  [ -n "$ESPERADO" ] && [ "$ESPERADO" = "$REAL" ] || { echo "❌ La descarga de Node.js no coincide con su firma SHA-256. Vuelve a intentarlo."; exit 1; }
  rm -rf "$CASA/node" && mkdir -p "$CASA/node"
  tar -xzf "$CASA/descargas/$F" -C "$CASA/node" --strip-components 1
fi
export PATH="$CASA/node/bin:$PATH"

if [ "$1" = "--camara" ]; then
  if [ ! -x "$CASA/bin/uv" ]; then
    echo "→ Descargando uv $UV_V (gestor de Python)…"
    F="uv-$UA-apple-darwin.tar.gz"
    baja "https://github.com/astral-sh/uv/releases/download/$UV_V/$F" "$CASA/descargas/$F"
    baja "https://github.com/astral-sh/uv/releases/download/$UV_V/$F.sha256" "$CASA/descargas/$F.sha256"
    [ "$(cut -d' ' -f1 "$CASA/descargas/$F.sha256")" = "$(shasum -a 256 "$CASA/descargas/$F" | cut -d' ' -f1)" ] || { echo "❌ La descarga de uv no coincide con su firma SHA-256."; exit 1; }
    tar -xzf "$CASA/descargas/$F" -C "$CASA/bin" --strip-components 1
  fi
  export UV_PYTHON_INSTALL_DIR="$CASA/pythons" UV_CACHE_DIR="$CASA/uv-cache"
  [ -x "$CASA/python/bin/python" ] || "$CASA/bin/uv" venv --python 3.12 "$CASA/python"
  "$CASA/python/bin/python" -c "import faster_whisper, cv2, av" 2>/dev/null || {
    echo "→ Instalando transcripción (faster-whisper) y detección de cara (OpenCV)…"
    "$CASA/bin/uv" pip install --python "$CASA/python/bin/python" -q faster-whisper opencv-python-headless
  }
fi

"$CASA/node/bin/node" "$DIR/preparar.mjs" --solo-motor
rm -rf "$CASA/descargas" "$CASA/uv-cache"
echo "✅ Listo. Node: $CASA/node/bin/node"
