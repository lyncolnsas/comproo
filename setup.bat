@echo off
echo ========================================================
echo MIKROGESTOR VOUCHER - SCRIPT DE CONFIGURACAO E INSTALACAO
echo ========================================================
echo.

echo 1. Copiando arquivo de configuracao .env...
if not exist .env (
    copy .env.example .env
    echo Arquivo .env criado com sucesso.
) else (
    echo Arquivo .env ja existe, pulando...
)
echo.

echo 2. Instalando dependencias do Node.js...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERRO: Falha ao instalar dependencias. Verifique se o Node.js esta instalado.
    pause
    exit /b %errorlevel%
)
echo.

echo 3. Configurando banco de dados e criando usuario padrao...
call npx prisma db push
call node scripts/init-db.js
if %errorlevel% neq 0 (
    echo.
    echo ERRO: Falha ao configurar o banco de dados.
    pause
    exit /b %errorlevel%
)
echo.

echo ========================================================
echo CONFIGURACAO CONCLUIDA COM SUCESSO!
echo ========================================================
echo Agora voce pode iniciar o sistema executando 'start.bat'
echo.
pause
