import { PASSWORD_RULES, AUTH_ERRORS } from "../constants";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate email format.
 */
export function validateEmail(email: string): ValidationResult {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }
  return { valid: true };
}

/**
 * Validate password against feature rules.
 */
export function validatePassword(password: string): ValidationResult {
  if (password.length < PASSWORD_RULES.minLength) {
    return { valid: false, error: AUTH_ERRORS.WEAK_PASSWORD };
  }
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter" };
  }
  if (PASSWORD_RULES.requireNumber && !/\d/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" };
  }
  return { valid: true };
}

/**
 * Validate full registration form.
 */
export function validateRegistration(
  name: string,
  email: string,
  password: string,
): ValidationResult {
  if (!name.trim()) return { valid: false, error: "Name is required" };
  const emailResult = validateEmail(email);
  if (!emailResult.valid) return emailResult;
  const passwordResult = validatePassword(password);
  if (!passwordResult.valid) return passwordResult;
  return { valid: true };
}
