# Deploy em produção (VPS Ubuntu + Docker)

Arquitetura: **Caddy** (HTTPS automático, serve o React e repassa `/api`) → **Spring Boot** → **PostgreSQL**.
Só as portas 80 e 443 ficam abertas; banco e backend ficam na rede interna do Docker.

## Primeira vez
1. Aponte o domínio/subdomínio (ex.: DuckDNS) para o IP da VPS.
2. No servidor: `git clone https://github.com/goechsler603/tcc-caa && cd tcc-caa`
3. `cp .env.prod.example .env.prod` e edite (domínio e senhas fortes).
4. `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build`
5. Acesse `https://SEU_DOMINIO` e entre com `APP_ADMIN_LOGIN` / `APP_ADMIN_SENHA`.

## Atualizar
`git pull` e repita o comando do passo 4.

## Logs e diagnóstico
- `docker compose -f docker-compose.prod.yml ps`
- `docker compose -f docker-compose.prod.yml logs -f backend`
- Saúde da API: `curl https://SEU_DOMINIO/api/health`
