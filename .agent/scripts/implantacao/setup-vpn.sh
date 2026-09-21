#!/usr/bin/env bash
# Wrapper para executar o instalador universal a partir de .agent/scripts/implantacao
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$DIR/../../.." && pwd)"

if [[ -f "$ROOT_DIR/vpn/setup-vps.sh" ]]; then
    bash "$ROOT_DIR/vpn/setup-vps.sh" "$@"
else
    echo "Erro: vpn/setup-vps.sh não encontrado em $ROOT_DIR"
    exit 1
fi
