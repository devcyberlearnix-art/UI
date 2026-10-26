export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordRules = {
  minLength: 8,
  lower: /[a-z]/,
  upper: /[A-Z]/,
  number: /\d/,
  symbol: /[^A-Za-z0-9]/,
};

export const getPasswordChecks = (password = "") => ({
  length: password.length >= passwordRules.minLength,
  lower: passwordRules.lower.test(password),
  upper: passwordRules.upper.test(password),
  number: passwordRules.number.test(password),
  symbol: passwordRules.symbol.test(password),
});

export const isStrongPassword = (password) => Object.values(getPasswordChecks(password)).every(Boolean);

export const validateEmail = (email) => emailPattern.test(String(email || "").trim());

export const validatePhone = (countryCode, value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (countryCode === "+91") return /^[6-9]\d{9}$/.test(digits);
  return digits.length >= 7 && digits.length <= 15;
};

export const validateBirthDate = (value) => {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
};
