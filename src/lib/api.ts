import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // send refresh_token cookie
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

// Attach access token from store to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 — try to refresh, then retry once. Multiple in-flight 401s share
// a single refresh call (single-flight) to avoid racing the refresh-token
// cookie and burning the one-shot rotation on the server.
let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      );
      localStorage.setItem("access_token", data.access_token);
      return data.access_token as string;
    } finally {
      // Clear *after* the promise settles so concurrent callers resolve to
      // the same result, then the next 401 starts a fresh refresh.
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        localStorage.removeItem("access_token");
        if (typeof window !== "undefined") window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);
