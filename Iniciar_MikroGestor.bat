@echo off
title MikroGestor
chcp 65001 >NUL

:: ─────────────────────────────────────────────────────────────────────────────
:: AUTO-ELEVAÇÃO: Se não for Admin, relança como Admin automaticamente
:: ─────────────────────────────────────────────────────────────────────────────
net session >NUL 2>&1
if %errorlevel% neq 0 (
    echo Solicitando permissao de Administrador...
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

:: ─────────────────────────────────────────────────────────────────────────────
:: CONFIGURAÇÃO
:: ─────────────────────────────────────────────────────────────────────────────
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
cd /d "%ROOT%"

echo.
echo  =====================================================
echo        MikroGestor - Iniciando na porta 80
echo  =====================================================
echo.

:: ─── [1/3] node_modules ────────────────────────────────────────────────────
if not exist "%ROOT%\node_modules\" (
    echo  [1/3] Instalando dependencias...
    call npm install
    echo.
) else (
    echo  [1/3] Dependencias OK
)

:: ─── [2/3] Build de producao ───────────────────────────────────────────────
if not exist "%ROOT%\.next\BUILD_ID" (
    echo  [2/3] Compilando... aguarde 2-3 min...
    call npx next build
    if errorlevel 1 (
        echo.
        echo  [ERRO] Falha na compilacao. Verifique acima.
        pause
        exit /b 1
    )
) else (
    echo  [2/3] Build de producao OK
)

:: ─── [3/3] Libera porta 80 e inicia ───────────────────────────────────────
echo  [3/3] Verificando porta 80...

:: Mata qualquer processo na porta 80 (Caddy antigo, etc.)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":80 " ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >NUL 2>&1
)

:: Pequena pausa para liberar a porta
timeout /t 1 /nobreak >NUL

:: Inicia Caddy como bonus (injeta X-Real-IP), se existir
set "CADDY_EXE=%ROOT%\caddy\caddy.exe"
if exist "%CADDY_EXE%" (
    echo  [+] Caddy detectado - usando como proxy reverso
    taskkill /f /im caddy.exe >NUL 2>&1
    start "Caddy" /MIN cmd /c "cd /d "%ROOT%" && "%CADDY_EXE%" run --config "%ROOT%\Caddyfile" >NUL 2>&1"
    timeout /t 2 /nobreak >NUL
    echo  [OK] Proxy reverso ativo: porta 80 -> 3000
    echo.
    echo  =====================================================
    echo   Servidor MikroGestor rodando em TODAS as interfaces:
    echo   - Acesso Local:  http://localhost
    echo   - Acesso na Rede: http://^<IP_DESTE_PC^>
    echo   NAO FECHE ESTA JANELA.  Ctrl+C para parar.
    echo  =====================================================
    echo.
    timeout /t 2 /nobreak >NUL
    start "" "http://localhost"
    cd /d "%ROOT%"
    call npx next start -H 0.0.0.0 -p 3000
) else (
    echo  [+] Sem Caddy - Next.js direto na porta 80
    echo.
    echo  =====================================================
    echo   Servidor MikroGestor rodando em TODAS as interfaces:
    echo   - Acesso Local:  http://localhost
    echo   - Acesso na Rede: http://^<IP_DESTE_PC^>
    echo   NAO FECHE ESTA JANELA.  Ctrl+C para parar.
    echo  =====================================================
    echo.
    timeout /t 2 /nobreak >NUL
    start "" "http://localhost"
    cd /d "%ROOT%"
    call npx next start -H 0.0.0.0 -p 80
)

echo.
echo  Servidor encerrado.
pause
