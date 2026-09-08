export function validateLogin(values) {
  const errors = {};
  if (!values.username.trim()) errors.username = "Escribe tu usuario.";
  if (!values.password) errors.password = "Escribe tu contraseña.";
  return errors;
}

export function validateRegistration(values) {
  const errors = {};
  if (!values.nombre.trim()) errors.nombre = "Escribe tu nombre completo.";
  if (!values.telefono.trim()) errors.telefono = "Escribe tu teléfono.";
  if (!values.correo.trim()) {
    errors.correo = "Escribe tu correo electrónico.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.correo)) {
    errors.correo = "Introduce un correo válido.";
  }
  if (!values.edad) {
    errors.edad = "Indica tu edad.";
  } else if (Number(values.edad) < 1) {
    errors.edad = "La edad debe ser mayor que cero.";
  }
  return errors;
}
