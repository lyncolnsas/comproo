@echo off
title MikroGestor
chcp 65001 >NUL
setlocal enabledelayedexpansion

:: -----------------------------------------------------------------------------
:: AUTO-ELEVA??O: Se n?o for Admin, relan?a como Admin automaticamente
:: -----------------------------------------------------------------------------
net session >NUL 2>&1
if %errorlevel% neq 0 (
    echo ========================================================
    echo  Solicitando permissao de Administrador...
    echo ========================================================
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

:: -----------------------------------------------------------------------------
:: CONFIGURA??O DE DIRET?RIO
:: -----------------------------------------------------------------------------
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
cd /d "%ROOT%"

echo.
echo  ========================================================================
echo          __  __ _ _               ____           _             
echo         ^|  \/  (_) ^| ___ __ ___  / ___^| ___  ___^| ^|_ ___  _ __ 
echo         ^| ^|\/^| ^| ^| ^|/ / '__/ _ \^| ^|  _ / _ \/ __^| __/ _ \^| '__^|
echo         ^| ^|  ^| ^| ^|   ^<^| ^| ^| (_) ^| ^|_^| ^|  __/\__ \ ^|^| (_) ^| ^|   
echo         ^|_^|  ^|_^|_^|_^|\_\_^|  \___/ \____^|\___^|^|___/\__\___/^|_^|   
echo.
echo              SISTEMA DE GESTAO DE VOUCHERS E HOTSPOT MIKROTIK
echo  ========================================================================
echo.

:: -----------------------------------------------------------------------------
:: 1. VERIFICAR NODE.JS
:: -----------------------------------------------------------------------------
set "NODE_OK=0"
where node >NUL 2>&1
if %errorlevel% equ 0 (
    set "NODE_OK=1"
) else (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
        set "NODE_OK=1"
    )
)

if "!NODE_OK!"=="0" (
    echo  [!] Node.js nao encontrado. Executando configurador automatico...
    call "%ROOT%\setup.bat"
    set "PATH=C:\Program Files\nodejs;%PATH%"
)

:: -----------------------------------------------------------------------------
:: 2. VERIFICAR ARQUIVO .ENV E BANCO DE DADOS
:: -----------------------------------------------------------------------------
if not exist "%ROOT%\.env" (
    if exist "%ROOT%\.env.example" (
        copy "%ROOT%\.env.example" "%ROOT%\.env" >NUL
    ) else (
        (
            echo DATABASE_URL="file:./dev.db"
            echo JWT_SECRET="mikrogestor_super_secret_jwt_key_2026"
            echo PORT=80
        ) > "%ROOT%\.env"
    )
)

:: -----------------------------------------------------------------------------
:: 3. VERIFICAR DEPEND?NCIAS NODE_MODULES
:: -----------------------------------------------------------------------------
if not exist "%ROOT%\node_modules\" (
    echo  [!] Dependencias nao encontradas. Instalando agora...
    call npm install --loglevel=error
    call npx prisma db push --accept-data-loss >NUL 2>&1
    call npx prisma generate >NUL 2>&1
    call node "%ROOT%\scripts\init-db.js"
)

:: -----------------------------------------------------------------------------
:: 4. LIBERAR PORTA 80 E INICIAR SERVIDOR
:: -----------------------------------------------------------------------------
echo  [+] Verificando porta 80...

:: Finaliza processos anteriores na porta 80
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":80 " ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >NUL 2>&1
)
timeout /t 1 /nobreak >NUL

:: Obter IP local da m?quina
for /f "tokens=4" %%a in ('route print ^| findstr "0.0.0.0" ^| findstr /v "On-link"') do (
    if not defined LOCAL_IP set "LOCAL_IP=%%a"
)
if "%LOCAL_IP%"=="" set "LOCAL_IP=localhost"

echo.
echo  ========================================================================
echo   Servidor MikroGestor rodando em TODAS as interfaces de rede:
echo.
echo   ?? Painel Administrativo:  http://localhost/dashboard
echo   ?? Acesso na Rede Local:   http://%LOCAL_IP%/dashboard
echo.
echo   ?? Login Padrao:  admin
echo   ?? Senha Padrao:  123
echo.
echo   NAO FECHE ESTA JANELA enquanto estiver usando o sistema.
echo   Pressione Ctrl+C para encerrar.
echo  ========================================================================
echo.

:: Abre o navegador automaticamente
timeout /t 2 /nobreak >NUL
start "" "http://localhost/dashboard"

:: Inicia o Next.js na porta 80
if exist "%ROOT%\.next\BUILD_ID" (
    call npx next start -H 0.0.0.0 -p 80
) else (
    call npx next dev -H 0.0.0.0 -p 80
)

echo.
echo  Servidor encerrado.
pause
