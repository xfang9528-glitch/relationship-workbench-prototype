#!/usr/bin/env node

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStdioMcpTransport, createSuiyinMcpClient } from "./suiyin-mcp-client.mjs";

export const HOST = "127.0.0.1";
export const PORT = 8765;
export const ENTRY_URL = "http://127.0.0.1:8765/prototype/index.html#/sources";
export const ALLOWED_PATHS = Object.freeze([
  "/prototype/index.html",
  "/prototype/local-vault.js"
]);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = new Map([
  ["/prototype/index.html", Object.freeze({ file: path.join(root, "prototype", "index.html"), type: "text/html; charset=utf-8" })],
  ["/prototype/local-vault.js", Object.freeze({ file: path.join(root, "prototype", "local-vault.js"), type: "text/javascript; charset=utf-8" })]
]);
const securityHeaders = Object.freeze({
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff"
});

function respond(response, status, body, headers = {}) {
  const payload = Buffer.from(body, "utf8");
  response.writeHead(status, {
    ...securityHeaders,
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": payload.length,
    ...headers
  });
  response.end(payload);
}

function respondJson(response, status, value) {
  respond(response, status, JSON.stringify(value), { "Content-Type": "application/json; charset=utf-8" });
}

const safeNextAction = Object.freeze({
  IMPORT_IN_PROGRESS: "等待当前读取完成后再试。",
  MCP_UNAVAILABLE: "确认本机碎银 MCP 已配置并运行后重试。",
  MCP_ENVIRONMENT_MISMATCH: "确认碎银当前环境与本机显式配置一致后重试。",
  MCP_TOOL_FORBIDDEN: "当前请求不在只读授权范围内。",
  MCP_SCHEMA_INVALID: "碎银返回结构已变化，请停止导入并复核来源合同。",
  MCP_CURSOR_INVALID: "碎银分页未能完整收敛，请稍后重试。",
  MCP_UPSTREAM_FAILED: "碎银读取失败；原关系库未改变，可以重试。",
  REQUEST_FORBIDDEN: "请从本机固定页面重新发起操作。",
  REQUEST_TOO_LARGE: "请求过大；请刷新本机页面后重试。"
});

function safeFailure(code) {
  const typedCode = Object.hasOwn(safeNextAction, code) ? code : "MCP_UPSTREAM_FAILED";
  return { ok: false, error: { code: typedCode, nextAction: safeNextAction[typedCode] } };
}

function requestOriginAllowed(request) {
  const host = String(request.headers.host || "").toLowerCase();
  return (host === "127.0.0.1:8765" || host === "localhost:8765")
    && request.headers.origin === ["http:", "", host].join("/")
    && request.headers["sec-fetch-site"] === "same-origin";
}

function readJsonBody(request, limit = 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooLarge = false;
    const chunks = [];
    request.on("data", chunk => {
      size += chunk.length;
      if (size > limit) {
        tooLarge = true;
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      if (tooLarge) {
        reject(Object.assign(new Error("REQUEST_TOO_LARGE"), { code: "REQUEST_TOO_LARGE" }));
        return;
      }
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("invalid-json");
        resolve(parsed);
      } catch {
        reject(Object.assign(new Error("REQUEST_FORBIDDEN"), { code: "REQUEST_FORBIDDEN" }));
      }
    });
    request.on("error", () => reject(Object.assign(new Error("REQUEST_FORBIDDEN"), { code: "REQUEST_FORBIDDEN" })));
  });
}

function defaultMcpClientFactory() {
  const command = process.env.SUIYIN_MCP_COMMAND;
  const expectedEnvironment = process.env.SUIYIN_MCP_ENVIRONMENT;
  if (!command || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(expectedEnvironment || "")) throw Object.assign(new Error("MCP_UNAVAILABLE"), { code: "MCP_UNAVAILABLE" });
  let args = [];
  try {
    if (process.env.SUIYIN_MCP_ARGS) {
      args = JSON.parse(process.env.SUIYIN_MCP_ARGS);
      if (!Array.isArray(args) || args.some(value => typeof value !== "string")) throw new Error("invalid-args");
    }
  } catch {
    throw Object.assign(new Error("MCP_UNAVAILABLE"), { code: "MCP_UNAVAILABLE" });
  }
  return createSuiyinMcpClient({ transport: createStdioMcpTransport({ command, args }), expectedEnvironment });
}

function safePath(requestTarget) {
  if (typeof requestTarget !== "string" || requestTarget.length === 0) return null;
  const rawPath = requestTarget.split("?", 1)[0];
  if (!rawPath.startsWith("/") || rawPath.startsWith("//") || rawPath.includes("\\") || rawPath.includes("\0") || rawPath.includes(":")) return null;
  if (rawPath.includes("%")) {
    try { decodeURIComponent(rawPath); } catch { return null; }
    return null;
  }
  const segments = rawPath.split("/");
  if (segments.includes("..") || segments.includes(".")) return null;
  return rawPath;
}

export function createRequestHandler({ mcpClientFactory = defaultMcpClientFactory, bodyLimit = 1024 } = {}) {
  let staging = null;
  let importInProgress = false;
  let operationRevision = 0;
  return async (request, response) => {
    const host = String(request.headers.host || "").toLowerCase();
    if (host && host !== "127.0.0.1:8765" && host !== "localhost:8765") {
      respond(response, 421, "请使用本机固定入口打开。\n");
      return;
    }

    const pathname = safePath(request.url);
    if (!pathname) {
      respond(response, 400, "请求路径不受支持。\n");
      return;
    }

    if (request.method === "POST" && (pathname === "/api/suiyin/import/preview" || pathname === "/api/suiyin/import/cancel")) {
      if (!requestOriginAllowed(request) || !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(String(request.headers["content-type"] || ""))) {
        respondJson(response, 403, safeFailure("REQUEST_FORBIDDEN"));
        return;
      }
      try { await readJsonBody(request, bodyLimit); }
      catch (error) {
        respondJson(response, error?.code === "REQUEST_TOO_LARGE" ? 413 : 400, safeFailure(error?.code));
        return;
      }
      if (pathname === "/api/suiyin/import/cancel") {
        operationRevision += 1;
        staging = null;
        respondJson(response, 200, { ok: true, formalWriteCount: 0 });
        return;
      }
      if (importInProgress) {
        respondJson(response, 409, safeFailure("IMPORT_IN_PROGRESS"));
        return;
      }
      importInProgress = true;
      staging = null;
      const revision = ++operationRevision;
      let client = null;
      try {
        client = await mcpClientFactory();
        const candidate = await client.collectImport();
        if (revision !== operationRevision) {
          respondJson(response, 409, safeFailure("REQUEST_FORBIDDEN"));
          return;
        }
        staging = candidate;
        respondJson(response, 200, { ok: true, formalWriteCount: 0, aggregate: candidate.aggregate, unsupported: candidate.unsupported, staging });
      } catch (error) {
        staging = null;
        respondJson(response, error?.code === "MCP_ENVIRONMENT_MISMATCH" ? 409 : 502, safeFailure(error?.code));
      } finally {
        try { await client?.close?.(); } catch {}
        importInProgress = false;
      }
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      respond(response, 405, "只允许 GET、HEAD 或批准的同源 JSON POST。", { Allow: "GET, HEAD, POST" });
      return;
    }

    if (pathname === "/") {
      response.writeHead(302, { ...securityHeaders, Location: "/prototype/index.html#/sources", "Content-Length": 0 });
      response.end();
      return;
    }

    const resource = files.get(pathname);
    if (!resource) {
      respond(response, 404, "本机预览没有这个页面。\n");
      return;
    }

    fs.readFile(resource.file, (error, body) => {
      if (error) {
        respond(response, 500, "本机预览文件暂时不可用，请确认项目文件完整后重试。\n");
        return;
      }
      response.writeHead(200, {
        ...securityHeaders,
        "Content-Type": resource.type,
        "Content-Length": body.length
      });
      response.end(request.method === "HEAD" ? undefined : body);
    });
  };
}

export function startLocalPreview(options = {}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(createRequestHandler(options));
    const fail = error => {
      reject(error);
    };
    server.once("error", fail);
    server.listen(PORT, HOST, () => {
      server.removeListener("error", fail);
      resolve(server);
    });
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  startLocalPreview().then(server => {
    console.log(ENTRY_URL);
    const stop = () => server.close(() => process.exit(0));
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  }).catch(error => {
    if (error?.code === "EADDRINUSE") {
      console.error("本机端口 8765 已被占用。请先关闭占用该端口的程序，再重新运行启动命令。");
    } else {
      console.error("本机预览启动失败。请确认 Node 可用且允许监听 127.0.0.1:8765 后重试。");
    }
    process.exitCode = 1;
  });
}
