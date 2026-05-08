# Roleta de Prêmios — Casamento Emillene & Caio

Aplicação web monolítica (Node.js + Express + EJS + MongoDB) para uma brincadeira no casamento. Convidados acessam pelo celular, fazem um PIX simbólico, giram uma roleta (slot machine) e ganham um voucher digital com PDF para resgate.

## Recursos

- Tela de boas-vindas com nome do convidado
- Tela de valor da contribuição
- Geração de QR Code PIX dinâmico (BR Code/EMV) com a chave dos noivos
- Confirmação manual após countdown de 30s
- Roleta slot machine vertical animada
- Prêmio master configurável que só desbloqueia após acumulado total
- Voucher web + PDF (com `pdfkit`) personalizado com paleta dourada
- Rota oculta dos noivos com sorteio ponderado pelo valor de cada convidado

## Setup local

```bash
npm install
cp .env.example .env
# edite .env com sua chave PIX, MONGODB_URI, ADMIN_HASH, etc
npm start
```

Abra `http://localhost:3000`.

## Variáveis de ambiente

Veja `.env.example`. As mais importantes:

| Variável | Descrição |
|---|---|
| `MONGODB_URI` | Conexão com MongoDB (Atlas ou local) |
| `PIX_KEY` | Chave PIX dos noivos |
| `PIX_RECEIVER_NAME` | Nome do recebedor (max 25 chars) |
| `PIX_RECEIVER_CITY` | Cidade do recebedor (max 15 chars) |
| `MASTER_THRESHOLD` | Soma acumulada (R$) que desbloqueia o prêmio master |
| `MASTER_AWARD_MODE` | `once` (cai 1x) ou `chance` (X% por rodada após threshold) |
| `MASTER_CHANCE_PERCENT` | Probabilidade quando `MASTER_AWARD_MODE=chance` |
| `ADMIN_HASH` | Parte da URL oculta `/admin/final/<hash>` |
| `BASE_URL` | URL pública (importante para o QR do voucher) |
| `COUPLE_NAMES` | Nomes do casal exibidos nas telas |
| `WEDDING_DATE` | Data do casamento exibida nas telas e PDF |

## Configurar prêmios

Edite `config/prizes.json`:

```json
{
  "master": { "name": "Lua de Mel Surpresa" },
  "regular": [
    { "name": "Brinde A" },
    { "name": "Brinde B" }
  ]
}
```

## Deploy no Railway

1. Crie um projeto no Railway e adicione o plugin MongoDB (ou use MongoDB Atlas).
2. Conecte o repositório.
3. Configure todas as env vars no painel Railway.
4. `BASE_URL` deve apontar para a URL pública gerada pelo Railway.
5. Railway detecta `package.json` e usa `npm start` automaticamente.

## Rotas

- `GET /` — tela do nome do convidado
- `GET /game/value` — tela do valor
- `GET /game/pix` — tela do QR Code PIX + countdown
- `POST /game/confirm` — confirma PIX (cria Player no Mongo)
- `GET /game/roulette/:id` — roleta
- `POST /game/spin/:id` — sorteia o prêmio
- `GET /game/result/:id` — card com prêmio + QR para voucher
- `GET /voucher/:hash` — voucher público
- `GET /voucher/:hash/pdf` — PDF do voucher
- `GET /admin/final/<ADMIN_HASH>` — rota oculta dos noivos
- `POST /admin/final/<ADMIN_HASH>/spin` — sorteio do prêmio máximo

## Lógica do prêmio master

Em cada rodada:

1. Calcula `totalAccumulated = SUM(amountPaid)` dos `Player`s com `pixConfirmed=true`.
2. Se `total >= MASTER_THRESHOLD`, master fica elegível.
3. No modo `once`, master cai na próxima jogada elegível e some.
4. No modo `chance`, master tem `MASTER_CHANCE_PERCENT`% de chance por rodada.

## Sorteio final (rota oculta)

Sorteio ponderado: cada convidado ocupa fatia proporcional ao seu `amountPaid`. Visualmente, barras horizontais mostram os pesos.
