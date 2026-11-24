export const courses = ["Engenharia de Software", "Análise e Desenvolvimento de Sistemas", "Desenvolvimento de Jogos", "Advocacia / Direito", "Psiquiatria / Medicina", "Administração", "Psicologia", "Engenharia Civil", "Ciência da Computação"];
export const subjects = [
  { id: "calculo", name: "Cálculo I" }, { id: "algoritmos", name: "Algoritmos e Lógica" },
  { id: "gestao", name: "Gestão de Projetos" }, { id: "banco", name: "Banco de Dados" },
  { id: "programacao", name: "Programação Web" }, { id: "jogos", name: "Desenvolvimento de Jogos" },
  { id: "ia", name: "Inteligência Artificial" }, { id: "direito-civil", name: "Direito Civil" },
  { id: "direito-penal", name: "Direito Penal" }, { id: "constitucional", name: "Direito Constitucional" },
  { id: "anatomia", name: "Anatomia e Fisiologia" }, { id: "psiquiatria", name: "Psiquiatria" },
  { id: "psicologia", name: "Psicologia Clínica" }, { id: "estatistica", name: "Estatística" },
  { id: "fisica", name: "Física I" }, { id: "scrum", name: "Scrum e Métodos Ágeis" }
];

export const students = [
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

export const initialGroups = [
  { id: "calculo", name: "Cálculo I sem mistério", subject: "Cálculo I", objective: "Resolver listas de limites e derivadas antes da P1.", owner: "Camila Duarte", members: 2, limit: 5 },
  { id: "algoritmos", name: "Prática de algoritmos", subject: "Algoritmos", objective: "Treinar lógica e estruturas de repetição com desafios curtos.", owner: "Rafael Costa", members: 2, limit: 4 },
];

export const directChatUsers = [
  { id: "eduardo", name: "Eduardo Schwertz", initials: "ES", course: "Engenharia de Software", semester: "4º semestre", tone: "purple" },
  { id: "laura", name: "Laura Menezes", initials: "LM", course: "Engenharia Civil", semester: "2º semestre", tone: "teal" },
];
export const initialDirectMessages = [
  { id: 1, senderId: "laura", text: "Oi, Eduardo! Vi que você pode ajudar com Scrum. Você também estuda Cálculo I?", time: "14:08" },
  { id: 2, senderId: "eduardo", text: "Oi, Laura! Sim, estou revisando limites e derivadas esta semana. Podemos estudar juntos.", time: "14:10" },
  { id: 3, senderId: "laura", text: "Ótimo! Tenho dificuldade justamente nas derivadas. Que tal começarmos pela lista 2?", time: "14:12" },
];
