# Sprint 4 — Evolução e qualidade

## Entregas desta etapa
- Catálogo de cursos e matérias ampliado, incluindo Engenharia de Software, Análise e Desenvolvimento de Sistemas, Desenvolvimento de Jogos, Direito/Advocacia, Psiquiatria/Medicina, Psicologia, Administração, Engenharia Civil e Ciência da Computação.
- Filtros e formulário de grupo alimentados pelo mesmo catálogo, evitando repetir opções em vários lugares.
- Novos perfis de demonstração ligados a Jogos e Direito.
- O criador de grupo é identificado como administrador e membro inicial; não aparece a si mesmo a opção de solicitar acesso.
- O responsável pelos pedidos é ligado ao e-mail da sessão, evitando confusão quando nomes se repetem.
- Chat demonstrativo por grupo com mensagem inicial, envio de mensagens e histórico persistido localmente. O chat aparece para o organizador e para participantes aprovados.
- Implementação mantida em HTML, CSS e JavaScript sem bibliotecas adicionais, com comentários e dados organizados no começo do arquivo.

## Regras do fluxo
1. O grupo começa com uma vaga ocupada pelo organizador.
2. O organizador abre os detalhes e vê que já tem acesso.
3. Outros perfis podem solicitar vaga.
4. Ao aprovar, uma vaga é ocupada; não é possível aprovar acima do limite.
5. Decisões continuam salvas no navegador usado.

## Limites conhecidos
O armazenamento continua local e demonstrativo. A autenticação, o compartilhamento entre usuários e a validação confiável de concorrência requerem API e banco de dados. A aprovação local serve para apresentar o fluxo, não como controle de produção.

## Próximo passo técnico
Implementar API REST e banco, seguindo ADR 001 e ADR 002. Antes de publicar para usuários reais, acrescentar testes automatizados e pipeline de integração contínua.
