# StudyLink

Site responsivo para aproximar estudantes por curso, disciplina e objetivo de estudo. O MVP inicial está preservado em [`mvp-sprint-2/`](mvp-sprint-2/). A versão atual evolui o fluxo demonstrativo das Sprints 3 e 4.

## Como abrir

Abra `index.html` em um navegador moderno. Não precisa instalar ferramentas. Grupos, pedidos e sessão ficam salvos no armazenamento local do navegador.

## O que dá para demonstrar

- Cursos e matérias de áreas como software, jogos, Direito e Medicina/Psiquiatria.
- Busca de perfis por disciplina e interesse.
- Criação de grupo, pedido de entrada, aprovação e recusa.
- Chat demonstrativo dentro do grupo, com histórico salvo neste navegador.
- Conversa direta entre Eduardo e Laura, com troca de perfil para demonstrar os dois lados do chat.
- O criador aparece como administrador/membro do grupo e não precisa solicitar acesso.
- Perfil e sessão demonstrativa.

O acesso não é autenticação real, e os dados não são compartilhados entre dispositivos. Não use dados sensíveis. Uso real requer API HTTPS, banco de dados e validação no servidor.

## Como testar a conversa direta

1. Abra `index.html` e entre em **Mensagens** — ou clique em **Conversar** no cartão da Laura.
2. Com **Eduardo Schwertz** selecionado, envie uma mensagem.
3. No seletor “Você está usando como”, escolha **Laura Menezes** e envie a resposta.
4. Volte para Eduardo para conferir as duas mensagens. Use **Restaurar conversa** para voltar ao estado inicial.

## Documentação

- [Decisões arquiteturais da Sprint 2](docs/sprint-2/adrs/)
- [Entrega da Sprint 3](docs/sprint-3/entrega.md)
- [Entrega de interface da Sprint 4](docs/sprint-4/entrega.md)
- [Próximos itens técnicos da Sprint 4](docs/sprint-4/plano.md)
- [Preparação da Sprint 5](docs/sprint-5/plano.md)
