#!/bin/bash

echo "===================================="
echo "Portal CDU - Unimed Bauru"
echo "Iniciando servidor local..."
echo "===================================="
echo ""
echo "IMPORTANTE: Não feche esta janela!"
echo "Para encerrar, feche o navegador primeiro."
echo ""

# Verifica se Python está instalado
if ! command -v python3 &> /dev/null
then
    echo "ERRO: Python não encontrado!"
    echo ""
    echo "Por favor, instale Python:"
    echo "https://www.python.org/downloads/"
    echo ""
    exit 1
fi

# Abre o navegador
echo "Abrindo o portal no navegador..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open http://localhost:8080
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open http://localhost:8080 &> /dev/null
fi

# Inicia o servidor
python3 -m http.server 8080
