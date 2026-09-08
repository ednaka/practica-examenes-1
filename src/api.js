const USE_MOCK_API = true;
const SESSION_KEY = "tickets_mock_session";
const EXAMS_KEY = "tickets_mock_exams";
const RESPONSES_KEY = "tickets_mock_responses";
const DRAFTS_KEY = "tickets_mock_drafts";

const wait = (value, delay = 350) =>
  new Promise((resolve) => setTimeout(() => resolve(value), delay));

const mockApi = {
  async getSession() {
    const username = sessionStorage.getItem(SESSION_KEY);
    return wait({
      authenticated: Boolean(username),
      user: username ? { username } : null,
    });
  },

  async login(username, password) {
    if (!username || password !== "test1234") {
      throw new Error("Usuario o contraseña incorrectos.");
    }

    sessionStorage.setItem(SESSION_KEY, username);
    return wait({ authenticated: true, user: { username } });
  },

  async logout() {
    sessionStorage.removeItem(SESSION_KEY);
    return wait({ authenticated: false, user: null });
  },

  async createRegistration(registration) {
    const registrations = JSON.parse(
      localStorage.getItem("tickets_mock_registrations") || "[]",
    );
    const savedRegistration = {
      ...registration,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(
      "tickets_mock_registrations",
      JSON.stringify([...registrations, savedRegistration]),
    );
    return wait(savedRegistration);
  },

  async getExams() {
    return wait(JSON.parse(localStorage.getItem(EXAMS_KEY) || "[]"));
  },

  async createExam(exam) {
    const exams = JSON.parse(localStorage.getItem(EXAMS_KEY) || "[]");
    const savedExam = {
      ...exam,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(EXAMS_KEY, JSON.stringify([...exams, savedExam]));
    return wait(savedExam);
  },

  async getExam(id) {
    const exams = JSON.parse(localStorage.getItem(EXAMS_KEY) || "[]");
    const exam = exams.find((item) => item.id === id);
    if (!exam) throw new Error("No se encontró el examen.");
    return wait(exam);
  },

  async createResponse(response) {
    const responses = JSON.parse(localStorage.getItem(RESPONSES_KEY) || "[]");
    const savedResponse = {
      ...response,
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem(RESPONSES_KEY, JSON.stringify([...responses, savedResponse]));
    return wait(savedResponse);
  },

  async getResponses(examId) {
    const responses = JSON.parse(localStorage.getItem(RESPONSES_KEY) || "[]");
    return wait(responses.filter((response) => response.examId === examId));
  },

  async getDraft(key) {
    const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || "{}");
    return drafts[key] || null;
  },

  async saveDraft(key, value) {
    const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || "{}");
    drafts[key] = { ...value, savedAt: new Date().toISOString() };
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  },

  async clearDraft(key) {
    const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || "{}");
    delete drafts[key];
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  },
};

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "No fue posible completar la solicitud.");
  }

  return response.status === 204 ? null : response.json();
}

export const api = USE_MOCK_API
  ? mockApi
  : {
      getSession: () => request("/api/auth/session"),
      login: (username, password) =>
        request("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        }),
      logout: () => request("/api/auth/logout", { method: "POST" }),
      createRegistration: (registration) =>
        request("/api/registrations", {
          method: "POST",
          body: JSON.stringify(registration),
        }),
      getExams: () => request("/api/exams"),
      createExam: (exam) => request("/api/exams", { method: "POST", body: JSON.stringify(exam) }),
      getExam: (id) => request(`/api/exams/${id}`),
      createResponse: (response) => request("/api/responses", { method: "POST", body: JSON.stringify(response) }),
      getResponses: (examId) => request(`/api/exams/${examId}/responses`),
      getDraft: (key) => request(`/api/drafts/${encodeURIComponent(key)}`),
      saveDraft: (key, value) => request("/api/drafts", { method: "PUT", body: JSON.stringify({ key, value }) }),
      clearDraft: (key) => request(`/api/drafts/${encodeURIComponent(key)}`, { method: "DELETE" }),
    };
