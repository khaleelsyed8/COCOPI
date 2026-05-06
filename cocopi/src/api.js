const BASE = process.env.REACT_APP_API_URL || "http://192.168.1.5:5000/api";

/* ── Token helpers — exported so useAuth can import them ── */
export const getToken   = ()  => localStorage.getItem("cocopi_token");
export const setToken   = (t) => localStorage.setItem("cocopi_token", t);
export const clearToken = ()  => {
  localStorage.removeItem("cocopi_token");
  localStorage.removeItem("cocopi_user");
};

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) headers["Authorization"] = `Bearer ${getToken()}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  /* ── Generic methods (used by AdminPage) ── */
  get:    (path)       => request(path, { auth: true }),
  post:   (path, body) => request(path, { method: "POST",   body, auth: true }),
  put:    (path, body) => request(path, { method: "PUT",    body, auth: true }),
  patch:  (path, body) => request(path, { method: "PATCH",  body, auth: true }),
  delete: (path)       => request(path, { method: "DELETE", auth: true }),

  /* ── Scoped helpers (used by AuthPage, CheckoutPage) ── */
  auth: {
    me:       ()                      => request("/auth/me",       { auth: true }),
    login:    (email, password)       => request("/auth/login",    { method: "POST", body: { email, password } }),
    register: (name, email, password) => request("/auth/register", { method: "POST", body: { name, email, password } }),
  },
  products: {
    getAll: () => request("/products"),
  },
  orders: {
    create: (items, delivery) =>
      request("/orders", { method: "POST", body: { items, delivery }, auth: true }),
  },
};