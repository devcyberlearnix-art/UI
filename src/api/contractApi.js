import axiosInstance from "./axiosInstance";
import apiContract from "../config/apiContract.json";

let activeContract = apiContract;

const normalizePath = (path = "") => {
  if (!path) return "/";
  const normalized = `/${String(path).replace(/^\/+/, "")}`;
  return normalized.replace(/\/{2,}/g, "/");
};

const splitSegments = (path = "") =>
  normalizePath(path)
    .split("/")
    .filter(Boolean);

const mergeBaseAndEndpointPath = (basePath = "", endpointPath = "") => {
  const baseSegments = splitSegments(basePath);
  const endpointSegments = splitSegments(endpointPath);

  if (!baseSegments.length) return normalizePath(endpointPath);
  if (!endpointSegments.length) return normalizePath(basePath);

  let overlap = 0;
  const maxOverlap = Math.min(baseSegments.length, endpointSegments.length);
  for (let size = maxOverlap; size > 0; size -= 1) {
    const baseTail = baseSegments.slice(baseSegments.length - size).join("/");
    const endpointHead = endpointSegments.slice(0, size).join("/");
    if (baseTail === endpointHead) {
      overlap = size;
      break;
    }
  }

  const merged = [...baseSegments, ...endpointSegments.slice(overlap)];
  return `/${merged.join("/")}`;
};

const createOperationKey = ({ service, controller, method, path, index }) => {
  const safePath = String(path || "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  return `${service}.${controller}.${String(method || "GET").toUpperCase()}.${safePath || "root"}.${index}`;
};

const flattenEndpoints = (contract) => {
  const list = [];

  Object.entries(contract || {}).forEach(([serviceName, serviceDef]) => {
    const serviceBasePath = serviceDef?.base_path || "";

    if (serviceName === "api_gateway" && serviceDef?.session_management?.endpoints) {
      const controllerName = "session_management";
      const gatewayBasePath = serviceDef?.session_management?.base_path || serviceBasePath || "";
      serviceDef.session_management.endpoints.forEach((endpoint, index) => {
        const fullPath = mergeBaseAndEndpointPath(gatewayBasePath, endpoint.path);
        list.push({
          key: createOperationKey({ service: serviceName, controller: controllerName, method: endpoint.method, path: endpoint.path, index }),
          service: serviceName,
          controller: controllerName,
          method: String(endpoint.method || "GET").toUpperCase(),
          pathTemplate: endpoint.path,
          fullPath,
          description: endpoint.description || "",
          authRequired: Boolean(endpoint.auth_required),
          authType: endpoint.auth_type || "",
        });
      });
      return;
    }

    const controllers = serviceDef?.controllers || {};
    Object.entries(controllers).forEach(([controllerName, controllerDef]) => {
      (controllerDef?.endpoints || []).forEach((endpoint, index) => {
        const fullPath = mergeBaseAndEndpointPath(serviceBasePath, endpoint.path);
        list.push({
          key: createOperationKey({ service: serviceName, controller: controllerName, method: endpoint.method, path: endpoint.path, index }),
          service: serviceName,
          controller: controllerName,
          method: String(endpoint.method || "GET").toUpperCase(),
          pathTemplate: endpoint.path,
          fullPath,
          description: endpoint.description || "",
          authRequired: Boolean(endpoint.auth_required),
          authType: endpoint.auth_type || "",
        });
      });
    });
  });

  return list;
};

const applyPathParams = (path, pathParams = {}) => {
  const source = normalizePath(path);
  return source.replace(/\{([^}]+)\}/g, (_, paramName) => {
    if (!(paramName in pathParams)) {
      throw new Error(`Missing path param: ${paramName}`);
    }
    return encodeURIComponent(pathParams[paramName]);
  });
};

let apiOperations = flattenEndpoints(activeContract);
let operationKeyMap = new Map(apiOperations.map((op) => [op.key, op]));

const rebuildOperationState = (contract) => {
  activeContract = contract;
  apiOperations = flattenEndpoints(activeContract);
  operationKeyMap = new Map(apiOperations.map((op) => [op.key, op]));
};

export const getApiOperations = () => apiOperations;

export const getApiOperation = (key) => operationKeyMap.get(key) || null;

export const findApiOperation = ({ service, controller, method, descriptionIncludes, pathTemplate }) => {
  const methodNormalized = method ? String(method).toUpperCase() : null;
  const desc = descriptionIncludes ? String(descriptionIncludes).toLowerCase() : null;

  return (
    apiOperations.find((operation) => {
      if (service && operation.service !== service) return false;
      if (controller && operation.controller !== controller) return false;
      if (methodNormalized && operation.method !== methodNormalized) return false;
      if (pathTemplate && operation.pathTemplate !== pathTemplate) return false;
      if (desc && !operation.description.toLowerCase().includes(desc)) return false;
      return true;
    }) || null
  );
};

export const initApiContract = async () => {
  try {
    const response = await fetch(`/api-contract.json?t=${Date.now()}`);
    if (!response.ok) {
      return apiContractSummary;
    }

    const runtimeContract = await response.json();
    if (runtimeContract && typeof runtimeContract === "object") {
      rebuildOperationState(runtimeContract);
    }
  } catch {
    // Fallback to bundled contract when runtime file is unavailable.
  }

  return apiContractSummary;
};

export const requestApiOperation = async (
  operation,
  {
    pathParams = {},
    query,
    data,
    headers,
    responseType,
  } = {}
) => {
  if (!operation) {
    throw new Error("requestApiOperation requires a valid operation definition");
  }

  const url = applyPathParams(operation.fullPath, pathParams);
  const response = await axiosInstance.request({
    method: operation.method,
    url,
    params: query,
    data,
    headers,
    responseType,
  });
  return response.data;
};

export const requestFromContract = async (
  {
    service,
    controller,
    method,
    descriptionIncludes,
    pathTemplate,
  },
  payload
) => {
  const operation = findApiOperation({
    service,
    controller,
    method,
    descriptionIncludes,
    pathTemplate,
  });

  if (!operation) {
    throw new Error(
      `No API operation found for service=${service}, controller=${controller}, method=${method}, descriptionContains=${descriptionIncludes}`
    );
  }

  return requestApiOperation(operation, payload);
};

export const apiContractSummary = {
  get operationCount() {
    return apiOperations.length;
  },
  get services() {
    return Array.from(new Set(apiOperations.map((item) => item.service)));
  },
};

export { apiOperations };
