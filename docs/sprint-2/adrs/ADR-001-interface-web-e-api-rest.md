# ADR 001 Interface Web e API REST

- Status: Aceita
- Data: Sprint 2

## Contexto

O protótipo do StudyLink é um site estático com dados demonstrativos. Esse formato é adequado para validar a navegação e as telas, mas não oferece autenticação segura, persistência compartilhada ou proteção para regras de negócio como limite de membros.

## Decisão

Manter a interface web como cliente responsivo e separar a evolução do produto em uma API REST que será responsável por autenticação, regras de negócio e acesso ao banco de dados.

Na Sprint 2, o site continua independente de servidor para facilitar a apresentação do protótipo. Nas próximas sprints, as interações simuladas serão substituídas por chamadas HTTPS para a API.

## Consequências

### Positivas

- O protótipo permanece simples de abrir e demonstrar.
- A API pode proteger senhas, validações e regras de autorização.
- Interface, regras e dados podem evoluir ou ser testados separadamente.
- A interface web pode ser publicada em hospedagem estática, como GitHub Pages.

### Negativas

- A solução final exige implementação e hospedagem da API e do banco de dados.
- Será necessário tratar sessão, erros de rede e estados de carregamento na interface.
