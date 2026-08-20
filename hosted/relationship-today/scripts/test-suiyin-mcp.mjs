#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const clientPath = path.resolve("scripts/suiyin-mcp-client.mjs");
const vaultPath = path.resolve("prototype/local-vault.js");
if (!fs.existsSync(clientPath)) {
  console.error("[FAIL] Suiyin MCP contract (R006/R007/R008): production client is missing");
  process.exit(1);
}

const { createSuiyinMcpClient, stableSuiyinIds, stableSuiyinAccountAlias, stableWechatExportSourceId, READ_ONLY_TOOLS } = await import(pathToFileURL(clientPath).href);
const {
  stableWechatIds,
  projectSuiyinSourceAttributionRepair,
  mergeSuiyinImport,
  queryTrustedMoments,
  generateVaultKey,
  createMemoryVaultAdapter,
  commitGraph,
  loadActiveGraph,
  createBackup,
  readBackupPreview,
  restoreBackup,
} = await import(pathToFileURL(vaultPath).href);
assert.equal(typeof createSuiyinMcpClient, "function", "R006/R007 missing injectable production MCP client");
assert.equal(typeof stableSuiyinIds, "function", "R008 missing stable ID seam");
assert.equal(typeof stableSuiyinAccountAlias, "function", "T016-O01 missing safe Suiyin account alias seam");
assert.deepEqual([...READ_ONLY_TOOLS].sort(), ["current_environment", "get_message_history", "list_allocations", "list_personas", "search_customer"].sort());

const REQUIRED_TOOLS = ["current_environment", "list_personas", "list_allocations", "search_customer", "get_message_history"];
const mcpResult = (value) => ({ content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value) }] });
const FICTIONAL_PERSONAS = [
  { id: "fictional-default-persona-1", name: "1号", nickName: "纯虚构默认一号", wcId: "fictional-default-wc-1", online_status: "offline" },
  { id: "fictional-default-persona-2", name: "2号", nickName: "纯虚构默认二号", wcId: "fictional-default-wc-2", online_status: "online" },
  { id: "fictional-default-persona-3", name: "虚构官方三号", nickName: "纯虚构默认三号", wcId: "fictional-default-wc-3", online_status: "offline" },
];
const aggregateCore = (aggregate) => Object.fromEntries(["allocationCount", "customerCount", "friendCount", "groupCount", "messageCount", "excludedCount"].map((field) => [field, aggregate[field]]));
const customers = Array.from({ length: 101 }, (_, index) => ({
  upstreamId: `fictional-customer-${String(index).padStart(3, "0")}`,
  clientId: `fictional-client-${String(index).padStart(3, "0")}`,
  name: `纯虚构碎银客户 ${index}`,
  type: index === 1 ? "group" : "friend",
}));

function historyText(customer, cursor = "", { loop = false } = {}) {
  let messages = [];
  let next = "";
  if (customer.upstreamId === customers[0].upstreamId) {
    if (!cursor) {
      messages = Array.from({ length: 100 }, (_, index) => ({ id: `fictional-message-${String(index).padStart(3, "0")}`, t: `2026-08-15T08:${String(index % 60).padStart(2, "0")}:00Z`, from: index % 2 ? "sales" : "customer", content: `纯虚构聊天 ${index}` }));
      next = "fictional-cursor-1";
    } else {
      messages = loop ? Array.from({ length: 100 }, (_, index) => ({ id: `fictional-loop-${index}`, t: "2026-08-15T09:00:00Z", from: "customer", content: "纯虚构循环页" })) : [{ id: "fictional-message-100", t: "2026-08-15T09:00:00Z", from: "customer", content: "纯虚构末页消息" }];
      next = loop ? "fictional-cursor-1" : "fictional-message-100";
    }
  } else if (customer.upstreamId === customers[1].upstreamId) {
    messages = [{ id: "fictional-group-image", t: "2026-08-15T09:01:00Z", from: "customer", sender: "纯虚构群成员", type: "image", content: "FICTIONAL_PRIVATE_MEDIA_URL_CANARY" }];
    next = "fictional-group-image";
  }
  return [JSON.stringify({ client_id: customer.clientId, participants: {}, next_last_message_id: next }), ...messages.map((item) => JSON.stringify(item))].join("\n");
}

function createFakeTransport({ environment = "fictional-sandbox", loop = false, upstreamFailure = false, allocationCap = 100 } = {}) {
  const calls = [];
  return {
    calls,
    async request(method, params = {}) {
      if (method === "initialize") return { protocolVersion: "2025-03-26", serverInfo: { name: "fictional-suiyin", version: "test" }, capabilities: { tools: {} } };
      if (method === "tools/list") return { tools: [...REQUIRED_TOOLS, "send_text"].map((name) => ({ name })) };
      if (method !== "tools/call") throw new Error("fictional-unsupported-method");
      calls.push({ name: params.name, args: structuredClone(params.arguments || {}) });
      if (upstreamFailure) throw new Error("FICTIONAL_PRIVATE_UPSTREAM_BODY_CANARY");
      if (params.name === "current_environment") return mcpResult({ name: environment });
      if (params.name === "list_personas") return mcpResult(FICTIONAL_PERSONAS);
      if (params.name === "list_allocations") {
        const page = params.arguments.page || 1;
        const pageRows = customers.slice((page - 1) * allocationCap, page * allocationCap);
        return mcpResult({ data: pageRows.map((item) => ({ id: item.upstreamId, nickname: item.name })), total: 101, serverTs: 123, latestEventId: "fictional-event" });
      }
      if (params.name === "search_customer") {
        const ids = params.arguments.ids || [];
        return mcpResult({ data: ids.map((id) => {
          const item = customers.find((candidate) => candidate.upstreamId === id);
          return { id, nickName: item.name, type: item.type, clientId: item.clientId, phone: "FICTIONAL_PRIVATE_PHONE_CANARY", avatar: "FICTIONAL_PRIVATE_URL_CANARY", account: { balance: 999 } };
        }), total: ids.length, page: 1, limit: ids.length });
      }
      if (params.name === "get_message_history") {
        const item = customers.find((candidate) => candidate.upstreamId === params.arguments.customer_id);
        return mcpResult(historyText(item, params.arguments.last_message_id || "", { loop }));
      }
      throw new Error("FICTIONAL_FORBIDDEN_TOOL_REACHED");
    },
    async notify() {},
    async close() {},
  };
}

function createMultiClientTransport({ emptyOnly = false, nameConflict = false, kindConflict = false } = {}) {
  const calls = [];
  const customerId = "fictional-shared-customer";
  const primaryClientId = "fictional-shared-client-a";
  const secondaryClientId = "fictional-shared-client-b";
  const autoClientId = "fictional-auto-client";
  const rows = emptyOnly
    ? [
        { id: customerId, nickName: "纯虚构共享客户", type: "friend", clientId: "" },
        { id: customerId, nickName: "纯虚构共享客户", type: "friend", clientId: "" },
      ]
    : [
        { id: customerId, nickName: "纯虚构共享客户", type: "friend", clientId: primaryClientId },
        { id: customerId, nickName: "纯虚构共享客户", type: "friend", clientId: primaryClientId },
        { id: customerId, nickName: "纯虚构共享客户", type: "friend", clientId: "" },
        { id: customerId, nickName: nameConflict ? "纯虚构冲突客户" : "纯虚构共享客户", type: kindConflict ? "group" : "friend", clientId: secondaryClientId },
      ];
  return {
    calls,
    customerId,
    primaryClientId,
    secondaryClientId,
    async request(method, params = {}) {
      if (method === "initialize") return { protocolVersion: "2025-03-26", serverInfo: { name: "fictional-suiyin", version: "test" }, capabilities: { tools: {} } };
      if (method === "tools/list") return { tools: REQUIRED_TOOLS.map((name) => ({ name })) };
      if (method !== "tools/call") throw new Error("fictional-unsupported-method");
      calls.push({ name: params.name, args: structuredClone(params.arguments || {}) });
      if (params.name === "current_environment") return mcpResult({ name: "fictional-sandbox" });
      if (params.name === "list_personas") return mcpResult(FICTIONAL_PERSONAS);
      if (params.name === "list_allocations") return mcpResult({ data: [{ id: customerId, nickname: "纯虚构共享客户" }], total: 1 });
      if (params.name === "search_customer") return mcpResult({ data: rows, total: rows.length, page: 1, limit: rows.length });
      if (params.name === "get_message_history") {
        const cursor = params.arguments.last_message_id || "";
        const clientId = emptyOnly ? autoClientId : params.arguments.client_id;
        const messages = cursor
          ? [{ id: "fictional-shared-message-100", t: "2026-08-15T10:00:00Z", from: "customer", content: "纯虚构末页" }]
          : Array.from({ length: 100 }, (_, index) => ({ id: `fictional-shared-message-${String(index).padStart(3, "0")}`, t: "2026-08-15T09:00:00Z", from: "customer", content: `纯虚构共享聊天 ${index}` }));
        const next = cursor ? "fictional-shared-message-100" : `fictional-cursor-${clientId}`;
        return mcpResult([JSON.stringify({ client_id: clientId, next_last_message_id: next }), ...messages.map((item) => JSON.stringify(item))].join("\n"));
      }
      throw new Error("FICTIONAL_FORBIDDEN_TOOL_REACHED");
    },
    async notify() {},
    async close() {},
  };
}

function createDisplayNameTransport({ allocations, rows, historyText = "" }) {
  const calls = [];
  return {
    calls,
    async request(method, params = {}) {
      if (method === "initialize") return { protocolVersion: "2025-03-26", serverInfo: { name: "fictional-suiyin", version: "test" }, capabilities: { tools: {} } };
      if (method === "tools/list") return { tools: REQUIRED_TOOLS.map((name) => ({ name })) };
      if (method !== "tools/call") throw new Error("fictional-unsupported-method");
      calls.push({ name: params.name, args: structuredClone(params.arguments || {}) });
      if (params.name === "current_environment") return mcpResult({ name: "fictional-sandbox" });
      if (params.name === "list_personas") return mcpResult(FICTIONAL_PERSONAS);
      if (params.name === "list_allocations") return mcpResult({ data: allocations, total: allocations.length });
      if (params.name === "search_customer") return mcpResult({ data: rows, total: rows.length, page: 1, limit: rows.length });
      if (params.name === "get_message_history") {
        const clientId = params.arguments.client_id || `fictional-display-auto-${params.arguments.customer_id}`;
        return mcpResult([JSON.stringify({ client_id: clientId, next_last_message_id: "" }), ...(historyText ? [JSON.stringify({ id: `fictional-display-message-${params.arguments.customer_id}`, t: "2026-08-16T17:05:00Z", from: "customer", content: historyText })] : [])].join("\n"));
      }
      throw new Error("FICTIONAL_FORBIDDEN_TOOL_REACHED");
    },
    async notify() {},
    async close() {},
  };
}

function createPagedSearchTransport({ mode = "complete" } = {}) {
  const calls = [];
  const fictionalCustomers = Array.from({ length: 51 }, (_, index) => ({
    id: `fictional-paged-customer-${String(index).padStart(2, "0")}`,
    name: `纯虚构分页客户 ${index}`,
  }));
  const rows = fictionalCustomers.flatMap((customer) => ["a", "b"].map((suffix) => ({
    id: customer.id,
    nickName: customer.name,
    type: "friend",
    clientId: `${customer.id}-client-${suffix}`,
  })));
  return {
    calls,
    async request(method, params = {}) {
      if (method === "initialize") return { protocolVersion: "2025-03-26", serverInfo: { name: "fictional-suiyin", version: "test" }, capabilities: { tools: {} } };
      if (method === "tools/list") return { tools: REQUIRED_TOOLS.map((name) => ({ name })) };
      if (method !== "tools/call") throw new Error("fictional-unsupported-method");
      calls.push({ name: params.name, args: structuredClone(params.arguments || {}) });
      if (params.name === "current_environment") return mcpResult({ name: "fictional-sandbox" });
      if (params.name === "list_personas") return mcpResult(FICTIONAL_PERSONAS);
      if (params.name === "list_allocations") return mcpResult({ data: fictionalCustomers.map((item) => ({ id: item.id, nickname: item.name })), total: fictionalCustomers.length });
      if (params.name === "search_customer") {
        const page = params.arguments.page || 1;
        const limit = 100;
        const pageRows = page === 1 ? rows.slice(0, limit) : rows.slice(limit);
        if (mode === "empty" && page === 2) return mcpResult({ data: [], total: rows.length, page, limit });
        if (mode === "zero-progress" && page === 2) return mcpResult({ data: pageRows, total: rows.length, page: 1, limit });
        return mcpResult({ data: pageRows, total: mode === "unstable-total" && page === 2 ? rows.length + 1 : rows.length, page, limit });
      }
      if (params.name === "get_message_history") {
        const clientId = params.arguments.client_id;
        return mcpResult([JSON.stringify({ client_id: clientId, next_last_message_id: "" }), JSON.stringify({ id: "fictional-paged-message", t: "2026-08-15T11:00:00Z", from: "customer", content: "纯虚构分页聊天" })].join("\n"));
      }
      throw new Error("FICTIONAL_FORBIDDEN_TOOL_REACHED");
    },
    async notify() {},
    async close() {},
  };
}

function createAllocationRetryTransport({ alwaysFail = false } = {}) {
  const calls = [];
  const successfulRows = Array.from({ length: 4 }, (_, index) => ({ id: `fictional-retry-final-${index}`, nickname: `纯虚构重试客户 ${index}` }));
  let attempt = 0;
  return {
    calls,
    successfulRows,
    async request(method, params = {}) {
      if (method === "initialize") return { protocolVersion: "2025-03-26", serverInfo: { name: "fictional-suiyin", version: "test" }, capabilities: { tools: {} } };
      if (method === "tools/list") return { tools: REQUIRED_TOOLS.map((name) => ({ name })) };
      if (method !== "tools/call") throw new Error("fictional-unsupported-method");
      calls.push({ name: params.name, args: structuredClone(params.arguments || {}) });
      if (params.name === "current_environment") return mcpResult({ name: "fictional-sandbox" });
      if (params.name === "list_personas") return mcpResult(FICTIONAL_PERSONAS);
      if (params.name === "list_allocations") {
        const page = params.arguments.page || 1;
        if (page === 1) attempt += 1;
        if (alwaysFail) {
          const data = [];
          return mcpResult({ data, total: 2 });
        }
        if (attempt === 1) {
          const data = page === 1 ? Array.from({ length: 25 }, (_, index) => ({ id: `fictional-discarded-${index}`, nickname: `纯虚构废弃客户 ${index}` })) : [];
          return mcpResult({ data, total: 28 });
        }
        return mcpResult({ data: page === 1 ? successfulRows : [], total: successfulRows.length });
      }
      if (params.name === "search_customer") {
        const ids = params.arguments.ids || [];
        return mcpResult({ data: ids.map((id) => ({ id, nickName: successfulRows.find((item) => item.id === id)?.nickname || "纯虚构未知客户", type: "friend", clientId: `${id}-client` })), total: ids.length, page: 1, limit: ids.length });
      }
      if (params.name === "get_message_history") {
        const clientId = params.arguments.client_id;
        return mcpResult([JSON.stringify({ client_id: clientId, next_last_message_id: "" }), JSON.stringify({ id: "fictional-retry-message", t: "2026-08-15T11:10:00Z", from: "customer", content: "纯虚构重试聊天" })].join("\n"));
      }
      throw new Error("FICTIONAL_FORBIDDEN_TOOL_REACHED");
    },
    async notify() {},
    async close() {},
  };
}

function createPartialAllocationTransport({ totalDrift = false, invalidRow = false, stable = false, nicknameDrift = false } = {}) {
  const calls = [];
  let attempt = 0;
  return {
    calls,
    async request(method, params = {}) {
      if (method === "initialize") return { protocolVersion: "2025-03-26", serverInfo: { name: "fictional-suiyin", version: "test" }, capabilities: { tools: {} } };
      if (method === "tools/list") return { tools: REQUIRED_TOOLS.map((name) => ({ name })) };
      if (method !== "tools/call") throw new Error("fictional-unsupported-method");
      calls.push({ name: params.name, args: structuredClone(params.arguments || {}) });
      if (params.name === "current_environment") return mcpResult({ name: "fictional-sandbox" });
      if (params.name === "list_personas") return mcpResult(FICTIONAL_PERSONAS);
      if (params.name === "list_allocations") {
        const page = params.arguments.page || 1;
        if (page === 1) attempt += 1;
        if (invalidRow) return mcpResult({ data: page === 1 ? [{ nickname: "纯虚构无效行" }] : [], total: 28 });
        if (totalDrift) return mcpResult({ data: page === 1 ? [{ id: `fictional-drift-${attempt}`, nickname: "纯虚构漂移客户" }] : [], total: page === 1 ? 2 : 3 });
        const identityAttempt = stable || nicknameDrift ? 1 : attempt;
        const nicknameAttempt = stable ? 1 : attempt;
        const data = page === 1 ? Array.from({ length: 25 }, (_, index) => ({ id: `fictional-partial-attempt-${identityAttempt}-${index}`, nickname: `纯虚构部分客户 ${nicknameAttempt}-${index}` })) : [];
        return mcpResult({ data, total: 28 });
      }
      if (params.name === "search_customer") {
        const ids = params.arguments.ids || [];
        return mcpResult({ data: ids.map((id, index) => ({ id, nickName: `纯虚构已选客户 ${index}`, type: "friend", clientId: `${id}-client` })), total: ids.length, page: 1, limit: ids.length });
      }
      if (params.name === "get_message_history") {
        const clientId = params.arguments.client_id;
        return mcpResult([JSON.stringify({ client_id: clientId, next_last_message_id: "" }), JSON.stringify({ id: "fictional-partial-message", t: "2026-08-15T11:30:00Z", from: "customer", content: "纯虚构部分聊天" })].join("\n"));
      }
      throw new Error("FICTIONAL_FORBIDDEN_TOOL_REACHED");
    },
    async notify() {},
    async close() {},
  };
}

function createOverlappingSearchTransport({ stableLimit = false } = {}) {
  const calls = [];
  const fictionalRows = ["a", "b", "c"].map((suffix) => ({
    id: `fictional-r5-customer-${suffix}`,
    nickname: `纯虚构 R5 客户 ${suffix}`,
    clientId: `fictional-r5-client-${suffix}`,
  }));
  return {
    calls,
    async request(method, params = {}) {
      if (method === "initialize") return { protocolVersion: "2025-03-26", serverInfo: { name: "fictional-suiyin", version: "test" }, capabilities: { tools: {} } };
      if (method === "tools/list") return { tools: REQUIRED_TOOLS.map((name) => ({ name })) };
      if (method !== "tools/call") throw new Error("fictional-unsupported-method");
      calls.push({ name: params.name, args: structuredClone(params.arguments || {}) });
      if (params.name === "current_environment") return mcpResult({ name: "fictional-sandbox" });
      if (params.name === "list_personas") return mcpResult(FICTIONAL_PERSONAS);
      if (params.name === "list_allocations") return mcpResult({ data: fictionalRows.map((row) => ({ id: row.id, nickname: row.nickname })), total: fictionalRows.length });
      if (params.name === "search_customer") {
        const page = params.arguments.page || 1;
        const selected = page === 1 ? fictionalRows.slice(0, 2) : [fictionalRows[1]];
        return mcpResult({
          data: selected.map((row) => ({ id: row.id, nickName: row.nickname, type: "friend", clientId: row.clientId })),
          total: 3,
          page,
          limit: page === 1 || stableLimit ? 2 : 1,
        });
      }
      if (params.name === "get_message_history") {
        const clientId = params.arguments.client_id;
        return mcpResult([JSON.stringify({ client_id: clientId, next_last_message_id: "" }), JSON.stringify({ id: "fictional-r5-message", t: "2026-08-15T11:20:00Z", from: "customer", content: "纯虚构 R5 聊天" })].join("\n"));
      }
      throw new Error("FICTIONAL_FORBIDDEN_TOOL_REACHED");
    },
    async notify() {},
    async close() {},
  };
}

function createZeroPageSearchTransport({ mode = "complete" } = {}) {
  const calls = [];
  const fictionalCustomers = Array.from({ length: 11 }, (_, index) => ({ id: `fictional-zero-page-customer-${index}`, nickname: `纯虚构零页客户 ${index}` }));
  const rows = fictionalCustomers.flatMap((customer, index) => (index < 4 ? ["a", "b"] : ["a"]).map((suffix) => ({ id: customer.id, nickName: customer.nickname, type: "friend", clientId: `${customer.id}-client-${suffix}` })));
  return {
    calls,
    async request(method, params = {}) {
      if (method === "initialize") return { protocolVersion: "2025-03-26", serverInfo: { name: "fictional-suiyin", version: "test" }, capabilities: { tools: {} } };
      if (method === "tools/list") return { tools: REQUIRED_TOOLS.map((name) => ({ name })) };
      if (method !== "tools/call") throw new Error("fictional-unsupported-method");
      calls.push({ name: params.name, args: structuredClone(params.arguments || {}) });
      if (params.name === "current_environment") return mcpResult({ name: "fictional-sandbox" });
      if (params.name === "list_personas") return mcpResult(FICTIONAL_PERSONAS);
      if (params.name === "list_allocations") return mcpResult({ data: fictionalCustomers, total: fictionalCustomers.length });
      if (params.name === "search_customer") {
        const data = mode === "incomplete" ? rows.slice(0, -1) : rows;
        return mcpResult({ data, total: rows.length, page: mode === "limit-only-zero" ? 1 : 0, limit: mode === "page-only-zero" ? rows.length : 0 });
      }
      if (params.name === "get_message_history") {
        const clientId = params.arguments.client_id;
        return mcpResult([JSON.stringify({ client_id: clientId, next_last_message_id: "" }), JSON.stringify({ id: "fictional-zero-page-message", t: "2026-08-15T11:40:00Z", from: "customer", content: "纯虚构零页聊天" })].join("\n"));
      }
      throw new Error("FICTIONAL_FORBIDDEN_TOOL_REACHED");
    },
    async notify() {},
    async close() {},
  };
}

const transport = createFakeTransport();
const client = createSuiyinMcpClient({ transport, now: () => "2026-08-15T10:00:00.000Z" });
await assert.rejects(() => client.callTool("send_text", {}), (error) => error?.code === "MCP_TOOL_FORBIDDEN" && error.message === "MCP_TOOL_FORBIDDEN");
assert.equal(transport.calls.length, 0, "R007 forbidden tool must be rejected before transport");
const staging = await client.collectImport();
assert.equal(staging.ok, true);
assert.equal(staging.formalWriteCount, 0);
assert.deepEqual(aggregateCore(staging.aggregate), { allocationCount: 101, customerCount: 101, friendCount: 100, groupCount: 1, messageCount: 102, excludedCount: 0 });
assert.equal(staging.people.length, 100);
assert.equal(staging.people.every((item) => item.state === "pending" && item.sourceScoped === true), true);
assert.equal(staging.signals.length, 1);
assert.equal(staging.signals[0].kind, "group_context");
assert.equal("personId" in staging.signals[0], false);
assert.equal(staging.signals[0].text, "图片（未下载）");
assert.equal(JSON.stringify(staging).includes("FICTIONAL_PRIVATE"), false, "R008 minimized staging leaked forbidden fields or media body");
assert.equal(transport.calls.every((call) => READ_ONLY_TOOLS.has(call.name)), true, "R007 dynamic call sequence escaped the hard allowlist");
assert.equal(transport.calls.filter((call) => call.name === "list_allocations").length, 2, "R006 allocation snapshot did not reach the final page");
assert.equal(transport.calls.filter((call) => call.name === "search_customer").every((call) => call.args.ids.length <= 100 && call.args.verbose === false), true);
assert.equal(transport.calls.filter((call) => call.name === "get_message_history").every((call) => call.args.size === 100), true);
assert.equal(transport.calls.filter((call) => call.name === "current_environment").length, 2, "R007 environment must be checked before and after the batch");

const cappedAllocationTransport = createFakeTransport({ allocationCap: 20 });
const cappedAllocationStaging = await createSuiyinMcpClient({ transport: cappedAllocationTransport, now: () => "2026-08-15T10:00:00.000Z" }).collectImport();
assert.equal(cappedAllocationStaging.aggregate.allocationCount, 101, "live-compat capped allocation pages must still reach the frozen total");
assert.equal(cappedAllocationTransport.calls.filter((call) => call.name === "list_allocations").length, 6, "live-compat must follow short upstream pages until the true final page");
assert.equal(cappedAllocationTransport.calls.filter((call) => call.name === "list_allocations").every((call) => call.args.page_size === 100), true, "live-compat must keep the approved requested page size");

const focusedFailures = [];
try {
  const pagedSearchTransport = createPagedSearchTransport();
  const pagedSearchStaging = await createSuiyinMcpClient({ transport: pagedSearchTransport, now: () => "2026-08-15T11:00:00.000Z" }).collectImport();
  assert.deepEqual(aggregateCore(pagedSearchStaging.aggregate), { allocationCount: 51, customerCount: 51, friendCount: 51, groupCount: 0, messageCount: 102, excludedCount: 0 });
  assert.equal(pagedSearchTransport.calls.filter((call) => call.name === "search_customer").length, 2, "search_customer must read all 102 rows for one <=100-ID batch");
  assert.equal(pagedSearchTransport.calls.filter((call) => call.name === "get_message_history").length, 102, "all 51x2 fictional client histories must be imported");
} catch (error) { focusedFailures.push(`paged search: ${error?.code || error?.message || error}`); }
try {
  const retryTransport = createAllocationRetryTransport();
  const retryStaging = await createSuiyinMcpClient({ transport: retryTransport, now: () => "2026-08-15T11:10:00.000Z" }).collectImport();
  assert.deepEqual(aggregateCore(retryStaging.aggregate), { allocationCount: 4, customerCount: 4, friendCount: 4, groupCount: 0, messageCount: 4, excludedCount: 0 });
  assert.deepEqual(retryTransport.calls.filter((call) => call.name === "list_allocations").map((call) => call.args.page), [1, 2, 1], "a stalled snapshot must restart from page 1 with an independent Map");
  assert.equal(retryStaging.people.every((person) => retryTransport.successfulRows.some((row) => row.nickname === person.name)), true, "rows from the stalled attempt must not leak into the accepted snapshot");
} catch (error) { focusedFailures.push(`allocation retry: ${error?.code || error?.message || error}`); }
try {
  const alwaysStalledTransport = createAllocationRetryTransport({ alwaysFail: true });
  await assert.rejects(() => createSuiyinMcpClient({ transport: alwaysStalledTransport }).collectImport(), (error) => error?.code === "MCP_CURSOR_INVALID");
  assert.deepEqual(alwaysStalledTransport.calls.filter((call) => call.name === "list_allocations").map((call) => call.args.page), [1, 1, 1], "three empty independent snapshots must be attempted before fail closed");
} catch (error) { focusedFailures.push(`allocation retry limit: ${error?.code || error?.message || error}`); }
assert.deepEqual(focusedFailures, [], `live pagination focused failures:\n${focusedFailures.join("\n")}`);

await assert.rejects(() => createSuiyinMcpClient({ transport: createPagedSearchTransport({ mode: "empty" }) }).collectImport(), (error) => error?.code === "MCP_CURSOR_INVALID", "search_customer empty page before total must fail closed");
await assert.rejects(() => createSuiyinMcpClient({ transport: createPagedSearchTransport({ mode: "zero-progress" }) }).collectImport(), (error) => error?.code === "MCP_CURSOR_INVALID", "search_customer non-advancing page metadata must fail closed");
await assert.rejects(() => createSuiyinMcpClient({ transport: createPagedSearchTransport({ mode: "unstable-total" }) }).collectImport(), (error) => error?.code === "MCP_CURSOR_INVALID", "search_customer total changes must fail closed");
await assert.rejects(() => createSuiyinMcpClient({ transport: createPagedSearchTransport(), maxPages: 1 }).collectImport(), (error) => error?.code === "MCP_CURSOR_INVALID", "search_customer maxPages exhaustion must fail closed");

const r5FocusedFailures = [];
for (const [label, stableLimit] of [["limit drift plus overlap", false], ["zero unique row with stable limit", true]]) {
  const overlapTransport = createOverlappingSearchTransport({ stableLimit });
  try {
    await assert.rejects(() => createSuiyinMcpClient({ transport: overlapTransport }).collectImport(), (error) => error?.code === "MCP_SCHEMA_INVALID" || error?.code === "MCP_CURSOR_INVALID");
    assert.equal(overlapTransport.calls.some((call) => call.name === "get_message_history"), false, "invalid search pagination must fail before history collection or staging");
  } catch (error) { r5FocusedFailures.push(`${label}: ${error?.code || error?.message || error}`); }
}
assert.deepEqual(r5FocusedFailures, [], `R5 focused pagination failures:\n${r5FocusedFailures.join("\n")}`);

const zeroPageFocusedFailures = [];
try {
  const zeroPageTransport = createZeroPageSearchTransport();
  const zeroPageStaging = await createSuiyinMcpClient({ transport: zeroPageTransport, now: () => "2026-08-15T11:40:00.000Z" }).collectImport();
  assert.deepEqual(aggregateCore(zeroPageStaging.aggregate), { allocationCount: 11, customerCount: 11, friendCount: 11, groupCount: 0, messageCount: 15, excludedCount: 0 });
  assert.equal(zeroPageTransport.calls.filter((call) => call.name === "search_customer").length, 1, "complete page=0/limit=0 response must not request page 2");
  assert.equal(zeroPageTransport.calls.filter((call) => call.name === "get_message_history").length, 15, "every multi-client row from the complete zero-page response must be imported");
} catch (error) { zeroPageFocusedFailures.push(`complete zero-page search: ${error?.code || error?.message || error}`); }
for (const mode of ["incomplete", "page-only-zero", "limit-only-zero"]) {
  const invalidZeroTransport = createZeroPageSearchTransport({ mode });
  await assert.rejects(() => createSuiyinMcpClient({ transport: invalidZeroTransport }).collectImport(), (error) => error?.code === "MCP_SCHEMA_INVALID" || error?.code === "MCP_CURSOR_INVALID", `${mode} zero-page metadata must fail closed`);
  assert.equal(invalidZeroTransport.calls.filter((call) => call.name === "search_customer").length, 1, `${mode} must fail without requesting page 2`);
}
assert.deepEqual(zeroPageFocusedFailures, [], `zero-page search compatibility failures:\n${zeroPageFocusedFailures.join("\n")}`);

const partialAllocationFailures = [];
const driftingPartialTransport = createPartialAllocationTransport();
await assert.rejects(() => createSuiyinMcpClient({ transport: driftingPartialTransport }).collectImport(), (error) => error?.code === "MCP_CURSOR_INVALID" && !error.message.includes("fictional-partial"), "T028-O03 equal-size partial retries with different IDs must fail closed");
assert.equal(driftingPartialTransport.calls.some((call) => call.name === "search_customer" || call.name === "get_message_history"), false, "T028-O03 drifting allocation retries must produce zero downstream staging reads");
const nicknameDriftPartialTransport = createPartialAllocationTransport({ nicknameDrift: true });
await assert.rejects(() => createSuiyinMcpClient({ transport: nicknameDriftPartialTransport }).collectImport(), (error) => error?.code === "MCP_CURSOR_INVALID" && !error.message.includes("fictional-partial"), "T028-O03 partial retries with stable IDs but different allocation nicknames must fail closed");
assert.equal(nicknameDriftPartialTransport.calls.some((call) => call.name === "search_customer" || call.name === "get_message_history"), false, "T028-O03 nickname-drifting retries must produce zero downstream staging reads");
try {
  const partialTransport = createPartialAllocationTransport({ stable: true });
  const partialStaging = await createSuiyinMcpClient({ transport: partialTransport, now: () => "2026-08-15T11:30:00.000Z" }).collectImport();
  assert.deepEqual(aggregateCore(partialStaging.aggregate), { allocationCount: 25, customerCount: 25, friendCount: 25, groupCount: 0, messageCount: 25, excludedCount: 3 });
  assert.equal(partialStaging.aggregate.allocationDeclaredCount, 28);
  assert.equal(partialStaging.aggregate.allocationMissingCount, 3);
  assert.equal(partialStaging.aggregate.unavailableReason, "allocation-snapshot-incomplete");
  assert.equal(partialStaging.source.allocationDeclaredCount, 28);
  assert.equal(partialStaging.source.allocationMissingCount, 3);
  assert.equal(partialStaging.source.unavailableReason, "allocation-snapshot-incomplete");
  assert.deepEqual(partialTransport.calls.filter((call) => call.name === "list_allocations").map((call) => call.args.page), [1, 2, 1, 2, 1, 2]);
  const searchedIds = partialTransport.calls.find((call) => call.name === "search_customer")?.args.ids || [];
  assert.equal(searchedIds.length, 25, "partial recovery must never union attempts");
  assert.equal(searchedIds.every((id) => id.startsWith("fictional-partial-attempt-1-")), true, "stable partial retries must preserve the exact canonical candidate instead of substituting an attempt");
} catch (error) { partialAllocationFailures.push(`stable partial recovery: ${error?.code || error?.message || error}`); }
assert.deepEqual(partialAllocationFailures, [], `partial allocation recovery failures:\n${partialAllocationFailures.join("\n")}`);
await assert.rejects(() => createSuiyinMcpClient({ transport: createPartialAllocationTransport({ totalDrift: true }) }).collectImport(), (error) => error?.code === "MCP_CURSOR_INVALID", "total-drift attempts must never become partial staging");
await assert.rejects(() => createSuiyinMcpClient({ transport: createPartialAllocationTransport({ invalidRow: true }) }).collectImport(), (error) => error?.code === "MCP_SCHEMA_INVALID", "invalid allocation rows must never become partial staging");

const multiClientTransport = createMultiClientTransport();
const multiClientStaging = await createSuiyinMcpClient({ transport: multiClientTransport, now: () => "2026-08-15T10:00:00.000Z" }).collectImport();
assert.deepEqual(aggregateCore(multiClientStaging.aggregate), { allocationCount: 1, customerCount: 1, friendCount: 1, groupCount: 0, messageCount: 202, excludedCount: 0 }, "one frozen customer must count once while all unique client histories are imported");
assert.equal(multiClientStaging.people.length, 1, "multiple client rows must create one person");
assert.equal(multiClientStaging.mappings.length, 1, "multiple client rows must create one mapping");
assert.deepEqual(multiClientStaging.mappings[0].sourceAccountAliases, ["SY-37909152", "SY-F2ED5A5F"], "T016-O01 multiple client aliases must use the frozen hash and code-point order");
assert.equal(JSON.stringify(multiClientStaging).includes(multiClientTransport.primaryClientId), false, "T016-O01 raw clientId must not enter staging");
assert.equal(JSON.stringify(multiClientStaging).includes(multiClientTransport.secondaryClientId), false, "T016-O01 secondary raw clientId must not enter staging");
assert.equal(new Set(multiClientStaging.excerpts.map((item) => item.id)).size, 202, "stable message IDs must retain the clientId namespace");
const multiHistoryCalls = multiClientTransport.calls.filter((call) => call.name === "get_message_history");
assert.equal(multiHistoryCalls.length, 4, "each unique non-empty clientId must be fully paginated exactly once");
assert.deepEqual([...new Set(multiHistoryCalls.map((call) => call.args.client_id))].sort(), [multiClientTransport.primaryClientId, multiClientTransport.secondaryClientId].sort());
assert.equal(multiHistoryCalls.every((call) => typeof call.args.client_id === "string" && call.args.client_id), true, "an empty auto-resolution path must not run when non-empty clientIds exist");

const emptyOnlyTransport = createMultiClientTransport({ emptyOnly: true });
const emptyOnlyStaging = await createSuiyinMcpClient({ transport: emptyOnlyTransport, now: () => "2026-08-15T10:00:00.000Z" }).collectImport();
assert.equal(emptyOnlyStaging.aggregate.messageCount, 101, "an empty-only client row must retain one auto-resolution history path");
assert.deepEqual(emptyOnlyStaging.mappings[0].sourceAccountAliases, ["SY-762127C0"], "T016-O01 header-resolved clientId must produce the account alias without another MCP call");
assert.equal(emptyOnlyTransport.calls.filter((call) => call.name === "get_message_history").every((call) => !("client_id" in call.args)), true, "the empty-only path must let MCP resolve the client once");

await assert.rejects(() => createSuiyinMcpClient({ transport: createMultiClientTransport({ nameConflict: true }) }).collectImport(), (error) => error?.code === "MCP_SCHEMA_INVALID", "conflicting display names for one customer must fail closed");
await assert.rejects(() => createSuiyinMcpClient({ transport: createMultiClientTransport({ kindConflict: true }) }).collectImport(), (error) => error?.code === "MCP_SCHEMA_INVALID", "conflicting customer kinds must fail closed");

const displayAllocations = [
  { id: "fictional-display-aggregate", nickname: "纯虚构分配兜底一" },
  { id: "fictional-display-nickname", nickname: "纯虚构分配兜底二" },
  { id: "fictional-display-lowercase", nickname: "纯虚构分配兜底三" },
  { id: "fictional-display-remark", nickname: "纯虚构分配兜底四" },
  { id: "fictional-display-allocation", nickname: "  分配　昵称  " },
  { id: "fictional-display-missing", nickname: "＊＊＊" },
];
const displayRows = [
  { id: "fictional-display-aggregate", customerNames: ["＊＊＊", "  聚合　昵称  "], nickName: "纯虚构昵称降级", remark: "纯虚构备注降级", aliasName: "li******gg", userName: "wxid_display_aggregate", type: "friend", clientId: "fictional-display-client-a" },
  { id: "fictional-display-nickname", nickName: "  昵称　优先  ", remark: "纯虚构备注降级", aliasName: "lz********75", userName: "wxid_display_nickname", type: "friend", clientId: "fictional-display-client-b" },
  { id: "fictional-display-lowercase", nickname: "  小写　昵称  ", remark: "纯虚构备注降级", aliasName: "me********12", userName: "gh_display_lowercase", type: "friend", clientId: "fictional-display-client-c" },
  { id: "fictional-display-remark", remark: "  备注　名字  ", aliasName: "Mi********SS", userName: "wxid_display_remark", type: "friend", clientId: "fictional-display-client-d" },
  { id: "fictional-display-allocation", aliasName: "sa****************12", userName: "wxid_display_allocation", type: "friend", clientId: "fictional-display-client-e" },
  { id: "fictional-display-missing", customerNames: "待补", nickName: "SY-DEADBEEF", nickname: "gh_display_missing", remark: "TBD", aliasName: "sa****************22", userName: "wxid_display_missing", type: "friend", clientId: "fictional-display-client-f" },
];
const displayStaging = await createSuiyinMcpClient({ transport: createDisplayNameTransport({ allocations: displayAllocations, rows: displayRows }), now: () => "2026-08-16T12:00:00.000Z" }).collectImport();
const expectedDisplayNames = ["聚合 昵称", "昵称 优先", "小写 昵称", "备注 名字", "分配 昵称"];
assert.deepEqual(displayStaging.people.map((person) => person.name), expectedDisplayNames, "T018 nickname-first precedence must reject masked account identifiers and normalize display names");
assert.deepEqual(displayStaging.mappings.map((mapping) => mapping.sourceDisplayName), expectedDisplayNames, "T018 mappings must persist the same safe nickname projection");
assert.equal(displayStaging.aggregate.missingDisplayNameCount, 1, "T028-O04 an unnamed friend must be excluded and counted instead of creating a placeholder person");
assert.equal(JSON.stringify(displayStaging).includes("昵称待补") || JSON.stringify(displayStaging).includes("待确认身份"), false, "T028-O04 placeholder people must never leave staging");
for (const forbiddenName of ["li******gg", "lz********75", "me********12", "Mi********SS", "sa****************12", "sa****************22", "wxid_display_missing", "gh_display_missing", "SY-DEADBEEF"]) {
  assert.equal(JSON.stringify(displayStaging).includes(forbiddenName), false, `T018 forbidden account-like name leaked into staging: ${forbiddenName}`);
}

for (const rows of [
  [
    { id: "fictional-display-merge", aliasName: "ma******ed", userName: "wxid_display_merge_a", type: "friend", clientId: "fictional-display-merge-client-a" },
    { id: "fictional-display-merge", nickName: "  真实　昵称  ", type: "friend", clientId: "fictional-display-merge-client-b" },
  ],
  [
    { id: "fictional-display-merge", nickName: "真实 昵称", type: "friend", clientId: "fictional-display-merge-client-a" },
    { id: "fictional-display-merge", aliasName: "ma******ed", userName: "wxid_display_merge_b", type: "friend", clientId: "fictional-display-merge-client-b" },
  ],
]) {
  const mergeStaging = await createSuiyinMcpClient({ transport: createDisplayNameTransport({ allocations: [{ id: "fictional-display-merge", nickname: "＊＊＊" }], rows }), now: () => "2026-08-16T12:00:00.000Z" }).collectImport();
  assert.equal(mergeStaging.people[0].name, "真实 昵称", "T018 a missing-name client row must never override or conflict with a real nickname for the same customer");
  assert.equal(mergeStaging.mappings[0].sourceAccountAliases.length, 2, "T018 all safe client history aliases must remain attached after nickname reconciliation");
}

const stable = await stableSuiyinIds({ environment: "fictional-sandbox", customerId: "fictional-customer", clientId: "fictional-client", messageId: "fictional-message" });
for (const value of Object.values(stable)) assert.match(value, /^[0-9A-F]{64}$/);
assert.deepEqual(stable, await stableSuiyinIds({ environment: "fictional-sandbox", customerId: "fictional-customer", clientId: "fictional-client", messageId: "fictional-message" }));
assert.equal(stableSuiyinAccountAlias({ environment: "fictional-sandbox", clientId: "fictional-shared-client-a" }), "SY-F2ED5A5F", "T016-O01 alias preimage must remain domain-separated and deterministic");
assert.throws(() => stableSuiyinAccountAlias({ environment: "fictional-sandbox", clientId: "" }), (error) => error?.code === "SOURCE_ACCOUNT_ALIAS_INVALID");

// T021 RED: the official SystemName from the same frozen search snapshot must
// leave the importer only as an encrypted-graph-safe alias -> label registry.
const t021ClientId = "fictional-t021-client";
const t021Alias = stableSuiyinAccountAlias({ environment: "fictional-sandbox", clientId: t021ClientId });
const t021Staging = await createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: "fictional-t021-customer", nickname: "纯虚构 T021 人物" }],
    rows: [{ id: "fictional-t021-customer", nickName: "纯虚构 T021 人物", type: "friend", clientId: t021ClientId, clientName: "  ２号  " }],
  }),
  now: () => "2026-08-16T17:00:00.000Z",
}).collectImport();
assert.equal(t021Staging.source.sourceAccountLabels[t021Alias], "2号", "T021-O01 importer must preserve normalized official SystemName by safe alias");

const t021ArbitraryClientId = "fictional-t021-arbitrary-client";
const t021ArbitraryAlias = stableSuiyinAccountAlias({ environment: "fictional-sandbox", clientId: t021ArbitraryClientId });
const t021ArbitraryStaging = await createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: "fictional-t021-arbitrary-customer", nickname: "纯虚构任意人设人物" }],
    rows: [
      { id: "fictional-t021-arbitrary-customer", nickName: "纯虚构任意人设人物", type: "friend", clientId: t021ArbitraryClientId },
      { id: "fictional-t021-arbitrary-customer", nickName: "纯虚构任意人设人物", type: "friend", clientId: t021ArbitraryClientId, clientName: "  虚构官方三号  " },
    ],
  }),
}).collectImport();
assert.equal(t021ArbitraryStaging.source.sourceAccountLabels[t021ArbitraryAlias], "虚构官方三号", "T021-O01 arbitrary official SystemName must survive normalization and null-first duplicate rows");

assert.equal(emptyOnlyStaging.source.sourceAccountLabels["SY-762127C0"], null, "T021-O03 a history-only alias without a search_customer SystemName must remain null");

await assert.rejects(() => createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: "fictional-t021-label-conflict", nickname: "纯虚构标签冲突人物" }],
    rows: [
      { id: "fictional-t021-label-conflict", nickName: "纯虚构标签冲突人物", type: "friend", clientId: "fictional-t021-conflict-client", clientName: "2号" },
      { id: "fictional-t021-label-conflict", nickName: "纯虚构标签冲突人物", type: "friend", clientId: "fictional-t021-conflict-client", clientName: "3号" },
    ],
  }),
}).collectImport(), (error) => error?.code === "SUIYIN_ACCOUNT_LABEL_CONFLICT" && !error.message.includes("fictional-t021-conflict-client"), "T021-O04 one raw clientId with conflicting official labels must fail closed without echoing it");

await assert.rejects(() => createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: "fictional-t021-label-invalid", nickname: "纯虚构非法标签人物" }],
    rows: [{ id: "fictional-t021-label-invalid", nickName: "纯虚构非法标签人物", type: "friend", clientId: "fictional-t021-invalid-client", clientName: "sa********12" }],
  }),
}).collectImport(), (error) => error?.code === "SUIYIN_ACCOUNT_LABEL_INVALID", "T021-O01 an unsafe non-empty SystemName must fail closed instead of becoming a public label");

await assert.rejects(() => createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: "fictional-t021-single-star-label", nickname: "纯虚构单星标签人物" }],
    rows: [{ id: "fictional-t021-single-star-label", nickName: "纯虚构单星标签人物", type: "friend", clientId: "fictional-t021-single-star-client", clientName: "客户*号" }],
  }),
}).collectImport(), (error) => error?.code === "SUIYIN_ACCOUNT_LABEL_INVALID", "T021-O01 any masked star in SystemName must fail closed instead of becoming a public label");

const t021SingleStarNameStaging = await createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: "fictional-t021-single-star-name", nickname: "客户*号" }],
    rows: [{ id: "fictional-t021-single-star-name", nickName: "客户*号", type: "friend", clientId: "fictional-t021-single-star-name-client", clientName: "2号" }],
  }),
}).collectImport();
assert.equal(t021SingleStarNameStaging.people.length, 0, "T028-O04 a masked primary nickname must exclude the friend instead of creating a placeholder");
assert.equal(t021SingleStarNameStaging.aggregate.missingDisplayNameCount, 1, "T028-O04 masked primary nickname exclusion must be counted");
assert.equal(JSON.stringify(t021SingleStarNameStaging).includes("客户*号"), false, "T021-O01 a single-star masked nickname must not leave staging");

await assert.rejects(() => createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: "fictional-t021-control-label", nickname: "纯虚构控制符标签人物" }],
    rows: [{ id: "fictional-t021-control-label", nickName: "纯虚构控制符标签人物", type: "friend", clientId: "fictional-t021-control-client", clientName: "虚构\n控制标签" }],
  }),
}).collectImport(), (error) => error?.code === "SUIYIN_ACCOUNT_LABEL_INVALID", "T021-O01 control characters must be rejected before whitespace normalization");

const t021RawNameClientId = "raw-client-name-canary";
const t021RawNameStaging = await createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: "fictional-t021-raw-name", nickname: t021RawNameClientId }],
    rows: [{ id: "fictional-t021-raw-name", nickName: t021RawNameClientId, type: "friend", clientId: t021RawNameClientId, clientName: "2号" }],
  }),
}).collectImport();
assert.equal(t021RawNameStaging.people.length, 0, "T028-O04 a display name equal to any raw clientId must exclude the friend");
assert.equal(t021RawNameStaging.aggregate.missingDisplayNameCount, 1, "T028-O04 raw-id display exclusion must be counted");
assert.equal(JSON.stringify(t021RawNameStaging).includes(t021RawNameClientId), false, "T021-O01 raw clientId must not leak through people, mappings, registry, or errors");

const t021HistoryOnlyRawId = "fictional-display-auto-fictional-t021-history-only";
const t021HistoryOnlyRawStaging = await createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: "fictional-t021-history-only", nickname: t021HistoryOnlyRawId }],
    rows: [{ id: "fictional-t021-history-only", type: "friend" }],
  }),
}).collectImport();
assert.equal(t021HistoryOnlyRawStaging.people.length, 0, "T028-O04 a history-header-only raw clientId must exclude the friend after the full batch is observed");
assert.equal(t021HistoryOnlyRawStaging.aggregate.missingDisplayNameCount, 1, "T028-O04 history-header raw-id exclusion must be counted");
assert.equal(JSON.stringify(t021HistoryOnlyRawStaging).includes(t021HistoryOnlyRawId), false, "T021-O01 a history-header-only raw clientId must not leave staging");

// T028 P0 legal RED: a Mongo-shaped upstream customer ID is not a person
// name, even when the slim payload repeats it verbatim as nickName.
const t028RawCustomerId = "507f1f77bcf86cd799439011";
const t028RawCustomerNameStaging = await createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: t028RawCustomerId, nickname: t028RawCustomerId }],
    rows: [{ id: t028RawCustomerId, nickName: t028RawCustomerId, type: "friend", clientId: "fictional-t028-raw-customer-client", clientName: "2号" }],
  }),
}).collectImport();
assert.equal(t028RawCustomerNameStaging.people.length, 0, "T028-O02/O04 an exact upstream customerId nickname must exclude the friend");
assert.equal(t028RawCustomerNameStaging.aggregate.missingDisplayNameCount, 1, "T028-O04 raw customerId nickname exclusion must be counted");
assert.equal(JSON.stringify(t028RawCustomerNameStaging).includes(t028RawCustomerId), false, "T028-O02 raw upstream customerId must not leave staging recursively");

await assert.rejects(() => createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: "fictional-t021-history-text", nickname: "纯虚构正文脱敏人物" }],
    rows: [{ id: "fictional-t021-history-text", nickName: "纯虚构正文脱敏人物", type: "friend", clientId: "fictional-t021-history-text-client", clientName: "2号" }],
    historyText: "fictional-t021-history-text-client",
  }),
}).collectImport(), (error) => error?.code === "MCP_SCHEMA_INVALID" && !error.message.includes("fictional-t021-history-text-client"), "T021-O01 a raw clientId in any returned staging value must fail closed without echoing it");

const t028EmbeddedRawClientId = "fictional-t028-embedded-client-secret";
await assert.rejects(() => createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: "fictional-t028-embedded-history", nickname: "纯虚构嵌入正文人物" }],
    rows: [{ id: "fictional-t028-embedded-history", nickName: "纯虚构嵌入正文人物", type: "friend", clientId: t028EmbeddedRawClientId, clientName: "2号" }],
    historyText: `纯虚构正文前缀 ${t028EmbeddedRawClientId} 纯虚构正文后缀`,
  }),
}).collectImport(), (error) => error?.code === "MCP_SCHEMA_INVALID" && !error.message.includes(t028EmbeddedRawClientId), "T028-O02 an embedded meaningful-length raw clientId must fail closed without entering staging or the error");

// T024 focused RED seam: the importer must derive the exact same source
// identity as the canonical WeChat exporter owner formula.
const t024ClientWcId = "fictional-t024-persona-wc-2";
const t024WechatSourceId = (await stableWechatIds({ owner: t024ClientWcId, platformUserId: "fictional", talker: "fictional", serverId: "fictional", momentId: "fictional" })).sourceId;
assert.equal(typeof stableWechatExportSourceId, "function", "T024-O01 importer must expose the pure exporter-source derivation seam");
assert.equal(stableWechatExportSourceId(t024ClientWcId), t024WechatSourceId, "T024-O01 clientWcId derivation must be byte-equivalent to T002 stableWechatIds owner identity");

const t024ClientId = "fictional-t024-client-2";
const t024Alias = stableSuiyinAccountAlias({ environment: "fictional-sandbox", clientId: t024ClientId });
const t024Staging = await createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: "fictional-t024-customer-2", nickname: "纯虚构 T024 人物" }],
    rows: [
      { id: "fictional-t024-customer-2", nickName: "纯虚构 T024 人物", type: "friend", clientId: t024ClientId, clientName: "  ２号  ", clientWcId: t024ClientWcId },
      { id: "fictional-t024-customer-2", nickName: "纯虚构 T024 人物", type: "friend", clientId: t024ClientId, clientName: "2号", clientWcId: t024ClientWcId },
    ],
  }),
  now: () => "2026-08-19T00:20:00.000Z",
}).collectImport();
assert.equal(t024Staging.source.sourceAccountWechatSourceLinks[t024WechatSourceId], t024Alias, "T024-O02 staging must contain the canonical safe WeChat-source to Suiyin-alias link");
assert.equal(t024Staging.source.sourceAccountLabels[t024Alias], "2号", "T024-O02 exact link must close over the same official-label registry");
assert.equal(JSON.stringify(t024Staging).includes(t024ClientWcId), false, "T024-O02 raw clientWcId must not leave importer memory");

const t024CanonicalRows = [
  { id: "fictional-t024-customer-b", nickName: "纯虚构 T024 B", type: "friend", clientId: "fictional-t024-client-b", clientName: "虚构官方三号", clientWcId: "fictional-t024-persona-wc-b" },
  { id: "fictional-t024-customer-a", nickName: "纯虚构 T024 A", type: "friend", clientId: "fictional-t024-client-a", clientName: "2号", clientWcId: "fictional-t024-persona-wc-a" },
];
const t024CanonicalStaging = await createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: t024CanonicalRows.map((row) => ({ id: row.id, nickname: row.nickName })),
    rows: t024CanonicalRows,
  }),
}).collectImport();
assert.deepEqual(Object.keys(t024CanonicalStaging.source.sourceAccountWechatSourceLinks), Object.keys(t024CanonicalStaging.source.sourceAccountWechatSourceLinks).sort(), "T024-O02 safe link keys must be canonical code-point ordered");

const t024MissingStaging = await createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: "fictional-t024-missing", nickname: "纯虚构 T024 未关联" }],
    rows: [{ id: "fictional-t024-missing", nickName: "纯虚构 T024 未关联", type: "friend", clientId: "fictional-t024-client-missing", clientName: "2号" }],
  }),
}).collectImport();
assert.equal(Object.values(t024MissingStaging.source.sourceAccountWechatSourceLinks).includes(stableSuiyinAccountAlias({ environment: "fictional-sandbox", clientId: "fictional-t024-client-missing" })), false, "T024-O03 missing clientWcId must stay unlinked without guessing");

const t024SharedWcCanary = "fictional-t024-shared-wc-secret";
await assert.rejects(() => createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [
      { id: "fictional-t024-key-conflict-a", nickname: "纯虚构 key conflict A" },
      { id: "fictional-t024-key-conflict-b", nickname: "纯虚构 key conflict B" },
    ],
    rows: [
      { id: "fictional-t024-key-conflict-a", nickName: "纯虚构 key conflict A", type: "friend", clientId: "fictional-t024-key-client-a", clientName: "2号", clientWcId: t024SharedWcCanary },
      { id: "fictional-t024-key-conflict-b", nickName: "纯虚构 key conflict B", type: "friend", clientId: "fictional-t024-key-client-b", clientName: "3号", clientWcId: t024SharedWcCanary },
    ],
  }),
}).collectImport(), (error) => error?.code === "SUIYIN_SOURCE_LINK_CONFLICT" && !error.message.includes(t024SharedWcCanary), "T024-O03 one WeChat source linked to two aliases must fail closed without echoing raw input");

const t024SharedAliasClient = "fictional-t024-shared-alias-client";
const t024AliasWcCanaryA = "fictional-t024-alias-wc-secret-a";
const t024AliasWcCanaryB = "fictional-t024-alias-wc-secret-b";
await assert.rejects(() => createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [
      { id: "fictional-t024-alias-conflict-a", nickname: "纯虚构 alias conflict A" },
      { id: "fictional-t024-alias-conflict-b", nickname: "纯虚构 alias conflict B" },
    ],
    rows: [
      { id: "fictional-t024-alias-conflict-a", nickName: "纯虚构 alias conflict A", type: "friend", clientId: t024SharedAliasClient, clientName: "2号", clientWcId: t024AliasWcCanaryA },
      { id: "fictional-t024-alias-conflict-b", nickName: "纯虚构 alias conflict B", type: "friend", clientId: t024SharedAliasClient, clientName: "2号", clientWcId: t024AliasWcCanaryB },
    ],
  }),
}).collectImport(), (error) => error?.code === "SUIYIN_SOURCE_LINK_CONFLICT" && !error.message.includes(t024AliasWcCanaryA) && !error.message.includes(t024AliasWcCanaryB), "T024-O03 one alias linked to two WeChat sources must fail closed without echoing raw input");

const t024RawWcCanary = "fictional-t024-raw-wcid-secret";
const t024RawScrubStaging = await createSuiyinMcpClient({
  transport: createDisplayNameTransport({
    allocations: [{ id: "fictional-t024-raw-person", nickname: t024RawWcCanary }],
    rows: [{ id: "fictional-t024-raw-person", nickName: t024RawWcCanary, type: "friend", clientId: "fictional-t024-raw-client", clientName: "2号", clientWcId: t024RawWcCanary }],
  }),
}).collectImport();
assert.equal(t024RawScrubStaging.people.length, 0, "T028-O04 raw clientWcId equal to a display candidate must exclude the friend");
assert.equal(t024RawScrubStaging.aggregate.missingDisplayNameCount, 1, "T028-O04 raw wcId display exclusion must be counted");
assert.equal(JSON.stringify(t024RawScrubStaging).includes(t024RawWcCanary), false, "T024-O02 recursive staging scrub must remove raw clientWcId canaries");

// T028 legal RED: the deployed slim shape carries persona evidence in
// weixin_clients[].  The issued baseline ignores that array, loses aliasName,
// and can only rediscover a null-labelled alias from the history header.
const t028PersonaRows = [
  { id: "fictional-t028-persona-1", name: "1号", nickName: "纯虚构一号", wcId: "fictional-t028-wc-1", online_status: "offline" },
  { id: "fictional-t028-persona-2", name: "2号", nickName: "纯虚构二号", wcId: "fictional-t028-wc-2", online_status: "online" },
  { id: "fictional-t028-persona-3", name: "虚构官方三号", nickName: "纯虚构三号", wcId: "fictional-t028-wc-3", online_status: "offline" },
];
const t028NestedCalls = [];
const t028NestedTransport = {
  async request(method, params = {}) {
    if (method === "initialize") return { protocolVersion: "2025-03-26", serverInfo: { name: "fictional-t028", version: "test" }, capabilities: { tools: {} } };
    if (method === "tools/list") return { tools: [...REQUIRED_TOOLS, "list_personas"].map((name) => ({ name, ...(name === "search_customer" ? { inputSchema: { type: "object", properties: { ids: { type: "array" } } } } : {}) })) };
    if (method !== "tools/call") throw new Error("fictional-t028-unsupported-method");
    t028NestedCalls.push({ name: params.name, args: structuredClone(params.arguments || {}) });
    if (params.name === "current_environment") return mcpResult({ name: "fictional-sandbox" });
    if (params.name === "list_personas") return mcpResult(t028PersonaRows);
    if (params.name === "list_allocations") return mcpResult({ data: [{ id: "fictional-t028-nested-customer", nickname: "纯虚构分配兜底" }], total: 1 });
    if (params.name === "search_customer") return mcpResult({
      data: [{
        id: "fictional-t028-nested-customer",
        customerNames: "",
        nickName: "",
        aliasName: "纯虚构别名人物",
        remark: "纯虚构备注人物",
        type: "friend",
        weixin_clients: [{ clientId: t028PersonaRows[1].id, clientName: "2号", wcId: t028PersonaRows[1].wcId }],
      }],
      total: 1,
      page: 1,
      limit: 1,
    });
    if (params.name === "get_message_history") return mcpResult(JSON.stringify({ client_id: t028PersonaRows[1].id, next_last_message_id: "" }));
    throw new Error("fictional-t028-forbidden-tool");
  },
  async notify() {},
  async close() {},
};
const t028NestedStaging = await createSuiyinMcpClient({ transport: t028NestedTransport, now: () => "2026-08-19T02:00:00.000Z" }).collectImport();
const t028NestedAlias = stableSuiyinAccountAlias({ environment: "fictional-sandbox", clientId: t028PersonaRows[1].id });
const t028NestedWechatSource = stableWechatExportSourceId(t028PersonaRows[1].wcId);
assert.equal(t028NestedStaging.source.sourceAccountLabels[t028NestedAlias], "2号", "T028-O01 nested-only official clientName must populate the safe account registry");
assert.equal(t028NestedStaging.source.sourceAccountWechatSourceLinks[t028NestedWechatSource], t028NestedAlias, "T028-O01 nested wcId must close the exact safe WeChat-source link");
assert.equal(t028NestedStaging.people[0]?.name, "纯虚构别名人物", "T028-O01/O04 aliasName must beat remark and the allocation fallback when stronger names are empty");
assert.equal(t028NestedCalls.some((call) => call.name === "list_personas" && call.args.status === "all"), true, "T028-O03 configured roster must be read with status=all so offline personas remain included");
assert.equal(JSON.stringify(t028NestedStaging).includes(t028PersonaRows[1].id) || JSON.stringify(t028NestedStaging).includes(t028PersonaRows[1].wcId), false, "T028-O02 raw nested persona identifiers must not leave importer-local memory");
assert.deepEqual(t028NestedStaging.aggregate.perPersona.map((item) => ({ officialLabel: item.officialLabel, complete: item.complete })), [
  { officialLabel: "1号", complete: false },
  { officialLabel: "2号", complete: false },
  { officialLabel: "虚构官方三号", complete: false },
], "T028-O03 offline personas remain configured while a partial receipt truthfully keeps every persona incomplete");

function createT028TupleTransport(row) {
  return {
    async request(method, params = {}) {
      if (method === "initialize") return { protocolVersion: "2025-03-26", serverInfo: { name: "fictional-t028-tuples", version: "test" }, capabilities: { tools: {} } };
      if (method === "tools/list") return { tools: REQUIRED_TOOLS.map((name) => ({ name })) };
      if (method !== "tools/call") throw new Error("fictional-t028-unsupported-method");
      if (params.name === "current_environment") return mcpResult({ name: "fictional-sandbox" });
      if (params.name === "list_personas") return mcpResult(t028PersonaRows);
      if (params.name === "list_allocations") return mcpResult({ data: [{ id: row.id, nickname: "纯虚构 tuple 人物" }], total: 1 });
      if (params.name === "search_customer") return mcpResult({ data: [row], total: 1, page: 1, limit: 1 });
      if (params.name === "get_message_history") return mcpResult(JSON.stringify({ client_id: params.arguments.client_id, next_last_message_id: "" }));
      throw new Error("fictional-t028-forbidden-tool");
    },
    async notify() {},
    async close() {},
  };
}

const t028DuplicateTupleStaging = await createSuiyinMcpClient({ transport: createT028TupleTransport({
  id: "fictional-t028-duplicate-tuple",
  nickName: "纯虚构 tuple 人物",
  type: "friend",
  clientId: t028PersonaRows[1].id,
  clientName: "  ２号  ",
  clientWcId: t028PersonaRows[1].wcId,
  weixin_clients: [{ clientId: t028PersonaRows[1].id, clientName: "2号", wcId: t028PersonaRows[1].wcId }],
}) }).collectImport();
assert.equal(t028DuplicateTupleStaging.mappings[0].sourceAccountAliases.length, 1, "T028-O02 normalized top-level+nested duplicate tuples must remain idempotent");
assert.equal(t028DuplicateTupleStaging.aggregate.perPersona.find((item) => item.officialLabel === "2号")?.friendCount, 1, "T028-O02 duplicate tuple must count one persona friend");

const t028MultiPersonaCustomerId = "fictional-t028-multi-persona-customer";
const t028MultiPersonaTransport = {
  async request(method, params = {}) {
    if (method === "initialize") return { protocolVersion: "2025-03-26", serverInfo: { name: "fictional-t028-multi-persona", version: "test" }, capabilities: { tools: {} } };
    if (method === "tools/list") return { tools: REQUIRED_TOOLS.map((name) => ({ name })) };
    if (method !== "tools/call") throw new Error("fictional-t028-unsupported-method");
    if (params.name === "current_environment") return mcpResult({ name: "fictional-sandbox" });
    if (params.name === "list_personas") return mcpResult(t028PersonaRows);
    if (params.name === "list_allocations") return mcpResult({ data: params.arguments.page === 1 ? [{ id: t028MultiPersonaCustomerId, nickname: "纯虚构双人设人物" }] : [], total: 2 });
    if (params.name === "search_customer") return mcpResult({
      data: [{
        id: t028MultiPersonaCustomerId,
        nickName: "纯虚构双人设人物",
        type: "friend",
        weixin_clients: t028PersonaRows.slice(0, 2).map((persona) => ({ clientId: persona.id, clientName: persona.name, wcId: persona.wcId })),
      }],
      total: 1,
      page: 1,
      limit: 1,
    });
    if (params.name === "get_message_history") return mcpResult(JSON.stringify({ client_id: params.arguments.client_id, next_last_message_id: "" }));
    throw new Error("fictional-t028-forbidden-tool");
  },
  async notify() {},
  async close() {},
};
const t028MultiPersonaStaging = await createSuiyinMcpClient({ transport: t028MultiPersonaTransport }).collectImport();
assert.equal(t028MultiPersonaStaging.aggregate.allocationDeclaredCount, 2, "T028-O05 declared allocations remain a distinct unit");
assert.equal(t028MultiPersonaStaging.aggregate.allocationCount, 1, "T028-O05 only the readable allocation enters the bounded cohort");
assert.equal(t028MultiPersonaStaging.aggregate.allocationMissingCount, 1, "T028-O05 missing allocations remain aggregate-only");
assert.equal(t028MultiPersonaStaging.aggregate.friendCount, 1, "T028-O05 aggregate friends dedupe by stable person ID");
assert.equal(t028MultiPersonaStaging.aggregate.perPersona.reduce((sum, persona) => sum + persona.friendCount, 0), 2, "T028-O05 one friend may count once for each exact roster persona that owns it");
assert.equal(t028MultiPersonaStaging.aggregate.perPersona.every((persona) => !("allocationMissingCount" in persona)), true, "T028-O05 missing allocations must never be assigned to a persona without evidence");
assert.equal(t028MultiPersonaStaging.people.length, 1, "T028-O05 two persona tuples must still stage one person");
assert.equal(t028MultiPersonaStaging.mappings.length, 1, "T028-O05 two persona tuples must still stage one mapping");
assert.deepEqual(t028MultiPersonaStaging.mappings[0].sourceAccountAliases, t028PersonaRows.slice(0, 2).map((persona) => stableSuiyinAccountAlias({ environment: "fictional-sandbox", clientId: persona.id })).sort(), "T028-O05 the single mapping must preserve both safe exact-roster aliases");

for (const [caseName, row, expectedCode] of [
  ["label conflict", { id: "fictional-t028-label-conflict", nickName: "纯虚构冲突人物", type: "friend", clientId: t028PersonaRows[1].id, clientName: "2号", clientWcId: t028PersonaRows[1].wcId, weixin_clients: [{ clientId: t028PersonaRows[1].id, clientName: "3号", wcId: t028PersonaRows[1].wcId }] }, "SUIYIN_ACCOUNT_LABEL_CONFLICT"],
  ["wc conflict", { id: "fictional-t028-wc-conflict", nickName: "纯虚构冲突人物", type: "friend", clientId: t028PersonaRows[1].id, clientName: "2号", clientWcId: t028PersonaRows[1].wcId, weixin_clients: [{ clientId: t028PersonaRows[1].id, clientName: "2号", wcId: "fictional-t028-conflicting-wc" }] }, "SUIYIN_SOURCE_LINK_CONFLICT"],
]) await assert.rejects(() => createSuiyinMcpClient({ transport: createT028TupleTransport(row) }).collectImport(), (error) => error?.code === expectedCode && !error.message.includes("fictional-t028"), `T028-O02 ${caseName} must fail closed without raw identifiers`);

const t028CountRows = Array.from({ length: 7 }, (_, index) => ({
  id: `fictional-t028-count-customer-${index}`,
  nickName: `纯虚构计数人物 ${index}`,
  type: index < 4 ? "friend" : "group",
  weixin_clients: [{ clientId: t028PersonaRows[index % 3].id, clientName: t028PersonaRows[index % 3].name, wcId: t028PersonaRows[index % 3].wcId }],
}));
const t028MessageTotals = [7, 6, 5, 4, 3, 2, 1];
const t028CountTransport = {
  async request(method, params = {}) {
    if (method === "initialize") return { protocolVersion: "2025-03-26", serverInfo: { name: "fictional-t028-counts", version: "test" }, capabilities: { tools: {} } };
    if (method === "tools/list") return { tools: REQUIRED_TOOLS.map((name) => ({ name })) };
    if (method !== "tools/call") throw new Error("fictional-t028-unsupported-method");
    if (params.name === "current_environment") return mcpResult({ name: "fictional-sandbox" });
    if (params.name === "list_personas") return mcpResult(t028PersonaRows);
    if (params.name === "list_allocations") return mcpResult({ data: params.arguments.page === 1 ? t028CountRows.map((row) => ({ id: row.id, nickname: row.nickName })) : [], total: 9 });
    if (params.name === "search_customer") return mcpResult({ data: t028CountRows, total: 7, page: 0, limit: 0 });
    if (params.name === "get_message_history") {
      const customerIndex = Number(params.arguments.customer_id.split("-").at(-1));
      const start = Number(params.arguments.last_message_id || 0);
      const end = Math.min(start + 100, t028MessageTotals[customerIndex]);
      const messages = Array.from({ length: end - start }, (_, offset) => ({ id: `fictional-t028-count-message-${customerIndex}-${start + offset}`, t: "2026-08-19T02:30:00.000Z", from: "customer", content: "纯虚构计数消息" }));
      return mcpResult([JSON.stringify({ client_id: t028PersonaRows[customerIndex % 3].id, next_last_message_id: end < t028MessageTotals[customerIndex] ? String(end) : "" }), ...messages.map((item) => JSON.stringify(item))].join("\n"));
    }
    throw new Error("fictional-t028-forbidden-tool");
  },
  async notify() {},
  async close() {},
};
const t028CountStaging = await createSuiyinMcpClient({ transport: t028CountTransport, now: () => "2026-08-19T02:40:00.000Z" }).collectImport();
assert.deepEqual(Object.fromEntries(["personaDeclaredCount", "personaReadCount", "allocationDeclaredCount", "allocationCount", "allocationMissingCount", "customerCount", "friendCount", "groupCount", "messageCount", "unreadableCount", "failureCount", "missingDisplayNameCount", "scopeKind", "scopeComplete", "completeScopeUnavailableReason", "adapterReceipt"].map((field) => [field, t028CountStaging.aggregate[field]])), {
  personaDeclaredCount: 3,
  personaReadCount: 3,
  allocationDeclaredCount: 9,
  allocationCount: 7,
  allocationMissingCount: 2,
  customerCount: 7,
  friendCount: 4,
  groupCount: 3,
  messageCount: 28,
  unreadableCount: 0,
  failureCount: 0,
  missingDisplayNameCount: 0,
  scopeKind: "current-allocation-partial-v1",
  scopeComplete: false,
  completeScopeUnavailableReason: "LOCAL_SUIYIN_ADAPTER_RECEIPT_INCOMPLETE",
  adapterReceipt: { appliedScope: false, paginationComplete: true, completenessComplete: false },
}, "T028-O05/O06 current-allocation partial receipt must preserve every count unit and the complete-scope blocker");
assert.equal(t028CountStaging.aggregate.perPersona.reduce((sum, item) => sum + item.friendCount, 0), 4, "T028-O07 per-persona friend memberships are independent from the aggregate stable-person count");
assert.equal(t028CountStaging.aggregate.perPersona.reduce((sum, item) => sum + item.groupCount, 0), 3, "T028-O07 allocation missing must remain unattributed to every persona");
assert.equal(t028CountStaging.aggregate.perPersona.reduce((sum, item) => sum + item.messageCount, 0), 28, "T028-O07 per-persona readable message counts must use stable message IDs");
assert.deepEqual(t028CountStaging.source.perPersona, t028CountStaging.aggregate.perPersona, "T028-O08 source receipt and aggregate preview must share the same strict persona projection");
assert.deepEqual(t028CountStaging.source.adapterReceipt, t028CountStaging.aggregate.adapterReceipt, "T028V2-O02 partial source and aggregate must share one safe adapter receipt");
assert.equal(Object.values(t028CountStaging.aggregate.adapterReceipt).includes(false), true, "T028V2-O02 partial adapter receipt must preserve at least one incomplete gate");

// T028 v2 legal RED: discovery must consume the live tools/list descriptions
// and input schemas instead of treating the historical local names as the
// server capability inventory.  Every fixture below is code-authored and
// contains no real MCP, customer, chat, account, or browser data.
const T028V2_TOOL_NAMES = Object.freeze({
  environment: "inspect_runtime_tenant",
  personas: "enumerate_configured_wechat_personas",
  cohort: "query_exact_persona_customer_cohort",
  history: "fetch_persona_customer_history_pages",
  moments: "read_exact_persona_moments_pages",
  write: "mutate_exact_persona_customer_cohort",
  mixed: "read_and_assign_persona_customer_cohort",
});
const t028v2ReadOnlyAnnotations = Object.freeze({ readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false });
const t028v2WriteAnnotations = Object.freeze({ readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false });
const t028v2Tool = (name, description, inputSchema, annotations = t028v2ReadOnlyAnnotations) => ({ name, description, inputSchema, annotations });
const t028v2AlternativeTools = Object.freeze([
  t028v2Tool(T028V2_TOOL_NAMES.environment,
    "Read the current tenant environment without changing it. Returns the exact current environment name.",
    { type: "object", properties: {}, additionalProperties: false }),
  t028v2Tool(T028V2_TOOL_NAMES.personas,
    "Read every configured WeChat persona, including offline personas. This operation has no side effects.",
    { type: "object", properties: { status: { type: "string", const: "all" } }, required: ["status"], additionalProperties: false }),
  t028v2Tool(T028V2_TOOL_NAMES.cohort,
    "Read customers restricted to the exact requested persona wcIds. The response echoes appliedWcIds and provides stable page, total, hasMore, nextPage, and snapshotToken evidence. Read-only.",
    { type: "object", properties: { environment: { type: "string", const: "fictional-sandbox" }, wcIds: { type: "array", minItems: 1, maxItems: 3, uniqueItems: true, items: { type: "string", minLength: 1 } }, page: { type: "integer", minimum: 1 }, pageSize: { type: "integer", minimum: 1, maximum: 1 } }, required: ["environment", "wcIds", "page", "pageSize"], additionalProperties: false }),
  t028v2Tool(T028V2_TOOL_NAMES.history,
    "Read one customer's history inside one exact persona scope with stable page pagination and applied scope evidence. Read-only.",
    { type: "object", properties: { environment: { type: "string", const: "fictional-sandbox" }, customerId: { type: "string", minLength: 1 }, wcId: { type: "string", minLength: 1 }, page: { type: "integer", minimum: 1 }, pageSize: { type: "integer", minimum: 1, maximum: 1 } }, required: ["environment", "customerId", "wcId", "page", "pageSize"], additionalProperties: false }),
  t028v2Tool(T028V2_TOOL_NAMES.write,
    "Create or modify customer assignment for the requested persona scope.",
    { type: "object", properties: { environment: { type: "string" }, wcIds: { type: "array", items: { type: "string" } }, page: { type: "integer" }, pageSize: { type: "integer" } }, required: ["environment", "wcIds"], additionalProperties: false },
    t028v2WriteAnnotations),
  t028v2Tool(T028V2_TOOL_NAMES.mixed,
    "Read customers and then assign them to the requested persona as one mixed operation.",
    { type: "object", properties: { environment: { type: "string" }, wcIds: { type: "array", items: { type: "string" } }, page: { type: "integer" }, pageSize: { type: "integer" } }, required: ["environment", "wcIds"], additionalProperties: false },
    Object.freeze({ readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false })),
]);
const t030MomentsTool = t028v2Tool(T028V2_TOOL_NAMES.moments,
  "Read moments restricted to one exact requested persona wcId. The response echoes appliedWcIds and provides stable page, total, hasMore, nextPage, snapshotToken, and scopeComplete evidence. Read-only.",
  { type: "object", properties: { environment: { type: "string", const: "fictional-sandbox" }, wcIds: { type: "array", minItems: 1, maxItems: 1, uniqueItems: true, items: { type: "string", minLength: 1 } }, page: { type: "integer", minimum: 1 }, pageSize: { type: "integer", minimum: 1, maximum: 1 } }, required: ["environment", "wcIds", "page", "pageSize"], additionalProperties: false });
const t028v2Personas = Object.freeze([
  Object.freeze({ id: "fictional-t028v2-persona-a", name: "虚构官方一号", nickName: "虚构昵称甲", wcId: "fictional-t028v2-wc-a", online_status: "offline" }),
  Object.freeze({ id: "fictional-t028v2-persona-b", name: "虚构官方二号", nickName: "虚构昵称乙", wcId: "fictional-t028v2-wc-b", online_status: "online" }),
  Object.freeze({ id: "fictional-t028v2-persona-c", name: "虚构官方三号", nickName: "虚构昵称丙", wcId: "fictional-t028v2-wc-c", online_status: "offline" }),
]);
const T031_PRIVATE_PATH_CANARY = "C:\\fictional-private\\moments\\private-source.json";
const T031_PRIVATE_TOKEN_CANARY = "fictional-t031-private-token";
const T031_COHORT_PUBLISHER_ID = "fictional-t028v2-customer-0-0";
const T031_COHORT_PUBLISHER_NAME = "纯虚构客户 1-1";
const t031MomentRow = Object.freeze({
  id: "fictional-t031-moment-stable-id",
  publisherId: T031_COHORT_PUBLISHER_ID,
  publisherName: T031_COHORT_PUBLISHER_NAME,
  publishedAt: "2026-08-20T05:06:07.000Z",
  body: "纯虚构朋友圈正文，仅用于 T031 合同测试",
  mediaDescription: "纯虚构图片 1 张（未打开）",
  personaId: t028v2Personas[0].id,
  personaWcId: t028v2Personas[0].wcId,
  personaLabel: t028v2Personas[0].name,
  privatePath: T031_PRIVATE_PATH_CANARY,
  privateToken: T031_PRIVATE_TOKEN_CANARY,
});
const t028v2Customers = Object.freeze(t028v2Personas.flatMap((persona, personaIndex) => [0, 1].map((customerIndex) => Object.freeze({
  id: `fictional-t028v2-customer-${personaIndex}-${customerIndex}`,
  customerNames: [`纯虚构客户 ${personaIndex + 1}-${customerIndex + 1}`],
  type: "friend",
  weixin_clients: [Object.freeze({ clientId: persona.id, clientName: persona.name, wcId: persona.wcId })],
}))));

function createT028V2DiscoveryTransport({ includeLegacyCompatibility = false, omitSafeCohort = false, includeMomentsTool = false, momentsMode = "valid", momentsPublishedAt = t031MomentRow.publishedAt } = {}) {
  const requests = [];
  const calls = [];
  const cohortReceipts = [];
  const momentsReceipts = [];
  const legacyTools = includeLegacyCompatibility
    ? REQUIRED_TOOLS.map((name) => t028v2Tool(name,
        name === "list_allocations" || name === "search_customer"
          ? "Legacy current-allocation compatibility reader; it cannot prove persona-complete scope."
          : `Legacy read-only compatibility tool ${name}.`,
        { type: "object", additionalProperties: true }))
    : [];
  return {
    requests,
    calls,
    cohortReceipts,
    momentsReceipts,
    async request(method, params = {}) {
      requests.push({ method, params: structuredClone(params) });
      if (method === "initialize") return { protocolVersion: "2025-03-26", serverInfo: { name: "fictional-t028v2-existing-mcp", version: "test" }, capabilities: { tools: {} } };
      if (method === "tools/list") return { tools: [...t028v2AlternativeTools.filter((tool) => !omitSafeCohort || tool.name !== T028V2_TOOL_NAMES.cohort), ...(includeMomentsTool ? [t030MomentsTool] : []), ...legacyTools] };
      if (method !== "tools/call") throw new Error("fictional-t028v2-unsupported-method");
      const name = params.name;
      const args = structuredClone(params.arguments || {});
      calls.push({ name, args });
      if (name === T028V2_TOOL_NAMES.write || name === T028V2_TOOL_NAMES.mixed) throw new Error("FICTIONAL_T028V2_FORBIDDEN_SIDE_EFFECT_TOOL_CALLED");
      if (name === T028V2_TOOL_NAMES.environment) return mcpResult({ name: "fictional-sandbox" });
      if (name === T028V2_TOOL_NAMES.personas) return mcpResult(t028v2Personas);
      if (name === T028V2_TOOL_NAMES.cohort) {
        const appliedWcIds = Array.isArray(args.wcIds) ? [...new Set(args.wcIds)].sort() : [];
        const configuredWcIds = new Set(t028v2Personas.map((persona) => persona.wcId));
        if (!appliedWcIds.length || appliedWcIds.some((wcId) => !configuredWcIds.has(wcId))) throw new Error("FICTIONAL_T028V2_SCOPE_NOT_APPLIED");
        const scopedRows = t028v2Customers.filter((row) => appliedWcIds.includes(row.weixin_clients[0].wcId));
        const page = Number.isInteger(args.page) && args.page > 0 ? args.page : 1;
        const pageSize = 1;
        const start = (page - 1) * pageSize;
        const rows = scopedRows.slice(start, start + pageSize);
        const hasMore = start + rows.length < scopedRows.length;
        const receipt = {
          rows,
          total: scopedRows.length,
          page,
          pageSize,
          hasMore,
          nextPage: hasMore ? page + 1 : null,
          appliedWcIds,
          snapshotToken: `fictional-t028v2-snapshot-${appliedWcIds.join("-")}`,
          scopeComplete: !hasMore,
        };
        cohortReceipts.push(structuredClone(receipt));
        return mcpResult(receipt);
      }
      if (name === T028V2_TOOL_NAMES.history) return mcpResult({
        rows: [], total: 0, page: 1, pageSize: 1, hasMore: false, nextPage: null,
        appliedCustomerId: args.customerId,
        appliedWcId: args.wcId,
        snapshotToken: `fictional-t028v2-history-${args.customerId}`,
        scopeComplete: true,
      });
      if (name === T028V2_TOOL_NAMES.moments) {
        const appliedWcIds = Array.isArray(args.wcIds) ? [...new Set(args.wcIds)].sort() : [];
        const configuredWcIds = new Set(t028v2Personas.map((persona) => persona.wcId));
        if (appliedWcIds.length !== 1 || !configuredWcIds.has(appliedWcIds[0])) throw new Error("FICTIONAL_T030_MOMENTS_SCOPE_NOT_APPLIED");
        const requestedWcId = appliedWcIds[0];
        const page = Number.isInteger(args.page) && args.page > 0 ? args.page : 1;
        const isMomentPersona = requestedWcId === t028v2Personas[0].wcId;
        let row = isMomentPersona ? structuredClone(t031MomentRow) : null;
        if (row) row.publishedAt = momentsPublishedAt;
        if (row && momentsMode === "unknown-persona") {
          row.personaId = "fictional-t031-private-unknown-persona";
          row.personaWcId = "fictional-t031-private-unknown-wc";
          row.personaLabel = "纯虚构未知人设";
        }
        if (row && momentsMode === "unknown-publisher") {
          row.publisherId = "fictional-t031-private-unknown-publisher";
          row.publisherName = "纯虚构范围外发布者";
        }
        let rows = row && page === 1 ? [row] : [];
        let total = row ? 1 : 0;
        let hasMore = false;
        let nextPage = null;
        let scopeComplete = true;
        if (row && momentsMode === "duplicate") {
          total = 2;
          rows = [row];
          hasMore = page === 1;
          nextPage = hasMore ? 2 : null;
          scopeComplete = !hasMore;
        } else if (row && momentsMode === "pagination") {
          total = 2;
          hasMore = true;
          nextPage = page;
          scopeComplete = false;
        } else if (row && momentsMode === "completeness") scopeComplete = false;
        const receipt = {
          rows, total, page, pageSize: 1, hasMore, nextPage,
          appliedWcIds: momentsMode === "scope" && isMomentPersona ? ["fictional-t031-private-wrong-applied-wc"] : appliedWcIds,
          snapshotToken: `fictional-t030-moments-${requestedWcId}`,
          scopeComplete,
        };
        momentsReceipts.push(structuredClone(receipt));
        return mcpResult(receipt);
      }
      if (includeLegacyCompatibility && name === "current_environment") return mcpResult({ name: "fictional-sandbox" });
      if (includeLegacyCompatibility && name === "list_personas") return mcpResult(t028v2Personas);
      if (includeLegacyCompatibility && name === "list_allocations") return mcpResult({ data: [{ id: t028v2Customers[0].id, nickname: t028v2Customers[0].customerNames[0] }], total: 1 });
      if (includeLegacyCompatibility && name === "search_customer") return mcpResult({ data: [t028v2Customers[0]], total: 1, page: 1, limit: 1 });
      if (includeLegacyCompatibility && name === "get_message_history") return mcpResult(JSON.stringify({ client_id: t028v2Personas[0].id, next_last_message_id: "" }));
      throw new Error("FICTIONAL_T028V2_UNDECLARED_TOOL_CALLED");
    },
    async notify() {},
    async close() {},
  };
}

const t028v2Failures = [];
const t028v2Check = (condition, message) => { if (!condition) t028v2Failures.push(message); };

const t028v2DiscoveryTransport = createT028V2DiscoveryTransport();
const t028v2DiscoveryClient = createSuiyinMcpClient({ transport: t028v2DiscoveryTransport, now: () => "2026-08-20T03:00:00.000Z" });
t028v2Check(t028v2DiscoveryTransport.requests.length === 0, "T028V2-O03 client construction triggered MCP discovery/read before explicit collect");
let t028v2DiscoveryStaging = null;
let t028v2DiscoveryError = null;
try { t028v2DiscoveryStaging = await t028v2DiscoveryClient.collectImport(); }
catch (error) { t028v2DiscoveryError = error; }
t028v2Check(!t028v2DiscoveryError, `T028V2-O01 schema/description-compliant existing read tools with different names were rejected (${t028v2DiscoveryError?.code || "unknown"})`);
t028v2Check(t028v2DiscoveryStaging?.aggregate?.scopeKind === "persona-complete-v1" && t028v2DiscoveryStaging?.aggregate?.scopeComplete === true,
  "T028V2-O01/O02 compliant alternate-name tools did not produce a complete-scope staging receipt");
const t028v2DiscoveryNames = t028v2DiscoveryTransport.calls.map((call) => call.name);
for (const requiredName of [T028V2_TOOL_NAMES.environment, T028V2_TOOL_NAMES.personas, T028V2_TOOL_NAMES.cohort, T028V2_TOOL_NAMES.history]) {
  t028v2Check(t028v2DiscoveryNames.includes(requiredName), `T028V2-O01 discovery did not select the semantic read tool ${requiredName}`);
}
t028v2Check(!t028v2DiscoveryNames.includes(T028V2_TOOL_NAMES.write) && !t028v2DiscoveryNames.includes(T028V2_TOOL_NAMES.mixed),
  "T028V2-O03 discovery selected a write or mixed-side-effect tool");

const t028v2RiskOnlyTransport = createT028V2DiscoveryTransport({ omitSafeCohort: true });
const t028v2RiskOnlyClient = createSuiyinMcpClient({ transport: t028v2RiskOnlyTransport });
t028v2Check(t028v2RiskOnlyTransport.requests.length === 0, "T028V2-O03 risky-candidate discovery ran before explicit collect");
let t028v2RiskOnlyError = null;
try { await t028v2RiskOnlyClient.collectImport(); }
catch (error) { t028v2RiskOnlyError = error; }
t028v2Check(/^LOCAL_SUIYIN_[A-Z0-9_]+$/.test(String(t028v2RiskOnlyError?.code || "")),
  `T028V2-O03 only write/mixed cohort candidates must fail with a specific LOCAL_SUIYIN typed code (${t028v2RiskOnlyError?.code || "unknown"})`);
t028v2Check(!t028v2RiskOnlyTransport.calls.some((call) => call.name === T028V2_TOOL_NAMES.write || call.name === T028V2_TOOL_NAMES.mixed),
  "T028V2-O03 fail-closed discovery invoked a write or mixed-side-effect cohort tool");

const t028v2CompleteTransport = createT028V2DiscoveryTransport({ includeLegacyCompatibility: true });
let t028v2CompleteStaging = null;
let t028v2CompleteError = null;
try { t028v2CompleteStaging = await createSuiyinMcpClient({ transport: t028v2CompleteTransport, now: () => "2026-08-20T03:10:00.000Z" }).collectImport(); }
catch (error) { t028v2CompleteError = error; }
t028v2Check(!t028v2CompleteError, `T028V2-O02 exact fictional 3/3 receipt was rejected (${t028v2CompleteError?.code || "unknown"})`);
t028v2Check(t028v2CompleteStaging?.aggregate?.personaDeclaredCount === 3
  && t028v2CompleteStaging?.aggregate?.personaReadCount === 3
  && t028v2CompleteStaging?.aggregate?.scopeKind === "persona-complete-v1"
  && t028v2CompleteStaging?.aggregate?.scopeComplete === true
  && t028v2CompleteStaging?.aggregate?.failureCount === 0
  && t028v2CompleteStaging?.aggregate?.adapterReceipt?.appliedScope === true
  && t028v2CompleteStaging?.aggregate?.adapterReceipt?.paginationComplete === true
  && t028v2CompleteStaging?.aggregate?.adapterReceipt?.completenessComplete === true
  && t028v2CompleteStaging?.aggregate?.perPersona?.length === 3
  && t028v2CompleteStaging.aggregate.perPersona.every((persona) => persona.complete === true),
  "T028V2-O02 closed 3/3 persona scope, pagination, and completeness evidence remained partial");
t028v2Check(JSON.stringify(t028v2CompleteStaging?.source?.adapterReceipt) === JSON.stringify(t028v2CompleteStaging?.aggregate?.adapterReceipt),
  "T028V2-O02 source and aggregate did not expose the same safe adapter completeness receipt");
t028v2Check(t028v2CompleteTransport.cohortReceipts.length >= 2
  && t028v2CompleteTransport.cohortReceipts.some((receipt) => receipt.hasMore === true)
  && t028v2CompleteTransport.cohortReceipts.some((receipt) => receipt.scopeComplete === true),
  "T028V2-O02 exact cohort did not traverse and close fictional pagination evidence");
t028v2Check(!t028v2CompleteTransport.calls.some((call) => call.name === "list_allocations"),
  "T028V2-O01/O02 adapter preferred the legacy current-allocation reader even though an exact persona-scoped read tool was available");
t028v2Check(!t028v2CompleteTransport.calls.some((call) => call.name === T028V2_TOOL_NAMES.write || call.name === T028V2_TOOL_NAMES.mixed),
  "T028V2-O03 exact-scope discovery called a write or mixed-side-effect candidate");

const t028v2ClientSource = fs.readFileSync(clientPath, "utf8");
t028v2Check(!t028v2ClientSource.includes("UPSTREAM_PERSONA_COHORT_UNAVAILABLE"),
  "T028V2-O01/O02 product source still contains the withdrawn UPSTREAM persona-cohort code");
assert.deepEqual(t028v2Failures, [], `T028 v2 legal RED:\n- ${t028v2Failures.join("\n- ")}`);

// T030 legal RED: the public source receipt has exactly six metrics in one
// canonical order.  Existing T028 fixtures are intentionally reused so the
// RED proves an additive projection defect instead of inventing a second
// importer.  The optional moments tool below is fictional, read-only and
// never touches a real MCP or private source.
const T030_METRIC_KEYS = Object.freeze([
  "friends",
  "directConversations",
  "directMessages",
  "groupConversations",
  "groupMessages",
  "moments",
]);
const T030_MOMENTS_BLOCKED_REASON = "LOCAL_SUIYIN_MOMENTS_MAPPING_INCOMPLETE";
const t030Failures = [];
const t030Check = (condition, message) => { if (!condition) t030Failures.push(message); };
const t030Metric = (value, state, reason) => ({ value, state, ...(reason ? { reason } : {}) });
const t030AllowedReceiptKeys = new Set(["version", "scopeKind", "scopeComplete", "metrics", "observedDirectParticipantCount", "excludedCount", "perPersona"]);
const t030AllowedMetricKeys = new Set(["value", "state", "reason"]);
const t030States = new Set(["exact", "partial", "legacy-unknown", "upstream-unsupported", "blocked"]);

function validateT030Metric(metric, location) {
  if (!metric || Array.isArray(metric) || typeof metric !== "object") {
    t030Failures.push(`T030-O02 ${location} is not a metric object`);
    return;
  }
  t030Check(Object.keys(metric).every((key) => t030AllowedMetricKeys.has(key)), `T030-O02/O08 ${location} contains a non-public field`);
  t030Check(t030States.has(metric.state), `T030-O02 ${location} has an illegal state`);
  const counted = metric.state === "exact" || metric.state === "partial";
  t030Check(counted ? Number.isInteger(metric.value) && metric.value >= 0 : metric.value === null,
    `T030-O02 ${location} has an illegal state/value pair`);
  if (Object.prototype.hasOwnProperty.call(metric, "reason")) {
    t030Check(typeof metric.reason === "string" && /^[A-Z][A-Z0-9_:-]*$/.test(metric.reason),
      `T030-O08 ${location} reason is not a safe typed code`);
  }
}

function validateT030Metrics(metrics, location) {
  if (!metrics || Array.isArray(metrics) || typeof metrics !== "object") {
    t030Failures.push(`T030-O02 ${location} is missing the six-metric object`);
    return;
  }
  t030Check(JSON.stringify(Object.keys(metrics)) === JSON.stringify(T030_METRIC_KEYS),
    `T030-O01/O02 ${location} does not preserve the canonical six-metric order and exact key set`);
  for (const key of T030_METRIC_KEYS) validateT030Metric(metrics[key], `${location}.${key}`);
}

function validateT030Receipt(receipt, location, { scopeKind, scopeComplete, expectedMetrics, expectedPersonaState, expectedPersonaMomentsState = expectedPersonaState }) {
  if (!receipt || Array.isArray(receipt) || typeof receipt !== "object") {
    t030Failures.push(`T030-O06 ${location} is missing coverageReceipt`);
    return;
  }
  t030Check(Object.keys(receipt).every((key) => t030AllowedReceiptKeys.has(key)), `T030-O02/O08 ${location} contains a non-public receipt field`);
  t030Check(receipt.version === 1, `T030-O02 ${location} has the wrong receipt version`);
  t030Check(receipt.scopeKind === scopeKind && receipt.scopeComplete === scopeComplete, `T030-O06 ${location} has the wrong scope receipt`);
  validateT030Metrics(receipt.metrics, `${location}.metrics`);
  for (const key of T030_METRIC_KEYS) {
    t030Check(JSON.stringify(receipt.metrics?.[key]) === JSON.stringify(expectedMetrics[key]),
      `T030-O06 ${location}.${key} does not match its evidenced value/state`);
    t030Check(receipt.metrics?.[key]?.state !== "upstream-unsupported",
      `T030-O06 ${location}.${key} incorrectly reports the current MCP as upstream-unsupported`);
  }
  t030Check(Array.isArray(receipt.perPersona) && receipt.perPersona.length === 3, `T030-O07 ${location} did not preserve all three persona receipts`);
  for (const [index, persona] of (Array.isArray(receipt.perPersona) ? receipt.perPersona : []).entries()) {
    t030Check(persona && !Array.isArray(persona) && typeof persona === "object"
      && JSON.stringify(Object.keys(persona).sort()) === JSON.stringify(["metrics", "officialLabel"]),
    `T030-O07/O08 ${location}.perPersona[${index}] contains an invalid or private shape`);
    t030Check(typeof persona?.officialLabel === "string" && persona.officialLabel.length > 0, `T030-O07 ${location}.perPersona[${index}] lost its safe official label`);
    validateT030Metrics(persona?.metrics, `${location}.perPersona[${index}].metrics`);
    for (const key of T030_METRIC_KEYS) {
      const expectedState = key === "moments" ? expectedPersonaMomentsState : expectedPersonaState;
      t030Check(persona?.metrics?.[key]?.state === expectedState,
        `T030-O06/O07 ${location}.perPersona[${index}].${key} has the wrong evidence state`);
    }
  }
}

function validateT030Staging(staging, location, expected) {
  const aggregateReceipt = staging?.aggregate?.coverageReceipt;
  const sourceReceipt = staging?.source?.coverageReceipt;
  validateT030Receipt(aggregateReceipt, `${location}.aggregate.coverageReceipt`, expected);
  validateT030Receipt(sourceReceipt, `${location}.source.coverageReceipt`, expected);
  t030Check(JSON.stringify(sourceReceipt) === JSON.stringify(aggregateReceipt), `T030-O05/O06 ${location} source and aggregate coverage receipts drifted`);
  const priorLabels = staging?.aggregate?.perPersona?.map((persona) => persona.officialLabel).sort();
  const receiptLabels = aggregateReceipt?.perPersona?.map((persona) => persona.officialLabel).sort();
  t030Check(JSON.stringify(receiptLabels) === JSON.stringify(priorLabels), `T030-O07 ${location} did not preserve the canonical T028 persona labels`);
}

const t030PartialMetrics = Object.freeze({
  friends: t030Metric(4, "partial"),
  directConversations: t030Metric(4, "partial"),
  directMessages: t030Metric(22, "partial"),
  groupConversations: t030Metric(3, "partial"),
  groupMessages: t030Metric(6, "partial"),
  moments: t030Metric(null, "blocked", T030_MOMENTS_BLOCKED_REASON),
});
validateT030Staging(t028CountStaging, "fictional current-allocation partial", {
  scopeKind: "suiyin-current-allocation-partial-v1",
  scopeComplete: false,
  expectedMetrics: t030PartialMetrics,
  expectedPersonaState: "partial",
  expectedPersonaMomentsState: "blocked",
});

const t030ExactWithoutMomentsMetrics = Object.freeze({
  friends: t030Metric(6, "exact"),
  directConversations: t030Metric(6, "exact"),
  directMessages: t030Metric(0, "exact"),
  groupConversations: t030Metric(0, "exact"),
  groupMessages: t030Metric(0, "exact"),
  moments: t030Metric(null, "blocked", T030_MOMENTS_BLOCKED_REASON),
});
validateT030Staging(t028v2CompleteStaging, "fictional persona-complete without moments mapping", {
  scopeKind: "suiyin-persona-complete-v1",
  scopeComplete: true,
  expectedMetrics: t030ExactWithoutMomentsMetrics,
  expectedPersonaState: "exact",
  expectedPersonaMomentsState: "blocked",
});

const t030MomentsTransport = createT028V2DiscoveryTransport({ includeLegacyCompatibility: true, includeMomentsTool: true });
let t030ExactMomentsStaging = null;
let t030ExactMomentsError = null;
try { t030ExactMomentsStaging = await createSuiyinMcpClient({ transport: t030MomentsTransport, now: () => "2026-08-20T04:00:00.000Z" }).collectImport(); }
catch (error) { t030ExactMomentsError = error; }
t030Check(!t030ExactMomentsError, `T030-O06 fictional read-only moments mapping was rejected (${t030ExactMomentsError?.code || "unknown"})`);
const t030AllExactMetrics = Object.freeze({
  ...t030ExactWithoutMomentsMetrics,
  moments: t030Metric(1, "exact"),
});
validateT030Staging(t030ExactMomentsStaging, "fictional persona-complete with exact moments mapping", {
  scopeKind: "suiyin-persona-complete-v1",
  scopeComplete: true,
  expectedMetrics: t030AllExactMetrics,
  expectedPersonaState: "exact",
});
const t030AppliedMomentWcIds = t030MomentsTransport.momentsReceipts.flatMap((receipt) => receipt.appliedWcIds).sort();
t030Check(t030MomentsTransport.momentsReceipts.length === 3
  && t030MomentsTransport.momentsReceipts.every((receipt) => receipt.scopeComplete === true && receipt.hasMore === false)
  && t030MomentsTransport.momentsReceipts.reduce((sum, receipt) => sum + receipt.total, 0) === 1
  && JSON.stringify(t030AppliedMomentWcIds) === JSON.stringify(t028v2Personas.map((persona) => persona.wcId).sort()),
"T030-O06 moments became exact without 3/3 applied persona, pagination, and completeness receipts");

const t030MultiReceipt = t028MultiPersonaStaging.aggregate?.coverageReceipt;
t030Check(t030MultiReceipt?.metrics?.friends?.value === 1, "T030-O07 aggregate friends did not dedupe the same stable person across personas");
t030Check(t030MultiReceipt?.perPersona?.reduce((sum, persona) => sum + (persona.metrics?.friends?.value || 0), 0) === 2,
  "T030-O07 perPersona evidence was lost or aggregate was derived by simple summation");
t030Check(JSON.stringify(t028MultiPersonaStaging.source?.coverageReceipt) === JSON.stringify(t030MultiReceipt),
  "T030-O05/O07 multi-persona source and aggregate coverage receipts drifted");

const t030PublicReceipts = [
  t028CountStaging.aggregate?.coverageReceipt,
  t028v2CompleteStaging.aggregate?.coverageReceipt,
  t030ExactMomentsStaging?.aggregate?.coverageReceipt,
  t028MultiPersonaStaging.aggregate?.coverageReceipt,
].filter(Boolean);
const t030ForbiddenPublicCanaries = [
  t028PersonaRows[0].id,
  t028PersonaRows[0].wcId,
  t028CountRows[0].id,
  t028v2Customers[0].id,
  t028v2Customers[0].customerNames[0],
  "纯虚构计数消息",
  "C:\\fictional-private\\moments\\data.js",
  "fictional-secret-token",
];
for (const receipt of t030PublicReceipts) {
  const serialized = JSON.stringify(receipt);
  t030Check(t030ForbiddenPublicCanaries.every((canary) => !serialized.includes(canary)),
    "T030-O08 public coverage receipt leaked a raw ID, name/body, path, or token canary");
}
assert.deepEqual(t030Failures, [], `T030 legal RED:\n- ${t030Failures.join("\n- ")}`);

// T031 legal RED: a nonempty existing-MCP moments row must become a canonical
// moment signal with record-owned persona provenance.  Invalid batches use
// typed local errors and may never fall back to group_context or disclose the
// fictional private row in the error surface.
const t031Failures = [];
const t031Check = (condition, message) => { if (!condition) t031Failures.push(message); };
const t031CanonicalSignals = (t030ExactMomentsStaging?.signals || []).filter((signal) => signal?.kind === "moment");
const t031GroupFallbackSignals = (t030ExactMomentsStaging?.signals || []).filter((signal) => signal?.kind === "group_context");
t031Check(t031CanonicalSignals.length === 1, "T031-O07 nonempty mapped moment row did not produce exactly one canonical kind=moment signal");
t031Check(t031GroupFallbackSignals.length === 0, "T031-O07/O08 mapped moments fell back to group_context");
const t031Signal = t031CanonicalSignals[0];
const t031ExpectedPublisherIds = await stableSuiyinIds({ environment: "fictional-sandbox", customerId: t031MomentRow.publisherId });
const t031ExpectedSourceIds = await stableSuiyinIds({ environment: "fictional-sandbox" });
const t031ExpectedPersonaAlias = stableSuiyinAccountAlias({ environment: "fictional-sandbox", clientId: t028v2Personas[0].id });
t031Check(typeof t031Signal?.id === "string" && /^[A-F0-9]{64}$/.test(t031Signal.id) && t031Signal.id !== t031MomentRow.id,
  "T031-O07 canonical moment identity is missing, unstable, or raw");
t031Check(t031Signal?.sourceId === t031ExpectedSourceIds.sourceId
  && t031Signal?.personId === t031ExpectedPublisherIds.personId
  && !Object.prototype.hasOwnProperty.call(t031Signal || {}, "publisherLabel")
  && t030ExactMomentsStaging.people.some((person) => person.id === t031Signal?.personId && person.name === t031MomentRow.publisherName),
"T031-O07 stable source-owned publisher identity/display did not close");
t031Check(t031Signal?.sourceAccountAlias === t031ExpectedPersonaAlias
  && !Object.prototype.hasOwnProperty.call(t031Signal || {}, "sourcePersonaLabel")
  && t030ExactMomentsStaging.mappings.some((mapping) => mapping.personId === t031Signal?.personId
    && mapping.sourceAccountAliases.includes(t031ExpectedPersonaAlias)),
"T031-O03/O07 moment provenance did not close to the record's exact official persona");
t031Check(t031Signal?.publishedAt === t031MomentRow.publishedAt
  && t031Signal?.text === t031MomentRow.body
  && t031Signal?.mediaDescription === t031MomentRow.mediaDescription,
"T031-O05/O07 published instant, body, or media text was not projected from the moment row");
t031Check(!["contextId", "contextLabel", "direction", "messageType", "thirdParty"].some((field) => Object.prototype.hasOwnProperty.call(t031Signal || {}, field)),
  "T031-O01/O07 canonical moment inherited chat/group_context fields");
const t031SerializedSignal = JSON.stringify(t031Signal || {});
for (const canary of [t031MomentRow.id, t031MomentRow.publisherId, t031MomentRow.personaId, t031MomentRow.personaWcId, T031_PRIVATE_PATH_CANARY, T031_PRIVATE_TOKEN_CANARY]) {
  t031Check(!t031SerializedSignal.includes(canary), "T031-O02/O07 canonical moment signal leaked a raw identity, path, or token");
}

const t031RepeatStaging = await createSuiyinMcpClient({
  transport: createT028V2DiscoveryTransport({ includeLegacyCompatibility: true, includeMomentsTool: true }),
  now: () => "2026-08-20T04:05:00.000Z",
}).collectImport();
const t031RepeatSignal = t031RepeatStaging.signals.find((signal) => signal.kind === "moment");
t031Check(Boolean(t031Signal?.id) && t031RepeatSignal?.id === t031Signal.id && t031RepeatSignal?.personId === t031Signal.personId,
  "T031-O07 stable moment/publisher projection changed across identical fictional reads");

const t031DriftCodes = Object.freeze({
  duplicate: "LOCAL_SUIYIN_MOMENTS_DUPLICATE_ID",
  scope: "LOCAL_SUIYIN_MOMENTS_SCOPE_INVALID",
  pagination: "LOCAL_SUIYIN_MOMENTS_PAGINATION_INCOMPLETE",
  completeness: "LOCAL_SUIYIN_MOMENTS_COMPLETENESS_INCOMPLETE",
  "unknown-persona": "LOCAL_SUIYIN_MOMENTS_PERSONA_INVALID",
});
const t031PrivateErrorCanaries = [
  t031MomentRow.id,
  t031MomentRow.publisherId,
  t031MomentRow.publisherName,
  t031MomentRow.body,
  t031MomentRow.mediaDescription,
  t031MomentRow.personaId,
  t031MomentRow.personaWcId,
  "fictional-t031-private-unknown-persona",
  "fictional-t031-private-unknown-wc",
  "fictional-t031-private-wrong-applied-wc",
  "fictional-t030-moments-",
  T031_PRIVATE_PATH_CANARY,
  T031_PRIVATE_TOKEN_CANARY,
];
for (const [momentsMode, expectedCode] of Object.entries(t031DriftCodes)) {
  const transport = createT028V2DiscoveryTransport({ includeLegacyCompatibility: true, includeMomentsTool: true, momentsMode });
  let driftStaging = null;
  let driftError = null;
  try { driftStaging = await createSuiyinMcpClient({ transport }).collectImport(); }
  catch (error) { driftError = error; }
  t031Check(!driftStaging && driftError?.code === expectedCode,
    `T031-O07 ${momentsMode} drift did not fail the whole batch with ${expectedCode} (${driftError?.code || "success"})`);
  t031Check(!driftStaging?.signals?.some((signal) => signal.kind === "group_context"),
    `T031-O07/O08 ${momentsMode} drift used group_context fallback`);
  if (driftError) {
    const publicError = `${driftError.code || ""}\n${driftError.message || ""}`;
    t031Check(driftError.message === driftError.code
      && t031PrivateErrorCanaries.every((canary) => !publicError.includes(canary))
      && !/upstream|capability missing|response body/i.test(publicError),
    `T031-O02/O09 ${momentsMode} public error leaked private/upstream details`);
  }
}
assert.deepEqual(t031Failures, [], `T031 MCP legal RED:\n- ${t031Failures.join("\n- ")}`);

// T031 E4 legal RED: ISO text, a 10-digit Unix-seconds epoch, and a
// 13-digit Unix-milliseconds epoch are three encodings of the same published
// instant.  Invalid or ambiguous epochs must reject the entire fictional batch
// with the existing safe schema code and no reflected record details.
const t031CanonicalPublishedAt = "2026-08-20T05:06:07.000Z";
const t031TimeFailures = [];
let t031CanonicalTimeIdentity = null;
for (const [label, momentsPublishedAt] of [
  ["ISO", t031CanonicalPublishedAt],
  ["10-digit-seconds", 1_787_202_367],
  ["13-digit-milliseconds", 1_787_202_367_000],
]) {
  let staging = null;
  let error = null;
  try {
    staging = await createSuiyinMcpClient({
      transport: createT028V2DiscoveryTransport({ includeLegacyCompatibility: true, includeMomentsTool: true, momentsPublishedAt }),
    }).collectImport();
  } catch (caught) { error = caught; }
  const signal = staging?.signals?.find((candidate) => candidate.kind === "moment");
  if (error || !signal) t031TimeFailures.push(`T031-E4 ${label} encoding was rejected (${error?.code || "missing-signal"})`);
  else {
    if (signal.publishedAt !== t031CanonicalPublishedAt) t031TimeFailures.push(`T031-E4 ${label} did not normalize to the canonical ISO instant`);
    const identity = { id: signal.id, sourceId: signal.sourceId, personId: signal.personId, sourceAccountAlias: signal.sourceAccountAlias };
    if (t031CanonicalTimeIdentity === null) t031CanonicalTimeIdentity = identity;
    else if (JSON.stringify(identity) !== JSON.stringify(t031CanonicalTimeIdentity)) t031TimeFailures.push(`T031-E4 ${label} changed stable moment identity/provenance`);
  }
}

for (const [label, momentsPublishedAt] of [
  ["11-digit-ambiguous", 17_872_023_670],
  ["fractional-seconds", 1_787_202_367.5],
  ["invalid-text", "T031_PRIVATE_INVALID_TIME_CANARY"],
]) {
  let staging = null;
  let error = null;
  try {
    staging = await createSuiyinMcpClient({
      transport: createT028V2DiscoveryTransport({ includeLegacyCompatibility: true, includeMomentsTool: true, momentsPublishedAt }),
    }).collectImport();
  } catch (caught) { error = caught; }
  const publicError = `${error?.code || ""}\n${error?.message || ""}`;
  if (staging || error?.code !== "LOCAL_SUIYIN_MOMENTS_SCHEMA_INVALID") {
    t031TimeFailures.push(`T031-E4 ${label} did not fail the whole batch with LOCAL_SUIYIN_MOMENTS_SCHEMA_INVALID (${error?.code || "success"})`);
  }
  if (error && (error.message !== error.code
    || [String(momentsPublishedAt), t031MomentRow.id, t031MomentRow.publisherId, t031MomentRow.body, T031_PRIVATE_PATH_CANARY, T031_PRIVATE_TOKEN_CANARY]
      .some((canary) => publicError.includes(canary)))) {
    t031TimeFailures.push(`T031-E4 ${label} reflected private epoch/record details in the public error`);
  }
}
assert.deepEqual(t031TimeFailures, [], `T031 numeric epoch legal RED:\n- ${t031TimeFailures.join("\n- ")}`);

// T031 E4 legal RED: the same fictional nonempty client staging must cross the
// real local-vault boundary without fixture-only reshaping.  The publisher is
// an existing customer in the exact persona cohort, never a detached row-only
// identity.  The merged graph must feed the public Moments projector and
// survive an encrypted backup/read/restore round trip without exposing raw
// account aliases or stable internal IDs.
const t031CohortPublisher = t028v2Customers.find((customer) => customer.id === t031MomentRow.publisherId);
assert.equal(t031CohortPublisher?.customerNames?.[0], t031MomentRow.publisherName,
  "T031-E4 fixture publisher must be an exact existing customer in the discovered cohort");
const t031StagedPublisher = t030ExactMomentsStaging.people.find((person) => person.id === t031Signal.personId);
const t031StagedPublisherMapping = t030ExactMomentsStaging.mappings.find((mapping) => mapping.sourceId === t031Signal.sourceId
  && mapping.sourcePersonId === t031Signal.personId
  && mapping.personId === t031Signal.personId);
assert.equal(t031StagedPublisher?.name, t031MomentRow.publisherName,
  "T031-E4 canonical moment publisher must reuse the staged cohort person");
assert.equal(t031StagedPublisherMapping?.sourceDisplayName, t031MomentRow.publisherName,
  "T031-E4 canonical moment publisher must reuse the staged cohort mapping");
assert.equal(t031StagedPublisherMapping?.sourceAccountAliases?.includes(t031Signal.sourceAccountAlias), true,
  "T031-E4 canonical moment persona provenance must close through the publisher mapping");

const t031IntegrationStagingBefore = structuredClone(t030ExactMomentsStaging);
const t031IntegrationGeneration = "fictional-t031-e4-generation";
const t031BackupPhrase = "fictional t031 e4 encrypted backup phrase";
let t031RepairPreview = null;
let t031MergedGraph = null;
let t031TrustedMoments = null;
let t031BackupArtifact = null;
let t031BackupPreview = null;
let t031RestoredTrustedMoments = null;
let t031IntegrationError = null;
try {
  t031RepairPreview = projectSuiyinSourceAttributionRepair(null, t030ExactMomentsStaging);
  t031MergedGraph = mergeSuiyinImport(null, t030ExactMomentsStaging);
  t031TrustedMoments = queryTrustedMoments(t031MergedGraph, { activeGenerationId: t031IntegrationGeneration });
  t031BackupArtifact = await createBackup(t031MergedGraph, t031BackupPhrase, { now: "2026-08-20T05:10:00.000Z" });
  t031BackupPreview = await readBackupPreview(t031BackupArtifact, t031BackupPhrase);
  const adapter = createMemoryVaultAdapter();
  const key = await generateVaultKey();
  await commitGraph(adapter, {
    owner: "t031-fictional-empty-owner",
    settings: { schema: 2 },
    sources: [], people: [], excerpts: [], mappings: [], relationships: [], dictionary: [],
    signals: [], topics: [], notes: [], actions: [], trash: [], purgedPersonIds: [], identityDecisions: [],
  }, key, { now: "2026-08-20T05:11:00.000Z" });
  await restoreBackup(adapter, key, t031BackupArtifact, t031BackupPhrase, { now: "2026-08-20T05:12:00.000Z" });
  const restored = await loadActiveGraph(adapter, key, { now: "2026-08-20T05:13:00.000Z" });
  t031RestoredTrustedMoments = queryTrustedMoments(restored, { activeGenerationId: `${t031IntegrationGeneration}-restored` });
} catch (error) {
  t031IntegrationError = error;
}
assert.deepEqual(t030ExactMomentsStaging, t031IntegrationStagingBefore,
  "T031-E4 local-vault read/merge pipeline must not mutate client staging");
assert.equal(t031IntegrationError?.code || t031IntegrationError?.message || null, null,
  `T031-E4 client staging is not accepted end to end (${t031IntegrationError?.code || t031IntegrationError?.message || "unknown"})`);
assert.deepEqual(t031RepairPreview, { matchedSourceCount: 0, affectedPeopleCount: 0, attributions: [], formalWriteCount: 0 },
  "T031-E4 source-attribution repair preview must remain safe and zero-write for an unlinked Suiyin-only import");
assert.equal(t031TrustedMoments?.total, 1, "T031-E4 merged staging must expose exactly one trusted moment");
assert.equal(t031RestoredTrustedMoments?.total, 1, "T031-E4 encrypted backup round trip must preserve the trusted moment");
for (const result of [t031TrustedMoments, t031RestoredTrustedMoments]) {
  const item = result?.items?.[0];
  assert.equal(item?.sourceLabel, "碎银 · 虚构官方一号", "T031-E4 trusted moment must use the exact safe official persona label");
  assert.equal(item?.publisherLabel, t031MomentRow.publisherName, "T031-E4 trusted moment must retain the safe cohort publisher label");
  assert.equal(item?.bodyLabel, t031MomentRow.body, "T031-E4 trusted moment must retain the canonical fictional body");
  assert.equal(item?.mediaDescriptionLabel, t031MomentRow.mediaDescription, "T031-E4 trusted moment must retain the canonical fictional media description");
  assert.deepEqual(Object.keys(item || {}).sort(), [
    "bodyLabel", "classificationAllowed", "classificationLabel", "identityLabel", "mediaDescriptionLabel",
    "opaqueToken", "publishedAtLabel", "publisherLabel", "sourceLabel", "sourceToken",
  ].sort(), "T031-E4 trusted moment public item must use the strict safe allowlist");
}
assert.deepEqual({
  version: t031BackupPreview?.version,
  createdAt: t031BackupPreview?.createdAt,
  mode: t031BackupPreview?.mode,
  people: t031BackupPreview?.people,
  sources: t031BackupPreview?.sources,
}, {
  version: 2,
  createdAt: "2026-08-20T05:10:00.000Z",
  mode: "complete-replace",
  people: t030ExactMomentsStaging.people.length,
  sources: 1,
}, "T031-E4 encrypted backup create/read preview must validate the complete merged graph");
const t031IntegrationPublicJson = JSON.stringify({
  repair: t031RepairPreview,
  query: t031TrustedMoments,
  restoredQuery: t031RestoredTrustedMoments,
  backupPreview: t031BackupPreview,
  backupEnvelope: t031BackupArtifact,
});
for (const canary of [
  t031MomentRow.id,
  t031MomentRow.publisherId,
  t031MomentRow.personaId,
  t031MomentRow.personaWcId,
  t031Signal.id,
  t031Signal.sourceId,
  t031Signal.personId,
  t031Signal.sourceAccountAlias,
  t031StagedPublisherMapping.id,
  T031_PRIVATE_PATH_CANARY,
  T031_PRIVATE_TOKEN_CANARY,
]) assert.equal(t031IntegrationPublicJson.includes(canary), false, "T031-E4 public/backup surfaces leaked a raw alias, ID, path, or token");

const t031UnknownPublisherTransport = createT028V2DiscoveryTransport({
  includeLegacyCompatibility: true,
  includeMomentsTool: true,
  momentsMode: "unknown-publisher",
});
let t031UnknownPublisherStaging = null;
let t031UnknownPublisherError = null;
try { t031UnknownPublisherStaging = await createSuiyinMcpClient({ transport: t031UnknownPublisherTransport }).collectImport(); }
catch (error) { t031UnknownPublisherError = error; }
assert.equal(t031UnknownPublisherStaging, null, "T031-E4 an out-of-cohort moment publisher must reject the whole batch");
assert.equal(t031UnknownPublisherError?.code, "LOCAL_SUIYIN_MOMENTS_PUBLISHER_INVALID",
  `T031-E4 an out-of-cohort publisher must fail closed (${t031UnknownPublisherError?.code || "success"})`);
assert.equal(t031UnknownPublisherError?.message, "LOCAL_SUIYIN_MOMENTS_PUBLISHER_INVALID",
  "T031-E4 out-of-cohort publisher error must not reflect private record details");

const wrongEnvironment = createSuiyinMcpClient({ transport: createFakeTransport({ environment: "fictional-other" }) });
await assert.rejects(() => wrongEnvironment.collectImport(), (error) => error?.code === "MCP_ENVIRONMENT_MISMATCH" && !error.message.includes("fictional-other"));
const cursorLoop = createSuiyinMcpClient({ transport: createFakeTransport({ loop: true }) });
await assert.rejects(() => cursorLoop.collectImport(), (error) => error?.code === "MCP_CURSOR_INVALID");
const injectedFailure = createSuiyinMcpClient({ transport: createFakeTransport({ upstreamFailure: true }) });
await assert.rejects(() => injectedFailure.collectImport(), (error) => error?.code === "MCP_UPSTREAM_FAILED" && !error.message.includes("CANARY"));

console.log("[PASS] T010 Suiyin MCP contract");
console.log("- fictional frozen allocation, full pagination, hard read-only allowlist, fictional-sandbox lock, stable IDs, minimization, and typed failures verified");
