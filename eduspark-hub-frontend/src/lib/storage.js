/*
  A tiny localStorage-backed data layer for the demo app.
  This keeps the React project fully client-side while still supporting CRUD flows.

  NOTE: This is intentionally simple and should be replaced with real API calls
  (e.g., Spring Boot endpoints) when wiring up the full system.
*/
const STORAGE_KEY = 'eduflow-db-v1';

export const safeJsonParse = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

export const loadDb = () => {
  const db = safeJsonParse(localStorage.getItem(STORAGE_KEY), null);
  return db && db.version === 1 ? db : null;
};

export const saveDb = (db) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const resetDb = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const uid = () => {
  // Good enough for client-side demo purposes.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
};
