@echo off
echo ====================================
echo Portal CDU - Unimed Bauru
echo Iniciando servidor local...
echo ====================================
echo.
echo IMPORTANTE: Nao feche esta janela!
echo Para encerrar, feche o navegador primeiro.
echo.

REM Verifica se Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Python nao encontrado!
    echo.
    echo Por favor, instale Python:
    echo https://www.python.org/downloads/
    echo.
    echo Durante a instalacao, marque a opcao:
    echo "Add Python to PATH"
    echo.
    pause
    exit
)

REM Inicia o servidor Python na porta 8080
echo Abrindo o portal no navegador...
start http://localhost:8080

REM Inicia o servidor
python -m http.server 8080

pause
