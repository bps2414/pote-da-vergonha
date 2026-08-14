# 🚨 Quem Falta Se Ferra - Bate-Ponto Escolar (PWA)

<p align="center">
  <img src="assets/icon.svg" width="120" height="120" alt="Logo Quem Falta Se Ferra" />
</p>

<p align="center">
  <b>Quem falta se ferra!</b> Aplicativo Web Mobile-First (PWA) de gamificação social para amigos de cidades diferentes combaterem a falta na escola através do cofre de multas do Quem Falta Se Ferra, comprovação de presença com fotos no estilo BeReal, julgamento ao vivo no Tribunal dos Amigos e extrato de cobrança PIX com confirmação em 2 etapas.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Pronto%20para%20Deploy-00e599?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Plataforma-Vercel%20%7C%20PWA-07090e?style=for-the-badge" alt="Plataforma" />
  <img src="https://img.shields.io/badge/Licen%C3%A7a-MIT-ffb703?style=for-the-badge" alt="Licença" />
</p>

---

## 📱 Funcionalidades Principais

1. **📸 Bate-Ponto BeReal com Carimbo Automático**:
   - Captura com câmera frontal/traseira ou upload direto do celular.
   - Carimbo automático no Canvas com **Data, Hora exata, Nome do Estudante e Cidade**.
2. **⚖️ Tribunal dos Amigos ao Vivo**:
   - Feed instantâneo com fotos enviadas no dia pelos amigos de qualquer cidade.
   - Votação em tempo real: **"👍 VÁLIDO"** vs **"🚨 FRAUDE/GOLPE"**.
   - Barra de consenso dinâmico e botões de reações sonoras (😂 Deboche, 👏 Palmas, 💀 Morte).
3. **💰 Pote da Vergonha (Multas Financeiras)**:
   - Cada falta ou foto reprovada soma uma multa automática (ex: R$ 5,00 ou R$ 10,00) ao devedor.
   - Banner do **Maior Patrocinador do Mês** para zoar quem mais falta.
4. **💸 Extrato Financeiro & Confirmação em 2 Etapas (Anti-Calote)**:
   - Divisão proporcional do prêmio para quem teve 100% de presença.
   - Botão **"📢 Cobrar no Zap"** com mensagem formatada, valor e chave PIX do credor.
   - **Etapa 1 (Devedor)**: Clica em *"Já Paguei"*.
   - **Etapa 2 (Credor)**: Confere o app do banco e clica em *"Confirmar Recebimento"* ou *"Não Caiu"*.
5. **🏆 Ranking, Títulos & Loja de Cartas (XP)**:
   - Títulos automáticos: *Patrocinador do Bonde*, *Aluno Fantasma*, *Nerd Supremo (100%)*, *Mestre do Alarme*.
   - Loja de Cartas compradas com XP de presença:
     - 📜 **Atestado Médico Virtual** (Anula 1 falta e remove a multa).
     - ⏰ **Bomba de Despertador** (Toca som de alarme no app do amigo).
     - 🛡️ **Escudo de Tolerância** (+45 min de prazo para o check-in).
6. **⚡ Sincronização em Tempo Real (`Auto-Sync`)**:
   - Backend Serverless com auto-polling a cada 3s.
   - Suporte a múltiplos amigos em diferentes cidades conectados na mesma sala.

---

## 🏗️ Estrutura do Projeto

```
pote-da-vergonha/
├── index.html            # Interface Mobile-First com todas as abas e modais
├── manifest.json         # Configuração PWA para instalação no celular
├── service-worker.js     # Cache offline e inicialização instantânea
├── vercel.json           # Configuração de rotas Serverless e headers de segurança
├── server.js             # Servidor local Node.js (zero dependências)
├── package.json          # Metadados e scripts
├── api/
│   └── rooms.js          # API Serverless com suporte a Vercel KV / Upstash Redis
├── styles/
│   ├── main.css          # Design tokens, tipografia e layout responsivo
│   ├── components.css    # Componentes (Pote, Tribunal, Extrato PIX, Loja XP)
│   └── animations.css    # Micro-animações e reações flutuantes
└── js/
    ├── app.js            # Controlador principal e roteamento
    ├── state.js          # Estado reativo e Auto-Sync
    ├── storage.js        # Persistência e sincronização
    ├── camera.js         # Captura de câmera e carimbo BeReal
    ├── tribunal.js       # Votação do tribunal e sons
    ├── pot-finance.js    # Extrato e confirmação de 2 etapas
    ├── gamification.js   # Ranking, títulos e lojinha
    ├── audio.js          # Sintetizador procedural Web Audio API
    └── mock-data.js      # Dados iniciais para teste imediato
```

---

## 🚀 Como Rodar Localmente

Certifique-se de ter o [Node.js](https://nodejs.org) (v18+) instalado.

```bash
# 1. Entre na pasta do projeto
cd f:/Projetinhos/geminijogo

# 2. Inicie o servidor local (zero dependências externas necessárias)
npm start
# ou
node server.js
```

Abra no navegador em: **[http://localhost:3000](http://localhost:3000)**

---

## ☁️ Como Publicar na Vercel

O projeto já está 100% pronto para publicação na Vercel.

### Método 1: Pelo Vercel CLI (Direto do Terminal)
```bash
# 1. Instale o CLI da Vercel globalmente
npm i -g vercel

# 2. Na pasta do projeto, execute:
vercel
```

### Método 2: Pelo GitHub + Painel da Vercel
1. Crie um repositório no seu GitHub (ex: `pote-da-vergonha`).
2. Vincule e suba os arquivos:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git branch -M main
   git push -u origin main
   ```
3. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório.
4. Clique em **Deploy**.

*(Opcional para persistência na nuvem)*: No painel do seu projeto na Vercel, acesse a aba **Storage** ➔ **Create Database** ➔ **KV (Redis)** para ativar o banco gratuito em nuvem!

---

## 📜 Licença

Distribuído sob a licença MIT. Sinta-se livre para usar, modificar e jogar com sua turma!
