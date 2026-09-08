import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { api } from "./api";

/**
 * Contexto de autenticación que expone el estado de la sesión actual y las
 * acciones disponibles para iniciar o cerrar sesión.
 *
 * @type {React.Context<{ status: string, authenticated: boolean, login?: Function, logout?: Function } | null>}
 */
const AuthContext = createContext(null);

/**
 * Proveedor global de autenticación para la aplicación.
 *
 * Este componente recupera el estado actual del usuario al montarse, mantiene la
 * sesión en el estado local y comparte el contexto con todos los componentes
 * hijos que necesiten consultar o modificar la autenticación.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido que tendrá acceso al contexto de autenticación.
 * @returns {JSX.Element} Proveedor del contexto con la sesión y sus acciones.
 */
export function AuthProvider({ children }) {
  /**
   * Estado de la sesión:
   * - loading: se está validando el usuario.
   * - ready: la comprobación ya finalizó y se conoce si hay sesión activa.
   */
  const [session, setSession] = useState({ status: "loading", authenticated: false, user: null });

  useEffect(() => {
    // Comprueba si existe una sesión activa al cargar el proveedor.
    api.getSession()
      .then((result) => setSession({ status: "ready", authenticated: result.authenticated, user: result.user }))
      .catch(() => setSession({ status: "ready", authenticated: false, user: null }));
  }, []);

  /**
   * Inicia sesión con las credenciales recibidas.
   *
   * @param {string} username - Nombre de usuario o correo electrónico.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<void>} Resuelve cuando la autenticación termina.
   */
  const login = async (username, password) => {
    const result = await api.login(username, password);
    setSession({ status: "ready", authenticated: result.authenticated, user: result.user });
  };

  /**
   * Cierra la sesión actual y limpia el estado del cliente.
   *
   * @returns {Promise<void>} Resuelve cuando la operación de cierre de sesión termina.
   */
  const logout = async () => {
    await api.logout();
    setSession({ status: "ready", authenticated: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para acceder al contexto de autenticación.
 *
 * Permite consultar si el usuario está autenticado, si la sesión está cargando
 * y ejecutar acciones de login/logout desde cualquier componente hijo.
 *
 * @returns {{ status: string, authenticated: boolean, login: Function, logout: Function }}
 * Objeto con el estado de autenticación y las funciones de sesión.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return context;
}

/**
 * Ruta protegida que restringe el acceso a usuarios autenticados.
 *
 * Si la sesión aún se está validando, muestra un indicador de carga. Si el
 * usuario no está autenticado, lo redirige a la página de login guardando la
 * ruta original solicitada para poder devolverlo después.
 *
 * @returns {JSX.Element} El elemento hijo si está autenticado o un redireccionamiento en caso contrario.
 */
export function ProtectedRoute() {
  const { status, authenticated } = useAuth();
  const location = useLocation();

  if (status === "loading") return <div className="page-loader">Comprobando sesión...</div>;
  if (!authenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/**
 * Componente auxiliar para redirigir a usuarios ya autenticados fuera del flujo
 * de login.
 *
 * Cuando la comprobación de sesión finaliza y el usuario tiene una sesión activa,
 * se le envía automáticamente a la ruta de registro en lugar de permitirle
 * volver a la pantalla de inicio de sesión.
 *
 * @returns {JSX.Element|null} Un loader mientras se valida la sesión o null si ya terminó la comprobación.
 */
export function LoginRedirect() {
  const { status, authenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si la sesión ya está lista y el usuario está autenticado, no debe ver la vista de login.
    if (status === "ready" && authenticated) navigate("/examenes", { replace: true });
  }, [authenticated, navigate, status]);

  return status === "loading" ? <div className="page-loader">Comprobando sesión...</div> : null;
}
