import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { validateLogin } from "../validation";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    try {
      await login(values.username.trim(), values.password);
      navigate(location.state?.from?.pathname || "/examenes", { replace: true });
    } catch (error) {
      setFormError(error.message);
      setValues({ username: "", password: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="intro-panel">
        <span className="eyebrow">Portal de admisiones</span>
        <h1>Tu próximo paso empieza aquí.</h1>
        <p>Accede al registro del examen con una experiencia sencilla, clara y segura.</p>
        <div className="accent-line" />
      </section>
      <section className="form-panel" aria-labelledby="login-title">
        <div className="form-heading">
          <span className="step-label">01 / Acceso</span>
          <h2 id="login-title">Iniciar sesión</h2>
          <p>Introduce tus datos para continuar.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="username">Usuario</label>
          <input id="username" name="username" value={values.username} onChange={handleChange} autoComplete="username" aria-invalid={Boolean(errors.username)} />
          {errors.username && <span className="field-error">{errors.username}</span>}

          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" value={values.password} onChange={handleChange} autoComplete="current-password" aria-invalid={Boolean(errors.password)} />
          {errors.password && <span className="field-error">{errors.password}</span>}

          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Validando..." : "Continuar"}<span aria-hidden="true">→</span>
          </button>
        </form>
        <Link className="quiet-link" to="/login">Portal de registro al examen</Link>
      </section>
    </main>
  );
}
