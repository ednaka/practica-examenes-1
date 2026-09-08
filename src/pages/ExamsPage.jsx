import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";

const emptyQuestion = () => ({ text: "", type: "text", options: ["", ""], required: true });

export function ExamsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getExams().then(setExams).catch((reason) => setError(reason.message));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const own = exams.filter((exam) => exam.owner === user?.username);
  return (
    <main className="registration-shell">
      <header className="topbar">
        <div><span className="eyebrow">Portal de exámenes</span><strong>Mis formularios</strong></div>
        <div className="topbar-actions"><span className="user-badge">{user?.username}</span><button className="text-button" onClick={handleLogout}>Cerrar sesión ↗</button></div>
      </header>
      <section className="dashboard-content">
        <div className="dashboard-heading">
          <div><span className="step-label">Exámenes compartidos</span><h1>Aprende y evalúa.</h1><p>Crea formularios, compártelos con otros usuarios y consulta sus respuestas.</p></div>
          <Link className="primary-button compact-button" to="/examenes/nuevo">Crear examen <span>+</span></Link>
        </div>
        {error && <p className="form-error">{error}</p>}
        <h2 className="section-title">Mis exámenes</h2>
        {own.length === 0 ? <p className="empty-state">Todavía no has creado un examen. Comienza con tu primer formulario.</p> : <div className="exam-grid">{own.map((exam) => <ExamCard key={exam.id} exam={exam} owner onOpenResults={() => navigate(`/examenes/${exam.id}/resultados`)} />)}</div>}
        <h2 className="section-title">Disponibles para responder</h2>
        {exams.filter((exam) => exam.owner !== user?.username).length === 0 ? <p className="empty-state">No hay exámenes de otros usuarios por ahora.</p> : <div className="exam-grid">{exams.filter((exam) => exam.owner !== user?.username).map((exam) => <ExamCard key={exam.id} exam={exam} />)}</div>}
      </section>
    </main>
  );
}

function ExamCard({ exam, owner, onOpenResults }) {
  return <article className="exam-card"><span className="card-kicker">{owner ? "Creado por ti" : `Por ${exam.owner}`}</span><h3>{exam.title}</h3><p>{exam.description || "Formulario sin descripción."}</p><small>{exam.questions.length} pregunta{exam.questions.length === 1 ? "" : "s"}</small><div className="card-actions">{owner && <button className="secondary-button" onClick={onOpenResults}>Ver resultados</button>}{!owner && <Link className="secondary-button" to={`/examenes/${exam.id}/responder`}>Responder →</Link>}</div></article>;
}

export function CreateExamPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const draftKey = `create:${user.username}`;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [error, setError] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    api.getDraft(draftKey).then((draft) => {
      if (draft) {
        setTitle(draft.title || "");
        setDescription(draft.description || "");
        setQuestions(draft.questions?.length ? draft.questions : [emptyQuestion()]);
      }
      setDraftLoaded(true);
    });
  }, [draftKey]);

  useEffect(() => {
    if (draftLoaded) api.saveDraft(draftKey, { title, description, questions });
  }, [description, draftKey, draftLoaded, questions, title]);

  const updateQuestion = (index, patch) => setQuestions((current) => current.map((question, item) => item === index ? { ...question, ...patch } : question));
  const save = async (event) => {
    event.preventDefault();
    if (!title.trim() || questions.some((question) => !question.text.trim())) {
      setError("Agrega un título y completa todas las preguntas.");
      return;
    }
    try {
      await api.createExam({ title: title.trim(), description: description.trim(), owner: user.username, questions });
      await api.clearDraft(draftKey);
      navigate("/examenes");
    } catch (reason) { setError(reason.message); }
  };
  return <main className="registration-shell"><header className="topbar"><div><span className="eyebrow">Portal de exámenes</span><strong>Nuevo formulario</strong></div><div className="topbar-actions"><span className="draft-status">Borrador guardado automáticamente</span><Link className="text-button" to="/examenes">← Volver</Link></div></header><section className="editor-content"><div><span className="step-label">Constructor</span><h1>Diseña tu examen.</h1><p>Escribe preguntas claras y decide si son abiertas o de opción múltiple.</p></div><form className="exam-editor" onSubmit={save}><label>Título<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Diagnóstico de matemáticas" /></label><label>Descripción<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Cuéntales a los participantes de qué trata." /></label>{questions.map((question, index) => <QuestionEditor key={index} question={question} index={index} update={updateQuestion} remove={() => setQuestions((current) => current.filter((_, item) => item !== index))} canRemove={questions.length > 1} />)}{error && <p className="form-error">{error}</p>}<button type="button" className="secondary-button add-question" onClick={() => setQuestions((current) => [...current, emptyQuestion()])}>+ Agregar pregunta</button><button className="primary-button" type="submit">Publicar examen <span>→</span></button></form></section></main>;
}

function QuestionEditor({ question, index, update, remove, canRemove }) {
  const updateOption = (optionIndex, value) => update(index, { options: question.options.map((option, item) => item === optionIndex ? value : option) });
  return <fieldset className="question-editor"><legend>Pregunta {index + 1}</legend><button type="button" className="remove-button" onClick={remove} disabled={!canRemove}>Eliminar</button><input value={question.text} onChange={(event) => update(index, { text: event.target.value })} placeholder="Escribe tu pregunta" /><select value={question.type} onChange={(event) => update(index, { type: event.target.value })}><option value="text">Respuesta abierta</option><option value="choice">Opción múltiple</option></select>{question.type === "choice" && <div className="options-list">{question.options.map((option, optionIndex) => <input key={optionIndex} value={option} onChange={(event) => updateOption(optionIndex, event.target.value)} placeholder={`Opción ${optionIndex + 1}`} />)}</div>}</fieldset>;
}

export function TakeExamPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const draftKey = `answers:${user.username}:${id}`;
  const [draftLoaded, setDraftLoaded] = useState(false);
  useEffect(() => { api.getExam(id).then(setExam).catch(() => navigate("/examenes")); api.getDraft(draftKey).then((draft) => { if (draft?.answers) setAnswers(draft.answers); setDraftLoaded(true); }); }, [draftKey, id, navigate]);
  useEffect(() => { if (draftLoaded) api.saveDraft(draftKey, { answers }); }, [answers, draftKey, draftLoaded]);
  if (!exam) return <div className="page-loader">Cargando examen...</div>;
  const submit = async (event) => { event.preventDefault(); await api.createResponse({ examId: id, username: user.username, answers }); await api.clearDraft(draftKey); setDone(true); };
  if (done) return <main className="center-message"><span className="step-label">Enviado</span><h1>¡Gracias por responder!</h1><p>Tu respuesta fue registrada correctamente.</p><Link className="secondary-button" to="/examenes">Volver a exámenes</Link></main>;
  return <main className="registration-shell"><header className="topbar"><div><span className="eyebrow">Examen de {exam.owner}</span><strong>{exam.title}</strong></div><Link className="text-button" to="/examenes">← Volver</Link></header><section className="take-content"><p>{exam.description}</p><form onSubmit={submit}>{exam.questions.map((question, index) => <label className="answer-field" key={index}><span>{index + 1}. {question.text}</span>{question.type === "choice" ? <select required={question.required} value={answers[index] || ""} onChange={(event) => setAnswers({ ...answers, [index]: event.target.value })}><option value="">Selecciona una opción</option>{question.options.filter(Boolean).map((option) => <option key={option}>{option}</option>)}</select> : <textarea required={question.required} value={answers[index] || ""} onChange={(event) => setAnswers({ ...answers, [index]: event.target.value })} />}</label>)}<button className="primary-button" type="submit">Enviar respuestas <span>→</span></button></form></section></main>;
}

export function ResultsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [responses, setResponses] = useState([]);
  useEffect(() => { Promise.all([api.getExam(id), api.getResponses(id)]).then(([loadedExam, loadedResponses]) => { if (loadedExam.owner !== user.username) return navigate("/examenes"); setExam(loadedExam); setResponses(loadedResponses); }); }, [id, navigate, user.username]);
  if (!exam) return <div className="page-loader">Cargando resultados...</div>;
  return <main className="registration-shell"><header className="topbar"><div><span className="eyebrow">Resultados</span><strong>{exam.title}</strong></div><Link className="text-button" to="/examenes">← Volver</Link></header><section className="results-content"><div className="results-summary"><span className="step-label">Respuestas recibidas</span><h1>{responses.length}</h1><p>participante{responses.length === 1 ? "" : "s"} contestaron tu formulario.</p></div>{responses.length === 0 ? <p className="empty-state">Aún no hay respuestas. Comparte tu examen para empezar a recibir resultados.</p> : responses.map((response) => <article className="response-card" key={response.id}><h3>{response.username}</h3><small>{new Date(response.submittedAt).toLocaleString()}</small>{exam.questions.map((question, index) => <div className="response-answer" key={index}><strong>{question.text}</strong><p>{response.answers[index] || "Sin respuesta"}</p></div>)}</article>)}</section></main>;
}
