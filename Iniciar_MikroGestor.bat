@echo off
title MikroGestor Server
chcp 65001 >NUL

echo ==================================================
echo         Iniciando Servidor MikroGestor...
echo ==================================================
echo.

:: ── Garante que estamos na pasta correta ──────────────────────────────────────
cd /d "%~dp0"

:: ── Verifica node_modules ──────────────────────────────────────────────────────
if not exist "node_modules\" (
    echo [INFO] Instalando dependencias iniciais... Aguarde...
    call npm install
    echo.
)

:: ── Verifica Caddy ────────────────────────────────────────────────────────────
set CADDY_EXE=%~dp0caddy\caddy.exe

if not exist "%CADDY_EXE%" (
    echo [AVISO] caddy.exe nao encontrado.
    echo         Execute "Instalar_Caddy.bat" primeiro para configurar o proxy reverso.
    echo         Iniciando sem proxy (IP do sistema pode nao ser detectado).
    echo.
    goto :sem_caddy
)

:: ── Modo com Caddy (porta 80 → proxy → Next.js 3000) ─────────────────────────
echo [OK] Caddy encontrado. Iniciando proxy reverso na porta 80...
echo [OK] Next.js iniciara na porta 3000 (interna).
echo.

:: Inicia o Caddy em janela separada (ele ficara na frente do Next.js)
start "MikroGestor - Caddy Proxy" /D "%~dp0" "%CADDY_EXE%" run --config "%~dp0Caddyfile"

:: Aguarda 2 segundos para o Caddy subir
timeout /t 2 /nobreak >NUL

:: Inicia Next.js na porta 3000 (Caddy encaminha da 80)
echo Iniciando Next.js na porta 3000...
timeout /t 4 /nobreak >NUL
start http://localhost
call npx next dev -p 3000
goto :fim

:sem_caddy
:: ── Modo sem Caddy (Next.js direto na porta 80) ───────────────────────────────
echo [INFO] Iniciando Next.js diretamente na porta 80...
timeout /t 3 /nobreak >NUL
start http://localhost
call npm run dev

:fim
pause
