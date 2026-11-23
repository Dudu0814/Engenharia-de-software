# Documentação arquitetural

## Visão geral

O StudyLink foi construído como uma aplicação web estática. O navegador apresenta as telas e se comunica diretamente com os serviços do Firebase. Não há servidor próprio nem instalação necessária para usar o sistema.

```text
Estudante A / Estudante B
            │
            ▼
     Site StudyLink
 HTML + CSS + JavaScript
            │
      ┌─────┴─────┐
      ▼           ▼
Firebase      GitHub Pages
Authentication  Hospedagem
Cloud Firestore
```

## Componentes

| Componente | Responsabilidade |
| --- | --- |
| `index.html` | Organiza as seções, formulários, salas e chats do site. |
| `styles.css` | Mantém o layout responsivo e a identidade visual. |
| `script.js` | Controla filtros, formulários, telas e ações da pessoa usuária. |
| `firebase-service.js` | Centraliza as chamadas para login, salas e mensagens. |
| Firebase Authentication | Cria e valida contas por e-mail e senha. |
| Cloud Firestore | Guarda perfis, salas e mensagens em tempo real. |
| GitHub Pages | Disponibiliza o site em um endereço público. |

## Dados principais

| Coleção | Informações armazenadas |
| --- | --- |
| `profiles` | Nome, e-mail e curso de cada conta. |
| `rooms` | Nome da sala, matéria, objetivo, criador, membros e limite. |
| `rooms/{id}/messages` | Mensagens enviadas dentro da sala. |
| `directConversations` | Participantes de uma conversa privada. |
| `directConversations/{id}/messages` | Mensagens diretas entre duas contas. |

## Fluxo de uma sala

1. A pessoa cria uma conta e entra no StudyLink.
2. Ela cria uma sala, escolhendo matéria, objetivo e quantidade de membros.
3. O Firestore registra a sala e a torna visível para usuários autenticados.
4. Outra pessoa encontra a sala, entra nela e passa a ser membro.
5. Somente membros conseguem ler e enviar mensagens naquela sala.

## Segurança adotada

As regras do Firestore bloqueiam o banco por padrão. Pessoas sem login não podem consultar salas ou perfis. As mensagens de uma sala são limitadas aos membros; conversas diretas são limitadas aos dois participantes. As regras usadas no projeto estão no arquivo `firestore.rules`.

## Decisão de arquitetura

A escolha por HTML, CSS e JavaScript puro reduz a dificuldade de instalação e facilita a explicação do projeto. O Firebase foi escolhido porque fornece autenticação e sincronização entre dispositivos sem exigir a criação de um servidor próprio.
