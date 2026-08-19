@echo off
title MikroGestor — Instalar Caddy
chcp 65001 >NUL

echo ==================================================
echo   Instalando Caddy (Proxy Reverso) para MikroGestor
echo ==================================================
echo.

:: Diretório de instalação do Caddy
set CADDY_DIR=%~dp0caddy
set CADDY_EXE=%CADDY_DIR%\caddy.exe
set CADDY_URL=https://caddyserver.com/api/download?os=windows&arch=amd64

if exist "%CADDY_EXE%" (
    echo [OK] caddy.exe ja esta presente em %CADDY_DIR%
    goto :done
)

echo [INFO] Baixando Caddy para Windows x64...
if not exist "%CADDY_DIR%" mkdir "%CADDY_DIR%"

:: Tenta com PowerShell (disponivel no Win7+)
powershell -NoProfile -Command ^
  "Invoke-WebRequest -Uri '%CADDY_URL%' -OutFile '%CADDY_EXE%'" ^
  2>NUL

if exist "%CADDY_EXE%" (
    echo [OK] Caddy baixado com sucesso!
    goto :done
)

echo [ERRO] Nao foi possivel baixar automaticamente.
echo.
echo Baixe manualmente em: https://caddyserver.com/download
echo Escolha: Windows  /  amd64
echo Salve o arquivo caddy.exe em: %CADDY_DIR%\caddy.exe
echo.
pause
exit /b 1

:done
echo.
echo Instalacao concluida. Use "Iniciar_MikroGestor.bat" para iniciar o sistema.
pause
