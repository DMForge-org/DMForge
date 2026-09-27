// lib/logger.js
export function log(entry) {
  const fn = typeof console[entry.level] === 'function' ? console[entry.level] : console.log;
  if (process.env.NODE_ENV === "development") {
    fn(`[${(entry.level || 'info').toUpperCase()}] ${entry.message}`, entry);
  } else {
    fn(JSON.stringify(entry));
  }
}

export function logError(message, error, context = {}) {
  const err = error instanceof Error ? error : new Error(String(error));
  log({
    level: "error",
    message,
    error: { name: err.name, message: err.message, stack: err.stack },
    ...context,
  });
}

