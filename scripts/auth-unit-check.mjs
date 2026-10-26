import assert from "node:assert/strict";
import { getPasswordChecks, isStrongPassword, validateBirthDate, validateEmail, validatePhone } from "../src/utils/validation.js";

assert.equal(validateEmail("student@example.com"), true);
assert.equal(validateEmail("not-an-email"), false);
assert.equal(isStrongPassword("Example@123"), true);
assert.equal(isStrongPassword("password"), false);
assert.equal(getPasswordChecks("Example@123").symbol, true);
assert.equal(validatePhone("+91", "9990909919"), true);
assert.equal(validatePhone("+91", "12345"), false);
assert.equal(validatePhone("+44", "2079460123"), true);
assert.equal(validateBirthDate("2099-01-01"), false);
assert.equal(validateBirthDate("2009-12-09"), true);

console.log("Auth validation checks passed.");
