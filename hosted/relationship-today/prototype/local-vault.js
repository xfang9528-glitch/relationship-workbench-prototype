const SUPPORTED_KINDS = new Set(["contact", "conversation-metadata", "chat-text", "moment-text", "media-description"]);
const DAY = 86_400_000;
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

export const BACKUP_ITERATIONS = 310_000;
export const SOURCE_BUNDLE_REVISION = "F94A61B13F749F2D486C2C510762FE07016153F6A289DEFB90B8D1CB2F3BF511";
export const RELATIONSHIP_SYSTEM_LABELS = Object.freeze(["家人", "亲戚", "朋友", "老同学", "前同事", "客户", "合作伙伴", "老师", "邻居"]);

const bytes = (value) => value instanceof Uint8Array ? value : new Uint8Array(value);
const clone = (value) => structuredClone(value);
const base64 = (value) => {
  const data = bytes(value);
  if (typeof Buffer !== "undefined") return Buffer.from(data).toString("base64");
  let binary = "";
  for (const octet of data) binary += String.fromCharCode(octet);
  return btoa(binary);
};
const unbase64 = (value) => {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(value, "base64"));
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
};
const safeRelativePath = (value = "") => value && !value.startsWith("/") && !value.startsWith("\\") && !/^[a-z]:/i.test(value) && !value.split(/[\\/]+/).includes("..");
const withoutBody = ({ body: _body, bytes: _bytes, ...record }) => clone(record);
const ensureLists = (graph) => {
  const next = clone(graph || {});
  for (const field of ["sources", "people", "excerpts", "mappings", "relationships", "dictionary", "signals", "topics", "notes", "actions", "trash", "purgedPersonIds", "identityDecisions"]) next[field] ??= [];
  next.settings ??= { schema: 1 };
  return next;
};

const parserFailure = (code, nextAction) => ({ ok: false, error: { code, ...(nextAction ? { nextAction } : {}) }, formalWriteCount: 0 });
const requiredString = (value) => typeof value === "string";
const strictIsoTimestamp = (value) => {
  const match = typeof value === "string" && /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= monthDays[month - 1];
};
const requiredInteger = (value) => Number.isInteger(value);
const strictBasename = (value) => typeof value === "string" && value.length > 0 && value !== "." && value !== ".." && !/[\\/]/.test(value) && !/%2e|%2f|%5c/i.test(value) && !/^[a-z]:/i.test(value);
const IMPORT_BATCH_NAME_LIMIT = 128;
const IMPORT_BATCH_NAME_UNSAFE = /[\u0000-\u001F\u007F-\u009F\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/u;
const IMPORT_TRANSIENT_RECEIPT_FIELDS = new Set(["batchName", "selectedAt", "exportedAt"]);
const IMPORT_COMMITTED_RECEIPT_FIELDS = Object.freeze(["batchName", "selectedAt", "importedAt", "exportedAt"]);
const own = (value, field) => Object.prototype.hasOwnProperty.call(value, field);

const normalizeImportBatchName = (value) => {
  if (typeof value !== "string") throw typedError("IMPORT_RECEIPT_INVALID");
  const compatibility = value.normalize("NFKC");
  if (IMPORT_BATCH_NAME_UNSAFE.test(compatibility)) throw typedError("IMPORT_RECEIPT_INVALID");
  const normalized = compatibility.trim().replace(/\s+/gu, " ");
  if (!normalized || Array.from(normalized).length > IMPORT_BATCH_NAME_LIMIT || normalized === "." || normalized === ".." || /[\\/:]/u.test(normalized) || /%(?:2e|2f|5c)/iu.test(normalized) || /^[a-z]:/iu.test(normalized) || /^\\\\/u.test(normalized)) throw typedError("IMPORT_RECEIPT_INVALID");
  return normalized;
};

const normalizeTransientImportReceipt = (value) => {
  if (!value || Array.isArray(value) || typeof value !== "object" || ![Object.prototype, null].includes(Object.getPrototypeOf(value)) || Object.keys(value).some((field) => !IMPORT_TRANSIENT_RECEIPT_FIELDS.has(field)) || Object.keys(value).length !== IMPORT_TRANSIENT_RECEIPT_FIELDS.size) throw typedError("IMPORT_RECEIPT_INVALID");
  const batchName = normalizeImportBatchName(value.batchName);
  if (!strictIsoTimestamp(value.selectedAt) || value.exportedAt !== null) throw typedError("IMPORT_RECEIPT_INVALID");
  return { batchName, selectedAt: value.selectedAt, exportedAt: null };
};

export function createImportBatchReceipt(batchName, { selectedAt = new Date().toISOString() } = {}) {
  return normalizeTransientImportReceipt({ batchName, selectedAt, exportedAt: null });
}
const readExactFile = async (directory, name, optional = false) => {
  try {
    const handle = await directory.getFileHandle(name);
    const raw = new Uint8Array(await (await handle.getFile()).arrayBuffer());
    if (raw.length >= 3 && raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF) throw Object.assign(new Error("invalid-utf8-bom"), { code: "invalid-utf8-bom" });
    try { return decoder.decode(raw); } catch { throw Object.assign(new Error("invalid-utf8"), { code: "invalid-utf8" }); }
  } catch (error) {
    if (optional && error?.name === "NotFoundError") return null;
    if (error?.name === "NotAllowedError") throw typedError("permission-denied");
    if (error?.name === "AbortError") throw typedError("cancelled");
    throw error;
  }
};
const getExactDirectory = async (root, name) => {
  try { return await root.getDirectoryHandle(name); }
  catch (error) {
    if (error?.name === "NotAllowedError") throw typedError("permission-denied");
    if (error?.name === "AbortError") throw typedError("cancelled");
    throw error;
  }
};
const sha256Hex = async (value) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(String(value).normalize("NFC")));
  return [...new Uint8Array(digest)].map((octet) => octet.toString(16).padStart(2, "0")).join("").toUpperCase();
};

const SHA256_INITIAL = Object.freeze([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
const SHA256_ROUND = Object.freeze([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
const rotateRight = (value, count) => (value >>> count) | (value << (32 - count));
const sha256HexSync = (value) => {
  const input = encoder.encode(String(value).normalize("NFC"));
  const paddedLength = Math.ceil((input.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(input);
  padded[input.length] = 0x80;
  new DataView(padded.buffer).setBigUint64(paddedLength - 8, BigInt(input.length) * 8n, false);
  const state = [...SHA256_INITIAL];
  const words = new Uint32Array(64);
  const view = new DataView(padded.buffer);
  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4, false);
    for (let index = 16; index < 64; index += 1) {
      const left = words[index - 15], right = words[index - 2];
      const sigma0 = rotateRight(left, 7) ^ rotateRight(left, 18) ^ (left >>> 3);
      const sigma1 = rotateRight(right, 17) ^ rotateRight(right, 19) ^ (right >>> 10);
      words[index] = (words[index - 16] + sigma0 + words[index - 7] + sigma1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = state;
    for (let index = 0; index < 64; index += 1) {
      const sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + sum1 + choice + SHA256_ROUND[index] + words[index]) >>> 0;
      const sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sum0 + majority) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0; d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    state[0] = (state[0] + a) >>> 0; state[1] = (state[1] + b) >>> 0; state[2] = (state[2] + c) >>> 0; state[3] = (state[3] + d) >>> 0;
    state[4] = (state[4] + e) >>> 0; state[5] = (state[5] + f) >>> 0; state[6] = (state[6] + g) >>> 0; state[7] = (state[7] + h) >>> 0;
  }
  return state.map((part) => part.toString(16).padStart(8, "0")).join("").toUpperCase();
};

export async function stableWechatIds({ owner, platformUserId, talker, serverId, momentId }) {
  const sourceId = await sha256Hex(`wechat-export-toolkit/source/v1\0${String(owner).normalize("NFC")}`);
  return {
    sourceId,
    sourcePersonId: await sha256Hex(`${sourceId}\0person\0${String(platformUserId).normalize("NFC")}`),
    conversationId: await sha256Hex(`${sourceId}\0conversation\0${String(talker).normalize("NFC")}`),
    chatContentId: await sha256Hex(`${sourceId}\0chat\0${String(serverId).normalize("NFC")}`),
    momentContentId: await sha256Hex(`${sourceId}\0moment\0${String(momentId).normalize("NFC")}`),
  };
}

export function parseMomentsData(text) {
  const prefix = "window.SNS_DATA=";
  if (typeof text !== "string" || !text.startsWith(prefix) || !text.endsWith(";") || text.trim() !== text) throw new Error("invalid-moments-wrapper");
  const json = text.slice(prefix.length, -1);
  let data;
  try { data = JSON.parse(json); } catch { throw new Error("invalid-moments-wrapper"); }
  if (!data || Array.isArray(data) || typeof data !== "object" || !Array.isArray(data.posts)) throw new Error("invalid-moments-wrapper");
  return data;
}

const nonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;
const validateMomentsSchema = (data) => {
  if (!data || Array.isArray(data) || typeof data !== "object" || !requiredString(data.generated) || !requiredString(data.me) || !data.stats || Array.isArray(data.stats) || typeof data.stats !== "object" || !Array.isArray(data.people) || !Array.isArray(data.posts)) return "invalid-moments-schema";
  for (const key of ["posts", "people", "interactions", "likes", "comments", "parse_failed"]) if (!nonNegativeInteger(data.stats[key])) return "invalid-moments-schema";
  if (!requiredString(data.stats.latest) || !requiredString(data.stats.earliest)) return "invalid-moments-schema";
  if (data.stats.posts !== data.posts.length || data.stats.people !== data.people.length) return "moments-count-mismatch";
  for (const person of data.people) {
    if (!person || !requiredString(person.u) || !requiredString(person.name) || !requiredString(person.avatar) || !(requiredString(person.priority) || nonNegativeInteger(person.priority)) || !requiredString(person.reason) || !nonNegativeInteger(person.posts) || !nonNegativeInteger(person.posts30) || !nonNegativeInteger(person.posts90) || !nonNegativeInteger(person.likes) || !nonNegativeInteger(person.comments) || !nonNegativeInteger(person.last_post) || !nonNegativeInteger(person.last_interaction)) return "invalid-moments-schema";
  }
  for (const post of data.posts) {
    if (!post || !requiredString(post.id) || !post.id || !requiredString(post.u) || !requiredString(post.n) || !requiredInteger(post.ts) || !requiredString(post.time) || !requiredString(post.body) || !requiredString(post.title) || !requiredString(post.link) || !requiredString(post.kind) || !requiredString(post.location) || !nonNegativeInteger(post.media_count) || !Array.isArray(post.interactions)) return "invalid-moments-schema";
  }
  const interactionCount = data.posts.reduce((total, post) => total + post.interactions.length, 0);
  const peoplePostCount = data.people.reduce((total, person) => total + person.posts, 0);
  if (peoplePostCount !== data.posts.length || data.stats.interactions !== interactionCount || data.stats.likes + data.stats.comments !== data.stats.interactions) return "moments-count-mismatch";
  return null;
};

const validateConversationSummary = (item) => item && requiredString(item.talker) && requiredString(item.talker_name) && typeof item.is_group === "boolean" && requiredInteger(item.message_count) && requiredString(item.first_time) && requiredString(item.last_time) && requiredString(item.file);
const validateMessage = (item) => item && requiredString(item.talker) && requiredString(item.talker_name) && typeof item.is_group === "boolean" && requiredString(item.msgID) && requiredString(item.server_id) && requiredInteger(item.local_id) && requiredString(item.time) && requiredInteger(item.timestamp) && requiredString(item.from_name) && typeof item.is_self === "boolean" && requiredInteger(item.type) && requiredString(item.type_label) && requiredString(item.text) && (item.image === null || requiredString(item.image));

export async function parseWechatExportToolkit(root, { sourceBundleRevision = SOURCE_BUNDLE_REVISION, selectedAt = new Date().toISOString() } = {}) {
  if (sourceBundleRevision !== SOURCE_BUNDLE_REVISION) return parserFailure("unsupported-exporter-revision");
  let jsonDirectory, indexText, messagesText;
  try {
    jsonDirectory = await getExactDirectory(root, "json");
    indexText = await readExactFile(jsonDirectory, "_index.json");
    messagesText = await readExactFile(jsonDirectory, "all_messages.jsonl");
  } catch (error) {
    if (error?.code) return parserFailure(error.code);
    return parserFailure("missing-canonical-json", "请先运行同 revision 的 export_json.py 生成 JSON");
  }
  if (indexText.includes("�") || messagesText.includes("�")) return parserFailure("invalid-utf8-replacement");
  let index, messages;
  try {
    index = JSON.parse(indexText);
    messages = messagesText.split(/\r?\n/).filter((line) => line.length > 0).map((line) => JSON.parse(line));
  } catch { return parserFailure("invalid-json"); }
  if (!index || !Array.isArray(index.conversations)) return parserFailure("invalid-schema");
  if (index.conversations.some((item) => item && requiredString(item.file) && !strictBasename(item.file))) return parserFailure("path-traversal");
  if (!requiredString(index.owner) || !requiredInteger(index.conversation_count) || !requiredInteger(index.total_messages) || index.conversations.some((item) => !validateConversationSummary(item)) || messages.some((item) => !validateMessage(item))) return parserFailure("invalid-schema");
  if (index.conversation_count !== index.conversations.length) return parserFailure("count-mismatch");
  if (index.conversations.some((item) => !strictBasename(item.file))) return parserFailure("path-traversal");
  const conversationPayloads = [];
  for (const summary of index.conversations) {
    let text;
    try { text = await readExactFile(jsonDirectory, summary.file); } catch (error) { return parserFailure(error?.code || "missing-conversation-json"); }
    if (text.includes("�")) return parserFailure("invalid-utf8-replacement");
    let conversation;
    try { conversation = JSON.parse(text); } catch { return parserFailure("invalid-json"); }
    if (!conversation || conversation.owner !== index.owner || conversation.talker !== summary.talker || conversation.is_group !== summary.is_group || conversation.message_count !== summary.message_count || !Array.isArray(conversation.messages) || conversation.messages.length !== summary.message_count) return parserFailure("count-mismatch");
    conversationPayloads.push(conversation);
  }
  const sourceIds = await stableWechatIds({ owner: index.owner, platformUserId: index.owner, talker: index.owner, serverId: "source", momentId: "source" });
  const seenChat = new Set();
  const parsedMessages = [];
  let senderlessGroupContextCount = 0;
  for (const message of messages) {
    const senderlessGroupContext = !message.from && message.is_group && message.type_label !== "text";
    if (!message.from && message.is_group && !senderlessGroupContext) return parserFailure("invalid-schema");
    const zeroServerPlaceholder = message.msgID === "0" && message.server_id === "0";
    if (zeroServerPlaceholder ? (!message.talker || !nonNegativeInteger(message.local_id)) : (!/^\d+$/.test(message.server_id) || message.msgID !== message.server_id)) return parserFailure("unstable-content-id");
    const stableMessageKey = zeroServerPlaceholder ? `local:${message.talker}:${message.local_id}` : message.server_id;
    const ids = await stableWechatIds({ owner: index.owner, platformUserId: message.from || message.talker, talker: message.talker, serverId: stableMessageKey, momentId: "unused" });
    if (seenChat.has(ids.chatContentId)) return parserFailure("duplicate-content-id");
    seenChat.add(ids.chatContentId);
    if (senderlessGroupContext) {
      senderlessGroupContextCount += 1;
      continue;
    }
    parsedMessages.push({ contentId: ids.chatContentId, conversationId: ids.conversationId, sourcePersonId: ids.sourcePersonId, platformUserId: message.from || message.talker, talker: message.talker, displayName: message.from_name, timestamp: message.timestamp, time: message.time, conversationKind: message.is_group ? "group" : "direct", direction: message.is_self ? "self" : "counterparty", thirdParty: message.is_group, kind: message.type_label === "text" ? "chat-text" : "media-description", text: message.text, isolation: message.type_label === "text" ? "pending" : "media-description" });
  }
  if (index.total_messages !== messages.length) return parserFailure("count-mismatch");
  const counts = new Map();
  for (const message of messages) counts.set(message.talker, (counts.get(message.talker) || 0) + 1);
  if (index.conversations.some((summary) => counts.get(summary.talker) !== summary.message_count)) return parserFailure("count-mismatch");
  const messagesByTalker = new Map();
  for (const message of messages) {
    if (!messagesByTalker.has(message.talker)) messagesByTalker.set(message.talker, []);
    messagesByTalker.get(message.talker).push(message);
  }
  for (const conversation of conversationPayloads) {
    const canonical = messagesByTalker.get(conversation.talker) || [];
    if (canonical.length !== conversation.messages.length) return parserFailure("count-mismatch");
    for (let position = 0; position < canonical.length; position += 1) {
      const left = canonical[position], right = conversation.messages[position];
      if (left.msgID !== right.msgID || left.server_id !== right.server_id || left.local_id !== right.local_id || left.timestamp !== right.timestamp || left.from !== right.from) return parserFailure("conversation-conflict");
    }
  }
  let momentsData = null;
  const warnings = [];
  if (senderlessGroupContextCount > 0) warnings.push({ code: "senderless-group-context-excluded", count: senderlessGroupContextCount });
  try {
    const momentsDirectory = await getExactDirectory(root, "moments");
    const momentsText = await readExactFile(momentsDirectory, "data.js", true);
    if (momentsText === null) warnings.push({ code: "moments-not-provided" });
    else {
      if (momentsText.includes("�")) return parserFailure("invalid-utf8-replacement");
      try { momentsData = parseMomentsData(momentsText); } catch { return parserFailure("invalid-moments-wrapper"); }
      const momentsError = validateMomentsSchema(momentsData);
      if (momentsError) return parserFailure(momentsError);
      if (momentsData.stats.parse_failed > 0) warnings.push({ code: "moments-parse-failures-excluded", count: momentsData.stats.parse_failed });
    }
  } catch (error) {
    if (error?.name === "NotFoundError") warnings.push({ code: "moments-not-provided" });
    else if (error?.code) return parserFailure(error.code);
    else return parserFailure("moments-read-error");
  }
  const moments = [];
  const seenMoments = new Set();
  for (const post of momentsData?.posts || []) {
    if (!post || !requiredString(post.id) || !post.id || !requiredString(post.u) || !requiredString(post.n) || !requiredInteger(post.ts) || !requiredString(post.time) || !requiredString(post.body) || !requiredInteger(post.media_count)) return parserFailure("invalid-schema");
    const ids = await stableWechatIds({ owner: index.owner, platformUserId: post.u, talker: post.u, serverId: "unused", momentId: post.id });
    if (seenMoments.has(ids.momentContentId)) return parserFailure("duplicate-content-id");
    seenMoments.add(ids.momentContentId);
    moments.push({ contentId: ids.momentContentId, sourcePersonId: ids.sourcePersonId, platformUserId: post.u, name: post.n, publishedAt: post.ts, time: post.time, body: post.body, mediaDescription: `${post.media_count} 个媒体项目（未打开）` });
  }
  const knownIndex = new Set(["owner", "conversation_count", "total_messages", "conversations"]);
  const knownMessage = new Set(["talker", "talker_name", "is_group", "msgID", "server_id", "local_id", "time", "timestamp", "from", "from_name", "is_self", "type", "type_label", "text", "image"]);
  const unknownFields = Object.keys(index).filter((key) => !knownIndex.has(key)).map((field) => ({ scope: "index", field }));
  messages.forEach((message, line) => Object.keys(message).filter((key) => !knownMessage.has(key)).forEach((field) => unknownFields.push({ scope: "message", line: line + 1, field })));
  let receipt;
  try { receipt = createImportBatchReceipt(root?.name, { selectedAt }); }
  catch { return parserFailure("IMPORT_RECEIPT_INVALID"); }
  return { ok: true, source: { sourceId: sourceIds.sourceId, sourceBundleRevision: SOURCE_BUNDLE_REVISION }, receipt, peopleScopeLabel: "来源中出现的人，不是完整通讯录", conversations: index.conversations.map((item) => ({ talker: item.talker, displayName: item.talker_name, isGroup: item.is_group, messageCount: item.message_count, file: item.file })), messages: parsedMessages, moments, warnings, unknownFields, formalWriteCount: 0, conversationCrossChecks: conversationPayloads.length };
}

export function classifyExportRecords(records = []) {
  const supported = [];
  const excluded = [];
  for (const record of records) {
    if (safeRelativePath(record.relativePath) && SUPPORTED_KINDS.has(record.kind)) supported.push(withoutBody(record));
    else excluded.push(withoutBody(record));
  }
  return { supported, excluded };
}

export function createImportPreview({ sourceId, records = [] }) {
  const result = classifyExportRecords(records);
  return { state: "preview-ready", sourceId, supportedCount: result.supported.length, excludedCount: result.excluded.length, supported: result.supported, excluded: result.excluded, formalWriteCount: 0, temporary: true };
}

const signature = (record) => JSON.stringify(withoutBody(record), Object.keys(withoutBody(record)).sort());
export function diffSourceRecords(previous = [], next = []) {
  const before = new Map(previous.filter((r) => safeRelativePath(r.relativePath)).map((r) => [r.id, r]));
  const after = new Map(next.filter((r) => safeRelativePath(r.relativePath)).map((r) => [r.id, r]));
  const added = [], updated = [], suspectedDeleted = [], unchanged = [];
  for (const [id, record] of after) {
    if (!before.has(id)) added.push(id);
    else if (signature(before.get(id)) === signature(record)) unchanged.push(id);
    else updated.push(id);
  }
  for (const id of before.keys()) if (!after.has(id)) suspectedDeleted.push(id);
  return { added, updated, conflicts: [...updated], suspectedDeleted, unchanged };
}

function typedError(code, detail = {}) { return Object.assign(new Error(code), { code, ...detail }); }

const RELATIONSHIP_LABEL_LIMIT = 40;
const CURRENT_RELATIONSHIP_STATUSES = new Set(["current", "confirmed"]);
const RELATIONSHIP_GRAPH_FIELDS = new Set(["owner", "sources", "people", "excerpts", "mappings", "relationships", "dictionary", "signals", "topics", "notes", "actions", "trash", "purgedPersonIds", "identityDecisions", "settings"]);
const RELATIONSHIP_SYSTEM_LABEL_SET = new Set(RELATIONSHIP_SYSTEM_LABELS.map((label) => label.normalize("NFKC")));
const RELATIONSHIP_V2_FIELDS = new Set(["id", "relationshipId", "personId", "label", "status", "source", "sourceIds", "createdAt", "updatedAt", "decisionId", "dictionaryId", "evidence", "confirmation", "algorithmVersion", "eligibleMessageCount", "startDate", "endDate"]);
const RELATIONSHIP_EVIDENCE_FIELDS = new Set(["sourceCategory", "conversationScope", "excerptCount", "utcDateCount", "directions", "firstAt", "lastAt"]);
const RELATIONSHIP_DIRECTION_FIELDS = new Set(["self", "counterparty"]);
const RELATIONSHIP_DICTIONARY_V2_FIELDS = new Set(["id", "label", "normalizedLabel", "status", "scope", "source", "createdAt", "updatedAt"]);
const SOURCE_ACCOUNT_ALIAS_PATTERN = /^SY-[0-9A-F]{8}$/;
const IDENTITY_HASH_PATTERN = /^[0-9A-F]{64}$/;
const SUIYIN_ACCOUNT_LABEL_LIMIT = 64;
const SUIYIN_ACCOUNT_LABEL_UNSAFE = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/u;
const SUIYIN_ACCOUNT_LABEL_IDENTIFIER = /^(?:SY-[0-9A-F]{8}|(?:wxid_|gh_)|[0-9A-F]{32,64}|[0-9A-F]{8}(?:-[0-9A-F]{4}){3}-[0-9A-F]{12}|[0-9]{8,}|unknown|tbd|待补|账号待补|未知|未命名)/iu;
const IDENTITY_MAPPING_FIELDS = new Set(["id", "sourceId", "sourcePersonId", "personId", "sourceDisplayName", "sourceAccountAliases", "status", "accountAttributionOverride"]);
const SUIYIN_STAGING_MAPPING_FIELDS = new Set(["id", "sourceId", "sourcePersonId", "personId", "sourceDisplayName", "sourceAccountAliases", "status"]);
const ACCOUNT_ATTRIBUTION_OVERRIDE_FIELDS = new Set(["kind", "sourceAccountAlias", "decisionId", "updatedAt"]);
const IDENTITY_DECISION_FIELDS = new Set(["id", "pairKey", "decisionId", "status", "identityKeys", "mappingIds", "createdAt", "updatedAt", "canonicalPersonId", "secondaryPersonId", "lineage"]);
const IDENTITY_LINEAGE_PERSON_FIELDS = new Set(["id", "name", "state", "sourceScoped", "trashedAt", "purgeAt", "lineageIndex"]);
const IDENTITY_LINEAGE_RECEIPT_FIELDS = new Set(["id", "personId", "payloadHash", "position"]);

const normalizeSourceAccountAliases = (value) => {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((alias) => typeof alias !== "string" || !SOURCE_ACCOUNT_ALIAS_PATTERN.test(alias))) throw typedError("SOURCE_ACCOUNT_ALIAS_INVALID");
  return [...new Set(value)].sort();
};

const normalizeAccountAttributionOverride = (value) => {
  if (!value || Array.isArray(value) || typeof value !== "object" || ![Object.prototype, null].includes(Object.getPrototypeOf(value)) || Object.keys(value).some((key) => !ACCOUNT_ATTRIBUTION_OVERRIDE_FIELDS.has(key)) || !["private-wechat", "suiyin-persona"].includes(value.kind) || !requiredString(value.decisionId) || !value.decisionId || !strictIsoTimestamp(value.updatedAt)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  const hasAlias = Object.prototype.hasOwnProperty.call(value, "sourceAccountAlias");
  if (value.kind === "private-wechat" ? hasAlias : !hasAlias || !SOURCE_ACCOUNT_ALIAS_PATTERN.test(value.sourceAccountAlias)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  return value.kind === "private-wechat"
    ? { kind: value.kind, decisionId: value.decisionId, updatedAt: value.updatedAt }
    : { kind: value.kind, sourceAccountAlias: value.sourceAccountAlias, decisionId: value.decisionId, updatedAt: value.updatedAt };
};

export function normalizeSuiyinAccountLabel(value) {
  if (typeof value !== "string") throw typedError("SUIYIN_ACCOUNT_LABEL_INVALID");
  const compatibility = value.normalize("NFKC");
  if (SUIYIN_ACCOUNT_LABEL_UNSAFE.test(compatibility)) throw typedError("SUIYIN_ACCOUNT_LABEL_INVALID");
  const normalized = compatibility.trim().replace(/\s+/gu, " ");
  if (!normalized || Array.from(normalized).length > SUIYIN_ACCOUNT_LABEL_LIMIT || /[*＊]/u.test(normalized) || SUIYIN_ACCOUNT_LABEL_IDENTIFIER.test(normalized)) throw typedError("SUIYIN_ACCOUNT_LABEL_INVALID");
  return normalized;
}

const COVERAGE_METRIC_KEYS = Object.freeze([
  "friends",
  "directConversations",
  "directMessages",
  "groupConversations",
  "groupMessages",
  "moments",
]);
const COVERAGE_STATES = new Set(["exact", "partial", "legacy-unknown", "upstream-unsupported", "blocked"]);
const COVERAGE_SCOPE_KINDS = new Set(["wechat-export-batch-v1", "suiyin-current-allocation-partial-v1", "suiyin-persona-complete-v1"]);
const COVERAGE_RECEIPT_FIELDS = new Set(["version", "scopeKind", "scopeComplete", "metrics", "observedDirectParticipantCount", "excludedCount", "perPersona"]);
const COVERAGE_METRIC_FIELDS = new Set(["value", "state", "reason"]);
const COVERAGE_PERSONA_FIELDS = new Set(["officialLabel", "metrics"]);
const COVERAGE_SAFE_REASONS = new Set([
  "LOCAL_COVERAGE_RECEIPT_INCOMPLETE",
  "WECHAT_ROSTER_NOT_PROVIDED",
  "WECHAT_MOMENTS_NOT_PROVIDED",
  "WECHAT_CANONICAL_CONVERSATION_KIND_INCOMPLETE",
  "WECHAT_CANONICAL_MESSAGE_KIND_INCOMPLETE",
  "LOCAL_SUIYIN_MOMENTS_MAPPING_INCOMPLETE",
  "LOCAL_SUIYIN_COVERAGE_GRAPH_REQUIRED",
]);
const strictPlainObject = (value) => value && !Array.isArray(value) && typeof value === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(value));

const coverageInvalid = () => { throw typedError("COVERAGE_RECEIPT_INVALID"); };
const validateCoverageMetrics = (metrics) => {
  if (!strictPlainObject(metrics) || Object.keys(metrics).length !== COVERAGE_METRIC_KEYS.length || Object.keys(metrics).some((key, index) => key !== COVERAGE_METRIC_KEYS[index])) coverageInvalid();
  for (const key of COVERAGE_METRIC_KEYS) {
    const metric = metrics[key];
    if (!strictPlainObject(metric) || Object.keys(metric).some((field) => !COVERAGE_METRIC_FIELDS.has(field)) || !own(metric, "value") || !own(metric, "state") || ![2, 3].includes(Object.keys(metric).length) || !COVERAGE_STATES.has(metric.state)) coverageInvalid();
    const counted = metric.state === "exact" || metric.state === "partial";
    if (counted ? !nonNegativeInteger(metric.value) : metric.value !== null) coverageInvalid();
    if (own(metric, "reason") && !COVERAGE_SAFE_REASONS.has(metric.reason)) coverageInvalid();
  }
};

export function validateCoverageReceipt(receipt) {
  if (!strictPlainObject(receipt) || Object.keys(receipt).some((field) => !COVERAGE_RECEIPT_FIELDS.has(field)) || !["version", "scopeKind", "scopeComplete", "metrics"].every((field) => own(receipt, field)) || receipt.version !== 1 || !COVERAGE_SCOPE_KINDS.has(receipt.scopeKind) || typeof receipt.scopeComplete !== "boolean") coverageInvalid();
  if ((receipt.scopeKind === "suiyin-persona-complete-v1") !== receipt.scopeComplete) coverageInvalid();
  validateCoverageMetrics(receipt.metrics);
  for (const field of ["observedDirectParticipantCount", "excludedCount"]) if (own(receipt, field) && !nonNegativeInteger(receipt[field])) coverageInvalid();
  if (own(receipt, "observedDirectParticipantCount") && receipt.scopeKind !== "wechat-export-batch-v1") coverageInvalid();
  if (own(receipt, "perPersona")) {
    if (!receipt.scopeKind.startsWith("suiyin-") || !Array.isArray(receipt.perPersona) || receipt.perPersona.length !== 3 || Object.keys(receipt.perPersona).some((key, index) => key !== String(index))) coverageInvalid();
    const labels = new Set();
    for (const persona of receipt.perPersona) {
      if (!strictPlainObject(persona) || Object.keys(persona).length !== COVERAGE_PERSONA_FIELDS.size || Object.keys(persona).some((field) => !COVERAGE_PERSONA_FIELDS.has(field))) coverageInvalid();
      let officialLabel;
      try { officialLabel = normalizeSuiyinAccountLabel(persona.officialLabel); } catch { coverageInvalid(); }
      if (officialLabel !== persona.officialLabel || labels.has(officialLabel)) coverageInvalid();
      labels.add(officialLabel);
      validateCoverageMetrics(persona.metrics);
    }
  }
  return clone(receipt);
}

const coverageMetric = (value, state, reason) => ({ value, state, ...(reason ? { reason } : {}) });
const coverageMetricsFrom = (factory) => Object.fromEntries(COVERAGE_METRIC_KEYS.map((key) => [key, factory(key)]));
const legacyCoverageReceipt = (scopeKind) => ({
  version: 1,
  scopeKind,
  scopeComplete: false,
  metrics: coverageMetricsFrom(() => coverageMetric(null, "legacy-unknown")),
});

const normalizeSuiyinAccountLabels = (value) => {
  if (value === undefined) return {};
  if (!value || Array.isArray(value) || typeof value !== "object" || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw typedError("SUIYIN_ACCOUNT_LABEL_INVALID");
  const keys = Object.keys(value);
  const sorted = [...keys].sort(ordinalCompare);
  if (keys.some((key, index) => key !== sorted[index]) || keys.some((alias) => !SOURCE_ACCOUNT_ALIAS_PATTERN.test(alias))) throw typedError("SUIYIN_ACCOUNT_LABEL_INVALID");
  const normalized = {};
  for (const alias of keys) {
    const label = value[alias];
    if (label === null) normalized[alias] = null;
    else {
      const safe = normalizeSuiyinAccountLabel(label);
      if (safe !== label) throw typedError("SUIYIN_ACCOUNT_LABEL_INVALID");
      normalized[alias] = safe;
    }
  }
  return normalized;
};

const normalizeSuiyinWechatSourceLinks = (value, registry = {}) => {
  if (value === undefined) return {};
  if (!value || Array.isArray(value) || typeof value !== "object" || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw typedError("SUIYIN_SOURCE_LINK_INVALID");
  const keys = Object.keys(value);
  const sorted = [...keys].sort(ordinalCompare);
  if (keys.some((sourceId) => !IDENTITY_HASH_PATTERN.test(sourceId))) throw typedError("SUIYIN_SOURCE_LINK_INVALID");
  const sourceIdByAlias = new Map();
  const normalized = {};
  for (const sourceId of keys) {
    const alias = value[sourceId];
    if (typeof alias !== "string" || !SOURCE_ACCOUNT_ALIAS_PATTERN.test(alias) || !Object.prototype.hasOwnProperty.call(registry, alias)) throw typedError("SUIYIN_SOURCE_LINK_INVALID");
    const previousSourceId = sourceIdByAlias.get(alias);
    if (previousSourceId && previousSourceId !== sourceId) throw typedError("SUIYIN_SOURCE_LINK_CONFLICT");
    sourceIdByAlias.set(alias, sourceId);
    normalized[sourceId] = alias;
  }
  if (keys.some((key, index) => key !== sorted[index])) throw typedError("SUIYIN_SOURCE_LINK_INVALID");
  return normalized;
};

const mergeSuiyinWechatSourceLinks = (previousValue, stagedValue, registry) => {
  const previous = normalizeSuiyinWechatSourceLinks(previousValue, registry);
  const staged = normalizeSuiyinWechatSourceLinks(stagedValue, registry);
  const merged = { ...previous };
  const sourceIdByAlias = new Map(Object.entries(previous).map(([sourceId, alias]) => [alias, sourceId]));
  for (const [sourceId, alias] of Object.entries(staged)) {
    if (Object.prototype.hasOwnProperty.call(merged, sourceId) && merged[sourceId] !== alias) throw typedError("SUIYIN_SOURCE_LINK_CONFLICT");
    const previousSourceId = sourceIdByAlias.get(alias);
    if (previousSourceId && previousSourceId !== sourceId) throw typedError("SUIYIN_SOURCE_LINK_CONFLICT");
    merged[sourceId] = alias;
    sourceIdByAlias.set(alias, sourceId);
  }
  return Object.fromEntries(Object.entries(merged).sort(([left], [right]) => ordinalCompare(left, right)));
};

const normalizeIdentityMapping = (mapping) => {
  if (!mapping || Array.isArray(mapping) || typeof mapping !== "object" || Object.keys(mapping).some((key) => !IDENTITY_MAPPING_FIELDS.has(key)) || !requiredString(mapping.id) || !mapping.id || !requiredString(mapping.sourceId) || !mapping.sourceId || !requiredString(mapping.personId) || !mapping.personId) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  const sourcePersonId = requiredString(mapping.sourcePersonId) && mapping.sourcePersonId ? mapping.sourcePersonId : mapping.personId;
  const status = mapping.status === "separate" ? "pending" : mapping.status;
  if (!["pending", "confirmed"].includes(status) || (mapping.sourceDisplayName !== undefined && !requiredString(mapping.sourceDisplayName))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  const normalized = { ...clone(mapping), sourcePersonId, status, sourceAccountAliases: normalizeSourceAccountAliases(mapping.sourceAccountAliases) };
  if (Object.prototype.hasOwnProperty.call(mapping, "accountAttributionOverride")) normalized.accountAttributionOverride = normalizeAccountAttributionOverride(mapping.accountAttributionOverride);
  return normalized;
};

const sourceIdentityKeyFor = (mapping) => sha256HexSync(`source-identity/v1\0${mapping.sourceId}\0${mapping.sourcePersonId}`);
const pairKeyFor = (leftKey, rightKey) => sha256HexSync(`identity-pair/v1\0${[leftKey, rightKey].sort().join("\0")}`);

const validateIdentityDecision = (decision, graph) => {
  if (!decision || Array.isArray(decision) || typeof decision !== "object" || Object.keys(decision).some((key) => !IDENTITY_DECISION_FIELDS.has(key)) || !requiredString(decision.id) || decision.id !== decision.pairKey || !IDENTITY_HASH_PATTERN.test(decision.pairKey) || !requiredString(decision.decisionId) || !decision.decisionId || !["merged", "separated"].includes(decision.status) || !Array.isArray(decision.identityKeys) || decision.identityKeys.length !== 2 || decision.identityKeys.some((key) => !IDENTITY_HASH_PATTERN.test(key)) || new Set(decision.identityKeys).size !== 2 || !Array.isArray(decision.mappingIds) || decision.mappingIds.length !== 2 || decision.mappingIds.some((id) => !requiredString(id)) || !requiredString(decision.createdAt) || !Number.isFinite(Date.parse(decision.createdAt)) || !requiredString(decision.updatedAt) || !Number.isFinite(Date.parse(decision.updatedAt))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  const mappingIds = new Set(graph.mappings.map((mapping) => mapping.id));
  if (decision.mappingIds.some((id) => !mappingIds.has(id)) || pairKeyFor(...decision.identityKeys) !== decision.pairKey) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  if (decision.status === "merged") {
    const lineage = decision.lineage;
    if (!requiredString(decision.canonicalPersonId) || !requiredString(decision.secondaryPersonId) || decision.canonicalPersonId === decision.secondaryPersonId || !lineage || Array.isArray(lineage) || typeof lineage !== "object" || Object.keys(lineage).some((key) => !["peopleBefore", "mappingsBefore", "mappingsAfter", "referencesBefore", "referencesAfter"].includes(key)) || !Array.isArray(lineage.peopleBefore) || lineage.peopleBefore.length !== 2 || !Array.isArray(lineage.mappingsBefore) || !Array.isArray(lineage.mappingsAfter) || !lineage.referencesBefore || !lineage.referencesAfter) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    if (lineage.peopleBefore.some((person) => !person || Array.isArray(person) || typeof person !== "object" || Object.keys(person).some((key) => !IDENTITY_LINEAGE_PERSON_FIELDS.has(key)) || !requiredString(person.id) || !requiredString(person.name) || !nonNegativeInteger(person.lineageIndex))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    const originalPeopleLength = graph.people.length + 1;
    if (new Set(lineage.peopleBefore.map((person) => person.lineageIndex)).size !== lineage.peopleBefore.length || lineage.peopleBefore.some((person) => person.lineageIndex >= originalPeopleLength)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    const trustedPersonas = trustedSuiyinPersonaRegistry(graph);
    for (const mappings of [lineage.mappingsBefore, lineage.mappingsAfter]) {
      if (mappings.some((mapping) => stableObject(normalizeIdentityMapping(mapping)) !== stableObject(mapping))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
      const attributionDecisionIds = new Set();
      for (const mapping of mappings) {
        const override = mapping.accountAttributionOverride;
        if (!override) continue;
        if (attributionDecisionIds.has(override.decisionId)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
        attributionDecisionIds.add(override.decisionId);
        const source = graph.sources.find((item) => item.id === mapping.sourceId);
        if (!wechatMappingEligibleForAttribution(graph, mapping, source)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
        if (override.kind === "suiyin-persona" && (trustedPersonas.conflicts.has(override.sourceAccountAlias) || !trustedPersonas.aliases.has(override.sourceAccountAlias))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
      }
    }
    for (const references of [lineage.referencesBefore, lineage.referencesAfter]) {
      if (!references || Array.isArray(references) || typeof references !== "object" || Object.keys(references).some((key) => !IDENTITY_REFERENCE_COLLECTIONS.includes(key)) || IDENTITY_REFERENCE_COLLECTIONS.some((key) => !Array.isArray(references[key]))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
      for (const field of IDENTITY_REFERENCE_COLLECTIONS) if (references[field].some((receipt) => !receipt || Array.isArray(receipt) || typeof receipt !== "object" || Object.keys(receipt).some((key) => !IDENTITY_LINEAGE_RECEIPT_FIELDS.has(key)) || !requiredString(receipt.id) || !requiredString(receipt.personId) || !IDENTITY_HASH_PATTERN.test(receipt.payloadHash) || !nonNegativeInteger(receipt.position))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    }
    for (const field of IDENTITY_REFERENCE_COLLECTIONS) {
      const before = lineage.referencesBefore[field], after = lineage.referencesAfter[field];
      if (new Set(before.map((receipt) => receipt.position)).size !== before.length || new Set(after.map((receipt) => receipt.position)).size !== after.length) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    }
  } else if ("lineage" in decision || "canonicalPersonId" in decision || "secondaryPersonId" in decision) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
};

export function normalizeRelationshipLabel(value) {
  if (typeof value !== "string" || /[\u0000-\u001F\u007F]/.test(value)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  const normalized = value.normalize("NFKC").trim().replace(/\s+/gu, " ");
  if (!normalized || Array.from(normalized).length > RELATIONSHIP_LABEL_LIMIT) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  return normalized;
}

const identityPseudoRelationship = (item) => {
  if (!item || typeof item !== "object") return false;
  try { return normalizeRelationshipLabel(item.label) === "身份已确认"; } catch { return false; }
};

const dictionaryIdForLabel = (label) => `dictionary-${Array.from(label).map((char) => char.codePointAt(0).toString(16)).join("-")}`;
const relationshipTimestamp = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value < 1_000_000_000_000 ? value * 1000 : value;
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? (numeric < 1_000_000_000_000 ? numeric * 1000 : numeric) : null;
  }
  const parsed = typeof value === "string" ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
};

const attributionSourceActive = (source) => Boolean(source) && !["removed", "deleted", "invalidated"].includes(source.state);
const trustedSuiyinPersonaRegistry = (graph) => {
  const aliases = new Map();
  const conflicts = new Set();
  for (const source of Array.isArray(graph?.sources) ? graph.sources : []) {
    if (!attributionSourceActive(source) || source?.sourceKind !== "suiyin-mcp" || source?.sourceBundleRevision === SOURCE_BUNDLE_REVISION) continue;
    const registry = normalizeSuiyinAccountLabels(source.sourceAccountLabels);
    for (const [alias, label] of Object.entries(registry)) {
      if (typeof label !== "string") continue;
      if (aliases.has(alias) && aliases.get(alias) !== label) conflicts.add(alias);
      else aliases.set(alias, label);
    }
  }
  return { aliases, conflicts };
};
const wechatMappingEligibleForAttribution = (graph, mapping, source) => {
  if (!mapping || !source || !attributionSourceActive(source)) return false;
  const explicitWechat = source.sourceKind === "wechat-export-toolkit";
  const legacyWechat = (source.sourceKind === undefined || source.sourceKind === null) && source.sourceBundleRevision === SOURCE_BUNDLE_REVISION;
  if (!explicitWechat && !legacyWechat) return false;
  let registry = {};
  try { registry = normalizeSuiyinAccountLabels(source.sourceAccountLabels); } catch { return false; }
  if (Object.keys(registry).length > 0) return false;
  try {
    if ((graph.mappings || []).some((item) => item?.sourceId === source.id && normalizeSourceAccountAliases(item.sourceAccountAliases).length > 0)) return false;
  } catch { return false; }
  return true;
};

const validateImportReceiptOnSource = (source) => {
  const hasNewReceiptField = ["batchName", "selectedAt", "exportedAt"].some((field) => own(source, field));
  if (source.sourceKind !== "wechat-export-toolkit") {
    if (hasNewReceiptField) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    return;
  }
  if (!hasNewReceiptField) {
    if (own(source, "importedAt") && !strictIsoTimestamp(source.importedAt)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    return;
  }
  if (IMPORT_COMMITTED_RECEIPT_FIELDS.some((field) => !own(source, field))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  let normalizedBatchName;
  try { normalizedBatchName = normalizeImportBatchName(source.batchName); }
  catch { throw typedError("RELATIONSHIP_SCHEMA_INVALID"); }
  if (normalizedBatchName !== source.batchName || !strictIsoTimestamp(source.selectedAt) || !strictIsoTimestamp(source.importedAt) || !(source.exportedAt === null || strictIsoTimestamp(source.exportedAt))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  if (source.exportedAt !== null) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
};

const validateRelationshipGraphV2 = (graph) => {
  if (!graph || Array.isArray(graph) || typeof graph !== "object" || Object.keys(graph).some((key) => !RELATIONSHIP_GRAPH_FIELDS.has(key)) || graph.settings?.schema !== 2) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  const people = new Set(graph.people.map((person) => person?.id).filter((id) => typeof id === "string" && id));
  const sources = new Set(graph.sources.map((source) => source?.id).filter((id) => typeof id === "string" && id));
  if (sources.size !== graph.sources.length) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  for (const source of graph.sources) {
    if (!source || Array.isArray(source) || typeof source !== "object" || typeof source.id !== "string" || !source.id) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    validateImportReceiptOnSource(source);
    if (own(source, "coverageReceipt")) {
      let coverageReceipt;
      try { coverageReceipt = validateCoverageReceipt(source.coverageReceipt); }
      catch { throw typedError("RELATIONSHIP_SCHEMA_INVALID"); }
      const wechatCoverage = source.sourceKind === "wechat-export-toolkit" && coverageReceipt.scopeKind === "wechat-export-batch-v1";
      const suiyinCoverage = source.sourceKind === "suiyin-mcp" && coverageReceipt.scopeKind.startsWith("suiyin-");
      if (!wechatCoverage && !suiyinCoverage) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
      if (suiyinCoverage && Object.values(coverageReceipt.metrics).some((metric) => metric.state === "upstream-unsupported")) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    }
    if (source.sourceAccountLabels !== undefined) {
      try { normalizeSuiyinAccountLabels(source.sourceAccountLabels); }
      catch { throw typedError("RELATIONSHIP_SCHEMA_INVALID"); }
    }
    if (source.sourceAccountWechatSourceLinks !== undefined) {
      if (source.sourceKind !== "suiyin-mcp") throw typedError("RELATIONSHIP_SCHEMA_INVALID");
      try { normalizeSuiyinWechatSourceLinks(source.sourceAccountWechatSourceLinks, normalizeSuiyinAccountLabels(source.sourceAccountLabels)); }
      catch (error) { throw typedError(error?.code === "SUIYIN_SOURCE_LINK_CONFLICT" ? "SUIYIN_SOURCE_LINK_CONFLICT" : "RELATIONSHIP_SCHEMA_INVALID"); }
    }
  }
  const mappingsById = new Set();
  const attributionDecisionIds = new Set();
  const trustedPersonas = trustedSuiyinPersonaRegistry(graph);
  for (const mapping of graph.mappings) {
    const source = graph.sources.find((item) => item.id === mapping?.sourceId);
    if (mappingsById.has(mapping?.id)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    mappingsById.add(mapping.id);
    const override = mapping.accountAttributionOverride;
    if (!override) continue;
    if (attributionDecisionIds.has(override.decisionId)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    attributionDecisionIds.add(override.decisionId);
    if (!people.has(mapping.personId) || !sources.has(mapping.sourceId) || !wechatMappingEligibleForAttribution(graph, mapping, source)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    if (override.kind === "suiyin-persona" && (trustedPersonas.conflicts.has(override.sourceAccountAlias) || !trustedPersonas.aliases.has(override.sourceAccountAlias))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  }
  const relationshipIds = new Set();
  const labelsByPerson = new Set();
  for (const relationship of graph.relationships) {
    if (!relationship || Array.isArray(relationship) || typeof relationship !== "object" || identityPseudoRelationship(relationship) || Object.keys(relationship).some((key) => !RELATIONSHIP_V2_FIELDS.has(key))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    const id = relationship.relationshipId || relationship.id;
    if (typeof id !== "string" || !id || relationship.id !== id || relationship.relationshipId !== id || relationshipIds.has(id) || !people.has(relationship.personId)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    relationshipIds.add(id);
    const label = normalizeRelationshipLabel(relationship.label);
    if (label !== relationship.label || !["current", "ended", "review-required"].includes(relationship.status) || !["manual-confirmed", "local-evaluation-confirmed", "legacy-unknown"].includes(relationship.source)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    const labelKey = `${relationship.personId}\0${label}`;
    if (labelsByPerson.has(labelKey)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    labelsByPerson.add(labelKey);
    if (!Array.isArray(relationship.sourceIds) || relationship.sourceIds.some((sourceId) => typeof sourceId !== "string" || !sources.has(sourceId)) || new Set(relationship.sourceIds).size !== relationship.sourceIds.length) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    if (relationship.source !== "legacy-unknown" && (typeof relationship.createdAt !== "string" || !Number.isFinite(Date.parse(relationship.createdAt)) || typeof relationship.updatedAt !== "string" || !Number.isFinite(Date.parse(relationship.updatedAt)))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    if (relationship.evidence !== undefined) {
      const evidence = relationship.evidence;
      if (!evidence || Array.isArray(evidence) || typeof evidence !== "object" || Object.keys(evidence).some((key) => !RELATIONSHIP_EVIDENCE_FIELDS.has(key)) || evidence.conversationScope !== "one-to-one" || !requiredString(evidence.sourceCategory) || !nonNegativeInteger(evidence.excerptCount) || !nonNegativeInteger(evidence.utcDateCount) || !evidence.directions || Array.isArray(evidence.directions) || typeof evidence.directions !== "object" || Object.keys(evidence.directions).some((key) => !RELATIONSHIP_DIRECTION_FIELDS.has(key)) || !nonNegativeInteger(evidence.directions.self) || !nonNegativeInteger(evidence.directions.counterparty) || !requiredString(evidence.firstAt) || !Number.isFinite(Date.parse(evidence.firstAt)) || !requiredString(evidence.lastAt) || !Number.isFinite(Date.parse(evidence.lastAt))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    }
    const semanticFields = ["confirmation", "algorithmVersion", "eligibleMessageCount", "startDate", "endDate"];
    if (semanticFields.some((field) => relationship[field] !== undefined) && (semanticFields.some((field) => relationship[field] === undefined) || relationship.source !== "local-evaluation-confirmed" || relationship.confirmation !== "accepted-semantic-suggestion" || !["local-semantic-v1", "local-semantic-v2"].includes(relationship.algorithmVersion) || !Number.isInteger(relationship.eligibleMessageCount) || relationship.eligibleMessageCount < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(relationship.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(relationship.endDate) || !Number.isFinite(Date.parse(relationship.startDate)) || !Number.isFinite(Date.parse(relationship.endDate)) || relationship.evidence !== undefined)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  }
  const dictionaryIds = new Set();
  const dictionaryLabels = new Set();
  for (const entry of graph.dictionary) {
    if (!entry || Array.isArray(entry) || typeof entry !== "object" || Object.keys(entry).some((key) => !RELATIONSHIP_DICTIONARY_V2_FIELDS.has(key)) || typeof entry.id !== "string" || !entry.id || dictionaryIds.has(entry.id)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    const label = normalizeRelationshipLabel(entry.label);
    if (label !== entry.label || entry.normalizedLabel !== label || dictionaryLabels.has(label) || !["active", "inactive"].includes(entry.status)) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    dictionaryIds.add(entry.id);
    dictionaryLabels.add(label);
  }
  if (graph.relationships.some((relationship) => relationship.dictionaryId && !dictionaryIds.has(relationship.dictionaryId))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  if (new Set(graph.identityDecisions.map((decision) => decision.id)).size !== graph.identityDecisions.length) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  for (const decision of graph.identityDecisions) validateIdentityDecision(decision, graph);
  return graph;
};

export function upgradeRelationshipGraphV2(graph) {
  const next = ensureLists(graph);
  if (!next.owner || ![1, 2].includes(next.settings?.schema) || Object.keys(next).some((key) => !RELATIONSHIP_GRAPH_FIELDS.has(key))) throw typedError("RELATIONSHIP_SCHEMA_INVALID");
  const fromV1 = next.settings.schema === 1;
  next.mappings = next.mappings.map(normalizeIdentityMapping);
  next.identityDecisions = next.identityDecisions.map((decision) => clone(decision));
  next.relationships = next.relationships.filter((item) => !identityPseudoRelationship(item)).map((item) => {
    if (!item || Array.isArray(item) || typeof item !== "object") throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    const id = item.relationshipId || item.id;
    const label = normalizeRelationshipLabel(item.label);
    const status = item.status === "confirmed" ? "current" : item.status;
    const upgraded = {
      ...clone(item),
      id,
      relationshipId: id,
      label,
      status,
      source: item.source || (fromV1 ? "legacy-unknown" : undefined),
      sourceIds: Array.isArray(item.sourceIds) ? [...new Set(item.sourceIds)] : [],
    };
    delete upgraded.identityMappingId;
    delete upgraded.recommendationEligible;
    delete upgraded.draftEligible;
    return upgraded;
  });
  next.dictionary = next.dictionary.map((entry) => {
    if (!entry || Array.isArray(entry) || typeof entry !== "object") throw typedError("RELATIONSHIP_SCHEMA_INVALID");
    const label = normalizeRelationshipLabel(entry.label);
    return { ...clone(entry), label, normalizedLabel: label, status: entry.status === "disabled" ? "inactive" : (entry.status || "active") };
  });
  next.settings = { schema: 2 };
  return validateRelationshipGraphV2(next);
}

const emptyRelationshipEvaluation = (code, excludedCount = 0) => ({ status: "empty", code, candidates: [], aggregate: { eligibleExcerptCount: 0, excludedExcerptCount: excludedCount } });

const LOCAL_SEMANTIC_VERSION = "local-semantic-v2";
const LOCAL_SEMANTIC_MAX_MESSAGES = 400;
const LOCAL_SEMANTIC_MAX_CHARACTERS = 80_000;
const LOCAL_SEMANTIC_LABEL_ORDER = ["客户", "合作伙伴", "前同事", "老同学", "朋友"];
const LOCAL_SEMANTIC_SAFE_ORDER = ["work", "study", "daily", "interest"];
const LOCAL_SEMANTIC_TERMS = Object.freeze({
  work: ["工作", "项目", "合作", "客户", "业务", "同事", "公司", "方案", "交付"],
  study: ["学校", "同学", "课程", "考试", "学习", "进修", "校园"],
  daily: ["日常", "生活", "近况", "周末", "散步", "吃饭", "天气", "见面"],
  interest: ["兴趣", "运动", "跑步", "健身", "阅读", "音乐", "电影", "旅行", "摄影", "游戏"],
  collaboration: ["项目", "方案", "交付", "合作"],
  customer: ["需求", "报价", "方案", "服务", "客户"],
});
const LOCAL_SEMANTIC_SENSITIVE = /(?:医疗|健康|医院|看病|治疗|诊断|疾病|药物|借钱|欠款|贷款|债务|投资|财务|金钱|离婚|分手|争吵|家庭矛盾|感情冲突|法律|诉讼|案件|政治|选举|政党)/u;
const LOCAL_SEMANTIC_PAST_WORK = /(?:曾经|以前|之前)[\s\S]{0,20}(?:同事|公司|离职|工作)|(?:同事|公司|离职|工作)[\s\S]{0,20}(?:曾经|以前|之前)/u;
const LOCAL_SEMANTIC_TEMPLATES = Object.freeze({
  work: { safeAngle: "工作近况", draft: (name) => `${name}，最近工作还顺利吗？想起你，来问候一下。` },
  study: { safeAngle: "学习近况", draft: (name) => `${name}，最近学习和进修还顺利吗？想起你，来问候一下。` },
  daily: { safeAngle: "日常近况", draft: (name) => `${name}，最近过得怎么样？想起你，来问候一下。` },
  interest: { safeAngle: "兴趣休闲", draft: (name) => `${name}，最近还有在忙自己喜欢的事情吗？想起你，来问候一下。` },
  generic: { safeAngle: "通用问候", draft: (name) => `${name}，最近怎么样？有段时间没联系了，来问候一下。` },
});
const LOCAL_SEMANTIC_CACHE_AAD_TEXT = "relationship-today-semantic-cache/v1";
const LOCAL_SEMANTIC_CACHE_ENTRY_LIMIT = 10_000;
const LOCAL_SEMANTIC_CACHE_PLAINTEXT_LIMIT = 8 * 1024 * 1024;
const LOCAL_SEMANTIC_CACHE_ROOT_FIELDS = new Set(["schemaVersion", "algorithmVersion", "entries"]);
const LOCAL_SEMANTIC_CACHE_ENTRY_FIELDS = new Set(["personId", "inputRevision", "state", "code", "labels", "safeTopic", "aggregate", "decisionBaseId", "identityAuthority", "acceptAllowed", "contactAllowed"]);
const LOCAL_SEMANTIC_CACHE_AGGREGATE_FIELDS = new Set(["eligibleMessageCount", "startDate", "endDate", "excludedCount"]);
const LOCAL_SEMANTIC_CACHE_RECORD_FIELDS = new Set(["recordVersion", "boundActiveGenerationId", "envelope"]);
const LOCAL_SEMANTIC_CACHE_ENVELOPE_FIELDS = new Set(["version", "algorithm", "iv", "ciphertext"]);
const LOCAL_SEMANTIC_CACHE_STATES = new Set(["ready", "generic", "empty", "reimport-required", "unconfirmed", "error"]);
const LOCAL_SEMANTIC_CACHE_CODES = new Set(["SEMANTIC_IDENTITY_UNCONFIRMED", "SEMANTIC_INSUFFICIENT_PROVENANCE", "SEMANTIC_NO_ELIGIBLE_TEXT", "SEMANTIC_ANALYSIS_FAILED", "BATCH_ANALYSIS_FAILED"]);
const LOCAL_SEMANTIC_CACHE_AUTHORITIES = new Set(["confirmed", "source-scoped-unconfirmed", "unconfirmed"]);
const LOCAL_SEMANTIC_CACHE_SAFE_TOPICS = new Set([...LOCAL_SEMANTIC_SAFE_ORDER, "generic"]);
const LOCAL_SEMANTIC_SAFE_ANGLE_TO_TOPIC = new Map(Object.entries(LOCAL_SEMANTIC_TEMPLATES).map(([topic, value]) => [value.safeAngle, topic]));
const ordinalCompare = (left, right) => left < right ? -1 : left > right ? 1 : 0;
const deepFreeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
};
const exactFields = (value, allowed) => value && !Array.isArray(value) && typeof value === "object" && Object.keys(value).every((key) => allowed.has(key)) && Object.keys(value).length === allowed.size;
const semanticCacheError = (code) => typedError(code);

const semanticStableHash = (value) => {
  let left = 0x811c9dc5;
  let right = 0x9e3779b9;
  for (const char of String(value)) {
    const code = char.codePointAt(0);
    left = Math.imul(left ^ code, 0x01000193) >>> 0;
    right = Math.imul(right ^ code, 0x85ebca6b) >>> 0;
  }
  return `${left.toString(16).padStart(8, "0")}${right.toString(16).padStart(8, "0")}`.toUpperCase();
};
const normalizeSemanticBody = (value) => String(value).normalize("NFKC").toLocaleLowerCase("und").replace(/\s+/gu, " ").trim();
const maskSemanticBody = (value) => value
  .replace(/https?:\/\/\S+|www\.\S+/giu, " ")
  .replace(/(?:\+?\d[\d\s()-]{6,}\d)|\d{7,}/gu, " ")
  .replace(/\s+/gu, " ").trim();
const semanticMatches = (text, category) => LOCAL_SEMANTIC_TERMS[category].some((term) => text.includes(term));
const semanticEmptyResult = (personId, state, code, excludedCount = 0) => ({
  personId,
  state,
  code,
  candidates: [],
  safeAngle: null,
  draft: "",
  aggregate: { eligibleMessageCount: 0, startDate: null, endDate: null, excludedCount },
  decisionBaseId: null,
  algorithmVersion: LOCAL_SEMANTIC_VERSION,
});
const semanticSupport = (entries, predicate) => {
  const supported = entries.filter(predicate);
  return {
    entries: supported,
    count: supported.length,
    days: new Set(supported.map((entry) => entry.day)),
    self: supported.filter((entry) => entry.direction === "self").length,
    counterparty: supported.filter((entry) => entry.direction === "counterparty").length,
  };
};

function analyzeLocalChatSemanticsFromContext(context, { personId, now, maxMessages = LOCAL_SEMANTIC_MAX_MESSAGES, maxCharacters = LOCAL_SEMANTIC_MAX_CHARACTERS } = {}) {
  if (typeof personId !== "string" || !personId || !Number.isInteger(maxMessages) || maxMessages < 1 || maxMessages > LOCAL_SEMANTIC_MAX_MESSAGES || !Number.isInteger(maxCharacters) || maxCharacters < 1 || maxCharacters > LOCAL_SEMANTIC_MAX_CHARACTERS) throw typedError("SEMANTIC_LIMIT_INVALID");
  const { person, activeSources, allowedSources: confirmedSources, personExcerpts, relationships, purged } = context;
  if (!person || person.state !== "active" || purged || !confirmedSources.size) return semanticEmptyResult(personId, "unconfirmed", "SEMANTIC_IDENTITY_UNCONFIRMED", personExcerpts.length);

  const unique = new Map();
  let conflict = false;
  for (const item of personExcerpts) {
    if (typeof item?.id !== "string" || !item.id) { conflict = true; continue; }
    const projection = { id: item.id, sourceId: item.sourceId, conversationKind: item.conversationKind, conversationId: item.conversationId, kind: item.kind, direction: item.direction, thirdParty: item.thirdParty === true, timestamp: item.timestamp ?? item.time };
    const signature = JSON.stringify(projection);
    if (unique.has(item.id) && unique.get(item.id).signature !== signature) conflict = true;
    else if (!unique.has(item.id)) unique.set(item.id, { item: projection, sourceItem: item, signature });
  }
  if (conflict) return semanticEmptyResult(personId, "reimport-required", "SEMANTIC_INSUFFICIENT_PROVENANCE", personExcerpts.length);
  let incompleteProvenance = false;
  const eligible = [];
  for (const { item, sourceItem } of unique.values()) {
    const hasDirectFields = item.conversationKind === "direct" && typeof item.conversationId === "string" && item.conversationId.trim() && item.kind === "chat-text" && ["self", "counterparty"].includes(item.direction) && item.thirdParty !== true;
    const timestamp = relationshipTimestamp(item.timestamp);
    if (!hasDirectFields || !confirmedSources.has(item.sourceId) || timestamp === null) {
      const missing = (value) => value === undefined || value === null || value === "" || value === "unknown";
      const directOrMissing = item.conversationKind === "direct" || missing(item.conversationKind);
      if (confirmedSources.has(item.sourceId) && item.kind === "chat-text" && item.thirdParty !== true && directOrMissing && (missing(item.conversationKind) || missing(item.conversationId) || missing(item.direction) || missing(item.timestamp))) incompleteProvenance = true;
      continue;
    }
    eligible.push({ ...item, sourceItem, timestamp, sourceKind: String(activeSources.get(item.sourceId)?.sourceKind || "unknown") });
  }

  eligible.sort((left, right) => right.timestamp - left.timestamp || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  const bounded = eligible.slice(0, maxMessages);
  const processed = [];
  let sensitiveSeen = false;
  let remaining = maxCharacters;
  for (const item of bounded) {
    if (remaining <= 0) break;
    const rawText = item.sourceItem.text;
    if (typeof rawText !== "string") continue;
    const inputLimit = remaining;
    const inputTruncated = rawText.length > inputLimit;
    const boundedInput = inputTruncated ? rawText.slice(0, inputLimit) : rawText;
    const normalized = normalizeSemanticBody(boundedInput);
    const charged = normalized.slice(0, inputLimit);
    // A truncated record exhausts the remaining input budget even when
    // normalization collapses its bounded prefix; its suffix is never scanned.
    remaining -= inputTruncated ? inputLimit : charged.length;
    if (!charged) continue;
    const text = maskSemanticBody(charged);
    if (!text) continue;
    if (LOCAL_SEMANTIC_SENSITIVE.test(text)) {
      sensitiveSeen = true;
      continue;
    }
    const categories = new Set(LOCAL_SEMANTIC_SAFE_ORDER.filter((category) => semanticMatches(text, category)));
    if (semanticMatches(text, "collaboration")) categories.add("collaboration");
    if (semanticMatches(text, "customer")) categories.add("customer");
    if (LOCAL_SEMANTIC_PAST_WORK.test(text)) categories.add("past-work");
    processed.push({ id: item.id, sourceKind: item.sourceKind, timestamp: item.timestamp, day: new Date(item.timestamp).toISOString().slice(0, 10), direction: item.direction, categories });
  }
  const excludedCount = personExcerpts.length - processed.length;
  if (!processed.length) return semanticEmptyResult(personId, incompleteProvenance ? "reimport-required" : "empty", incompleteProvenance ? "SEMANTIC_INSUFFICIENT_PROVENANCE" : "SEMANTIC_NO_ELIGIBLE_TEXT", excludedCount);

  const support = (category) => semanticSupport(processed, (entry) => entry.categories.has(category));
  const customer = support("customer");
  const collaboration = support("collaboration");
  const pastWork = support("past-work");
  const study = support("study");
  const friend = semanticSupport(processed, (entry) => entry.categories.has("daily") || entry.categories.has("interest"));
  const suiyinCustomer = semanticSupport(processed, (entry) => entry.sourceKind === "suiyin-mcp" && entry.categories.has("customer"));
  const bidirectional = (value) => value.self >= 1 && value.counterparty >= 1;
  const scored = [];
  const addCandidate = (label, value, passed) => { if (passed) scored.push({ label, score: (value.count * 100) + (value.days.size * 10) + (bidirectional(value) ? 1 : 0), ordinal: LOCAL_SEMANTIC_LABEL_ORDER.indexOf(label) }); };
  addCandidate("客户", customer, (customer.count >= 4 && customer.days.size >= 2 && bidirectional(customer)) || (suiyinCustomer.count >= 2 && suiyinCustomer.days.size >= 2 && bidirectional(suiyinCustomer)));
  addCandidate("合作伙伴", collaboration, collaboration.count >= 4 && collaboration.days.size >= 2 && bidirectional(collaboration));
  addCandidate("前同事", pastWork, pastWork.count >= 3 && pastWork.days.size >= 2 && pastWork.counterparty >= 1);
  addCandidate("老同学", study, study.count >= 3 && study.days.size >= 2 && study.counterparty >= 1);
  const businessMajority = new Set(processed.filter((entry) => entry.categories.has("customer") || entry.categories.has("collaboration")).map((entry) => entry.id)).size * 2 > processed.length;
  addCandidate("朋友", friend, friend.count >= 6 && friend.days.size >= 3 && friend.self >= 2 && friend.counterparty >= 2 && !businessMajority);
  const existing = new Set(relationships.filter((item) => item?.personId === personId && CURRENT_RELATIONSHIP_STATUSES.has(item.status)).map((item) => normalizeRelationshipLabel(item.label)));
  const candidates = scored.filter((item) => !existing.has(item.label)).sort((left, right) => right.score - left.score || left.ordinal - right.ordinal || left.label.localeCompare(right.label)).slice(0, 3).map(({ label }) => ({ label }));

  const referenceTime = now === undefined ? processed[0].timestamp : relationshipTimestamp(now);
  if (referenceTime === null) throw typedError("SEMANTIC_ANALYSIS_FAILED");
  const safeTopics = LOCAL_SEMANTIC_SAFE_ORDER.map((category, ordinal) => ({ category, ordinal, value: support(category) })).filter(({ value }) => value.count >= 3 && value.days.size >= 2 && value.counterparty >= 1).sort((left, right) => right.value.count - left.value.count || right.value.days.size - left.value.days.size || left.ordinal - right.ordinal);
  const safeCategory = sensitiveSeen || !safeTopics.length ? "generic" : safeTopics[0].category;
  const template = LOCAL_SEMANTIC_TEMPLATES[safeCategory];
  const times = processed.map((entry) => entry.timestamp).sort((left, right) => left - right);
  return {
    personId,
    state: safeCategory === "generic" ? "generic" : "ready",
    candidates,
    safeAngle: template.safeAngle,
    draft: template.draft(String(person.name || "待确认身份")),
    aggregate: { eligibleMessageCount: processed.length, startDate: new Date(times[0]).toISOString().slice(0, 10), endDate: new Date(times.at(-1)).toISOString().slice(0, 10), excludedCount },
    decisionBaseId: `semantic-${semanticStableHash(`${personId}\0${processed.map((entry) => entry.id).join("\0")}\0${LOCAL_SEMANTIC_VERSION}`)}`,
    algorithmVersion: LOCAL_SEMANTIC_VERSION,
  };
}

function buildLocalSemanticContext(graph, requestedPersonIds = null, strict = false) {
  if (!graph || Array.isArray(graph) || typeof graph !== "object" || graph.settings?.schema !== 2) throw typedError(strict ? "BATCH_SNAPSHOT_INVALID" : "SEMANTIC_ANALYSIS_FAILED");
  const people = Array.isArray(graph.people) ? graph.people : [];
  const sources = Array.isArray(graph.sources) ? graph.sources : [];
  const mappings = Array.isArray(graph.mappings) ? graph.mappings : [];
  const excerpts = Array.isArray(graph.excerpts) ? graph.excerpts : [];
  const relationships = Array.isArray(graph.relationships) ? graph.relationships : [];
  const identityDecisions = Array.isArray(graph.identityDecisions) ? graph.identityDecisions : [];
  const purged = new Set(Array.isArray(graph.purgedPersonIds) ? graph.purgedPersonIds : []);
  const peopleById = new Map();
  for (const person of people) {
    if (typeof person?.id !== "string" || !person.id || peopleById.has(person.id)) {
      if (strict) throw typedError("BATCH_SNAPSHOT_INVALID");
      continue;
    }
    peopleById.set(person.id, person);
  }
  const activeSources = new Map();
  for (const source of sources) {
    if (typeof source?.id !== "string" || !source.id || activeSources.has(source.id)) {
      if (strict) throw typedError("BATCH_SNAPSHOT_INVALID");
      continue;
    }
    if (activeSource(source)) activeSources.set(source.id, source);
  }
  const badgeProjection = createSourceBadgeProjection(graph);
  const trustedSourceIds = new Set([...activeSources.values()]
    .filter((source) => trustedSourceKind(badgeProjection.sourceKind(source)))
    .map((source) => source.id));
  const sourceProvenanceById = new Map([...activeSources.values()].map((source) => [source.id, badgeProjection.sourceKind(source)]));
  const sourceAliasesById = new Map([...activeSources.values()].map((source) => {
    const registry = normalizeSuiyinAccountLabels(source.sourceAccountLabels);
    return [source.id, sourceOwnedAliases(source.id, mappings, registry)];
  }));
  const activePersonIds = [...peopleById.values()]
    .filter((person) => person.state !== "trashed" && !purged.has(person.id))
    .map((person) => person.id)
    .sort((left, right) => left.localeCompare(right));
  let personIds = activePersonIds;
  if (requestedPersonIds !== null) {
    if (!Array.isArray(requestedPersonIds) || requestedPersonIds.some((personId) => typeof personId !== "string" || !personId) || new Set(requestedPersonIds).size !== requestedPersonIds.length) throw typedError("BATCH_SNAPSHOT_INVALID");
    const active = new Set(activePersonIds);
    personIds = requestedPersonIds.filter((personId) => active.has(personId)).sort((left, right) => left.localeCompare(right));
  }
  const targetIds = new Set(personIds);
  const mappingsByPerson = new Map(personIds.map((personId) => [personId, []]));
  const mappingIds = new Set();
  for (const mapping of mappings) {
    if (typeof mapping?.id !== "string" || !mapping.id || mappingIds.has(mapping.id)) {
      if (strict) throw typedError("BATCH_SNAPSHOT_INVALID");
      continue;
    }
    mappingIds.add(mapping.id);
    if (!targetIds.has(mapping?.personId) || !activeSources.has(mapping?.sourceId)) continue;
    mappingsByPerson.get(mapping.personId).push(mapping);
  }
  const excerptsByPerson = new Map(personIds.map((personId) => [personId, []]));
  const excerptIds = new Set();
  for (const excerpt of excerpts) {
    if (typeof excerpt?.id !== "string" || !excerpt.id || excerptIds.has(excerpt.id)) {
      if (strict) throw typedError("BATCH_SNAPSHOT_INVALID");
      continue;
    }
    excerptIds.add(excerpt.id);
    if (targetIds.has(excerpt?.personId)) excerptsByPerson.get(excerpt.personId).push(excerpt);
  }
  const relationshipsByPerson = new Map(personIds.map((personId) => [personId, []]));
  const relationshipIds = new Set();
  for (const relationship of relationships) {
    if (typeof relationship?.id !== "string" || !relationship.id || relationshipIds.has(relationship.id)) {
      if (strict) throw typedError("BATCH_SNAPSHOT_INVALID");
      continue;
    }
    relationshipIds.add(relationship.id);
    if (targetIds.has(relationship?.personId)) relationshipsByPerson.get(relationship.personId).push(relationship);
  }
  const decisionsByPerson = new Map(personIds.map((personId) => [personId, []]));
  for (const decision of identityDecisions) {
    if (!decision || typeof decision !== "object") continue;
    const decisionMappingIds = new Set(Array.isArray(decision.mappingIds) ? decision.mappingIds : []);
    for (const personId of personIds) {
      const involved = decision.canonicalPersonId === personId
        || decision.secondaryPersonId === personId
        || (mappingsByPerson.get(personId) || []).some((mapping) => decisionMappingIds.has(mapping.id));
      if (involved) decisionsByPerson.get(personId).push(decision);
    }
  }
  return {
    activeSources,
    peopleById,
    personIds,
    contextFor(personId, allowPending = false) {
      const person = peopleById.get(personId);
      const activeMappings = mappingsByPerson.get(personId) || [];
      const confirmedSources = new Set(activeMappings.filter((mapping) => mapping.status === "confirmed" && trustedSourceIds.has(mapping.sourceId)).map((mapping) => mapping.sourceId));
      const pendingSources = new Set(activeMappings.filter((mapping) => mapping.status === "pending" && trustedSourceIds.has(mapping.sourceId)).map((mapping) => mapping.sourceId));
      const exactPending = allowPending
        && person?.state === "pending"
        && person?.sourceScoped === true
        && confirmedSources.size === 0
        && pendingSources.size === 1
        && activeMappings.length === 1;
      const confirmed = person?.state === "active" && confirmedSources.size > 0;
      return {
        person,
        activeSources,
        sourceProvenanceById,
        sourceAliasesById,
        mappings: activeMappings,
        allowedSources: confirmed ? confirmedSources : exactPending ? pendingSources : new Set(),
        personExcerpts: excerptsByPerson.get(personId) || [],
        relationships: relationshipsByPerson.get(personId) || [],
        identityDecisions: decisionsByPerson.get(personId) || [],
        purged: purged.has(personId),
        identityState: confirmed ? "confirmed" : "unconfirmed",
        exactPending,
      };
    },
  };
}

const semanticPersonInputRevision = (context) => {
  const person = context.person;
  if (!person || typeof person.id !== "string" || !person.id) throw typedError("BATCH_ANALYSIS_FAILED");
  const sourceIds = new Set();
  const mappings = [];
  for (const mapping of context.mappings || []) {
    if (typeof mapping?.id !== "string" || !mapping.id || typeof mapping.sourceId !== "string" || !mapping.sourceId || typeof mapping.personId !== "string" || !mapping.personId) throw typedError("BATCH_ANALYSIS_FAILED");
    sourceIds.add(mapping.sourceId);
    mappings.push({
      id: mapping.id,
      sourceId: mapping.sourceId,
      sourcePersonId: typeof mapping.sourcePersonId === "string" ? mapping.sourcePersonId : null,
      personId: mapping.personId,
      status: typeof mapping.status === "string" ? mapping.status : null,
      sourceAccountAliases: normalizeSourceAccountAliases(mapping.sourceAccountAliases),
    });
  }
  mappings.sort((left, right) => ordinalCompare(left.id, right.id));
  const sources = [...sourceIds].map((sourceId) => {
    const source = context.activeSources.get(sourceId);
    if (!source) throw typedError("BATCH_ANALYSIS_FAILED");
    return {
      id: source.id,
      state: typeof source.state === "string" ? source.state : null,
      sourceKind: typeof source.sourceKind === "string" ? source.sourceKind : null,
      sourceBundleRevision: typeof source.sourceBundleRevision === "string" ? source.sourceBundleRevision : null,
      provenanceState: context.sourceProvenanceById?.get(source.id) || "unknown",
      sourceAccountAliases: [...(context.sourceAliasesById?.get(source.id) || [])],
    };
  }).sort((left, right) => ordinalCompare(left.id, right.id));
  const seenExcerptIds = new Set();
  const excerpts = [];
  for (const excerpt of context.personExcerpts || []) {
    if (typeof excerpt?.id !== "string" || !excerpt.id || seenExcerptIds.has(excerpt.id)) throw typedError("BATCH_ANALYSIS_FAILED");
    seenExcerptIds.add(excerpt.id);
    const timestampValue = excerpt.timestamp ?? excerpt.time ?? null;
    if (timestampValue !== null && !["string", "number"].includes(typeof timestampValue)) throw typedError("BATCH_ANALYSIS_FAILED");
    const metadata = {
      id: excerpt.id,
      sourceId: typeof excerpt.sourceId === "string" ? excerpt.sourceId : null,
      personId: typeof excerpt.personId === "string" ? excerpt.personId : null,
      kind: typeof excerpt.kind === "string" ? excerpt.kind : null,
      conversationKind: typeof excerpt.conversationKind === "string" ? excerpt.conversationKind : null,
      conversationId: typeof excerpt.conversationId === "string" ? excerpt.conversationId : null,
      direction: typeof excerpt.direction === "string" ? excerpt.direction : null,
      thirdParty: excerpt.thirdParty === true,
      timestamp: timestampValue,
    };
    const timestamp = relationshipTimestamp(timestampValue);
    const bodyEligible = metadata.conversationKind === "direct"
      && Boolean(metadata.conversationId?.trim())
      && metadata.kind === "chat-text"
      && ["self", "counterparty"].includes(metadata.direction)
      && metadata.thirdParty === false
      && context.allowedSources.has(metadata.sourceId)
      && timestamp !== null;
    excerpts.push({ ...metadata, text: bodyEligible ? (typeof excerpt.text === "string" ? excerpt.text : null) : null });
  }
  excerpts.sort((left, right) => ordinalCompare(left.id, right.id));
  const relationships = (context.relationships || []).map((relationship) => {
    if (typeof relationship?.id !== "string" || !relationship.id) throw typedError("BATCH_ANALYSIS_FAILED");
    return { id: relationship.id, personId: relationship.personId ?? null, label: relationship.label ?? null, status: relationship.status ?? null };
  }).sort((left, right) => ordinalCompare(left.id, right.id));
  const identityDecisions = (context.identityDecisions || []).map((decision) => ({
    id: typeof decision.id === "string" ? decision.id : null,
    status: typeof decision.status === "string" ? decision.status : null,
    mappingIds: Array.isArray(decision.mappingIds) ? [...decision.mappingIds].sort(ordinalCompare) : [],
    canonicalPersonId: typeof decision.canonicalPersonId === "string" ? decision.canonicalPersonId : null,
    secondaryPersonId: typeof decision.secondaryPersonId === "string" ? decision.secondaryPersonId : null,
  })).sort((left, right) => ordinalCompare(String(left.id), String(right.id)));
  const projection = {
    person: { id: person.id, name: typeof person.name === "string" ? person.name : null, state: typeof person.state === "string" ? person.state : null, sourceScoped: person.sourceScoped === true },
    sources,
    mappings,
    excerpts,
    relationships,
    purged: context.purged === true,
    identityDecisions,
  };
  return sha256HexSync(`analysis-cache-person-input/v2\0${stableObject(projection)}`);
};

export function analyzeLocalChatSemantics(graph, options = {}) {
  const personId = options?.personId;
  const indexed = buildLocalSemanticContext(graph, typeof personId === "string" && personId ? [personId] : [], false);
  return analyzeLocalChatSemanticsFromContext(indexed.contextFor(personId, false), options);
}

export function createLocalSemanticBatchSnapshot(graph, { personIds = null, now, maxMessages = LOCAL_SEMANTIC_MAX_MESSAGES, maxCharacters = LOCAL_SEMANTIC_MAX_CHARACTERS } = {}) {
  if (!Number.isInteger(maxMessages) || maxMessages < 1 || maxMessages > LOCAL_SEMANTIC_MAX_MESSAGES || !Number.isInteger(maxCharacters) || maxCharacters < 1 || maxCharacters > LOCAL_SEMANTIC_MAX_CHARACTERS) throw typedError("BATCH_SNAPSHOT_INVALID");
  const indexed = buildLocalSemanticContext(graph, personIds, true);
  const stableIds = Object.freeze([...indexed.personIds]);
  const analyzeFromContext = (personId, context) => {
    if (!context.allowedSources.size) {
      return {
        ...semanticEmptyResult(personId, "unconfirmed", "SEMANTIC_IDENTITY_UNCONFIRMED", context.personExcerpts.length),
        identityState: "unconfirmed",
        acceptAllowed: false,
        contactAllowed: false,
      };
    }
    const result = analyzeLocalChatSemanticsFromContext({ ...context, person: context.exactPending ? { ...context.person, state: "active" } : context.person }, { personId, now, maxMessages, maxCharacters });
    return {
      ...result,
      identityState: context.identityState,
      acceptAllowed: context.identityState === "confirmed",
      contactAllowed: context.identityState === "confirmed",
    };
  };
  return Object.freeze({
    algorithmVersion: LOCAL_SEMANTIC_VERSION,
    total: stableIds.length,
    personIds: stableIds,
    analyze(personId) {
      if (!stableIds.includes(personId)) throw typedError("BATCH_ANALYSIS_FAILED");
      const context = indexed.contextFor(personId, true);
      return analyzeFromContext(personId, context);
    },
    analyzeForCache(personId) {
      if (!stableIds.includes(personId)) throw typedError("BATCH_ANALYSIS_FAILED");
      const context = indexed.contextFor(personId, true);
      return Object.freeze({ result: deepFreeze(clone(analyzeFromContext(personId, context))), inputRevision: semanticPersonInputRevision(context) });
    },
  });
}

const semanticCacheEntryFromAnalyzed = (personId, analyzed) => {
  if (!analyzed || typeof analyzed !== "object" || !IDENTITY_HASH_PATTERN.test(String(analyzed.inputRevision || "")) || !analyzed.result || analyzed.result.personId !== personId) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
  const result = analyzed.result;
  const labels = [...new Set((Array.isArray(result.candidates) ? result.candidates : []).map((candidate) => candidate?.label).filter((label) => LOCAL_SEMANTIC_LABEL_ORDER.includes(label)))].sort((left, right) => LOCAL_SEMANTIC_LABEL_ORDER.indexOf(left) - LOCAL_SEMANTIC_LABEL_ORDER.indexOf(right)).slice(0, 3);
  const safeTopic = result.safeAngle === null || result.safeAngle === undefined ? null : LOCAL_SEMANTIC_SAFE_ANGLE_TO_TOPIC.get(result.safeAngle) || null;
  const identityAuthority = result.identityState === "confirmed" ? "confirmed" : result.state === "unconfirmed" ? "unconfirmed" : "source-scoped-unconfirmed";
  return {
    personId,
    inputRevision: analyzed.inputRevision,
    state: result.state,
    code: result.code ?? null,
    labels,
    safeTopic,
    aggregate: {
      eligibleMessageCount: result.aggregate?.eligibleMessageCount,
      startDate: result.aggregate?.startDate ?? null,
      endDate: result.aggregate?.endDate ?? null,
      excludedCount: result.aggregate?.excludedCount,
    },
    decisionBaseId: result.decisionBaseId ?? null,
    identityAuthority,
    acceptAllowed: result.acceptAllowed === true,
    contactAllowed: result.contactAllowed === true,
  };
};

const normalizeLocalSemanticCachePayload = (payload, graph = null, requireCoverage = true) => {
  if (!exactFields(payload, LOCAL_SEMANTIC_CACHE_ROOT_FIELDS) || payload.schemaVersion !== 1 || !Array.isArray(payload.entries)) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
  if (payload.algorithmVersion !== LOCAL_SEMANTIC_VERSION) throw semanticCacheError("ANALYSIS_CACHE_ALGORITHM_MISMATCH");
  if (payload.entries.length > LOCAL_SEMANTIC_CACHE_ENTRY_LIMIT) throw semanticCacheError("ANALYSIS_CACHE_COVERAGE_INVALID");
  const entries = [];
  const seen = new Set();
  let previousPersonId = null;
  for (const raw of payload.entries) {
    if (!exactFields(raw, LOCAL_SEMANTIC_CACHE_ENTRY_FIELDS) || !exactFields(raw.aggregate, LOCAL_SEMANTIC_CACHE_AGGREGATE_FIELDS)) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
    const entry = clone(raw);
    if (typeof entry.personId !== "string" || !entry.personId || seen.has(entry.personId) || (previousPersonId !== null && ordinalCompare(previousPersonId, entry.personId) >= 0) || !IDENTITY_HASH_PATTERN.test(entry.inputRevision)) throw semanticCacheError("ANALYSIS_CACHE_COVERAGE_INVALID");
    seen.add(entry.personId);
    previousPersonId = entry.personId;
    if (!LOCAL_SEMANTIC_CACHE_STATES.has(entry.state) || (entry.code !== null && !LOCAL_SEMANTIC_CACHE_CODES.has(entry.code)) || !Array.isArray(entry.labels) || entry.labels.length > 3 || new Set(entry.labels).size !== entry.labels.length || entry.labels.some((label) => !LOCAL_SEMANTIC_LABEL_ORDER.includes(label))) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
    if (entry.labels.some((label, index) => index > 0 && LOCAL_SEMANTIC_LABEL_ORDER.indexOf(entry.labels[index - 1]) >= LOCAL_SEMANTIC_LABEL_ORDER.indexOf(label))) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
    if (entry.safeTopic !== null && !LOCAL_SEMANTIC_CACHE_SAFE_TOPICS.has(entry.safeTopic)) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
    if (!nonNegativeInteger(entry.aggregate.eligibleMessageCount) || !nonNegativeInteger(entry.aggregate.excludedCount)) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
    const datesValid = [entry.aggregate.startDate, entry.aggregate.endDate].every((date) => date === null || (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(`${date}T00:00:00.000Z`))));
    if (!datesValid || (entry.aggregate.startDate !== null && entry.aggregate.endDate !== null && entry.aggregate.startDate > entry.aggregate.endDate)) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
    if (entry.decisionBaseId !== null && !/^semantic-[0-9A-F]{16}$/.test(entry.decisionBaseId)) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
    if (!LOCAL_SEMANTIC_CACHE_AUTHORITIES.has(entry.identityAuthority) || typeof entry.acceptAllowed !== "boolean" || typeof entry.contactAllowed !== "boolean") throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
    const confirmed = entry.identityAuthority === "confirmed";
    if (entry.acceptAllowed !== confirmed || entry.contactAllowed !== confirmed || (entry.identityAuthority === "unconfirmed") !== (entry.state === "unconfirmed")) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
    const success = entry.state === "ready" || entry.state === "generic";
    if (success) {
      if (entry.code !== null || entry.aggregate.eligibleMessageCount < 1 || entry.aggregate.startDate === null || entry.aggregate.endDate === null || entry.decisionBaseId === null || (entry.state === "generic" ? entry.safeTopic !== "generic" : !LOCAL_SEMANTIC_SAFE_ORDER.includes(entry.safeTopic))) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
    } else {
      const expectedCodes = {
        empty: new Set(["SEMANTIC_NO_ELIGIBLE_TEXT", "SEMANTIC_IDENTITY_UNCONFIRMED"]),
        "reimport-required": new Set(["SEMANTIC_INSUFFICIENT_PROVENANCE"]),
        unconfirmed: new Set(["SEMANTIC_IDENTITY_UNCONFIRMED"]),
        error: new Set(["SEMANTIC_ANALYSIS_FAILED", "BATCH_ANALYSIS_FAILED"]),
      };
      if (!expectedCodes[entry.state]?.has(entry.code) || entry.labels.length || entry.safeTopic !== null || entry.aggregate.eligibleMessageCount !== 0 || entry.aggregate.startDate !== null || entry.aggregate.endDate !== null || entry.decisionBaseId !== null) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
    }
    entries.push(entry);
  }
  if (graph !== null && requireCoverage) {
    if (!graph || Array.isArray(graph) || typeof graph !== "object" || graph.settings?.schema !== 2 || !Array.isArray(graph.people) || !Array.isArray(graph.purgedPersonIds)) throw semanticCacheError("ANALYSIS_CACHE_COVERAGE_INVALID");
    const purged = new Set(graph.purgedPersonIds);
    const activeIds = graph.people.filter((person) => person?.state !== "trashed" && person?.state !== "purged" && !purged.has(person?.id)).map((person) => person?.id);
    if (activeIds.some((id) => typeof id !== "string" || !id) || new Set(activeIds).size !== activeIds.length) throw semanticCacheError("ANALYSIS_CACHE_COVERAGE_INVALID");
    activeIds.sort(ordinalCompare);
    if (activeIds.length !== entries.length || activeIds.some((id, index) => entries[index].personId !== id)) throw semanticCacheError("ANALYSIS_CACHE_COVERAGE_INVALID");
  }
  const normalized = { schemaVersion: 1, algorithmVersion: LOCAL_SEMANTIC_VERSION, entries };
  if (encoder.encode(stableObject(normalized)).byteLength > LOCAL_SEMANTIC_CACHE_PLAINTEXT_LIMIT) throw semanticCacheError("ANALYSIS_CACHE_COVERAGE_INVALID");
  return normalized;
};

export function validateLocalSemanticCachePayload(payload, graph) {
  return clone(normalizeLocalSemanticCachePayload(payload, graph, graph !== undefined));
}

export function buildLocalSemanticCachePayload(graph, analyzedResults, { previousPayload = null, mode = "full", affectedPersonIds = [] } = {}) {
  if (!(analyzedResults instanceof Map) || !["full", "affected"].includes(mode) || !Array.isArray(affectedPersonIds) || affectedPersonIds.some((id) => typeof id !== "string" || !id) || new Set(affectedPersonIds).size !== affectedPersonIds.length) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
  const purged = new Set(Array.isArray(graph?.purgedPersonIds) ? graph.purgedPersonIds : []);
  const activeIds = (Array.isArray(graph?.people) ? graph.people : []).filter((person) => person?.state !== "trashed" && person?.state !== "purged" && !purged.has(person?.id)).map((person) => person?.id).sort(ordinalCompare);
  if (activeIds.some((id) => typeof id !== "string" || !id) || new Set(activeIds).size !== activeIds.length) throw semanticCacheError("ANALYSIS_CACHE_COVERAGE_INVALID");
  const affected = new Set(mode === "full" ? activeIds : affectedPersonIds);
  const previousEntries = new Map();
  if (mode === "affected") {
    const previous = normalizeLocalSemanticCachePayload(previousPayload, null, false);
    for (const entry of previous.entries) previousEntries.set(entry.personId, entry);
  }
  if ([...analyzedResults.keys()].some((id) => !affected.has(id)) || [...affected].some((id) => activeIds.includes(id) && !analyzedResults.has(id))) throw semanticCacheError("ANALYSIS_CACHE_COVERAGE_INVALID");
  const entries = activeIds.map((personId) => affected.has(personId) ? semanticCacheEntryFromAnalyzed(personId, analyzedResults.get(personId)) : clone(previousEntries.get(personId)));
  if (entries.some((entry) => !entry)) throw semanticCacheError("ANALYSIS_CACHE_COVERAGE_INVALID");
  return validateLocalSemanticCachePayload({ schemaVersion: 1, algorithmVersion: LOCAL_SEMANTIC_VERSION, entries }, graph);
}

const readonlySemanticResultMap = (entries) => {
  const map = new Map(entries);
  const immutable = () => { throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID"); };
  Object.defineProperties(map, {
    set: { value: immutable },
    delete: { value: immutable },
    clear: { value: immutable },
  });
  return Object.freeze(map);
};

export function hydrateLocalSemanticCache(graph, payload) {
  const normalized = normalizeLocalSemanticCachePayload(payload, graph, true);
  const people = new Map(graph.people.map((person) => [person.id, person]));
  return readonlySemanticResultMap(normalized.entries.map((entry) => {
    const template = entry.safeTopic === null ? null : LOCAL_SEMANTIC_TEMPLATES[entry.safeTopic];
    const result = {
      personId: entry.personId,
      state: entry.state,
      ...(entry.code === null ? {} : { code: entry.code }),
      candidates: entry.labels.map((label) => ({ label })),
      safeAngle: template?.safeAngle ?? null,
      draft: template ? template.draft(String(people.get(entry.personId)?.name || "待确认身份")) : "",
      aggregate: clone(entry.aggregate),
      decisionBaseId: entry.decisionBaseId,
      algorithmVersion: LOCAL_SEMANTIC_VERSION,
      identityState: entry.identityAuthority === "confirmed" ? "confirmed" : "unconfirmed",
      acceptAllowed: entry.acceptAllowed,
      contactAllowed: entry.contactAllowed,
    };
    return [entry.personId, deepFreeze(result)];
  }));
}

function semanticDiffIndex(graph) {
  if (!graph || Array.isArray(graph) || typeof graph !== "object" || graph.settings?.schema !== 2) return null;
  const people = Array.isArray(graph.people) ? graph.people : [];
  const sources = Array.isArray(graph.sources) ? graph.sources : [];
  const mappings = Array.isArray(graph.mappings) ? graph.mappings : [];
  const excerpts = Array.isArray(graph.excerpts) ? graph.excerpts : [];
  const relationships = Array.isArray(graph.relationships) ? graph.relationships : [];
  const identityDecisions = Array.isArray(graph.identityDecisions) ? graph.identityDecisions : [];
  const mappingsBySource = new Map();
  for (const mapping of mappings) {
    if (typeof mapping?.sourceId !== "string" || !mapping.sourceId) return null;
    if (!mappingsBySource.has(mapping.sourceId)) mappingsBySource.set(mapping.sourceId, []);
    mappingsBySource.get(mapping.sourceId).push(mapping);
  }
  const sourceSemanticAliases = new Map();
  const sourceSemanticProvenance = new Map();
  try {
    for (const source of sources) {
      if (typeof source?.id !== "string" || !source.id) return null;
      const registry = normalizeSuiyinAccountLabels(source.sourceAccountLabels);
      const ownedMappings = mappingsBySource.get(source.id) || [];
      sourceSemanticAliases.set(source.id, sourceOwnedAliases(source.id, mappings, registry));
      sourceSemanticProvenance.set(source.id, sourceProvenanceState(source, ownedMappings));
    }
    for (const mapping of mappings) normalizeSourceAccountAliases(mapping.sourceAccountAliases);
  } catch {
    return null;
  }
  const makeIndex = (items, project) => {
    const index = new Map();
    for (const item of items) {
      if (typeof item?.id !== "string" || !item.id || index.has(item.id)) return null;
      index.set(item.id, { item, signature: JSON.stringify(project(item)) });
    }
    return index;
  };
  const personIndex = makeIndex(people, (item) => ({ id: item.id, name: item.name, state: item.state, sourceScoped: item.sourceScoped === true }));
  const sourceIndex = makeIndex(sources, (item) => ({ id: item.id, state: item.state, sourceKind: item.sourceKind, sourceBundleRevision: item.sourceBundleRevision, provenanceState: sourceSemanticProvenance.get(item.id), sourceAccountAliases: sourceSemanticAliases.get(item.id) }));
  if (!personIndex || !sourceIndex) return null;
  const mappingIndex = makeIndex(mappings, (item) => ({ id: item.id, sourceId: item.sourceId, sourcePersonId: item.sourcePersonId, personId: item.personId, status: item.status, sourceAccountAliases: normalizeSourceAccountAliases(item.sourceAccountAliases) }));
  const excerptIndex = makeIndex(excerpts, (item) => ({ id: item.id, sourceId: item.sourceId, personId: item.personId, kind: item.kind, conversationKind: item.conversationKind, conversationId: item.conversationId, direction: item.direction, thirdParty: item.thirdParty === true, timestamp: item.timestamp ?? item.time, text: item.text }));
  const relationshipIndex = makeIndex(relationships, (item) => ({ id: item.id, personId: item.personId, label: item.label, status: item.status }));
  const identityDecisionIndex = makeIndex(identityDecisions, (item) => ({ id: item.id, status: item.status, mappingIds: Array.isArray(item.mappingIds) ? [...item.mappingIds].sort(ordinalCompare) : null, canonicalPersonId: item.canonicalPersonId ?? null, secondaryPersonId: item.secondaryPersonId ?? null }));
  if (!mappingIndex || !excerptIndex || !relationshipIndex || !identityDecisionIndex) return null;
  const knownPeople = new Set(personIndex.keys());
  const knownSources = new Set(sourceIndex.keys());
  for (const { item } of mappingIndex.values()) if (!knownPeople.has(item.personId) || !knownSources.has(item.sourceId)) return null;
  for (const { item } of excerptIndex.values()) if (!knownPeople.has(item.personId) || !knownSources.has(item.sourceId)) return null;
  for (const { item } of relationshipIndex.values()) if (!knownPeople.has(item.personId)) return null;
  const decisionPeople = new Map();
  for (const [decisionId, { item }] of identityDecisionIndex) {
    if (!Array.isArray(item.mappingIds) || item.mappingIds.some((mappingId) => typeof mappingId !== "string" || !mappingIndex.has(mappingId))) return null;
    const personIds = new Set(item.mappingIds.map((mappingId) => mappingIndex.get(mappingId).item.personId));
    for (const personId of [item.canonicalPersonId, item.secondaryPersonId]) if (typeof personId === "string" && personId) personIds.add(personId);
    if ([...personIds].some((personId) => !knownPeople.has(personId))) return null;
    decisionPeople.set(decisionId, personIds);
  }
  const sourcePeople = new Map([...knownSources].map((sourceId) => [sourceId, new Set()]));
  for (const { item } of mappingIndex.values()) sourcePeople.get(item.sourceId).add(item.personId);
  for (const { item } of excerptIndex.values()) sourcePeople.get(item.sourceId).add(item.personId);
  return { personIndex, sourceIndex, mappingIndex, excerptIndex, relationshipIndex, identityDecisionIndex, decisionPeople, sourcePeople, purged: new Set(Array.isArray(graph.purgedPersonIds) ? graph.purgedPersonIds : []) };
}

export function computeLocalSemanticAffectedPeople(beforeGraph, afterGraph, { beforeAlgorithmVersion = LOCAL_SEMANTIC_VERSION, afterAlgorithmVersion = LOCAL_SEMANTIC_VERSION } = {}) {
  if (beforeAlgorithmVersion !== afterAlgorithmVersion || afterAlgorithmVersion !== LOCAL_SEMANTIC_VERSION) return { mode: "full-rescan", personIds: [] };
  const before = semanticDiffIndex(beforeGraph);
  const after = semanticDiffIndex(afterGraph);
  if (!before || !after) return { mode: "full-rescan", personIds: [] };
  const affected = new Set();
  const changedIds = (left, right) => [...new Set([...left.keys(), ...right.keys()])].filter((id) => left.get(id)?.signature !== right.get(id)?.signature);
  for (const personId of changedIds(before.personIndex, after.personIndex)) affected.add(personId);
  for (const sourceId of changedIds(before.sourceIndex, after.sourceIndex)) {
    for (const personId of before.sourcePeople.get(sourceId) || []) affected.add(personId);
    for (const personId of after.sourcePeople.get(sourceId) || []) affected.add(personId);
  }
  for (const mappingId of changedIds(before.mappingIndex, after.mappingIndex)) {
    const oldPersonId = before.mappingIndex.get(mappingId)?.item?.personId;
    const newPersonId = after.mappingIndex.get(mappingId)?.item?.personId;
    if (oldPersonId) affected.add(oldPersonId);
    if (newPersonId) affected.add(newPersonId);
  }
  for (const excerptId of changedIds(before.excerptIndex, after.excerptIndex)) {
    const oldPersonId = before.excerptIndex.get(excerptId)?.item?.personId;
    const newPersonId = after.excerptIndex.get(excerptId)?.item?.personId;
    if (oldPersonId) affected.add(oldPersonId);
    if (newPersonId) affected.add(newPersonId);
  }
  for (const relationshipId of changedIds(before.relationshipIndex, after.relationshipIndex)) {
    const oldPersonId = before.relationshipIndex.get(relationshipId)?.item?.personId;
    const newPersonId = after.relationshipIndex.get(relationshipId)?.item?.personId;
    if (oldPersonId) affected.add(oldPersonId);
    if (newPersonId) affected.add(newPersonId);
  }
  for (const decisionId of changedIds(before.identityDecisionIndex, after.identityDecisionIndex)) {
    for (const personId of before.decisionPeople.get(decisionId) || []) affected.add(personId);
    for (const personId of after.decisionPeople.get(decisionId) || []) affected.add(personId);
  }
  for (const personId of new Set([...before.purged, ...after.purged])) if (before.purged.has(personId) !== after.purged.has(personId)) affected.add(personId);
  return { mode: "affected", personIds: [...affected].sort((left, right) => left.localeCompare(right)) };
}

export function evaluateRelationshipLabelCandidates(graph, { personId, now = new Date().toISOString() } = {}) {
  const next = upgradeRelationshipGraphV2(graph);
  const nowTime = relationshipTimestamp(now);
  if (nowTime === null || typeof personId !== "string" || !personId) throw typedError("RELATIONSHIP_CANDIDATE_INVALID");
  const person = next.people.find((item) => item.id === personId);
  const sourceProjection = createSourceBadgeProjection(next);
  const activeSources = new Map(next.sources.filter((source) => activeSource(source) && trustedSourceKind(sourceProjection.sourceKind(source))).map((source) => [source.id, source]));
  const confirmedMappings = new Set(next.mappings.filter((mapping) => mapping.personId === personId && mapping.status === "confirmed" && activeSources.has(mapping.sourceId)).map((mapping) => mapping.sourceId));
  if (!person || person.state !== "active" || next.purgedPersonIds.includes(personId) || !confirmedMappings.size) return emptyRelationshipEvaluation("RELATIONSHIP_PERSON_INELIGIBLE", next.excerpts.filter((item) => item.personId === personId).length);

  const metadata = next.excerpts.filter((item) => item.personId === personId).map((item) => ({
    id: item.id,
    sourceId: item.sourceId,
    conversationId: item.conversationId,
    conversationKind: item.conversationKind,
    direction: item.direction,
    kind: item.kind,
    thirdParty: item.thirdParty === true,
    timestamp: item.timestamp ?? item.time,
  }));
  const unique = new Map();
  let conflict = false;
  for (const item of metadata) {
    if (typeof item.id !== "string" || !item.id) { conflict = true; continue; }
    const signature = JSON.stringify(item);
    if (unique.has(item.id) && unique.get(item.id).signature !== signature) conflict = true;
    else if (!unique.has(item.id)) unique.set(item.id, { item, signature });
  }
  if (conflict) return emptyRelationshipEvaluation("RELATIONSHIP_EVIDENCE_INSUFFICIENT", metadata.length);
  const eligible = [...unique.values()].map(({ item }) => item).filter((item) => confirmedMappings.has(item.sourceId)
    && item.conversationKind === "direct"
    && typeof item.conversationId === "string" && item.conversationId
    && item.kind === "chat-text"
    && ["self", "counterparty"].includes(item.direction)
    && item.thirdParty !== true
    && relationshipTimestamp(item.timestamp) !== null);
  const excludedExcerptCount = unique.size - eligible.length;
  if (!eligible.length) return emptyRelationshipEvaluation("RELATIONSHIP_EVIDENCE_INSUFFICIENT", excludedExcerptCount);

  const groups = new Map();
  for (const item of eligible) {
    const key = `${item.sourceId}\0${item.conversationId}`;
    if (!groups.has(key)) groups.set(key, { source: activeSources.get(item.sourceId), items: [] });
    groups.get(key).items.push(item);
  }
  const existing = new Set(next.relationships.filter((item) => item.personId === personId && CURRENT_RELATIONSHIP_STATUSES.has(item.status)).map((item) => normalizeRelationshipLabel(item.label)));
  const scored = [];
  for (const group of groups.values()) {
    const times = group.items.map((item) => relationshipTimestamp(item.timestamp)).sort((left, right) => left - right);
    const utcDays = new Set(times.map((time) => new Date(time).toISOString().slice(0, 10)));
    const selfCount = group.items.filter((item) => item.direction === "self").length;
    const counterpartyCount = group.items.filter((item) => item.direction === "counterparty").length;
    const count = group.items.length;
    const evidence = { sourceCategory: String(group.source?.sourceKind || "unknown"), conversationScope: "one-to-one", excerptCount: count, utcDateCount: utcDays.size, directions: { self: selfCount, counterparty: counterpartyCount }, firstAt: new Date(times[0]).toISOString(), lastAt: new Date(times.at(-1)).toISOString() };
    const base = count >= 4 && utcDays.size >= 2 && selfCount >= 1 && counterpartyCount >= 1;
    if (base && group.source?.sourceKind === "suiyin-mcp" && !existing.has("客户")) scored.push({ label: "客户", score: 300 + Math.min(count, 99), ordinal: RELATIONSHIP_SYSTEM_LABELS.indexOf("客户"), evidence });
    if (group.source?.sourceKind === "wechat-export-toolkit" && count >= 8 && utcDays.size >= 3 && selfCount >= 2 && counterpartyCount >= 2 && !existing.has("朋友")) scored.push({ label: "朋友", score: 200 + Math.min(count, 99), ordinal: RELATIONSHIP_SYSTEM_LABELS.indexOf("朋友"), evidence });
  }
  const candidates = [...new Map(scored.sort((left, right) => right.score - left.score || left.ordinal - right.ordinal || left.label.localeCompare(right.label)).map((item) => [normalizeRelationshipLabel(item.label), item])).values()].slice(0, 3).map(({ label, evidence }) => ({ label, status: "pending", evidence }));
  if (!candidates.length) return emptyRelationshipEvaluation("RELATIONSHIP_EVIDENCE_INSUFFICIENT", excludedExcerptCount);
  return { status: "ready", code: null, candidates, aggregate: { eligibleExcerptCount: eligible.length, excludedExcerptCount } };
}

const safeCandidateEvidence = (candidate) => {
  const evidence = candidate?.evidence;
  if (!evidence || typeof evidence !== "object") return undefined;
  return {
    sourceCategory: String(evidence.sourceCategory || "unknown"),
    conversationScope: "one-to-one",
    excerptCount: Number.isInteger(evidence.excerptCount) ? evidence.excerptCount : 0,
    utcDateCount: Number.isInteger(evidence.utcDateCount) ? evidence.utcDateCount : 0,
    directions: { self: Number.isInteger(evidence.directions?.self) ? evidence.directions.self : 0, counterparty: Number.isInteger(evidence.directions?.counterparty) ? evidence.directions.counterparty : 0 },
    firstAt: typeof evidence.firstAt === "string" ? evidence.firstAt : null,
    lastAt: typeof evidence.lastAt === "string" ? evidence.lastAt : null,
  };
};

export function mutateRelationshipFacts(graph, { operation, personId, relationshipId, label, decisionId, at, candidate, semanticResult, confirmed = false } = {}) {
  const next = upgradeRelationshipGraphV2(graph);
  const person = next.people.find((item) => item.id === personId);
  if (!person || person.state !== "active" || next.purgedPersonIds.includes(personId)) throw typedError("RELATIONSHIP_PERSON_INELIGIBLE");
  if (!requiredString(decisionId) || !decisionId || !requiredString(at) || !Number.isFinite(Date.parse(at))) throw typedError("RELATIONSHIP_WRITE_FAILED");
  if (next.relationships.some((item) => item.decisionId === decisionId)) return { graph: next, changed: false, formalWriteCount: 0, relationshipId: next.relationships.find((item) => item.decisionId === decisionId).id };
  if (operation === "delete") {
    if (confirmed !== true || !requiredString(relationshipId)) throw typedError("RELATIONSHIP_WRITE_FAILED");
    const before = next.relationships.length;
    next.relationships = next.relationships.filter((item) => !(item.id === relationshipId && item.personId === personId));
    if (next.relationships.length === before) return { graph: next, changed: false, formalWriteCount: 0, relationshipId };
    return { graph: validateRelationshipGraphV2(next), changed: true, formalWriteCount: 1, relationshipId };
  }
  if (!["add", "edit", "accept", "edit-accept"].includes(operation)) throw typedError("RELATIONSHIP_WRITE_FAILED");
  if (["accept", "edit-accept"].includes(operation) && !next.mappings.some((mapping) => mapping.personId === personId && mapping.status === "confirmed" && activeSource(next.sources.find((source) => source.id === mapping.sourceId)))) throw typedError("RELATIONSHIP_PERSON_INELIGIBLE");
  const normalized = normalizeRelationshipLabel(label ?? candidate?.label);
  const existingSame = next.relationships.find((item) => item.personId === personId && CURRENT_RELATIONSHIP_STATUSES.has(item.status) && normalizeRelationshipLabel(item.label) === normalized && item.id !== relationshipId);
  if (existingSame) return { graph: next, changed: false, formalWriteCount: 0, relationshipId: existingSame.id };
  const timestamp = new Date(at).toISOString();
  const source = ["accept", "edit-accept"].includes(operation) ? "local-evaluation-confirmed" : "manual-confirmed";
  let semanticFields;
  if (semanticResult !== undefined) {
    const aggregate = semanticResult?.aggregate;
    const candidateKnown = Array.isArray(semanticResult?.candidates) && semanticResult.candidates.some((item) => item?.label === candidate?.label);
    if (!["accept", "edit-accept"].includes(operation) || !["ready", "generic"].includes(semanticResult?.state) || semanticResult.algorithmVersion !== LOCAL_SEMANTIC_VERSION || !requiredString(semanticResult.decisionBaseId) || !candidateKnown || decisionId !== `${semanticResult.decisionBaseId}${normalized}` || !Number.isInteger(aggregate?.eligibleMessageCount) || aggregate.eligibleMessageCount < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(aggregate.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(aggregate.endDate)) throw typedError("RELATIONSHIP_WRITE_FAILED");
    semanticFields = { confirmation: "accepted-semantic-suggestion", algorithmVersion: LOCAL_SEMANTIC_VERSION, eligibleMessageCount: aggregate.eligibleMessageCount, startDate: aggregate.startDate, endDate: aggregate.endDate };
  }
  const custom = !RELATIONSHIP_SYSTEM_LABEL_SET.has(normalized);
  let dictionaryId;
  if (custom) {
    let entry = next.dictionary.find((item) => normalizeRelationshipLabel(item.label) === normalized);
    if (!entry) {
      dictionaryId = dictionaryIdForLabel(normalized);
      entry = { id: dictionaryId, label: normalized, normalizedLabel: normalized, status: "active", scope: "custom", source: "manual-confirmed", createdAt: timestamp, updatedAt: timestamp };
      next.dictionary.push(entry);
    } else dictionaryId = entry.id;
  }
  if (operation === "edit") {
    const relationship = next.relationships.find((item) => item.id === relationshipId && item.personId === personId);
    if (!relationship) throw typedError("RELATIONSHIP_WRITE_FAILED");
    Object.assign(relationship, { label: normalized, source: "manual-confirmed", updatedAt: timestamp, decisionId, ...(dictionaryId ? { dictionaryId } : {}) });
    if (!dictionaryId) delete relationship.dictionaryId;
    return { graph: validateRelationshipGraphV2(next), changed: true, formalWriteCount: 1, relationshipId: relationship.id };
  }
  const id = requiredString(relationshipId) && relationshipId ? relationshipId : `relationship-${decisionId}`;
  if (next.relationships.some((item) => item.id === id)) throw typedError("RELATIONSHIP_WRITE_FAILED");
  const relationship = { id, relationshipId: id, personId, label: normalized, status: "current", source, sourceIds: [], createdAt: timestamp, updatedAt: timestamp, decisionId, ...(dictionaryId ? { dictionaryId } : {}), ...(semanticFields || (source === "local-evaluation-confirmed" && safeCandidateEvidence(candidate) ? { evidence: safeCandidateEvidence(candidate) } : {})) };
  next.relationships.push(relationship);
  return { graph: validateRelationshipGraphV2(next), changed: true, formalWriteCount: 1, relationshipId: id };
}

const IMPORT_PROVENANCE_FIELDS = Object.freeze(["conversationKind", "conversationId", "direction", "thirdParty"]);
const IMPORT_IMMUTABLE_FIELDS = Object.freeze({
  excerpt: ["type", "sourceId", "kind", "text", "timestamp"],
  signal: ["type", "sourceId", "text", "mediaDescription", "publishedAt", "time"],
});
const meaningfulImportField = (field, value) => field === "thirdParty" ? typeof value === "boolean" : typeof value === "string" ? value.length > 0 : value !== undefined && value !== null;
const copyImportProvenance = (target, source) => {
  for (const field of IMPORT_PROVENANCE_FIELDS) if (own(source, field) && meaningfulImportField(field, source[field])) target[field] = source[field];
  return target;
};
const uniqueImportIndex = (items) => {
  const index = new Map();
  for (const item of items) {
    if (!requiredString(item?.id) || !item.id || index.has(item.id)) throw typedError("IMPORT_DIFF_DUPLICATE_ID");
    index.set(item.id, item);
  }
  return index;
};
const currentImportTargets = (graph, sourceId) => {
  const targets = new Map();
  for (const mapping of ensureLists(graph || {}).mappings.filter((item) => item.sourceId === sourceId)) {
    const key = mapping.sourcePersonId || mapping.personId;
    if (!requiredString(key) || !key || !requiredString(mapping.personId) || !mapping.personId || targets.has(key)) throw typedError("IMPORT_DIFF_DUPLICATE_ID");
    targets.set(key, mapping.personId);
  }
  return targets;
};
const importItems = (preview, targets = new Map()) => [
  ...(preview?.messages || []).map((item) => copyImportProvenance({ id: item.contentId, type: "excerpt", sourceId: preview.source.sourceId, personId: targets.get(item.sourcePersonId) || item.sourcePersonId, kind: item.kind, text: item.text, timestamp: item.timestamp }, item)),
  ...(preview?.moments || []).map((item) => ({ id: item.contentId, type: "signal", sourceId: preview.source.sourceId, personId: targets.get(item.sourcePersonId) || item.sourcePersonId, text: item.body, mediaDescription: item.mediaDescription, publishedAt: item.publishedAt, time: item.time })),
];
const storedImportItems = (graph, sourceId = null) => {
  const belongsToSource = (item) => sourceId === null || item.sourceId === sourceId;
  return [
    ...ensureLists(graph).excerpts.filter(belongsToSource).map((item) => copyImportProvenance({ id: item.id, type: "excerpt", sourceId: item.sourceId, personId: item.personId, kind: item.kind, text: item.text, timestamp: item.timestamp }, item)),
    ...ensureLists(graph).signals.filter(belongsToSource).map((item) => ({ id: item.id, type: "signal", sourceId: item.sourceId, personId: item.personId, text: item.text, mediaDescription: item.mediaDescription, publishedAt: item.publishedAt, time: item.time })),
  ];
};
const sameImportValue = (left, right) => Object.is(left, right);
const classifyExistingImportItem = (before, after) => {
  if (before.type !== after.type) return "conflict";
  const immutableFields = IMPORT_IMMUTABLE_FIELDS[after.type];
  if (!immutableFields || immutableFields.some((field) => !sameImportValue(before[field], after[field]))) return "conflict";
  let updated = !sameImportValue(before.personId, after.personId);
  if (after.type === "excerpt") {
    for (const field of IMPORT_PROVENANCE_FIELDS) {
      const beforePresent = meaningfulImportField(field, before[field]);
      const afterPresent = meaningfulImportField(field, after[field]);
      if (beforePresent && afterPresent && !sameImportValue(before[field], after[field])) return "conflict";
      if (!beforePresent && afterPresent) updated = true;
    }
  }
  return updated ? "updated" : "unchanged";
};

export async function diffImportedPreview(preview, currentGraph = null) {
  if (!preview?.ok || !preview.source?.sourceId) throw typedError("preview-not-ready");
  const sourceId = preview.source.sourceId;
  const targets = currentGraph ? currentImportTargets(currentGraph, sourceId) : new Map();
  const before = uniqueImportIndex(currentGraph ? storedImportItems(currentGraph) : []);
  const sameSourceBefore = uniqueImportIndex(currentGraph ? storedImportItems(currentGraph, sourceId) : []);
  const after = uniqueImportIndex(importItems(preview, targets));
  const added = [], updated = [], suspectedDeleted = [], unchanged = [], conflicts = [];
  for (const [id, item] of after) {
    if (!before.has(id)) { added.push(id); continue; }
    const classification = classifyExistingImportItem(before.get(id), item);
    if (classification === "conflict") conflicts.push(id);
    else if (classification === "updated") updated.push(id);
    else unchanged.push(id);
  }
  for (const id of sameSourceBefore.keys()) if (!after.has(id)) suspectedDeleted.push(id);
  return { added, updated, suspectedDeleted, unchanged, conflicts };
}

export function validateLocalImportConfirmation(preview, diff) {
  if (!preview?.ok || !preview.source?.sourceId || !diff || !Array.isArray(diff.conflicts)) throw typedError("preview-not-ready");
  if (diff.conflicts.length > 0) throw typedError("IMPORT_CONFLICTS_UNRESOLVED", { conflictCount: diff.conflicts.length });
  return normalizeTransientImportReceipt(preview.receipt);
}

const buildWechatCoverageReceipt = (preview, excludedCount) => {
  const conversations = Array.isArray(preview?.conversations) ? preview.conversations : [];
  const messages = Array.isArray(preview?.messages) ? preview.messages : [];
  const conversationKindsComplete = conversations.every((conversation) => requiredString(conversation?.talker) && conversation.talker && typeof conversation.isGroup === "boolean");
  const messageKindsComplete = messages.every((message) => requiredString(message?.contentId) && message.contentId && requiredString(message?.conversationId) && message.conversationId && ["direct", "group"].includes(message.conversationKind));
  const conversationMetric = (isGroup) => conversationKindsComplete
    ? coverageMetric(new Set(conversations.filter((conversation) => conversation.isGroup === isGroup).map((conversation) => conversation.talker)).size, "exact")
    : coverageMetric(null, "blocked", "WECHAT_CANONICAL_CONVERSATION_KIND_INCOMPLETE");
  const messageMetric = (conversationKind) => messageKindsComplete
    ? coverageMetric(new Set(messages.filter((message) => message.conversationKind === conversationKind).map((message) => message.contentId)).size, "exact")
    : coverageMetric(null, "blocked", "WECHAT_CANONICAL_MESSAGE_KIND_INCOMPLETE");
  const momentsNotProvided = Array.isArray(preview?.warnings) && preview.warnings.some((warning) => warning?.code === "moments-not-provided");
  const receipt = {
    version: 1,
    scopeKind: "wechat-export-batch-v1",
    scopeComplete: false,
    metrics: {
      friends: coverageMetric(null, "blocked", "WECHAT_ROSTER_NOT_PROVIDED"),
      directConversations: conversationMetric(false),
      directMessages: messageMetric("direct"),
      groupConversations: conversationMetric(true),
      groupMessages: messageMetric("group"),
      moments: momentsNotProvided ? coverageMetric(null, "blocked", "WECHAT_MOMENTS_NOT_PROVIDED") : coverageMetric(Array.isArray(preview?.moments) ? preview.moments.length : 0, "exact"),
    },
    observedDirectParticipantCount: new Set(messages.filter((message) => message.conversationKind === "direct" && requiredString(message.sourcePersonId) && message.sourcePersonId).map((message) => message.sourcePersonId)).size,
    excludedCount,
  };
  return validateCoverageReceipt(receipt);
};

export function buildImportedGraph(preview, currentGraph = null, { confirmResurrection = false, importedAt } = {}) {
  if (!preview?.ok || !preview.source?.sourceId) throw new Error("preview-not-ready");
  const peopleById = new Map();
  for (const item of [...preview.messages, ...preview.moments]) {
    if (!item.sourcePersonId) continue;
    if (!peopleById.has(item.sourcePersonId)) peopleById.set(item.sourcePersonId, { id: item.sourcePersonId, name: item.displayName || item.name || "待确认身份", state: "pending", sourceScoped: true });
  }
  const previouslyPurged = [...peopleById.keys()].filter((id) => currentGraph?.purgedPersonIds?.includes(id));
  if (previouslyPurged.length && !confirmResurrection) throw typedError("previously-purged", { personIds: previouslyPurged, reviewRequired: true });
  const sourceId = preview.source.sourceId;
  let currentInput = currentGraph || { owner: "owner_local", settings: { schema: 2 } };
  if (confirmResurrection && previouslyPurged.length) {
    currentInput = ensureLists(currentInput);
    const resurrecting = new Set(previouslyPurged);
    for (const field of ["mappings", "excerpts", "relationships", "signals", "topics", "notes", "actions"]) currentInput[field] = currentInput[field].filter((item) => !resurrecting.has(item.personId));
    currentInput.identityDecisions = currentInput.identityDecisions.filter((decision) => decision.canonicalPersonId && resurrecting.has(decision.canonicalPersonId) || decision.secondaryPersonId && resurrecting.has(decision.secondaryPersonId) ? false : true);
  }
  const base = upgradeRelationshipGraphV2(currentInput);
  const previousMappings = new Map();
  for (const mapping of base.mappings.filter((item) => item.sourceId === sourceId)) {
    const key = mapping.sourcePersonId || mapping.personId;
    if (!requiredString(key) || !key || previousMappings.has(key)) throw typedError("IMPORT_DIFF_DUPLICATE_ID");
    previousMappings.set(key, mapping);
  }
  const previousExcerpts = uniqueImportIndex(base.excerpts.filter((item) => item.sourceId === sourceId));
  const previousSignals = uniqueImportIndex(base.signals.filter((item) => item.sourceId === sourceId));
  const warningCount = (code) => {
    const count = preview.warnings?.find((item) => item.code === code)?.count;
    return Number.isInteger(count) && count > 0 ? count : 0;
  };
  const targetPersonIds = new Map([...peopleById.keys()].map((sourcePersonId) => [sourcePersonId, previousMappings.get(sourcePersonId)?.personId || sourcePersonId]));
  uniqueImportIndex(importItems(preview, targetPersonIds));
  const senderlessGroupExcludedCount = warningCount("senderless-group-context-excluded");
  const momentParseFailureExcludedCount = warningCount("moments-parse-failures-excluded");
  const excludedCount = senderlessGroupExcludedCount + momentParseFailureExcludedCount;
  let committedReceipt = null;
  if (importedAt !== undefined) {
    if (!strictIsoTimestamp(importedAt)) throw typedError("IMPORT_RECEIPT_INVALID");
    const transientReceipt = normalizeTransientImportReceipt(preview.receipt);
    committedReceipt = { ...transientReceipt, importedAt };
  }
  const previousSource = base.sources.find((item) => item.id === sourceId);
  const receipt = {
    ...(previousSource ? clone(previousSource) : {}),
    id: sourceId,
    state: "active",
    sourceBundleRevision: preview.source.sourceBundleRevision,
    displayName: "微信导出",
    sourceKind: "wechat-export-toolkit",
    conversationCount: preview.conversations.length,
    messageCount: preview.messages.length,
    momentCount: preview.moments.length,
    excludedCount,
    senderlessGroupExcludedCount,
    momentParseFailureExcludedCount,
    coverageReceipt: buildWechatCoverageReceipt(preview, excludedCount),
    ...(committedReceipt || {}),
  };
  base.sources = base.sources.filter((item) => item.id !== sourceId).concat(receipt);
  const existingPeople = new Map(base.people.map((person) => [person.id, person]));
  for (const sourcePerson of peopleById.values()) {
    const targetPersonId = targetPersonIds.get(sourcePerson.id);
    const previous = existingPeople.get(targetPersonId);
    if (!previous) existingPeople.set(targetPersonId, { ...sourcePerson, id: targetPersonId, state: "pending" });
    else if (targetPersonId === sourcePerson.id) existingPeople.set(targetPersonId, { ...sourcePerson, state: previous.state || "pending" });
  }
  base.people = [...existingPeople.values()];
  base.excerpts = base.excerpts.filter((item) => item.sourceId !== sourceId).concat(preview.messages.map((item) => {
    const previous = previousExcerpts.get(item.contentId);
    const next = { id: item.contentId, sourceId, personId: targetPersonIds.get(item.sourcePersonId) || item.sourcePersonId, kind: item.kind, text: item.text, timestamp: item.timestamp };
    for (const field of IMPORT_PROVENANCE_FIELDS) {
      if (own(item, field) && meaningfulImportField(field, item[field])) next[field] = item[field];
      else if (previous && meaningfulImportField(field, previous[field])) next[field] = previous[field];
    }
    return next;
  }));
  base.mappings = base.mappings.filter((item) => item.sourceId !== sourceId).concat([...peopleById.values()].map((person) => {
    const previous = previousMappings.get(person.id);
    return { id: `${sourceId}:${person.id}`, sourceId, sourcePersonId: person.id, personId: targetPersonIds.get(person.id) || person.id, sourceDisplayName: person.name, sourceAccountAliases: [], status: previous?.status || "pending", ...(previous?.accountAttributionOverride ? { accountAttributionOverride: clone(previous.accountAttributionOverride) } : {}) };
  }));
  base.signals = base.signals.filter((item) => item.sourceId !== sourceId).concat(preview.moments.map((item) => {
    const previous = previousSignals.get(item.contentId);
    const status = ["pending", "topic-approved", "internal", "irrelevant", "sensitive"].includes(previous?.status) ? previous.status : "pending";
    return { id: item.contentId, sourceId, personId: targetPersonIds.get(item.sourcePersonId) || item.sourcePersonId, status, text: item.body, mediaDescription: item.mediaDescription, publishedAt: item.publishedAt, time: item.time };
  }));
  if (confirmResurrection) base.purgedPersonIds = base.purgedPersonIds.filter((id) => !peopleById.has(id));
  return base;
}

const activeSource = (source) => source && !["removed", "deleted", "invalidated"].includes(source.state);
const trustedSourceKind = (kind) => kind === "wechat" || kind === "suiyin";
const sourceBadgeCompare = (left, right) => {
  const order = { wechat: 0, suiyin: 1, conflict: 2, unknown: 3 };
  if (left.kind !== right.kind) return (order[left.kind] ?? 9) - (order[right.kind] ?? 9) || ordinalCompare(left.kind, right.kind);
  return ordinalCompare(left.label, right.label);
};
const sourceBadgeDedupeKeys = new WeakMap();
const attributedSourceBadge = (kind, label, dedupeKey) => {
  const badge = { kind, label };
  sourceBadgeDedupeKeys.set(badge, dedupeKey);
  return badge;
};
const suiyinAttributionBadge = (alias, label) => attributedSourceBadge(
  "suiyin",
  `碎银 · ${typeof label === "string" ? label : "账号待补"}`,
  `suiyin\0${alias}\0${typeof label === "string" ? label : "账号待补"}`,
);
const dedupeProjectedSourceBadges = (badges) => [...new Map(badges.map((badge) => [sourceBadgeDedupeKeys.get(badge) || `${badge.kind}\0${badge.label}`, badge])).values()].sort(sourceBadgeCompare);
const sourceProvenanceState = (source, ownedMappings = []) => {
  const explicitWechat = source?.sourceKind === "wechat-export-toolkit";
  const explicitSuiyin = source?.sourceKind === "suiyin-mcp";
  const absentKind = source?.sourceKind === undefined || source?.sourceKind === null;
  const invalidKind = !absentKind && !explicitWechat && !explicitSuiyin;
  const bundleEvidence = source?.sourceBundleRevision === SOURCE_BUNDLE_REVISION;
  let registry = {};
  let invalidRegistry = false;
  try { registry = normalizeSuiyinAccountLabels(source?.sourceAccountLabels); }
  catch { invalidRegistry = true; }
  let aliasEvidence = Object.keys(registry).length > 0;
  try { aliasEvidence ||= ownedMappings.some((mapping) => normalizeSourceAccountAliases(mapping?.sourceAccountAliases).length > 0); }
  catch { invalidRegistry = true; }
  const wechatEvidence = explicitWechat || (absentKind && bundleEvidence);
  const suiyinEvidence = explicitSuiyin || aliasEvidence;
  const knownCollision = (explicitSuiyin && bundleEvidence) || (explicitWechat && aliasEvidence);
  if (invalidRegistry || knownCollision || (wechatEvidence && suiyinEvidence) || (invalidKind && (bundleEvidence || aliasEvidence))) return "conflict";
  if (wechatEvidence) return "wechat";
  if (explicitSuiyin) return "suiyin";
  return "unknown";
};
const COLLECTION_LOCATION_RANK = Object.freeze({
  "my-wechat": 0,
  "suiyin-official": 1,
  "suiyin-pending": 2,
  conflict: 3,
  unknown: 4,
});
const collectionLocation = (kind, label, reviewRequired) => Object.freeze({
  kind,
  label,
  filterKey: JSON.stringify(["collection-location-v1", kind, label]),
  reviewRequired,
});
const collectionLocationsForMapping = (mapping, source, sourceKind) => {
  if (sourceKind === "wechat") return [collectionLocation("my-wechat", "我的微信", false)];
  if (sourceKind === "conflict") return [collectionLocation("conflict", "采集位置冲突 · 请修复", true)];
  if (sourceKind !== "suiyin") return [collectionLocation("unknown", "采集位置未识别 · 请重导", true)];
  const registry = normalizeSuiyinAccountLabels(source?.sourceAccountLabels);
  const aliases = normalizeSourceAccountAliases(mapping?.sourceAccountAliases);
  if (aliases.length === 0) return [collectionLocation("suiyin-pending", "碎银 · 账号待补", true)];
  return aliases.map((alias) => typeof registry[alias] === "string"
    ? collectionLocation("suiyin-official", `碎银 · ${registry[alias]}`, false)
    : collectionLocation("suiyin-pending", "碎银 · 账号待补", true));
};
const dedupeCollectionLocations = (locations) => {
  const deduped = [...new Map((locations || []).map((location) => [`${location.kind}\0${location.label}`, location])).values()];
  if (deduped.length === 0) deduped.push(collectionLocation("unknown", "采集位置未识别 · 请重导", true));
  deduped.sort((left, right) => (COLLECTION_LOCATION_RANK[left.kind] ?? 9) - (COLLECTION_LOCATION_RANK[right.kind] ?? 9) || ordinalCompare(left.label, right.label));
  return Object.freeze(deduped);
};
const createSourceBadgeProjection = (graph) => {
  const sources = Array.isArray(graph?.sources) ? graph.sources : [];
  const mappings = Array.isArray(graph?.mappings) ? graph.mappings : [];
  const activeSources = new Map(sources.filter((source) => source?.id && activeSource(source)).map((source) => [source.id, source]));
  const mappingsBySource = new Map([...activeSources.keys()].map((sourceId) => [sourceId, []]));
  for (const mapping of mappings) if (mappingsBySource.has(mapping?.sourceId)) mappingsBySource.get(mapping.sourceId).push(mapping);
  const provenanceBySource = new Map([...activeSources].map(([sourceId, source]) => [sourceId, sourceProvenanceState(source, mappingsBySource.get(sourceId))]));
  const attributionsByWechatSource = new Map();
  const trustedPersonas = trustedSuiyinPersonaRegistry(graph);
  for (const [suiyinSourceId, source] of activeSources) {
    if (provenanceBySource.get(suiyinSourceId) !== "suiyin") continue;
    const registry = normalizeSuiyinAccountLabels(source.sourceAccountLabels);
    const links = normalizeSuiyinWechatSourceLinks(source.sourceAccountWechatSourceLinks, registry);
    for (const [wechatSourceId, alias] of Object.entries(links)) {
      if (!activeSources.has(wechatSourceId) || provenanceBySource.get(wechatSourceId) !== "wechat") continue;
      const entry = { alias, label: registry[alias] };
      const key = `${alias}\0${typeof entry.label === "string" ? entry.label : ""}`;
      const existing = attributionsByWechatSource.get(wechatSourceId) || new Map();
      existing.set(key, entry);
      attributionsByWechatSource.set(wechatSourceId, existing);
    }
  }
  const mappingAttribution = (mapping, source) => {
    const override = mapping?.accountAttributionOverride;
    if (override?.kind === "private-wechat") return { state: "private-wechat", label: "微信", badge: attributedSourceBadge("wechat", "微信", `wechat-private\0${source?.id || "unknown"}`), canUndo: true };
    if (override?.kind === "suiyin-persona") {
      const alias = override.sourceAccountAlias;
      if (trustedPersonas.conflicts.has(alias) || !trustedPersonas.aliases.has(alias)) return { state: "conflict", label: "来源冲突 · 请修复", badge: attributedSourceBadge("conflict", "来源冲突 · 请修复", `conflict\0${source?.id || "unknown"}`), canUndo: true };
      const label = trustedPersonas.aliases.get(alias);
      return { state: "suiyin-persona", label: `碎银 · ${label}`, badge: suiyinAttributionBadge(alias, label), canUndo: true };
    }
    const attributions = [...(attributionsByWechatSource.get(source?.id)?.values() || [])];
    if (attributions.length === 1) return { state: "exact-suiyin-persona", label: `碎银 · ${typeof attributions[0].label === "string" ? attributions[0].label : "账号待补"}`, badge: suiyinAttributionBadge(attributions[0].alias, attributions[0].label), canUndo: false };
    if (attributions.length > 1) return { state: "conflict", label: "来源冲突 · 请修复", badge: attributedSourceBadge("conflict", "来源冲突 · 请修复", `conflict\0${source?.id || "unknown"}`), canUndo: false };
    return { state: "pending", label: "微信导出 · 归属待核对", badge: attributedSourceBadge("wechat", "微信导出 · 归属待核对", `wechat-pending\0${source?.id || "unknown"}`), canUndo: false };
  };
  const badgesForAliases = (source, aliases, mapping = null) => {
    const kind = provenanceBySource.get(source?.id) || sourceProvenanceState(source, []);
    if (kind === "wechat") return [mappingAttribution(mapping, source).badge];
    if (kind === "conflict") return [attributedSourceBadge("conflict", "来源冲突 · 请修复", `conflict\0${source?.id || "unknown"}`)];
    if (kind === "unknown") return [attributedSourceBadge("unknown", "来源未识别 · 请重导", `unknown\0${source?.id || "unknown"}`)];
    const registry = normalizeSuiyinAccountLabels(source?.sourceAccountLabels);
    const normalizedAliases = [...new Set(aliases)].sort(ordinalCompare);
    if (normalizedAliases.length === 0) return [attributedSourceBadge("suiyin", "碎银 · 账号待补", `suiyin-missing\0${source?.id || "unknown"}`)];
    return normalizedAliases.map((alias) => suiyinAttributionBadge(alias, registry[alias])).sort(sourceBadgeCompare);
  };
  return {
    sourceKind(source) { return provenanceBySource.get(source?.id) || sourceProvenanceState(source, []); },
    sourceBadges(mapping, source) {
      return badgesForAliases(source, normalizeSourceAccountAliases(mapping?.sourceAccountAliases), mapping);
    },
    sourceBadgesForSource(source) {
      const owned = mappingsBySource.get(source?.id) || [];
      const registry = normalizeSuiyinAccountLabels(source?.sourceAccountLabels);
      if ((provenanceBySource.get(source?.id) || sourceProvenanceState(source, owned)) === "wechat") {
        const projected = owned.length > 0 ? owned.flatMap((mapping) => badgesForAliases(source, [], mapping)) : badgesForAliases(source, [], null);
        return dedupeProjectedSourceBadges(projected);
      }
      return badgesForAliases(source, sourceOwnedAliases(source?.id, owned, registry));
    },
    mappingAttribution,
  };
};

const sourceOwnedAliases = (sourceId, mappings, registry = {}) => [...new Set([
  ...Object.keys(registry),
  ...mappings.filter((mapping) => mapping?.sourceId === sourceId).flatMap((mapping) => normalizeSourceAccountAliases(mapping?.sourceAccountAliases)),
])].sort(ordinalCompare);
const accountAttributionOptionEntries = (graph) => {
  const trusted = trustedSuiyinPersonaRegistry(graph);
  if (trusted.conflicts.size > 0) throw typedError("ACCOUNT_ATTRIBUTION_CONFLICT");
  return [...trusted.aliases.entries()]
    .map(([alias, label]) => ({ alias, label }))
    .sort((left, right) => ordinalCompare(left.label, right.label) || ordinalCompare(left.alias, right.alias));
};
const prepareAccountAttributionGraph = (graph) => {
  try { return upgradeRelationshipGraphV2(graph); }
  catch { throw typedError("ACCOUNT_ATTRIBUTION_CONFLICT"); }
};

const ACCOUNT_ATTRIBUTION_PROJECT_FIELDS = new Set(["mappingId"]);
const ACCOUNT_ATTRIBUTION_MUTATION_FIELDS = new Set(["mappingId", "operation", "selectionKind", "optionIndex", "decisionId", "at", "expectedActiveGenerationId", "currentActiveGenerationId"]);

export function projectMappingAccountAttribution(graph, input = {}) {
  if (!input || Array.isArray(input) || typeof input !== "object" || Object.keys(input).some((key) => !ACCOUNT_ATTRIBUTION_PROJECT_FIELDS.has(key))) throw typedError("ACCOUNT_ATTRIBUTION_MAPPING_INELIGIBLE");
  const { mappingId } = input;
  const next = prepareAccountAttributionGraph(graph);
  const mapping = next.mappings.find((item) => item.id === mappingId);
  const source = next.sources.find((item) => item.id === mapping?.sourceId);
  const person = next.people.find((item) => item.id === mapping?.personId);
  if (!requiredString(mappingId) || !mappingId || !mapping || !person || ["trashed", "purged"].includes(person.state) || next.purgedPersonIds.includes(person.id) || !wechatMappingEligibleForAttribution(next, mapping, source)) throw typedError("ACCOUNT_ATTRIBUTION_MAPPING_INELIGIBLE");
  const optionEntries = accountAttributionOptionEntries(next);
  const projected = createSourceBadgeProjection(next).mappingAttribution(mapping, source);
  if (projected.state === "conflict") throw typedError("ACCOUNT_ATTRIBUTION_CONFLICT");
  return {
    state: projected.state,
    currentLabel: projected.label,
    options: [{ optionIndex: 0, label: "私人微信" }, ...optionEntries.map((entry, index) => ({ optionIndex: index + 1, label: entry.label }))],
    canEdit: true,
    canUndo: Boolean(mapping.accountAttributionOverride),
    formalWriteCount: 0,
  };
}

const accountAttributionMutationResult = (graph, changed) => ({
  graph,
  changed,
  formalWriteCount: changed ? 1 : 0,
  generationDelta: changed ? 1 : 0,
  relationshipWriteCount: 0,
  identityWriteCount: 0,
  analyzerInvocationCount: 0,
  cacheWriteCount: 0,
});

export function mutateMappingAccountAttribution(graph, input = {}) {
  if (!input || Array.isArray(input) || typeof input !== "object" || Object.keys(input).some((key) => !ACCOUNT_ATTRIBUTION_MUTATION_FIELDS.has(key))) throw typedError("ACCOUNT_ATTRIBUTION_CONFLICT");
  if (!requiredString(input.expectedActiveGenerationId) || !input.expectedActiveGenerationId || !requiredString(input.currentActiveGenerationId) || !input.currentActiveGenerationId || input.expectedActiveGenerationId !== input.currentActiveGenerationId) throw typedError("ACCOUNT_ATTRIBUTION_STALE");
  const current = prepareAccountAttributionGraph(graph);
  const mappingIndex = current.mappings.findIndex((item) => item.id === input.mappingId);
  const mapping = current.mappings[mappingIndex];
  const source = current.sources.find((item) => item.id === mapping?.sourceId);
  const person = current.people.find((item) => item.id === mapping?.personId);
  if (!mapping || !person || ["trashed", "purged"].includes(person.state) || current.purgedPersonIds.includes(person.id) || !wechatMappingEligibleForAttribution(current, mapping, source) || !["set", "undo"].includes(input.operation)) throw typedError("ACCOUNT_ATTRIBUTION_MAPPING_INELIGIBLE");
  if (!requiredString(input.decisionId) || !input.decisionId || !strictIsoTimestamp(input.at)) throw typedError("ACCOUNT_ATTRIBUTION_CONFLICT");
  if (current.mappings.some((item) => item.id !== mapping.id && item.accountAttributionOverride?.decisionId === input.decisionId)) throw typedError("ACCOUNT_ATTRIBUTION_CONFLICT");
  if (input.operation === "undo") {
    if (Object.prototype.hasOwnProperty.call(input, "selectionKind") || Object.prototype.hasOwnProperty.call(input, "optionIndex")) throw typedError("ACCOUNT_ATTRIBUTION_CONFLICT");
    if (!mapping.accountAttributionOverride) return accountAttributionMutationResult(current, false);
    if (mapping.accountAttributionOverride.decisionId === input.decisionId) return accountAttributionMutationResult(current, false);
    delete current.mappings[mappingIndex].accountAttributionOverride;
    try { return accountAttributionMutationResult(validateRelationshipGraphV2(current), true); }
    catch { throw typedError("ACCOUNT_ATTRIBUTION_WRITE_FAILED"); }
  }
  if (!["private-wechat", "suiyin-persona"].includes(input.selectionKind)) throw typedError("ACCOUNT_ATTRIBUTION_OPTION_UNAVAILABLE");
  const optionEntries = accountAttributionOptionEntries(current);
  let desired;
  if (input.selectionKind === "private-wechat") {
    if (Object.prototype.hasOwnProperty.call(input, "optionIndex")) throw typedError("ACCOUNT_ATTRIBUTION_OPTION_UNAVAILABLE");
    desired = { kind: "private-wechat", decisionId: input.decisionId, updatedAt: input.at };
  } else {
    if (!Number.isInteger(input.optionIndex) || input.optionIndex < 1 || input.optionIndex > optionEntries.length) throw typedError("ACCOUNT_ATTRIBUTION_OPTION_UNAVAILABLE");
    desired = { kind: "suiyin-persona", sourceAccountAlias: optionEntries[input.optionIndex - 1].alias, decisionId: input.decisionId, updatedAt: input.at };
  }
  const previous = mapping.accountAttributionOverride;
  const sameSelection = previous?.kind === desired.kind && previous?.sourceAccountAlias === desired.sourceAccountAlias;
  if (previous?.decisionId === desired.decisionId && !sameSelection) throw typedError("ACCOUNT_ATTRIBUTION_CONFLICT");
  if (sameSelection) return accountAttributionMutationResult(current, false);
  current.mappings[mappingIndex].accountAttributionOverride = desired;
  try { return accountAttributionMutationResult(validateRelationshipGraphV2(current), true); }
  catch { throw typedError("ACCOUNT_ATTRIBUTION_WRITE_FAILED"); }
}
const SUIYIN_ACCOUNT_LABEL_DECISION_FIELDS = new Set(["generationId", "sourceId", "sourceAccountAlias", "label"]);

export function projectSourceReceiptInventory(graph) {
  const next = upgradeRelationshipGraphV2(graph);
  const projection = createSourceBadgeProjection(next);
  const sources = next.sources.flatMap((source, sourceIndex) => {
    if (!source?.id || !activeSource(source)) return [];
    const kind = projection.sourceKind(source);
    const receiptState = kind === "wechat" ? "trusted-wechat" : kind === "suiyin" ? "trusted-suiyin" : kind;
    let registry = {};
    try { registry = normalizeSuiyinAccountLabels(source.sourceAccountLabels); } catch {}
    const aliases = sourceOwnedAliases(source.id, next.mappings, registry);
    const projectedBadges = projection.sourceBadgesForSource(source).map(({ kind: badgeKind, label }) => ({ kind: badgeKind, label }));
    const accountLabels = aliases.map((alias, accountIndex) => ({
      accountIndex,
      label: typeof registry[alias] === "string" ? registry[alias] : "账号待补",
      associatedPeopleCount: new Set(next.mappings.filter((mapping) => mapping.sourceId === source.id && normalizeSourceAccountAliases(mapping.sourceAccountAliases).includes(alias)).map((mapping) => mapping.personId)).size,
    }));
    return [{
      sourceIndex,
      receiptState,
      sourceBadges: projectedBadges,
      collectionChannel: kind === "wechat" ? "微信导出" : kind === "suiyin" ? "碎银只读 MCP" : "来源待修复",
      accountAttributions: projectedBadges,
      setupAllowed: kind === "suiyin" && aliases.length > 0,
      repairAllowed: (kind === "conflict" || kind === "unknown")
        && (source.sourceKind === "suiyin-mcp" || aliases.length > 0),
      accountLabels,
    }];
  });
  return { formalWriteCount: 0, sources };
}

export function mutateSuiyinSourceAccountLabel(graph, input = {}) {
  const current = upgradeRelationshipGraphV2(graph);
  const projection = createSourceBadgeProjection(current);
  const sourceIndex = Number.isInteger(input.sourceIndex) ? input.sourceIndex : current.sources.findIndex((source) => source?.id === input.sourceId);
  const source = current.sources[sourceIndex];
  if (!source || !activeSource(source) || projection.sourceKind(source) !== "suiyin") throw typedError("SUIYIN_ACCOUNT_LABEL_STALE");
  const registry = normalizeSuiyinAccountLabels(source.sourceAccountLabels);
  const aliases = sourceOwnedAliases(source.id, current.mappings, registry);
  const sourceAccountAlias = Number.isInteger(input.accountIndex) ? aliases[input.accountIndex] : input.sourceAccountAlias;
  if (!SOURCE_ACCOUNT_ALIAS_PATTERN.test(String(sourceAccountAlias || "")) || !aliases.includes(sourceAccountAlias)) throw typedError("SUIYIN_ACCOUNT_LABEL_STALE");
  const currentLabel = typeof registry[sourceAccountAlias] === "string" ? registry[sourceAccountAlias] : null;
  const decisionBase = input.decisionBase;
  if (!exactFields(decisionBase, SUIYIN_ACCOUNT_LABEL_DECISION_FIELDS) || typeof decisionBase.generationId !== "string" || !decisionBase.generationId || decisionBase.sourceId !== source.id || decisionBase.sourceAccountAlias !== sourceAccountAlias || (decisionBase.label ?? null) !== currentLabel) throw typedError("SUIYIN_ACCOUNT_LABEL_STALE");
  if (typeof input.label === "string" && input.label.normalize("NFKC").trim() === "" && currentLabel === null) return { graph, changed: false, formalWriteCount: 0, generationDelta: 0, analyzerInvocationCount: 0, cacheWriteCount: 0 };
  const label = normalizeSuiyinAccountLabel(input.label);
  if (label === currentLabel) return { graph, changed: false, formalWriteCount: 0, generationDelta: 0, analyzerInvocationCount: 0, cacheWriteCount: 0 };
  const nextRegistry = {};
  for (const alias of [...new Set([...Object.keys(registry), sourceAccountAlias])].sort(ordinalCompare)) nextRegistry[alias] = alias === sourceAccountAlias ? label : registry[alias];
  current.sources[sourceIndex] = { ...source, sourceAccountLabels: nextRegistry };
  validateRelationshipGraphV2(current);
  return { graph: current, changed: true, formalWriteCount: 1, generationDelta: 1, analyzerInvocationCount: 0, cacheWriteCount: 0 };
}
const IDENTITY_REFERENCE_COLLECTIONS = Object.freeze(["excerpts", "signals", "relationships", "actions"]);
const normalizeIdentityDisplayName = (value) => String(value || "").normalize("NFKC").trim().replace(/\s+/gu, " ");
const IDENTITY_DISPLAY_FALLBACK = "待确认身份";
const identityDisplayNameUnsafe = (normalized, { mapping, person, source } = {}) => {
  if (!normalized) return true;
  if (/[＊*]/u.test(normalized)) return true;
  if (/^SY-[0-9A-F]{8}$/iu.test(normalized) || /^(?:wxid_|gh_)/iu.test(normalized)) return true;
  if (/(?:unknown|tbd|待补|待确认身份|未知|未命名)/iu.test(normalized)) return true;
  if (/^(?:[0-9A-F]{32,64}|[0-9A-F]{8}-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12})$/iu.test(normalized)) return true;
  const aliases = normalizeSourceAccountAliases(mapping?.sourceAccountAliases);
  if (aliases.some((alias) => normalizeIdentityDisplayName(alias) === normalized)) return true;
  const rawIds = [mapping?.id, mapping?.sourceId, mapping?.sourcePersonId, mapping?.personId, person?.id, source?.id]
    .filter((value) => typeof value === "string" && value)
    .map(normalizeIdentityDisplayName);
  return rawIds.includes(normalized);
};
const safeIdentityNameCandidate = (value, context) => {
  const normalized = normalizeIdentityDisplayName(value);
  return identityDisplayNameUnsafe(normalized, context) ? null : normalized;
};
const safeDisplayNameForMapping = (mapping, person, source) => {
  const context = { mapping, person, source };
  const displayName = safeIdentityNameCandidate(mapping?.sourceDisplayName, context)
    || safeIdentityNameCandidate(person?.name, context);
  return displayName ? { displayName, normalizedName: displayName } : { displayName: IDENTITY_DISPLAY_FALLBACK, normalizedName: "" };
};
const safeDisplayNameForPerson = (mappingSources, person) => {
  const sourceNames = [...new Set((mappingSources || []).flatMap(({ mapping, source }) => {
    const name = safeIdentityNameCandidate(mapping?.sourceDisplayName, { mapping, person, source });
    return name ? [name] : [];
  }))];
  if (sourceNames.length === 1) return sourceNames[0];
  if (sourceNames.length > 1) return IDENTITY_DISPLAY_FALLBACK;
  const first = mappingSources?.[0] || {};
  return safeIdentityNameCandidate(person?.name, { mapping: first.mapping, person, source: first.source }) || IDENTITY_DISPLAY_FALLBACK;
};
const dedupeSourceBadges = (badges) => [...new Map(badges.map((badge) => [sourceBadgeDedupeKeys.get(badge) || `${badge.kind}\0${badge.label}`, { kind: badge.kind, label: badge.label }])).values()].sort(sourceBadgeCompare);

export function projectSourceIdentityReview(graph) {
  const next = upgradeRelationshipGraphV2(graph);
  const badgeProjection = createSourceBadgeProjection(next);
  const purged = new Set(next.purgedPersonIds);
  const people = new Map(next.people.filter((person) => person?.id && !purged.has(person.id) && !["trashed", "purged"].includes(person.state)).map((person) => [person.id, person]));
  const sources = new Map(next.sources.filter((source) => source?.id && activeSource(source)).map((source) => [source.id, source]));
  const identities = next.mappings.flatMap((mapping) => {
    const person = people.get(mapping.personId), source = sources.get(mapping.sourceId);
    if (!person || !source) return [];
    const { displayName, normalizedName } = safeDisplayNameForMapping(mapping, person, source);
    return [{
      mappingId: mapping.id,
      personId: mapping.personId,
      displayName,
      normalizedName,
      identityState: mapping.status === "confirmed" ? "confirmed" : "pending",
      sourceId: source.id,
      sourceKind: badgeProjection.sourceKind(source),
      sourceIdentityKey: sourceIdentityKeyFor(mapping),
      sourceBadges: badgeProjection.sourceBadges(mapping, source),
    }];
  });
  const byIdentityKey = new Map(identities.map((identity) => [identity.sourceIdentityKey, identity]));
  const decidedPairs = [];
  const pairedMappingIds = new Set();
  for (const decision of next.identityDecisions) {
    const sides = decision.identityKeys.map((key) => byIdentityKey.get(key));
    if (sides.some((side) => !side || !trustedSourceKind(side.sourceKind))) continue;
    const [left, right] = sides.sort((a, b) => a.sourceIdentityKey.localeCompare(b.sourceIdentityKey));
    if (decision.status !== "separated") { pairedMappingIds.add(left.mappingId); pairedMappingIds.add(right.mappingId); }
    decidedPairs.push({ pairKey: decision.pairKey, status: decision.status, left, right });
  }
  const currentDecisions = new Set(decidedPairs.map((decision) => decision.pairKey));
  const decisionMappingIds = new Set(decidedPairs.filter((decision) => decision.status !== "separated").flatMap((decision) => [decision.left.mappingId, decision.right.mappingId]));
  const activeSourceIds = new Set(next.sources.filter((source) => source?.id && activeSource(source)).map((source) => source.id));
  const activeMappingCountByPerson = new Map();
  for (const mapping of next.mappings) if (activeSourceIds.has(mapping.sourceId)) activeMappingCountByPerson.set(mapping.personId, (activeMappingCountByPerson.get(mapping.personId) || 0) + 1);
  const byName = new Map();
  for (const identity of identities) {
    if (!identity.normalizedName || !trustedSourceKind(identity.sourceKind)) continue;
    if (!byName.has(identity.normalizedName)) byName.set(identity.normalizedName, []);
    byName.get(identity.normalizedName).push(identity);
  }
  const pendingPairs = [];
  const ambiguousMappingIds = new Set();
  let ambiguousCount = 0;
  for (const group of byName.values()) {
    const sourceIds = new Set(group.map((identity) => identity.sourceId));
    if (group.length === 2 && sourceIds.size === 2 && group[0].personId !== group[1].personId) {
      const [left, right] = [...group].sort((a, b) => a.sourceIdentityKey.localeCompare(b.sourceIdentityKey));
      const pairKey = pairKeyFor(left.sourceIdentityKey, right.sourceIdentityKey);
      if (!currentDecisions.has(pairKey)) {
        pairedMappingIds.add(left.mappingId); pairedMappingIds.add(right.mappingId);
        pendingPairs.push({ pairKey, status: "pending", left, right });
      }
    } else if (group.length > 1 && sourceIds.size > 1) {
      ambiguousCount += 1;
      for (const identity of group) ambiguousMappingIds.add(identity.mappingId);
    }
  }
  const publicSide = ({ mappingId, personId, displayName, identityState, sourceBadges }) => ({ mappingId, personId, displayName, identityState, sourceBadges: clone(sourceBadges) });
  const pairs = [...pendingPairs, ...decidedPairs].map((pair) => ({ pairKey: pair.pairKey, status: pair.status, left: publicSide(pair.left), right: publicSide(pair.right) })).sort((left, right) => left.pairKey.localeCompare(right.pairKey));
  const singles = identities.filter((identity) => !pairedMappingIds.has(identity.mappingId)).map((identity) => {
    const person = people.get(identity.personId);
    const lifecycleEligible = identity.identityState === "pending" && person?.state === "pending"
      || identity.identityState === "confirmed" && person?.state === "active";
    const directRelationshipAllowed = lifecycleEligible
      && activeMappingCountByPerson.get(identity.personId) === 1
      && !decisionMappingIds.has(identity.mappingId)
      && !ambiguousMappingIds.has(identity.mappingId);
    return { ...publicSide(identity), action: identity.identityState === "pending" ? "confirm-source-identity" : null, directRelationshipAllowed };
  }).sort((left, right) => left.displayName.localeCompare(right.displayName) || left.mappingId.localeCompare(right.mappingId));
  return { singles, pairs, ambiguousCount, formalWriteCount: 0 };
}

const crossSourceReviewGroupId = (kind, identityKeys) => {
  const stableKeys = [...identityKeys].sort(ordinalCompare);
  return kind === "pair" && stableKeys.length === 2
    ? pairKeyFor(stableKeys[0], stableKeys[1])
    : sha256HexSync(`cross-source-review/v1\0${kind}\0${stableKeys.join("\0")}`);
};
const crossSourcePublicSide = (identity) => ({ displayName: identity.normalizedName ? identity.displayName : "昵称待补", sourceBadges: clone(identity.sourceBadges) });

const projectCrossSourceReviewUnsafe = (graph) => {
  const next = upgradeRelationshipGraphV2(graph);
  const badgeProjection = createSourceBadgeProjection(next);
  const purged = new Set(next.purgedPersonIds);
  const people = new Map(next.people.filter((person) => person?.id && !purged.has(person.id) && !["trashed", "purged"].includes(person.state)).map((person) => [person.id, person]));
  const sources = new Map(next.sources.filter((source) => source?.id && activeSource(source)).map((source) => [source.id, source]));
  const identities = next.mappings.flatMap((mapping) => {
    const person = people.get(mapping.personId);
    const source = sources.get(mapping.sourceId);
    const lifecycleEligible = mapping.status === "pending" && person?.state === "pending"
      || mapping.status === "confirmed" && person?.state === "active";
    if (!person || !source || !lifecycleEligible) return [];
    const { displayName, normalizedName } = safeDisplayNameForMapping(mapping, person, source);
    const sourceKind = badgeProjection.sourceKind(source);
    if (!trustedSourceKind(sourceKind)) return [];
    return [{
      identityKey: sourceIdentityKeyFor(mapping),
      personId: person.id,
      sourceId: source.id,
      displayName,
      normalizedName,
      sourceBadges: badgeProjection.sourceBadges(mapping, source),
    }];
  }).sort((left, right) => ordinalCompare(left.identityKey, right.identityKey));
  const byIdentityKey = new Map(identities.map((identity) => [identity.identityKey, identity]));

  const resolvedPairKeys = new Set();
  const resolvedDecisions = [];
  for (const decision of next.identityDecisions) {
    if (!["merged", "separated"].includes(decision.status)) continue;
    resolvedPairKeys.add(decision.pairKey);
    const sides = decision.identityKeys.map((identityKey) => byIdentityKey.get(identityKey)).filter(Boolean).sort((left, right) => ordinalCompare(left.identityKey, right.identityKey));
    if (sides.length !== 2 || new Set(sides.map((side) => side.sourceId)).size !== 2) continue;
    resolvedDecisions.push({
      reviewGroupId: crossSourceReviewGroupId("pair", sides.map((side) => side.identityKey)),
      kind: "pair",
      status: decision.status,
      sides: sides.map(crossSourcePublicSide),
    });
  }
  resolvedDecisions.sort((left, right) => ordinalCompare(left.reviewGroupId, right.reviewGroupId));

  const identitiesByName = new Map();
  for (const identity of identities) {
    if (!identity.normalizedName) continue;
    if (!identitiesByName.has(identity.normalizedName)) identitiesByName.set(identity.normalizedName, []);
    identitiesByName.get(identity.normalizedName).push(identity);
  }
  const pendingById = new Map();
  for (const named of identitiesByName.values()) {
    const adjacency = new Map(named.map((identity) => [identity.identityKey, new Set()]));
    for (let leftIndex = 0; leftIndex < named.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < named.length; rightIndex += 1) {
        const left = named[leftIndex], right = named[rightIndex];
        if (left.sourceId === right.sourceId || left.personId === right.personId) continue;
        if (resolvedPairKeys.has(pairKeyFor(left.identityKey, right.identityKey))) continue;
        adjacency.get(left.identityKey).add(right.identityKey);
        adjacency.get(right.identityKey).add(left.identityKey);
      }
    }
    const visited = new Set();
    for (const identity of named) {
      if (visited.has(identity.identityKey) || adjacency.get(identity.identityKey).size === 0) continue;
      const stack = [identity.identityKey], componentKeys = [];
      visited.add(identity.identityKey);
      while (stack.length) {
        const current = stack.pop();
        componentKeys.push(current);
        for (const adjacent of [...adjacency.get(current)].sort(ordinalCompare)) if (!visited.has(adjacent)) { visited.add(adjacent); stack.push(adjacent); }
      }
      componentKeys.sort(ordinalCompare);
      const kind = componentKeys.length === 2 ? "pair" : "ambiguous";
      const reviewGroupId = crossSourceReviewGroupId(kind, componentKeys);
      pendingById.set(reviewGroupId, {
        reviewGroupId,
        kind,
        status: "pending",
        sides: componentKeys.map((identityKey) => crossSourcePublicSide(byIdentityKey.get(identityKey))),
      });
    }
  }
  const pendingGroups = [...pendingById.values()].sort((left, right) => ordinalCompare(left.reviewGroupId, right.reviewGroupId));
  return { pendingGroups, resolvedDecisions, pendingCount: pendingGroups.length, formalWriteCount: 0 };
};

export function projectCrossSourceReview(graph) {
  try { return projectCrossSourceReviewUnsafe(graph); }
  catch { throw typedError("CROSS_SOURCE_REVIEW_PROJECTION_INVALID"); }
}

export function projectRelationshipSuggestionIndex(graph, {
  semanticResults,
  batchState = "ready",
  expectedActiveGenerationId,
  currentActiveGenerationId,
} = {}) {
  const relationshipLibrary = projectRelationshipLibrary(graph);
  const sourceIdentityReview = projectSourceIdentityReview(graph);
  const crossSourceReview = projectCrossSourceReview(graph);
  if (semanticResults !== null && semanticResults !== undefined && !(semanticResults instanceof Map)) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");

  const reviewPeople = new Set();
  // Correlate the already-projected T020 review groups through their public-safe
  // side shape. A match only revokes relationship authority; badges never grant it.
  const reviewSideKey = (side) => stableObject({
    displayName: typeof side?.displayName === "string" ? side.displayName : null,
    sourceBadges: Array.isArray(side?.sourceBadges) ? side.sourceBadges : [],
  });
  const crossSourceReviewSides = new Set(crossSourceReview.pendingGroups.flatMap((group) => group?.status === "pending" && Array.isArray(group.sides) ? group.sides.map(reviewSideKey) : []));
  for (const pair of sourceIdentityReview.pairs) {
    if (pair?.status !== "pending") continue;
    if (typeof pair.left?.personId === "string") reviewPeople.add(pair.left.personId);
    if (typeof pair.right?.personId === "string") reviewPeople.add(pair.right.personId);
  }
  const singlesByPerson = new Map();
  for (const single of sourceIdentityReview.singles) {
    if (!singlesByPerson.has(single.personId)) singlesByPerson.set(single.personId, []);
    singlesByPerson.get(single.personId).push(single);
    if (crossSourceReviewSides.has(reviewSideKey(single)) || single.identityState === "pending" && single.directRelationshipAllowed !== true) reviewPeople.add(single.personId);
  }

  const generationCurrent = directGenerationCurrent(expectedActiveGenerationId, currentActiveGenerationId);
  const entries = relationshipLibrary.rows.map((row) => {
    const currentLabels = [...new Set(row.relationshipLabels.map((label) => normalizeRelationshipLabel(label)))].sort(ordinalCompare);
    const base = { currentLabels, suggestedLabels: [], acceptAllowed: false, manualAddAllowed: false };
    const result = semanticResults instanceof Map ? semanticResults.get(row.personId) : null;
    if (!generationCurrent || (result && (result.personId !== row.personId || result.algorithmVersion !== LOCAL_SEMANTIC_VERSION))) return [row.personId, deepFreeze({ state: "stale", ...base })];
    if (["checking", "running"].includes(batchState) && !result) return [row.personId, deepFreeze({ state: "loading", ...base })];
    if (reviewPeople.has(row.personId)) return [row.personId, deepFreeze({ state: "identity-review", ...base })];

    const directSingles = singlesByPerson.get(row.personId) || [];
    const directPending = row.boundary === "pending" && directSingles.some((single) => single.identityState === "pending" && single.directRelationshipAllowed === true);
    const manualAuthority = row.boundary === "confirmed" || directPending;
    const currentSet = new Set(currentLabels);
    const suggestedLabels = [];
    if (result && ["ready", "generic"].includes(result.state) && Array.isArray(result.candidates)) {
      for (const candidate of result.candidates) {
        const label = candidate?.label;
        if (!LOCAL_SEMANTIC_LABEL_ORDER.includes(label) || currentSet.has(label) || suggestedLabels.includes(label)) continue;
        suggestedLabels.push(label);
        if (suggestedLabels.length === 3) break;
      }
    }
    const state = result?.state === "reimport-required"
      ? "reimport-required"
      : suggestedLabels.length > 0
        ? "suggested"
        : "manual-needed";
    const confirmedSemanticAuthority = row.boundary === "confirmed" && result?.identityState === "confirmed" && result?.acceptAllowed === true;
    const pendingSemanticAuthority = directPending && currentDirectSemanticResult(result, row.personId);
    return [row.personId, deepFreeze({
      state,
      currentLabels,
      suggestedLabels,
      acceptAllowed: state === "suggested" && suggestedLabels.length > 0 && (confirmedSemanticAuthority || pendingSemanticAuthority),
      manualAddAllowed: ["suggested", "manual-needed", "reimport-required"].includes(state) && manualAuthority,
    })];
  });

  return deepFreeze({
    relationshipLibrary,
    sourceIdentityReview,
    crossSourceReview,
    byPerson: readonlySemanticResultMap(entries),
    formalWriteCount: 0,
  });
}

const emptyRelationshipAuthority = (displayName = IDENTITY_DISPLAY_FALLBACK, sourceBadges = []) => ({
  state: "ineligible",
  displayName,
  sourceBadges: clone(sourceBadges),
  manualAddAllowed: false,
  acceptAllowed: false,
  contactAllowed: false,
  directAtomicAcceptAllowed: false,
  formalWriteCount: 0,
});
const directGenerationCurrent = (expectedActiveGenerationId, currentActiveGenerationId) => typeof expectedActiveGenerationId === "string" && expectedActiveGenerationId.length > 0 && currentActiveGenerationId === expectedActiveGenerationId;
const currentDirectSemanticResult = (semanticResult, personId) => Boolean(semanticResult
  && typeof semanticResult === "object"
  && semanticResult.personId === personId
  && semanticResult.algorithmVersion === LOCAL_SEMANTIC_VERSION
  && ["ready", "generic"].includes(semanticResult.state)
  && semanticResult.identityState === "unconfirmed"
  && semanticResult.acceptAllowed === false
  && semanticResult.contactAllowed === false
  && typeof semanticResult.decisionBaseId === "string"
  && /^semantic-[0-9A-F]{16}$/.test(semanticResult.decisionBaseId)
  && Array.isArray(semanticResult.candidates)
  && semanticResult.candidates.length > 0
  && semanticResult.candidates.every((candidate) => {
    try { return normalizeRelationshipLabel(candidate?.label) === candidate.label; } catch { return false; }
  }));
const directIdentityTopology = (graph, personId, mappingId) => {
  const people = Array.isArray(graph?.people) ? graph.people : [];
  const mappings = Array.isArray(graph?.mappings) ? graph.mappings : [];
  const sources = Array.isArray(graph?.sources) ? graph.sources : [];
  const badgeProjection = createSourceBadgeProjection(graph);
  const purged = new Set(Array.isArray(graph?.purgedPersonIds) ? graph.purgedPersonIds : []);
  const person = people.find((item) => item?.id === personId);
  const mapping = mappings.find((item) => item?.id === mappingId && item.personId === personId);
  const source = mapping && sources.find((item) => item?.id === mapping.sourceId);
  const name = mapping && person && source ? safeDisplayNameForMapping(mapping, person, source) : { displayName: IDENTITY_DISPLAY_FALLBACK, normalizedName: "" };
  const badges = mapping && source && activeSource(source) ? badgeProjection.sourceBadges(mapping, source) : [];
  const sourceKind = badgeProjection.sourceKind(source);
  if (!person || !mapping || !source || purged.has(personId) || ["trashed", "purged"].includes(person.state) || !activeSource(source)) return { kind: "ineligible", person, mapping, source, sourceKind, ...name, sourceBadges: badges };
  const activeSources = new Map(sources.filter((item) => item?.id && activeSource(item)).map((item) => [item.id, item]));
  const activeMappings = mappings.filter((item) => item?.personId === personId && activeSources.has(item.sourceId));
  const identityDecisions = Array.isArray(graph.identityDecisions) ? graph.identityDecisions : [];
  const mappingById = new Map(mappings.filter((item) => item?.id).map((item) => [item.id, item]));
  const trustedDecision = (decision) => Array.isArray(decision?.mappingIds)
    && decision.mappingIds.length > 0
    && decision.mappingIds.every((id) => {
      const sideMapping = mappingById.get(id);
      const sideSource = sideMapping && activeSources.get(sideMapping.sourceId);
      return sideSource && trustedSourceKind(badgeProjection.sourceKind(sideSource));
    });
  const decisionConflict = trustedSourceKind(sourceKind) && identityDecisions.some((decision) => trustedDecision(decision) && decision?.status !== "separated" && (decision?.canonicalPersonId === personId || decision?.secondaryPersonId === personId || decision.mappingIds.includes(mappingId)));
  if (decisionConflict) return { kind: "ambiguous", person, mapping, source, sourceKind, ...name, sourceBadges: badges };
  const explicitlySeparatedFrom = (otherMappingId) => identityDecisions.some((decision) => decision?.status === "separated" && Array.isArray(decision.mappingIds) && decision.mappingIds.includes(mappingId) && decision.mappingIds.includes(otherMappingId));
  if (name.normalizedName && trustedSourceKind(sourceKind)) {
    const sameNameAcrossSources = mappings.flatMap((other) => {
      const otherPerson = people.find((item) => item?.id === other?.personId);
      const otherSource = activeSources.get(other?.sourceId);
       if (!otherPerson || !otherSource || !trustedSourceKind(badgeProjection.sourceKind(otherSource)) || other.id === mappingId || other.personId === personId || purged.has(other.personId) || ["trashed", "purged"].includes(otherPerson.state) || otherSource.id === source.id || explicitlySeparatedFrom(other.id)) return [];
      return safeDisplayNameForMapping(other, otherPerson, otherSource).normalizedName === name.normalizedName ? [other] : [];
    });
    if (sameNameAcrossSources.length) return { kind: "ambiguous", person, mapping, source, sourceKind, ...name, sourceBadges: badges };
  }
  if (activeMappings.length !== 1 || activeMappings[0].id !== mappingId) return { kind: "ineligible", person, mapping, source, sourceKind, ...name, sourceBadges: badges };
  if (mapping.status === "confirmed" && person.state === "active") return { kind: "confirmed", person, mapping, source, sourceKind, ...name, sourceBadges: badges };
  if (mapping.status !== "pending" || person.state !== "pending") return { kind: "half-state", person, mapping, source, sourceKind, ...name, sourceBadges: badges };
  return { kind: "single", person, mapping, source, sourceKind, ...name, sourceBadges: badges };
};

export function projectRelationshipAuthority(graph, { personId, mappingId, expectedActiveGenerationId, currentActiveGenerationId, semanticResult } = {}) {
  const topology = directIdentityTopology(graph, personId, mappingId);
  const base = emptyRelationshipAuthority(topology.displayName, topology.sourceBadges);
  if (!directGenerationCurrent(expectedActiveGenerationId, currentActiveGenerationId)) return base;
  if (topology.kind === "ambiguous") return { ...base, state: "identity-review" };
  if (topology.kind === "confirmed") {
    const semanticAllowed = trustedSourceKind(topology.sourceKind);
    const accepted = semanticAllowed && semanticResult?.personId === personId && semanticResult?.identityState === "confirmed" && semanticResult?.acceptAllowed === true;
    return { ...base, state: "relationship", manualAddAllowed: true, acceptAllowed: accepted, contactAllowed: semanticAllowed && (semanticResult ? semanticResult.contactAllowed === true : true) };
  }
  if (topology.kind !== "single") return base;
  const directAtomicAcceptAllowed = trustedSourceKind(topology.sourceKind) && currentDirectSemanticResult(semanticResult, personId);
  return { ...base, state: "relationship-direct-pending", manualAddAllowed: true, acceptAllowed: directAtomicAcceptAllowed, directAtomicAcceptAllowed };
}

const directRelationshipError = (code) => typedError(code);
const directMutationResult = (graph, { changed, relationshipId } = {}) => ({
  graph,
  changed,
  relationshipId: relationshipId || null,
  formalWriteCount: changed ? 1 : 0,
  formalIdentityWriteCount: changed ? 1 : 0,
  formalRelationshipWriteCount: changed ? 1 : 0,
  generationDelta: changed ? 1 : 0,
});

export function mutateSingleSourceRelationship(graph, { personId, mappingId, intent, label, decisionId, at, expectedActiveGenerationId, currentActiveGenerationId, semanticResult } = {}) {
  if (!directGenerationCurrent(expectedActiveGenerationId, currentActiveGenerationId)) throw directRelationshipError("DIRECT_RELATIONSHIP_RESULT_STALE");
  let normalized;
  try { normalized = normalizeRelationshipLabel(label); }
  catch { throw directRelationshipError("DIRECT_IDENTITY_RELATIONSHIP_INVALID"); }
  if (!["manual-add", "semantic-accept"].includes(intent) || typeof personId !== "string" || !personId || typeof mappingId !== "string" || !mappingId || typeof decisionId !== "string" || !decisionId || typeof at !== "string" || !Number.isFinite(Date.parse(at))) throw directRelationshipError("DIRECT_IDENTITY_RELATIONSHIP_INVALID");
  const rawPerson = Array.isArray(graph?.people) ? graph.people.find((item) => item?.id === personId) : null;
  const rawMapping = Array.isArray(graph?.mappings) ? graph.mappings.find((item) => item?.id === mappingId && item.personId === personId) : null;
  const replay = Array.isArray(graph?.relationships) ? graph.relationships.find((item) => item?.decisionId === decisionId) : null;
  if (replay) {
    if (!rawPerson || !rawMapping || rawPerson.state !== "active" || rawMapping.status !== "confirmed" || replay.personId !== personId || normalizeIdentityDisplayName(replay.label) !== normalized) throw directRelationshipError("DIRECT_IDENTITY_RELATIONSHIP_INVALID");
    try { return directMutationResult(upgradeRelationshipGraphV2(graph), { changed: false, relationshipId: replay.id }); }
    catch { throw directRelationshipError("DIRECT_IDENTITY_RELATIONSHIP_INVALID"); }
  }
  if ((rawPerson?.state === "active") !== (rawMapping?.status === "confirmed") || rawPerson?.state === "active" || rawMapping?.status === "confirmed") throw directRelationshipError("DIRECT_IDENTITY_RELATIONSHIP_INVALID");
  const authority = projectRelationshipAuthority(graph, { personId, mappingId, expectedActiveGenerationId, currentActiveGenerationId, semanticResult });
  if (authority.state === "identity-review") throw directRelationshipError("DIRECT_IDENTITY_AMBIGUOUS");
  if (authority.state !== "relationship-direct-pending" || !authority.manualAddAllowed) throw directRelationshipError("DIRECT_IDENTITY_NOT_ELIGIBLE");
  if (intent === "semantic-accept" && !authority.directAtomicAcceptAllowed) throw directRelationshipError("DIRECT_RELATIONSHIP_RESULT_STALE");
  let next;
  try { next = upgradeRelationshipGraphV2(graph); }
  catch { throw directRelationshipError("DIRECT_IDENTITY_RELATIONSHIP_INVALID"); }
  const person = next.people.find((item) => item.id === personId);
  const mapping = next.mappings.find((item) => item.id === mappingId && item.personId === personId);
  if (!person || !mapping || person.state !== "pending" || mapping.status !== "pending") throw directRelationshipError("DIRECT_IDENTITY_RELATIONSHIP_INVALID");
  person.state = "active";
  mapping.status = "confirmed";
  let relationshipMutation;
  try {
    relationshipMutation = mutateRelationshipFacts(next, {
      operation: intent === "semantic-accept" ? "accept" : "add",
      personId,
      label: normalized,
      candidate: intent === "semantic-accept" ? { label: normalized } : undefined,
      semanticResult: intent === "semantic-accept" ? semanticResult : undefined,
      decisionId,
      at,
    });
  } catch {
    throw directRelationshipError("DIRECT_IDENTITY_RELATIONSHIP_WRITE_FAILED");
  }
  if (!relationshipMutation.changed || relationshipMutation.formalWriteCount !== 1) throw directRelationshipError("DIRECT_IDENTITY_RELATIONSHIP_INVALID");
  const finalPerson = relationshipMutation.graph.people.find((item) => item.id === personId);
  const finalMapping = relationshipMutation.graph.mappings.find((item) => item.id === mappingId && item.personId === personId);
  const relationship = relationshipMutation.graph.relationships.find((item) => item.id === relationshipMutation.relationshipId && item.personId === personId && item.decisionId === decisionId && item.label === normalized);
  if (finalPerson?.state !== "active" || finalMapping?.status !== "confirmed" || !relationship) throw directRelationshipError("DIRECT_IDENTITY_RELATIONSHIP_INVALID");
  return directMutationResult(relationshipMutation.graph, { changed: true, relationshipId: relationshipMutation.relationshipId });
}

const identityMutationResult = (graph, { changed, personId, decision, pairKey } = {}) => ({ graph, changed, formalWriteCount: changed ? 1 : 0, formalRelationshipWriteCount: 0, personId: personId || null, decision, ...(pairKey ? { pairKey } : {}) });

export function confirmImportedSourceIdentity(graph, { mappingId } = {}) {
  const next = upgradeRelationshipGraphV2(graph);
  const mapping = next.mappings.find((item) => item.id === mappingId && activeSource(next.sources.find((source) => source.id === item.sourceId)));
  if (!mapping) throw typedError("IDENTITY_PAIR_INVALID");
  if (mapping.status === "confirmed") return identityMutationResult(next, { changed: false, personId: mapping.personId, decision: "confirmed" });
  mapping.status = "confirmed";
  const person = next.people.find((item) => item.id === mapping.personId);
  if (!person || ["trashed", "purged"].includes(person.state)) throw typedError("IDENTITY_PAIR_INVALID");
  person.state = "active";
  return identityMutationResult(validateRelationshipGraphV2(next), { changed: true, personId: mapping.personId, decision: "confirmed" });
}

const requireIdentityMutationInput = ({ pairKey, decisionId, at } = {}) => {
  if (!IDENTITY_HASH_PATTERN.test(String(pairKey || "")) || !requiredString(decisionId) || !decisionId || !requiredString(at) || !Number.isFinite(Date.parse(at))) throw typedError("IDENTITY_PAIR_INVALID");
};
const pairForMutation = (graph, pairKey) => projectSourceIdentityReview(graph).pairs.find((pair) => pair.pairKey === pairKey);
const stableObject = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableObject).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableObject(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
};
const referenceReceipt = (item, position) => ({ id: item.id, personId: item.personId, payloadHash: sha256HexSync(stableObject(item)), position });
const selectedReferences = (graph, personIds) => Object.fromEntries(IDENTITY_REFERENCE_COLLECTIONS.map((field) => [field, graph[field].flatMap((item, position) => personIds.has(item.personId) ? [referenceReceipt(item, position)] : [])]));
const referencesEqual = (left, right) => IDENTITY_REFERENCE_COLLECTIONS.every((field) => stableObject(left[field] || []) === stableObject(right[field] || []));
const remapAndDedupeReferences = (graph, fromPersonId, toPersonId) => {
  for (const field of IDENTITY_REFERENCE_COLLECTIONS) {
    const seen = new Map(), output = [];
    for (const original of graph[field]) {
      const item = original.personId === fromPersonId ? { ...original, personId: toPersonId } : original;
      if (!item.id || !seen.has(item.id)) { if (item.id) seen.set(item.id, item); output.push(item); continue; }
      if (stableObject(seen.get(item.id)) !== stableObject(item)) throw typedError("IDENTITY_MERGE_CONFLICT");
    }
    graph[field] = output;
  }
};

export function mergeImportedIdentityPair(graph, input = {}) {
  requireIdentityMutationInput(input);
  const next = upgradeRelationshipGraphV2(graph);
  const existing = next.identityDecisions.find((item) => item.pairKey === input.pairKey);
  if (existing?.status === "merged") return identityMutationResult(next, { changed: false, personId: existing.canonicalPersonId, decision: "merged", pairKey: input.pairKey });
  if (existing) throw typedError("IDENTITY_PAIR_INVALID");
  const pair = pairForMutation(next, input.pairKey);
  if (!pair || pair.status !== "pending") throw typedError("IDENTITY_PAIR_INVALID");
  const sides = [pair.left, pair.right];
  const confirmed = sides.filter((side) => side.identityState === "confirmed");
  const canonicalPersonId = confirmed.length === 1 ? confirmed[0].personId : [...new Set(sides.map((side) => side.personId))].sort()[0];
  const secondaryPersonId = sides.map((side) => side.personId).find((id) => id !== canonicalPersonId);
  if (!secondaryPersonId || next.topics.some((item) => item.personId === secondaryPersonId) || next.notes.some((item) => item.personId === secondaryPersonId)) throw typedError("IDENTITY_MERGE_CONFLICT");
  const personIds = new Set([canonicalPersonId, secondaryPersonId]);
  const peopleBefore = next.people.flatMap((person, lineageIndex) => personIds.has(person.id) ? [{ ...clone(person), lineageIndex }] : []);
  if (peopleBefore.length !== 2) throw typedError("IDENTITY_MERGE_CONFLICT");
  const mappingsBefore = next.mappings.filter((mapping) => personIds.has(mapping.personId)).map((mapping) => clone(mapping));
  const referencesBefore = selectedReferences(next, personIds);
  remapAndDedupeReferences(next, secondaryPersonId, canonicalPersonId);
  next.mappings = next.mappings.map((mapping) => personIds.has(mapping.personId) ? { ...mapping, personId: canonicalPersonId, ...(sides.some((side) => side.mappingId === mapping.id) ? { status: "confirmed" } : {}) } : mapping);
  const canonicalPerson = next.people.find((person) => person.id === canonicalPersonId);
  canonicalPerson.state = "active";
  next.people = next.people.filter((person) => person.id !== secondaryPersonId);
  const mappingsAfter = next.mappings.filter((mapping) => mappingsBefore.some((before) => before.id === mapping.id)).map((mapping) => clone(mapping));
  const referencesAfter = selectedReferences(next, personIds);
  const identityKeys = [sourceIdentityKeyFor(next.mappings.find((mapping) => mapping.id === pair.left.mappingId)), sourceIdentityKeyFor(next.mappings.find((mapping) => mapping.id === pair.right.mappingId))].sort();
  next.identityDecisions.push({
    id: input.pairKey, pairKey: input.pairKey, decisionId: input.decisionId, status: "merged", identityKeys,
    mappingIds: [pair.left.mappingId, pair.right.mappingId].sort(), createdAt: input.at, updatedAt: input.at,
    canonicalPersonId, secondaryPersonId,
    lineage: { peopleBefore, mappingsBefore, mappingsAfter, referencesBefore, referencesAfter },
  });
  try { validateRelationshipGraphV2(next); } catch (error) { if (error?.code === "SOURCE_ACCOUNT_ALIAS_INVALID") throw error; throw typedError("IDENTITY_MERGE_CONFLICT"); }
  return identityMutationResult(next, { changed: true, personId: canonicalPersonId, decision: "merged", pairKey: input.pairKey });
}

export function separateImportedIdentityPair(graph, input = {}) {
  requireIdentityMutationInput(input);
  const next = upgradeRelationshipGraphV2(graph);
  const existing = next.identityDecisions.find((item) => item.pairKey === input.pairKey);
  if (existing?.status === "separated") return identityMutationResult(next, { changed: false, personId: existing.canonicalPersonId || null, decision: "separated", pairKey: input.pairKey });
  if (existing) throw typedError("IDENTITY_PAIR_INVALID");
  const pair = pairForMutation(next, input.pairKey);
  if (!pair || pair.status !== "pending") throw typedError("IDENTITY_PAIR_INVALID");
  const byMapping = new Map(next.mappings.map((mapping) => [mapping.id, mapping]));
  const identityKeys = [sourceIdentityKeyFor(byMapping.get(pair.left.mappingId)), sourceIdentityKeyFor(byMapping.get(pair.right.mappingId))].sort();
  next.identityDecisions.push({ id: input.pairKey, pairKey: input.pairKey, decisionId: input.decisionId, status: "separated", identityKeys, mappingIds: [pair.left.mappingId, pair.right.mappingId].sort(), createdAt: input.at, updatedAt: input.at });
  return identityMutationResult(validateRelationshipGraphV2(next), { changed: true, personId: null, decision: "separated", pairKey: input.pairKey });
}

export function undoImportedIdentityPairDecision(graph, { pairKey, at } = {}) {
  if (!IDENTITY_HASH_PATTERN.test(String(pairKey || "")) || (at !== undefined && (!requiredString(at) || !Number.isFinite(Date.parse(at))))) throw typedError("IDENTITY_PAIR_INVALID");
  let next;
  try { next = upgradeRelationshipGraphV2(graph); }
  catch (error) { if (error?.code === "RELATIONSHIP_SCHEMA_INVALID") throw typedError("IDENTITY_MERGE_UNDO_CONFLICT"); throw error; }
  const decision = next.identityDecisions.find((item) => item.pairKey === pairKey);
  if (!decision) return identityMutationResult(next, { changed: false, personId: null, decision: "undone", pairKey });
  if (decision.status === "merged") {
    const lineage = decision.lineage, personIds = new Set([decision.canonicalPersonId, decision.secondaryPersonId]);
    const currentMappings = next.mappings.filter((mapping) => lineage.mappingsAfter.some((after) => after.id === mapping.id));
    if (stableObject(currentMappings) !== stableObject(lineage.mappingsAfter) || !referencesEqual(selectedReferences(next, personIds), lineage.referencesAfter) || next.people.some((person) => person.id === decision.secondaryPersonId)) throw typedError("IDENTITY_MERGE_UNDO_CONFLICT");
    const restoredPeople = lineage.peopleBefore.map(({ lineageIndex, ...person }) => ({ lineageIndex, person }));
    const unaffectedPeople = next.people.filter((person) => !personIds.has(person.id));
    const peopleOutput = new Array(unaffectedPeople.length + restoredPeople.length);
    for (const restored of restoredPeople) peopleOutput[restored.lineageIndex] = clone(restored.person);
    let peopleCursor = 0;
    for (let index = 0; index < peopleOutput.length; index += 1) if (!peopleOutput[index]) peopleOutput[index] = unaffectedPeople[peopleCursor++];
    next.people = peopleOutput;
    const mappingIds = new Set(lineage.mappingsBefore.map((mapping) => mapping.id));
    const mappingsBefore = new Map(lineage.mappingsBefore.map((mapping) => [mapping.id, mapping]));
    next.mappings = next.mappings.map((mapping) => mappingIds.has(mapping.id) ? clone(mappingsBefore.get(mapping.id)) : mapping);
    for (const field of IDENTITY_REFERENCE_COLLECTIONS) {
      const afterItems = new Map(next[field].filter((item) => personIds.has(item.personId)).map((item) => [item.id, item]));
      const restored = [];
      for (const receipt of lineage.referencesBefore[field] || []) {
        const current = afterItems.get(receipt.id);
        if (!current) throw typedError("IDENTITY_MERGE_UNDO_CONFLICT");
        const item = { ...clone(current), personId: receipt.personId };
        if (referenceReceipt(item, receipt.position).payloadHash !== receipt.payloadHash) throw typedError("IDENTITY_MERGE_UNDO_CONFLICT");
        restored.push({ position: receipt.position, item });
      }
      const unaffected = next[field].filter((item) => !personIds.has(item.personId));
      const output = new Array(unaffected.length + restored.length);
      if (restored.some((entry) => entry.position >= output.length) || new Set(restored.map((entry) => entry.position)).size !== restored.length) throw typedError("IDENTITY_MERGE_UNDO_CONFLICT");
      for (const entry of restored) output[entry.position] = entry.item;
      let cursor = 0;
      for (let index = 0; index < output.length; index += 1) if (!output[index]) output[index] = unaffected[cursor++];
      next[field] = output;
    }
  }
  next.identityDecisions = next.identityDecisions.filter((item) => item.pairKey !== pairKey);
  try { validateRelationshipGraphV2(next); } catch { throw typedError("IDENTITY_MERGE_UNDO_CONFLICT"); }
  const restoredPersonId = decision.status === "merged" ? decision.secondaryPersonId : null;
  return identityMutationResult(next, { changed: true, personId: restoredPersonId, decision: "undone", pairKey });
}
const signalClassifications = new Set(["pending", "topic-approved", "internal", "irrelevant", "sensitive"]);
const escapeSignalHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

export function describeSourceReceipt(source = {}) {
  const recorded = (field) => Number.isInteger(source[field]) && source[field] >= 0;
  let committedReceipt = null;
  try {
    if (["batchName", "selectedAt", "exportedAt"].some((field) => own(source, field))) {
      validateImportReceiptOnSource(source);
      committedReceipt = {
        batchName: source.batchName,
        selectedAt: source.selectedAt,
        importedAt: source.importedAt,
        exportedAt: source.exportedAt,
      };
    }
  } catch { committedReceipt = null; }
  return {
    batchNameLabel: committedReceipt?.batchName || "批次未记录",
    selectedAtLabel: committedReceipt?.selectedAt || "选择时间未记录",
    importedAtLabel: strictIsoTimestamp(source.importedAt) ? source.importedAt : "时间未记录",
    exportedAtLabel: committedReceipt?.exportedAt || "导出工具未提供",
    excludedLabel: recorded("excludedCount") ? String(source.excludedCount) : "旧版导入未记录",
    momentCountLabel: recorded("momentCount") ? String(source.momentCount) : "旧版导入未记录",
    messageCountLabel: recorded("messageCount") ? String(source.messageCount) : "旧版导入未记录",
    legacy: committedReceipt === null,
  };
}

const TRUSTED_MOMENT_CLASSIFICATION_LABELS = Object.freeze({
  pending: "待确认",
  "topic-approved": "可作为话题",
  internal: "仅内部提醒",
  irrelevant: "不相关",
  sensitive: "敏感勿用",
});
const TRUSTED_MOMENT_WRITABLE_CLASSIFICATIONS = new Set(["topic-approved", "internal", "irrelevant", "sensitive"]);
const trustedMomentProjectionCache = new WeakMap();
let trustedMomentActiveGraph = null;
let trustedMomentActiveGenerationId = null;
const trustedMomentActiveActionTokens = new Map();
let trustedMomentPreviousActionTokens = new Set();
let trustedMomentSessionSecret = null;
const trustedMomentSecret = () => {
  if (trustedMomentSessionSecret === null) trustedMomentSessionSecret = base64(crypto.getRandomValues(new Uint8Array(24)));
  return trustedMomentSessionSecret;
};
const trustedMomentToken = (kind, generationId, ...parts) => sha256HexSync(`${trustedMomentSecret()}\0${kind}\0${generationId}\0${parts.join("\0")}`);
const trustedMomentSearchText = (value) => String(value ?? "").normalize("NFKC").trim().toLocaleLowerCase("zh-CN");
const trustedMomentPublishedTime = (value) => {
  const timestamp = relationshipTimestamp(value);
  return timestamp !== null && Number.isFinite(timestamp) ? timestamp : null;
};
const trustedMomentPublishedLabel = (timestamp) => {
  if (timestamp === null) return "时间未记录";
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return "时间未记录";
  const part = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())} ${part(date.getHours())}:${part(date.getMinutes())}`;
};

const buildTrustedMomentIndexes = (graph) => {
  const sources = new Map();
  for (const source of Array.isArray(graph?.sources) ? graph.sources : []) {
    if (!source?.id || source.state !== "active") continue;
    if (source.sourceKind === "wechat-export-toolkit" && source.sourceBundleRevision === SOURCE_BUNDLE_REVISION) {
      sources.set(source.id, { source, kind: "wechat", registry: {}, exactMomentLabels: new Set() });
      continue;
    }
    if (source.sourceKind !== "suiyin-mcp") continue;
    let registry, receipt;
    try {
      registry = normalizeSuiyinAccountLabels(source.sourceAccountLabels);
      receipt = validateCoverageReceipt(source.coverageReceipt);
    } catch { continue; }
    if (receipt.scopeKind !== "suiyin-persona-complete-v1" || receipt.scopeComplete !== true || receipt.metrics.moments.state !== "exact" || !Array.isArray(receipt.perPersona)) continue;
    const exactMomentLabels = new Set(receipt.perPersona.filter((persona) => persona.metrics?.moments?.state === "exact").map((persona) => persona.officialLabel));
    sources.set(source.id, { source, kind: "suiyin", registry, exactMomentLabels });
  }
  const people = new Map((Array.isArray(graph?.people) ? graph.people : []).filter((person) => person?.id && !["trashed", "purged"].includes(person.state)).map((person) => [person.id, person]));
  const mappings = new Map();
  for (const mapping of Array.isArray(graph?.mappings) ? graph.mappings : []) {
    if (!mapping?.sourceId || !mapping.personId || !["pending", "confirmed"].includes(mapping.status)) continue;
    const key = `${mapping.sourceId}\0${mapping.personId}`;
    const bucket = mappings.get(key) || [];
    bucket.push(mapping);
    mappings.set(key, bucket);
  }
  return { sources, people, mappings };
};

const projectTrustedMomentSignal = (signal, indexes, generationId) => {
  if (!signal?.id || !signal.sourceId || !signal.personId || !signalClassifications.has(signal.status)) return null;
  const sourceTrust = indexes.sources.get(signal.sourceId);
  if (!sourceTrust) return null;
  const canonical = signal.kind === "moment";
  const legacyWechat = signal.kind === undefined
    && sourceTrust.kind === "wechat"
    && own(signal, "publishedAt")
    && (typeof signal.text === "string" || typeof signal.mediaDescription === "string");
  if (!canonical && !legacyWechat) return null;
  if (signal.text !== undefined && signal.text !== null && typeof signal.text !== "string") return null;
  if (signal.mediaDescription !== undefined && signal.mediaDescription !== null && typeof signal.mediaDescription !== "string") return null;
  const person = indexes.people.get(signal.personId);
  const mappingCandidates = indexes.mappings.get(`${signal.sourceId}\0${signal.personId}`) || [];
  if (!person || mappingCandidates.length !== 1) return null;
  const mapping = mappingCandidates[0];
  const publisherLabel = safeIdentityNameCandidate(mapping.sourceDisplayName, { mapping, person, source: sourceTrust.source })
    || safeIdentityNameCandidate(person.name, { mapping, person, source: sourceTrust.source });
  if (!publisherLabel) return null;
  let sourceLabel, sourceKey;
  if (sourceTrust.kind === "wechat") {
    sourceLabel = "我的微信";
    sourceKey = `${signal.sourceId}\0wechat`;
  } else {
    if (!SOURCE_ACCOUNT_ALIAS_PATTERN.test(String(signal.sourceAccountAlias || ""))) return null;
    let aliases;
    try { aliases = normalizeSourceAccountAliases(mapping.sourceAccountAliases); } catch { return null; }
    const officialLabel = sourceTrust.registry[signal.sourceAccountAlias];
    if (!aliases.includes(signal.sourceAccountAlias) || typeof officialLabel !== "string" || !sourceTrust.exactMomentLabels.has(officialLabel)) return null;
    sourceLabel = `碎银 · ${officialLabel}`;
    sourceKey = `${signal.sourceId}\0${signal.sourceAccountAlias}`;
  }
  const publishedTimestamp = trustedMomentPublishedTime(signal.publishedAt);
  const opaqueToken = trustedMomentToken("action", generationId, signal.sourceId, signal.personId, signal.id);
  const sourceToken = trustedMomentToken("source", generationId, sourceKey);
  const bodyLabel = typeof signal.text === "string" && signal.text.trim() ? signal.text : "无文字";
  const mediaDescriptionLabel = typeof signal.mediaDescription === "string" && signal.mediaDescription.trim() ? signal.mediaDescription : null;
  const identityState = mapping.status === "confirmed" ? "confirmed" : "pending";
  const publicItem = {
    opaqueToken,
    publisherLabel,
    publishedAtLabel: trustedMomentPublishedLabel(publishedTimestamp),
    bodyLabel,
    ...(mediaDescriptionLabel ? { mediaDescriptionLabel } : {}),
    sourceToken,
    sourceLabel,
    identityLabel: identityState === "confirmed" ? "身份已确认" : "身份待确认",
    classificationLabel: TRUSTED_MOMENT_CLASSIFICATION_LABELS[signal.status],
    classificationAllowed: identityState === "confirmed",
  };
  return {
    signalId: signal.id,
    sourceId: signal.sourceId,
    personId: signal.personId,
    sourceAccountAlias: sourceTrust.kind === "suiyin" ? signal.sourceAccountAlias : null,
    classification: signal.status,
    identityState,
    sourceToken,
    sourceLabel,
    publishedTimestamp,
    sortId: String(signal.id),
    searchText: trustedMomentSearchText([publisherLabel, bodyLabel, mediaDescriptionLabel || "", sourceLabel].join("\n")),
    publicItem,
  };
};

const activateTrustedMomentRegistry = (graph, state) => {
  if (trustedMomentActiveGraph === graph && trustedMomentActiveGenerationId === state.generationId) return;
  trustedMomentPreviousActionTokens = new Set(trustedMomentActiveActionTokens.keys());
  trustedMomentActiveActionTokens.clear();
  trustedMomentActiveGraph = graph;
  trustedMomentActiveGenerationId = state.generationId;
  for (const entry of state.base) {
    trustedMomentActiveActionTokens.set(entry.publicItem.opaqueToken, {
      generationId: state.generationId,
      signalId: entry.signalId,
      sourceId: entry.sourceId,
      personId: entry.personId,
      sourceAccountAlias: entry.sourceAccountAlias,
    });
  }
};

const trustedMomentBaseProjection = (graph, activeGenerationId) => {
  if (!graph || Array.isArray(graph) || typeof graph !== "object" || typeof activeGenerationId !== "string" || !activeGenerationId) throw typedError("TRUSTED_MOMENT_GENERATION_INVALID");
  let state = trustedMomentProjectionCache.get(graph);
  if (state?.generationId === activeGenerationId) {
    activateTrustedMomentRegistry(graph, state);
    return state;
  }
  const staleActionTokens = new Set(state?.actionTokens || []);
  const indexes = buildTrustedMomentIndexes(graph);
  const base = [];
  const actionTokens = [];
  for (const signal of Array.isArray(graph.signals) ? graph.signals : []) {
    const projected = projectTrustedMomentSignal(signal, indexes, activeGenerationId);
    if (!projected) continue;
    base.push(projected);
    actionTokens.push(projected.publicItem.opaqueToken);
  }
  base.sort((left, right) => (right.publishedTimestamp ?? -Infinity) - (left.publishedTimestamp ?? -Infinity) || ordinalCompare(left.sortId, right.sortId));
  const sourceOptions = [...new Map(base.map((entry) => [entry.sourceToken, { sourceToken: entry.sourceToken, sourceLabel: entry.sourceLabel }])).values()]
    .sort((left, right) => ordinalCompare(left.sourceLabel, right.sourceLabel) || ordinalCompare(left.sourceToken, right.sourceToken));
  state = {
    generationId: activeGenerationId,
    computeCount: (state?.computeCount || 0) + 1,
    base,
    sourceOptions,
    actionTokens,
    staleActionTokens,
  };
  trustedMomentProjectionCache.set(graph, state);
  activateTrustedMomentRegistry(graph, state);
  return state;
};

export function queryTrustedMoments(graph, { activeGenerationId, page = 1, pageSize = 50, sourceTokens = [], search = "", identity = "all", classification = "all" } = {}) {
  const state = trustedMomentBaseProjection(graph, activeGenerationId);
  const boundedSize = Math.max(1, Math.min(50, Number.isInteger(pageSize) ? pageSize : 50));
  const availableSourceTokens = new Set(state.sourceOptions.map((option) => option.sourceToken));
  const selectedSources = new Set(Array.isArray(sourceTokens) ? sourceTokens.filter((token) => typeof token === "string" && availableSourceTokens.has(token)) : []);
  const needle = trustedMomentSearchText(search);
  const identityFilter = ["confirmed", "pending"].includes(identity) ? identity : "all";
  const classificationFilter = signalClassifications.has(classification) ? classification : "all";
  const matches = state.base.filter((entry) => {
    if (selectedSources.size > 0 && !selectedSources.has(entry.sourceToken)) return false;
    if (needle && !entry.searchText.includes(needle)) return false;
    if (identityFilter !== "all" && entry.identityState !== identityFilter) return false;
    if (classificationFilter !== "all" && entry.classification !== classificationFilter) return false;
    return true;
  });
  const pageCount = Math.max(1, Math.ceil(matches.length / boundedSize));
  const currentPage = Math.max(1, Math.min(Number.isInteger(page) ? page : 1, pageCount));
  const start = (currentPage - 1) * boundedSize;
  return {
    total: matches.length,
    page: currentPage,
    pageSize: boundedSize,
    pageCount,
    items: matches.slice(start, start + boundedSize).map((entry) => clone(entry.publicItem)),
    sourceOptions: clone(state.sourceOptions),
    diagnostics: { baseProjectionComputeCount: state.computeCount, eligibleCount: state.base.length, activeActionTokenCount: trustedMomentActiveActionTokens.size },
  };
}

export function classifyTrustedMoment(graph, { opaqueToken, classification, expectedActiveGenerationId, currentActiveGenerationId } = {}) {
  if (typeof expectedActiveGenerationId !== "string" || !expectedActiveGenerationId || expectedActiveGenerationId !== currentActiveGenerationId) throw typedError("TRUSTED_MOMENT_GENERATION_STALE");
  if (!TRUSTED_MOMENT_WRITABLE_CLASSIFICATIONS.has(classification)) throw typedError("TRUSTED_MOMENT_CLASSIFICATION_INVALID");
  const token = typeof opaqueToken === "string" ? opaqueToken : "";
  const graphState = graph && typeof graph === "object" ? trustedMomentProjectionCache.get(graph) : null;
  const staleToken = trustedMomentPreviousActionTokens.has(token) || graphState?.staleActionTokens?.has(token);
  const binding = trustedMomentActiveActionTokens.get(token);
  if (!binding) throw typedError(staleToken ? "TRUSTED_MOMENT_TOKEN_STALE" : "TRUSTED_MOMENT_TOKEN_INVALID");
  if (trustedMomentActiveGraph !== graph) throw typedError("TRUSTED_MOMENT_TOKEN_INVALID");
  if (trustedMomentActiveGenerationId !== expectedActiveGenerationId || binding.generationId !== expectedActiveGenerationId) throw typedError("TRUSTED_MOMENT_TOKEN_STALE");
  const signal = Array.isArray(graph?.signals) ? graph.signals.find((item) => item?.id === binding.signalId) : null;
  const projected = signal ? projectTrustedMomentSignal(signal, buildTrustedMomentIndexes(graph), expectedActiveGenerationId) : null;
  if (!projected || projected.sourceId !== binding.sourceId || projected.personId !== binding.personId || projected.sourceAccountAlias !== binding.sourceAccountAlias || projected.publicItem.opaqueToken !== token || projected.identityState !== "confirmed") throw typedError("TRUSTED_MOMENT_INELIGIBLE");
  const next = ensureLists(graph);
  const target = next.signals.find((item) => item.id === binding.signalId);
  if (!target) throw typedError("TRUSTED_MOMENT_INELIGIBLE");
  if (target.status === classification) return { graph: next, changed: false, formalWriteCount: 0, generationDelta: 0, cacheWriteCount: 0 };
  target.status = classification;
  validateRelationshipGraphV2(next);
  return { graph: next, changed: true, formalWriteCount: 1, generationDelta: 1, cacheWriteCount: 0 };
}

export function queryGraphSignals(graph, { page = 1, pageSize = 50, search = "", identity = "all", classification = "all", sourceId = null } = {}) {
  const next = ensureLists(graph);
  const boundedSize = Math.max(1, Math.min(50, Number.isInteger(pageSize) ? pageSize : 50));
  const activeSources = new Map(next.sources.filter(activeSource).map((source) => [source.id, source]));
  const people = new Map(next.people.map((person) => [person.id, person]));
  const confirmedPeople = new Set(next.mappings.filter((mapping) => mapping.status === "confirmed" && activeSources.has(mapping.sourceId)).map((mapping) => mapping.personId));
  const needle = String(search).trim().toLocaleLowerCase("zh-CN");
  const matches = next.signals.flatMap((signal) => {
    if (!signal?.id || !activeSources.has(signal.sourceId) || (sourceId && signal.sourceId !== sourceId)) return [];
    const context = !signal.personId || signal.kind === "group_context";
    const identityStatus = context ? "context" : confirmedPeople.has(signal.personId) ? "confirmed" : "pending";
    if (identity !== "all" && identity !== identityStatus) return [];
    if (classification !== "all" && signal.status !== classification) return [];
    const displayName = context ? String(signal.contextLabel || "群上下文") : String(people.get(signal.personId)?.name || "待确认身份");
    if (needle && ![displayName, signal.text, signal.mediaDescription, signal.time].some((value) => String(value || "").toLocaleLowerCase("zh-CN").includes(needle))) return [];
    return [{ ...clone(signal), displayName, identityStatus, sourceLabel: String(activeSources.get(signal.sourceId)?.displayName || "本地来源") }];
  }).sort((left, right) => {
    const timeOrder = (analysisTime(right.publishedAt ?? right.timestamp ?? right.time) || 0) - (analysisTime(left.publishedAt ?? left.timestamp ?? left.time) || 0);
    return timeOrder || String(left.id).localeCompare(String(right.id));
  });
  const pageCount = Math.max(1, Math.ceil(matches.length / boundedSize));
  const currentPage = Math.max(1, Math.min(Number.isInteger(page) ? page : 1, pageCount));
  const start = (currentPage - 1) * boundedSize;
  return { total: matches.length, page: currentPage, pageSize: boundedSize, pageCount, items: matches.slice(start, start + boundedSize) };
}

export function renderGraphSignalPage(graph, options = {}, sink = null) {
  const result = queryGraphSignals(graph, options);
  const labels = { pending: "待确认", "topic-approved": "可作为话题", internal: "仅内部提醒", irrelevant: "不相关", sensitive: "敏感勿用" };
  const choices = [["topic-approved", "可作为话题"], ["internal", "仅内部提醒"], ["irrelevant", "不相关"], ["sensitive", "敏感勿用"]];
  const html = result.items.length ? result.items.map((signal) => {
    const actions = signal.identityStatus === "confirmed"
      ? `<div class="moment-actions">${choices.map(([value, label]) => `<button class="btn btn-small ${signal.status === value ? "btn-primary" : ""}" type="button" data-action="real-signal-classify" data-signal-id="${escapeSignalHtml(signal.id)}" data-classification="${value}" aria-pressed="${signal.status === value}">${label}</button>`).join("")}</div>`
      : `<p class="muted">${signal.identityStatus === "context" ? "群上下文不可归人或分类。" : "先到待确认身份确认，之后才能分类。"}</p>`;
    return `<article class="moment-card" data-real-signal-card="${escapeSignalHtml(signal.id)}"><div class="moment-head"><strong>${escapeSignalHtml(signal.displayName)}</strong><span class="moment-status">${escapeSignalHtml(labels[signal.status] || "待确认")}</span></div><div class="moment-meta"><span>${escapeSignalHtml(signal.sourceLabel)}</span><span>${escapeSignalHtml(signal.publishedAt ?? signal.timestamp ?? signal.time ?? "时间未记录")}</span><span>${signal.identityStatus === "confirmed" ? "身份已确认" : signal.identityStatus === "context" ? "群上下文" : "身份待确认"}</span></div><div class="moment-body">${escapeSignalHtml(signal.text || "无文字")}${signal.mediaDescription ? `<br><span class="muted">媒体描述：${escapeSignalHtml(signal.mediaDescription)}</span>` : ""}</div>${actions}</article>`;
  }).join("") : '<div class="muted" data-real-signal-empty>真实来源暂无线索；不会回退虚构数据。</div>';
  if (sink && typeof sink === "object" && "innerHTML" in sink) sink.innerHTML = html;
  return { ...result, html };
}

export function classifyGraphSignal(graph, signalId, classification) {
  if (!["topic-approved", "internal", "irrelevant", "sensitive"].includes(classification)) throw typedError("signal-classification-invalid");
  const next = ensureLists(graph);
  const signal = next.signals.find((item) => item.id === signalId);
  if (!signal) throw typedError("signal-not-found");
  if (!signal.personId || signal.kind === "group_context") throw typedError("signal-context-not-classifiable");
  if (!activeSource(next.sources.find((source) => source.id === signal.sourceId))) throw typedError("signal-source-inactive");
  if (!next.mappings.some((mapping) => mapping.sourceId === signal.sourceId && mapping.personId === signal.personId && mapping.status === "confirmed")) throw typedError("signal-identity-unconfirmed");
  signal.status = classification;
  return next;
}

const SUIYIN_ENVIRONMENT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
const suiyinSourceIdForEnvironment = (environment) => SUIYIN_ENVIRONMENT_PATTERN.test(environment || "") ? sha256HexSync(`suiyin\0${environment}`) : null;
const SUIYIN_STAGING_ROOT_FIELDS = new Set(["ok", "formalWriteCount", "source", "people", "mappings", "excerpts", "signals", "aggregate", "unsupported"]);
const SUIYIN_SCOPE_RECEIPT_FIELDS = ["personaDeclaredCount", "personaReadCount", "allocationCount", "allocationDeclaredCount", "allocationMissingCount", "customerCount", "friendCount", "groupCount", "messageCount", "unreadableCount", "failureCount", "missingDisplayNameCount"];
const SUIYIN_PERSONA_RECEIPT_FIELDS = new Set(["officialLabel", "friendCount", "groupCount", "messageCount", "unreadableCount", "failureCount", "complete"]);
const SUIYIN_ADAPTER_RECEIPT_FIELDS = new Set(["appliedScope", "paginationComplete", "completenessComplete"]);
const SUIYIN_STAGING_SOURCE_FIELDS = new Set(["id", "state", "displayName", "sourceKind", "environment", "sourceAccountLabels", "sourceAccountWechatSourceLinks", "importedAt", ...SUIYIN_SCOPE_RECEIPT_FIELDS, "excludedCount", "perPersona", "scopeKind", "scopeComplete", "completeScopeUnavailableReason", "unavailableReason", "adapterReceipt", "coverageReceipt", "momentsUnsupported", "attachmentsUnsupported"]);
const SUIYIN_STAGING_PERSON_FIELDS = new Set(["id", "name", "state", "sourceScoped"]);
const SUIYIN_STAGING_EXCERPT_FIELDS = new Set(["id", "sourceId", "personId", "kind", "text", "timestamp", "direction", "messageType"]);
const SUIYIN_STAGING_GROUP_SIGNAL_FIELDS = new Set(["id", "sourceId", "status", "thirdParty", "kind", "text", "timestamp", "direction", "messageType", "contextId", "contextLabel"]);
const SUIYIN_STAGING_MOMENT_REQUIRED_FIELDS = new Set(["id", "sourceId", "personId", "status", "kind", "text", "publishedAt", "sourceAccountAlias"]);
const SUIYIN_STAGING_MOMENT_FIELDS = new Set([...SUIYIN_STAGING_MOMENT_REQUIRED_FIELDS, "mediaDescription"]);
const SUIYIN_STAGING_AGGREGATE_FIELDS = new Set([...SUIYIN_SCOPE_RECEIPT_FIELDS, "excludedCount", "perPersona", "scopeKind", "scopeComplete", "completeScopeUnavailableReason", "unavailableReason", "adapterReceipt", "coverageReceipt"]);
const onlyAllowedFields = (value, allowed) => value && !Array.isArray(value) && typeof value === "object" && Object.keys(value).every((key) => allowed.has(key));
const uniqueStringIds = (items) => Array.isArray(items) && items.every((item) => typeof item?.id === "string" && item.id) && new Set(items.map((item) => item.id)).size === items.length;
const validateSuiyinScopeReceipt = (source, errorCode = "SUIYIN_STAGING_SOURCE_MISMATCH") => {
  const invalid = () => { throw typedError(errorCode); };
  for (const field of [...SUIYIN_SCOPE_RECEIPT_FIELDS, "excludedCount"]) if (!nonNegativeInteger(source?.[field])) invalid();
  const customerKindsMatch = source.friendCount + source.groupCount + source.missingDisplayNameCount === source.customerCount;
  const allocationMatches = source.allocationCount + source.allocationMissingCount === source.allocationDeclaredCount && source.customerCount === source.allocationCount;
  const allocationNotApplicable = source.allocationCount === 0 && source.allocationDeclaredCount === 0 && source.allocationMissingCount === 0;
  if (!customerKindsMatch || source.failureCount !== 0) invalid();
  if (source.scopeKind === "current-allocation-partial-v1" && !allocationMatches) invalid();
  if (source.scopeKind === "persona-complete-v1" && !allocationNotApplicable && !allocationMatches) invalid();
  if (!Array.isArray(source.perPersona) || source.perPersona.length !== source.personaReadCount) invalid();
  const personaLabels = new Set();
  for (const persona of source.perPersona) {
    if (!onlyAllowedFields(persona, SUIYIN_PERSONA_RECEIPT_FIELDS) || Object.keys(persona).length !== SUIYIN_PERSONA_RECEIPT_FIELDS.size || typeof persona.complete !== "boolean") invalid();
    let label;
    try { label = normalizeSuiyinAccountLabel(persona.officialLabel); } catch { invalid(); }
    if (label !== persona.officialLabel || personaLabels.has(label)) invalid();
    personaLabels.add(label);
    for (const field of ["friendCount", "groupCount", "messageCount", "unreadableCount", "failureCount"]) if (!nonNegativeInteger(persona[field])) invalid();
    if (persona.failureCount !== 0) invalid();
  }
  const hasAdapterReceipt = Object.prototype.hasOwnProperty.call(source, "adapterReceipt");
  let adapterReceipt = null;
  if (hasAdapterReceipt) {
    adapterReceipt = source.adapterReceipt;
    if (!onlyAllowedFields(adapterReceipt, SUIYIN_ADAPTER_RECEIPT_FIELDS) || Object.keys(adapterReceipt).length !== SUIYIN_ADAPTER_RECEIPT_FIELDS.size || [...SUIYIN_ADAPTER_RECEIPT_FIELDS].some((field) => typeof adapterReceipt[field] !== "boolean")) invalid();
  }
  const legacyPartial = !hasAdapterReceipt
    && source.personaDeclaredCount === 3
    && source.personaReadCount === 3
    && source.scopeKind === "current-allocation-partial-v1"
    && source.scopeComplete === false
    && source.completeScopeUnavailableReason === "UPSTREAM_PERSONA_COHORT_UNAVAILABLE"
    && (source.unavailableReason === undefined || source.unavailableReason === "allocation-snapshot-incomplete")
    && source.perPersona.every((persona) => persona.complete === false);
  const correctedPartial = hasAdapterReceipt
    && source.scopeKind === "current-allocation-partial-v1"
    && source.scopeComplete === false
    && source.completeScopeUnavailableReason === "LOCAL_SUIYIN_ADAPTER_RECEIPT_INCOMPLETE"
    && (source.unavailableReason === undefined || source.unavailableReason === "allocation-snapshot-incomplete")
    && [...SUIYIN_ADAPTER_RECEIPT_FIELDS].some((field) => adapterReceipt[field] === false)
    && source.perPersona.every((persona) => persona.complete === false);
  const personaComplete = hasAdapterReceipt
    && source.personaDeclaredCount === 3
    && source.personaReadCount === 3
    && source.scopeKind === "persona-complete-v1"
    && source.scopeComplete === true
    && !Object.prototype.hasOwnProperty.call(source, "completeScopeUnavailableReason")
    && !Object.prototype.hasOwnProperty.call(source, "unavailableReason")
    && [...SUIYIN_ADAPTER_RECEIPT_FIELDS].every((field) => adapterReceipt[field] === true)
    && source.perPersona.every((persona) => persona.complete === true);
  if (!legacyPartial && !correctedPartial && !personaComplete) invalid();
  return true;
};

export function projectSourceCoverageReceipt(source = {}, graph = null) {
  if (strictPlainObject(source) && own(source, "coverageReceipt")) return validateCoverageReceipt(source.coverageReceipt);
  if (source?.sourceKind === "suiyin-mcp" && source.scopeKind === "current-allocation-partial-v1" && source.scopeComplete === false) {
    try { validateSuiyinScopeReceipt(source, "COVERAGE_RECEIPT_INVALID"); }
    catch { return legacyCoverageReceipt("suiyin-current-allocation-partial-v1"); }
    const hasGraphCollections = graph && Array.isArray(graph.excerpts) && Array.isArray(graph.signals);
    const directMessageIds = hasGraphCollections
      ? new Set(graph.excerpts.filter((item) => item?.sourceId === source.id && requiredString(item.id) && item.id).map((item) => item.id))
      : null;
    const groupRows = hasGraphCollections
      ? graph.signals.filter((item) => item?.sourceId === source.id && item.kind === "group_context" && requiredString(item.id) && item.id)
      : [];
    const groupMessageIds = hasGraphCollections ? new Set(groupRows.map((item) => item.id)) : null;
    const receipt = {
      version: 1,
      scopeKind: "suiyin-current-allocation-partial-v1",
      scopeComplete: false,
      metrics: {
        friends: coverageMetric(source.friendCount, "partial"),
        directConversations: coverageMetric(source.friendCount, "partial"),
        directMessages: directMessageIds ? coverageMetric(directMessageIds.size, "partial") : coverageMetric(null, "blocked", "LOCAL_SUIYIN_COVERAGE_GRAPH_REQUIRED"),
        groupConversations: coverageMetric(source.groupCount, "partial"),
        groupMessages: groupMessageIds ? coverageMetric(groupMessageIds.size, "partial") : coverageMetric(null, "blocked", "LOCAL_SUIYIN_COVERAGE_GRAPH_REQUIRED"),
        moments: coverageMetric(null, "blocked", "LOCAL_SUIYIN_MOMENTS_MAPPING_INCOMPLETE"),
      },
      excludedCount: source.excludedCount,
    };
    return validateCoverageReceipt(receipt);
  }
  return legacyCoverageReceipt(source?.sourceKind === "suiyin-mcp" ? "suiyin-current-allocation-partial-v1" : "wechat-export-batch-v1");
}

const validateSuiyinStaging = (staging) => {
  if (!onlyAllowedFields(staging, SUIYIN_STAGING_ROOT_FIELDS) || staging.ok !== true || staging.formalWriteCount !== 0 || !onlyAllowedFields(staging.source, SUIYIN_STAGING_SOURCE_FIELDS)) throw typedError("SUIYIN_STAGING_SOURCE_MISMATCH");
  const source = staging.source;
  if (source.id !== suiyinSourceIdForEnvironment(source.environment) || source.state !== "active" || source.sourceKind !== "suiyin-mcp" || !Object.prototype.hasOwnProperty.call(source, "sourceAccountLabels") || !Object.prototype.hasOwnProperty.call(source, "sourceAccountWechatSourceLinks") || typeof source.displayName !== "string" || !source.displayName || typeof source.importedAt !== "string" || !Number.isFinite(Date.parse(source.importedAt)) || (source.momentsUnsupported !== undefined && typeof source.momentsUnsupported !== "boolean") || source.attachmentsUnsupported !== true || "sourceBundleRevision" in source) throw typedError("SUIYIN_STAGING_SOURCE_MISMATCH");
  validateSuiyinScopeReceipt(source);
  if (!strictPlainObject(staging.aggregate)) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
  const sourceHasCoverage = own(source, "coverageReceipt");
  const aggregateHasCoverage = own(staging.aggregate, "coverageReceipt");
  if (sourceHasCoverage !== aggregateHasCoverage) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
  if (sourceHasCoverage) {
    let coverageReceipt;
    try { coverageReceipt = validateCoverageReceipt(source.coverageReceipt); }
    catch { throw typedError("SUIYIN_STAGING_REFERENCE_INVALID"); }
    const expectedScopeKind = source.scopeKind === "persona-complete-v1" ? "suiyin-persona-complete-v1" : "suiyin-current-allocation-partial-v1";
    const expectedMetricState = source.scopeComplete ? "exact" : "partial";
    const countedKeys = COVERAGE_METRIC_KEYS.filter((key) => key !== "moments");
    if (coverageReceipt.scopeKind !== expectedScopeKind || coverageReceipt.scopeComplete !== source.scopeComplete || stableObject(coverageReceipt) !== stableObject(staging.aggregate.coverageReceipt) || countedKeys.some((key) => coverageReceipt.metrics[key].state !== expectedMetricState) || Object.values(coverageReceipt.metrics).some((metric) => metric.state === "upstream-unsupported") || coverageReceipt.metrics.friends.value !== source.friendCount || coverageReceipt.metrics.directConversations.value !== source.friendCount || coverageReceipt.metrics.groupConversations.value !== source.groupCount || coverageReceipt.metrics.directMessages.value + coverageReceipt.metrics.groupMessages.value !== source.messageCount || coverageReceipt.excludedCount !== source.excludedCount) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
  }
  let registry;
  try { registry = normalizeSuiyinAccountLabels(source.sourceAccountLabels); }
  catch { throw typedError("SUIYIN_ACCOUNT_LABEL_INVALID"); }
  const registryLabels = new Set(Object.values(registry).filter((label) => typeof label === "string"));
  if (source.perPersona.some((persona) => !registryLabels.has(persona.officialLabel))) throw typedError("SUIYIN_STAGING_SOURCE_MISMATCH");
  let sourceAccountWechatSourceLinks;
  try { sourceAccountWechatSourceLinks = normalizeSuiyinWechatSourceLinks(source.sourceAccountWechatSourceLinks, registry); }
  catch (error) { throw typedError(error?.code === "SUIYIN_SOURCE_LINK_CONFLICT" ? "SUIYIN_SOURCE_LINK_CONFLICT" : "SUIYIN_SOURCE_LINK_INVALID"); }
  if (!uniqueStringIds(staging.people) || !uniqueStringIds(staging.mappings) || !uniqueStringIds(staging.excerpts) || !uniqueStringIds(staging.signals)) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
  if (staging.people.some((person) => !onlyAllowedFields(person, SUIYIN_STAGING_PERSON_FIELDS) || Object.keys(person).length !== SUIYIN_STAGING_PERSON_FIELDS.size || !IDENTITY_HASH_PATTERN.test(person.id) || typeof person.name !== "string" || !person.name || ["昵称待补", "待确认身份"].includes(person.name.normalize("NFKC").trim()) || person.state !== "pending" || person.sourceScoped !== true)) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
  const people = new Set(staging.people.map((person) => person.id));
  let mappings;
  try { mappings = staging.mappings.map(normalizeIdentityMapping); }
  catch (error) { throw typedError(error?.code === "SOURCE_ACCOUNT_ALIAS_INVALID" ? "SUIYIN_ACCOUNT_LABEL_INVALID" : "SUIYIN_STAGING_REFERENCE_INVALID"); }
  if (mappings.some((mapping, index) => !onlyAllowedFields(staging.mappings[index], SUIYIN_STAGING_MAPPING_FIELDS) || Object.keys(staging.mappings[index]).length !== SUIYIN_STAGING_MAPPING_FIELDS.size || mapping.accountAttributionOverride !== undefined || mapping.sourceId !== source.id || !people.has(mapping.sourcePersonId) || !people.has(mapping.personId) || mapping.personId !== mapping.sourcePersonId || mapping.id !== `${source.id}:${mapping.sourcePersonId}` || mapping.sourceAccountAliases.some((alias) => !Object.prototype.hasOwnProperty.call(registry, alias)))) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
  const mappedSourcePeople = new Set(mappings.map((mapping) => mapping.sourcePersonId));
  if (mappings.length !== people.size || mappedSourcePeople.size !== people.size || [...people].some((personId) => !mappedSourcePeople.has(personId))) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
  const mappingsByPerson = new Map(mappings.map((mapping) => [mapping.personId, mapping]));
  const contentIds = new Set();
  for (const excerpt of staging.excerpts) {
    if (!onlyAllowedFields(excerpt, SUIYIN_STAGING_EXCERPT_FIELDS) || Object.keys(excerpt).length !== SUIYIN_STAGING_EXCERPT_FIELDS.size || !IDENTITY_HASH_PATTERN.test(excerpt.id) || contentIds.has(excerpt.id) || excerpt.sourceId !== source.id || !people.has(excerpt.personId) || typeof excerpt.kind !== "string" || typeof excerpt.text !== "string" || !["sales", "customer", "unknown"].includes(excerpt.direction) || typeof excerpt.messageType !== "string" || !Number.isFinite(relationshipTimestamp(excerpt.timestamp))) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
    contentIds.add(excerpt.id);
  }
  for (const signal of staging.signals) {
    if (!IDENTITY_HASH_PATTERN.test(signal?.id) || contentIds.has(signal.id) || signal.sourceId !== source.id) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
    if (signal.kind === "group_context") {
      if (!onlyAllowedFields(signal, SUIYIN_STAGING_GROUP_SIGNAL_FIELDS) || "personId" in signal || signal.thirdParty !== true || signal.status !== "internal" || !IDENTITY_HASH_PATTERN.test(String(signal.contextId || "")) || typeof signal.contextLabel !== "string" || !signal.contextLabel || typeof signal.text !== "string" || typeof signal.messageType !== "string" || !Number.isFinite(relationshipTimestamp(signal.timestamp)) || (own(signal, "direction") && !["sales", "customer", "unknown"].includes(signal.direction))) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
    } else if (signal.kind === "moment") {
      const mapping = mappingsByPerson.get(signal.personId);
      if (!onlyAllowedFields(signal, SUIYIN_STAGING_MOMENT_FIELDS) || [...SUIYIN_STAGING_MOMENT_REQUIRED_FIELDS].some((field) => !own(signal, field)) || signal.status !== "pending" || !people.has(signal.personId) || typeof signal.text !== "string" || (own(signal, "mediaDescription") && typeof signal.mediaDescription !== "string") || !strictIsoTimestamp(signal.publishedAt) || !SOURCE_ACCOUNT_ALIAS_PATTERN.test(String(signal.sourceAccountAlias || "")) || !mapping || !mapping.sourceAccountAliases.includes(signal.sourceAccountAlias) || typeof registry[signal.sourceAccountAlias] !== "string") throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
    } else throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
    contentIds.add(signal.id);
  }
  const groupContextCount = staging.signals.filter((signal) => signal.kind === "group_context").length;
  if (source.friendCount !== staging.people.length || source.messageCount !== staging.excerpts.length + groupContextCount) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
  if (!onlyAllowedFields(staging.aggregate, SUIYIN_STAGING_AGGREGATE_FIELDS) || Object.keys(staging.aggregate).length !== Object.keys(source).filter((field) => SUIYIN_STAGING_AGGREGATE_FIELDS.has(field)).length || Object.keys(staging.aggregate).some((field) => stableObject(staging.aggregate[field]) !== stableObject(source[field])) || !onlyAllowedFields(staging.unsupported, new Set(["moments", "attachments"])) || Object.keys(staging.unsupported).length !== 2 || typeof staging.unsupported.moments !== "boolean" || staging.unsupported.attachments !== true || (source.momentsUnsupported !== undefined && source.momentsUnsupported !== staging.unsupported.moments)) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
  return { source: { ...clone(source), sourceAccountLabels: registry, sourceAccountWechatSourceLinks }, mappings };
};

export function projectSuiyinSourceAttributionRepair(graph, staging) {
  const validated = validateSuiyinStaging(staging);
  const next = upgradeRelationshipGraphV2(graph || { owner: "owner_local", settings: { schema: 2 } });
  const previousSource = next.sources.find((source) => source.id === validated.source.id);
  const previousRegistry = normalizeSuiyinAccountLabels(previousSource?.sourceAccountLabels);
  const mergedRegistry = { ...previousRegistry };
  for (const [alias, label] of Object.entries(validated.source.sourceAccountLabels)) {
    if (label !== null || !Object.prototype.hasOwnProperty.call(mergedRegistry, alias) || mergedRegistry[alias] === null) mergedRegistry[alias] = label;
  }
  const canonicalRegistry = Object.fromEntries(Object.entries(mergedRegistry).sort(([left], [right]) => ordinalCompare(left, right)));
  const links = mergeSuiyinWechatSourceLinks(previousSource?.sourceAccountWechatSourceLinks, validated.source.sourceAccountWechatSourceLinks, canonicalRegistry);
  const activeSources = new Map(next.sources.filter((source) => source?.id && activeSource(source)).map((source) => [source.id, source]));
  const mappingsBySource = new Map();
  for (const mapping of next.mappings) {
    if (!activeSources.has(mapping?.sourceId)) continue;
    const owned = mappingsBySource.get(mapping.sourceId) || [];
    owned.push(mapping);
    mappingsBySource.set(mapping.sourceId, owned);
  }
  const matched = [];
  for (const [wechatSourceId, alias] of Object.entries(links)) {
    const source = activeSources.get(wechatSourceId);
    if (!source || sourceProvenanceState(source, mappingsBySource.get(wechatSourceId) || []) !== "wechat") continue;
    const personIds = new Set((mappingsBySource.get(wechatSourceId) || []).map((mapping) => mapping.personId));
    matched.push({ alias, label: typeof canonicalRegistry[alias] === "string" ? `碎银 · ${canonicalRegistry[alias]}` : "碎银 · 账号待补", personIds });
  }
  const affectedPeople = new Set(matched.flatMap((entry) => [...entry.personIds]));
  const attributionGroups = new Map();
  for (const entry of matched) {
    const key = `${entry.alias}\0${entry.label}`;
    const group = attributionGroups.get(key) || { label: entry.label, matchedSourceCount: 0, personIds: new Set() };
    group.matchedSourceCount += 1;
    for (const personId of entry.personIds) group.personIds.add(personId);
    attributionGroups.set(key, group);
  }
  const attributions = [...attributionGroups].sort(([, left], [, right]) => ordinalCompare(left.label, right.label)).map(([, group]) => ({
    label: group.label,
    matchedSourceCount: group.matchedSourceCount,
    affectedPeopleCount: group.personIds.size,
  }));
  return { matchedSourceCount: matched.length, affectedPeopleCount: affectedPeople.size, attributions, formalWriteCount: 0 };
}

export function mergeSuiyinImport(graph, staging) {
  const validated = validateSuiyinStaging(staging);
  const sourceId = validated.source.id;
  const next = upgradeRelationshipGraphV2(graph || { owner: "owner_local", settings: { schema: 2 } });
  const previouslyPurged = staging.people.map((person) => person.id).filter((id) => next.purgedPersonIds.includes(id));
  if (previouslyPurged.length) throw typedError("previously-purged", { personIds: [...new Set(previouslyPurged)], reviewRequired: true });
  const previousSource = next.sources.find((source) => source.id === sourceId);
  const previousMappings = new Map(next.mappings.filter((mapping) => mapping.sourceId === sourceId).map((mapping) => [mapping.sourcePersonId, mapping]));
  const targets = new Map(validated.mappings.map((mapping) => [mapping.sourcePersonId, previousMappings.get(mapping.sourcePersonId)?.personId || mapping.personId]));
  const normalizedExcerpts = staging.excerpts.map((excerpt) => ({ ...clone(excerpt), personId: targets.get(excerpt.personId) || excerpt.personId, conversationKind: "direct", conversationId: `suiyin:${sourceId}:${excerpt.personId}`, direction: excerpt.direction === "sales" ? "self" : excerpt.direction === "customer" ? "counterparty" : "unknown", thirdParty: false }));
  const normalizedSignals = staging.signals.map((signal) => signal.personId ? { ...clone(signal), personId: targets.get(signal.personId) || signal.personId } : clone(signal));
  const existingFriendIds = new Set(next.mappings.filter((mapping) => mapping.sourceId === sourceId && typeof mapping.sourcePersonId === "string").map((mapping) => mapping.sourcePersonId));
  const existingGroupIds = new Set(next.signals.filter((signal) => signal.sourceId === sourceId && signal.kind === "group_context" && typeof signal.contextId === "string").map((signal) => signal.contextId));
  const incomingFriendIds = new Set(validated.mappings.map((mapping) => mapping.sourcePersonId));
  const incomingGroupIds = new Set(normalizedSignals.filter((signal) => signal.kind === "group_context").map((signal) => signal.contextId));
  if ([...incomingGroupIds].some((id) => existingFriendIds.has(id) || incomingFriendIds.has(id)) || [...incomingFriendIds].some((id) => existingGroupIds.has(id))) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
  const immutableEqual = (left, right, fields) => fields.every((field) => stableObject(left?.[field]) === stableObject(right?.[field]));
  const failOnImmutableCollision = (existing, incoming, fields) => {
    if (existing && !immutableEqual(existing, incoming, fields)) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
  };
  const existingPeopleById = new Map(next.people.map((person) => [person.id, person]));
  for (const person of staging.people) if (existingPeopleById.has(person.id) && !previousMappings.has(person.id)) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
  const existingMappingsById = new Map(next.mappings.map((mapping) => [mapping.id, mapping]));
  for (const mapping of validated.mappings) failOnImmutableCollision(existingMappingsById.get(mapping.id), mapping, ["id", "sourceId", "sourcePersonId"]);
  const existingExcerptsById = new Map(next.excerpts.map((excerpt) => [excerpt.id, excerpt]));
  const existingSignalsById = new Map(next.signals.map((signal) => [signal.id, signal]));
  for (const excerpt of normalizedExcerpts) {
    if (existingSignalsById.has(excerpt.id)) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
    failOnImmutableCollision(existingExcerptsById.get(excerpt.id), excerpt, ["id", "sourceId", "personId", "kind", "timestamp", "direction", "messageType", "conversationKind", "conversationId", "thirdParty"]);
  }
  for (const signal of normalizedSignals) {
    if (existingExcerptsById.has(signal.id)) throw typedError("SUIYIN_STAGING_REFERENCE_INVALID");
    const immutableFields = signal.kind === "moment"
      ? ["id", "sourceId", "personId", "kind", "publishedAt", "sourceAccountAlias"]
      : ["id", "sourceId", "personId", "kind", "timestamp", "direction", "messageType", "contextId", "thirdParty"];
    failOnImmutableCollision(existingSignalsById.get(signal.id), signal, immutableFields);
    if (signal.kind === "group_context") for (const prior of next.signals.filter((item) => item.contextId === signal.contextId)) failOnImmutableCollision(prior, signal, ["sourceId", "kind", "contextId", "thirdParty"]);
  }
  const previousRegistry = normalizeSuiyinAccountLabels(previousSource?.sourceAccountLabels);
  const mergedRegistry = { ...previousRegistry };
  for (const mapping of previousMappings.values()) for (const alias of normalizeSourceAccountAliases(mapping.sourceAccountAliases)) if (!Object.prototype.hasOwnProperty.call(mergedRegistry, alias)) mergedRegistry[alias] = null;
  for (const [alias, label] of Object.entries(validated.source.sourceAccountLabels)) if (label !== null || !Object.prototype.hasOwnProperty.call(mergedRegistry, alias) || mergedRegistry[alias] === null) mergedRegistry[alias] = label;
  const canonicalRegistry = Object.fromEntries(Object.entries(mergedRegistry).sort(([left], [right]) => ordinalCompare(left, right)));
  const sourceAccountWechatSourceLinks = mergeSuiyinWechatSourceLinks(previousSource?.sourceAccountWechatSourceLinks, validated.source.sourceAccountWechatSourceLinks, canonicalRegistry);
  next.sources = next.sources.filter((source) => source.id !== sourceId).concat({ ...validated.source, sourceAccountLabels: canonicalRegistry, sourceAccountWechatSourceLinks });
  const existingPeople = new Map(next.people.map((person) => [person.id, person]));
  for (const stagedPerson of staging.people) {
    const targetPersonId = targets.get(stagedPerson.id) || stagedPerson.id;
    const previous = existingPeople.get(targetPersonId);
    if (!previous) existingPeople.set(targetPersonId, { ...clone(stagedPerson), id: targetPersonId, state: "pending", sourceScoped: true });
    else if (targetPersonId === stagedPerson.id) existingPeople.set(targetPersonId, { ...clone(stagedPerson), state: previous.state || "pending", sourceScoped: true });
  }
  next.people = [...existingPeople.values()];
  const stagedSourcePersonIds = new Set(validated.mappings.map((mapping) => mapping.sourcePersonId));
  const unmatchedPreviousMappings = next.mappings.filter((mapping) => mapping.sourceId === sourceId && !stagedSourcePersonIds.has(mapping.sourcePersonId));
  next.mappings = next.mappings.filter((mapping) => mapping.sourceId !== sourceId).concat(unmatchedPreviousMappings, validated.mappings.map((mapping) => {
    const previous = previousMappings.get(mapping.sourcePersonId);
    return { ...clone(mapping), id: previous?.id || mapping.id, personId: targets.get(mapping.sourcePersonId) || mapping.personId, status: previous?.status || "pending", sourceAccountAliases: [...new Set([...(previous?.sourceAccountAliases || []), ...mapping.sourceAccountAliases])].sort(ordinalCompare), ...(previous?.accountAttributionOverride ? { accountAttributionOverride: clone(previous.accountAttributionOverride) } : {}) };
  }));
  const upsertByStableId = (existing, incoming) => {
    const incomingById = new Map(incoming.map((item) => [item.id, item]));
    const merged = existing.map((item) => incomingById.has(item.id) ? clone(incomingById.get(item.id)) : item);
    const existingIds = new Set(existing.map((item) => item.id));
    for (const item of incoming) if (!existingIds.has(item.id)) merged.push(clone(item));
    return merged;
  };
  next.excerpts = upsertByStableId(next.excerpts, normalizedExcerpts);
  next.signals = upsertByStableId(next.signals, normalizedSignals);
  return validateRelationshipGraphV2(next);
}

export function decideImportedIdentity(graph, mappingId, decision) {
  if (decision !== "confirmed") throw typedError("IDENTITY_PAIR_INVALID");
  return confirmImportedSourceIdentity(graph, { mappingId }).graph;
}

export function undoImportedIdentityDecision(graph, mappingId) {
  const next = upgradeRelationshipGraphV2(graph);
  const mapping = next.mappings.find((item) => item.id === mappingId);
  if (!mapping) return next;
  mapping.status = "pending";
  const person = next.people.find((item) => item.id === mapping.personId);
  if (person) person.state = next.mappings.some((item) => item.personId === mapping.personId && item.status === "confirmed") ? "active" : "pending";
  return next;
}

const MANUAL_CONTACT_STATUSES = new Set(["sent-manually", "replied", "no-reply", "follow-up"]);

export function createLocalContactDraft(candidate) {
  if (!candidate || candidate.confirmed !== true || typeof candidate.displayName !== "string" || !candidate.displayName.trim()) throw typedError("contact-identity-unconfirmed");
  return `${candidate.displayName.trim()}，最近怎么样？有段时间没联系了，来问候一下。`;
}

export function recordManualContactEvent(graph, { personId, status, actionId, recordedAt, text } = {}) {
  const next = ensureLists(graph);
  if (!requiredString(personId) || !requiredString(actionId) || !MANUAL_CONTACT_STATUSES.has(status) || !requiredString(recordedAt) || !Number.isFinite(Date.parse(recordedAt))) throw typedError("invalid-manual-contact-event");
  const person = next.people.find((item) => item.id === personId && item.state === "active");
  const confirmed = next.mappings.some((item) => item.personId === personId && item.status === "confirmed" && activeSource(next.sources.find((source) => source.id === item.sourceId)));
  if (!person || !confirmed) throw typedError("contact-identity-unconfirmed");
  if (next.actions.some((item) => item.id === actionId)) throw typedError("duplicate-manual-contact-action");
  const sent = next.actions.some((item) => item.personId === personId && item.kind === "manual-contact" && item.status === "sent-manually");
  if (status !== "sent-manually" && !sent) throw typedError("manual-contact-send-required");
  if (status === "sent-manually" && typeof text !== "string") throw typedError("manual-contact-text-required");
  next.actions.push({ id: actionId, personId, kind: "manual-contact", status, recordedAt, userMarked: true, ...(status === "sent-manually" ? { text } : {}) });
  return next;
}

export function getManualContactState(graph, personId) {
  const actions = ensureLists(graph).actions.filter((item) => item.personId === personId && item.kind === "manual-contact" && MANUAL_CONTACT_STATUSES.has(item.status));
  const sent = actions.filter((item) => item.status === "sent-manually").at(-1) || null;
  const feedback = actions.filter((item) => item.status !== "sent-manually").at(-1) || null;
  return { sent, feedback, status: feedback?.status || sent?.status || null };
}

export function filterConfirmedKnowledge(graph) {
  const next = upgradeRelationshipGraphV2(graph);
  const activePeople = new Set(next.people.filter((person) => person.state !== "trashed" && person.state !== "purged").map((person) => person.id));
  const activeSources = new Set(next.sources.filter((source) => source.state !== "removed" && source.state !== "deleted" && source.state !== "invalidated").map((source) => source.id));
  return {
    people: next.people.filter((person) => activePeople.has(person.id)),
    relationships: next.relationships.filter((item) => CURRENT_RELATIONSHIP_STATUSES.has(item.status) && activePeople.has(item.personId)),
    dictionary: next.dictionary.filter((item) => item.status === "active"),
    signals: next.signals.filter((item) => item.status === "topic-approved" && !item.thirdParty && activePeople.has(item.personId) && activeSources.has(item.sourceId)),
    topics: next.topics.filter((item) => activePeople.has(item.personId) && activeSources.has(item.sourceId)),
  };
}

const ANALYSIS_NOISE_NAME = /(?:微信团队|文件传输助手|群发|群助手|系统(?:消息|通知)|服务通知|公众号|订阅号|小程序)/i;
const analysisTime = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value < 1_000_000_000_000 ? value * 1000 : value;
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? (numeric < 1_000_000_000_000 ? numeric * 1000 : numeric) : null;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const analysisDate = (value) => value === null ? null : new Date(value).toISOString().slice(0, 10);

export function analyzeLocalRelationshipGraph(graph, options = {}) {
  const people = Array.isArray(graph?.people) ? graph.people : [];
  const sources = Array.isArray(graph?.sources) ? graph.sources : [];
  const excerpts = Array.isArray(graph?.excerpts) ? graph.excerpts : [];
  const signals = Array.isArray(graph?.signals) ? graph.signals : [];
  const mappings = Array.isArray(graph?.mappings) ? graph.mappings : [];
  const relationships = Array.isArray(graph?.relationships) ? graph.relationships : [];
  const purged = new Set(Array.isArray(graph?.purgedPersonIds) ? graph.purgedPersonIds : []);
  const activeSourceMap = new Map(sources.filter((source) => source?.id && !["removed", "deleted", "invalidated"].includes(source.state)).map((source) => [source.id, source]));
  const activeSources = new Set(activeSourceMap.keys());
  const badgeProjection = createSourceBadgeProjection(graph);

  let referenceMs;
  if (options.now !== undefined) {
    referenceMs = analysisTime(options.now);
    if (referenceMs === null) throw typedError("invalid-analysis-reference-time");
  } else {
    referenceMs = 0;
    for (const item of excerpts) referenceMs = Math.max(referenceMs, analysisTime(item?.timestamp) || 0);
    for (const item of signals) referenceMs = Math.max(referenceMs, analysisTime(item?.publishedAt ?? item?.timestamp ?? item?.time) || 0);
  }

  const aggregates = new Map();
  let excludedPeople = 0;
  for (const person of people) {
    if (!person?.id || purged.has(person.id) || ["trashed", "purged"].includes(person.state) || ANALYSIS_NOISE_NAME.test(String(person.name || ""))) {
      excludedPeople += 1;
      continue;
    }
    aggregates.set(person.id, {
      personId: person.id,
      displayName: String(person.name || "待确认身份"),
      pending: true,
      excerptCount: 0,
      signalCount: 0,
      relationshipCount: 0,
      latestExcerpt: null,
      latestSignal: null,
      sourceBadges: [],
    });
  }

  for (const mapping of mappings) {
    const entry = aggregates.get(mapping?.personId);
    if (!entry || !activeSources.has(mapping.sourceId)) continue;
    entry.sourceBadges.push(...badgeProjection.sourceBadges(mapping, activeSourceMap.get(mapping.sourceId)));
    if (mapping.status === "confirmed") entry.pending = false;
  }
  for (const relationship of relationships) {
    const entry = aggregates.get(relationship?.personId);
    if (!entry || !CURRENT_RELATIONSHIP_STATUSES.has(relationship.status)) continue;
    const relationshipSources = Array.isArray(relationship.sourceIds) ? relationship.sourceIds : [];
    if (relationshipSources.length && !relationshipSources.some((sourceId) => activeSources.has(sourceId))) continue;
    entry.relationshipCount += 1;
  }
  const confirmedPersonSources = new Set(mappings.filter((mapping) => mapping?.status === "confirmed" && activeSources.has(mapping.sourceId)).map((mapping) => `${mapping.personId}\0${mapping.sourceId}`));
  let excerptCount = 0;
  for (const excerpt of excerpts) {
    const entry = aggregates.get(excerpt?.personId);
    const at = analysisTime(excerpt?.timestamp ?? excerpt?.time);
    if (!entry || !activeSources.has(excerpt.sourceId) || !confirmedPersonSources.has(`${excerpt.personId}\0${excerpt.sourceId}`) || excerpt.conversationKind !== "direct" || typeof excerpt.conversationId !== "string" || !excerpt.conversationId || excerpt.kind !== "chat-text" || !["self", "counterparty"].includes(excerpt.direction) || excerpt.thirdParty === true || at === null) continue;
    entry.excerptCount += 1;
    excerptCount += 1;
    if (at !== null && (entry.latestExcerpt === null || at > entry.latestExcerpt)) entry.latestExcerpt = at;
  }
  let signalCount = 0;
  for (const signal of signals) {
    const entry = aggregates.get(signal?.personId);
    if (!entry || !activeSources.has(signal.sourceId) || signal.thirdParty || ["invalidated", "irrelevant", "sensitive", "deleted"].includes(signal.status)) continue;
    entry.signalCount += 1;
    signalCount += 1;
    const at = analysisTime(signal.publishedAt ?? signal.timestamp ?? signal.time);
    if (at !== null && (entry.latestSignal === null || at > entry.latestSignal)) entry.latestSignal = at;
  }

  const candidates = [];
  for (const entry of aggregates.values()) {
    if (entry.excerptCount === 0 && entry.signalCount === 0 && entry.relationshipCount === 0) {
      excludedPeople += 1;
      continue;
    }
    const reasons = [];
    if (entry.relationshipCount > 0 || entry.excerptCount > 0) reasons.push({
      category: "relationship-significance",
      label: "关系意义",
      summary: entry.relationshipCount > 0 ? `已有 ${entry.relationshipCount} 条确认关系记录；是否联系仍由你决定。` : `本机有 ${entry.excerptCount} 条最小互动摘录；仅供你内部审查。`,
      evidence: { kind: "count", value: entry.relationshipCount || entry.excerptCount, label: entry.relationshipCount > 0 ? `${entry.relationshipCount} 条确认关系记录` : `${entry.excerptCount} 条最小互动摘录` },
    });
    if (entry.latestExcerpt !== null && referenceMs >= entry.latestExcerpt && (referenceMs - entry.latestExcerpt) / DAY >= 90) reasons.push({
      category: "fading-risk",
      label: "淡化风险",
      summary: `距最近聊天 ${analysisDate(entry.latestExcerpt)} 已有一段时间；由你判断是否简单问候。`,
      evidence: { kind: "date", value: analysisDate(entry.latestExcerpt), label: `最近聊天 ${analysisDate(entry.latestExcerpt)}` },
    });
    if (entry.signalCount > 0) reasons.push({
      category: "natural-timing",
      label: "自然时机",
      summary: entry.latestSignal === null ? `有 ${entry.signalCount} 条公开近况线索；只作内部提醒。` : `最近公开线索为 ${analysisDate(entry.latestSignal)}；不能延伸未确认细节。`,
      evidence: entry.latestSignal === null
        ? { kind: "count", value: entry.signalCount, label: `${entry.signalCount} 条公开近况线索` }
        : { kind: "date", value: analysisDate(entry.latestSignal), label: `最近线索 ${analysisDate(entry.latestSignal)}` },
    });
    if (entry.latestExcerpt !== null && referenceMs >= entry.latestExcerpt && (referenceMs - entry.latestExcerpt) / DAY <= 30) reasons.push({
      category: "recent-feedback",
      label: "最近反馈",
      summary: `最近聊天记录于 ${analysisDate(entry.latestExcerpt)}；可由你决定是否接住近况。`,
      evidence: { kind: "date", value: analysisDate(entry.latestExcerpt), label: `最近聊天 ${analysisDate(entry.latestExcerpt)}` },
    });
    const latestActivity = Math.max(entry.latestExcerpt || 0, entry.latestSignal || 0) || null;
    const rank = (entry.relationshipCount * 60) + Math.min(entry.excerptCount, 50) + (entry.signalCount ? 25 : 0) + (reasons.some((reason) => reason.category === "recent-feedback") ? 35 : 0) + (reasons.some((reason) => reason.category === "fading-risk") ? 20 : 0) + (entry.pending ? 0 : 5);
    candidates.push({
      personId: entry.personId,
      displayName: entry.displayName,
      boundary: entry.pending ? "pending" : "confirmed",
      boundaryLabel: entry.pending ? "待确认候选" : "身份已确认候选",
      excerptCount: entry.excerptCount,
      signalCount: entry.signalCount,
      lastActivityDate: analysisDate(latestActivity),
      sourceBadges: dedupeSourceBadges(entry.sourceBadges),
      reasons,
      safeTopic: {
        boundary: entry.pending ? "internal-only" : "review-before-use",
        label: entry.signalCount > 0 ? "有公开近况线索；仅可简单问近况，不能延伸未确认细节。" : "没有可靠的具体话题；如决定联系，先简单问近况。",
      },
      _rank: rank,
      _latestActivity: latestActivity || 0,
    });
  }

  candidates.sort((left, right) => right._rank - left._rank || right._latestActivity - left._latestActivity || String(left.personId).localeCompare(String(right.personId)));
  const bounded = candidates.slice(0, 15).map(({ _rank, _latestActivity, ...candidate }) => candidate);
  const key = bounded.slice(0, 3);
  const light = bounded.slice(3, 15);
  return {
    aggregate: {
      activeSources: activeSources.size,
      eligiblePeople: candidates.length,
      excludedPeople,
      candidateCount: bounded.length,
      excerptCount,
      signalCount,
      keyCount: key.length,
      lightCount: light.length,
    },
    key,
    light,
  };
}

export function projectRelationshipLibrary(graph, options = {}) {
  const upgraded = upgradeRelationshipGraphV2(graph);
  const badgeProjection = createSourceBadgeProjection(upgraded);
  const people = upgraded.people;
  const sources = upgraded.sources;
  const excerpts = upgraded.excerpts;
  const signals = upgraded.signals;
  const mappings = upgraded.mappings;
  const relationships = upgraded.relationships;
  const actions = upgraded.actions;
  const purged = new Set(upgraded.purgedPersonIds);
  const activeSourceMap = new Map(sources.filter((source) => source?.id && !["removed", "deleted", "invalidated"].includes(source.state)).map((source) => [source.id, source]));
  const activeSources = new Set(activeSourceMap.keys());
  const entries = new Map();
  for (const person of people) {
    if (!person?.id || purged.has(person.id) || ["trashed", "purged"].includes(person.state) || ANALYSIS_NOISE_NAME.test(String(person.name || ""))) continue;
    entries.set(person.id, { person, pending: person.state === "pending" || person.sourceScoped === true, activeSourceLinked: false, excerptCount: 0, signalCount: 0, latestActivity: null, relationshipLabels: [], actions: [], sourceBadges: [], collectionLocations: [], mappingSources: [] });
  }
  for (const mapping of mappings) {
    const entry = entries.get(mapping?.personId);
    if (entry && activeSources.has(mapping.sourceId)) { const source = activeSourceMap.get(mapping.sourceId); entry.activeSourceLinked = true; entry.sourceBadges.push(...badgeProjection.sourceBadges(mapping, source)); entry.collectionLocations.push(...collectionLocationsForMapping(mapping, source, badgeProjection.sourceKind(source))); entry.mappingSources.push({ mapping, source }); if (mapping.status === "confirmed") entry.pending = false; }
  }
  for (const relationship of relationships) {
    const entry = entries.get(relationship?.personId);
    const relationshipSources = Array.isArray(relationship?.sourceIds) ? relationship.sourceIds : [];
    if (!entry || !CURRENT_RELATIONSHIP_STATUSES.has(relationship?.status) || (relationshipSources.length && !relationshipSources.some((sourceId) => activeSources.has(sourceId)))) continue;
    if (typeof relationship.label === "string" && relationship.label.trim()) entry.relationshipLabels.push(relationship.label.trim());
  }
  for (const excerpt of excerpts) {
    const entry = entries.get(excerpt?.personId);
    if (!entry || !activeSources.has(excerpt.sourceId)) continue;
    entry.activeSourceLinked = true;
    entry.excerptCount += 1;
    const at = analysisTime(excerpt.timestamp);
    if (at !== null && (entry.latestActivity === null || at > entry.latestActivity)) entry.latestActivity = at;
  }
  for (const signal of signals) {
    const entry = entries.get(signal?.personId);
    if (!entry || !activeSources.has(signal.sourceId) || signal.thirdParty || ["invalidated", "irrelevant", "sensitive", "deleted"].includes(signal.status)) continue;
    entry.activeSourceLinked = true;
    entry.signalCount += 1;
    const at = analysisTime(signal.publishedAt ?? signal.timestamp ?? signal.time);
    if (at !== null && (entry.latestActivity === null || at > entry.latestActivity)) entry.latestActivity = at;
  }
  for (const action of actions) {
    const entry = entries.get(action?.personId);
    if (entry && action?.kind === "manual-contact" && MANUAL_CONTACT_STATUSES.has(action.status) && action.userMarked === true) entry.actions.push(action);
  }
  const rows = [...entries.values()].filter((entry) => entry.activeSourceLinked).map((entry) => {
    const latestAction = entry.actions.sort((left, right) => String(left.recordedAt).localeCompare(String(right.recordedAt))).at(-1);
    return {
      personId: entry.person.id,
      displayName: safeDisplayNameForPerson(entry.mappingSources, entry.person),
      boundary: entry.pending ? "pending" : "confirmed",
      boundaryLabel: entry.pending ? "待确认身份" : "身份已确认",
      excerptCount: entry.excerptCount,
      signalCount: entry.signalCount,
      lastActivityDate: analysisDate(entry.latestActivity),
      relationshipLabels: [...new Set(entry.relationshipLabels)].sort(),
      sourceBadges: dedupeSourceBadges(entry.sourceBadges),
      collectionLocations: dedupeCollectionLocations(entry.collectionLocations),
      manualStatus: latestAction?.status || null,
    };
  }).sort((left, right) => left.displayName < right.displayName ? -1 : left.displayName > right.displayName ? 1 : 0);
  return { aggregate: { peopleCount: rows.length, activeSources: activeSources.size, generatedAt: options.now === undefined ? null : analysisDate(analysisTime(options.now)) }, rows };
}

export function minimizeGraph(graph) {
  const allowed = ["owner", "sources", "people", "excerpts", "mappings", "relationships", "dictionary", "signals", "topics", "notes", "actions", "trash", "purgedPersonIds", "identityDecisions", "settings"];
  const next = {};
  for (const field of allowed) if (field in graph) next[field] = clone(graph[field]);
  return ensureLists(next);
}

export async function generateVaultKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function encryptEnvelope(payload, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(payload)));
  return { version: 1, algorithm: "AES-256-GCM", iv, ciphertext: new Uint8Array(ciphertext) };
}

export async function decryptEnvelope(envelope, key) {
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(envelope.iv) }, key, bytes(envelope.ciphertext));
  return JSON.parse(decoder.decode(plaintext));
}

const semanticCacheBytes = (value) => {
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
};
const normalizeSemanticCacheRecord = (record) => {
  if (!exactFields(record, LOCAL_SEMANTIC_CACHE_RECORD_FIELDS) || record.recordVersion !== 1 || typeof record.boundActiveGenerationId !== "string" || !record.boundActiveGenerationId || !exactFields(record.envelope, LOCAL_SEMANTIC_CACHE_ENVELOPE_FIELDS) || record.envelope.version !== 1 || record.envelope.algorithm !== "AES-256-GCM") throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
  const iv = semanticCacheBytes(record.envelope.iv);
  const ciphertext = semanticCacheBytes(record.envelope.ciphertext);
  if (iv.byteLength !== 12 || ciphertext.byteLength < 17) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
  return {
    recordVersion: 1,
    boundActiveGenerationId: record.boundActiveGenerationId,
    envelope: { version: 1, algorithm: "AES-256-GCM", iv: new Uint8Array(iv), ciphertext: new Uint8Array(ciphertext) },
  };
};
const semanticCacheRecordFingerprint = (record) => {
  if (record === null || record === undefined) return "null";
  try {
    const normalized = normalizeSemanticCacheRecord(record);
    return stableObject({
      recordVersion: normalized.recordVersion,
      boundActiveGenerationId: normalized.boundActiveGenerationId,
      envelope: { version: normalized.envelope.version, algorithm: normalized.envelope.algorithm, iv: base64(normalized.envelope.iv), ciphertext: base64(normalized.envelope.ciphertext) },
    });
  } catch {
    try { return stableObject(record); } catch { return "invalid"; }
  }
};
const semanticCacheRecordsEqual = (left, right) => semanticCacheRecordFingerprint(left) === semanticCacheRecordFingerprint(right);
const encryptLocalSemanticCacheEnvelope = async (payload, key) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: encoder.encode(LOCAL_SEMANTIC_CACHE_AAD_TEXT) }, key, encoder.encode(stableObject(payload)));
  return { version: 1, algorithm: "AES-256-GCM", iv, ciphertext: new Uint8Array(ciphertext) };
};
const decryptLocalSemanticCacheEnvelope = async (envelope, key) => {
  const normalized = normalizeSemanticCacheRecord({ recordVersion: 1, boundActiveGenerationId: "validation", envelope }).envelope;
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: normalized.iv, additionalData: encoder.encode(LOCAL_SEMANTIC_CACHE_AAD_TEXT) }, key, normalized.ciphertext);
  return JSON.parse(decoder.decode(plaintext));
};

export function createMemoryVaultAdapter() {
  const state = { generations: [], activeGeneration: null, snapshots: [], semanticCache: null };
  let nextFailure = null;
  let nextCacheFailure = null;
  return {
    writeCount: 0,
    cacheWriteCount: 0,
    async transaction(mutator) {
      if (nextFailure) { const message = nextFailure; nextFailure = null; throw new Error(message); }
      const draft = clone(state);
      await mutator(draft);
      Object.assign(state, draft);
      this.writeCount += 1;
    },
    async businessTransaction(mutator) {
      if (nextFailure) { const message = nextFailure; nextFailure = null; throw new Error(message); }
      const draft = clone(state);
      await mutator(draft);
      draft.semanticCache = null;
      Object.assign(state, draft);
      this.writeCount += 1;
    },
    async readSemanticCache() { return { activeGeneration: state.activeGeneration, record: clone(state.semanticCache) }; },
    async compareAndSwapSemanticCache(expectedGenerationId, record, options = {}) {
      if (nextCacheFailure) { const message = nextCacheFailure; nextCacheFailure = null; throw new Error(message); }
      if (state.activeGeneration !== expectedGenerationId) throw semanticCacheError("ANALYSIS_CACHE_STALE");
      if (Object.prototype.hasOwnProperty.call(options, "expectedRecord") && !semanticCacheRecordsEqual(state.semanticCache, options.expectedRecord)) throw semanticCacheError("ANALYSIS_CACHE_STALE");
      const normalized = normalizeSemanticCacheRecord(record);
      if (normalized.boundActiveGenerationId !== expectedGenerationId) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
      if (semanticCacheRecordsEqual(state.semanticCache, normalized)) return { changed: false, cacheWriteCount: 0 };
      state.semanticCache = normalized;
      this.cacheWriteCount += 1;
      return { changed: true, cacheWriteCount: 1 };
    },
    failNextCommit(message) { nextFailure = message; },
    failNextCacheCommit(message) { nextCacheFailure = message; },
    dump() { return clone(state); },
    async readState() { return clone(state); },
  };
}

const requestResult = (request) => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error("indexeddb-request-failed"));
});
const transactionDone = (transaction) => new Promise((resolve, reject) => {
  transaction.oncomplete = () => resolve();
  transaction.onerror = () => reject(transaction.error || new Error("indexeddb-transaction-failed"));
  transaction.onabort = () => reject(transaction.error || new Error("indexeddb-transaction-aborted"));
});

export async function createIndexedDbVaultAdapter(indexedDBFactory = globalThis.indexedDB) {
  if (!indexedDBFactory) throw new Error("indexeddb-unavailable");
  const open = indexedDBFactory.open("relationship-today-v1", 1);
  open.onupgradeneeded = () => {
    const db = open.result;
    if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
    if (!db.objectStoreNames.contains("generations")) db.createObjectStore("generations", { keyPath: "id" });
    if (!db.objectStoreNames.contains("snapshots")) db.createObjectStore("snapshots", { keyPath: "id" });
    if (!db.objectStoreNames.contains("keys")) db.createObjectStore("keys");
  };
  const db = await requestResult(open);
  const readState = async () => {
    const tx = db.transaction(["meta", "generations", "snapshots", "keys"], "readonly");
    const [activeGeneration, generations, snapshots, vaultKey, semanticCache] = await Promise.all([
      requestResult(tx.objectStore("meta").get("activeGeneration")),
      requestResult(tx.objectStore("generations").getAll()),
      requestResult(tx.objectStore("snapshots").getAll()),
      requestResult(tx.objectStore("keys").get("vault")),
      requestResult(tx.objectStore("meta").get("semanticCache")),
    ]);
    await transactionDone(tx);
    return { activeGeneration: activeGeneration || null, generations, snapshots, vaultKey: vaultKey || null, semanticCache: semanticCache || null };
  };
  const runStateTransaction = async (mutator, pruneSemanticCache) => {
    const tx = db.transaction(["meta", "generations", "snapshots", "keys"], "readwrite");
    const done = transactionDone(tx);
    try {
      const meta = tx.objectStore("meta"), generationsStore = tx.objectStore("generations"), snapshotsStore = tx.objectStore("snapshots"), keysStore = tx.objectStore("keys");
      const [activeGeneration, generations, snapshots, vaultKey, semanticCache] = await Promise.all([
        requestResult(meta.get("activeGeneration")),
        requestResult(generationsStore.getAll()),
        requestResult(snapshotsStore.getAll()),
        requestResult(keysStore.get("vault")),
        requestResult(meta.get("semanticCache")),
      ]);
      const draft = { activeGeneration: activeGeneration || null, generations, snapshots, vaultKey: vaultKey || null, semanticCache: semanticCache || null };
      const mutation = mutator(draft);
      if (mutation && typeof mutation.then === "function") throw new Error("indexeddb-mutator-must-be-synchronous");
      generationsStore.clear();
      snapshotsStore.clear();
      for (const item of draft.generations) generationsStore.put(item);
      for (const item of draft.snapshots) snapshotsStore.put(item);
      meta.put(draft.activeGeneration, "activeGeneration");
      if (draft.vaultKey) keysStore.put(draft.vaultKey, "vault");
      if (pruneSemanticCache) meta.delete("semanticCache");
      else if (!semanticCacheRecordsEqual(draft.semanticCache, semanticCache || null)) {
        if (draft.semanticCache === null || draft.semanticCache === undefined) meta.delete("semanticCache");
        else meta.put(draft.semanticCache, "semanticCache");
      }
      await done;
    } catch (error) {
      try { tx.abort(); } catch {}
      try { await done; } catch {}
      throw error;
    }
  };
  return {
    async readState() { return readState(); },
    async transaction(mutator) { return runStateTransaction(mutator, false); },
    async businessTransaction(mutator) { return runStateTransaction(mutator, true); },
    async readSemanticCache() {
      const tx = db.transaction("meta", "readonly");
      const [activeGeneration, record] = await Promise.all([requestResult(tx.objectStore("meta").get("activeGeneration")), requestResult(tx.objectStore("meta").get("semanticCache"))]);
      await transactionDone(tx);
      return { activeGeneration: activeGeneration || null, record: record || null };
    },
    async compareAndSwapSemanticCache(expectedGenerationId, record, options = {}) {
      const normalized = normalizeSemanticCacheRecord(record);
      if (normalized.boundActiveGenerationId !== expectedGenerationId) throw semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID");
      const tx = db.transaction("meta", "readwrite");
      const done = transactionDone(tx);
      try {
        const store = tx.objectStore("meta");
        const [activeGeneration, current] = await Promise.all([requestResult(store.get("activeGeneration")), requestResult(store.get("semanticCache"))]);
        if (activeGeneration !== expectedGenerationId || (Object.prototype.hasOwnProperty.call(options, "expectedRecord") && !semanticCacheRecordsEqual(current || null, options.expectedRecord))) {
          tx.abort();
          try { await done; } catch {}
          throw semanticCacheError("ANALYSIS_CACHE_STALE");
        }
        if (semanticCacheRecordsEqual(current || null, normalized)) {
          await done;
          return { changed: false, cacheWriteCount: 0 };
        }
        store.put(normalized, "semanticCache");
        await done;
        return { changed: true, cacheWriteCount: 1 };
      } catch (error) {
        try { tx.abort(); } catch {}
        try { await done; } catch {}
        throw error;
      }
    },
    async getOrCreateKey() {
      const readTx = db.transaction("keys", "readonly");
      const existing = await requestResult(readTx.objectStore("keys").get("vault"));
      await transactionDone(readTx);
      if (existing) return existing;
      const candidate = await generateVaultKey();
      const writeTx = db.transaction("keys", "readwrite");
      const done = transactionDone(writeTx);
      try {
        const store = writeTx.objectStore("keys");
        const durable = await requestResult(store.get("vault"));
        if (durable) {
          await done;
          return durable;
        }
        await requestResult(store.put(candidate, "vault"));
        await done;
        return candidate;
      } catch (error) {
        try { writeTx.abort(); } catch {}
        try { await done; } catch {}
        throw error;
      }
    },
    close() { db.close(); },
  };
}

export async function commitGraph(adapter, graph, key, { now = new Date().toISOString(), preserveSemanticCache = false, expectedActiveGenerationId } = {}) {
  if (typeof preserveSemanticCache !== "boolean" || (expectedActiveGenerationId !== undefined && (typeof expectedActiveGenerationId !== "string" || !expectedActiveGenerationId))) throw typedError("BUSINESS_COMMIT_INVALID");
  const envelope = await encryptEnvelope(upgradeRelationshipGraphV2(minimizeGraph(graph)), key);
  const generation = { id: `generation-${now}-${crypto.getRandomValues(new Uint32Array(1))[0]}`, createdAt: now, envelope };
  const transaction = preserveSemanticCache ? adapter.transaction : (adapter.businessTransaction || adapter.transaction);
  if (typeof transaction !== "function") throw typedError("BUSINESS_COMMIT_INVALID");
  await transaction.call(adapter, (draft) => {
    if (expectedActiveGenerationId !== undefined && draft.activeGeneration !== expectedActiveGenerationId) throw typedError("BUSINESS_GENERATION_STALE");
    const preservedCache = preserveSemanticCache && draft.semanticCache ? normalizeSemanticCacheRecord(draft.semanticCache) : null;
    draft.generations.push(generation);
    draft.activeGeneration = generation.id;
    draft.semanticCache = preserveSemanticCache && preservedCache
      ? { ...preservedCache, boundActiveGenerationId: generation.id }
      : null;
  });
  return generation.id;
}

export async function commitPurgedGraph(adapter, graph, _retiredKey, { now = new Date().toISOString() } = {}) {
  const key = await generateVaultKey();
  const envelope = await encryptEnvelope(upgradeRelationshipGraphV2(minimizeGraph(graph)), key);
  const generation = { id: `generation-purge-${now}-${crypto.getRandomValues(new Uint32Array(1))[0]}`, createdAt: now, envelope };
  await (adapter.businessTransaction || adapter.transaction).call(adapter, (draft) => {
    draft.generations = [generation];
    draft.snapshots = [];
    draft.activeGeneration = generation.id;
    draft.vaultKey = key;
    draft.semanticCache = null;
  });
  return { generationId: generation.id, key };
}

export async function commitSourceRemovedGraph(adapter, graph, _retiredKey, { now = new Date().toISOString() } = {}) {
  const key = await generateVaultKey();
  const envelope = await encryptEnvelope(upgradeRelationshipGraphV2(minimizeGraph(graph)), key);
  const generation = { id: `generation-source-remove-${now}-${crypto.getRandomValues(new Uint32Array(1))[0]}`, createdAt: now, envelope };
  await (adapter.businessTransaction || adapter.transaction).call(adapter, (draft) => {
    draft.generations = [generation];
    draft.snapshots = [];
    draft.activeGeneration = generation.id;
    draft.vaultKey = key;
    draft.semanticCache = null;
  });
  return { generationId: generation.id, key };
}

export async function loadActiveGraph(adapter, key, { now = new Date().toISOString() } = {}) {
  const state = adapter.readState ? await adapter.readState() : adapter.dump();
  const generation = state.generations.find((item) => item.id === state.activeGeneration);
  if (!generation) return null;
  const stored = await decryptEnvelope(generation.envelope, key);
  const upgraded = upgradeRelationshipGraphV2(stored);
  if (stored?.settings?.schema === 2) return upgraded;
  try {
    const envelope = await encryptEnvelope(upgraded, key);
    const migrated = { id: `generation-relationship-v2-${now}-${crypto.getRandomValues(new Uint32Array(1))[0]}`, createdAt: now, envelope };
    await (adapter.businessTransaction || adapter.transaction).call(adapter, (draft) => {
      if (draft.activeGeneration !== generation.id) throw typedError("RELATIONSHIP_MIGRATION_FAILED");
      draft.generations.push(migrated);
      draft.activeGeneration = migrated.id;
      draft.semanticCache = null;
    });
  } catch (error) {
    if (error?.code === "RELATIONSHIP_MIGRATION_FAILED") throw error;
    throw typedError("RELATIONSHIP_MIGRATION_FAILED");
  }
  return upgraded;
}

const semanticCacheMiss = (reason) => ({ status: "miss", reason, baseResults: null, payload: null });

export async function loadActiveGraphWithSemanticCache(adapter, key, { now = new Date().toISOString() } = {}) {
  const state = adapter.readState ? await adapter.readState() : adapter.dump();
  const generation = state.generations.find((item) => item.id === state.activeGeneration);
  if (!generation) return { graph: null, activeGenerationId: null, semanticCache: semanticCacheMiss("cache-miss-full") };
  const stored = await decryptEnvelope(generation.envelope, key);
  const graph = upgradeRelationshipGraphV2(stored);
  if (stored?.settings?.schema !== 2) {
    const envelope = await encryptEnvelope(graph, key);
    const migrated = { id: `generation-relationship-v2-${now}-${crypto.getRandomValues(new Uint32Array(1))[0]}`, createdAt: now, envelope };
    try {
      await (adapter.businessTransaction || adapter.transaction).call(adapter, (draft) => {
        if (draft.activeGeneration !== generation.id) throw typedError("RELATIONSHIP_MIGRATION_FAILED");
        draft.generations.push(migrated);
        draft.activeGeneration = migrated.id;
        draft.semanticCache = null;
      });
    } catch (error) {
      if (error?.code === "RELATIONSHIP_MIGRATION_FAILED") throw error;
      throw typedError("RELATIONSHIP_MIGRATION_FAILED");
    }
    return { graph, activeGenerationId: migrated.id, semanticCache: semanticCacheMiss("cache-miss-full") };
  }
  if (!state.semanticCache) return { graph, activeGenerationId: generation.id, semanticCache: semanticCacheMiss("cache-miss-full") };
  let record;
  try { record = normalizeSemanticCacheRecord(state.semanticCache); }
  catch { return { graph, activeGenerationId: generation.id, semanticCache: semanticCacheMiss("cache-invalid-full") }; }
  if (record.boundActiveGenerationId !== generation.id) return { graph, activeGenerationId: generation.id, semanticCache: semanticCacheMiss("cache-invalid-full") };
  try {
    const decrypted = await decryptLocalSemanticCacheEnvelope(record.envelope, key);
    if (decrypted?.algorithmVersion !== LOCAL_SEMANTIC_VERSION) return { graph, activeGenerationId: generation.id, semanticCache: semanticCacheMiss("algorithm-upgrade-full") };
    const payload = validateLocalSemanticCachePayload(decrypted, graph);
    const baseResults = hydrateLocalSemanticCache(graph, payload);
    return { graph, activeGenerationId: generation.id, semanticCache: { status: "hit", reason: "vault-cache-hit", baseResults, payload: deepFreeze(clone(payload)) } };
  } catch (error) {
    const reason = error?.code === "ANALYSIS_CACHE_ALGORITHM_MISMATCH" ? "algorithm-upgrade-full" : "cache-invalid-full";
    return { graph, activeGenerationId: generation.id, semanticCache: semanticCacheMiss(reason) };
  }
}

export async function commitLocalSemanticCache(adapter, key, { expectedActiveGenerationId, payload } = {}) {
  if (typeof expectedActiveGenerationId !== "string" || !expectedActiveGenerationId || !adapter?.readSemanticCache || !adapter?.compareAndSwapSemanticCache) throw semanticCacheError("ANALYSIS_CACHE_WRITE_FAILED");
  let normalized;
  try { normalized = normalizeLocalSemanticCachePayload(payload, null, false); }
  catch (error) { throw error?.code ? error : semanticCacheError("ANALYSIS_CACHE_SCHEMA_INVALID"); }
  try {
    const current = await adapter.readSemanticCache();
    if (current.activeGeneration !== expectedActiveGenerationId) throw semanticCacheError("ANALYSIS_CACHE_STALE");
    let record = null;
    if (current.record) {
      try {
        const existingRecord = normalizeSemanticCacheRecord(current.record);
        if (existingRecord.boundActiveGenerationId === expectedActiveGenerationId) {
          const existingPayload = normalizeLocalSemanticCachePayload(await decryptLocalSemanticCacheEnvelope(existingRecord.envelope, key), null, false);
          if (stableObject(existingPayload) === stableObject(normalized)) record = existingRecord;
        }
      } catch {}
    }
    if (!record) {
      record = {
        recordVersion: 1,
        boundActiveGenerationId: expectedActiveGenerationId,
        envelope: await encryptLocalSemanticCacheEnvelope(normalized, key),
      };
    }
    const result = await adapter.compareAndSwapSemanticCache(expectedActiveGenerationId, record, { expectedRecord: current.record || null });
    return { ok: true, changed: result.changed === true, cacheWriteCount: result.cacheWriteCount === 1 ? 1 : 0, boundActiveGenerationId: expectedActiveGenerationId };
  } catch (error) {
    if (error?.code === "ANALYSIS_CACHE_STALE") throw error;
    throw semanticCacheError("ANALYSIS_CACHE_WRITE_FAILED");
  }
}

const pruneDanglingAccountAttributionOverrides = (graph) => {
  const trusted = trustedSuiyinPersonaRegistry(graph);
  const pruneMapping = (mapping) => {
    const alias = mapping.accountAttributionOverride?.kind === "suiyin-persona" ? mapping.accountAttributionOverride.sourceAccountAlias : null;
    if (alias && (!trusted.aliases.has(alias) || trusted.conflicts.has(alias))) delete mapping.accountAttributionOverride;
  };
  for (const mapping of graph.mappings || []) pruneMapping(mapping);
  for (const decision of graph.identityDecisions || []) {
    if (decision?.status !== "merged" || !decision.lineage) continue;
    for (const field of ["mappingsBefore", "mappingsAfter"]) for (const mapping of decision.lineage[field] || []) pruneMapping(mapping);
  }
  return graph;
};

export function removeSource(graph, sourceId) {
  const next = upgradeRelationshipGraphV2(graph);
  const initialSource = next.sources.find((item) => item.id === sourceId);
  if (!initialSource || initialSource.state === "removed") return next;
  const sourceMappingIds = new Set(next.mappings.filter((mapping) => mapping.sourceId === sourceId).map((mapping) => mapping.id));
  next.identityDecisions = next.identityDecisions.filter((decision) => !decision.mappingIds.some((id) => sourceMappingIds.has(id)));
  const source = next.sources.find((item) => item.id === sourceId);
  if (!source) throw typedError("IDENTITY_DECISION_WRITE_FAILED");
  source.state = "removed";
  source.sourceAccountLabels = {};
  if (source.sourceKind === "suiyin-mcp" || Object.prototype.hasOwnProperty.call(source, "sourceAccountWechatSourceLinks")) source.sourceAccountWechatSourceLinks = {};
  for (const candidate of next.sources) {
    if (candidate.sourceKind !== "suiyin-mcp") continue;
    const registry = normalizeSuiyinAccountLabels(candidate.sourceAccountLabels);
    const links = normalizeSuiyinWechatSourceLinks(candidate.sourceAccountWechatSourceLinks, registry);
    if (!Object.prototype.hasOwnProperty.call(links, sourceId)) continue;
    delete links[sourceId];
    candidate.sourceAccountWechatSourceLinks = links;
  }
  next.excerpts = next.excerpts.filter((item) => item.sourceId !== sourceId);
  next.mappings = next.mappings.filter((item) => item.sourceId !== sourceId);
  next.signals = next.signals.filter((item) => item.sourceId !== sourceId);
  next.topics = next.topics.filter((item) => item.sourceId !== sourceId);
  next.notes = next.notes.map((item) => item.sourceId === sourceId ? { ...item, sourceId: undefined, sourceState: "removed", sourceExcerpt: undefined, sourceText: undefined } : item);
  next.actions = next.actions.map((item) => item.sourceId === sourceId ? { ...item, sourceId: undefined, sourceState: "removed", sourceExcerpt: undefined, sourceText: undefined } : item);
  next.relationships = next.relationships.map((item) => {
    if (!item.sourceIds?.includes(sourceId)) return item;
    const sourceIds = item.sourceIds.filter((id) => id !== sourceId);
    return { ...item, sourceIds, ...(item.source === "legacy-unknown" && sourceIds.length === 0 ? { status: "review-required" } : {}) };
  });
  return validateRelationshipGraphV2(pruneDanglingAccountAttributionOverrides(next));
}

export function trashPerson(graph, personId, at = new Date().toISOString()) {
  const next = upgradeRelationshipGraphV2(graph);
  const person = next.people.find((item) => item.id === personId);
  if (!person || person.state === "trashed") return next;
  const purgeAt = new Date(new Date(at).getTime() + 30 * DAY).toISOString();
  Object.assign(person, { state: "trashed", trashedAt: at, purgeAt });
  next.trash = next.trash.filter((item) => item.personId !== personId).concat({ personId, purgeAt });
  return next;
}

export function restorePerson(graph, personId) {
  const next = upgradeRelationshipGraphV2(graph);
  const person = next.people.find((item) => item.id === personId);
  if (person?.state === "trashed") { person.state = "active"; delete person.trashedAt; delete person.purgeAt; }
  next.trash = next.trash.filter((item) => item.personId !== personId);
  return next;
}

export function purgePerson(graph, personId) {
  const next = upgradeRelationshipGraphV2(graph);
  next.identityDecisions = next.identityDecisions.filter((decision) => decision.canonicalPersonId !== personId && decision.secondaryPersonId !== personId && !decision.mappingIds.some((mappingId) => next.mappings.some((mapping) => mapping.id === mappingId && mapping.personId === personId)));
  const removedMappingIds = new Set(next.mappings.filter((mapping) => mapping.personId === personId).map((mapping) => mapping.id));
  next.identityDecisions = next.identityDecisions.filter((decision) => !decision.mappingIds.some((id) => removedMappingIds.has(id)) && decision.canonicalPersonId !== personId && decision.secondaryPersonId !== personId);
  next.people = next.people.filter((item) => item.id !== personId);
  for (const field of ["excerpts", "mappings", "relationships", "signals", "topics", "notes", "actions"]) next[field] = next[field].filter((item) => item.personId !== personId);
  next.trash = next.trash.filter((item) => item.personId !== personId);
  if (!next.purgedPersonIds.includes(personId)) next.purgedPersonIds.push(personId);
  return next;
}

async function backupKey(passphrase, salt, iterations = BACKUP_ITERATIONS) {
  const material = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function createBackup(graph, passphrase, { now = new Date().toISOString() } = {}) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await backupKey(passphrase, salt);
  const payload = { version: 2, createdAt: now, mode: "complete-replace", graph: upgradeRelationshipGraphV2(minimizeGraph(graph)) };
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(payload)));
  return { format: "relationship-today-backup", version: 2, kdf: { name: "PBKDF2", hash: "SHA-256", iterations: BACKUP_ITERATIONS, salt: base64(salt) }, cipher: "AES-256-GCM", iv: base64(iv), ciphertext: base64(ciphertext) };
}

export async function writeVerifiedBackup(graph, passphrase, sink, options = {}) {
  let artifact;
  try {
    artifact = await createBackup(graph, passphrase, options);
    const serialized = JSON.stringify(artifact);
    await sink.write(serialized);
    await sink.close();
    if (typeof sink.readText !== "function") throw new Error("backup-verification-unavailable");
    const persisted = await sink.readText();
    if (persisted !== serialized) throw new Error("backup-verification-failed");
    await readBackupPreview(JSON.parse(persisted), passphrase);
    return artifact;
  } catch (error) {
    artifact = null;
    try { await sink.abort?.(); } catch {}
    try { await sink.cleanup?.(); } catch {}
    throw error;
  }
}

const GRAPH_LIST_FIELDS = ["sources", "people", "excerpts", "mappings", "relationships", "dictionary", "signals", "topics", "notes", "actions", "trash", "purgedPersonIds", "identityDecisions"];
const GRAPH_ALLOWED_FIELDS = new Set(["owner", ...GRAPH_LIST_FIELDS, "settings"]);
const BACKUP_V1_ITEM_FIELDS = {
  sources: new Set(["id", "state", "displayName", "sourceBundleRevision", "sourceKind", "environment", "importedAt", "conversationCount", "personaDeclaredCount", "personaReadCount", "allocationCount", "allocationDeclaredCount", "allocationMissingCount", "customerCount", "friendCount", "groupCount", "messageCount", "unreadableCount", "failureCount", "missingDisplayNameCount", "perPersona", "scopeKind", "scopeComplete", "completeScopeUnavailableReason", "momentCount", "excludedCount", "senderlessGroupExcludedCount", "momentParseFailureExcludedCount", "momentsUnsupported", "attachmentsUnsupported", "fullTextAvailable", "unavailableReason"]),
  people: new Set(["id", "name", "state", "sourceScoped", "trashedAt", "purgeAt"]),
  excerpts: new Set(["id", "sourceId", "personId", "kind", "text", "timestamp", "time", "direction", "messageType"]),
  mappings: new Set(["id", "sourceId", "personId", "status"]),
  relationships: new Set(["id", "identityMappingId", "personId", "sourceIds", "status", "label", "recommendationEligible", "draftEligible"]),
  dictionary: new Set(["id", "label", "status"]),
  signals: new Set(["id", "sourceId", "personId", "status", "text", "thirdParty", "mediaDescription", "publishedAt", "timestamp", "time", "kind", "contextId", "contextLabel", "direction", "messageType"]),
  topics: new Set(["id", "sourceId", "personId", "signalId", "text"]),
  notes: new Set(["id", "personId", "sourceId", "text", "authoredByUser", "sourceState", "sourceExcerpt", "sourceText"]),
  actions: new Set(["id", "personId", "sourceId", "text", "userMarked", "sourceState", "sourceExcerpt", "sourceText", "kind", "status", "recordedAt"]),
  trash: new Set(["personId", "purgeAt"]),
  identityDecisions: new Set(["id", "pairKey", "decisionId", "status", "identityKeys", "mappingIds", "createdAt", "updatedAt", "canonicalPersonId", "secondaryPersonId", "lineage"]),
};
const BACKUP_ITEM_FIELDS = {
  ...BACKUP_V1_ITEM_FIELDS,
  sources: new Set([...BACKUP_V1_ITEM_FIELDS.sources, "sourceAccountLabels", "sourceAccountWechatSourceLinks", "adapterReceipt", "coverageReceipt", ...IMPORT_COMMITTED_RECEIPT_FIELDS]),
  mappings: new Set([...BACKUP_V1_ITEM_FIELDS.mappings, "sourcePersonId", "sourceDisplayName", "sourceAccountAliases", "accountAttributionOverride"]),
  excerpts: new Set([...BACKUP_V1_ITEM_FIELDS.excerpts, "conversationKind", "conversationId", "thirdParty"]),
  signals: new Set([...BACKUP_V1_ITEM_FIELDS.signals, "sourceAccountAlias"]),
  relationships: new Set([...BACKUP_V1_ITEM_FIELDS.relationships, "relationshipId", "source", "createdAt", "updatedAt", "decisionId", "dictionaryId", "evidence", "confirmation", "algorithmVersion", "eligibleMessageCount", "startDate", "endDate"]),
  dictionary: new Set([...BACKUP_V1_ITEM_FIELDS.dictionary, "normalizedLabel", "scope", "source", "createdAt", "updatedAt"]),
};
const validateBackupGraph = (graph) => {
  if (graph && !Array.isArray(graph) && typeof graph === "object" && !Object.prototype.hasOwnProperty.call(graph, "identityDecisions")) graph = { ...graph, identityDecisions: [] };
  if (!graph || Array.isArray(graph) || typeof graph !== "object" || !requiredString(graph.owner) || Object.keys(graph).some((key) => !GRAPH_ALLOWED_FIELDS.has(key))) throw new Error("invalid-backup-graph");
  for (const field of GRAPH_LIST_FIELDS) if (!Array.isArray(graph[field])) throw new Error("invalid-backup-graph");
  const schema = graph.settings?.schema;
  if (![1, 2].includes(schema) || Object.keys(graph.settings).some((key) => key !== "schema")) throw new Error("invalid-backup-graph");
  const allowedItemFields = schema === 1 ? BACKUP_V1_ITEM_FIELDS : BACKUP_ITEM_FIELDS;
  for (const field of GRAPH_LIST_FIELDS.filter((name) => name !== "purgedPersonIds")) {
    if (graph[field].some((item) => !item || Array.isArray(item) || typeof item !== "object" || ("id" in item && !requiredString(item.id)))) throw new Error("invalid-backup-graph");
    if (graph[field].some((item) => Object.keys(item).some((key) => !allowedItemFields[field].has(key)))) throw new Error("invalid-backup-graph");
  }
  for (const source of graph.sources) {
    const hasT028Receipt = source.scopeKind !== undefined || source.perPersona !== undefined || source.personaDeclaredCount !== undefined || source.completeScopeUnavailableReason !== undefined;
    if (hasT028Receipt) {
      if (source.sourceKind !== "suiyin-mcp") throw new Error("invalid-backup-graph");
      try { validateSuiyinScopeReceipt(source, "invalid-backup-graph"); } catch { throw new Error("invalid-backup-graph"); }
    }
  }
  if (graph.purgedPersonIds.some((id) => !requiredString(id)) || new Set(graph.purgedPersonIds).size !== graph.purgedPersonIds.length) throw new Error("invalid-backup-graph");
  if (new Set(graph.people.map((item) => item.id)).size !== graph.people.length || graph.people.some((item) => !requiredString(item.id) || !requiredString(item.name) || !["active", "pending", "trashed"].includes(item.state))) throw new Error("invalid-backup-graph");
  for (const field of GRAPH_LIST_FIELDS.filter((name) => !["purgedPersonIds", "trash"].includes(name))) if (new Set(graph[field].map((item) => item.id)).size !== graph[field].length) throw new Error("invalid-backup-graph");
  if (graph.actions.some((item) => item.kind === "manual-contact" && (!MANUAL_CONTACT_STATUSES.has(item.status) || !requiredString(item.recordedAt) || !Number.isFinite(Date.parse(item.recordedAt)) || item.userMarked !== true || !requiredString(item.personId) || (item.status === "sent-manually" && !requiredString(item.text)) || "sourceId" in item))) throw new Error("invalid-backup-graph");
  const people = new Set(graph.people.map((item) => item.id));
  if (graph.purgedPersonIds.some((id) => people.has(id))) throw new Error("invalid-backup-graph");
  const sources = new Set(graph.sources.map((item) => item.id));
  for (const field of ["excerpts", "mappings", "relationships", "signals", "topics", "notes", "actions"]) if (graph[field].some((item) => item.personId && !people.has(item.personId))) throw new Error("invalid-backup-graph");
  for (const field of ["excerpts", "mappings", "signals", "topics"]) if (graph[field].some((item) => item.sourceId && !sources.has(item.sourceId))) throw new Error("invalid-backup-graph");
  if (graph.trash.some((item) => !requiredString(item.personId) || !requiredString(item.purgeAt) || !people.has(item.personId))) throw new Error("invalid-backup-graph");
  try { return upgradeRelationshipGraphV2(graph); } catch { throw new Error("invalid-backup-graph"); }
};

async function decodeBackup(backup, passphrase) {
  if (backup?.format !== "relationship-today-backup" || ![1, 2].includes(backup.version)) throw new Error("unsupported-version");
  if (backup.kdf?.name !== "PBKDF2" || backup.kdf?.hash !== "SHA-256" || !Number.isInteger(backup.kdf?.iterations) || backup.kdf.iterations < BACKUP_ITERATIONS || backup.cipher !== "AES-256-GCM") throw new Error("unsafe-backup-parameters");
  const validBase64 = (value) => typeof value === "string" && value.length > 0 && value.length % 4 === 0 && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value);
  if (!validBase64(backup.kdf.salt) || !validBase64(backup.iv) || !validBase64(backup.ciphertext)) throw new Error("unsafe-backup-parameters");
  let salt, iv, ciphertext;
  try { salt = unbase64(backup.kdf.salt); iv = unbase64(backup.iv); ciphertext = unbase64(backup.ciphertext); } catch { throw new Error("unsafe-backup-parameters"); }
  if (salt.byteLength < 16 || iv.byteLength !== 12 || ciphertext.byteLength < 17) throw new Error("unsafe-backup-parameters");
  try {
    const key = await backupKey(passphrase, salt, backup.kdf.iterations);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    const payload = JSON.parse(decoder.decode(plaintext));
    if (payload.version !== backup.version || ![1, 2].includes(payload.version) || payload.mode !== "complete-replace") throw new Error("unsupported-version");
    if ((payload.version === 1 && payload.graph?.settings?.schema !== 1) || (payload.version === 2 && payload.graph?.settings?.schema !== 2)) throw new Error("invalid-backup-graph");
    payload.graph = validateBackupGraph(payload.graph);
    return payload;
  } catch (error) {
    if (["unsupported-version", "invalid-backup-graph"].includes(error.message)) throw error;
    throw new Error("wrong-passphrase-or-corrupt");
  }
}

const resurrectionIds = (incoming, current) => incoming.people.map((person) => person.id).filter((id) => current?.purgedPersonIds?.includes(id));

export async function readBackupPreview(backup, passphrase, { currentGraph = null } = {}) {
  const payload = await decodeBackup(backup, passphrase);
  const previouslyPurgedPersonIds = resurrectionIds(payload.graph, currentGraph);
  return { version: payload.version, createdAt: payload.createdAt, mode: payload.mode, people: payload.graph.people.length, sources: payload.graph.sources.length, purgedPersonIds: clone(payload.graph.purgedPersonIds), previouslyPurgedPersonIds, requiresResurrectionConfirmation: previouslyPurgedPersonIds.length > 0 };
}

export async function restoreBackup(adapter, vaultKey, backup, passphrase, { now = new Date().toISOString(), confirmResurrection = false } = {}) {
  const payload = await decodeBackup(backup, passphrase);
  const current = await loadActiveGraph(adapter, vaultKey);
  const previouslyPurgedPersonIds = resurrectionIds(payload.graph, current);
  if (previouslyPurgedPersonIds.length && !confirmResurrection) throw typedError("previously-purged", { personIds: previouslyPurgedPersonIds, reviewRequired: true });
  const snapshotEnvelope = await encryptEnvelope(current, vaultKey);
  const nextEnvelope = await encryptEnvelope(payload.graph, vaultKey);
  const state = adapter.readState ? await adapter.readState() : adapter.dump();
  const rollbackGenerationId = state.activeGeneration;
  const nonce = crypto.getRandomValues(new Uint32Array(1))[0];
  const snapshot = { id: `snapshot-${now}-${nonce}`, createdAt: now, expiresAt: new Date(new Date(now).getTime() + 7 * DAY).toISOString(), rollbackGenerationId, envelope: snapshotEnvelope };
  const generation = { id: `generation-restore-${now}-${nonce}`, createdAt: now, envelope: nextEnvelope };
  await (adapter.businessTransaction || adapter.transaction).call(adapter, (draft) => {
    const staleRollbackIds = new Set(draft.snapshots.map((item) => item.rollbackGenerationId).filter((id) => id && id !== draft.activeGeneration));
    draft.generations = draft.generations.filter((item) => !staleRollbackIds.has(item.id));
    draft.snapshots = [snapshot];
    draft.generations.push(generation);
    draft.activeGeneration = generation.id;
    draft.semanticCache = null;
  });
  return { ok: true, snapshot };
}

export async function deleteSafetySnapshot(adapter, snapshotId) {
  await adapter.transaction((draft) => {
    const removed = draft.snapshots.filter((item) => item.id === snapshotId);
    const rollbackIds = new Set(removed.map((item) => item.rollbackGenerationId).filter((id) => id && id !== draft.activeGeneration));
    draft.snapshots = draft.snapshots.filter((item) => item.id !== snapshotId);
    const stillReferenced = new Set(draft.snapshots.map((item) => item.rollbackGenerationId).filter(Boolean));
    draft.generations = draft.generations.filter((item) => !rollbackIds.has(item.id) || stillReferenced.has(item.id) || item.id === draft.activeGeneration);
  });
}

export async function cleanupExpiredSnapshots(adapter, { now = new Date().toISOString() } = {}) {
  const state = adapter.readState ? await adapter.readState() : adapter.dump();
  const latest = [...state.snapshots].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
  if (!latest) return null;
  if (new Date(latest.expiresAt).getTime() > new Date(now).getTime()) return latest;
  await adapter.transaction((draft) => {
    const rollbackIds = new Set(draft.snapshots.map((item) => item.rollbackGenerationId).filter((id) => id && id !== draft.activeGeneration));
    draft.snapshots = [];
    draft.generations = draft.generations.filter((item) => !rollbackIds.has(item.id) || item.id === draft.activeGeneration);
  });
  return null;
}

export function markSourceUnavailable(graph, sourceId, reason) {
  const next = ensureLists(graph);
  const source = next.sources.find((item) => item.id === sourceId);
  if (source) Object.assign(source, { fullTextAvailable: false, unavailableReason: reason });
  return next;
}

const transitions = {
  "no-source:SELECT": "preflighting",
  "preflighting:PREFLIGHT_OK": "preview-ready",
  "preview-ready:CONFIRM_IMPORT": "importing",
  "importing:IMPORT_OK": "source-active",
  "source-active:REIMPORT": "diff-preview",
  "source-active:SOURCE_MISSING": "source-missing",
  "local-library:BACKUP": "backup-writing",
  "local-library:RESTORE": "restore-preview",
};
export function transitionLocalState(state, event, detail = {}) {
  if (["FAIL", "CANCEL", "CLOSE"].includes(event)) return { name: state.previousStable || "no-source", previousStable: state.previousStable || "no-source", ...(event === "FAIL" ? { error: detail } : {}) };
  const name = transitions[`${state.name}:${event}`] || state.name;
  const stable = ["no-source", "preview-ready", "source-active", "source-missing", "local-library"].includes(name) ? name : state.previousStable;
  return { name, previousStable: stable || "no-source" };
}
