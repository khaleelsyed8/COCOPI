/* ─────────────────────────────────────────
   COCOPI API CLIENT
   Supports both:
     api.get("/products")            — used by AdminPage, AuthPage, CheckoutPage
     api.products.getAll()           — used by Collections in App.jsx
───────────────────────────────────────── */

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/* ─ Token helpers ─ */
export const getToken   = ()      => localStorage.getItem("cocopi_token");
export const setToken   = (token) => localStorage.setItem("cocopi_token", token);
export const clearToken = ()      => localStorage.removeItem("cocopi_token");

/* ─ Core fetch ─ */
async function request(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const res  = await fetch(`${BASE_URL}${path}`, config);
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || "Something went wrong.");
    err.status = res.status;
    err.data   = data;
    throw err;
  }
  return data;
}

/* ─ Flat methods (used by AdminPage, AuthPage, CheckoutPage) ─ */
const api = {
  get:    (path)       => request("GET",    path),
  post:   (path, body) => request("POST",   path, body),
  put:    (path, body) => request("PUT",    path, body),
  patch:  (path, body) => request("PATCH",  path, body),
  delete: (path)       => request("DELETE", path),

  /* ─ Namespaced helpers (used by App.jsx Collections) ─ */
  products: {
    getAll:  ()       => request("GET",  "/products"),
    getOne:  (id)     => request("GET",  `/products/${id}`),
    create:  (body)   => request("POST", "/products",   body),
    update:  (id, b)  => request("PUT",  `/products/${id}`, b),
    remove:  (id)     => request("DELETE",`/products/${id}`),
  },
  auth: {
    login:    (body)  => request("POST", "/auth/login",    body),
    register: (body)  => request("POST", "/auth/register", body),
    me:       ()      => request("GET",  "/auth/me"),
  },
  orders: {
    place:   (body)   => request("POST", "/orders",      body),
    mine:    ()       => request("GET",  "/orders/mine"),
    getOne:  (id)     => request("GET",  `/orders/${id}`),
  },
  admin: {
    overview:      ()         => request("GET",   "/admin/overview"),
    orders:        (q)        => request("GET",   `/admin/orders${q||""}`),
    updateOrder:   (id, body) => request("PATCH", `/admin/orders/${id}/status`, body),
    products:      ()         => request("GET",   "/admin/products"),
    createProduct: (body)     => request("POST",  "/admin/products",     body),
    updateProduct: (id, body) => request("PUT",   `/admin/products/${id}`,body),
    deleteProduct: (id)       => request("DELETE",`/admin/products/${id}`),
    users:         ()         => request("GET",   "/admin/users"),
  },
};

export default api;
export { api }; // Named export — supports: import {api} from "./api"