# StudyLink

Site responsivo para aproximar estudantes por curso, disciplina e objetivo de estudo. O MVP inicial está preservado em [`mvp-sprint-2/`](mvp-sprint-2/). A versão atual evolui o fluxo demonstrativo das Sprints 3 e 4 e está pronta para usar Firebase em dois dispositivos.

## Como abrir

Abra `index.html` em um navegador moderno. Sem o Firebase configurado, o projeto continua funcionando como demonstração local. Com o Firebase, salas, contas e conversas passam a funcionar entre dispositivos.

## O que dá para demonstrar

- Cursos e matérias de áreas como software, jogos, Direito e Medicina/Psiquiatria.
- Busca de perfis por disciplina e interesse.
- Criação de grupo, pedido de entrada, aprovação e recusa.
- Criação e descoberta de salas por matéria em tempo real.
- Entrada na sala e chat compartilhado entre dispositivos.
- Contas por e-mail/senha e mensagens diretas encontrando a outra pessoa pelo e-mail.
- O criador aparece como administrador/membro do grupo e não precisa solicitar acesso.
- Perfil e sessão demonstrativa.

Não envie dados sensíveis. As regras de acesso já estão no repositório, mas precisam ser publicadas no Firebase antes do uso online.

## Publicar e testar em dois dispositivos

Siga o guia de [configuração do Firebase e demonstração entre duas pessoas](docs/firebase.md). Ele inclui a criação do projeto, regras de segurança, publicação no GitHub Pages e o teste da sala e das mensagens diretas.

## Documentação

- [Decisões arquiteturais da Sprint 2](docs/sprint-2/adrs/)
- [Entrega da Sprint 3](docs/sprint-3/entrega.md)
- [Entrega de interface da Sprint 4](docs/sprint-4/entrega.md)
- [Próximos itens técnicos da Sprint 4](docs/sprint-4/plano.md)
- [Preparação da Sprint 5](docs/sprint-5/plano.md)
