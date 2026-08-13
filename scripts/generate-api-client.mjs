import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contractPath = path.join(root, "src", "config", "apiContract.json");
const outputPath = path.join(root, "src", "api", "generatedApiClient.js");

const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));

const toCamel = (text) => {
  const parts = String(text)
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "operation";

  return parts
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
};

const normalizeName = (value, fallback) => {
  const name = toCamel(value);
  return name || fallback;
};

const flatten = () => {
  const rows = [];

  Object.entries(contract || {}).forEach(([serviceName, serviceDef]) => {
    const basePath = serviceDef?.base_path || "";

    if (serviceName === "api_gateway" && serviceDef?.session_management?.endpoints) {
      const controller = "session_management";
      const gatewayBase = serviceDef?.session_management?.base_path || basePath;
      serviceDef.session_management.endpoints.forEach((endpoint, index) => {
        rows.push({ serviceName, controller, endpoint, index, basePath: gatewayBase });
      });
      return;
    }

    const controllers = serviceDef?.controllers || {};
    Object.entries(controllers).forEach(([controller, controllerDef]) => {
      (controllerDef?.endpoints || []).forEach((endpoint, index) => {
        rows.push({ serviceName, controller, endpoint, index, basePath });
      });
    });
  });

  return rows;
};

const rows = flatten();

const tree = {};
rows.forEach(({ serviceName, controller, endpoint, index }) => {
  if (!tree[serviceName]) tree[serviceName] = {};
  if (!tree[serviceName][controller]) tree[serviceName][controller] = [];

  tree[serviceName][controller].push({
    method: String(endpoint.method || "GET").toUpperCase(),
    pathTemplate: endpoint.path,
    description: endpoint.description || "",
    authRequired: Boolean(endpoint.auth_required),
    authType: endpoint.auth_type || "",
    methodNameBase: normalizeName(`${endpoint.method || "get"} ${endpoint.description || endpoint.path}`, `operation${index + 1}`),
  });
});

const lines = [];
lines.push("/* eslint-disable */");
lines.push("import { requestFromContract } from \"./contractApi\";");
lines.push("");
lines.push("const buildRequester = (service, controller, method, pathTemplate, description) => {");
lines.push("  return (payload = {}) => requestFromContract({ service, controller, method, pathTemplate, descriptionIncludes: description }, payload);");
lines.push("};");
lines.push("");
lines.push("export const generatedApiClient = {");

Object.entries(tree).forEach(([serviceName, controllers]) => {
  lines.push(`  ${JSON.stringify(serviceName)}: {`);

  Object.entries(controllers).forEach(([controller, endpoints]) => {
    lines.push(`    ${JSON.stringify(controller)}: {`);

    const used = new Set();
    endpoints.forEach((endpoint, i) => {
      let methodName = endpoint.methodNameBase;
      let suffix = 2;
      while (used.has(methodName)) {
        methodName = `${endpoint.methodNameBase}${suffix}`;
        suffix += 1;
      }
      used.add(methodName);

      lines.push(
        `      ${JSON.stringify(methodName)}: buildRequester(${JSON.stringify(serviceName)}, ${JSON.stringify(controller)}, ${JSON.stringify(endpoint.method)}, ${JSON.stringify(endpoint.pathTemplate)}, ${JSON.stringify(endpoint.description)}),`
      );
    });

    lines.push("      $meta: [");
    endpoints.forEach((endpoint) => {
      lines.push(
        `        { method: ${JSON.stringify(endpoint.method)}, pathTemplate: ${JSON.stringify(endpoint.pathTemplate)}, description: ${JSON.stringify(endpoint.description)}, authRequired: ${endpoint.authRequired}, authType: ${JSON.stringify(endpoint.authType)} },`
      );
    });
    lines.push("      ],");

    lines.push("    },");
  });

  lines.push("  },");
});

lines.push("};");
lines.push("");
lines.push("export default generatedApiClient;");

fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Generated API client at ${outputPath}`);
console.log(`Services: ${Object.keys(tree).length}`);
console.log(`Endpoints: ${rows.length}`);
