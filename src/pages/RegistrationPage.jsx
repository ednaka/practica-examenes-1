import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";
import { validateRegistration } from "../validation";
import { ThemeToggle } from "../theme";

const initialValues = { nombre: "", telefono: "", correo: "", direccion: "", edad: "" };

export function RegistrationPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateRegistration(values);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createRegistration({ ...values, edad: Number(values.edad) });
      setSuccess("Tu registro fue recibido correctamente.");
      setValues(initialValues);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="registration-shell">
      <header className="topbar">
        <div><span className="eyebrow">Portal de admisiones</span><strong>Registro de examen</strong></div>
        <div className="topbar-actions"><ThemeToggle /><a className="text-button" href="/examenes">Mis exámenes</a><button className="text-button" type="button" onClick={handleLogout}>Cerrar sesión <span aria-hidden="true">↗</span></button></div>
      </header>
      <section className="registration-content" aria-labelledby="registration-title">
        <div className="registration-copy"><span className="step-label">02 / Registro</span><h1 id="registration-title">Reserva tu lugar.</h1><p>Completa tus datos personales para avanzar con tu inscripción al examen.</p></div>
        <form className="registration-form" onSubmit={handleSubmit} noValidate>
          <div className="field-grid">
            <Field label="Nombre completo" name="nombre" value={values.nombre} onChange={handleChange} error={errors.nombre} wide />
            <Field label="Teléfono" name="telefono" type="tel" value={values.telefono} onChange={handleChange} error={errors.telefono} />
            <Field label="Correo electrónico" name="correo" type="email" value={values.correo} onChange={handleChange} error={errors.correo} />
            <Field label="Dirección" name="direccion" value={values.direccion} onChange={handleChange} wide />
            <Field label="Edad" name="edad" type="number" min="1" value={values.edad} onChange={handleChange} error={errors.edad} />
          </div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          {success && <p className="success-message" role="status">{success}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Enviando..." : "Completar registro"}<span aria-hidden="true">→</span></button>
        </form>
      </section>
    </main>
  );
}

function Field({ label, name, type = "text", value, onChange, error, wide, min }) {
  return <label className={wide ? "field field-wide" : "field"} htmlFor={name}><span>{label}</span><input id={name} name={name} type={type} min={min} value={value} onChange={onChange} aria-invalid={Boolean(error)} />{error && <small className="field-error">{error}</small>}</label>;
}
