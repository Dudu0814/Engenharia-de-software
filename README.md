# StudyLink

Site responsivo para aproximar estudantes por disciplina, conteúdo e objetivo de estudo. O repositório preserva o MVP original em [`mvp-sprint-2/`](mvp-sprint-2/) e evolui o fluxo navegável para a Sprint 3.

## Como visualizar

Abra `index.html` em um navegador moderno. Não há instalação necessária. Criação de grupos, pedidos e decisões ficam salvos no `localStorage` do navegador atual.

## O que funciona na demonstração

- busca filtrada de estudantes e perfis;
- criação de grupo e solicitação de participação;
- acesso de demonstração e painel de pedidos enviados/recebidos;
- aprovação e recusa com validação local da capacidade.

O formulário de acesso não autentica usuários de verdade e não envia nem armazena a senha. Os dados não são compartilhados entre dispositivos. Para produção, implementar API e banco conforme [`docs/sprint-2/adrs/`](docs/sprint-2/adrs/).

## Sprints

- [Sprint 2 — decisões arquiteturais](docs/sprint-2/adrs/)
- [Sprint 3 — incremento funcional e roteiro de demonstração](docs/sprint-3/entrega.md)
- [Sprint 4 — backlog de qualidade](docs/sprint-4/plano.md)
- [Sprint 5 — checklist de release](docs/sprint-5/plano.md)
