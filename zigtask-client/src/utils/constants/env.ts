export const READ_ENV = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:3333",
  COOKIE_AUTH: import.meta.env.VITE_COOKIE_AUTH || "zig_auth",
  COOKIE_REFRESH: import.meta.env.VITE_COOKIE_REFRESH || "zig_refresh",
};
