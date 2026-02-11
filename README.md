# Prosono PDFs

Aplicação Next.js para partilha segura de PDFs: acesso com Clerk (email/password), listagem e visualização no browser **sem download**. Os ficheiros ficam em Cloudflare R2.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind
- **Clerk** — autenticação (email/password). Sign-up está desativado: só utilizadores convidados/criados no Dashboard podem entrar.
- **Cloudflare R2** — armazenamento dos PDFs (API S3-compatible)

## Requisitos

- Node.js 18+
- Conta [Clerk](https://clerk.com) e aplicação criada
- Bucket [Cloudflare R2](https://dash.cloudflare.com) e credenciais API (Access Key + Secret)

## Configuração

1. Clone e instale dependências:

   ```bash
   cd prosono-pdfs
   npm install
   ```

2. Copie o ficheiro de ambiente:

   ```bash
   cp .env.example .env.local
   ```

3. Preencha `.env.local`:
   - **Clerk:** em [Clerk Dashboard](https://dashboard.clerk.com) → API Keys (publishable + secret). Para que só utilizadores que criares/invitares possam entrar, em User & Authentication → Restrict desativa "Sign-up" ou usa "Allowlist".
   - **R2:** em Cloudflare Dashboard → R2 → Manage R2 API Tokens. Crie um token com permissão "Object Read & Write". O **Account ID** está na sidebar direita da R2. O **Bucket name** é o nome do bucket onde vais colocar os PDFs.

4. Coloca os PDFs no bucket R2 (via dashboard Cloudflare ou AWS CLI/SDK apontando ao endpoint R2). A listagem mostra todos os objetos cuja key termina em `.pdf`.

### Testar sem R2 (Clerk + viewer com PDFs locais)

Para validar Clerk e o viewer antes de configurar R2:

1. No `.env` define `USE_LOCAL_PDFS=true` e opcionalmente `LOCAL_PDFS_DIR=local-pdfs`.
2. Coloca dois (ou mais) ficheiros `.pdf` na pasta `local-pdfs/` na raiz do projeto.
3. Corre `npm run dev` e, após sign-in, o dashboard lista os PDFs dessa pasta e podes abri-los no viewer.
4. Quando R2 estiver configurado, remove ou comenta `USE_LOCAL_PDFS=true` para usar o bucket.

## Desenvolvimento

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Serás redirecionado para sign-in; após login entras no dashboard com a lista de PDFs. Ao clicar num documento, abres o viewer (iframe com stream do PDF; sem botão de download).

## Deploy (Vercel)

1. Importa o projeto na Vercel e liga o repositório.
2. Em **Settings → Environment Variables** adiciona todas as variáveis de `.env.example` (com valores de produção).
3. Para Clerk em produção, usa as chaves de produção e, se quiseres, configura o domínio customizado nas variáveis `NEXT_PUBLIC_CLERK_*`.
4. Para subdomínio teu (ex.: `prosono.seudominio.pt`), aponta o domínio no projeto Vercel e configura o CNAME no teu DNS.

## Estrutura relevante

- `src/app/page.tsx` — redireciona para sign-in ou dashboard
- `src/app/sign-in/` e `sign-up/` — páginas Clerk
- `src/app/(dashboard)/dashboard/page.tsx` — lista de PDFs (chama `listPdfs()`)
- `src/app/(dashboard)/pdf/[key]/page.tsx` — viewer (iframe para `/api/pdfs/[key]`)
- `src/app/api/pdfs/route.ts` — GET lista PDFs (autenticado)
- `src/app/api/pdfs/[key]/route.ts` — GET stream do PDF com `Content-Disposition: inline` (sem download)
- `src/lib/r2.ts` — cliente R2 (S3), `listPdfs()` e `getPdfStream()`
- `src/middleware.ts` — Clerk: rotas públicas `/`, `/sign-in`, `/sign-up`; resto protegido

## Notas

- **Sem download:** o PDF é servido com `Content-Disposition: inline` e mostrado num iframe; não há link de download na UI. Um utilizador técnico pode tentar inspecionar o stream; para a maioria dos casos isto é suficiente.
- **R2:** o bucket pode ter qualquer nome; só objetos com key terminada em `.pdf` aparecem na lista. Podes usar prefixos (ex.: `2024/relatorio.pdf`).
