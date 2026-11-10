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
let session = loadData("studylink.session", null);
const subjectFilter = document.querySelector("#subject-filter");
const intentFilter = document.querySelector("#intent-filter");
const studentList = document.querySelector("#student-list");
const groupList = document.querySelector("#group-list");
const resultsCount = document.querySelector("#results-count");
const emptyStudents = document.querySelector("#empty-students");
const modal = document.querySelector("#profile-modal");
const modalContent = document.querySelector("#modal-content");
const toast = document.querySelector("#toast");

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
      <button class="button button-secondary button-small" data-open-student="${student.id}">Ver perfil</button>
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
    <div class="modal-actions"><button class="button button-secondary" data-close-modal>Fechar</button></div>`);
}

function openGroup(group) {
  const full = group.members >= group.limit;
  showModal(`
    <span class="chip subject-chip">${escapeHTML(group.subject)}</span>
    <h2 id="modal-title" style="margin-top:.7rem">${escapeHTML(group.name)}</h2>
    <p>${escapeHTML(group.objective)}</p>
    <div class="modal-section"><h3>Organização</h3><p>Administrado por <strong>${escapeHTML(group.owner)}</strong>. Há ${group.members} de ${group.limit} vagas ocupadas.</p></div>
    <div class="modal-section"><h3>Como entrar</h3><p>Envie uma solicitação para que o organizador possa avaliar sua participação.</p></div>
    <div class="modal-actions">${full ? `<button class="button button-secondary" disabled>Grupo completo</button>` : `<button class="button button-primary" data-request-group="${group.id}">Solicitar participação</button>`}<button class="button button-secondary" data-close-modal>Fechar</button></div>`);
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

document.querySelector("#group-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const group = {
    id: `group-${Date.now()}`,
    name: String(data.get("name")).trim(),
    subject: String(data.get("subject")),
    objective: String(data.get("objective")).trim(),
    owner: session?.name || "Eduardo Schwertz",
    members: 1,
    limit: Number(data.get("limit")),
  };
  groups.unshift(group);
  saveData("studylink.groups", groups);
  event.currentTarget.reset();
  document.querySelector("#group-form-wrap").hidden = true;
  document.querySelector("#open-group-form").hidden = false;
  renderGroups();
  renderRequests();
  showToast("Grupo criado e salvo neste navegador.");
});

document.addEventListener("click", (event) => {
  const studentButton = event.target.closest("[data-open-student]");
  const groupButton = event.target.closest("[data-open-group]");
  const requestButton = event.target.closest("[data-request-group]");
  if (studentButton) openStudent(students.find((student) => student.id === studentButton.dataset.openStudent));
  if (groupButton) openGroup(groups.find((group) => group.id === groupButton.dataset.openGroup));
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
  showModal(`<h2 id="modal-title">Editar perfil</h2><p>Atualize como você aparece para outros estudantes.</p><form id="profile-form" class="auth-form"><label>Nome<input name="name" value="${escapeHTML(session?.name || "Eduardo Schwertz")}" required maxlength="60"></label><label>Curso<input name="course" value="Engenharia de Software" required maxlength="80"></label><label>Sobre você<textarea name="bio" maxlength="180">Gosto de organizar estudos em grupo e trocar experiências sobre desenvolvimento de software.</textarea></label><div class="modal-actions"><button class="button button-primary" type="submit">Salvar perfil</button></div></form>`);
});

function renderRequests() {
  const mine = document.querySelector("#my-requests"); const incoming = document.querySelector("#incoming-requests");
  const my = requests.filter((r) => r.email === (session?.email || "visitante@studylink.local"));
  mine.innerHTML = my.length ? my.map((r) => `<div class="request-item"><div><strong>${escapeHTML(r.groupName)}</strong><p>${escapeHTML(r.status)}</p></div><span class="request-state">${escapeHTML(r.status)}</span></div>`).join("") : '<p class="meta">Você ainda não enviou pedidos. Explore os grupos disponíveis.</p>';
  const received = requests.filter((r) => groups.some((g) => g.id === r.groupId && g.owner === (session?.name || "Eduardo Schwertz")));
  incoming.innerHTML = received.length ? received.map((r) => `<div class="request-item"><div><strong>${escapeHTML(r.name)}</strong><p>${escapeHTML(r.groupName)} · ${escapeHTML(r.status)}</p></div>${r.status === "Pendente" ? `<div class="request-actions"><button class="button button-primary button-small" data-decision="Aprovada" data-request="${r.id}">Aprovar</button><button class="button button-secondary button-small" data-decision="Recusada" data-request="${r.id}">Recusar</button></div>` : `<span class="request-state">${escapeHTML(r.status)}</span>`}</div>`).join("") : '<p class="meta">Nenhum pedido recebido por enquanto.</p>';
}

document.querySelector("#auth-button").addEventListener("click", () => {
  if (session) { session = null; localStorage.removeItem("studylink.session"); document.querySelector("#auth-button").textContent = "Entrar"; renderRequests(); showToast("Você saiu da sessão demonstrativa."); return; }
  showModal(`<h2 id="modal-title">Entrar no StudyLink</h2><p class="demo-note">Acesso demonstrativo: a sessão é salva apenas neste navegador. Este formulário não envia nem armazena senhas; para login real é necessária a API planejada na Sprint 2.</p><form id="auth-form" class="auth-form"><label>Seu nome<input name="name" required maxlength="60" placeholder="Como podemos chamar você?"></label><label>E-mail acadêmico<input name="email" type="email" required placeholder="voce@universidade.edu"></label><label>Senha (apenas demonstração)<input name="password" type="password" required minlength="6" autocomplete="current-password"></label><div class="modal-actions"><button class="button button-primary" type="submit">Acessar demonstração</button></div></form>`);
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "auth-form") { event.preventDefault(); const data = new FormData(event.target); session = {name:String(data.get("name")).trim(),email:String(data.get("email")).trim().toLowerCase()}; saveData("studylink.session", session); document.querySelector("#auth-button").textContent = "Sair"; closeModal(); renderRequests(); showToast(`Olá, ${session.name}! Sua sessão demonstrativa está ativa.`); }
  if (event.target.id === "profile-form") { event.preventDefault(); const data = new FormData(event.target); if (!session) session = {name:"Eduardo Schwertz", email:"eduardo@studylink.local"}; session.name=String(data.get("name")).trim(); saveData("studylink.session",session); document.querySelector("#profile h2").textContent=session.name; closeModal(); showToast("Perfil atualizado nesta demonstração."); }
});

document.addEventListener("click", (event) => {
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

if (session) document.querySelector("#auth-button").textContent = "Sair";
renderStudents();
renderGroups();
renderRequests();
