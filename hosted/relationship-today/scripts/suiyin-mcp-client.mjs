#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawn } from "node:child_process";

export const READ_ONLY_TOOLS = new Set(["current_environment", "list_personas", "list_allocations", "search_customer", "get_message_history"]);
const REQUIRED_TOOLS = [...READ_ONLY_TOOLS];
const LOCAL_PARTIAL_REASON = "LOCAL_SUIYIN_ADAPTER_RECEIPT_INCOMPLETE";
const LOCAL_MOMENTS_REASON = "LOCAL_SUIYIN_MOMENTS_MAPPING_INCOMPLETE";
const SAFE_CODES = new Set(["MCP_UNAVAILABLE", "MCP_ENVIRONMENT_MISMATCH", "MCP_TOOL_FORBIDDEN", "MCP_SCHEMA_INVALID", "MCP_CURSOR_INVALID", "MCP_UPSTREAM_FAILED", "LOCAL_SUIYIN_ADAPTER_MAPPING_INCOMPLETE", "LOCAL_SUIYIN_ADAPTER_SCHEMA_AMBIGUOUS", "LOCAL_SUIYIN_ADAPTER_SCHEMA_INVALID", "LOCAL_SUIYIN_APPLIED_SCOPE_INVALID", "LOCAL_SUIYIN_PAGINATION_INCOMPLETE", "LOCAL_SUIYIN_COMPLETENESS_INCOMPLETE", "LOCAL_SUIYIN_MOMENTS_SCHEMA_INVALID", "LOCAL_SUIYIN_MOMENTS_DUPLICATE_ID", "LOCAL_SUIYIN_MOMENTS_SCOPE_INVALID", "LOCAL_SUIYIN_MOMENTS_PAGINATION_INCOMPLETE", "LOCAL_SUIYIN_MOMENTS_COMPLETENESS_INCOMPLETE", "LOCAL_SUIYIN_MOMENTS_PERSONA_INVALID", "LOCAL_SUIYIN_MOMENTS_PUBLISHER_INVALID", LOCAL_PARTIAL_REASON, "SOURCE_ACCOUNT_ALIAS_INVALID", "SUIYIN_ACCOUNT_LABEL_INVALID", "SUIYIN_ACCOUNT_LABEL_CONFLICT", "SUIYIN_SOURCE_LINK_CONFLICT"]);
const MAX_PAGE_SIZE = 100;
const DEFAULT_MAX_PAGES = 10_000;
const MAX_ALLOCATION_ATTEMPTS = 3;
const FORBIDDEN_PRIMARY_NAME = /(?:[*＊]|^SY-[0-9A-F]{8}$|^(?:wxid_|gh_))/iu;
const RAW_IDENTIFIER_NAME = /^(?:[0-9]{6,}|[0-9A-F]{32,}|[0-9A-F]{8}(?:-[0-9A-F]{4}){3}-[0-9A-F]{12})$/iu;
const UNKNOWN_PRIMARY_NAME = /^(?:unknown|tbd|待补|昵称待补)$/iu;

const safeError = (code) => Object.assign(new Error(code), { code });
const hash = (value) => createHash("sha256").update(String(value).normalize("NFC"), "utf8").digest("hex").toUpperCase();

const toolProperties = (tool) => tool?.inputSchema && !Array.isArray(tool.inputSchema) && typeof tool.inputSchema === "object"
  && tool.inputSchema.properties && !Array.isArray(tool.inputSchema.properties) && typeof tool.inputSchema.properties === "object"
  ? tool.inputSchema.properties
  : {};
const SIDE_EFFECT_DESCRIPTION = /\b(?:create|update|modify|delete|assign|write|send)\b|(?:创建|更新|修改|删除|分配|写入|发送)/iu;
const safeDynamicReadTool = (tool) => tool?.annotations?.readOnlyHint === true
  && tool.annotations?.destructiveHint !== true
  && typeof tool?.description === "string"
  && tool.description.trim().length > 0
  && !SIDE_EFFECT_DESCRIPTION.test(tool.description);
const semanticText = (tool) => String(tool?.description || "").normalize("NFKC").toLocaleLowerCase("en-US");
const semanticCandidates = (tools, kind) => tools.filter((tool) => {
  if (!safeDynamicReadTool(tool)) return false;
  const properties = toolProperties(tool);
  const text = semanticText(tool);
  if (/(?:legacy|compatibility|current-allocation|current allocation|旧版|兼容片段)/u.test(text)) return false;
  if (kind === "environment") return Object.keys(properties).length === 0
    && /(?:environment|tenant|环境|租户)/u.test(text)
    && /(?:current|exact|当前|精确)/u.test(text);
  if (kind === "personas") return Object.prototype.hasOwnProperty.call(properties, "status")
    && /(?:persona|wechat account|人设|微信账号)/u.test(text)
    && /(?:configured|every|all|配置|全部)/u.test(text);
  if (kind === "cohort") return properties.wcIds?.type === "array"
    && Object.prototype.hasOwnProperty.call(properties, "page")
    && Object.prototype.hasOwnProperty.call(properties, "pageSize")
    && /(?:customer|客户)/u.test(text)
    && /(?:persona|wcid|人设)/u.test(text)
    && /(?:exact|restricted|scope|applied|精确|限定|范围|生效)/u.test(text);
  if (kind === "history") return Object.prototype.hasOwnProperty.call(properties, "customerId")
    && Object.prototype.hasOwnProperty.call(properties, "wcId")
    && Object.prototype.hasOwnProperty.call(properties, "page")
    && Object.prototype.hasOwnProperty.call(properties, "pageSize")
    && /(?:history|message|chat|历史|消息|聊天)/u.test(text)
    && /(?:customer|客户)/u.test(text)
    && /(?:persona|scope|wcid|人设|范围)/u.test(text);
  if (kind === "moments") return properties.wcIds?.type === "array"
    && Object.prototype.hasOwnProperty.call(properties, "page")
    && Object.prototype.hasOwnProperty.call(properties, "pageSize")
    && /(?:moments|朋友圈)/u.test(text)
    && /(?:persona|wcid|人设)/u.test(text)
    && /(?:exact|restricted|scope|applied|provenance|精确|限定|范围|生效|来源)/u.test(text);
  return false;
});

function discoverReadTools(tools) {
  const validTools = Array.isArray(tools) ? tools.filter((tool) => tool && typeof tool.name === "string" && tool.name) : [];
  const selected = {};
  for (const kind of ["environment", "personas", "cohort", "history", "moments"]) {
    const candidates = semanticCandidates(validTools, kind);
    if (candidates.length > 1) throw safeError("LOCAL_SUIYIN_ADAPTER_SCHEMA_AMBIGUOUS");
    if (candidates.length === 1) selected[kind] = candidates[0];
  }
  const exactReady = ["environment", "personas", "cohort", "history"].every((kind) => selected[kind]);
  const legacyReady = REQUIRED_TOOLS.every((name) => {
    const tool = validTools.find((candidate) => candidate.name === name);
    if (!tool) return false;
    if (!tool.annotations && !tool.description) return true;
    return safeDynamicReadTool(tool);
  });
  if (exactReady) return { mode: "persona-complete", tools: selected, allowedTools: new Set(Object.values(selected).map((tool) => tool.name)) };
  if (legacyReady) return {
    mode: "current-allocation-partial",
    tools: {
      environment: validTools.find((tool) => tool.name === "current_environment"),
      personas: validTools.find((tool) => tool.name === "list_personas"),
    },
    allowedTools: new Set(REQUIRED_TOOLS),
  };
  throw safeError("LOCAL_SUIYIN_ADAPTER_MAPPING_INCOMPLETE");
}

export function stableSuiyinAccountAlias({ environment, clientId } = {}) {
  if (typeof environment !== "string" || !environment || typeof clientId !== "string" || !clientId) throw safeError("SOURCE_ACCOUNT_ALIAS_INVALID");
  return `SY-${hash(`suiyin-account-alias/v1\0${environment.normalize("NFC")}\0${clientId.normalize("NFC")}`).slice(0, 8)}`;
}

export function stableWechatExportSourceId(clientWcId) {
  if (typeof clientWcId !== "string" || !clientWcId) throw safeError("MCP_SCHEMA_INVALID");
  return hash(`wechat-export-toolkit/source/v1\0${clientWcId.normalize("NFC")}`);
}

export function normalizeSuiyinSystemName(value, rawClientId = "") {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") throw safeError("SUIYIN_ACCOUNT_LABEL_INVALID");
  const nfkc = value.normalize("NFKC");
  if (/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/u.test(nfkc)) throw safeError("SUIYIN_ACCOUNT_LABEL_INVALID");
  const normalized = nfkc.trim().replace(/\s+/gu, " ");
  if (!normalized) return null;
  const length = [...normalized].length;
  const unsafe = length > 64
    || /[*＊]/u.test(normalized)
    || /^SY-[0-9A-F]{8}$/iu.test(normalized)
    || /^(?:wxid_|gh_)/iu.test(normalized)
    || /^(?:[0-9A-F]{32,64}|[0-9A-F]{8}(?:-[0-9A-F]{4}){3}-[0-9A-F]{12}|[0-9]{8,})$/iu.test(normalized)
    || /^(?:unknown|tbd|待补|账号待补|未知|未命名)$/iu.test(normalized)
    || (typeof rawClientId === "string" && rawClientId && normalized === rawClientId.normalize("NFKC").trim());
  if (unsafe) throw safeError("SUIYIN_ACCOUNT_LABEL_INVALID");
  return normalized;
}

export async function stableSuiyinIds({ environment, customerId, clientId, messageId }) {
  const sourceId = hash(`suiyin\0${String(environment).normalize("NFC")}`);
  const personId = customerId === undefined ? null : hash(`${sourceId}\0customer\0${String(customerId).normalize("NFC")}`);
  const stableMessageId = messageId === undefined ? null : hash(`${sourceId}\0message\0${String(customerId).normalize("NFC")}\0${String(clientId).normalize("NFC")}\0${String(messageId).normalize("NFC")}`);
  return { sourceId, ...(personId ? { personId, contextId: personId } : {}), ...(stableMessageId ? { messageId: stableMessageId } : {}) };
}

function decodeToolResult(result) {
  if (!result || result.isError) throw safeError("MCP_UPSTREAM_FAILED");
  if (result.structuredContent && typeof result.structuredContent === "object") return result.structuredContent;
  const texts = Array.isArray(result.content) ? result.content.filter((item) => item?.type === "text" && typeof item.text === "string").map((item) => item.text) : [];
  if (texts.length !== 1) throw safeError("MCP_SCHEMA_INVALID");
  try { return JSON.parse(texts[0]); } catch { return texts[0]; }
}

function objectPayload(value) {
  if (!value || Array.isArray(value) || typeof value !== "object") throw safeError("MCP_SCHEMA_INVALID");
  return value;
}

const safeEnvironmentName = (value) => {
  if (typeof value !== "string") return null;
  const normalized = value.normalize("NFKC").trim();
  return /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(normalized) ? normalized : null;
};

function environmentName(payload) {
  if (typeof payload === "string") return safeEnvironmentName(payload);
  return safeEnvironmentName(payload?.name ?? payload?.current ?? payload?.environment);
}

function safeDisplayName(value) {
  if (typeof value !== "string") return "";
  const normalized = value.normalize("NFKC").trim().replace(/\s+/gu, " ");
  if (!normalized || FORBIDDEN_PRIMARY_NAME.test(normalized) || RAW_IDENTIFIER_NAME.test(normalized) || UNKNOWN_PRIMARY_NAME.test(normalized)) return "";
  return normalized;
}

function normalizeMomentPublishedAt(value) {
  const invalid = () => { throw safeError("LOCAL_SUIYIN_MOMENTS_SCHEMA_INVALID"); };
  let timestamp;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || !Number.isSafeInteger(value) || value <= 0) invalid();
    const digits = String(value).length;
    if (digits === 10) timestamp = value * 1_000;
    else if (digits === 13) timestamp = value;
    else invalid();
  } else if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
    if (!match) invalid();
    const [, yearText, monthText, dayText, hourText, minuteText, secondText] = match;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const hour = Number(hourText);
    const minute = Number(minuteText);
    const second = Number(secondText);
    const daysInMonth = year >= 1 && month >= 1 && month <= 12
      ? new Date(Date.UTC(year, month, 0)).getUTCDate()
      : 0;
    if (day < 1 || day > daysInMonth || hour > 23 || minute > 59 || second > 59) invalid();
    timestamp = Date.parse(value);
  } else invalid();
  if (!Number.isFinite(timestamp) || !Number.isSafeInteger(timestamp)) invalid();
  try { return new Date(timestamp).toISOString(); }
  catch { invalid(); }
}

function displayName(row, fallback = "") {
  const customerNames = Array.isArray(row.customerNames) ? row.customerNames : [row.customerNames];
  return [...customerNames, row.nickName, row.nickname, row.aliasName, row.remark, fallback].map(safeDisplayName).find(Boolean) || "";
}

function personaTuples(row) {
  if (!row || Array.isArray(row) || typeof row !== "object") throw safeError("MCP_SCHEMA_INVALID");
  if (row.weixin_clients !== undefined && !Array.isArray(row.weixin_clients)) throw safeError("MCP_SCHEMA_INVALID");
  const candidates = [
    { clientId: row.clientId, clientName: row.clientName, clientWcId: row.clientWcId },
    ...(row.weixin_clients || []).map((tuple) => {
      if (!tuple || Array.isArray(tuple) || typeof tuple !== "object") throw safeError("MCP_SCHEMA_INVALID");
      return { clientId: tuple.clientId, clientName: tuple.clientName, clientWcId: tuple.wcId };
    }),
  ];
  const byClientId = new Map();
  for (const tuple of candidates) {
    for (const value of [tuple.clientId, tuple.clientName, tuple.clientWcId]) if (value !== undefined && value !== null && typeof value !== "string") throw safeError("MCP_SCHEMA_INVALID");
    const clientId = tuple.clientId || "";
    const clientName = clientId ? normalizeSuiyinSystemName(tuple.clientName, clientId) : tuple.clientName ?? null;
    const clientWcId = tuple.clientWcId || "";
    if (!clientId) {
      if ((clientName !== null && clientName !== "") || clientWcId) throw safeError("MCP_SCHEMA_INVALID");
      continue;
    }
    const prior = byClientId.get(clientId);
    if (!prior) byClientId.set(clientId, { clientId, clientName, clientWcId });
    else {
      if (prior.clientName !== null && clientName !== null && prior.clientName !== "" && clientName !== "" && prior.clientName !== clientName) throw safeError("SUIYIN_ACCOUNT_LABEL_CONFLICT");
      if (prior.clientWcId && clientWcId && prior.clientWcId !== clientWcId) throw safeError("SUIYIN_SOURCE_LINK_CONFLICT");
      if ((prior.clientName === null || prior.clientName === "") && clientName !== null && clientName !== "") prior.clientName = clientName;
      if (!prior.clientWcId && clientWcId) prior.clientWcId = clientWcId;
    }
  }
  return [...byClientId.values()].sort((left, right) => left.clientId < right.clientId ? -1 : left.clientId > right.clientId ? 1 : 0);
}

function customerKind(row) {
  const marker = [row.type, row.userType, row.role].map((value) => String(value || "").toLowerCase()).join(" ");
  return /group|chatroom|群/.test(marker) || (Number.isFinite(Number(row.memberCount)) && Number(row.memberCount) > 0) || String(row.userName || "").endsWith("@chatroom") ? "group" : "friend";
}

function parseHistory(value) {
  if (value && !Array.isArray(value) && typeof value === "object") return { header: value, messages: [] };
  if (typeof value !== "string") throw safeError("MCP_SCHEMA_INVALID");
  const lines = value.split(/\r?\n/).filter(Boolean);
  if (!lines.length) throw safeError("MCP_SCHEMA_INVALID");
  try {
    const parsed = lines.map((line) => JSON.parse(line));
    if (!parsed[0] || Array.isArray(parsed[0]) || typeof parsed[0] !== "object") throw new Error("header");
    if (parsed.slice(1).some((item) => !item || Array.isArray(item) || typeof item !== "object")) throw new Error("message");
    return { header: parsed[0], messages: parsed.slice(1) };
  } catch (error) {
    if (SAFE_CODES.has(error?.code)) throw error;
    throw safeError("MCP_SCHEMA_INVALID");
  }
}

const TEXT_TYPES = new Set(["text", "notify", "revoke", "pat", "sound", "voice"]);
const FIXED_MEDIA = Object.freeze({ image: "图片（未下载）", file: "文件（未下载）", video: "视频（未下载）", location: "位置（未保存详情）", redpacket: "红包（未保存详情）", transfer: "转账（未保存详情）" });
function projectMessage(message) {
  if (typeof message.id !== "string" || !message.id || !(typeof message.t === "string" || typeof message.t === "number")) throw safeError("MCP_SCHEMA_INVALID");
  const messageType = String(message.type || "text").toLowerCase();
  let text;
  if (TEXT_TYPES.has(messageType)) text = typeof message.content === "string" && message.content ? message.content : `${messageType === "text" ? "文字" : "消息"}（无可读文字）`;
  else text = FIXED_MEDIA[messageType] || "其他消息（未下载）";
  return { rawId: message.id, timestamp: message.t, direction: message.from === "sales" ? "sales" : message.from === "customer" ? "customer" : "unknown", messageType, kind: TEXT_TYPES.has(messageType) ? "chat-text" : "media-description", text };
}

const coverageMetric = (value, state, reason = "") => ({ value, state, ...(reason ? { reason } : {}) });
const coverageMetrics = ({ friends, directConversations, directMessages, groupConversations, groupMessages, moments }) => ({
  friends,
  directConversations,
  directMessages,
  groupConversations,
  groupMessages,
  moments,
});
const blockedMomentsMetric = () => coverageMetric(null, "blocked", LOCAL_MOMENTS_REASON);

export function createSuiyinMcpClient({ transport, now = () => new Date().toISOString(), maxPages = DEFAULT_MAX_PAGES, expectedEnvironment = "fictional-sandbox" } = {}) {
  if (!transport || typeof transport.request !== "function" || safeEnvironmentName(expectedEnvironment) !== expectedEnvironment) throw safeError("MCP_UNAVAILABLE");
  let initialization = null;
  const initialize = async () => {
    if (!initialization) initialization = (async () => {
      await transport.request("initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "relationship-today", version: "1" } });
      await transport.notify?.("notifications/initialized", {});
      const listed = await transport.request("tools/list", {});
      if (!Array.isArray(listed?.tools)) throw safeError("MCP_SCHEMA_INVALID");
      return discoverReadTools(listed.tools);
    })();
    return initialization;
  };

  const callTool = async (name, args = {}) => {
    try {
      const discovery = await initialize();
      if (!discovery.allowedTools.has(name)) throw safeError("MCP_TOOL_FORBIDDEN");
      return decodeToolResult(await transport.request("tools/call", { name, arguments: args }));
    } catch (error) {
      if (SAFE_CODES.has(error?.code)) throw error;
      throw safeError("MCP_UPSTREAM_FAILED");
    }
  };

  const requireEnvironment = async (toolName = "current_environment") => {
    const environment = environmentName(await callTool(toolName, {}));
    if (environment !== expectedEnvironment) throw safeError("MCP_ENVIRONMENT_MISMATCH");
    return environment;
  };

  const collectPersonaComplete = async (discovery) => {
    const schemaError = () => safeError("LOCAL_SUIYIN_ADAPTER_SCHEMA_INVALID");
    const paginationError = () => safeError("LOCAL_SUIYIN_PAGINATION_INCOMPLETE");
    const completenessError = () => safeError("LOCAL_SUIYIN_COMPLETENESS_INCOMPLETE");
    const exactObject = (value) => {
      if (!value || Array.isArray(value) || typeof value !== "object") throw schemaError();
      return value;
    };
    const pageSizeFor = (tool) => {
      const schema = toolProperties(tool).pageSize;
      if (!schema || schema.type !== "integer") throw schemaError();
      const minimum = Number.isInteger(schema.minimum) ? schema.minimum : 1;
      const maximum = Number.isInteger(schema.maximum) ? schema.maximum : MAX_PAGE_SIZE;
      if (minimum < 1 || maximum < minimum) throw schemaError();
      return Math.min(MAX_PAGE_SIZE, maximum);
    };
    const sameStrings = (actual, expected) => Array.isArray(actual)
      && actual.length === expected.length
      && actual.every((value) => typeof value === "string")
      && [...actual].sort().every((value, index) => value === [...expected].sort()[index]);
    const validatePageEnvelope = ({ payload, requestedPage, requestedPageSize, expectedTotal, expectedSnapshot }) => {
      if (!Array.isArray(payload.rows)
        || !Number.isInteger(payload.total) || payload.total < 0
        || !Number.isInteger(payload.page) || payload.page !== requestedPage
        || !Number.isInteger(payload.pageSize) || payload.pageSize !== requestedPageSize
        || payload.rows.length > requestedPageSize
        || typeof payload.hasMore !== "boolean"
        || typeof payload.snapshotToken !== "string" || !payload.snapshotToken) throw schemaError();
      if ((expectedTotal !== null && payload.total !== expectedTotal)
        || (expectedSnapshot !== null && payload.snapshotToken !== expectedSnapshot)) throw paginationError();
      if (payload.hasMore) {
        if (!payload.rows.length || !Number.isInteger(payload.nextPage) || payload.nextPage !== requestedPage + 1) throw paginationError();
        if (payload.scopeComplete !== false) throw completenessError();
      } else {
        if (payload.nextPage !== null) throw paginationError();
        if (payload.scopeComplete !== true) throw completenessError();
      }
    };

    const environment = await requireEnvironment(discovery.tools.environment.name);
    const sourceAccountLabels = new Map();
    const sourceAccountWechatSourceLinks = new Map();
    const wechatSourceIdByAlias = new Map();
    const rawIdentifiers = new Set();
    const observeRawIdentifier = (value) => {
      if (typeof value !== "string" || !value) return;
      const normalized = value.normalize("NFKC").trim();
      if (normalized) rawIdentifiers.add(normalized);
    };
    const observeSourceAccount = (clientId, clientName, clientWcId = "") => {
      if (typeof clientId !== "string" || !clientId || typeof clientWcId !== "string") throw schemaError();
      observeRawIdentifier(clientId);
      observeRawIdentifier(clientWcId);
      const alias = stableSuiyinAccountAlias({ environment, clientId });
      const label = normalizeSuiyinSystemName(clientName, clientId);
      if (!sourceAccountLabels.has(alias)) sourceAccountLabels.set(alias, label);
      else {
        const prior = sourceAccountLabels.get(alias);
        if (prior === null && label !== null) sourceAccountLabels.set(alias, label);
        else if (prior !== null && label !== null && prior !== label) throw safeError("SUIYIN_ACCOUNT_LABEL_CONFLICT");
      }
      if (clientWcId) {
        const wechatSourceId = stableWechatExportSourceId(clientWcId);
        const priorAlias = sourceAccountWechatSourceLinks.get(wechatSourceId);
        const priorWechatSourceId = wechatSourceIdByAlias.get(alias);
        if ((priorAlias !== undefined && priorAlias !== alias)
          || (priorWechatSourceId !== undefined && priorWechatSourceId !== wechatSourceId)) throw safeError("SUIYIN_SOURCE_LINK_CONFLICT");
        sourceAccountWechatSourceLinks.set(wechatSourceId, alias);
        wechatSourceIdByAlias.set(alias, wechatSourceId);
      }
      return alias;
    };

    const rosterPayload = await callTool(discovery.tools.personas.name, { status: "all" });
    if (!Array.isArray(rosterPayload)) throw schemaError();
    if (rosterPayload.length !== 3) throw completenessError();
    const personaByClientId = new Map();
    const personaByWcId = new Map();
    const rosterOfficialLabels = new Set();
    for (const row of rosterPayload) {
      if (!row || Array.isArray(row) || typeof row !== "object"
        || typeof row.id !== "string" || !row.id
        || typeof row.name !== "string"
        || typeof row.nickName !== "string"
        || typeof row.wcId !== "string" || !row.wcId
        || typeof row.online_status !== "string"
        || personaByClientId.has(row.id) || personaByWcId.has(row.wcId)) throw schemaError();
      const officialLabel = normalizeSuiyinSystemName(row.name, row.id);
      if (!officialLabel || rosterOfficialLabels.has(officialLabel)) throw safeError("SUIYIN_ACCOUNT_LABEL_INVALID");
      rosterOfficialLabels.add(officialLabel);
      observeSourceAccount(row.id, row.name, row.wcId);
      const persona = {
        clientId: row.id,
        wcId: row.wcId,
        officialLabel,
        customerIds: new Set(),
        friendIds: new Set(),
        groupIds: new Set(),
        messageIds: new Set(),
        directMessageIds: new Set(),
        groupMessageIds: new Set(),
        momentIds: new Set(),
      };
      personaByClientId.set(row.id, persona);
      personaByWcId.set(row.wcId, persona);
    }

    const cohortPageSize = pageSizeFor(discovery.tools.cohort);
    const customers = new Map();
    for (const persona of personaByClientId.values()) {
      let requestedPage = 1;
      let expectedTotal = null;
      let expectedSnapshot = null;
      const seenCustomerIds = new Set();
      const seenPages = new Set();
      let closed = false;
      for (let turn = 1; turn <= maxPages; turn += 1) {
        if (seenPages.has(requestedPage)) throw paginationError();
        seenPages.add(requestedPage);
        const payload = exactObject(await callTool(discovery.tools.cohort.name, {
          environment,
          wcIds: [persona.wcId],
          page: requestedPage,
          pageSize: cohortPageSize,
        }));
        validatePageEnvelope({ payload, requestedPage, requestedPageSize: cohortPageSize, expectedTotal, expectedSnapshot });
        if (!sameStrings(payload.appliedWcIds, [persona.wcId])) throw safeError("LOCAL_SUIYIN_APPLIED_SCOPE_INVALID");
        if (expectedTotal === null) expectedTotal = payload.total;
        if (expectedSnapshot === null) expectedSnapshot = payload.snapshotToken;
        for (const row of payload.rows) {
          if (!row || Array.isArray(row) || typeof row !== "object") throw schemaError();
          const upstreamId = typeof row.id === "string" && row.id ? row.id : typeof row.customerId === "string" && row.customerId ? row.customerId : "";
          if (!upstreamId || seenCustomerIds.has(upstreamId)) throw paginationError();
          seenCustomerIds.add(upstreamId);
          observeRawIdentifier(upstreamId);
          const tuples = personaTuples(row);
          if (!tuples.length) throw safeError("LOCAL_SUIYIN_APPLIED_SCOPE_INVALID");
          let requestedPersonaObserved = false;
          const clientIds = [];
          for (const tuple of tuples) {
            const configured = personaByClientId.get(tuple.clientId);
            if (!configured || tuple.clientWcId !== configured.wcId) throw safeError("LOCAL_SUIYIN_APPLIED_SCOPE_INVALID");
            if (tuple.clientId === persona.clientId && tuple.clientWcId === persona.wcId) requestedPersonaObserved = true;
            observeSourceAccount(tuple.clientId, tuple.clientName, tuple.clientWcId);
            clientIds.push(tuple.clientId);
          }
          if (!requestedPersonaObserved) throw safeError("LOCAL_SUIYIN_APPLIED_SCOPE_INVALID");
          const name = displayName(row);
          if (!name) throw completenessError();
          const kind = customerKind(row);
          const prior = customers.get(upstreamId);
          if (!prior) customers.set(upstreamId, {
            upstreamId,
            name,
            kind,
            clientIds: new Set(clientIds),
            personaIds: new Set([persona.clientId]),
          });
          else {
            if (prior.name !== name || prior.kind !== kind) throw schemaError();
            for (const clientId of clientIds) prior.clientIds.add(clientId);
            prior.personaIds.add(persona.clientId);
          }
          persona.customerIds.add(upstreamId);
        }
        if (!payload.hasMore) {
          if (seenCustomerIds.size !== payload.total) throw completenessError();
          closed = true;
          break;
        }
        if (seenCustomerIds.size >= payload.total) throw paginationError();
        requestedPage = payload.nextPage;
      }
      if (!closed || expectedTotal === null || seenCustomerIds.size !== expectedTotal) throw completenessError();
    }

    const sourceIds = await stableSuiyinIds({ environment });
    const historyPageSize = pageSizeFor(discovery.tools.history);
    const people = [];
    const mappings = [];
    const excerpts = [];
    const signals = [];
    const friendIdentityByUpstreamId = new Map();
    const seenMessages = new Map();
    for (const customer of customers.values()) {
      const ids = await stableSuiyinIds({ environment, customerId: customer.upstreamId });
      const sourceAccountAliases = new Set([...customer.clientIds].map((clientId) => stableSuiyinAccountAlias({ environment, clientId })));
      const localExcerpts = [];
      const localSignals = [];
      for (const personaId of [...customer.personaIds].sort()) {
        const persona = personaByClientId.get(personaId);
        if (!persona) throw safeError("LOCAL_SUIYIN_APPLIED_SCOPE_INVALID");
        let requestedPage = 1;
        let expectedTotal = null;
        let expectedSnapshot = null;
        const seenHistoryIds = new Set();
        const seenPages = new Set();
        let closed = false;
        for (let turn = 1; turn <= maxPages; turn += 1) {
          if (seenPages.has(requestedPage)) throw paginationError();
          seenPages.add(requestedPage);
          const payload = exactObject(await callTool(discovery.tools.history.name, {
            environment,
            customerId: customer.upstreamId,
            wcId: persona.wcId,
            page: requestedPage,
            pageSize: historyPageSize,
          }));
          validatePageEnvelope({ payload, requestedPage, requestedPageSize: historyPageSize, expectedTotal, expectedSnapshot });
          if (payload.appliedCustomerId !== customer.upstreamId || payload.appliedWcId !== persona.wcId) throw safeError("LOCAL_SUIYIN_APPLIED_SCOPE_INVALID");
          if (expectedTotal === null) expectedTotal = payload.total;
          if (expectedSnapshot === null) expectedSnapshot = payload.snapshotToken;
          for (const raw of payload.rows) {
            const projected = projectMessage(raw);
            if (seenHistoryIds.has(projected.rawId)) throw paginationError();
            seenHistoryIds.add(projected.rawId);
            observeRawIdentifier(projected.rawId);
            const stable = await stableSuiyinIds({ environment, customerId: customer.upstreamId, clientId: persona.clientId, messageId: projected.rawId });
            const signature = JSON.stringify(projected);
            if (seenMessages.has(stable.messageId) && seenMessages.get(stable.messageId) !== signature) throw schemaError();
            if (seenMessages.has(stable.messageId)) continue;
            seenMessages.set(stable.messageId, signature);
            persona.messageIds.add(stable.messageId);
            (customer.kind === "group" ? persona.groupMessageIds : persona.directMessageIds).add(stable.messageId);
            const base = { id: stable.messageId, sourceId: sourceIds.sourceId, kind: projected.kind, text: projected.text, timestamp: projected.timestamp, direction: projected.direction, messageType: projected.messageType };
            if (customer.kind === "group") localSignals.push({ ...base, status: "internal", thirdParty: true, kind: "group_context", contextId: ids.contextId, contextLabel: customer.name });
            else localExcerpts.push({ ...base, personId: ids.personId });
          }
          if (!payload.hasMore) {
            if (seenHistoryIds.size !== payload.total) throw completenessError();
            closed = true;
            break;
          }
          if (seenHistoryIds.size >= payload.total) throw paginationError();
          requestedPage = payload.nextPage;
        }
        if (!closed || expectedTotal === null || seenHistoryIds.size !== expectedTotal) throw completenessError();
      }
      if (customer.kind === "group") {
        signals.push(...localSignals);
        for (const personaId of customer.personaIds) personaByClientId.get(personaId).groupIds.add(ids.contextId);
      } else {
        const person = { id: ids.personId, name: customer.name, state: "pending", sourceScoped: true };
        const mapping = { id: `${sourceIds.sourceId}:${ids.personId}`, sourceId: sourceIds.sourceId, sourcePersonId: ids.personId, personId: ids.personId, sourceDisplayName: customer.name, sourceAccountAliases: [...sourceAccountAliases].sort(), status: "pending" };
        people.push(person);
        mappings.push(mapping);
        friendIdentityByUpstreamId.set(customer.upstreamId, { customer, person, mapping });
        excerpts.push(...localExcerpts);
        for (const personaId of customer.personaIds) personaByClientId.get(personaId).friendIds.add(ids.personId);
      }
    }

    const aggregateMomentIds = new Set();
    let momentsMapped = false;
    if (discovery.tools.moments) {
      const momentsSchemaError = () => safeError("LOCAL_SUIYIN_MOMENTS_SCHEMA_INVALID");
      const momentsDuplicateError = () => safeError("LOCAL_SUIYIN_MOMENTS_DUPLICATE_ID");
      const momentsScopeError = () => safeError("LOCAL_SUIYIN_MOMENTS_SCOPE_INVALID");
      const momentsPaginationError = () => safeError("LOCAL_SUIYIN_MOMENTS_PAGINATION_INCOMPLETE");
      const momentsCompletenessError = () => safeError("LOCAL_SUIYIN_MOMENTS_COMPLETENESS_INCOMPLETE");
      const momentsPersonaError = () => safeError("LOCAL_SUIYIN_MOMENTS_PERSONA_INVALID");
      const momentsPublisherError = () => safeError("LOCAL_SUIYIN_MOMENTS_PUBLISHER_INVALID");
      let momentsPageSize;
      try { momentsPageSize = pageSizeFor(discovery.tools.moments); }
      catch { throw momentsSchemaError(); }
      const validateMomentsPage = ({ payload, requestedPage, expectedTotal, expectedSnapshot }) => {
        if (!payload || Array.isArray(payload) || typeof payload !== "object"
          || !Array.isArray(payload.rows)
          || !Number.isInteger(payload.total) || payload.total < 0
          || !Number.isInteger(payload.page) || payload.page !== requestedPage
          || !Number.isInteger(payload.pageSize) || payload.pageSize !== momentsPageSize
          || payload.rows.length > momentsPageSize
          || typeof payload.hasMore !== "boolean"
          || typeof payload.snapshotToken !== "string" || !payload.snapshotToken) throw momentsSchemaError();
        if ((expectedTotal !== null && payload.total !== expectedTotal)
          || (expectedSnapshot !== null && payload.snapshotToken !== expectedSnapshot)) throw momentsPaginationError();
        if (payload.hasMore) {
          if (!payload.rows.length || !Number.isInteger(payload.nextPage) || payload.nextPage !== requestedPage + 1) throw momentsPaginationError();
          if (payload.scopeComplete !== false) throw momentsCompletenessError();
        } else {
          if (payload.nextPage !== null) throw momentsPaginationError();
          if (payload.scopeComplete !== true) throw momentsCompletenessError();
        }
      };
      for (const persona of personaByClientId.values()) {
        let requestedPage = 1;
        let expectedTotal = null;
        let expectedSnapshot = null;
        const seenMomentIds = new Set();
        const seenPages = new Set();
        let closed = false;
        for (let turn = 1; turn <= maxPages; turn += 1) {
          if (seenPages.has(requestedPage)) throw momentsPaginationError();
          seenPages.add(requestedPage);
          const payload = await callTool(discovery.tools.moments.name, {
            environment,
            wcIds: [persona.wcId],
            page: requestedPage,
            pageSize: momentsPageSize,
          });
          validateMomentsPage({ payload, requestedPage, expectedTotal, expectedSnapshot });
          if (!sameStrings(payload.appliedWcIds, [persona.wcId])) throw momentsScopeError();
          if (expectedTotal === null) expectedTotal = payload.total;
          if (expectedSnapshot === null) expectedSnapshot = payload.snapshotToken;
          for (const row of payload.rows) {
            if (!row || Array.isArray(row) || typeof row !== "object") throw momentsSchemaError();
            const upstreamMomentId = typeof row.id === "string" && row.id ? row.id : typeof row.momentId === "string" && row.momentId ? row.momentId : "";
            if (!upstreamMomentId) throw momentsSchemaError();
            if (seenMomentIds.has(upstreamMomentId)) throw momentsDuplicateError();
            seenMomentIds.add(upstreamMomentId);
            observeRawIdentifier(upstreamMomentId);
            const stableMomentId = hash(`suiyin-moment/v1\0${environment}\0${upstreamMomentId}`);
            if (aggregateMomentIds.has(stableMomentId)) throw momentsDuplicateError();
            if (typeof row.personaId !== "string" || !row.personaId
              || typeof row.personaWcId !== "string" || !row.personaWcId
              || typeof row.personaLabel !== "string" || !row.personaLabel
              || row.personaId !== persona.clientId || row.personaWcId !== persona.wcId) throw momentsPersonaError();
            let exactPersonaLabel;
            try { exactPersonaLabel = normalizeSuiyinSystemName(row.personaLabel, row.personaId); }
            catch { throw momentsPersonaError(); }
            if (exactPersonaLabel !== persona.officialLabel) throw momentsPersonaError();
            if (!(typeof row.publishedAt === "string" || typeof row.publishedAt === "number")
              || !(typeof row.body === "string" || row.body === null)
              || !(typeof row.mediaDescription === "string" || row.mediaDescription === null)) throw momentsSchemaError();
            if (typeof row.publisherId !== "string" || !row.publisherId || typeof row.publisherName !== "string") throw momentsPublisherError();
            const publisherLabel = safeDisplayName(row.publisherName);
            const publishedAt = normalizeMomentPublishedAt(row.publishedAt);
            const publisherIdentity = friendIdentityByUpstreamId.get(row.publisherId);
            if (!publisherIdentity
              || publisherIdentity.customer.kind !== "friend"
              || !publisherIdentity.customer.personaIds.has(persona.clientId)
              || !publisherIdentity.customer.clientIds.has(persona.clientId)
              || !persona.customerIds.has(row.publisherId)
              || !publisherLabel
              || publisherLabel !== publisherIdentity.customer.name) throw momentsPublisherError();
            observeRawIdentifier(row.publisherId);
            const sourceAccountAlias = stableSuiyinAccountAlias({ environment, clientId: persona.clientId });
            if (!publisherIdentity.mapping.sourceAccountAliases.includes(sourceAccountAlias)) throw momentsPublisherError();
            persona.momentIds.add(stableMomentId);
            aggregateMomentIds.add(stableMomentId);
            signals.push({
              id: stableMomentId,
              sourceId: sourceIds.sourceId,
              personId: publisherIdentity.person.id,
              status: "pending",
              kind: "moment",
              text: row.body || "",
              ...(row.mediaDescription ? { mediaDescription: row.mediaDescription } : {}),
              publishedAt,
              sourceAccountAlias,
            });
          }
          if (!payload.hasMore) {
            if (seenMomentIds.size !== payload.total) throw momentsCompletenessError();
            closed = true;
            break;
          }
          if (seenMomentIds.size >= payload.total) throw momentsPaginationError();
          requestedPage = payload.nextPage;
        }
        if (!closed || expectedTotal === null || seenMomentIds.size !== expectedTotal) throw momentsCompletenessError();
      }
      momentsMapped = true;
    }

    await requireEnvironment(discovery.tools.environment.name);
    const perPersona = [...personaByClientId.values()]
      .map((persona) => ({
        officialLabel: persona.officialLabel,
        friendCount: persona.friendIds.size,
        groupCount: persona.groupIds.size,
        messageCount: persona.messageIds.size,
        unreadableCount: 0,
        failureCount: 0,
        complete: true,
      }))
      .sort((left, right) => left.officialLabel < right.officialLabel ? -1 : left.officialLabel > right.officialLabel ? 1 : 0);
    const coveragePerPersona = [...personaByClientId.values()]
      .map((persona) => ({
        officialLabel: persona.officialLabel,
        metrics: coverageMetrics({
          friends: coverageMetric(persona.friendIds.size, "exact"),
          directConversations: coverageMetric(persona.friendIds.size, "exact"),
          directMessages: coverageMetric(persona.directMessageIds.size, "exact"),
          groupConversations: coverageMetric(persona.groupIds.size, "exact"),
          groupMessages: coverageMetric(persona.groupMessageIds.size, "exact"),
          moments: momentsMapped ? coverageMetric(persona.momentIds.size, "exact") : blockedMomentsMetric(),
        }),
      }))
      .sort((left, right) => left.officialLabel < right.officialLabel ? -1 : left.officialLabel > right.officialLabel ? 1 : 0);
    const friendCount = [...customers.values()].filter((customer) => customer.kind === "friend").length;
    const groupCount = customers.size - friendCount;
    const groupMessageCount = signals.filter((signal) => signal.kind === "group_context").length;
    const coverageReceipt = {
      version: 1,
      scopeKind: "suiyin-persona-complete-v1",
      scopeComplete: true,
      metrics: coverageMetrics({
        friends: coverageMetric(friendCount, "exact"),
        directConversations: coverageMetric(friendCount, "exact"),
        directMessages: coverageMetric(excerpts.length, "exact"),
        groupConversations: coverageMetric(groupCount, "exact"),
        groupMessages: coverageMetric(groupMessageCount, "exact"),
        moments: momentsMapped ? coverageMetric(aggregateMomentIds.size, "exact") : blockedMomentsMetric(),
      }),
      excludedCount: 0,
      perPersona: coveragePerPersona,
    };
    const adapterReceipt = { appliedScope: true, paginationComplete: true, completenessComplete: true };
    const aggregate = {
      personaDeclaredCount: rosterPayload.length,
      personaReadCount: personaByClientId.size,
      allocationCount: 0,
      allocationDeclaredCount: 0,
      allocationMissingCount: 0,
      customerCount: customers.size,
      friendCount,
      groupCount,
      messageCount: excerpts.length + groupMessageCount,
      unreadableCount: 0,
      failureCount: 0,
      missingDisplayNameCount: 0,
      excludedCount: 0,
      perPersona,
      scopeKind: "persona-complete-v1",
      scopeComplete: true,
      adapterReceipt,
      coverageReceipt,
    };
    const staging = {
      ok: true,
      formalWriteCount: 0,
      source: {
        id: sourceIds.sourceId,
        state: "active",
        displayName: "碎银",
        sourceKind: "suiyin-mcp",
        environment,
        sourceAccountLabels: Object.fromEntries([...sourceAccountLabels.entries()].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)),
        sourceAccountWechatSourceLinks: Object.fromEntries([...sourceAccountWechatSourceLinks.entries()].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)),
        importedAt: now(),
        ...aggregate,
        momentsUnsupported: !momentsMapped,
        attachmentsUnsupported: true,
      },
      people,
      mappings,
      excerpts,
      signals,
      aggregate,
      unsupported: { moments: !momentsMapped, attachments: true },
    };
    const containsRawIdentifier = (value) => {
      if (typeof value === "string") {
        const normalized = value.normalize("NFKC");
        if (rawIdentifiers.has(normalized.trim())) return true;
        return [...rawIdentifiers].some((identifier) => identifier.length >= 8 && normalized.includes(identifier));
      }
      if (Array.isArray(value)) return value.some(containsRawIdentifier);
      if (!value || typeof value !== "object") return false;
      return Object.entries(value).some(([key, nested]) => containsRawIdentifier(key) || containsRawIdentifier(nested));
    };
    if (containsRawIdentifier(staging)) throw schemaError();
    return staging;
  };

  const collectImport = async () => {
    try {
      const discovery = await initialize();
      if (discovery.mode === "persona-complete") return await collectPersonaComplete(discovery);
      const environment = await requireEnvironment(discovery.tools.environment.name);
      const sourceAccountLabels = new Map();
      const sourceAccountWechatSourceLinks = new Map();
      const wechatSourceIdByAlias = new Map();
      const rawClientIdentifiers = new Set();
      const observeRawClientIdentifier = (value) => {
        if (typeof value !== "string" || !value) return;
        const normalized = value.normalize("NFKC").trim();
        if (normalized) rawClientIdentifiers.add(normalized);
      };
      const observeSourceAccount = (clientId, clientName, clientWcId = "") => {
        if (clientWcId !== undefined && clientWcId !== null && typeof clientWcId !== "string") throw safeError("MCP_SCHEMA_INVALID");
        observeRawClientIdentifier(clientWcId);
        if (typeof clientId !== "string" || !clientId) return null;
        observeRawClientIdentifier(clientId);
        const alias = stableSuiyinAccountAlias({ environment, clientId });
        const label = normalizeSuiyinSystemName(clientName, clientId);
        if (!sourceAccountLabels.has(alias)) sourceAccountLabels.set(alias, label);
        else {
          const prior = sourceAccountLabels.get(alias);
          if (prior === null && label !== null) sourceAccountLabels.set(alias, label);
          else if (prior !== null && label !== null && prior !== label) throw safeError("SUIYIN_ACCOUNT_LABEL_CONFLICT");
        }
        if (clientWcId) {
          const wechatSourceId = stableWechatExportSourceId(clientWcId);
          const priorAlias = sourceAccountWechatSourceLinks.get(wechatSourceId);
          const priorWechatSourceId = wechatSourceIdByAlias.get(alias);
          if ((priorAlias !== undefined && priorAlias !== alias) || (priorWechatSourceId !== undefined && priorWechatSourceId !== wechatSourceId)) throw safeError("SUIYIN_SOURCE_LINK_CONFLICT");
          sourceAccountWechatSourceLinks.set(wechatSourceId, alias);
          wechatSourceIdByAlias.set(alias, wechatSourceId);
        }
        return alias;
      };
      const rosterPayload = await callTool("list_personas", { status: "all" });
      if (!Array.isArray(rosterPayload) || rosterPayload.length !== 3) throw safeError("MCP_SCHEMA_INVALID");
      const personaByClientId = new Map();
      const rosterOfficialLabels = new Set();
      for (const row of rosterPayload) {
        if (!row || Array.isArray(row) || typeof row !== "object"
          || typeof row.id !== "string" || !row.id
          || typeof row.name !== "string"
          || typeof row.nickName !== "string"
          || typeof row.wcId !== "string" || !row.wcId
          || typeof row.online_status !== "string"
          || personaByClientId.has(row.id)) throw safeError("MCP_SCHEMA_INVALID");
        const officialLabel = normalizeSuiyinSystemName(row.name, row.id);
        if (!officialLabel || rosterOfficialLabels.has(officialLabel)) throw safeError("SUIYIN_ACCOUNT_LABEL_INVALID");
        rosterOfficialLabels.add(officialLabel);
        observeSourceAccount(row.id, row.name, row.wcId);
        personaByClientId.set(row.id, {
          officialLabel,
          friendIds: new Set(),
          groupIds: new Set(),
          messageIds: new Set(),
          directMessageIds: new Set(),
          groupMessageIds: new Set(),
        });
      }
      let allocations = null;
      let allocationDeclaredCount = null;
      let partialCandidate = null;
      let partialSignature = null;
      let partialObservationCount = 0;
      let partialDrift = false;
      for (let attempt = 1; attempt <= MAX_ALLOCATION_ATTEMPTS && !allocations; attempt += 1) {
        const candidate = new Map();
        let frozenTotal = null;
        let partialEligible = false;
        let stableSnapshot = true;
        for (let page = 1; page <= maxPages; page += 1) {
          const payload = objectPayload(await callTool("list_allocations", { page, page_size: MAX_PAGE_SIZE }));
          if (!Array.isArray(payload.data) || !Number.isInteger(payload.total) || payload.total < 0) throw safeError("MCP_SCHEMA_INVALID");
          if (frozenTotal === null) frozenTotal = payload.total;
          else if (payload.total !== frozenTotal) { stableSnapshot = false; break; }
          const sizeBeforePage = candidate.size;
          for (const row of payload.data) {
            if (!row || typeof row.id !== "string" || !row.id) throw safeError("MCP_SCHEMA_INVALID");
            observeRawClientIdentifier(row.id);
            if (!candidate.has(row.id)) candidate.set(row.id, { id: row.id, nickname: typeof row.nickname === "string" ? row.nickname : "" });
          }
          if (candidate.size === frozenTotal) { allocations = candidate; allocationDeclaredCount = frozenTotal; break; }
          if (candidate.size > frozenTotal) { stableSnapshot = false; break; }
          if (!payload.data.length || candidate.size === sizeBeforePage) { partialEligible = candidate.size > 0; break; }
          if (page === maxPages) break;
        }
        if (!allocations && stableSnapshot && partialEligible && frozenTotal !== null && candidate.size < frozenTotal) {
          const signature = JSON.stringify({
            declaredCount: frozenTotal,
            rows: [...candidate.values()].map(({ id, nickname }) => ({ id, nickname })).sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0),
          });
          partialObservationCount += 1;
          if (partialSignature === null) {
            partialSignature = signature;
            partialCandidate = { candidate, declaredCount: frozenTotal };
          } else if (signature !== partialSignature) partialDrift = true;
        }
      }
      if (!allocations && partialCandidate && !partialDrift && partialObservationCount === MAX_ALLOCATION_ATTEMPTS) {
        allocations = partialCandidate.candidate;
        allocationDeclaredCount = partialCandidate.declaredCount;
      }
      if (!allocations) throw safeError("MCP_CURSOR_INVALID");
      const frozenIds = [...allocations.keys()];
      const allocationMissingCount = allocationDeclaredCount - frozenIds.length;
      const customers = new Map();
      let excludedCount = allocationMissingCount;
      for (let offset = 0; offset < frozenIds.length; offset += MAX_PAGE_SIZE) {
        const ids = frozenIds.slice(offset, offset + MAX_PAGE_SIZE);
        let frozenSearchTotal = null;
        let frozenSearchLimit = null;
        let collectedRows = 0;
        const pageSignatures = new Set();
        const seenSearchRows = new Set();
        for (let page = 1; page <= maxPages; page += 1) {
          const payload = objectPayload(await callTool("search_customer", { ids, page, page_size: MAX_PAGE_SIZE, verbose: false }));
          if (!Array.isArray(payload.data) || !Number.isInteger(payload.total) || payload.total < 0 || !Number.isInteger(payload.page) || !Number.isInteger(payload.limit)) throw safeError("MCP_SCHEMA_INVALID");
          const completeZeroPage = page === 1 && payload.page === 0 && payload.limit === 0;
          if (completeZeroPage) {
            if (payload.data.length !== payload.total) throw safeError("MCP_CURSOR_INVALID");
          } else {
            if (payload.page < 1 || payload.limit < 1 || payload.limit > MAX_PAGE_SIZE || payload.data.length > payload.limit) throw safeError("MCP_SCHEMA_INVALID");
            if (payload.page !== page) throw safeError("MCP_CURSOR_INVALID");
          }
          if (frozenSearchTotal === null) {
            frozenSearchTotal = payload.total;
            frozenSearchLimit = payload.limit;
          } else if (payload.total !== frozenSearchTotal || payload.limit !== frozenSearchLimit) throw safeError("MCP_CURSOR_INVALID");
          if (collectedRows + payload.data.length > frozenSearchTotal) throw safeError("MCP_CURSOR_INVALID");
          const pageSignature = hash(JSON.stringify(payload.data));
          if (pageSignatures.has(pageSignature)) throw safeError("MCP_CURSOR_INVALID");
          pageSignatures.add(pageSignature);
          let uniqueRowsOnPage = 0;
          for (const row of payload.data) {
            const upstreamId = typeof row?.id === "string" && row.id ? row.id : typeof row?.customerId === "string" ? row.customerId : "";
            if (!upstreamId || !allocations.has(upstreamId)) { excludedCount += 1; continue; }
            const name = displayName(row, allocations.get(upstreamId).nickname);
            const tuples = personaTuples(row);
            const tupleReceipt = [];
            for (const tuple of tuples) {
              const alias = observeSourceAccount(tuple.clientId, tuple.clientName, tuple.clientWcId);
              tupleReceipt.push({ alias, officialLabel: sourceAccountLabels.get(alias), wechatSourceId: tuple.clientWcId ? stableWechatExportSourceId(tuple.clientWcId) : "" });
            }
            const kind = customerKind(row);
            const rowSignature = hash(JSON.stringify({ upstreamId, name, kind, tupleReceipt }));
            if (!seenSearchRows.has(rowSignature)) {
              seenSearchRows.add(rowSignature);
              uniqueRowsOnPage += 1;
            }
            const minimal = { upstreamId, name, kind, clientIds: tuples.map((tuple) => tuple.clientId) };
            const prior = customers.get(upstreamId);
            if (prior) {
              if (prior.kind !== minimal.kind) throw safeError("MCP_SCHEMA_INVALID");
              if (prior.name && minimal.name && prior.name !== minimal.name) throw safeError("MCP_SCHEMA_INVALID");
              if (!prior.name && minimal.name) prior.name = minimal.name;
              for (const clientId of minimal.clientIds) if (!prior.clientIds.includes(clientId)) prior.clientIds.push(clientId);
            } else customers.set(upstreamId, minimal);
          }
          if (page > 1 && uniqueRowsOnPage === 0) throw safeError("MCP_CURSOR_INVALID");
          collectedRows += payload.data.length;
          if (collectedRows === frozenSearchTotal) break;
          if (!payload.data.length || page === maxPages) throw safeError("MCP_CURSOR_INVALID");
        }
        if (frozenSearchTotal === null || collectedRows !== frozenSearchTotal) throw safeError("MCP_CURSOR_INVALID");
      }

      const sourceIds = await stableSuiyinIds({ environment });
      const people = [], mappings = [], excerpts = [], signals = [];
      const seenMessages = new Map();
      const isRawClientIdentifier = (value) => typeof value === "string" && rawClientIdentifiers.has(value.normalize("NFKC").trim());
      let friendCount = 0, groupCount = 0, messageCount = 0, missingDisplayNameCount = 0;
      for (const customerId of frozenIds) {
        const customer = customers.get(customerId);
        if (!customer) { excludedCount += 1; continue; }
        if (!customer.name || isRawClientIdentifier(customer.name)) {
          if (customer.kind !== "friend") throw safeError("MCP_SCHEMA_INVALID");
          missingDisplayNameCount += 1;
          excludedCount += 1;
          continue;
        }
        const ids = await stableSuiyinIds({ environment, customerId });
        const sourceAccountAliases = new Set(customer.clientIds.filter(Boolean).map((clientId) => stableSuiyinAccountAlias({ environment, clientId })));
        const observedClientIds = new Set(customer.clientIds.filter(Boolean));
        const localExcerpts = [], localSignals = [];
        const localMessagesByPersona = new Map();
        const historyClientIds = customer.clientIds.length ? [...customer.clientIds].sort() : [""];
        for (const requestedClientId of historyClientIds) {
          let cursor = "";
          const cursors = new Set();
          for (let page = 1; page <= maxPages; page += 1) {
            const args = { customer_id: customerId, size: MAX_PAGE_SIZE, ...(requestedClientId ? { client_id: requestedClientId } : {}), ...(cursor ? { last_message_id: cursor } : {}) };
            const { header, messages } = parseHistory(await callTool("get_message_history", args));
            const clientId = typeof header.client_id === "string" && header.client_id ? header.client_id : requestedClientId;
            if (!clientId) throw safeError("MCP_SCHEMA_INVALID");
            sourceAccountAliases.add(observeSourceAccount(clientId, null));
            observedClientIds.add(clientId);
            for (const raw of messages) {
              const projected = projectMessage(raw);
              const stable = await stableSuiyinIds({ environment, customerId, clientId, messageId: projected.rawId });
              const signature = JSON.stringify(projected);
              if (seenMessages.has(stable.messageId)) {
                if (seenMessages.get(stable.messageId) !== signature) throw safeError("MCP_SCHEMA_INVALID");
                continue;
              }
              seenMessages.set(stable.messageId, signature);
              const base = { id: stable.messageId, sourceId: sourceIds.sourceId, kind: projected.kind, text: projected.text, timestamp: projected.timestamp, direction: projected.direction, messageType: projected.messageType };
              if (customer.kind === "group") localSignals.push({ ...base, status: "internal", thirdParty: true, kind: "group_context", contextId: ids.contextId, contextLabel: customer.name });
              else localExcerpts.push({ ...base, personId: ids.personId });
              if (personaByClientId.has(clientId)) {
                if (!localMessagesByPersona.has(clientId)) localMessagesByPersona.set(clientId, new Set());
                localMessagesByPersona.get(clientId).add(stable.messageId);
              }
            }
            if (messages.length < MAX_PAGE_SIZE) break;
            const nextCursor = header.next_last_message_id;
            if (typeof nextCursor !== "string" || !nextCursor || cursors.has(nextCursor) || nextCursor === cursor) throw safeError("MCP_CURSOR_INVALID");
            cursors.add(nextCursor);
            cursor = nextCursor;
            if (page === maxPages) throw safeError("MCP_CURSOR_INVALID");
          }
        }
        if (isRawClientIdentifier(customer.name)) {
          if (customer.kind !== "friend") throw safeError("MCP_SCHEMA_INVALID");
          missingDisplayNameCount += 1;
          excludedCount += 1;
          continue;
        }
        if (customer.kind === "group") {
          groupCount += 1;
          signals.push(...localSignals);
        } else {
          friendCount += 1;
          people.push({ id: ids.personId, name: customer.name, state: "pending", sourceScoped: true });
          mappings.push({ id: `${sourceIds.sourceId}:${ids.personId}`, sourceId: sourceIds.sourceId, sourcePersonId: ids.personId, personId: ids.personId, sourceDisplayName: customer.name, sourceAccountAliases: [...sourceAccountAliases].sort(), status: "pending" });
          excerpts.push(...localExcerpts);
        }
        messageCount += localExcerpts.length + localSignals.length;
        for (const clientId of observedClientIds) {
          const persona = personaByClientId.get(clientId);
          if (!persona) continue;
          (customer.kind === "group" ? persona.groupIds : persona.friendIds).add(ids.personId);
        }
        for (const [clientId, stableMessageIds] of localMessagesByPersona) {
          const persona = personaByClientId.get(clientId);
          if (persona) for (const stableMessageId of stableMessageIds) {
            persona.messageIds.add(stableMessageId);
            (customer.kind === "group" ? persona.groupMessageIds : persona.directMessageIds).add(stableMessageId);
          }
        }
      }
      await requireEnvironment();
      const perPersona = [...personaByClientId.values()]
        .map((persona) => ({ officialLabel: persona.officialLabel, friendCount: persona.friendIds.size, groupCount: persona.groupIds.size, messageCount: persona.messageIds.size, unreadableCount: 0, failureCount: 0, complete: false }))
        .sort((left, right) => left.officialLabel < right.officialLabel ? -1 : left.officialLabel > right.officialLabel ? 1 : 0);
      const coveragePerPersona = [...personaByClientId.values()]
        .map((persona) => ({
          officialLabel: persona.officialLabel,
          metrics: coverageMetrics({
            friends: coverageMetric(persona.friendIds.size, "partial"),
            directConversations: coverageMetric(persona.friendIds.size, "partial"),
            directMessages: coverageMetric(persona.directMessageIds.size, "partial"),
            groupConversations: coverageMetric(persona.groupIds.size, "partial"),
            groupMessages: coverageMetric(persona.groupMessageIds.size, "partial"),
            moments: blockedMomentsMetric(),
          }),
        }))
        .sort((left, right) => left.officialLabel < right.officialLabel ? -1 : left.officialLabel > right.officialLabel ? 1 : 0);
      const coverageReceipt = {
        version: 1,
        scopeKind: "suiyin-current-allocation-partial-v1",
        scopeComplete: false,
        metrics: coverageMetrics({
          friends: coverageMetric(friendCount, "partial"),
          directConversations: coverageMetric(friendCount, "partial"),
          directMessages: coverageMetric(excerpts.length, "partial"),
          groupConversations: coverageMetric(groupCount, "partial"),
          groupMessages: coverageMetric(signals.length, "partial"),
          moments: blockedMomentsMetric(),
        }),
        excludedCount,
        perPersona: coveragePerPersona,
      };
      const aggregate = {
        personaDeclaredCount: rosterPayload.length,
        personaReadCount: personaByClientId.size,
        allocationCount: frozenIds.length,
        allocationDeclaredCount,
        allocationMissingCount,
        customerCount: customers.size,
        friendCount,
        groupCount,
        messageCount,
        unreadableCount: 0,
        failureCount: 0,
        missingDisplayNameCount,
        excludedCount,
        perPersona,
        scopeKind: "current-allocation-partial-v1",
        scopeComplete: false,
        completeScopeUnavailableReason: LOCAL_PARTIAL_REASON,
        adapterReceipt: { appliedScope: false, paginationComplete: true, completenessComplete: false },
        coverageReceipt,
        ...(allocationMissingCount > 0 ? { unavailableReason: "allocation-snapshot-incomplete" } : {}),
      };
      const staging = {
        ok: true,
        formalWriteCount: 0,
        source: { id: sourceIds.sourceId, state: "active", displayName: "碎银", sourceKind: "suiyin-mcp", environment, sourceAccountLabels: Object.fromEntries([...sourceAccountLabels.entries()].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)), sourceAccountWechatSourceLinks: Object.fromEntries([...sourceAccountWechatSourceLinks.entries()].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)), importedAt: now(), ...aggregate, momentsUnsupported: true, attachmentsUnsupported: true },
        people, mappings, excerpts, signals, aggregate,
        unsupported: { moments: true, attachments: true },
      };
      const stringContainsRawClientIdentifier = (value) => {
        if (typeof value !== "string") return false;
        const normalized = value.normalize("NFKC");
        if (rawClientIdentifiers.has(normalized.trim())) return true;
        return [...rawClientIdentifiers].some((identifier) => identifier.length >= 8 && normalized.includes(identifier));
      };
      const containsRawClientIdentifier = (value) => {
        if (stringContainsRawClientIdentifier(value)) return true;
        if (Array.isArray(value)) return value.some(containsRawClientIdentifier);
        if (!value || typeof value !== "object") return false;
        return Object.entries(value).some(([key, nested]) => stringContainsRawClientIdentifier(key) || containsRawClientIdentifier(nested));
      };
      if (containsRawClientIdentifier(staging)) throw safeError("MCP_SCHEMA_INVALID");
      return staging;
    } catch (error) {
      if (SAFE_CODES.has(error?.code)) throw error;
      throw safeError("MCP_UPSTREAM_FAILED");
    }
  };

  return { callTool, collectImport, close: () => transport.close?.() };
}

export function createStdioMcpTransport({ command, args = [], spawnImpl = spawn, timeoutMs = 30_000 } = {}) {
  if (typeof command !== "string" || !command) throw safeError("MCP_UNAVAILABLE");
  let child = null, buffer = "", nextId = 1;
  const pending = new Map();
  const ensureChild = () => {
    if (child) return child;
    try { child = spawnImpl(command, args, { stdio: ["pipe", "pipe", "pipe"], windowsHide: true }); }
    catch { throw safeError("MCP_UNAVAILABLE"); }
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      for (;;) {
        const newline = buffer.indexOf("\n");
        if (newline < 0) break;
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        let message;
        try { message = JSON.parse(line); } catch { continue; }
        const slot = pending.get(message.id);
        if (!slot) continue;
        pending.delete(message.id);
        clearTimeout(slot.timer);
        if (message.error) slot.reject(safeError("MCP_UPSTREAM_FAILED")); else slot.resolve(message.result);
      }
    });
    child.stderr.on("data", () => {});
    child.once("error", () => { for (const slot of pending.values()) { clearTimeout(slot.timer); slot.reject(safeError("MCP_UNAVAILABLE")); } pending.clear(); });
    child.once("exit", () => { for (const slot of pending.values()) { clearTimeout(slot.timer); slot.reject(safeError("MCP_UNAVAILABLE")); } pending.clear(); child = null; });
    return child;
  };
  const send = (payload) => {
    const process = ensureChild();
    if (!process.stdin.writable) throw safeError("MCP_UNAVAILABLE");
    process.stdin.write(`${JSON.stringify(payload)}\n`);
  };
  return {
    request(method, params = {}) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { pending.delete(id); reject(safeError("MCP_UPSTREAM_FAILED")); }, timeoutMs);
        pending.set(id, { resolve, reject, timer });
        try { send({ jsonrpc: "2.0", id, method, params }); }
        catch (error) { clearTimeout(timer); pending.delete(id); reject(SAFE_CODES.has(error?.code) ? error : safeError("MCP_UNAVAILABLE")); }
      });
    },
    async notify(method, params = {}) { send({ jsonrpc: "2.0", method, params }); },
    async close() { if (child) { child.kill(); child = null; } },
  };
}
