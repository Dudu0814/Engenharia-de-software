import {
  createOnlineRoom, decideRoomRequest, deleteOnlineRoom, findProfileByEmail, firebaseReady, getRoomMemberNames, joinOnlineRoom, openDirectConversation, removeRoomMember, requestRoomAccess, saveProfile,
  registerAccount, sendDirectMessage, sendRoomMessage, signInAccount, signOutAccount,
  watchDirectConversations, watchDirectMessages, watchRoomMessages, watchRoomRequests, watchRooms, watchSession,
} from "./firebase-service.js";

import { courses, subjects, students, initialGroups, directChatUsers, initialDirectMessages } from "./dados.js";

const loadData = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const saveData = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let groups = loadData("studylink.groups", initialGroups);
let requests = loadData("studylink.requests", []);
let chats = loadData("studylink.chats", {});
let session = loadData("studylink.session", null);

const directChatStorageKey = "studylink.direct-chat-v1";
const validDirectMessages = (value) => Array.isArray(value) && value.every((message) => message && typeof message.text === "string" && directChatUsers.some((user) => user.id === message.senderId));
const savedMessages = loadData(directChatStorageKey, initialDirectMessages);
let directMessages = validDirectMessages(savedMessages) ? savedMessages : [...initialDirectMessages];
let activeDirectUserId = "eduardo";
let directRecipient = null;
let onlineDirectMessages = [];
let activeDirectConversationId = null;
let stopDirectMessages = () => {};
let stopDirectConversations = () => {};
let directConversations = [];
let stopRoomMessages = () => {};
let stopOnlineRooms = () => {};
let stopMyRequests = () => {};
let stopIncomingRequests = () => {};
let myOnlineRequests = [];
let incomingOnlineRequests = [];
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
      <div class="group-top"><span class="chip subject-chip">${escapeHTML(group.subject)}</span><span class="meta">${group.members}/${group.limit} membros · ${group.visibility === "private" ? "Privado" : "Público"}</span></div>
      <h3>${escapeHTML(group.name)}</h3>
      <p>${escapeHTML(group.objective)}</p>
      <div class="group-footer"><span>Organizado por ${escapeHTML(group.owner)}</span><button class="button button-primary button-small" data-open-group="${group.id}">Ver detalhes</button></div>
    </article>`).join("");
}

function showModal(content) {
  modal.querySelector(".modal").classList.remove("room-chat-screen");
  modalContent.innerHTML = content;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  stopRoomMessages();
  stopRoomMessages = () => {};
  modal.hidden = true;
  modal.querySelector(".modal").classList.remove("room-chat-screen");
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
    document.querySelector("#reset-direct-chat").textContent = "Fechar conversa";
    document.querySelector(".direct-chat-topic").hidden = true;
    const history = document.querySelector("#direct-conversation-history");
    history.hidden = false;
    document.querySelector(".direct-chat-contact").hidden = true;
    document.querySelector("#direct-conversation-list").innerHTML = !session
      ? '<p class="meta">Entre para ver suas conversas.</p>'
      : directConversations.length ? directConversations.map((conversation) => {
        const partnerId = conversation.participantIds?.find((id) => id !== session.uid);
        const name = conversation.participantNames?.[partnerId] || "Estudante";
        const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("");
        return `<button type="button" class="direct-history-item ${conversation.id === activeDirectConversationId ? "active" : ""}" data-conversation-id="${escapeHTML(conversation.id)}" ${conversation.id === activeDirectConversationId ? 'aria-current="true"' : ""}><span class="avatar teal">${escapeHTML(initials)}</span><strong>${escapeHTML(name)}</strong></button>`;
      }).join("") : '<p class="meta">Suas conversas aparecerão aqui.</p>';
    const partner = directRecipient;
    directChatTitle.textContent = partner ? partner.name : "Escolha uma pessoa";
    directChatSubtitle.textContent = partner ? [partner.course, partner.email].filter(Boolean).join(" · ") || "Conversa privada" : "Informe o e-mail da conta da outra pessoa";
    directContactAvatar.className = "avatar teal";
    directContactAvatar.textContent = partner ? partner.name.split(" ").map((part) => part[0]).slice(0, 2).join("") : "?";
    directContactName.textContent = partner ? partner.name : "Nenhuma conversa selecionada";
    directContactStatus.textContent = session ? "Conectado em tempo real" : "Entre para iniciar uma conversa";
    directChatHint.textContent = session && partner ? `${session.name.split(" ")[0]} enviará a próxima mensagem.` : session ? "Escolha uma conversa para enviar uma mensagem." : "Use o botão Entrar para acessar sua conta.";
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

function renderProfile() {
  const user = session || {};
  const missing = "Não informado";
  document.querySelector("#profile-name").textContent = user.name || "Seu perfil";
  document.querySelector("#profile-initials").textContent = user.name
    ? user.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("")
    : "?";
  document.querySelector("#profile-course").textContent = session
    ? `${user.course || missing} · ${user.semester || missing}`
    : "Entre para ver seu perfil.";
  for (const field of ["university", "subject", "intent", "difficulty"]) {
    document.querySelector("#profile-" + field).textContent = user[field] || missing;
  }
  const bio = document.querySelector("#profile-bio");
  bio.textContent = user.bio || "";
  bio.hidden = !user.bio;
}

function groupEntryButton(group, isMember, onlineRoom) {
  const id = escapeHTML(group.id);
  if (isMember) return `<button class="button button-primary" data-open-chat="${id}">Abrir chat</button>`;
  if (group.members >= group.limit) return '<button class="button button-secondary" disabled>Grupo cheio</button>';
  if (!onlineRoom) return `<button class="button button-primary" data-request-group="${id}">Solicitar participação</button>`;
  if (group.visibility !== "private") return `<button class="button button-primary" data-join-online-room="${id}">Entrar no grupo</button>`;

  const pending = myOnlineRequests.some(request => request.roomId === group.id && request.status === "Pendente");
  if (pending) return '<button class="button button-primary" disabled>Solicitação enviada</button>';
  return `<button class="button button-primary" data-request-online-room="${id}">Solicitar entrada</button>`;
}

function roomMembers(group, names = {}) {
  let html = "<h3>Administrar membros</h3>";
  for (const id of group.memberIds || []) {
    const owner = id === group.ownerId;
    const name = names[id] || group.memberNames?.[id] || (owner ? group.owner : "Membro");
    const action = owner ? "<small>Organizador</small>"
      : `<button class="button button-secondary button-small" data-remove-member="${escapeHTML(id)}" data-room-id="${escapeHTML(group.id)}">Remover</button>`;
    html += `<div class="request-item"><span>${escapeHTML(name)}</span>${action}</div>`;
  }
  return html;
}

function openGroup(group) {
  const onlineRoom = firebaseReady && Boolean(group.ownerId);
  const isOwner = onlineRoom ? group.ownerId === session?.uid : group.ownerEmail === session?.email || (!group.ownerEmail && group.owner === (session?.name || "Eduardo Schwertz"));
  const userEmail = session?.email || "eduardo@studylink.local";
  const isMember = onlineRoom ? (group.memberIds || []).includes(session?.uid) : isOwner || requests.some((request) => request.groupId === group.id && request.email === userEmail && request.status === "Aprovada");
  const action = groupEntryButton(group, isMember, onlineRoom);
  const members = onlineRoom && isOwner
    ? `<div class="modal-section" data-member-list="${escapeHTML(group.id)}">${roomMembers(group)}</div>`
    : "";
  showModal(`<span class="chip subject-chip">${escapeHTML(group.subject)}</span><h2 id="modal-title">${escapeHTML(group.name)}</h2><p>${escapeHTML(group.objective)}</p><div class="modal-section"><p>Organizado por ${escapeHTML(group.owner)} · ${group.members}/${group.limit} membros · ${group.visibility === "private" ? "Privado: entrada mediante aprovação" : "Público: entrada livre"}</p></div>${members}<div class="modal-actions">${action}${onlineRoom && isOwner ? `<button class="button button-secondary" data-delete-room="${escapeHTML(group.id)}">Excluir grupo</button>` : ""}<button class="button button-secondary" data-close-modal>Fechar</button></div>`);
  if (onlineRoom && isOwner && (group.memberIds || []).some((id) => !group.memberNames?.[id])) {
    getRoomMemberNames(group.memberIds).then((names) => {
      const element = modalContent.querySelector("[data-member-list]");
      if (!element || element.dataset.memberList !== group.id) return;
      element.innerHTML = roomMembers(group, names);
    }).catch(() => showToast("Não foi possível carregar os nomes dos membros."));
  }
}


function openChat(groupId) {
  const group = groups.find((item) => item.id === groupId);
  if (firebaseReady && group?.ownerId) {
    if (!session?.uid || !(group.memberIds || []).includes(session.uid)) { showToast("Entre na sala antes de abrir o chat."); return; }
    stopRoomMessages();
    showModal(`<h2 id="modal-title">Chat · ${escapeHTML(group.name)}</h2><p>Conversa da sala em tempo real.</p><div id="online-room-messages" class="chat-messages"><p class="meta">Carregando mensagens…</p></div><form id="online-room-chat-form" class="chat-form" data-chat-group="${escapeHTML(groupId)}"><label for="online-room-message">Mensagem</label><textarea id="online-room-message" name="message" maxlength="500" placeholder="Escreva uma mensagem para a sala..." required></textarea><div class="modal-actions"><button class="button button-secondary" type="button" data-back-to-group="${escapeHTML(groupId)}">Voltar à sala</button><button class="button button-primary" type="submit">Enviar</button></div></form>`);
    modal.querySelector(".modal").classList.add("room-chat-screen");
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
    visibility: String(data.get("visibility")),
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

function selectDirectConversation(conversationId, recipient) {
  stopDirectMessages();
  onlineDirectMessages = [];
  directRecipient = recipient;
  activeDirectConversationId = conversationId;
  stopDirectMessages = watchDirectMessages(conversationId, (messages) => {
    onlineDirectMessages = messages;
    renderDirectChat();
  }, () => showToast("Não foi possível carregar esta conversa."));
  renderDirectChat();
}

document.querySelector("#direct-conversation-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-conversation-id]");
  if (!button || !session?.uid) return;
  const conversation = directConversations.find((item) => item.id === button.dataset.conversationId);
  const partnerId = conversation?.participantIds?.find((id) => id !== session.uid);
  if (!partnerId) return;
  selectDirectConversation(conversation.id, { uid: partnerId, name: conversation.participantNames?.[partnerId] || "Estudante" });
});

document.querySelector("#direct-recipient-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!firebaseReady) { showToast("Configure o Firebase para conversar entre dispositivos."); return; }
  if (!session?.uid) { showToast("Entre na sua conta antes de iniciar uma conversa."); return; }
  const email = document.querySelector("#direct-recipient-email").value.trim().toLowerCase();
  const currentUser = session;
  if (!email) return;
  try {
    const found = await findProfileByEmail(email);
    if (session?.uid !== currentUser.uid) return;
    if (!found) { showToast("Nenhuma conta encontrada com esse e-mail."); return; }
    if (found.uid === session.uid) { showToast("Escolha a conta da outra pessoa."); return; }
    const conversationId = await openDirectConversation(currentUser, found);
    if (session?.uid !== currentUser.uid) return;
    selectDirectConversation(conversationId, found);
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
  if (event.target.closest("[data-register]")) {
    showModal(`<h2 id="modal-title">Criar conta</h2><form id="online-register-form" class="auth-form">${document.querySelector("#academic-fields").innerHTML}<label>E-mail<input name="email" type="email" required></label><label>Senha<input name="password" type="password" required minlength="6" autocomplete="new-password"></label><div class="modal-actions"><button class="button button-primary" type="submit">Criar conta</button></div></form>`);
    return;
  }
  const requestRoom = event.target.closest("[data-request-online-room]");
  const decisionOnline = event.target.closest("[data-online-decision]");
  const remove = event.target.closest("[data-remove-member]");
  const deleteRoom = event.target.closest("[data-delete-room]");
  try {
    if (requestRoom) {
      if (!session?.uid) {
        showToast("Entre na sua conta para solicitar acesso.");
        return;
      }
      const group = groups.find(group => group.id === requestRoom.dataset.requestOnlineRoom);
      await requestRoomAccess(group, session);
      closeModal();
      showToast("Solicitação enviada ao organizador.");
      return;
    }
    if (decisionOnline) {
      const request = incomingOnlineRequests.find(request => request.id === decisionOnline.dataset.requestId);
      const approved = decisionOnline.dataset.onlineDecision === "approve";
      await decideRoomRequest(request, approved);
      showToast("Solicitação respondida.");
      return;
    }
    if (remove) {
      if (!confirm("Remover esta pessoa do grupo?")) return;
      await removeRoomMember(remove.dataset.roomId, remove.dataset.removeMember);
      closeModal();
      showToast("Pessoa removida do grupo.");
      return;
    }
    if (deleteRoom) {
      if (!confirm("Excluir este grupo? Os membros perderão acesso ao chat.")) return;
      await deleteOnlineRoom(deleteRoom.dataset.deleteRoom);
      closeModal();
      showToast("Grupo excluído.");
      return;
    }
  } catch (error) {
    showToast(error.message || "Não foi possível concluir a ação.");
    return;
  }
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
  if (!session || (firebaseReady && !session.uid)) {
    showToast("Entre na sua conta para editar o perfil.");
    return;
  }
  showModal(`<h2 id="modal-title">Editar perfil</h2>
    <form id="profile-form" class="auth-form">
      ${document.querySelector("#academic-fields").innerHTML}
      <label>Sobre você<textarea name="bio" maxlength="180"></textarea></label>
      <div class="modal-actions"><button class="button button-primary" type="submit">Salvar perfil</button></div>
    </form>`);
  for (const field of modalContent.querySelectorAll("[name]")) {
    field.value = session[field.name] || "";
  }
});

function renderRequests() {
  const mine = document.querySelector("#my-requests"); const incoming = document.querySelector("#incoming-requests");
  if (firebaseReady) {
    mine.innerHTML = myOnlineRequests.length ? myOnlineRequests.map((r) => `<div class="request-item"><div><strong>${escapeHTML(r.groupName)}</strong><p>${escapeHTML(r.status)}</p></div></div>`).join("") : '<p class="meta">Nenhuma solicitação enviada.</p>';
    incoming.innerHTML = incomingOnlineRequests.filter((r) => r.status === "Pendente").map((r) => `<div class="request-item"><div><strong>${escapeHTML(r.name)}</strong><p>${escapeHTML(r.groupName)}</p></div><div class="request-actions"><button class="button button-primary button-small" data-online-decision="approve" data-request-id="${escapeHTML(r.id)}">Aprovar</button><button class="button button-secondary button-small" data-online-decision="reject" data-request-id="${escapeHTML(r.id)}">Recusar</button></div></div>`).join("") || '<p class="meta">Nenhum pedido pendente.</p>';
    return;
  }
  const my = requests.filter((r) => r.email === (session?.email || "visitante@studylink.local"));
  mine.innerHTML = my.length ? my.map((r) => `<div class="request-item"><div><strong>${escapeHTML(r.groupName)}</strong><p>${escapeHTML(r.status)}</p></div><span class="request-state">${escapeHTML(r.status)}</span></div>`).join("") : '<p class="meta">Você ainda não enviou pedidos. Explore os grupos disponíveis.</p>';
  const received = requests.filter((r) => groups.some((g) => g.id === r.groupId && (g.ownerEmail ? g.ownerEmail === session?.email : g.owner === (session?.name || "Eduardo Schwertz"))));
  incoming.innerHTML = received.length ? received.map((r) => `<div class="request-item"><div><strong>${escapeHTML(r.name)}</strong><p>${escapeHTML(r.groupName)} · ${escapeHTML(r.status)}</p></div>${r.status === "Pendente" ? `<div class="request-actions"><button class="button button-primary button-small" data-decision="Aprovada" data-request="${r.id}">Aprovar</button><button class="button button-secondary button-small" data-decision="Recusada" data-request="${r.id}">Recusar</button></div>` : `<span class="request-state">${escapeHTML(r.status)}</span>`}</div>`).join("") : '<p class="meta">Nenhum pedido recebido por enquanto.</p>';
}

document.querySelector("#auth-button").addEventListener("click", () => {
  if (firebaseReady) {
    if (session?.uid) { signOutAccount().catch((error) => showToast(error.message || "Não foi possível sair.")); return; }
    showModal(`<h2 id="modal-title">Entrar no StudyLink</h2><form id="online-login-form" class="auth-form"><label>E-mail<input name="email" type="email" required></label><label>Senha<input name="password" type="password" required autocomplete="current-password"></label><div class="modal-actions"><button type="button" class="button button-secondary" data-register> Criar conta</button><button class="button button-primary" type="submit">Entrar</button></div></form>`);
    return;
  }
  if (session) { session = null; localStorage.removeItem("studylink.session"); document.querySelector("#auth-button").textContent = "Entrar"; renderRequests(); renderProfile(); showToast("Você saiu da sessão demonstrativa."); return; }
  showModal(`<h2 id="modal-title">Entrar no StudyLink</h2><p class="demo-note">Acesso demonstrativo: a sessão é salva apenas neste navegador. Este formulário não envia nem armazena senhas; para usar as contas online é necessário configurar o Firebase.</p><form id="auth-form" class="auth-form"><label>Seu nome<input name="name" required maxlength="60" placeholder="Como podemos chamar você?"></label><label>E-mail acadêmico<input name="email" type="email" required placeholder="voce@universidade.edu"></label><label>Curso<select name="course" required>${courses.map((course) => `<option>${escapeHTML(course)}</option>`).join("")}</select></label><label>Senha (apenas demonstração)<input name="password" type="password" required minlength="6" autocomplete="current-password"></label><div class="modal-actions"><button class="button button-primary" type="submit">Acessar demonstração</button></div></form>`);
});

document.addEventListener("submit", async (event) => {
  if (["online-login-form", "online-register-form"].includes(event.target.id)) {
    event.preventDefault();
    const data = new FormData(event.target);
    const values = Object.fromEntries(data.entries());
    try {
      session = event.target.id === "online-register-form" ? await registerAccount(values) : await signInAccount(values.email, values.password);
      closeModal(); renderProfile(); renderDirectChat(); showToast(`Olá, ${session.name}! Sua conta está conectada.`);
    } catch (error) { showToast(error.message || "Não foi possível acessar sua conta."); }
    return;
  }
  if (event.target.id === "auth-form") { event.preventDefault(); const data = new FormData(event.target); session = {name:String(data.get("name")).trim(),email:String(data.get("email")).trim().toLowerCase(),course:String(data.get("course"))}; saveData("studylink.session", session); document.querySelector("#auth-button").textContent = "Sair"; closeModal(); renderRequests(); renderProfile(); showToast(`Olá, ${session.name}! Sua sessão demonstrativa está ativa.`); }
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
  if (event.target.id === "profile-form") {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target).entries());
    try {
      if (firebaseReady) await saveProfile(session, values);
      session = { ...session, ...values };
      if (!firebaseReady) saveData("studylink.session", session);
      renderProfile(); closeModal(); showToast("Perfil atualizado.");
    } catch (error) { showToast(error.message || "Não foi possível salvar o perfil."); }
  }
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
    stopDirectMessages();
    stopDirectMessages = () => {};
    stopDirectConversations();
    stopDirectConversations = () => {};
    directConversations = [];
    onlineDirectMessages = [];
    directRecipient = null;
    activeDirectConversationId = null;
    stopMyRequests(); stopIncomingRequests();
    myOnlineRequests = []; incomingOnlineRequests = [];
    session = user;
    renderProfile(); renderRequests();
    if (user) {
      stopMyRequests = watchRoomRequests(user.uid, "requesterId", (items) => { myOnlineRequests = items; renderRequests(); }, () => showToast("Não foi possível carregar seus pedidos."));
      stopIncomingRequests = watchRoomRequests(user.uid, "ownerId", (items) => { incomingOnlineRequests = items; renderRequests(); }, () => showToast("Não foi possível carregar pedidos recebidos."));
    }
    document.querySelector("#auth-button").textContent = user ? "Sair" : "Entrar";
    renderDirectChat();
    if (user) {
      stopDirectConversations = watchDirectConversations(user.uid, (conversations) => {
        directConversations = conversations;
        renderDirectChat();
      }, () => showToast("Não foi possível carregar o histórico de conversas. Verifique as regras do Firebase."));
    }
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
renderProfile();
renderStudents();
renderGroups();
renderRequests();
renderDirectChat();
