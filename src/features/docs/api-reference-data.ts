// Loads the Hubfy REST API v1 OpenAPI spec from docs/api/v1/openapi.yaml
// and flattens it into the shape consumed by DocsSite.tsx.
//
// Single locale (English). The spec is bundled at build time via Vite's
// ?raw import, so there is no network fetch at runtime.

import v1SpecRaw from "../../../docs/api/v1/openapi.yaml?raw";
import { parse } from "yaml";

export type ApiParam = {
  name: string;
  type: string;
  required: boolean;
  format?: string;
  description?: string;
  enum?: string[];
};

export type ApiResponse = {
  status: string;
  description: string;
  example: string | null;
};

export type ApiEndpoint = {
  operationId: string;
  path: string;
  method: string;
  summary: string;
  description: string;
  security: "jwt" | "api_key" | "both" | "none";
  requestBody: { required: boolean; properties: ApiParam[] } | null;
  responses: ApiResponse[];
};

export type ApiTag = {
  name: string;
  description: string;
  endpoints: ApiEndpoint[];
};

export type ApiInfo = {
  title: string;
  version: string;
  description: string;
  servers: { url: string; description: string }[];
};

export type ApiReferenceBundle = {
  apiTags: ApiTag[];
  apiInfo: ApiInfo;
  apiBaseUrl: string;
  findEndpointById: (operationId: string) => {
    tagName: string;
    endpoint: ApiEndpoint;
  } | null;
};

type ApiDocument = Record<string, any>;

let cachedBundle: ApiReferenceBundle | null = null;

function resolveRef(root: ApiDocument, ref: string): any {
  const parts = ref.replace(/^#\//, "").split("/");
  let current: any = root;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

function deepResolve(root: ApiDocument, node: any): any {
  if (node == null || typeof node !== "object") return node;
  if (node.$ref) {
    return deepResolve(root, resolveRef(root, node.$ref));
  }
  if (Array.isArray(node)) {
    return node.map((item) => deepResolve(root, item));
  }
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(node)) {
    result[key] = deepResolve(root, node[key]);
  }
  return result;
}

function stringifyType(schema: any): string {
  if (!schema) return "unknown";
  if (schema.type === "array") {
    const itemType = schema.items ? stringifyType(schema.items) : "any";
    return `${itemType}[]`;
  }
  if (Array.isArray(schema.type)) {
    return schema.type.filter((t: string) => t !== "null").join(" | ") || "string";
  }
  if (schema.type === "object" && !schema.properties) return "object";
  return schema.type || "object";
}

function extractProperties(root: ApiDocument, schema: any): ApiParam[] {
  if (!schema) return [];
  const resolved = deepResolve(root, schema);
  if (!resolved) return [];

  if (resolved.allOf) {
    const merged: ApiParam[] = [];
    const seen = new Set<string>();
    for (const part of resolved.allOf) {
      for (const p of extractProperties(root, deepResolve(root, part))) {
        if (!seen.has(p.name)) {
          seen.add(p.name);
          merged.push(p);
        }
      }
    }
    return merged;
  }

  const props = resolved.properties;
  if (!props) return [];

  const required: string[] = resolved.required || [];
  const params: ApiParam[] = [];
  for (const [name, rawProp] of Object.entries<any>(props)) {
    const prop = deepResolve(root, rawProp);
    if (!prop) continue;
    const param: ApiParam = {
      name,
      type: stringifyType(prop),
      required: required.includes(name),
    };
    if (prop.format) param.format = prop.format;
    if (prop.description) param.description = prop.description;
    if (prop.enum) param.enum = prop.enum;
    params.push(param);
  }
  return params;
}

function extractRequestBody(
  root: ApiDocument,
  endpoint: any,
): { required: boolean; properties: ApiParam[] } | null {
  const requestBody = deepResolve(root, endpoint.requestBody);
  if (!requestBody) return null;
  const content = requestBody.content?.["application/json"];
  if (!content?.schema) return null;
  const properties = extractProperties(root, content.schema);
  if (!properties.length) return null;
  return {
    required: requestBody.required ?? false,
    properties,
  };
}

function exampleFromSchema(root: ApiDocument, schema: any): unknown {
  if (!schema) return null;
  if (schema.example !== undefined) return schema.example;

  if (schema.oneOf?.length) {
    return exampleFromSchema(root, deepResolve(root, schema.oneOf[0]));
  }
  if (schema.allOf?.length) {
    const merged: Record<string, unknown> = {};
    for (const part of schema.allOf) {
      const ex = exampleFromSchema(root, deepResolve(root, part));
      if (typeof ex === "object" && ex !== null && !Array.isArray(ex)) {
        Object.assign(merged, ex);
      }
    }
    return merged;
  }

  if (schema.type === "object" || schema.properties) {
    const result: Record<string, unknown> = {};
    if (schema.properties) {
      for (const [key, rawProp] of Object.entries<any>(schema.properties)) {
        result[key] = exampleFromSchema(root, deepResolve(root, rawProp));
      }
    }
    return result;
  }
  if (schema.type === "array") {
    const item = schema.items ? deepResolve(root, schema.items) : null;
    return item ? [exampleFromSchema(root, item)] : [];
  }
  if (schema.type === "boolean") return true;
  if (schema.type === "integer" || schema.type === "number") return 0;
  if (schema.type === "string") {
    if (schema.format === "uuid") return "550e8400-e29b-41d4-a716-446655440000";
    if (schema.format === "email") return "user@example.com";
    if (schema.format === "date-time") return "2026-01-01T00:00:00Z";
    if (schema.format === "uri" || schema.format === "url") return "https://example.com";
    if (schema.enum?.length) return schema.enum[0];
    return "string";
  }
  return null;
}

function extractResponses(root: ApiDocument, endpoint: any): ApiResponse[] {
  const responses = endpoint.responses;
  if (!responses) return [];
  return Object.entries<any>(responses).map(([status, response]) => {
    const resolved = deepResolve(root, response);
    const content = resolved?.content?.["application/json"];
    let example: string | null = null;
    if (content?.example) {
      example = JSON.stringify(content.example, null, 2);
    } else if (content?.schema) {
      const ex = exampleFromSchema(root, deepResolve(root, content.schema));
      if (ex !== null) example = JSON.stringify(ex, null, 2);
    }
    return {
      status: String(status),
      description: resolved?.description || "",
      example,
    };
  });
}

function detectSecurity(endpoint: any): "jwt" | "api_key" | "both" | "none" {
  const sec = Array.isArray(endpoint?.security) ? endpoint.security : null;
  if (sec?.length === 0) return "none";
  return "both";
}

function buildBundle(): ApiReferenceBundle {
  const doc = parse(v1SpecRaw) as ApiDocument;

  const tagMap = new Map<string, string>();
  for (const tag of doc.tags || []) {
    tagMap.set(tag.name, tag.description || "");
  }

  const endpointsByTag = new Map<string, ApiEndpoint[]>();

  for (const [path, methods] of Object.entries<any>(doc.paths || {})) {
    for (const [method, endpoint] of Object.entries<any>(methods)) {
      if (method === "parameters") continue;
      const tags: string[] = endpoint.tags || ["Other"];
      const apiEndpoint: ApiEndpoint = {
        operationId: endpoint.operationId || `${method}_${path}`,
        path,
        method: method.toUpperCase(),
        summary: endpoint.summary || "",
        description: endpoint.description || "",
        security: detectSecurity(endpoint),
        requestBody: extractRequestBody(doc, endpoint),
        responses: extractResponses(doc, endpoint),
      };
      for (const tag of tags) {
        if (!endpointsByTag.has(tag)) endpointsByTag.set(tag, []);
        endpointsByTag.get(tag)!.push(apiEndpoint);
      }
    }
  }

  const tagOrder = (doc.tags || []).map((tag: any) => tag.name as string);
  const apiTags: ApiTag[] = tagOrder
    .filter((name) => endpointsByTag.has(name))
    .map((name) => ({
      name,
      description: tagMap.get(name) || "",
      endpoints: endpointsByTag.get(name)!,
    }));

  for (const [name, endpoints] of endpointsByTag.entries()) {
    if (!tagOrder.includes(name)) {
      apiTags.push({ name, description: tagMap.get(name) || "", endpoints });
    }
  }

  const apiInfo: ApiInfo = {
    title: doc.info?.title || "Hubfy API",
    version: doc.info?.version || "1.0.0",
    description: "",
    servers: (doc.servers || []).map((s: any) => ({
      url: s.url || "",
      description: s.description || "",
    })),
  };

  const apiBaseUrl = doc.servers?.[0]?.url || "https://api.hubfy.io/functions/v1/api";

  function findEndpointById(operationId: string) {
    for (const tag of apiTags) {
      const endpoint = tag.endpoints.find((e) => e.operationId === operationId);
      if (endpoint) return { tagName: tag.name, endpoint };
    }
    return null;
  }

  return { apiTags, apiInfo, apiBaseUrl, findEndpointById };
}

export function getApiReferenceData(): ApiReferenceBundle {
  if (!cachedBundle) cachedBundle = buildBundle();
  return cachedBundle;
}
