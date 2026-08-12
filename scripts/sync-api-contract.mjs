import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { load } from "js-yaml";

const repoRoot = process.cwd();
const defaultSpecPath = "C:/Users/user/Downloads/API_DOCUMENTATION_lms.yml";
const inputPath = process.env.LMS_API_SPEC_PATH || defaultSpecPath;
const outputPath = path.join(repoRoot, "src", "config", "apiContract.json");
const runtimeOutputPath = path.join(repoRoot, "public", "api-contract.json");

if (!fs.existsSync(inputPath)) {
  console.error(`API spec not found at: ${inputPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, "utf8");
const parsed = load(raw);

if (!parsed || typeof parsed !== "object") {
  console.error("Parsed API spec is empty or invalid.");
  process.exit(1);
}

const serialized = `${JSON.stringify(parsed, null, 2)}\n`;
fs.writeFileSync(outputPath, serialized, "utf8");
fs.writeFileSync(runtimeOutputPath, serialized, "utf8");
console.log(`API contract synced to ${outputPath}`);
console.log(`Runtime API contract synced to ${runtimeOutputPath}`);
