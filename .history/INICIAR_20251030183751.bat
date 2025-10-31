@echo off
echo.
echo ============================================
echo   CONECTATEA - Inicializador Completo
echo ============================================
echo.

cd backend

echo [1/3] Verificando dependencias...
call npm install
echo.

echo [2/3] Criando banco de dados SQLite...
node -e "require('./config/database-sqlite')"
echo.

echo [3/3] Iniciando servidor...
npm start
