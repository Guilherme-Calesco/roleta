# Plano: Roleta de Prêmios — Casamento Emillene & Caio

## Context

Brincadeira interativa para o **casamento de Emillene & Caio**: os convidados acessam a aplicação web pelo celular, fazem um PIX simbólico para os noivos no valor que quiserem, giram uma roleta e ganham um prêmio (lembrancinha / brinde). Existe um **prêmio master** especial que só pode cair depois que o total arrecadado pelos noivos ultrapassar um valor configurável. O convidado recebe um voucher digital + PDF para resgate. Há também uma **rota oculta** (acessada pelos noivos durante a festa) com uma roleta ponderada pelo valor que cada convidado pagou, sorteando o "Prêmio Máximo" da noite.

A estética do app deve combinar com o casamento: paleta dourada/champagne (já fornecida no CSS), tipografia clássica (Cormorant Garamond + Montserrat), tom elegante e festivo, com referências ao casal ("Emillene & Caio", data do casamento, etc.).

**Decisões consolidadas:**
- Stack: Node.js + Express + EJS + Mongoose
- PIX: QR Code dinâmico (BR Code/EMV) gerado server-side a partir da chave PIX dos noivos + valor
- Rota oculta: URL com hash secreta (sem senha) — usada pelos noivos no telão durante a festa
- PDF: voucher de casamento estilizado com nome do convidado, prêmio, data e código de resgate
- Regra master: desbloqueado após soma global de PIX recebido ≥ threshold
- Confirmação PIX: botão manual após 30s (sem webhook)
- Roleta: slot machine vertical
- Probabilidade não-master: equiprovável

---

## Personalização "Casamento Emillene & Caio"

Aplicar em todas as telas, no PDF e no `<title>`:

- **Nome do app / título principal**: "Casamento Emillene & Caio" (ou "Emillene ♥ Caio")
- **Tagline na tela inicial**: algo como *"Faça parte da nossa história — gire a roleta e ganhe uma lembrança!"*
- **Footer global**: "Com amor, Emillene & Caio • {{DATA_DO_CASAMENTO}}"
- **Tela do nome**: "Qual é o seu nome, convidado(a)?"
- **Tela do valor**: "Sua contribuição para a lua de mel" (em vez de "valor a apostar")
- **Tela PIX**: "Faça o PIX com carinho 💛 — Emillene & Caio agradecem"
- **Tela roleta**: "Hora de girar a roleta da sorte!"
- **Tela resultado**: "Parabéns, {{nome}}! Você ganhou:"
- **Voucher (PDF e página)**: header "Voucher do Casamento — Emillene & Caio", subtítulo com a data
- **Rota oculta**: título "Sorteio do Grande Prêmio — Emillene & Caio"

Variáveis configuráveis no `.env` para evitar hardcode:
```
COUPLE_NAMES=Emillene & Caio
WEDDING_DATE=2026-XX-XX     # data oficial do casamento
WEDDING_HASHTAG=#EmilleneECaio2026
```
Essas variáveis ficam disponíveis em `res.locals` e podem ser usadas em qualquer view EJS.

---

## Arquitetura

Monolito Express servindo HTML via EJS + JS vanilla no front. MongoDB Atlas (ou plugin Mongo do Railway) via Mongoose. Tudo em um único processo Node, deploy direto no Railway com `npm start`.

### Estrutura de pastas

```
projeto-caio/
├── package.json
├── .env.example
├── .gitignore
├── Procfile                        (web: node server.js)
├── server.js                       Entry point Express
├── config/
│   ├── db.js                       Conexão Mongoose
│   └── prizes.json                 Lista de prêmios + master
├── models/
│   └── Player.js                   Schema do convidado
├── routes/
│   ├── game.js                     Fluxo principal do jogo
│   ├── voucher.js                  Voucher público + PDF
│   └── admin.js                    Rota oculta dos noivos (hash)
├── services/
│   ├── pixService.js               Geração do BR Code (payload EMV)
│   ├── qrService.js                Gera QR como data URL (lib: qrcode)
│   ├── rouletteService.js          Sorteio com regra do master
│   └── pdfService.js               Gera voucher PDF
├── views/
│   ├── partials/{header,footer}.ejs    Header com "Emillene & Caio", footer com data
│   ├── name.ejs                    Tela 1: nome do convidado
│   ├── value.ejs                   Tela 2: valor da contribuição
│   ├── pix.ejs                     Tela 3: QR PIX + countdown 30s
│   ├── roulette.ejs                Tela 4: slot machine
│   ├── result.ejs                  Tela 5: card do prêmio + QR voucher
│   ├── voucher.ejs                 Página voucher (acessada via QR)
│   └── final-roulette.ejs          Rota oculta (sorteio do prêmio máximo)
└── public/
    ├── css/style.css               CSS fornecido + complementos do casamento
    ├── js/{name,value,pix,roulette,final-roulette}.js
    ├── img/                        ornamentos (monograma E&C, flores, etc — opcional)
    └── fonts/                      (Cormorant Garamond + Montserrat via Google Fonts)
```

---

## Modelo de dados (MongoDB)

### `Player` (representa um convidado que jogou)
- `_id` (ObjectId)
- `name` (String, obrigatório) — nome do convidado
- `amountPaid` (Number, em reais com 2 casas decimais) — valor que o convidado contribuiu
- `pixConfirmed` (Boolean) — true após clicar "CONFIRMAR PIX"
- `prize` (Object | null) — `{ name, isMaster }`, preenchido após o spin
- `voucherHash` (String, único) — gerado com `crypto.randomUUID()` para a rota `/voucher/:hash`
- `redemptionCode` (String) — código curto tipo `ABCD-1234` para mostrar no PDF
- `createdAt` (Date)
- `spunAt` (Date | null)
- `finalRouletteWinner` (Boolean, default false) — marcado quando ganha a roleta final dos noivos

Índices: `voucherHash` (unique), `createdAt`.

---

## Configuração (env vars)

```
MONGODB_URI=mongodb+srv://...
PIX_KEY=chave-pix-dos-noivos
PIX_RECEIVER_NAME=NOME RECEBEDOR        # nome que aparece no comprovante PIX (ex: CAIO ...)
PIX_RECEIVER_CITY=CIDADE
COUPLE_NAMES=Emillene & Caio
WEDDING_DATE=2026-XX-XX
WEDDING_HASHTAG=#EmilleneECaio2026
MASTER_THRESHOLD=500                    # em reais; master só desbloqueia após soma >= 500
MASTER_AWARD_MODE=once                  # "once" (cai 1x e some) | "chance" (X% após threshold)
MASTER_CHANCE_PERCENT=10                # usado se MASTER_AWARD_MODE=chance
ADMIN_HASH=alguma-string-secreta-grande # parte da URL oculta /admin/final/<hash>
BASE_URL=https://seu-app.up.railway.app
SESSION_SECRET=...
PORT=3000
```

`config/prizes.json`:
```json
{
  "master": { "name": "Prêmio Master Emillene & Caio (placeholder)" },
  "regular": [
    { "name": "Lembrancinha A" },
    { "name": "Lembrancinha B" },
    { "name": "Lembrancinha C" }
  ]
}
```

---

## Fluxo de rotas

| Método | Rota | Função |
|---|---|---|
| GET | `/` | Tela 1 — boas-vindas + nome do convidado |
| POST | `/game/name` | Salva nome em sessão, redireciona |
| GET | `/game/value` | Tela 2 — valor da contribuição |
| POST | `/game/value` | Salva valor em sessão, redireciona |
| GET | `/game/pix` | Tela 3 — QR Code PIX gerado + countdown 30s |
| POST | `/game/confirm` | Cria `Player` no Mongo, marca `pixConfirmed=true`, retorna `playerId` |
| GET | `/game/roulette/:id` | Tela 4 — slot machine pronta para girar |
| POST | `/game/spin/:id` | Sorteia prêmio server-side, atualiza Player, retorna prêmio + hash |
| GET | `/game/result/:id` | Tela 5 — card do prêmio + QR Code para `/voucher/:hash` |
| GET | `/voucher/:hash` | Página pública com nome do prêmio + botão baixar PDF |
| GET | `/voucher/:hash/pdf` | Stream do PDF do voucher de casamento |
| GET | `/admin/final/:adminHash` | Rota oculta dos noivos — roleta ponderada |
| POST | `/admin/final/:adminHash/spin` | Sorteia convidado vencedor (peso = amountPaid) |

Sessão via `express-session` com cookie + `SESSION_SECRET` no env.

---

## Lógica crítica — `services/rouletteService.js`

### Sorteio do prêmio (convidado atual)

```
function pickPrize(player):
  totalAccumulated = soma de Player.amountPaid onde pixConfirmed=true
  masterUnlocked   = totalAccumulated >= MASTER_THRESHOLD

  if MASTER_AWARD_MODE == "once":
    masterAlreadyAwarded = existe Player com prize.isMaster=true
    if masterUnlocked AND NOT masterAlreadyAwarded:
      return masterPrize           # cai master nessa rodada
    else:
      return random pick em regular[]   # equiprovável

  if MASTER_AWARD_MODE == "chance":
    if masterUnlocked AND random() < MASTER_CHANCE_PERCENT/100:
      return masterPrize
    else:
      return random pick em regular[]
```

### Sorteio da roleta final (rota oculta dos noivos)

```
players = Player.find({ pixConfirmed: true })
totalWeight = sum of amountPaid
r = random(0, totalWeight)
acc = 0
for p in players:
  acc += p.amountPaid
  if r <= acc: return p
```

Animação: o front recebe a lista + o vencedor, anima passando os nomes em alta velocidade no estilo slot, desacelera, para no vencedor. A largura visual do bloco de cada convidado na faixa que passa é proporcional a `amountPaid`.

---

## Geração do PIX BR Code (`services/pixService.js`)

Implementação manual do payload EMV (sem lib externa). Campos:
- `00` Payload Format Indicator = "01"
- `26` Merchant Account Info — sub-campo `00` GUI = "br.gov.bcb.pix" + sub-campo `01` Chave PIX
- `52` Merchant Category Code = "0000"
- `53` Currency = "986" (BRL)
- `54` Amount (valor)
- `58` Country = "BR"
- `59` Receiver Name (até 25 chars) — nome do recebedor PIX
- `60` City (até 15 chars)
- `62` Additional Data — sub-campo `05` TXID = "EMILLENECAIO" (ou "***")
- `63` CRC16-CCITT do payload completo até "6304"

CRC16-CCITT (poly 0x1021, init 0xFFFF) — implementação ~10 linhas.

Em seguida `qrcode.toDataURL(payload)` renderiza no `<img>`.

---

## Front-end por tela (com personalização do casamento)

Todas as telas usam o CSS fornecido (`--gold-dark`, `.card`, `.button-premium`) + Google Fonts (Cormorant Garamond + Montserrat). Header com monograma "E & C" ou texto "Emillene & Caio" em Cormorant. Footer com a data do casamento.

- **`name.ejs`** (Tela 1): card central com headline "Casamento Emillene & Caio", subtítulo "Gire a roleta da sorte e ganhe uma lembrança", input "Seu nome", botão `.button-premium` "PRÓXIMO".
- **`value.ejs`** (Tela 2): card com texto "Sua contribuição para a lua de mel", input numérico (máscara R$), botão "GERAR PIX".
- **`pix.ejs`** (Tela 3): card com texto "Faça o PIX com carinho 💛", `<img>` do QR, chave PIX copy-paste, countdown 30s desabilitando o botão. Após 30s libera "CONFIRMAR PIX".
- **`roulette.ejs`** (Tela 4): título "Hora de girar a roleta!", container vertical viewport ~120px mostrando 1 prêmio por vez, lista de prêmios em loop infinito (`transform: translateY`). Botão "GIRAR" → POST `/game/spin/:id` → recebe prêmio → animação até parar nele (~5s, easing cubic-bezier). Redireciona para `/game/result/:id`.
- **`result.ejs`** (Tela 5): card grande "Parabéns, {{nome}}! Você ganhou:" + nome do prêmio em destaque + QR Code para `/voucher/:hash` + texto "Aponte a câmera do seu celular para resgatar".
- **`voucher.ejs`**: header "Voucher do Casamento • Emillene & Caio", nome do prêmio, nome do convidado, código, botão "BAIXAR VOUCHER (PDF)".
- **`final-roulette.ejs`** (rota oculta): título "Grande Prêmio — Emillene & Caio". Lista de convidados com barras horizontais proporcionais a `amountPaid` (visualização da ponderação). Botão "SORTEAR PRÊMIO MÁXIMO" → animação slot vertical com nomes (frequência proporcional ao peso) → para no vencedor.

---

## Geração do PDF (`services/pdfService.js`)

Lib: `pdfkit`. Voucher A4 retrato com tema do casamento:
- Header: "VOUCHER DO CASAMENTO" em Cormorant Garamond + linha decorativa dourada + monograma/nome "Emillene & Caio"
- Subtítulo com a `WEDDING_DATE` formatada
- Bloco central: "Convidado: {{nome}}", "Prêmio: {{prizeName}}" (em destaque), "Data do sorteio: {{spunAt}}", "Código de resgate: {{redemptionCode}}"
- Borda dourada simulando o `.card` (retângulo com cor `--gold`)
- Footer: "Apresente este voucher para resgatar seu presente" + URL do voucher + hashtag

Stream direto na response: `res.setHeader('Content-Disposition', 'attachment; filename="voucher-casamento.pdf"')`.

---

## Bibliotecas (package.json)

```
express, ejs, mongoose, dotenv, express-session,
qrcode, pdfkit, nanoid (códigos de resgate)
```

Dev: `nodemon` opcional.

---

## Arquivos críticos a criar/editar

- `server.js` — bootstrap Express, sessão, EJS, rotas, conexão Mongo, `res.locals.couple`/`res.locals.weddingDate`
- `config/db.js` — `mongoose.connect`
- `config/prizes.json` — lista placeholder até você passar a definitiva
- `models/Player.js` — schema acima
- `services/pixService.js` — gerador BR Code + CRC16
- `services/rouletteService.js` — `pickPrize` + `pickFinalWinner`
- `services/pdfService.js` — voucher PDF do casamento
- `services/qrService.js` — wrapper de `qrcode.toDataURL`
- `routes/game.js`, `routes/voucher.js`, `routes/admin.js`
- `views/` — todas as 7 páginas EJS + 2 partials, todas com a marca Emillene & Caio
- `public/css/style.css` — CSS fornecido + complementos de layout
- `public/js/` — JS de cada tela
- `.env.example`, `.gitignore`, `Procfile`, `README.md`

---

## Deploy Railway

1. `railway init` no diretório
2. Adicionar plugin MongoDB (ou usar Atlas e colar URI)
3. Definir todas as env vars no painel Railway (incluindo `COUPLE_NAMES`, `WEDDING_DATE`, `PIX_KEY` etc)
4. Push: Railway detecta `package.json` com `"start": "node server.js"` e sobe automaticamente
5. `BASE_URL` deve ser preenchida com a URL gerada pelo Railway (necessária para o QR Code do voucher apontar para o domínio público — caso contrário o QR aponta pra localhost e quebra)
6. Recomendado: gerar QR Code da URL inicial do app e imprimir nas mesas do casamento para os convidados acessarem

---

## Verificação end-to-end

1. **Local**: `npm install && npm start` com `.env` apontando para Mongo local ou Atlas.
2. **Fluxo feliz**: abrir `/`, digitar nome → valor → checar QR PIX abre app bancário com chave/valor corretos → aguardar 30s → confirmar → ver roleta girar → ver card do prêmio → escanear QR com celular → abrir voucher → baixar PDF (verificar que mostra "Emillene & Caio" e a data).
3. **Master prize**:
   - Configurar `MASTER_THRESHOLD=10`.
   - Jogar 2x com `amountPaid=5` cada → master ainda não pode cair.
   - Jogar a 3ª vez → soma=15 ≥ 10 → master cai (modo `once`) ou tem chance (modo `chance`).
4. **Persistência**: conferir no Mongo que `Player` tem todos os campos preenchidos.
5. **Voucher hash**: copiar URL do QR, abrir em outra aba, baixar PDF, conferir conteúdo personalizado.
6. **Rota oculta**: acessar `/admin/final/<ADMIN_HASH>` → ver lista de convidados com pesos visuais → girar → conferir que convidados com `amountPaid` maior aparecem mais frequentemente em múltiplas execuções.
7. **Rota oculta protegida**: acessar `/admin/final/hash-errado` → 404.
8. **Mobile**: testar no celular (telas devem ser responsivas — convidados acessarão via QR Code impresso nas mesas).
9. **Deploy Railway**: repetir fluxo na URL pública, conferir QR do voucher apontando para domínio público.

---

## Pontos a confirmar com você antes/durante a implementação

1. **Lista de prêmios definitiva** + **nome do prêmio master** (você disse que envia depois — usarei placeholders).
2. **Chave PIX, nome do recebedor e cidade** dos noivos (você disse que envia depois — placeholders no `.env.example`).
3. **Valor do `MASTER_THRESHOLD`** (você disse que envia depois).
4. **Modo do master**: cai 1x e some (`once`) ou tem X% de chance após threshold (`chance`)? Default `once`.
5. **Data oficial do casamento** para preencher `WEDDING_DATE`.
6. **Hashtag oficial** do casamento (ou usar `#EmilleneECaio` como default).
7. Quer **monograma "E & C"** ou **logo** customizado? Se tiver imagem, posso integrar nas telas e no PDF.
