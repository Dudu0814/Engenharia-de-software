# Firebase e uso em dois dispositivos

O StudyLink usa **Firebase Authentication** para as contas e **Cloud Firestore** para salas e mensagens em tempo real. A configuração pública fica em `firebase-config.js`; as permissões de acesso ficam em `firestore.rules`.

## Configuração inicial

1. Acesse [Firebase Console](https://console.firebase.google.com/) com sua conta Google e selecione **Adicionar projeto**.
2. Em **Authentication > Sign-in method**, ative **E-mail/senha**.
3. Em **Firestore Database**, crie o banco em **Production mode** e escolha uma região próxima, como `southamerica-east1`.
4. Abra a aba **Rules** do Firestore, substitua o conteúdo pelo arquivo [`firestore.rules`](../firestore.rules) e publique as regras.
5. Em **Project settings > General**, crie um aplicativo Web (`</>`). Copie os valores de `firebaseConfig` para `firebase-config.js`.
6. Em **Authentication > Settings > Authorized domains**, acrescente `dudu0814.github.io` após a publicação do GitHub Pages.

## Demonstração com duas pessoas

1. Abra o site publicado nos dois dispositivos.
2. Cada pessoa clica em **Entrar** e usa **Criar conta**, com e-mails diferentes.
3. Uma pessoa cria uma sala em **Grupos**, escolhendo a matéria e o limite de membros.
4. A outra atualiza a página, encontra a sala, clica em **Ver detalhes** e depois em **Entrar na sala**.
5. Ambas abrem o chat da sala e as mensagens aparecem em tempo real.
6. Para uma conversa privada, cada pessoa informa em **Mensagens** o e-mail que a outra usou no cadastro e envia a mensagem.

## Publicação

O workflow `.github/workflows/deploy-pages.yml` publica a versão da branch `main`. No repositório do GitHub, abra **Settings > Pages** e selecione **GitHub Actions** como fonte. Depois do primeiro workflow concluído, o endereço será:

`https://dudu0814.github.io/Engenharia-de-software/`

## Limites do plano gratuito

Para uma apresentação, o plano Spark gratuito é suficiente: ele inclui cotas diárias para Firestore e autenticação por e-mail/senha. Caso a cota seja ultrapassada, o Firebase interrompe aquele produto até o próximo ciclo ou até a troca para o plano pago. Confira as cotas atuais na página de preços do Firebase antes de ampliar o projeto.
