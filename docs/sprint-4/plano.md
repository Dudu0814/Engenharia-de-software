# Sprint 4 — Backlog técnico para API e testes

O incremento de interface desta sprint está em [`entrega.md`](entrega.md). Estes itens seguem como evolução técnica necessária antes de uso real.

1. Criar API REST com cadastro/login seguros e autorização no servidor.
2. Salvar cursos, perfis, grupos, solicitações e participações em banco de dados.
3. Fazer aprovação de pedidos transacional para respeitar a capacidade do grupo.
4. Ligar a interface à API e tratar carregamento, erros e sessão expirada.
5. Cobrir regras e fluxos com testes automatizados e executar no CI.
6. Revisar acessibilidade, privacidade e responsividade.

## Critérios de aceite para produção
- Senhas tratadas apenas no servidor com armazenamento seguro.
- Aprovações concorrentes nunca excedem o limite de membros.
- Fluxos principais verificados por testes no pipeline.
- README documenta instalação, execução, configuração e limites conhecidos.
