# Instruções para Uso Offline do Portal CDU

## Preparação (Fazer UMA VEZ)

### 1. Exportar o Projeto para GitHub
- Clique no botão **GitHub** (canto superior direito)
- Conecte sua conta GitHub
- O código será transferido automaticamente

### 2. Preparar o Portal para Offline (No seu computador)

Abra o terminal/prompt de comando e execute:

```bash
# 1. Clone o projeto do GitHub
git clone [URL-DO-SEU-REPOSITORIO]
cd [NOME-DA-PASTA]

# 2. Instale as dependências
npm install

# 3. Crie a versão offline (build)
npm run build
```

Após executar esses comandos, uma pasta chamada **dist** será criada com todos os arquivos necessários.

---

## Como Usar em Qualquer Máquina (OFFLINE)

### Opção 1: Windows

1. Copie a pasta **dist** para o computador
2. Copie o arquivo **iniciar-portal.bat** para dentro da pasta **dist**
3. Dê duplo clique no arquivo **iniciar-portal.bat**
4. O portal abrirá automaticamente no navegador

### Opção 2: Mac/Linux

1. Copie a pasta **dist** para o computador
2. Copie o arquivo **iniciar-portal.sh** para dentro da pasta **dist**
3. Abra o terminal na pasta **dist**
4. Execute: `chmod +x iniciar-portal.sh`
5. Execute: `./iniciar-portal.sh`
6. O portal abrirá automaticamente no navegador

---

## Observações Importantes

- ✅ **Funciona 100% offline** - não precisa de internet
- ✅ **Dados salvos localmente** - cada máquina terá seus próprios dados no navegador
- ✅ **Mesma pasta em várias máquinas** - copie a pasta **dist** para quantas máquinas precisar
- ⚠️ **Não feche a janela preta** (terminal/prompt) enquanto estiver usando o portal
- ⚠️ **Para fechar**: Feche o navegador primeiro, depois a janela preta

---

## Compartilhamento de Dados Entre Máquinas

Como cada máquina salva dados localmente, para compartilhar dados:

1. No portal, vá em **Configurações**
2. Clique em **Exportar Todos os Dados**
3. Salve o arquivo JSON
4. Na outra máquina, vá em **Configurações**
5. Clique em **Importar Dados**
6. Selecione o arquivo JSON exportado
