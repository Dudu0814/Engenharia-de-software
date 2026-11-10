# Sprint 3 — Primeiro incremento funcional

## Objetivo
Transformar o protótipo validado na Sprint 2 em uma demonstração ponta a ponta, mantendo a aplicação estática que já pode ser aberta sem instalação.

## Entregas implementadas
- Sessão demonstrativa iniciada pelo formulário de acesso, sem salvar senha.
- Criação de grupos, solicitações, decisões de aprovação/recusa e sessão persistidas no `localStorage` deste navegador.
- Painel para acompanhar pedidos enviados e administrar pedidos dos grupos criados pela sessão atual.
- Regra de capacidade aplicada ao aprovar um pedido.
- Cópia fiel dos arquivos anteriores em `mvp-sprint-2/` para preservar o MVP usado como base.

## Cenário de demonstração
1. Abra `index.html` e acesse “Entrar”. Informe nome, e-mail e qualquer senha com pelo menos seis caracteres; a senha serve somente para validar o formulário e não é enviada nem salva.
2. Crie um grupo. Em outra sessão/e-mail no mesmo navegador, solicite participação.
3. Volte ao e-mail que criou o grupo e aprove ou recuse o pedido em “Pedidos recebidos”. A aprovação ocupa uma vaga.
4. Atualize a página: grupo, pedido e decisão continuam salvos no navegador.

## Limites e segurança
Esta entrega não implementa autenticação real, compartilhamento entre navegadores ou proteção de autorização. Dados demonstrativos em armazenamento do navegador podem ser apagados pelo usuário. Não inserir dados pessoais sensíveis. Para produção, a interface deve consumir API HTTPS com hash de senha no servidor, sessão segura e validação transacional da capacidade, conforme ADRs 001 e 002.

## Evidências
- Fluxo visível: acesso demonstrativo → criação do grupo → solicitação → decisão do organizador.
- Os arquivos executáveis e instruções estão no repositório; pull request e pipeline ficam como próximos itens quando o grupo adotar colaboração via PR.
