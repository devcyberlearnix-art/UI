import { getApiOperations, requestApiOperation } from "./contractApi";

const toCamelCase = (value) => {
  const parts = String(value)
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

const buildOperationName = (operation) => {
  const raw = `${operation.method} ${operation.description || operation.pathTemplate}`;
  return toCamelCase(raw);
};

const buildApiTree = () => {
  const operations = getApiOperations();
  const tree = {};

  operations.forEach((operation, index) => {
    if (!tree[operation.service]) {
      tree[operation.service] = {};
    }

    if (!tree[operation.service][operation.controller]) {
      tree[operation.service][operation.controller] = {
        $operations: [],
      };
    }

    const controllerNode = tree[operation.service][operation.controller];
    const baseName = buildOperationName(operation);
    let operationName = baseName;
    let suffix = 1;

    while (controllerNode[operationName]) {
      suffix += 1;
      operationName = `${baseName}${suffix}`;
    }

    controllerNode[operationName] = (payload = {}) => requestApiOperation(operation, payload);
    controllerNode.$operations.push({
      key: operation.key,
      name: operationName,
      method: operation.method,
      fullPath: operation.fullPath,
      description: operation.description,
      index,
    });
  });

  return tree;
};

export const contractApiTree = buildApiTree();

export const refreshContractApiTree = () => {
  const nextTree = buildApiTree();
  Object.keys(contractApiTree).forEach((key) => {
    delete contractApiTree[key];
  });
  Object.assign(contractApiTree, nextTree);
  return contractApiTree;
};

export default contractApiTree;
