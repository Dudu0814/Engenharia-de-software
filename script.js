import {
  createOnlineRoom, findProfileByEmail, firebaseReady, joinOnlineRoom, openDirectConversation,
  registerAccount, sendDirectMessage, sendRoomMessage, signInAccount, signOutAccount,
  watchDirectMessages, watchRoomMessages, watchRooms, watchSession,
} from "./firebase-service.js";

const courses = ["Engenharia de Software", "Análise e Desenvolvimento de Sistemas", "Desenvolvimento de Jogos", "Advocacia / Direito", "Psiquiatria / Medicina", "Administração", "Psicologia", "Engenharia Civil", "Ciência da Computação"];
const subjects = [
  { id: "calculo", name: "Cálculo I" }, { id: "algoritmos", name: "Algoritmos e Lógica" },
  { id: "gestao", name: "Gestão de Projetos" }, { id: "banco", name: "Banco de Dados" },
  { id: "programacao", name: "Programação Web" }, { id: "jogos", name: "Desenvolvimento de Jogos" },
  { id: "ia", name: "Inteligência Artificial" }, { id: "direito-civil", name: "Direito Civil" },
  { id: "direito-penal", name: "Direito Penal" }, { id: "constitucional", name: "Direito Constitucional" },
  { id: "anatomia", name: "Anatomia e Fisiologia" }, { id: "psiquiatria", name: "Psiquiatria" },
  { id: "psicologia", name: "Psicologia Clínica" }, { id: "estatistica", name: "Estatística" },
  { id: "fisica", name: "Física I" }, { id: "scrum", name: "Scrum e Métodos Ágeis" }
];

const students = [
  {
    id: "laura",
    initials: "LM",
    name: "Laura Menezes",
    course: "Engenharia Civil",
    semester: "2º semestre",
    bio: "Quero ganhar segurança em Cálculo I antes das próximas provas.",
    subjects: ["calculo", "fisica"],
    subjectLabels: ["Cálculo I", "Física I"],
    interests: [{ type: "learn", label: "Quero aprender: Limites e derivadas" }],
    tone: "teal",
  },
  {
    id: "rafael",
    initials: "RC",
    name: "Rafael Costa",
    course: "Análise e Desenvolvimento de Sistemas",
    semester: "6º semestre",
    bio: "Gosto de explicar programação e revisar matemática quando posso.",
    subjects: ["algoritmos", "calculo"],
    subjectLabels: ["Algoritmos", "Cálculo I"],
    interests: [{ type: "help", label: "Posso ajudar: Limites e derivadas" }, { type: "learn", label: "Quero aprender: Integrais" }],
    tone: "purple",
  },
  {
    id: "camila",
    initials: "CD",
    name: "Camila Duarte",
    course: "Administração",
    semester: "4º semestre",
    bio: "Organizo grupos objetivos para cada etapa do semestre.",
    subjects: ["gestao", "estatistica"],
    subjectLabels: ["Gestão de Projetos", "Estatística"],
    interests: [{ type: "help", label: "Posso ajudar: Kanban" }],
    tone: "purple",
  },
  {
    id: "beatriz",
    initials: "BA",
    name: "Beatriz Almeida",
    course: "Desenvolvimento de Jogos",
    semester: "3º semestre",
    bio: "Estou montando meu primeiro jogo e quero trocar ideias sobre lógica e design.",
    subjects: ["jogos", "algoritmos"],
    subjectLabels: ["Desenvolvimento de Jogos", "Algoritmos e Lógica"],
    interests: [{ type: "learn", label: "Quero aprender: Unity e prototipação" }],
    tone: "purple",
  },
  {
    id: "lucas",
    initials: "LS",
    name: "Lucas Silva",
    course: "Advocacia / Direito",
    semester: "5º semestre",
    bio: "Gosto de revisar casos e estudar Direito Civil em grupo.",
    subjects: ["direito-civil", "constitucional"],
    subjectLabels: ["Direito Civil", "Direito Constitucional"],
    interests: [{ type: "help", label: "Posso ajudar: Direito Civil" }],
    tone: "teal",
  },
  {
    id: "mateus",
    initials: "ML",
    name: "Mateus Lima",
    course: "Ciência da Computação",
    semester: "3º semestre",
    bio: "Aprendo melhor resolvendo exercícios em conjunto.",
    subjects: ["algoritmos", "calculo"],
    subjectLabels: ["Algoritmos", "Cálculo I"],
    interests: [{ type: "learn", label: "Quero aprender: Funções" }, { type: "help", label: "Posso ajudar: Integrais" }],
    tone: "teal",
  },
];

const initialGroups = [
  { id: "calculo", name: "Cálculo I sem mistério", subject: "Cálculo I", objective: "Resolver listas de limites e derivadas antes da P1.", owner: "Camila Duarte", members: 2, limit: 5 },
  { id: "algoritmos", name: "Prática de algoritmos", subject: "Algoritmos", objective: "Treinar lógica e estruturas de repetição com desafios curtos.", owner: "Rafael Costa", members: 2, limit: 4 },
];

const loadData = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const saveData = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let groups = loadData("studylink.groups", initialGroups);
let requests = loadData("studylink.requests", []);
let chats = loadData("studylink.chats", {});
let session = loadData("studylink.session", null);

const directChatUsers = [
  { id: "eduardo", name: "Eduardo Schwertz", initials: "ES", course: "Engenharia de Software", semester: "4º semestre", tone: "purple" },
  { id: "laura", name: "Laura Menezes", initials: "LM", course: "Engenharia Civil", semester: "2º semestre", tone: "teal" },
];
const initialDirectMessages = [
  { id: 1, senderId: "laura", text: "Oi, Eduardo! Vi que você pode ajudar com Scrum. Você também estuda Cálculo I?", time: "14:08" },
  { id: 2, senderId: "eduardo", text: "Oi, Laura! Sim, estou revisando limites e derivadas esta semana. Podemos estudar juntos.", time: "14:10" },
  { id: 3, senderId: "laura", text: "Ótimo! Tenho dificuldade justamente nas derivadas. Que tal começarmos pela lista 2?", time: "14:12" },
];
const directChatStorageKey = "studylink.direct-chat-v1";
const validDirectMessages = (value) => Array.isArray(value) && value.every((message) => message && typeof message.text === "string" && directChatUsers.some((user) => user.id === message.senderId));
let directMessages = validDirectMessages(loadData(directChatStorageKey, initialDirectMessages)) ? loadData(directChatStorageKey, initialDirectMessages) : [...initialDirectMessages];
let activeDirectUserId = "eduardo";
let directRecipient = null;
let onlineDirectMessages = [];
let activeDirectConversationId = null;
let stopDirectMessages = () => {};
let stopRoomMessages = () => {};
let stopOnlineRooms = () => {};
const subjectFilter = document.querySelector("#subject-filter");
const groupSubject = document.querySelector('#group-form select[name="subject"]');
subjects.forEach((subject) => {
  subjectFilter.add(new Option(subject.name, subject.id));
  groupSubject.add(new Option(subject.name, subject.name));
});
const intentFilter = document.querySelector("#intent-filter");
const studentList = document.querySelector("#student-list");
const groupList = document.querySelector("#group-list");
const resultsCount = document.querySelector("#results-count");
const emptyStudents = document.querySelector("#empty-students");
const modal = document.querySelector("#profile-modal");
const modalContent = document.querySelector("#modal-content");
const toast = document.querySelector("#toast");
const directChatUserSelect = document.querySelector("#direct-chat-user-select");
const directMessagesElement = document.querySelector("#direct-chat-messages");
const directChatTitle = document.querySelector("#direct-chat-title");
const directChatSubtitle = document.querySelector("#direct-chat-subtitle");
const directChatHint = document.querySelector("#direct-chat-hint");
const directContactStatus = document.querySelector("#direct-chat-contact-status");
const directContactAvatar = document.querySelector("#direct-chat-contact-avatar");
const directContactName = document.querySelector("#direct-chat-contact-name");

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function avatar(person) {
  return `<span class="avatar ${person.tone || "purple"}">${escapeHTML(person.initials || person.name.split(" ").map((part) => part[0]).slice(0, 2).join(""))}</span>`;
}

function chip(interest) {
  return `<span class="chip ${interest.type === "help" ? "help-chip" : "learn-chip"}">${escapeHTML(interest.label)}</span>`;
}

function renderStudents() {
  const subject = subjectFilter.value;
  const intent = intentFilter.value;
  const visibleStudents = students.filter((student) => {
    const subjectMatches = subject === "all" || student.subjects.includes(subject);
    const intentMatches = intent === "all" || student.interests.some((interest) => interest.type === intent);
    return subjectMatches && intentMatches;
  });

  resultsCount.textContent = `${visibleStudents.length} estudante${visibleStudents.length === 1 ? "" : "s"} encontrado${visibleStudents.length === 1 ? "" : "s"}`;
  emptyStudents.hidden = visibleStudents.length !== 0;
  studentList.innerHTML = visibleStudents.map((student) => `
    <article class="student-card">
      ${avatar(student)}
      <div>
        <h3>${escapeHTML(student.name)}</h3>
        <span class="meta">${escapeHTML(student.course)} · ${escapeHTML(student.semester)}</span>
        <p>${escapeHTML(student.bio)}</p>
        <div class="chips">${student.subjectLabels.map((label) => `<span class="chip subject-chip">${escapeHTML(label)}</span>`).join("")}</div>
        <div class="chips" style="margin-top:.35rem">${student.interests.map(chip).join("")}</div>
      </div>
      <div class="student-card-actions"><button class="button button-secondary button-small" data-open-student="${student.id}">Ver perfil</button>${student.id === "laura" ? `<button class="button button-primary button-small" data-open-direct-chat>Conversar</button>` : ""}</div>
    </article>`).join("");
}

function renderGroups() {
  groupList.innerHTML = groups.map((group) => `
    <article class="group-card">
      <div class="group-top"><span class="chip subject-chip">${escapeHTML(group.subject)}</span><span class="meta">${group.members}/${group.limit} membros</span></div>
      <h3>${escapeHTML(group.name)}</h3>
      <p>${escapeHTML(group.objective)}</p>
      <div class="group-footer"><span>Organizado por ${escapeHTML(group.owner)}</span><button class="button button-primary button-small" data-open-group="${group.id}">Ver detalhes</button></div>
    </article>`).join("");
}

function showModal(content) {
  modalContent.innerHTML = content;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  stopRoomMessages();
  stopRoomMessages = () => {};
  modal.hidden = true;
  document.body.style.overflow = "";
}

function openStudent(student) {
  showModal(`
    <div class="modal-profile">
      ${avatar(student)}
      <div><h2 id="modal-title">${escapeHTML(student.name)}</h2><p>${escapeHTML(student.course)} · ${escapeHTML(student.semester)}</p></div>
    </div>
    <p>${escapeHTML(student.bio)}</p>
    <div class="modal-section"><h3>Disciplinas</h3><div class="chips">${student.subjectLabels.map((label) => `<span class="chip subject-chip">${escapeHTML(label)}</span>`).join("")}</div></div>
    <div class="modal-section"><h3>Conteúdos declarados</h3><div class="chips">${student.interests.map(chip).join("")}</div></div>
    <div class="modal-actions">${student.id === "laura" ? `<button class="button button-primary" data-open-direct-chat>Conversar com Laura</button>` : ""}<button class="button button-secondary" data-close-modal>Fechar</button></div>`);
}

function currentDirectUser() {
  return directChatUsers.find((user) => user.id === activeDirectUserId);
}

function directPartner() {
  return directChatUsers.find((user) => user.id !== activeDirectUserId);
}

function renderDirectChat() {
  if (firebaseReady) {
    directChatUserSelect.innerHTML = session ? `<option>${escapeHTML(session.name)}</option>` : "<option>Entre para conversar</option>";
    directChatUserSelect.disabled = true;
    const partner = directRecipient;
    directChatTitle.textContent = partner ? partner.name : "Escolha uma pessoa";
    directChatSubtitle.textContent = partner ? `${partner.course || "Curso não informado"} · ${partner.email}` : "Informe o e-mail da conta da outra pessoa";
    directContactAvatar.className = "avatar teal";
    directContactAvatar.textContent = partner ? partner.name.split(" ").map((part) => part[0]).slice(0, 2).join("") : "?";
    directContactName.textContent = partner ? partner.name : "Nenhuma conversa selecionada";
    directContactStatus.textContent = session ? "Conectado em tempo real" : "Entre para iniciar uma conversa";
    directChatHint.textContent = session && partner ? `${session.name.split(" ")[0]} enviará a próxima mensagem.` : "Use o botão Entrar para acessar sua conta.";
    directMessagesElement.innerHTML = partner ? `<div class="direct-chat-date"><span>Conversa privada</span></div>${onlineDirectMessages.map((message) => {
      const own = message.senderId === session?.uid;
      const time = message.createdAt?.toDate ? new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(message.createdAt.toDate()) : "agora";
      return `<article class="direct-chat-message ${own ? "own" : "other"}"><span>${escapeHTML(own ? "Você" : message.senderName)}</span><p>${escapeHTML(message.text)}</p><time>${time}</time></article>`;
    }).join("")}` : '<p class="meta">Informe o e-mail da pessoa com quem deseja conversar.</p>';
    directMessagesElement.scrollTop = directMessagesElement.scrollHeight;
    return;
  }
  const currentUser = currentDirectUser();
  const partner = directPartner();
  directChatUserSelect.innerHTML = directChatUsers.map((user) => `<option value="${user.id}">${escapeHTML(user.name)}</option>`).join("");
  directChatUserSelect.value = currentUser.id;
  directChatTitle.textContent = partner.name;
  directChatSubtitle.textContent = `${partner.course} · ${partner.semester}`;
  directContactAvatar.className = `avatar ${partner.tone}`;
  directContactAvatar.textContent = partner.initials;
  directContactName.textContent = partner.name;
  directContactStatus.textContent = currentUser.id === "eduardo" ? "Conversa sobre Cálculo I" : "Conversa com Eduardo";
  directChatHint.textContent = `${currentUser.name.split(" ")[0]} enviará a próxima mensagem.`;
  directMessagesElement.innerHTML = `<div class="direct-chat-date"><span>Hoje</span></div>${directMessages.map((message) => {
    const sender = directChatUsers.find((user) => user.id === message.senderId);
    const own = message.senderId === currentUser.id;
    return `<article class="direct-chat-message ${own ? "own" : "other"}"><span>${escapeHTML(own ? "Você" : sender.name.split(" ")[0])}</span><p>${escapeHTML(message.text)}</p><time>${escapeHTML(message.time)}</time></article>`;
  }).join("")}`;
  directMessagesElement.scrollTop = directMessagesElement.scrollHeight;
}

function openDirectChat() {
  closeModal();
  document.querySelector("#mensagens").scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => document.querySelector(firebaseReady ? "#direct-recipient-email" : "#direct-chat-input").focus(), 500);
}

function openGroup(group) {
  const onlineRoom = firebaseReady && Boolean(group.ownerId);
  const isOwner = onlineRoom ? group.ownerId === session?.uid : group.ownerEmail === session?.email || (!group.ownerEmail && group.owner === (session?.name || "Eduardo Schwertz"));
  const full = group.members >= group.limit;
  const userEmail = session?.email || "eduardo@studylink.local";
  const isMember = onlineRoom ? (group.memberIds || []).includes(session?.uid) : isOwner || requests.some((request) => request.groupId === group.id && request.email === userEmail && request.status === "Aprovada");
  showModal(`
    <span class="chip subject-chip">${escapeHTML(group.subject)}</span>
    <h2 id="modal-title" style="margin-top:.7rem">${escapeHTML(group.name)}</h2>
    <p>${escapeHTML(group.objective)}</p>
    <div class="modal-section"><h3>Organização</h3><p>Administrado por <strong>${escapeHTML(group.owner)}</strong>. Há ${group.members} de ${group.limit} vagas ocupadas.</p></div>
    <div class="modal-section"><h3>Como entrar</h3><p>${isOwner ? "Você criou esta sala e já é seu organizador." : onlineRoom ? "Entre na sala para conversar com os demais membros em tempo real." : "Envie uma solicitação para que o organizador possa avaliar sua participação."}</p></div>
    <div class="modal-actions">${isMember ? `<button class="button button-primary" data-open-chat="${group.id}">Abrir chat</button>` : ""}${isOwner ? `<span class="request-state">Sua sala · administrador</span>` : full ? `<button class="button button-secondary" disabled>Sala cheia</button>` : onlineRoom ? `<button class="button button-primary" data-join-online-room="${group.id}">Entrar na sala</button>` : `<button class="button button-primary" data-request-group="${group.id}">Solicitar participação</button>`}<button class="button button-secondary" data-close-modal>Fechar</button></div>`);
}


function openChat(groupId) {
  const group = groups.find((item) => item.id === groupId);
  if (firebaseReady && group?.ownerId) {
    if (!session?.uid || !(group.memberIds || []).includes(session.uid)) { showToast("Entre na sala antes de abrir o chat."); return; }
    stopRoomMessages();
    showModal(`<h2 id="modal-title">Chat · ${escapeHTML(group.name)}</h2><p>Conversa da sala em tempo real.</p><div id="online-room-messages" class="chat-messages"><p class="meta">Carregando mensagens…</p></div><form id="online-room-chat-form" class="chat-form" data-chat-group="${escapeHTML(groupId)}"><label for="online-room-message">Mensagem</label><textarea id="online-room-message" name="message" maxlength="500" placeholder="Escreva uma mensagem para a sala..." required></textarea><div class="modal-actions"><button class="button button-secondary" type="button" data-back-to-group="${escapeHTML(groupId)}">Voltar à sala</button><button class="button button-primary" type="submit">Enviar</button></div></form>`);
    stopRoomMessages = watchRoomMessages(groupId, (messages) => {
      const element = document.querySelector("#online-room-messages");
      if (!element) return;
      element.innerHTML = messages.length ? messages.map((message) => `<article class="chat-message"><strong>${escapeHTML(message.senderName)}</strong><p>${escapeHTML(message.text)}</p><small>${message.createdAt?.toDate ? message.createdAt.toDate().toLocaleString("pt-BR") : "agora"}</small></article>`).join("") : '<p class="meta">Ainda não há mensagens. Comece a conversa!</p>';
      element.scrollTop = element.scrollHeight;
    }, () => showToast("Não foi possível carregar as mensagens da sala."));
    return;
  }
  const messages = chats[groupId] || [];
  showModal(`<h2 id="modal-title">Chat · ${escapeHTML(group.name)}</h2><p>Conversa demonstrativa do grupo. As mensagens ficam salvas neste navegador.</p><div class="chat-messages">${messages.length ? messages.map((message) => `<article class="chat-message"><strong>${escapeHTML(message.name)}</strong><p>${escapeHTML(message.text)}</p><small>${escapeHTML(message.time)}</small></article>`).join("") : '<p class="meta">Ainda não há mensagens. Comece a conversa!</p>'}</div><form id="chat-form" class="chat-form" data-chat-group="${escapeHTML(groupId)}"><label for="chat-message">Mensagem</label><textarea id="chat-message" name="message" maxlength="500" placeholder="Escreva uma mensagem para o grupo..." required></textarea><div class="modal-actions"><button class="button button-secondary" type="button" data-back-to-group="${escapeHTML(groupId)}">Voltar ao grupo</button><button class="button button-primary" type="submit">Enviar</button></div></form>`);
}

let toastTimer;
function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3200);
}

subjectFilter.addEventListener("change", renderStudents);
intentFilter.addEventListener("change", renderStudents);

document.querySelector("#clear-filters").addEventListener("click", () => {
  subjectFilter.value = "all";
  intentFilter.value = "all";
  renderStudents();
});

document.querySelector("#open-group-form").addEventListener("click", () => {
  document.querySelector("#group-form-wrap").hidden = false;
  document.querySelector("#open-group-form").hidden = true;
  document.querySelector("#group-form input").focus();
});

document.querySelector("#cancel-group-form").addEventListener("click", () => {
  document.querySelector("#group-form-wrap").hidden = true;
  document.querySelector("#open-group-form").hidden = false;
});

document.querySelector("#group-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const groupForm = event.currentTarget;
  const data = new FormData(groupForm);
  const group = {
    id: `group-${Date.now()}`,
    name: String(data.get("name")).trim(),
    subject: String(data.get("subject")),
    objective: String(data.get("objective")).trim(),
    owner: session?.name || "Eduardo Schwertz",
    ownerEmail: session?.email || "eduardo@studylink.local",
    members: 1,
    limit: Number(data.get("limit")),
  };
  if (firebaseReady) {
    if (!session?.uid) { showToast("Entre na sua conta para criar uma sala online."); return; }
    try {
      await createOnlineRoom(group, session);
      groupForm.reset();
      document.querySelector("#group-form-wrap").hidden = true;
      document.querySelector("#open-group-form").hidden = false;
      showToast("Sala criada. Ela já pode ser encontrada em outro dispositivo.");
    } catch (error) { showToast(error.message || "Não foi possível criar a sala."); }
    return;
  }
  groups.unshift(group);
  chats[group.id] = [{ name: group.owner, text: "Bem-vindos ao grupo! Vamos combinar nossos estudos por aqui.", time: new Date().toLocaleString("pt-BR") }];
  saveData("studylink.chats", chats);
  saveData("studylink.groups", groups);
  groupForm.reset();
  document.querySelector("#group-form-wrap").hidden = true;
  document.querySelector("#open-group-form").hidden = false;
  renderGroups();
  renderRequests();
  showToast("Grupo criado e salvo neste navegador.");
});

directChatUserSelect.addEventListener("change", (event) => {
  if (firebaseReady) return;
  activeDirectUserId = event.target.value;
  renderDirectChat();
});

document.querySelector("#direct-recipient-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!firebaseReady) { showToast("Configure o Firebase para conversar entre dispositivos."); return; }
  if (!session?.uid) { showToast("Entre na sua conta antes de iniciar uma conversa."); return; }
  const email = document.querySelector("#direct-recipient-email").value.trim().toLowerCase();
  if (!email) return;
  try {
    const found = await findProfileByEmail(email);
    if (!found) { showToast("Nenhuma conta encontrada com esse e-mail."); return; }
    if (found.uid === session.uid) { showToast("Escolha a conta da outra pessoa."); return; }
    directRecipient = found;
    activeDirectConversationId = await openDirectConversation(session, found);
    stopDirectMessages();
    stopDirectMessages = watchDirectMessages(activeDirectConversationId, (messages) => { onlineDirectMessages = messages; renderDirectChat(); }, () => showToast("Não foi possível carregar esta conversa."));
    renderDirectChat();
  } catch (error) { showToast(error.message || "Não foi possível abrir a conversa."); }
});

document.querySelector("#direct-chat-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = document.querySelector("#direct-chat-input");
  const text = input.value.trim();
  if (!text) return;
  if (firebaseReady) {
    if (!session?.uid || !activeDirectConversationId) { showToast("Escolha uma pessoa para iniciar a conversa."); return; }
    try { await sendDirectMessage(activeDirectConversationId, session, text); input.value = ""; } catch (error) { showToast(error.message || "Não foi possível enviar a mensagem."); }
    return;
  }
  directMessages.push({ id: Date.now(), senderId: activeDirectUserId, text, time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()) });
  saveData(directChatStorageKey, directMessages);
  input.value = "";
  renderDirectChat();
  input.focus();
});

document.querySelector("#reset-direct-chat").addEventListener("click", () => {
  if (firebaseReady) { onlineDirectMessages = []; directRecipient = null; activeDirectConversationId = null; stopDirectMessages(); stopDirectMessages = () => {}; renderDirectChat(); return; }
  directMessages = [...initialDirectMessages];
  activeDirectUserId = "eduardo";
  saveData(directChatStorageKey, directMessages);
  renderDirectChat();
  showToast("Conversa restaurada para as mensagens da demonstração.");
});

document.addEventListener("click", async (event) => {
  const studentButton = event.target.closest("[data-open-student]");
  const groupButton = event.target.closest("[data-open-group]");
  const requestButton = event.target.closest("[data-request-group]");
  const chatButton = event.target.closest("[data-open-chat]");
  const directChatButton = event.target.closest("[data-open-direct-chat]");
  const joinOnlineRoomButton = event.target.closest("[data-join-online-room]");
  if (studentButton) openStudent(students.find((student) => student.id === studentButton.dataset.openStudent));
  if (groupButton) openGroup(groups.find((group) => group.id === groupButton.dataset.openGroup));
  if (chatButton) openChat(chatButton.dataset.openChat);
  if (directChatButton) openDirectChat();
  if (joinOnlineRoomButton) {
    if (!session?.uid) { showToast("Entre na sua conta para participar da sala."); return; }
    try {
      await joinOnlineRoom(joinOnlineRoomButton.dataset.joinOnlineRoom, session);
      closeModal();
      showToast("Você entrou na sala. Agora o chat está disponível.");
    } catch (error) { showToast(error.message || "Não foi possível entrar na sala."); }
  }
  if (requestButton) {
    const group = groups.find((item) => item.id === requestButton.dataset.requestGroup);
    const alreadySent = requests.some((request) => request.groupId === group.id && request.email === (session?.email || "visitante@studylink.local"));
    if (alreadySent) { showToast("Você já enviou uma solicitação para este grupo."); return; }
    requests.push({ id: `request-${Date.now()}`, groupId: group.id, groupName: group.name, email: session?.email || "visitante@studylink.local", name: session?.name || "Visitante", status: "Pendente" });
    saveData("studylink.requests", requests);
    closeModal(); renderRequests();
    showToast(`Solicitação enviada para ${group.name}.`);
  }
  if (event.target.closest("[data-close-modal]") || event.target.classList.contains("modal-close")) closeModal();
});

modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modal.hidden) closeModal(); });
document.querySelector("#edit-profile").addEventListener("click", () => {
  showModal(`<h2 id="modal-title">Editar perfil</h2><p>Atualize como você aparece para outros estudantes.</p><form id="profile-form" class="auth-form"><label>Nome<input name="name" value="${escapeHTML(session?.name || "Eduardo Schwertz")}" required maxlength="60"></label><label>Curso<select name="course" required>${courses.map((course) => `<option ${course === (session?.course || "Engenharia de Software") ? "selected" : ""}>${escapeHTML(course)}</option>`).join("")}</select></label><label>Sobre você<textarea name="bio" maxlength="180">Gosto de organizar estudos em grupo e trocar experiências sobre desenvolvimento de software.</textarea></label><div class="modal-actions"><button class="button button-primary" type="submit">Salvar perfil</button></div></form>`);
});

function renderRequests() {
  const mine = document.querySelector("#my-requests"); const incoming = document.querySelector("#incoming-requests");
  const my = requests.filter((r) => r.email === (session?.email || "visitante@studylink.local"));
  mine.innerHTML = my.length ? my.map((r) => `<div class="request-item"><div><strong>${escapeHTML(r.groupName)}</strong><p>${escapeHTML(r.status)}</p></div><span class="request-state">${escapeHTML(r.status)}</span></div>`).join("") : '<p class="meta">Você ainda não enviou pedidos. Explore os grupos disponíveis.</p>';
  const received = requests.filter((r) => groups.some((g) => g.id === r.groupId && (g.ownerEmail ? g.ownerEmail === session?.email : g.owner === (session?.name || "Eduardo Schwertz"))));
  incoming.innerHTML = received.length ? received.map((r) => `<div class="request-item"><div><strong>${escapeHTML(r.name)}</strong><p>${escapeHTML(r.groupName)} · ${escapeHTML(r.status)}</p></div>${r.status === "Pendente" ? `<div class="request-actions"><button class="button button-primary button-small" data-decision="Aprovada" data-request="${r.id}">Aprovar</button><button class="button button-secondary button-small" data-decision="Recusada" data-request="${r.id}">Recusar</button></div>` : `<span class="request-state">${escapeHTML(r.status)}</span>`}</div>`).join("") : '<p class="meta">Nenhum pedido recebido por enquanto.</p>';
}

document.querySelector("#auth-button").addEventListener("click", () => {
  if (firebaseReady) {
    if (session?.uid) { signOutAccount().catch((error) => showToast(error.message || "Não foi possível sair.")); return; }
    showModal(`<h2 id="modal-title">Entrar no StudyLink</h2><p>Crie sua conta uma única vez. Depois, seu amigo poderá encontrar você pelo e-mail para iniciar uma conversa direta.</p><form id="online-auth-form" class="auth-form"><label>Seu nome<input name="name" required maxlength="60" placeholder="Como podemos chamar você?"></label><label>E-mail<input name="email" type="email" required placeholder="voce@email.com"></label><label>Curso<select name="course" required>${courses.map((course) => `<option>${escapeHTML(course)}</option>`).join("")}</select></label><label>Senha<input name="password" type="password" required minlength="6" autocomplete="current-password"></label><div class="modal-actions"><button class="button button-secondary" type="submit" name="mode" value="login">Entrar</button><button class="button button-primary" type="submit" name="mode" value="register">Criar conta</button></div></form>`);
    return;
  }
  if (session) { session = null; localStorage.removeItem("studylink.session"); document.querySelector("#auth-button").textContent = "Entrar"; renderRequests(); showToast("Você saiu da sessão demonstrativa."); return; }
  showModal(`<h2 id="modal-title">Entrar no StudyLink</h2><p class="demo-note">Acesso demonstrativo: a sessão é salva apenas neste navegador. Este formulário não envia nem armazena senhas; para login real é necessária a API planejada na Sprint 2.</p><form id="auth-form" class="auth-form"><label>Seu nome<input name="name" required maxlength="60" placeholder="Como podemos chamar você?"></label><label>E-mail acadêmico<input name="email" type="email" required placeholder="voce@universidade.edu"></label><label>Curso<select name="course" required>${courses.map((course) => `<option>${escapeHTML(course)}</option>`).join("")}</select></label><label>Senha (apenas demonstração)<input name="password" type="password" required minlength="6" autocomplete="current-password"></label><div class="modal-actions"><button class="button button-primary" type="submit">Acessar demonstração</button></div></form>`);
});

document.addEventListener("submit", async (event) => {
  if (event.target.id === "online-auth-form") {
    event.preventDefault();
    const data = new FormData(event.target, event.submitter);
    const values = { name: String(data.get("name")).trim(), email: String(data.get("email")).trim(), password: String(data.get("password")), course: String(data.get("course")) };
    try {
      session = data.get("mode") === "register" ? await registerAccount(values) : await signInAccount(values.email, values.password);
      document.querySelector("#auth-button").textContent = "Sair";
      closeModal(); renderDirectChat(); showToast(`Olá, ${session.name}! Sua conta está conectada.`);
    } catch (error) { showToast(error.message || "Não foi possível acessar sua conta."); }
    return;
  }
  if (event.target.id === "auth-form") { event.preventDefault(); const data = new FormData(event.target); session = {name:String(data.get("name")).trim(),email:String(data.get("email")).trim().toLowerCase(),course:String(data.get("course"))}; saveData("studylink.session", session); document.querySelector("#auth-button").textContent = "Sair"; closeModal(); renderRequests(); showToast(`Olá, ${session.name}! Sua sessão demonstrativa está ativa.`); }
  if (event.target.id === "online-room-chat-form") {
    event.preventDefault();
    const groupId = event.target.dataset.chatGroup;
    const text = String(new FormData(event.target).get("message")).trim();
    if (!text || !session?.uid) return;
    try { await sendRoomMessage(groupId, session, text); event.target.reset(); } catch (error) { showToast(error.message || "Não foi possível enviar a mensagem."); }
    return;
  }
  if (event.target.id === "chat-form") {
    event.preventDefault();
    const groupId = event.target.dataset.chatGroup;
    const text = String(new FormData(event.target).get("message")).trim();
    if (!text) return;
    if (!chats[groupId]) chats[groupId] = [];
    chats[groupId].push({ name: session?.name || "Eduardo Schwertz", text, time: new Date().toLocaleString("pt-BR") });
    saveData("studylink.chats", chats);
    openChat(groupId);
  }
  if (event.target.id === "profile-form") { event.preventDefault(); const data = new FormData(event.target); if (!session) session = {name:"Eduardo Schwertz", email:"eduardo@studylink.local"}; session.name=String(data.get("name")).trim(); session.course=String(data.get("course")); saveData("studylink.session",session); document.querySelector("#profile h2").textContent=session.name; document.querySelector("#profile .profile-heading p:not(.eyebrow)").textContent=`${session.course} · 4º semestre`; closeModal(); showToast("Perfil atualizado nesta demonstração."); }
});

document.addEventListener("click", (event) => {
  const backButton = event.target.closest("[data-back-to-group]");
  if (backButton) { openGroup(groups.find((group) => group.id === backButton.dataset.backToGroup)); return; }
  const decision = event.target.closest("[data-decision]");
  if (decision) {
    const request=requests.find((item)=>item.id===decision.dataset.request);
    if (decision.dataset.decision === "Aprovada") {
      const group=groups.find((item)=>item.id===request.groupId);
      if (!group || group.members >= group.limit) { showToast("Não há vagas disponíveis neste grupo."); return; }
      group.members += 1; saveData("studylink.groups",groups); renderGroups();
    }
    request.status=decision.dataset.decision; saveData("studylink.requests",requests); renderRequests(); showToast(`Solicitação ${request.status.toLowerCase()}.`);
  }
});

const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});
nav.addEventListener("click", () => { nav.classList.remove("open"); navToggle.setAttribute("aria-expanded", "false"); });

if (firebaseReady) {
  watchSession((user) => {
    session = user;
    document.querySelector("#auth-button").textContent = user ? "Sair" : "Entrar";
    renderDirectChat();
    stopOnlineRooms();
    stopOnlineRooms = () => {};
    if (!user) { groups = []; renderGroups(); return; }
    stopOnlineRooms = watchRooms((onlineRooms) => {
      groups = onlineRooms.map((room) => ({
        ...room, owner: room.ownerName, members: room.memberCount || 0, limit: room.limit || 20,
      }));
      renderGroups();
    }, () => showToast("Não foi possível carregar as salas online. Verifique as regras do Firebase."));
  });
} else if (session) document.querySelector("#auth-button").textContent = "Sair";
renderStudents();
renderGroups();
renderRequests();
renderDirectChat();
