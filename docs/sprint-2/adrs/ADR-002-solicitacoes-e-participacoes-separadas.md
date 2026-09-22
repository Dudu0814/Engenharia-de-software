# ADR 002 Solicitações e Participações Separadas

- Status: Aceita
- Data: Sprint 2

## Contexto

Entrar em um grupo não é uma ação imediata: o criador precisa aprovar ou recusar o pedido. Além disso, uma pessoa aprovada torna-se membro do grupo, enquanto uma solicitação pendente ou recusada precisa continuar registrada para informar o estudante.

## Decisão

Modelar `PARTICIPATION_REQUEST` e `GROUP_MEMBERSHIP` como entidades diferentes.

Uma solicitação armazena o estado `PENDING`, `APPROVED` ou `REJECTED`. Apenas uma solicitação aprovada cria uma participação no grupo. A API deve validar se ainda existe vaga antes de mudar o estado para aprovado e criar a participação no mesmo processo.

## Consequências

### Positivas

- O estudante pode acompanhar claramente a situação de cada pedido.
- O administrador pode aprovar ou recusar sem perder o histórico da decisão.
- A regra de capacidade fica centralizada e evita ultrapassar o limite de membros.
- O papel de administrador pode ser representado na participação do criador.

### Negativas

- São necessárias mais duas tabelas e regras de transição de estado.
- A aprovação precisa ser transacional para impedir duas aprovações simultâneas além da capacidade.
