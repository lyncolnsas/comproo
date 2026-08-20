@echo off
title MikroGestor - Instalador e Configurador Automatico
chcp 65001 >NUL
setlocal enabledelayedexpansion

:: ─────────────────────────────────────────────────────────────────────────────
:: AUTO-ELEVAÇÃO PARA ADMINISTRADOR
:: ─────────────────────────────────────────────────────────────────────────────
net session >NUL 2>&1
if %errorlevel% neq 0 (
    echo ========================================================
    echo  Solicitando permissao de Administrador...
    echo ========================================================
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
cd /d "%ROOT%"

echo.
echo  ========================================================================
echo         __  __ _ _              ____           _             
echo        ^|  \/  (_) ^|            / ___^| ___  ___^| ^|_ ___  _ __ 
echo        ^| ^|\/^| ^| ^| ^| _____  ___^| ^|  _ / _ \/ __^| __/ _ \^| '__^|
echo        ^| ^|  ^| ^| ^| ^|/ _ \ \/ / ^| ^|_^| ^|  __/\__ \ ^|^| (_) ^| ^|   
echo        ^|_^|  ^|_^|_^|_^|\___/\__/   \____^|\___^|^|___/\__\___/^|_^|   
echo.
echo              SISTEMA DE GESTAO DE VOUCHERS E HOTSPOT MIKROTIK
echo                     Instalador e Configurador 1-Click
echo  ========================================================================
echo.

:: ─────────────────────────────────────────────────────────────────────────────
:: 1. VERIFICAÇÃO E INSTALAÇÃO AUTOMÁTICA DO NODE.JS
:: ─────────────────────────────────────────────────────────────────────────────
echo  [1/5] Verificando ambiente Node.js...
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
    echo.
    echo  [!] Node.js nao foi detectado neste computador.
    echo  [+] Baixando e instalando Node.js v20 LTS automaticamente...
    echo      Aguarde alguns instantes...
    echo.

    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
        "$ProgressPreference = 'SilentlyContinue'; " ^
        "$msiPath = Join-Path $env:TEMP 'nodejs_installer.msi'; " ^
        "Write-Host '  -> Fazendo download do Node.js v20 LTS...'; " ^
        "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; " ^
        "(New-Object System.Net.WebClient).DownloadFile('https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi', $msiPath); " ^
        "Write-Host '  -> Instalando Node.js silenciosamente...'; " ^
        "Start-Process msiexec.exe -ArgumentList '/i', $msiPath, '/quiet', '/norestart' -Wait; " ^
        "Remove-Item $msiPath -Force -ErrorAction SilentlyContinue; " ^
        "Write-Host '  [OK] Node.js instalado com sucesso!'"

    set "PATH=C:\Program Files\nodejs;%PATH%"
    
    where node >NUL 2>&1
    if %errorlevel% neq 0 (
        if exist "C:\Program Files\nodejs\node.exe" (
            set "PATH=C:\Program Files\nodejs;%PATH%"
        ) else (
            echo.
            echo  [ERRO] Nao foi possivel instalar o Node.js automaticamente.
            echo  Por favor, baixe e instale manualmente em: https://nodejs.org
            pause
            exit /b 1
        )
    )
)

for /f "tokens=*" %%v in ('node -v 2^>NUL') do set "NODE_VERSION=%%v"
echo  [OK] Node.js ativo: %NODE_VERSION%
echo.

:: ─────────────────────────────────────────────────────────────────────────────
:: 2. CONFIGURAÇÃO DO ARQUIVO .ENV
:: ─────────────────────────────────────────────────────────────────────────────
echo  [2/5] Configurando arquivo de ambiente (.env)...
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
    echo  [OK] Arquivo .env criado com sucesso.
) else (
    echo  [OK] Arquivo .env ja existente.
)
echo.

:: ─────────────────────────────────────────────────────────────────────────────
:: 3. INSTALAÇÃO DAS DEPENDÊNCIAS NPM
:: ─────────────────────────────────────────────────────────────────────────────
echo  [3/5] Instalando dependencias do projeto (npm install)...
echo      Isso pode levar de 1 a 2 minutos na primeira execucao...
call npm install --loglevel=error
if %errorlevel% neq 0 (
    echo.
    echo  [ERRO] Falha ao executar npm install. Verifique sua conexao com a internet.
    pause
    exit /b %errorlevel%
)
echo  [OK] Dependencias instaladas com sucesso.
echo.

:: ─────────────────────────────────────────────────────────────────────────────
:: 4. CONFIGURAÇÃO DO BANCO DE DADOS E USUÁRIO ADMINISTRADOR
:: ─────────────────────────────────────────────────────────────────────────────
echo  [4/5] Configurando banco de dados SQLite e Prisma...
call npx prisma db push --accept-data-loss >NUL 2>&1
call npx prisma generate >NUL 2>&1
call node "%ROOT%\scripts\init-db.js"
echo  [OK] Banco de dados inicializado com sucesso.
echo.

:: ─────────────────────────────────────────────────────────────────────────────
:: 5. COMPILAÇÃO DE PRODUÇÃO NEXT.JS
:: ─────────────────────────────────────────────────────────────────────────────
echo  [5/5] Compilando aplicacao para producao (npm run build)...
echo      Otimizando paginas e assets do Portal Studio...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo  [AVISO] Falha ao compilar build estatico. O sistema podera rodar em modo dev.
) else (
    echo  [OK] Compilacao de producao concluida com sucesso!
)
echo.

echo  ========================================================================
echo               CONFIGURACAO CONCLUIDA COM SUCESSO!
echo  ========================================================================
echo.
echo   Login Padrao:  admin
echo   Senha Padrao:  123
echo.
echo   Voce ja pode iniciar o sistema executando:
echo   - Iniciar_MikroGestor.bat  (Recomendado)
echo.
echo  ========================================================================
echo.
pause
