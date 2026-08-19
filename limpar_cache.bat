@echo off
title MikroGestor - Limpeza de Cache
chcp 65001 >NUL

echo ==================================================
echo         Efetuando Limpeza e Reinicialização...
echo ==================================================
echo.

echo [1/3] Parando servidores ativos...
taskkill /f /im node.exe 2>NUL
taskkill /f /im caddy.exe 2>NUL
timeout /t 2 /nobreak >NUL

echo [2/3] Removendo pastas de cache temporárias (.next)...
if exist ".next\" (
    rmdir /s /q ".next"
    echo [OK] Cache .next removido com sucesso.
) else (
    echo [INFO] Pasta .next não existia ou já foi removida.
)

echo [3/3] Reiniciando o MikroGestor do zero...
timeout /t 2 /nobreak >NUL
start Iniciar_MikroGestor.bat

echo [OK] Tudo limpo! O console reiniciará em instantes.
exit
