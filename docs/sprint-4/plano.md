# Sprint 4 — Qualidade e evolução

## Objetivo
Trocar interações locais por serviços confiáveis e elevar a qualidade do produto com testes e revisão de código.

## Backlog priorizado
1. Implementar API REST com autenticação e autorização no servidor (alto valor, pré-requisito para dados compartilhados).
2. Persistir estudantes, grupos, solicitações e participações em banco relacional.
3. Garantir aprovação transacional e limite de vagas (ADR 002).
4. Ligar interface a API, com estados de carregamento, erro e sessão expirada.
5. Adicionar validações, testes de unidade e integração e pipeline de CI.
6. Revisar acessibilidade, privacidade e responsividade.

## Critérios de aceite
- Nenhuma senha armazenada em texto puro ou no cliente.
- Aprovações concorrentes não ultrapassam o limite de membros.
- Fluxos principais cobertos por testes automatizados executados no CI.
- Mudanças integradas por pull request revisado; README inclui execução e configuração.

## Evidências esperadas
Pull requests, execução verde do pipeline, testes, revisão registrada, diagrama arquitetural atualizado e demonstração de um fluxo completo usando API.
