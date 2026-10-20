@'
# TCC - Plataforma de Comunicação Alternativa (CAA)

Plataforma web para criação de pranchas de comunicação com pictogramas
(método PECS), em parceria com a AMA de Jaraguá do Sul.

## Tecnologias
React, Spring Boot, PostgreSQL, Keycloak, API do ARASAAC.

## Como rodar
1. Copie `.env.example` para `.env`
2. Suba o banco: `docker compose up -d`
3. Backend: `cd backend && ./mvnw spring-boot:run`
4. Frontend: `cd frontend && npm install && npm run dev`

## Créditos
Pictogramas: ARASAAC (https://arasaac.org), licença CC BY-NC-SA,
autor Sergio Palao, propriedade do Governo de Aragão.
'@ | Set-Content README.md