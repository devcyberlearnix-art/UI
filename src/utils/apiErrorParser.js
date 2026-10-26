const SAFE_FALLBACK = "Something went wrong. Please try again.";

const isObject = (value) => value && typeof value === "object";

const firstMessage = (value) => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstMessage(item);
      if (message) return message;
    }
  }
  if (isObject(value)) {
    for (const key of ["message", "error", "detail", "description", "defaultMessage"]) {
      const message = firstMessage(value[key]);
      if (message) return message;
    }
  }
  return "";
};

const normaliseFieldName = (key) => {
  const aliases = {
    mobileNumber: "mobile",
    phoneNumber: "mobile",
    preferredLanguage: "preferredLanguages",
    profilePhoto: "profilePhoto",
    image: "profilePhoto",
  };
  return aliases[key] || key;
};

export const parseApiError = (error, fallback = SAFE_FALLBACK) => {
  const response = error?.response;
  const body = response?.data;
  const fieldErrors = {};
  const candidates = [body?.fieldErrors, body?.errors, body?.validationErrors, body?.data?.fieldErrors];

  for (const candidate of candidates) {
    if (!isObject(candidate)) continue;
    Object.entries(candidate).forEach(([key, value]) => {
      const message = firstMessage(value);
      if (message) fieldErrors[normaliseFieldName(key)] = message;
    });
  }

  if (Array.isArray(body?.errors)) {
    body.errors.forEach((item) => {
      if (!isObject(item)) return;
      const key = item.field || item.path || item.property;
      const message = firstMessage(item.message || item.error || item);
      if (key && message) fieldErrors[normaliseFieldName(key)] = message;
    });
  }

  let message = firstMessage(body) || firstMessage(error?.message);
  if (!message || message === "Network Error") {
    if (fallback === "") return { message: "", fieldErrors, status: response?.status || null };
    if (!response) message = "We couldn't reach the learning platform. Check your connection and try again.";
    else if (response.status === 429) message = "Too many attempts. Please wait a moment and try again.";
    else if (response.status >= 500) message = "The learning platform is temporarily unavailable. Please try again shortly.";
    else message = fallback;
  }

  return { message, fieldErrors, status: response?.status || null };
};

export default parseApiError;
