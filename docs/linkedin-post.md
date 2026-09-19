# Post LinkedIn — PulseOS.node

---

🚀 **Novo projeto: PulseOS.node** — Dashboard de monitoramento de servidores Linux em tempo real.

Fiz um sistema completo de monitoramento que coleta métricas de CPU, RAM, disco, rede e processos via um agente Fastify, transmite tudo por WebSocket e exibe em um dashboard Next.js com tema cyberpunk.

**O que construí:**

📦 Monorepo com pnpm workspaces
- `apps/agent` — Fastify 5 + WebSocket + coletores de métricas (lê `/proc/` e `ps`/`df` do Linux)
- `apps/dashboard` — Next.js 14 + shadcn/ui + Recharts
- `packages/shared` — Types + schemas Zod compartilhados

🏗️ Arquitetura hexagonal (ports & adapters) no agente
- Domain layer com entidades, erros de domínio e contrato de repositório
- Use cases: CollectMetrics, GetMetrics, KillProcess
- Infra: coletores de CPU, RAM, disco, rede, processos
- API: Fastify 5 com Swagger/Scalar docs + WebSocket broadcast a cada 2s

🧪 Testes
- 111 testes unitários (Vitest)
- 9 testes E2E (Playwright) — API + Dashboard
- CI/CD: GitHub Actions com 3 jobs paralelos (lint, test, e2e)

⚙️ Ferramentas
- BiomeJS (lint + format)
- TypeScript com Zod 4
- Lefthook (pre-commit + pre-push hooks)
- React Testing Library + Vitest

💻 **Tecnologias:** TypeScript, Fastify, Next.js, React, WebSocket, Zod, Recharts, Vitest, Playwright, BiomeJS, GitHub Actions

O projeto está open source com licença MIT.

🔗 github.com/Gui-dev/monitor

#typescript #react #nextjs #fastify #nodejs #webdevelopment #opensource #linux #monitoring #dashboard

---

**Sugestão de imagem:** Usar o screenshot em `docs/screens/dashboard.png` — o dashboard cyberpunk com os cards de CPU, RAM, disco, rede e o gráfico de tempo real.
