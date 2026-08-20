import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

globalThis.crypto ??= webcrypto;

const productionUrl = pathToFileURL(path.resolve("prototype/local-vault.js")).href;
const vault = await import(productionUrl);

const {
  BACKUP_ITERATIONS,
  classifyExportRecords,
  createImportPreview,
  diffSourceRecords,
  filterConfirmedKnowledge,
  minimizeGraph,
  generateVaultKey,
  encryptEnvelope,
  decryptEnvelope,
  createMemoryVaultAdapter,
  createIndexedDbVaultAdapter,
  commitGraph,
  commitPurgedGraph,
  commitSourceRemovedGraph,
  loadActiveGraph,
  removeSource,
  decideImportedIdentity,
  undoImportedIdentityDecision,
  diffImportedPreview,
  trashPerson,
  restorePerson,
  purgePerson,
  createBackup,
  writeVerifiedBackup,
  readBackupPreview,
  restoreBackup,
  deleteSafetySnapshot,
  cleanupExpiredSnapshots,
  markSourceUnavailable,
  transitionLocalState,
  parseWechatExportToolkit,
  parseMomentsData,
  stableWechatIds,
  SOURCE_BUNDLE_REVISION,
  createImportBatchReceipt,
  validateLocalImportConfirmation,
  validateCoverageReceipt,
  projectSourceCoverageReceipt,
  buildImportedGraph,
  analyzeLocalRelationshipGraph,
  projectRelationshipLibrary,
  createLocalContactDraft,
  recordManualContactEvent,
  getManualContactState,
  queryGraphSignals,
  queryTrustedMoments,
  renderGraphSignalPage,
  describeSourceReceipt,
  classifyGraphSignal,
  classifyTrustedMoment,
  mergeSuiyinImport,
  upgradeRelationshipGraphV2,
  evaluateRelationshipLabelCandidates,
  mutateRelationshipFacts,
  normalizeRelationshipLabel,
  normalizeSuiyinAccountLabel,
  analyzeLocalChatSemantics,
  createLocalSemanticBatchSnapshot,
  computeLocalSemanticAffectedPeople,
  loadActiveGraphWithSemanticCache,
  buildLocalSemanticCachePayload,
  commitLocalSemanticCache,
  validateLocalSemanticCachePayload,
  hydrateLocalSemanticCache,
  projectSourceIdentityReview,
  projectCrossSourceReview,
  projectSourceReceiptInventory,
  projectSuiyinSourceAttributionRepair,
  projectMappingAccountAttribution,
  mutateMappingAccountAttribution,
  projectRelationshipAuthority,
  projectRelationshipSuggestionIndex,
  mutateSuiyinSourceAccountLabel,
  mutateSingleSourceRelationship,
  confirmImportedSourceIdentity,
  mergeImportedIdentityPair,
  separateImportedIdentityPair,
  undoImportedIdentityPairDecision,
} = vault;

assert.equal(typeof parseWechatExportToolkit, "function", "missing R2 production parser parseWechatExportToolkit");
assert.equal(typeof parseMomentsData, "function", "missing R2 production parser parseMomentsData");
assert.equal(typeof stableWechatIds, "function", "missing R2 production parser stableWechatIds");
assert.equal(typeof decideImportedIdentity, "function", "missing production imported identity decision seam");
assert.equal(typeof undoImportedIdentityDecision, "function", "missing production imported identity undo seam");
assert.equal(typeof diffImportedPreview, "function", "missing production current-vault import diff seam");
assert.equal(typeof createImportBatchReceipt, "function", "T029-O07 missing safe batch receipt seam");
assert.equal(typeof validateLocalImportConfirmation, "function", "T029-O05 missing domain confirmation guard seam");
assert.equal(typeof validateCoverageReceipt, "function", "T030-O02 missing strict coverage receipt validator seam");
assert.equal(typeof projectSourceCoverageReceipt, "function", "T030-O02/O05 missing read-only coverage receipt projector seam");
assert.equal(typeof queryTrustedMoments, "function", "T031-O01 missing trusted Moments query seam");
assert.equal(typeof classifyTrustedMoment, "function", "T031-O06 missing generation-bound opaque classification seam");
assert.equal(typeof commitSourceRemovedGraph, "function", "missing production source retirement seam");
assert.equal(typeof cleanupExpiredSnapshots, "function", "missing production snapshot lifecycle seam");
assert.equal(typeof analyzeLocalRelationshipGraph, "function", "missing T003 production analysis seam");
assert.equal(typeof projectRelationshipLibrary, "function", "missing T003 real relationship-library projection seam");
assert.equal(typeof createLocalContactDraft, "function", "T004 missing confirmed-only local draft seam");
assert.equal(typeof recordManualContactEvent, "function", "T004 missing structured manual-contact event seam");
assert.equal(typeof getManualContactState, "function", "T004 missing persisted manual-contact state seam");
assert.equal(typeof upgradeRelationshipGraphV2, "function", "T013 missing pure schema v1-to-v2 relationship migration seam");
assert.equal(typeof evaluateRelationshipLabelCandidates, "function", "T013 missing deterministic metadata-only relationship candidate evaluator");
assert.equal(typeof mutateRelationshipFacts, "function", "T013 missing pure atomic manual/candidate relationship mutation seam");
assert.equal(typeof normalizeRelationshipLabel, "function", "T013 missing deterministic relationship label normalization seam");
assert.equal(typeof projectMappingAccountAttribution, "function", "T025 missing safe mapping-level account attribution projector");
assert.equal(typeof mutateMappingAccountAttribution, "function", "T025 missing atomic mapping-level account attribution mutation seam");
assert.equal(typeof analyzeLocalChatSemantics, "function", "T014-O01 missing exported explicit per-person semantic analyzer");
assert.equal(typeof createLocalSemanticBatchSnapshot, "function", "T015-O01 missing exported whole-library semantic snapshot seam");
assert.equal(typeof computeLocalSemanticAffectedPeople, "function", "T015-O04 missing exported exact affected-person seam");
assert.equal(typeof projectSuiyinSourceAttributionRepair, "function", "T024-O07 missing safe explicit attribution-repair preview seam");
assert.equal(typeof loadActiveGraphWithSemanticCache, "function", "T017-O02 missing cache-first vault load seam");
assert.equal(typeof buildLocalSemanticCachePayload, "function", "T017-O01/O09 missing strict full/affected cache payload builder");
assert.equal(typeof commitLocalSemanticCache, "function", "T017-O06/O07 missing cache-only same-generation CAS seam");
assert.equal(typeof validateLocalSemanticCachePayload, "function", "T017-O01/O03 missing strict cache validator");
assert.equal(typeof hydrateLocalSemanticCache, "function", "T017-O02/O05 missing immutable cache hydration seam");
assert.equal(typeof projectSourceIdentityReview, "function", "T016-O02/O04 missing safe source identity projection seam");
assert.equal(typeof projectCrossSourceReview, "function", "T020-O01/O02 missing public-safe cross-source review projection seam");
assert.equal(typeof projectSourceReceiptInventory, "function", "T021-O02/O06 missing shared safe source receipt inventory seam");
assert.equal(typeof mutateSuiyinSourceAccountLabel, "function", "T021-O06/O09 missing explicit Suiyin account-label mutation seam");
assert.equal(typeof projectRelationshipAuthority, "function", "T018-O02/O05 missing session-only direct relationship authority seam");
assert.equal(typeof projectRelationshipSuggestionIndex, "function", "T026-O05 missing exact indexed relationship suggestion projection seam");
assert.equal(typeof mutateSingleSourceRelationship, "function", "T018-O03/O04 missing atomic single-source identity+relationship mutation seam");
assert.equal(typeof confirmImportedSourceIdentity, "function", "T016-O03 missing explicit single-source confirmation seam");
assert.equal(typeof mergeImportedIdentityPair, "function", "T016-O05 missing explicit cross-source merge seam");
assert.equal(typeof separateImportedIdentityPair, "function", "T016-O06 missing exact-pair separation seam");
assert.equal(typeof undoImportedIdentityPairDecision, "function", "T016-O05/O06 missing pair decision undo seam");
const t010MissingVaultSeams = [
  ["R001/R003", "renderGraphSignalPage", renderGraphSignalPage],
  ["R002/R005", "describeSourceReceipt", describeSourceReceipt],
  ["R003", "queryGraphSignals", queryGraphSignals],
  ["R004/R011", "classifyGraphSignal", classifyGraphSignal],
  ["R008/R009/R011", "mergeSuiyinImport", mergeSuiyinImport],
].filter(([, , seam]) => typeof seam !== "function").map(([rule, name]) => `${rule}:${name}`);
assert.deepEqual(t010MissingVaultSeams, [], `T010 production seams missing: ${t010MissingVaultSeams.join(", ")}`);
const productionSource = fs.readFileSync(path.resolve("prototype/local-vault.js"), "utf8");
const analysisSourceStart = productionSource.indexOf("export function analyzeLocalRelationshipGraph");
const analysisSourceEnd = productionSource.indexOf("export function minimizeGraph", analysisSourceStart);
const analysisProductionSource = productionSource.slice(analysisSourceStart, analysisSourceEnd);
assert.equal(analysisSourceStart >= 0 && analysisSourceEnd > analysisSourceStart, true, "missing bounded T003 production source seam");
assert.doesNotMatch(analysisProductionSource, /\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|commitGraph|readExactFile|getFileHandle|createIndexedDbVaultAdapter|console)\b/, "T003 analysis seam contains network, source-read, storage, or private-log capability");

async function encryptBackupFixture(payload, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: BACKUP_ITERATIONS }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(payload)));
  return { format: "relationship-today-backup", version: payload.version, kdf: { name: "PBKDF2", hash: "SHA-256", iterations: BACKUP_ITERATIONS, salt: Buffer.from(salt).toString("base64") }, cipher: "AES-256-GCM", iv: Buffer.from(iv).toString("base64"), ciphertext: Buffer.from(ciphertext).toString("base64") };
}

const fixtureRoot = path.resolve("specs/002-local-import-identity-persistence/fixtures/wechat-export-toolkit-fictional");
const fixtureFiles = new Map([
  ["json/_index.json", fs.readFileSync(path.join(fixtureRoot, "json/_index.json"), "utf8")],
  ["json/all_messages.jsonl", fs.readFileSync(path.join(fixtureRoot, "json/all_messages.jsonl"), "utf8")],
  ["json/虚构会话_a1b2c3.json", fs.readFileSync(path.join(fixtureRoot, "json/虚构会话_a1b2c3.json"), "utf8")],
  ["moments/data.js", fs.readFileSync(path.join(fixtureRoot, "moments/data.js"), "utf8")],
]);

function fixtureHandle(files = fixtureFiles) {
  const calls = [];
  const rejectDiscovery = () => { throw new Error("directory-discovery-forbidden"); };
  const fileHandle = (relativePath) => ({ kind: "file", name: relativePath.split("/").at(-1), async getFile() { calls.push(`read:${relativePath}`); const raw = files.get(relativePath); const data = typeof raw === "string" ? new TextEncoder().encode(raw) : raw; return new Blob([data]); } });
  const directory = (prefix) => ({
    kind: "directory",
    name: prefix || "wechat-export-toolkit-fictional",
    entries: rejectDiscovery,
    values: rejectDiscovery,
    keys: rejectDiscovery,
    [Symbol.asyncIterator]: rejectDiscovery,
    async getDirectoryHandle(name) {
      const relative = prefix ? `${prefix}/${name}` : name;
      calls.push(`dir:${relative}`);
      if (!["json", "moments"].includes(relative)) throw Object.assign(new Error("not-found"), { name: "NotFoundError" });
      return directory(relative);
    },
    async getFileHandle(name) {
      const relative = prefix ? `${prefix}/${name}` : name;
      calls.push(`file:${relative}`);
      if (!files.has(relative)) throw Object.assign(new Error("not-found"), { name: "NotFoundError" });
      return fileHandle(relative);
    },
  });
  return { root: directory(""), calls };
}

assert.match(SOURCE_BUNDLE_REVISION, /^[0-9A-F]{64}$/);
const fixtureAdapter = fixtureHandle();
const parsedFixture = await parseWechatExportToolkit(fixtureAdapter.root, { sourceBundleRevision: SOURCE_BUNDLE_REVISION });
assert.equal(parsedFixture.ok, true);
assert.equal(parsedFixture.conversations.length, 1);
assert.equal(parsedFixture.messages.length, 3);
assert.equal(parsedFixture.moments.length, 1);
assert.equal(parsedFixture.peopleScopeLabel, "来源中出现的人，不是完整通讯录");
assert.equal(parsedFixture.messages.filter((item) => item.kind === "chat-text").length, 1);
assert.equal(parsedFixture.messages.filter((item) => item.kind === "media-description").length, 2);
assert.equal(parsedFixture.messages.some((item) => Object.hasOwn(item, "image")), false);
assert.equal(parsedFixture.warnings.some((item) => item.code === "senderless-group-context-excluded" || item.code === "moments-parse-failures-excluded"), false);
assert.deepEqual(Object.keys(parsedFixture.moments[0]).sort(), ["body", "contentId", "mediaDescription", "name", "platformUserId", "publishedAt", "sourcePersonId", "time"].sort());
assert.equal(parsedFixture.moments[0].mediaDescription, "2 个媒体项目（未打开）");
assert.equal(fixtureAdapter.calls.some((call) => /entries|values|keys|\.html|\.txt|img|avatar|sticker/.test(call)), false);
assert.equal(fixtureAdapter.calls.filter((call) => call.startsWith("read:")).every((call) => fixtureFiles.has(call.slice(5))), true);
assert.deepEqual(fixtureAdapter.calls, [
  "dir:json",
  "file:json/_index.json",
  "read:json/_index.json",
  "file:json/all_messages.jsonl",
  "read:json/all_messages.jsonl",
  "file:json/虚构会话_a1b2c3.json",
  "read:json/虚构会话_a1b2c3.json",
  "dir:moments",
  "file:moments/data.js",
  "read:moments/data.js",
]);

const wrapperPayload = parseMomentsData(fixtureFiles.get("moments/data.js"));
assert.equal(wrapperPayload.posts.length, 1);
for (const invalidWrapper of [
  ` ${fixtureFiles.get("moments/data.js")}`,
  `\uFEFF${fixtureFiles.get("moments/data.js")}`,
  fixtureFiles.get("moments/data.js").slice(0, -1),
  `${fixtureFiles.get("moments/data.js")};`,
  `/*x*/${fixtureFiles.get("moments/data.js")}`,
  fixtureFiles.get("moments/data.js").replace("window.SNS_DATA=", "window.SNS_DATA ="),
  "window.SNS_DATA=[];",
  "window.SNS_DATA={};alert(1);",
]) assert.throws(() => parseMomentsData(invalidWrapper), /invalid-moments-wrapper/);

const bomMoments = new Map(fixtureFiles);
bomMoments.set("moments/data.js", Uint8Array.from([0xEF, 0xBB, 0xBF, ...new TextEncoder().encode(fixtureFiles.get("moments/data.js"))]));
await expectParseCode(bomMoments, "invalid-utf8-bom");

function mutateMoments(mutator) {
  const files = new Map(fixtureFiles);
  const raw = files.get("moments/data.js");
  const data = JSON.parse(raw.slice("window.SNS_DATA=".length, -1));
  mutator(data);
  files.set("moments/data.js", `window.SNS_DATA=${JSON.stringify(data)};`);
  return files;
}
await expectParseCode(mutateMoments((data) => { delete data.me; }), "invalid-moments-schema");
await expectParseCode(mutateMoments((data) => { data.stats.posts = 999; }), "moments-count-mismatch");
await expectParseCode(mutateMoments((data) => { data.stats.interactions = 1; }), "moments-count-mismatch");
await expectParseCode(mutateMoments((data) => { data.stats.likes = 1; }), "moments-count-mismatch");
await expectParseCode(mutateMoments((data) => { data.stats.parse_failed = -1; }), "invalid-moments-schema");
const momentsParseFailures = await parseWechatExportToolkit(fixtureHandle(mutateMoments((data) => { data.stats.parse_failed = 2; })).root, { sourceBundleRevision: SOURCE_BUNDLE_REVISION });
assert.equal(momentsParseFailures.ok, true);
assert.equal(momentsParseFailures.moments.length, parsedFixture.moments.length, "valid posts must remain importable");
assert.deepEqual(momentsParseFailures.warnings.filter(item => item.code === "moments-parse-failures-excluded"), [{ code: "moments-parse-failures-excluded", count: 2 }]);
await expectParseCode(mutateMoments((data) => { data.people[0].posts = 2; }), "moments-count-mismatch");
await expectParseCode(mutateMoments((data) => { data.people = {}; }), "invalid-moments-schema");

const stable = await stableWechatIds({ owner: "fictional_owner_alpha", platformUserId: "fictional_talker_elm", talker: "fictional_talker_elm", serverId: "910000000000000001", momentId: "fictional_moment_0001" });
for (const id of Object.values(stable)) assert.match(id, /^[0-9A-F]{64}$/);
assert.deepEqual(stable, await stableWechatIds({ owner: "fictional_owner_alpha", platformUserId: "fictional_talker_elm", talker: "fictional_talker_elm", serverId: "910000000000000001", momentId: "fictional_moment_0001" }));
assert.equal(parsedFixture.messages[0].contentId, stable.chatContentId, "non-zero server_id identity must remain unchanged");
assert.equal((await stableWechatIds({ owner: "e\u0301", platformUserId: "u", talker: "t", serverId: "1", momentId: "m" })).sourceId, (await stableWechatIds({ owner: "é", platformUserId: "u", talker: "t", serverId: "1", momentId: "m" })).sourceId);

async function expectParseCode(files, code, options = {}) {
  const adapter = fixtureHandle(files);
  const result = await parseWechatExportToolkit(adapter.root, { sourceBundleRevision: SOURCE_BUNDLE_REVISION, ...options });
  assert.equal(result.ok, false, `expected ${code}`);
  assert.equal(result.error.code, code);
  assert.equal(result.formalWriteCount, 0);
  assert.equal(JSON.stringify(result.error).includes("纯虚构问候"), false);
  return result;
}

const withoutIndex = new Map(fixtureFiles); withoutIndex.delete("json/_index.json");
assert.match((await expectParseCode(withoutIndex, "missing-canonical-json")).error.nextAction, /export_json\.py/);
const withoutMessages = new Map(fixtureFiles); withoutMessages.delete("json/all_messages.jsonl");
await expectParseCode(withoutMessages, "missing-canonical-json");
for (const [name, code] of [["NotAllowedError", "permission-denied"], ["AbortError", "cancelled"]]) {
  const result = await parseWechatExportToolkit({ async getDirectoryHandle() { throw Object.assign(new Error(name), { name }); } });
  assert.equal(result.error.code, code);
  assert.equal(result.formalWriteCount, 0);
}
const withoutMoments = new Map(fixtureFiles); withoutMoments.delete("moments/data.js");
const noMoments = await parseWechatExportToolkit(fixtureHandle(withoutMoments).root, { sourceBundleRevision: SOURCE_BUNDLE_REVISION });
assert.equal(noMoments.ok, true); assert.equal(noMoments.warnings.some((item) => item.code === "moments-not-provided"), true);
await expectParseCode(fixtureFiles, "unsupported-exporter-revision", { sourceBundleRevision: "0".repeat(64) });

function mutateJsonFile(relative, mutate) {
  const files = new Map(fixtureFiles);
  const data = JSON.parse(files.get(relative)); mutate(data); files.set(relative, JSON.stringify(data)); return files;
}

function senderlessGroupFiles({ asText = false, conversationConflict = false, totalDelta = 0, duplicateContent = false } = {}) {
  const files = new Map(fixtureFiles);
  const index = JSON.parse(files.get("json/_index.json"));
  const conversationPath = `json/${index.conversations[0].file}`;
  const conversation = JSON.parse(files.get(conversationPath));
  const messages = files.get("json/all_messages.jsonl").split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  index.conversations[0].is_group = true;
  index.total_messages += totalDelta;
  conversation.is_group = true;
  for (const message of messages) message.is_group = true;
  messages[0].from = "";
  messages[0].from_name = "";
  messages[0].type = asText ? 1 : 10000;
  messages[0].type_label = asText ? "text" : "system";
  conversation.messages[0].from = conversationConflict ? "fictional_sender_conflict" : "";
  conversation.messages[0].from_name = "";
  conversation.messages[0].type = messages[0].type;
  conversation.messages[0].type_label = messages[0].type_label;
  if (duplicateContent) {
    messages[1].msgID = messages[0].msgID;
    messages[1].server_id = messages[0].server_id;
    conversation.messages[1].msgID = conversation.messages[0].msgID;
    conversation.messages[1].server_id = conversation.messages[0].server_id;
  }
  files.set("json/_index.json", JSON.stringify(index));
  files.set(conversationPath, JSON.stringify(conversation));
  files.set("json/all_messages.jsonl", messages.map(message => JSON.stringify(message)).join("\n"));
  return files;
}

const senderlessGroup = await parseWechatExportToolkit(fixtureHandle(senderlessGroupFiles()).root, { sourceBundleRevision: SOURCE_BUNDLE_REVISION });
assert.equal(senderlessGroup.ok, true);
assert.equal(senderlessGroup.conversations[0].messageCount, 3, "raw conversation count must stay unchanged");
assert.equal(senderlessGroup.conversationCrossChecks, 1, "conversation JSON cross-check must still run");
assert.equal(senderlessGroup.messages.length, 2, "senderless non-text group context must not become an excerpt");
assert.deepEqual(senderlessGroup.warnings.filter(item => item.code === "senderless-group-context-excluded"), [{ code: "senderless-group-context-excluded", count: 1 }]);
const senderlessGraph = buildImportedGraph(senderlessGroup);
assert.equal(senderlessGraph.excerpts.length, senderlessGroup.messages.length);
assert.deepEqual(new Set(senderlessGraph.people.map(item => item.id)), new Set([...senderlessGroup.messages, ...senderlessGroup.moments].map(item => item.sourcePersonId)));
await expectParseCode(senderlessGroupFiles({ asText: true }), "invalid-schema");
await expectParseCode(senderlessGroupFiles({ conversationConflict: true }), "conversation-conflict");
await expectParseCode(senderlessGroupFiles({ totalDelta: 1 }), "count-mismatch");
await expectParseCode(senderlessGroupFiles({ duplicateContent: true }), "duplicate-content-id");

function zeroPlaceholderAcrossConversations() {
  const files = new Map(fixtureFiles);
  const index = JSON.parse(files.get("json/_index.json"));
  const firstPath = `json/${index.conversations[0].file}`;
  const firstConversation = JSON.parse(files.get(firstPath));
  const messages = files.get("json/all_messages.jsonl").split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  messages[0].msgID = "0";
  messages[0].server_id = "0";
  firstConversation.messages[0].msgID = "0";
  firstConversation.messages[0].server_id = "0";

  const secondTalker = "fictional_zero_second_conversation";
  const secondFile = "fictional_zero_second.json";
  const secondMessage = { ...messages[0], talker: secondTalker, talker_name: "虚构第二会话", local_id: messages[0].local_id, timestamp: messages[0].timestamp + 1, time: "2026-08-13 08:00:01" };
  const secondConversationMessage = { ...firstConversation.messages[0], local_id: secondMessage.local_id, timestamp: secondMessage.timestamp, time: secondMessage.time };
  const secondConversation = { owner: index.owner, talker: secondTalker, talker_name: secondMessage.talker_name, is_group: secondMessage.is_group, message_count: 1, messages: [secondConversationMessage] };
  messages.push(secondMessage);
  index.conversation_count += 1;
  index.total_messages += 1;
  index.conversations.push({ talker: secondTalker, talker_name: secondMessage.talker_name, is_group: secondMessage.is_group, message_count: 1, first_time: secondMessage.time, last_time: secondMessage.time, file: secondFile });
  files.set("json/_index.json", JSON.stringify(index));
  files.set(firstPath, JSON.stringify(firstConversation));
  files.set(`json/${secondFile}`, JSON.stringify(secondConversation));
  files.set("json/all_messages.jsonl", messages.map(message => JSON.stringify(message)).join("\n"));
  return files;
}

function duplicateZeroLocalKey() {
  const files = new Map(fixtureFiles);
  const index = JSON.parse(files.get("json/_index.json"));
  const conversationPath = `json/${index.conversations[0].file}`;
  const conversation = JSON.parse(files.get(conversationPath));
  const messages = files.get("json/all_messages.jsonl").split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  for (const position of [0, 1]) {
    messages[position].msgID = "0";
    messages[position].server_id = "0";
    conversation.messages[position].msgID = "0";
    conversation.messages[position].server_id = "0";
  }
  messages[1].local_id = messages[0].local_id;
  conversation.messages[1].local_id = conversation.messages[0].local_id;
  files.set(conversationPath, JSON.stringify(conversation));
  files.set("json/all_messages.jsonl", messages.map(message => JSON.stringify(message)).join("\n"));
  return files;
}

const zeroPlaceholderFiles = zeroPlaceholderAcrossConversations();
const zeroPlaceholderFirst = await parseWechatExportToolkit(fixtureHandle(zeroPlaceholderFiles).root, { sourceBundleRevision: SOURCE_BUNDLE_REVISION });
const zeroPlaceholderSecond = await parseWechatExportToolkit(fixtureHandle(zeroPlaceholderFiles).root, { sourceBundleRevision: SOURCE_BUNDLE_REVISION });
assert.equal(zeroPlaceholderFirst.ok, true);
assert.equal(zeroPlaceholderFirst.messages.length, 4);
assert.equal(new Set(zeroPlaceholderFirst.messages.map(message => message.contentId)).size, 4, "zero placeholders must remain distinct across talker/local_id keys");
assert.deepEqual(zeroPlaceholderFirst.messages.map(message => message.contentId), zeroPlaceholderSecond.messages.map(message => message.contentId), "zero placeholder fallback IDs must be stable");
await expectParseCode(duplicateZeroLocalKey(), "duplicate-content-id");
const nonNumericServerId = mutateJsonFile("json/虚构会话_a1b2c3.json", data => { data.messages[0].msgID = "not-decimal"; data.messages[0].server_id = "not-decimal"; });
nonNumericServerId.set("json/all_messages.jsonl", nonNumericServerId.get("json/all_messages.jsonl").replaceAll("910000000000000001", "not-decimal"));
await expectParseCode(nonNumericServerId, "unstable-content-id");
const localIdConflict = mutateJsonFile("json/虚构会话_a1b2c3.json", data => { data.messages[0].local_id += 1; });
await expectParseCode(localIdConflict, "conversation-conflict");

await expectParseCode(mutateJsonFile("json/_index.json", (data) => { data.conversation_count = 2; }), "count-mismatch");
await expectParseCode(mutateJsonFile("json/_index.json", (data) => { data.conversations[0].file = "../escape.json"; }), "path-traversal");
await expectParseCode(mutateJsonFile("json/_index.json", (data) => { data.conversations[0].file = "/escape.json"; }), "path-traversal");
await expectParseCode(mutateJsonFile("json/_index.json", (data) => { data.conversations[0].file = "C:\\escape.json"; }), "path-traversal");
await expectParseCode(mutateJsonFile("json/_index.json", (data) => { data.conversations[0].file = "%2e%2e%2fescape.json"; }), "path-traversal");
await expectParseCode(mutateJsonFile("json/_index.json", (data) => { data.owner = 42; }), "invalid-schema");
const invalidMessageType = new Map(fixtureFiles); invalidMessageType.set("json/all_messages.jsonl", invalidMessageType.get("json/all_messages.jsonl").replace('"timestamp":', '"timestamp":"not-an-integer","discarded":'));
await expectParseCode(invalidMessageType, "invalid-schema");
const invalidIndexJson = new Map(fixtureFiles); invalidIndexJson.set("json/_index.json", "{");
await expectParseCode(invalidIndexJson, "invalid-json");
const invalidJsonl = new Map(fixtureFiles); invalidJsonl.set("json/all_messages.jsonl", `{\n${invalidJsonl.get("json/all_messages.jsonl").split("\n").slice(1).join("\n")}`);
await expectParseCode(invalidJsonl, "invalid-json");
const withoutConversation = new Map(fixtureFiles); withoutConversation.delete("json/虚构会话_a1b2c3.json");
await expectParseCode(withoutConversation, "missing-conversation-json");
const duplicate = new Map(fixtureFiles); duplicate.set("json/all_messages.jsonl", `${duplicate.get("json/all_messages.jsonl")}\n${duplicate.get("json/all_messages.jsonl").split("\n")[0]}`);
await expectParseCode(duplicate, "duplicate-content-id");
const conflict = new Map(fixtureFiles); conflict.set("json/all_messages.jsonl", conflict.get("json/all_messages.jsonl").replace('"server_id":"910000000000000001"', '"server_id":"910000000000000099"'));
await expectParseCode(conflict, "unstable-content-id");
const replacement = new Map(fixtureFiles); replacement.set("json/all_messages.jsonl", replacement.get("json/all_messages.jsonl").replace("纯虚构问候", "\uFFFD虚构问候"));
await expectParseCode(replacement, "invalid-utf8-replacement");
const conversationConflict = mutateJsonFile("json/虚构会话_a1b2c3.json", (data) => { data.messages[0].timestamp += 1; });
await expectParseCode(conversationConflict, "conversation-conflict");
const unknown = mutateJsonFile("json/_index.json", (data) => { data.fictional_extra = "ignored"; });
const unknownResult = await parseWechatExportToolkit(fixtureHandle(unknown).root, { sourceBundleRevision: SOURCE_BUNDLE_REVISION });
assert.equal(unknownResult.ok, true); assert.deepEqual(unknownResult.unknownFields, [{ scope: "index", field: "fictional_extra" }]);

const now = "2026-08-13T08:00:00.000Z";
const sourceId = "fictional-source-a";
const personId = "fictional-person-a";
const secret = "FICTIONAL_CANARY_CEDAR_42";
const records = [
  { id: "contact-1", relativePath: "contacts/contact-1.json", kind: "contact", text: "虚构联系人甲" },
  { id: "chat-1", relativePath: "messages/chat-1.txt", kind: "chat-text", text: secret },
  { id: "moment-1", relativePath: "moments/moment-1.json", kind: "moment-text", text: "虚构散步动态", publishedAt: now },
  { id: "media-note-1", relativePath: "media/descriptions.txt", kind: "media-description", text: "虚构图片文字描述" },
  { id: "image-1", relativePath: "media/photo.jpg", kind: "image", body: secret },
  { id: "voice-1", relativePath: "media/voice.mp3", kind: "audio", body: secret },
  { id: "unknown-1", relativePath: "misc/blob.bin", kind: "unknown", body: secret },
  { id: "parent-canary", relativePath: "../outside.txt", kind: "chat-text", text: secret },
];

assert.equal(BACKUP_ITERATIONS >= 310_000, true, "backup PBKDF2 budget");

const classified = classifyExportRecords(records);
assert.deepEqual(classified.supported.map((r) => r.id), ["contact-1", "chat-1", "moment-1", "media-note-1"]);
assert.deepEqual(classified.excluded.map((r) => r.id), ["image-1", "voice-1", "unknown-1", "parent-canary"]);
assert.equal(classified.excluded.some((r) => "body" in r), false, "excluded bodies are never retained/read");

const preview = createImportPreview({ sourceId, records });
assert.equal(preview.state, "preview-ready");
assert.equal(preview.formalWriteCount, 0);
assert.equal(preview.supportedCount, 4);
assert.equal(preview.excludedCount, 4);

const v2 = records.filter((r) => r.id !== "chat-1").map((r) => r.id === "moment-1" ? { ...r, text: "虚构动态已更新" } : r).concat([
  { id: "chat-2", relativePath: "messages/chat-2.txt", kind: "chat-text", text: "虚构新消息" },
]);
const diff = diffSourceRecords(records, v2);
assert.deepEqual(diff.added, ["chat-2"]);
assert.deepEqual(diff.updated, ["moment-1"]);
assert.deepEqual(diff.conflicts, ["moment-1"]);
assert.deepEqual(diff.suspectedDeleted, ["chat-1"]);
assert.equal(diff.unchanged.includes("contact-1"), true);

const graph = {
  owner: "owner_local",
  sources: [{ id: sourceId, state: "active", displayName: "虚构导出 A" }],
  people: [{ id: personId, name: "虚构人物甲", state: "active" }],
  excerpts: [{ id: "excerpt-1", sourceId, personId, text: secret }],
  mappings: [{ id: "mapping-1", sourceId, personId, status: "confirmed" }],
  relationships: [{ id: "relation-1", personId, sourceIds: [sourceId], status: "confirmed", label: "朋友" }],
  dictionary: [{ id: "dict-1", label: "朋友", status: "active" }],
  signals: [
    { id: "signal-approved", sourceId, personId, status: "topic-approved", text: "虚构可用话题" },
    { id: "signal-pending", sourceId, personId, status: "pending", text: "虚构待确认" },
    { id: "signal-third", sourceId, personId, status: "internal", thirdParty: true, text: "虚构第三方内容" },
  ],
  topics: [{ id: "topic-1", sourceId, personId, signalId: "signal-approved", text: "虚构待审核话题" }],
  notes: [{ id: "note-1", personId, sourceId, text: "虚构手写笔记", authoredByUser: true }],
  actions: [{ id: "action-1", personId, sourceId, text: "虚构实际联系", userMarked: true }],
  trash: [],
  purgedPersonIds: [],
  settings: { schema: 1 },
};

const importedGraph = buildImportedGraph(parsedFixture);
assert.equal(importedGraph.sources.length, 1);
assert.equal(importedGraph.excerpts.length, 3);
assert.equal(importedGraph.signals.length, 1);
assert.equal(importedGraph.people.every((person) => person.state === "pending"), true);
const importedPersonId = importedGraph.people[0].id;
const importTombstoneGraph = { ...importedGraph, people: importedGraph.people.filter((person) => person.id !== importedPersonId), purgedPersonIds: [importedPersonId] };
assert.throws(() => buildImportedGraph(parsedFixture, importTombstoneGraph), (error) => error?.code === "previously-purged" && error?.personIds?.includes(importedPersonId));
assert.equal(buildImportedGraph(parsedFixture, importTombstoneGraph, { confirmResurrection: true }).people.some((person) => person.id === importedPersonId), true);

const pendingMappingId = importedGraph.mappings[0].id;
assert.equal(filterConfirmedKnowledge(importedGraph).relationships.length, 0, "pending imported identity cannot enter facts/recommendations");
const mergedIdentity = decideImportedIdentity(importedGraph, pendingMappingId, "confirmed");
assert.equal(mergedIdentity.mappings.find((item) => item.id === pendingMappingId).status, "confirmed");
assert.deepEqual(mergedIdentity.relationships, importedGraph.relationships, "T013 identity confirmation must not synthesize a relationship fact");
assert.throws(() => decideImportedIdentity(importedGraph, pendingMappingId, "separate"), (error) => error?.code === "IDENTITY_PAIR_INVALID", "T016-O03 a single mapping must never be written as separated");
assert.deepEqual(importedGraph.relationships, [], "T016-O03 rejected single separation must not edit relationship facts");
assert.deepEqual(undoImportedIdentityDecision(mergedIdentity, pendingMappingId), importedGraph, "undo returns imported identity to pending without confirmed facts");
const identityAdapter = createMemoryVaultAdapter();
const identityKey = await generateVaultKey();
await commitGraph(identityAdapter, importedGraph, identityKey, { now });
identityAdapter.failNextCommit("identity-decision-fault");
await assert.rejects(() => commitGraph(identityAdapter, mergedIdentity, identityKey, { now }), /identity-decision-fault/);
assert.deepEqual(await loadActiveGraph(identityAdapter, identityKey), importedGraph, "identity decision commit is recoverable on transaction fault");

const contactPending = structuredClone(importedGraph);
assert.throws(() => createLocalContactDraft({ displayName: "虚构候选", confirmed: false }), /contact-identity-unconfirmed/);
assert.throws(() => recordManualContactEvent(contactPending, { personId: importedPersonId, status: "sent-manually", actionId: "fictional-contact-0", recordedAt: now, text: "虚构问候" }), /contact-identity-unconfirmed/);
const contactGraph = decideImportedIdentity(importedGraph, pendingMappingId, "confirmed");
const contactBefore = structuredClone(contactGraph);
const contactDraft = createLocalContactDraft({ displayName: "虚构候选", confirmed: true });
assert.match(contactDraft, /虚构候选/);
assert.equal(contactDraft.includes("虚构会话"), false, "draft must never include fixture source text");
const sentContact = recordManualContactEvent(contactGraph, { personId: importedPersonId, status: "sent-manually", actionId: "fictional-contact-sent", recordedAt: now, text: `${contactDraft}（已编辑）` });
assert.deepEqual(contactGraph, contactBefore, "manual contact mutation clones its input");
assert.deepEqual(sentContact.actions.at(-1), { id: "fictional-contact-sent", personId: importedPersonId, kind: "manual-contact", status: "sent-manually", recordedAt: now, userMarked: true, text: `${contactDraft}（已编辑）` });
assert.throws(() => recordManualContactEvent(contactGraph, { personId: importedPersonId, status: "replied", actionId: "fictional-contact-feedback-first", recordedAt: now }), /manual-contact-send-required/);
const repliedContact = recordManualContactEvent(sentContact, { personId: importedPersonId, status: "replied", actionId: "fictional-contact-replied", recordedAt: "2026-08-13T08:01:00.000Z" });
assert.equal(getManualContactState(repliedContact, importedPersonId).status, "replied");
assert.throws(() => recordManualContactEvent(repliedContact, { personId: importedPersonId, status: "replied", actionId: "fictional-contact-replied", recordedAt: now }), /duplicate-manual-contact-action/);
assert.equal(repliedContact.actions.filter(item => item.id === "fictional-contact-replied").length, 1, "duplicate event cannot append");

const firstImportDiff = await diffImportedPreview(parsedFixture, null);
assert.equal(firstImportDiff.added.length, parsedFixture.messages.length + parsedFixture.moments.length);
assert.deepEqual(firstImportDiff.updated, []);
assert.deepEqual(firstImportDiff.conflicts, []);
const unchangedReimportDiff = await diffImportedPreview(parsedFixture, importedGraph);
assert.equal(unchangedReimportDiff.unchanged.length, parsedFixture.messages.length + parsedFixture.moments.length);
assert.deepEqual(unchangedReimportDiff.added, []);
assert.deepEqual(unchangedReimportDiff.updated, []);
assert.deepEqual(unchangedReimportDiff.suspectedDeleted, []);
assert.deepEqual(unchangedReimportDiff.conflicts, []);
const changedPreview = structuredClone(parsedFixture);
changedPreview.messages[0].text = "虚构重导内容变化";
const conflictReimportDiff = await diffImportedPreview(changedPreview, importedGraph);
assert.deepEqual(conflictReimportDiff.conflicts, [changedPreview.messages[0].contentId]);
assert.deepEqual(buildImportedGraph(parsedFixture, importedGraph), buildImportedGraph(parsedFixture, buildImportedGraph(parsedFixture, importedGraph)), "repeated same-source apply is idempotent");

// T029-O01..O04 legal RED: source-owned collisions, safe enrichment and
// graph-owned relational links must form one exact, mutually-exclusive domain.
const t029FixtureSelectedAt = "2026-08-19T10:29:00.000Z";
const t029CommittedAt = "2026-08-19T10:30:00.000Z";
const t029ContentId = parsedFixture.messages[0].contentId;
const t029OldMissingProvenance = structuredClone(importedGraph);
const t029OldExcerpt = t029OldMissingProvenance.excerpts.find((item) => item.id === t029ContentId);
for (const field of ["conversationKind", "conversationId", "direction", "thirdParty"]) delete t029OldExcerpt[field];
const t029EnrichmentDiff = await diffImportedPreview(parsedFixture, t029OldMissingProvenance);
assert.equal(t029EnrichmentDiff.updated.includes(t029ContentId), true, "T029-O01 missing-to-present provenance must be an update");
assert.equal(t029EnrichmentDiff.conflicts.includes(t029ContentId), false, "T029-O01 safe provenance enrichment must not be a conflict");

const t029MergedPersonId = "t029-fictional-canonical-person";
const t029MergedGraph = structuredClone(importedGraph);
t029MergedGraph.people.push({ id: t029MergedPersonId, name: "纯虚构合并人物", state: "active" });
t029MergedGraph.mappings.find((item) => item.sourcePersonId === parsedFixture.messages[0].sourcePersonId).personId = t029MergedPersonId;
t029MergedGraph.excerpts.find((item) => item.id === t029ContentId).personId = t029MergedPersonId;
const t029MergedDiff = await diffImportedPreview(parsedFixture, t029MergedGraph);
assert.equal(t029MergedDiff.updated.includes(t029ContentId), false, "T029-O02 current mapping must canonicalize the after relational target before diff");
assert.equal(t029MergedDiff.conflicts.includes(t029ContentId), false, "T029-O02 canonical person link must never manufacture source conflict");

const t029ExistingProvenanceConflict = structuredClone(importedGraph);
t029ExistingProvenanceConflict.excerpts.find((item) => item.id === t029ContentId).direction = parsedFixture.messages[0].direction === "self" ? "counterparty" : "self";
const t029TrueConflictDiff = await diffImportedPreview(parsedFixture, t029ExistingProvenanceConflict);
assert.deepEqual(t029TrueConflictDiff.conflicts, [t029ContentId], "T029-O03 existing nonempty provenance mismatch must be conflict-only");
assert.equal(t029TrueConflictDiff.updated.includes(t029ContentId), false, "T029-O03 conflict and update categories must be mutually exclusive");
const t029PartitionIds = [
  ...t029TrueConflictDiff.added,
  ...t029TrueConflictDiff.updated,
  ...t029TrueConflictDiff.conflicts,
  ...t029TrueConflictDiff.unchanged,
  ...t029TrueConflictDiff.suspectedDeleted,
];
assert.equal(new Set(t029PartitionIds).size, t029PartitionIds.length, "T029-O04 diff partitions must never overlap");
assert.equal(new Set(t029PartitionIds).size, new Set([...importedGraph.excerpts, ...importedGraph.signals].map((item) => item.id)).size, "T029-O04 partition union must exactly cover the comparison domain");

// T029-O07..O09 legal RED: parser preview owns a safe transient receipt and a
// successful graph build persists one strict quartet without guessing export time.
const t029ReceiptFixture = await parseWechatExportToolkit(fixtureHandle().root, { sourceBundleRevision: SOURCE_BUNDLE_REVISION, selectedAt: t029FixtureSelectedAt });
assert.deepEqual(t029ReceiptFixture.receipt, { batchName: "wechat-export-toolkit-fictional", selectedAt: t029FixtureSelectedAt, exportedAt: null }, "T029-O07 parser must expose only safe basename and injected selection time");
const t029ReceiptGraph = buildImportedGraph(t029ReceiptFixture, null, { importedAt: t029CommittedAt });
assert.deepEqual(
  Object.fromEntries(["batchName", "selectedAt", "importedAt", "exportedAt"].map((field) => [field, t029ReceiptGraph.sources[0][field]])),
  { batchName: "wechat-export-toolkit-fictional", selectedAt: t029FixtureSelectedAt, importedAt: t029CommittedAt, exportedAt: null },
  "T029-O08 committed source must persist the strict receipt quartet",
);
const t029ReceiptLabels = describeSourceReceipt(t029ReceiptGraph.sources[0]);
assert.equal(t029ReceiptLabels.batchNameLabel, "wechat-export-toolkit-fictional");
assert.equal(t029ReceiptLabels.selectedAtLabel, t029FixtureSelectedAt);
assert.equal(t029ReceiptLabels.importedAtLabel, t029CommittedAt);
assert.equal(t029ReceiptLabels.exportedAtLabel, "导出工具未提供", "T029-O09 exporter absence must remain explicit and must not guess filesystem/moments time");

const t029NewMissingProvenance = structuredClone(parsedFixture);
const t029NewMissingMessage = t029NewMissingProvenance.messages.find((item) => item.contentId === t029ContentId);
for (const field of ["conversationKind", "conversationId", "direction", "thirdParty"]) delete t029NewMissingMessage[field];
const t029NoDowngradeDiff = await diffImportedPreview(t029NewMissingProvenance, importedGraph);
assert.equal(t029NoDowngradeDiff.unchanged.includes(t029ContentId), true, "T029-O01 old safe provenance plus new missing must stay unchanged");
assert.equal(t029NoDowngradeDiff.updated.includes(t029ContentId) || t029NoDowngradeDiff.conflicts.includes(t029ContentId), false, "T029-O01 missing new provenance must not manufacture update/conflict");
const t029NoDowngradeGraph = buildImportedGraph(t029NewMissingProvenance, importedGraph);
for (const field of ["conversationKind", "conversationId", "direction", "thirdParty"]) assert.equal(t029NoDowngradeGraph.excerpts.find((item) => item.id === t029ContentId)[field], importedGraph.excerpts.find((item) => item.id === t029ContentId)[field], `T029-O01 build must preserve old ${field}`);

const t029OldMissingBoolean = structuredClone(importedGraph);
delete t029OldMissingBoolean.excerpts.find((item) => item.id === t029ContentId).thirdParty;
const t029BooleanEnrichment = await diffImportedPreview(parsedFixture, t029OldMissingBoolean);
assert.equal(t029BooleanEnrichment.updated.includes(t029ContentId), true, "T029-O01 explicit false must enrich a missing thirdParty field");
const t029NewMissingBoolean = structuredClone(parsedFixture);
delete t029NewMissingBoolean.messages.find((item) => item.contentId === t029ContentId).thirdParty;
const t029BooleanNoDowngrade = await diffImportedPreview(t029NewMissingBoolean, importedGraph);
assert.equal(t029BooleanNoDowngrade.unchanged.includes(t029ContentId), true, "T029-O01 missing thirdParty must not be guessed as false");

const t029DuplicateAfter = structuredClone(parsedFixture);
t029DuplicateAfter.messages.push(structuredClone(t029DuplicateAfter.messages[0]));
await assert.rejects(() => diffImportedPreview(t029DuplicateAfter, importedGraph), (error) => error?.code === "IMPORT_DIFF_DUPLICATE_ID", "T029-O04 duplicate after stable IDs must fail closed before Map overwrite");
const t029DuplicateMapping = structuredClone(importedGraph);
t029DuplicateMapping.mappings.push({ ...structuredClone(t029DuplicateMapping.mappings[0]), id: "t029-fictional-duplicate-mapping" });
await assert.rejects(() => diffImportedPreview(parsedFixture, t029DuplicateMapping), (error) => error?.code === "IMPORT_DIFF_DUPLICATE_ID", "T029-O02 duplicate current source-person mapping must fail closed");

const t029OtherSourceId = "t029-fictional-other-source";
const t029OtherSource = { id: t029OtherSourceId, state: "active", displayName: "纯虚构其他来源" };
const t029ExcerptOwnerCollision = structuredClone(importedGraph);
t029ExcerptOwnerCollision.sources.push(t029OtherSource);
t029ExcerptOwnerCollision.excerpts = t029ExcerptOwnerCollision.excerpts.filter((item) => item.id !== t029ContentId);
t029ExcerptOwnerCollision.excerpts.push({ ...structuredClone(importedGraph.excerpts.find((item) => item.id === t029ContentId)), sourceId: t029OtherSourceId });
const t029ExcerptOwnerBefore = structuredClone(t029ExcerptOwnerCollision);
const t029ExcerptOwnerDiff = await diffImportedPreview(parsedFixture, t029ExcerptOwnerCollision);
assert.equal(t029ExcerptOwnerDiff.conflicts.includes(t029ContentId), true, "T029-O03 cross-source excerpt stable-ID ownership collision must be conflict-only");
assert.equal(t029ExcerptOwnerDiff.added.includes(t029ContentId) || t029ExcerptOwnerDiff.updated.includes(t029ContentId), false, "T029-O03 owned excerpt collision must not be added/updated");
assert.deepEqual(t029ExcerptOwnerCollision, t029ExcerptOwnerBefore, "T029-O03 ownership diff must be read-only");

const t029MomentId = parsedFixture.moments[0].contentId;
const t029SignalOwnerCollision = structuredClone(importedGraph);
t029SignalOwnerCollision.sources.push(t029OtherSource);
t029SignalOwnerCollision.signals = t029SignalOwnerCollision.signals.filter((item) => item.id !== t029MomentId);
t029SignalOwnerCollision.signals.push({ ...structuredClone(importedGraph.signals.find((item) => item.id === t029MomentId)), sourceId: t029OtherSourceId });
const t029SignalOwnerDiff = await diffImportedPreview(parsedFixture, t029SignalOwnerCollision);
assert.equal(t029SignalOwnerDiff.conflicts.includes(t029MomentId), true, "T029-O03 cross-source signal stable-ID ownership collision must be conflict-only");
assert.equal(t029SignalOwnerDiff.added.includes(t029MomentId) || t029SignalOwnerDiff.updated.includes(t029MomentId), false, "T029-O03 owned signal collision must not be added/updated");

const t029CrossKindCollision = structuredClone(importedGraph);
t029CrossKindCollision.sources.push(t029OtherSource);
t029CrossKindCollision.excerpts = t029CrossKindCollision.excerpts.filter((item) => item.id !== t029ContentId);
t029CrossKindCollision.signals.push({ id: t029ContentId, sourceId: t029OtherSourceId, personId: importedGraph.people[0].id, status: "pending", text: "纯虚构跨类型碰撞", mediaDescription: "", publishedAt: 1, time: "2026-08-19 10:00:00" });
const t029CrossKindDiff = await diffImportedPreview(parsedFixture, t029CrossKindCollision);
assert.equal(t029CrossKindDiff.conflicts.includes(t029ContentId), true, "T029-O03 cross-kind stable-ID ownership collision must be conflict-only");
assert.equal(t029CrossKindDiff.added.includes(t029ContentId) || t029CrossKindDiff.updated.includes(t029ContentId), false, "T029-O03 cross-kind collision must not be added/updated");

assert.deepEqual(validateLocalImportConfirmation(t029ReceiptFixture, t029EnrichmentDiff), t029ReceiptFixture.receipt, "T029-O05 current zero-conflict preview must pass the domain guard");
let t029ConflictError;
try { validateLocalImportConfirmation(t029ReceiptFixture, t029TrueConflictDiff); } catch (error) { t029ConflictError = error; }
assert.equal(t029ConflictError?.code, "IMPORT_CONFLICTS_UNRESOLVED", "T029-O05 direct domain bypass must be rejected");
assert.equal(t029ConflictError?.conflictCount, 1);
assert.equal(JSON.stringify(t029ConflictError).includes(t029ContentId), false, "T029-O05 domain error may expose aggregate count only");
assert.throws(() => validateLocalImportConfirmation(t029ReceiptFixture, t029ExcerptOwnerDiff), (error) => error?.code === "IMPORT_CONFLICTS_UNRESOLVED", "T029-O05 ownership collision must reach the typed domain guard before any generic schema/write path");
assert.throws(() => validateLocalImportConfirmation({ ...t029ReceiptFixture, receipt: { batchName: "../private", selectedAt: t029FixtureSelectedAt, exportedAt: null } }, t029EnrichmentDiff), (error) => error?.code === "IMPORT_RECEIPT_INVALID", "T029-O07 invalid receipt must fail before graph build");

const t029UnsafeRoot = fixtureHandle();
t029UnsafeRoot.root.name = "C:\\PRIVATE_CANARY\\output_53365692";
const t029UnsafePreview = await parseWechatExportToolkit(t029UnsafeRoot.root, { sourceBundleRevision: SOURCE_BUNDLE_REVISION, selectedAt: t029FixtureSelectedAt });
assert.equal(t029UnsafePreview.error?.code, "IMPORT_RECEIPT_INVALID", "T029-O07 full path-shaped root name must fail closed");
assert.equal(JSON.stringify(t029UnsafePreview).includes("PRIVATE_CANARY"), false, "T029-O07 receipt error must not echo path canary");
assert.equal(JSON.stringify(t029ReceiptFixture).includes("DirectoryHandle"), false, "T029-O07 transient preview must not serialize a handle");
assert.deepEqual(createImportBatchReceipt("  output_53365692  ", { selectedAt: t029FixtureSelectedAt }), { batchName: "output_53365692", selectedAt: t029FixtureSelectedAt, exportedAt: null });
for (const bidiControl of ["\u061C", "\u200E", "\u200F", "\u202A", "\u202B", "\u202C", "\u202D", "\u202E", "\u2066", "\u2067", "\u2068", "\u2069"]) {
  assert.throws(
    () => createImportBatchReceipt(`safe${bidiControl}bad`, { selectedAt: t029FixtureSelectedAt }),
    (error) => error?.code === "IMPORT_RECEIPT_INVALID",
    `T029-O07 bidi control U+${bidiControl.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")} must fail closed`,
  );
}
for (const zeroWidthControl of ["\u180E", "\u2061", "\u2062", "\u2063", "\u2064"]) {
  assert.throws(
    () => createImportBatchReceipt(`safe${zeroWidthControl}bad`, { selectedAt: t029FixtureSelectedAt }),
    (error) => error?.code === "IMPORT_RECEIPT_INVALID",
    `T029-O07 zero-width control U+${zeroWidthControl.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")} must fail closed`,
  );
}

const t029ReceiptBackup = await createBackup(t029ReceiptGraph, "fictional t029 receipt backup", { now: t029CommittedAt });
const t029ReceiptAdapter = createMemoryVaultAdapter();
const t029ReceiptKey = await generateVaultKey();
await commitGraph(t029ReceiptAdapter, importedGraph, t029ReceiptKey, { now: t029CommittedAt });
await restoreBackup(t029ReceiptAdapter, t029ReceiptKey, t029ReceiptBackup, "fictional t029 receipt backup", { now: "2026-08-19T10:31:00.000Z" });
const t029ReopenedReceipt = (await loadActiveGraph(t029ReceiptAdapter, t029ReceiptKey)).sources[0];
assert.deepEqual(Object.fromEntries(["batchName", "selectedAt", "importedAt", "exportedAt"].map((field) => [field, t029ReopenedReceipt[field]])), { batchName: "wechat-export-toolkit-fictional", selectedAt: t029FixtureSelectedAt, importedAt: t029CommittedAt, exportedAt: null }, "T029-O08 backup/restore/reopen must preserve exact quartet");

const t029ForgedExportedAtGraph = structuredClone(t029ReceiptGraph);
t029ForgedExportedAtGraph.sources[0].exportedAt = "2026-08-19T09:59:59.000Z";
await assert.rejects(
  () => createBackup(t029ForgedExportedAtGraph, "fictional t029 forged export-time backup", { now: t029CommittedAt }),
  (error) => error?.code === "RELATIONSHIP_SCHEMA_INVALID",
  "T029-O08 current canonical exporter must reject forged non-null exportedAt before backup",
);
const t029ForgedExportedAtBackup = await encryptBackupFixture({ version: 2, createdAt: t029CommittedAt, mode: "complete-replace", graph: t029ForgedExportedAtGraph }, "fictional t029 forged export-time restore");
const t029BeforeForgedExportRestore = t029ReceiptAdapter.dump();
await assert.rejects(
  () => restoreBackup(t029ReceiptAdapter, t029ReceiptKey, t029ForgedExportedAtBackup, "fictional t029 forged export-time restore", { now: "2026-08-19T10:31:30.000Z" }),
  /invalid-backup-graph/,
  "T029-O08 encrypted restore must reject forged non-null exportedAt for the current canonical exporter",
);
assert.deepEqual(t029ReceiptAdapter.dump(), t029BeforeForgedExportRestore, "T029-O08 rejected forged export time must preserve the active graph and generation with zero writes");

const t029UnknownRevisionExportedAtGraph = structuredClone(t029ReceiptGraph);
t029UnknownRevisionExportedAtGraph.sources[0].sourceBundleRevision = "t029-fictional-unknown-exporter-revision";
t029UnknownRevisionExportedAtGraph.sources[0].exportedAt = "2026-08-19T09:58:58.000Z";
await assert.rejects(
  () => createBackup(t029UnknownRevisionExportedAtGraph, "fictional t029 unknown revision export-time backup", { now: t029CommittedAt }),
  (error) => error?.code === "RELATIONSHIP_SCHEMA_INVALID",
  "T029-O08 unknown exporter revision must not establish authority for non-null exportedAt",
);
const t029UnknownRevisionExportedAtBackup = await encryptBackupFixture({ version: 2, createdAt: t029CommittedAt, mode: "complete-replace", graph: t029UnknownRevisionExportedAtGraph }, "fictional t029 unknown revision export-time restore");
const t029BeforeUnknownRevisionRestore = t029ReceiptAdapter.dump();
await assert.rejects(
  () => restoreBackup(t029ReceiptAdapter, t029ReceiptKey, t029UnknownRevisionExportedAtBackup, "fictional t029 unknown revision export-time restore", { now: "2026-08-19T10:31:45.000Z" }),
  /invalid-backup-graph/,
  "T029-O08 encrypted restore must reject unknown revision non-null exportedAt without an explicit trusted allowlist",
);
assert.deepEqual(t029ReceiptAdapter.dump(), t029BeforeUnknownRevisionRestore, "T029-O08 rejected unknown revision export time must preserve active graph and generation with zero writes");

const t029PartialReceiptGraph = structuredClone(t029ReceiptGraph);
delete t029PartialReceiptGraph.sources[0].selectedAt;
await assert.rejects(() => createBackup(t029PartialReceiptGraph, "fictional t029 invalid backup", { now: t029CommittedAt }), (error) => error?.code === "RELATIONSHIP_SCHEMA_INVALID", "T029-O08 any new receipt evidence requires the complete strict quartet");
const t029InvalidBackup = await encryptBackupFixture({ version: 2, createdAt: t029CommittedAt, mode: "complete-replace", graph: t029PartialReceiptGraph }, "fictional t029 invalid restore");
const t029BeforeRejectedRestore = t029ReceiptAdapter.dump();
await assert.rejects(() => restoreBackup(t029ReceiptAdapter, t029ReceiptKey, t029InvalidBackup, "fictional t029 invalid restore", { now: "2026-08-19T10:32:00.000Z" }), /invalid-backup-graph/, "T029-O08 partial quartet restore must fail closed");
assert.deepEqual(t029ReceiptAdapter.dump(), t029BeforeRejectedRestore, "T029-O08 rejected receipt restore must preserve active graph/generation");

const t029LegacyReceiptSource = importedGraph.sources[0];
assert.equal(["batchName", "selectedAt", "importedAt", "exportedAt"].some((field) => Object.hasOwn(t029LegacyReceiptSource, field)), false, "T029-O09 legacy graph open must not migrate receipt fields");
assert.equal(describeSourceReceipt(t029LegacyReceiptSource).batchNameLabel, "批次未记录");

// T030-O02..O05 legal RED.  The receipt, preview, identifiers and content in
// this block are code-authored fiction.  No picker, real export, MCP, IDB or
// private DOM is opened.  The validator/projector are deliberately public
// pure seams so graph, backup and UI callers cannot each invent a shape.
const T030_COVERAGE_METRIC_KEYS = Object.freeze([
  "friends",
  "directConversations",
  "directMessages",
  "groupConversations",
  "groupMessages",
  "moments",
]);
const t030Metric = (value, state, reason) => ({ value, state, ...(reason ? { reason } : {}) });
const t030Exact = (value) => t030Metric(value, "exact");
const t030Partial = (value) => t030Metric(value, "partial");
const t030Unknown = () => t030Metric(null, "legacy-unknown");
const t030Unsupported = () => t030Metric(null, "upstream-unsupported");
const t030Blocked = (reason) => t030Metric(null, "blocked", reason);
const t030ExactMetrics = (values) => Object.fromEntries(T030_COVERAGE_METRIC_KEYS.map((key) => [key, t030Exact(values[key])]));

const t030FiveStateReceipt = {
  version: 1,
  scopeKind: "wechat-export-batch-v1",
  scopeComplete: false,
  metrics: {
    friends: t030Exact(4),
    directConversations: t030Partial(2),
    directMessages: t030Unknown(),
    groupConversations: t030Unsupported(),
    groupMessages: t030Blocked("LOCAL_COVERAGE_RECEIPT_INCOMPLETE"),
    moments: t030Exact(0),
  },
  observedDirectParticipantCount: 2,
  excludedCount: 1,
};
const t030FiveStateBefore = structuredClone(t030FiveStateReceipt);
const t030ValidatedFiveState = validateCoverageReceipt(t030FiveStateReceipt);
assert.deepEqual(t030FiveStateReceipt, t030FiveStateBefore, "T030-O02 strict coverage validation must not mutate its input");
assert.deepEqual(Object.keys(t030ValidatedFiveState.metrics), T030_COVERAGE_METRIC_KEYS, "T030-O02 validator must preserve the one canonical metric order");
assert.deepEqual(new Set(Object.values(t030ValidatedFiveState.metrics).map((metric) => metric.state)), new Set(["exact", "partial", "legacy-unknown", "upstream-unsupported", "blocked"]), "T030-O02 all five mutually-exclusive states must remain representable");

const t030PersonaCompleteReceipt = {
  version: 1,
  scopeKind: "suiyin-persona-complete-v1",
  scopeComplete: true,
  metrics: t030ExactMetrics({ friends: 2, directConversations: 2, directMessages: 5, groupConversations: 1, groupMessages: 3, moments: 2 }),
  perPersona: [
    { officialLabel: "虚构官方人设甲", metrics: t030ExactMetrics({ friends: 1, directConversations: 1, directMessages: 3, groupConversations: 1, groupMessages: 2, moments: 1 }) },
    { officialLabel: "虚构官方人设乙", metrics: t030ExactMetrics({ friends: 1, directConversations: 1, directMessages: 2, groupConversations: 0, groupMessages: 1, moments: 1 }) },
    { officialLabel: "虚构官方人设丙", metrics: t030ExactMetrics({ friends: 1, directConversations: 1, directMessages: 1, groupConversations: 0, groupMessages: 0, moments: 0 }) },
  ],
};
assert.deepEqual(validateCoverageReceipt(t030PersonaCompleteReceipt), t030PersonaCompleteReceipt, "T030-O02 strict validator must accept the safe per-persona receipt without summing aggregate friends");

const t030ExpectCoverageInvalid = (caseName, poison, baseReceipt = t030FiveStateReceipt) => {
  const receipt = structuredClone(baseReceipt);
  poison(receipt);
  const before = structuredClone(receipt);
  assert.throws(
    () => validateCoverageReceipt(receipt),
    (error) => error?.code === "COVERAGE_RECEIPT_INVALID",
    `T030-O02 ${caseName} must fail closed with the typed coverage error`,
  );
  assert.deepEqual(receipt, before, `T030-O02 ${caseName} rejection must not mutate its input`);
};

for (const [caseName, poison] of [
  ["missing metric key", (receipt) => { delete receipt.metrics.friends; }],
  ["extra metric key", (receipt) => { receipt.metrics.totalMessages = t030Exact(9); }],
  ["wrong metric order", (receipt) => { receipt.metrics = { moments: receipt.metrics.moments, ...Object.fromEntries(Object.entries(receipt.metrics).filter(([key]) => key !== "moments")) }; }],
  ["unknown receipt field", (receipt) => { receipt.rawSourceId = "FICTIONAL_T030_PRIVATE_SOURCE_ID"; }],
  ["unknown metric field", (receipt) => { receipt.metrics.friends.rawCount = 4; }],
  ["wrong version", (receipt) => { receipt.version = 2; }],
  ["unknown scope", (receipt) => { receipt.scopeKind = "tenant-wide-guessed-v1"; }],
  ["non-boolean scope completeness", (receipt) => { receipt.scopeComplete = "false"; }],
  ["negative observed participants", (receipt) => { receipt.observedDirectParticipantCount = -1; }],
  ["fractional excluded count", (receipt) => { receipt.excludedCount = 0.5; }],
  ["exact without a number", (receipt) => { receipt.metrics.friends.value = null; }],
  ["partial without a number", (receipt) => { receipt.metrics.directConversations.value = null; }],
  ["legacy unknown with a number", (receipt) => { receipt.metrics.directMessages.value = 0; }],
  ["unsupported with a number", (receipt) => { receipt.metrics.groupConversations.value = 0; }],
  ["blocked with a number", (receipt) => { receipt.metrics.groupMessages.value = 0; }],
  ["negative metric", (receipt) => { receipt.metrics.moments.value = -1; }],
  ["fractional metric", (receipt) => { receipt.metrics.moments.value = 1.5; }],
  ["unknown state", (receipt) => { receipt.metrics.moments.state = "unknown"; receipt.metrics.moments.value = null; }],
  ["unsafe reason", (receipt) => { receipt.metrics.groupMessages.reason = "raw response: FICTIONAL_T030_PRIVATE_BODY"; }],
  ["raw per-persona field", (receipt) => { receipt.perPersona = [{ officialLabel: "虚构官方人设甲", clientId: "FICTIONAL_T030_PRIVATE_CLIENT_ID", metrics: t030ExactMetrics({ friends: 0, directConversations: 0, directMessages: 0, groupConversations: 0, groupMessages: 0, moments: 0 }) }]; }],
]) t030ExpectCoverageInvalid(caseName, poison);

const t030PrivateCanary = "FICTIONAL_T030_PRIVATE_SOURCE_NAME_BODY_PATH_TOKEN";
const t030LegacySource = {
  id: "FICTIONAL_T030_PRIVATE_SOURCE_ID",
  state: "active",
  displayName: t030PrivateCanary,
  sourceKind: "wechat-export-toolkit",
  conversationCount: 999,
  messageCount: 999,
  momentCount: 999,
};
const t030LegacySourceBefore = structuredClone(t030LegacySource);
const t030LegacyProjection = projectSourceCoverageReceipt(t030LegacySource);
assert.deepEqual(t030LegacySource, t030LegacySourceBefore, "T030-O05 legacy projector must be read-only");
assert.deepEqual(Object.keys(t030LegacyProjection.metrics), T030_COVERAGE_METRIC_KEYS, "T030-O02/O05 legacy projector must return the canonical six keys");
assert.equal(Object.values(t030LegacyProjection.metrics).every((metric) => metric.state === "legacy-unknown" && metric.value === null), true, "T030-O05 legacy totals must project as unknown/null rather than guessed zeros");
assert.equal(JSON.stringify(t030LegacyProjection).includes(t030PrivateCanary), false, "T030-O05 legacy public projection must not echo source names, bodies, paths or tokens");

const t030HashId = (character) => character.repeat(64);
const t030WechatPreview = structuredClone(t029ReceiptFixture);
t030WechatPreview.conversations = [
  { talker: "fictional-t030-direct-a", displayName: "纯虚构单聊甲", isGroup: false, messageCount: 2, file: "fictional-t030-direct-a.json" },
  { talker: "fictional-t030-direct-b", displayName: "纯虚构单聊乙", isGroup: false, messageCount: 1, file: "fictional-t030-direct-b.json" },
  { talker: "fictional-t030-group-a", displayName: "纯虚构群甲", isGroup: true, messageCount: 2, file: "fictional-t030-group-a.json" },
];
t030WechatPreview.messages = [
  { contentId: t030HashId("1"), conversationId: t030HashId("A"), sourcePersonId: t030HashId("D"), displayName: "纯虚构单聊甲", timestamp: 1787200001, conversationKind: "direct", direction: "counterparty", thirdParty: false, kind: "chat-text", text: "纯虚构单聊甲第一条" },
  { contentId: t030HashId("2"), conversationId: t030HashId("A"), sourcePersonId: t030HashId("D"), displayName: "纯虚构单聊甲", timestamp: 1787200002, conversationKind: "direct", direction: "self", thirdParty: false, kind: "chat-text", text: "纯虚构单聊甲第二条" },
  { contentId: t030HashId("3"), conversationId: t030HashId("B"), sourcePersonId: t030HashId("E"), displayName: "纯虚构单聊乙", timestamp: 1787200003, conversationKind: "direct", direction: "counterparty", thirdParty: false, kind: "chat-text", text: "纯虚构单聊乙第一条" },
  { contentId: t030HashId("4"), conversationId: t030HashId("C"), sourcePersonId: t030HashId("F"), displayName: "纯虚构群成员甲", timestamp: 1787200004, conversationKind: "group", direction: "counterparty", thirdParty: true, kind: "chat-text", text: "纯虚构群消息第一条" },
  { contentId: t030HashId("5"), conversationId: t030HashId("C"), sourcePersonId: t030HashId("0"), displayName: "纯虚构群成员乙", timestamp: 1787200005, conversationKind: "group", direction: "counterparty", thirdParty: true, kind: "chat-text", text: "纯虚构群消息第二条" },
];
t030WechatPreview.moments = [
  { contentId: t030HashId("6"), sourcePersonId: t030HashId("8"), name: "纯虚构动态甲", publishedAt: 1787200101, time: "2026-08-20 08:01:41", body: "纯虚构朋友圈第一条", mediaDescription: "0 个媒体项目（未打开）" },
  { contentId: t030HashId("7"), sourcePersonId: t030HashId("9"), name: "纯虚构动态乙", publishedAt: 1787200102, time: "2026-08-20 08:01:42", body: "纯虚构朋友圈第二条", mediaDescription: "1 个媒体项目（未打开）" },
];
t030WechatPreview.warnings = [{ code: "senderless-group-context-excluded", count: 1 }];
t030WechatPreview.conversationCrossChecks = 3;
const t030ExpectedWechatCoverage = {
  version: 1,
  scopeKind: "wechat-export-batch-v1",
  scopeComplete: false,
  metrics: {
    friends: t030Blocked("WECHAT_ROSTER_NOT_PROVIDED"),
    directConversations: t030Exact(2),
    directMessages: t030Exact(3),
    groupConversations: t030Exact(1),
    groupMessages: t030Exact(2),
    moments: t030Exact(2),
  },
  observedDirectParticipantCount: 2,
  excludedCount: 1,
};
const t030CommittedAt = "2026-08-20T08:30:00.000Z";
const t030WechatGraph = buildImportedGraph(t030WechatPreview, null, { importedAt: t030CommittedAt });
const t030WechatSource = t030WechatGraph.sources.find((source) => source.id === t030WechatPreview.source.sourceId);
assert.deepEqual(t030WechatSource?.coverageReceipt, t030ExpectedWechatCoverage, "T030-O03/O04 canonical WeChat direct/group conversations/messages and present moments must persist one exact/blocked receipt");
assert.deepEqual(projectSourceCoverageReceipt(t030WechatSource).metrics, t030ExpectedWechatCoverage.metrics, "T030-O02/O04 saved WeChat coverage must project without unit drift");

const t030NoMomentsPreview = structuredClone(t030WechatPreview);
t030NoMomentsPreview.moments = [];
t030NoMomentsPreview.warnings.push({ code: "moments-not-provided" });
const t030NoMomentsGraph = buildImportedGraph(t030NoMomentsPreview, null, { importedAt: "2026-08-20T08:31:00.000Z" });
const t030NoMomentsCoverage = t030NoMomentsGraph.sources.find((source) => source.id === t030NoMomentsPreview.source.sourceId)?.coverageReceipt;
assert.deepEqual(t030NoMomentsCoverage?.metrics?.moments, t030Blocked("WECHAT_MOMENTS_NOT_PROVIDED"), "T030-O04 an absent optional moments file must be blocked/null rather than exact zero");
assert.equal(t030NoMomentsCoverage?.metrics?.directMessages?.value, 3, "T030-O04 an absent moments file must not erase canonical direct-message coverage");

const t030GenerationAdapter = createMemoryVaultAdapter();
const t030GenerationKey = await generateVaultKey();
await commitGraph(t030GenerationAdapter, t030WechatGraph, t030GenerationKey, { now: t030CommittedAt });
assert.equal(t030GenerationAdapter.writeCount, 1, "T030-O05 source/content/coverage must commit as one generation write");
const t030ReopenedGeneration = await loadActiveGraph(t030GenerationAdapter, t030GenerationKey);
assert.deepEqual(t030ReopenedGeneration.sources.find((source) => source.id === t030WechatPreview.source.sourceId)?.coverageReceipt, t030ExpectedWechatCoverage, "T030-O05 active generation must reopen with the exact coverage receipt");
assert.equal(t030ReopenedGeneration.excerpts.filter((item) => item.sourceId === t030WechatPreview.source.sourceId).length, 5, "T030-O05 the same active generation must contain the five canonical message rows");
assert.equal(t030ReopenedGeneration.signals.filter((item) => item.sourceId === t030WechatPreview.source.sourceId).length, 2, "T030-O05 the same active generation must contain the two canonical moments rows");

const t030LegacyGraph = structuredClone(t030WechatGraph);
delete t030LegacyGraph.sources.find((source) => source.id === t030WechatPreview.source.sourceId).coverageReceipt;
const t030LegacyAdapter = createMemoryVaultAdapter();
const t030LegacyKey = await generateVaultKey();
await commitGraph(t030LegacyAdapter, t030LegacyGraph, t030LegacyKey, { now: "2026-08-20T08:32:00.000Z" });
const t030LegacyDumpBeforeProjection = t030LegacyAdapter.dump();
const t030ReopenedLegacyGraph = await loadActiveGraph(t030LegacyAdapter, t030LegacyKey);
const t030ReopenedLegacyBeforeProjection = structuredClone(t030ReopenedLegacyGraph);
const t030ReopenedLegacyProjection = projectSourceCoverageReceipt(t030ReopenedLegacyGraph.sources.find((source) => source.id === t030WechatPreview.source.sourceId));
assert.equal(Object.values(t030ReopenedLegacyProjection.metrics).every((metric) => metric.state === "legacy-unknown" && metric.value === null), true, "T030-O05 reopened legacy graph must project six unknown/null metrics");
assert.deepEqual(t030ReopenedLegacyGraph, t030ReopenedLegacyBeforeProjection, "T030-O05 legacy projection must not migrate the in-memory graph");
assert.deepEqual(t030LegacyAdapter.dump(), t030LegacyDumpBeforeProjection, "T030-O05 ordinary legacy reopen/project must perform zero storage writes");

const t030Backup = await createBackup(t030WechatGraph, "fictional t030 coverage backup phrase", { now: t030CommittedAt });
const t030RestoreAdapter = createMemoryVaultAdapter();
const t030RestoreKey = await generateVaultKey();
await commitGraph(t030RestoreAdapter, t030LegacyGraph, t030RestoreKey, { now: "2026-08-20T08:33:00.000Z" });
await restoreBackup(t030RestoreAdapter, t030RestoreKey, t030Backup, "fictional t030 coverage backup phrase", { now: "2026-08-20T08:34:00.000Z" });
const t030RestoredGraph = await loadActiveGraph(t030RestoreAdapter, t030RestoreKey);
assert.deepEqual(t030RestoredGraph.sources.find((source) => source.id === t030WechatPreview.source.sourceId)?.coverageReceipt, t030ExpectedWechatCoverage, "T030-O05 strict backup/restore must round-trip the coverage receipt");

const t030IllegalCoverageGraph = structuredClone(t030WechatGraph);
t030IllegalCoverageGraph.sources.find((source) => source.id === t030WechatPreview.source.sourceId).coverageReceipt.metrics.friends.value = 2;
await assert.rejects(
  () => createBackup(t030IllegalCoverageGraph, "fictional t030 illegal coverage backup", { now: t030CommittedAt }),
  (error) => error?.code === "RELATIONSHIP_SCHEMA_INVALID",
  "T030-O02/O05 backup creation must reject an illegal blocked/value receipt before encryption",
);
const t030IllegalCoverageBackup = await encryptBackupFixture({ version: 2, createdAt: t030CommittedAt, mode: "complete-replace", graph: minimizeGraph(t030IllegalCoverageGraph) }, "fictional t030 illegal coverage restore");
const t030RestoreBeforeIllegalReceipt = t030RestoreAdapter.dump();
await assert.rejects(
  () => restoreBackup(t030RestoreAdapter, t030RestoreKey, t030IllegalCoverageBackup, "fictional t030 illegal coverage restore", { now: "2026-08-20T08:35:00.000Z" }),
  /invalid-backup-graph/,
  "T030-O02/O05 encrypted restore must reject an illegal coverage receipt",
);
assert.deepEqual(t030RestoreAdapter.dump(), t030RestoreBeforeIllegalReceipt, "T030-O05 rejected coverage restore must preserve the prior active generation with zero writes");

// T031-O01..O08 legal RED.  Everything below is code-authored fiction: no
// picker, exporter, IndexedDB, MCP, network or private DOM is opened.  The
// public query is intentionally pinned to safe labels plus session/generation
// opaque tokens; every raw identifier remains an internal graph detail.
const t031WechatSourceId = "T031_PRIVATE_WECHAT_SOURCE_CANARY";
const t031SuiyinSourceId = "T031_PRIVATE_SUIYIN_SOURCE_CANARY";
const t031BlockedSuiyinSourceId = "T031_PRIVATE_BLOCKED_SUIYIN_SOURCE_CANARY";
const t031InactiveSourceId = "T031_PRIVATE_INACTIVE_SOURCE_CANARY";
const t031UntrustedSourceId = "T031_PRIVATE_UNTRUSTED_SOURCE_CANARY";
const t031WechatPersonId = "T031_PRIVATE_WECHAT_PERSON_CANARY";
const t031WechatPendingPersonId = "T031_PRIVATE_WECHAT_PENDING_PERSON_CANARY";
const t031SuiyinPersonId = "T031_PRIVATE_SUIYIN_PERSON_CANARY";
const t031BlockedSuiyinPersonId = "T031_PRIVATE_BLOCKED_SUIYIN_PERSON_CANARY";
const t031InactivePersonId = "T031_PRIVATE_INACTIVE_PERSON_CANARY";
const t031UntrustedPersonId = "T031_PRIVATE_UNTRUSTED_PERSON_CANARY";
const t031SuiyinAlias = "SY-31000001";
const t031GenerationA = "T031_PRIVATE_GENERATION_ALPHA";
const t031GenerationB = "T031_PRIVATE_GENERATION_BETA";
const t031RawEpoch = 1787200001;
const t031CoverageLabels = ["虚构官方人设甲", "虚构官方人设乙", "虚构官方人设丙"];
const t031CoveragePerPersona = t031CoverageLabels.map((officialLabel) => ({
  officialLabel,
  metrics: t030ExactMetrics({ friends: 1, directConversations: 1, directMessages: 1, groupConversations: 0, groupMessages: 0, moments: 1 }),
}));
const t031SuiyinCoverage = {
  version: 1,
  scopeKind: "suiyin-persona-complete-v1",
  scopeComplete: true,
  metrics: t030ExactMetrics({ friends: 3, directConversations: 3, directMessages: 3, groupConversations: 0, groupMessages: 0, moments: 3 }),
  excludedCount: 0,
  perPersona: t031CoveragePerPersona,
};
const t031BlockedSuiyinCoverage = structuredClone(t031SuiyinCoverage);
t031BlockedSuiyinCoverage.metrics.moments = t030Blocked("LOCAL_SUIYIN_MOMENTS_MAPPING_INCOMPLETE");
t031BlockedSuiyinCoverage.perPersona = t031BlockedSuiyinCoverage.perPersona.map((persona) => ({ ...persona, metrics: { ...persona.metrics, moments: t030Blocked("LOCAL_SUIYIN_MOMENTS_MAPPING_INCOMPLETE") } }));

const t031Sources = [
  { id: t031WechatSourceId, state: "active", sourceKind: "wechat-export-toolkit", sourceBundleRevision: SOURCE_BUNDLE_REVISION, displayName: "T031_PRIVATE_WECHAT_DISPLAY_CANARY" },
  { id: t031SuiyinSourceId, state: "active", sourceKind: "suiyin-mcp", displayName: "T031_PRIVATE_SUIYIN_DISPLAY_CANARY", sourceAccountLabels: { "SY-31000001": t031CoverageLabels[0], "SY-31000002": t031CoverageLabels[1], "SY-31000003": t031CoverageLabels[2] }, coverageReceipt: t031SuiyinCoverage },
  { id: t031BlockedSuiyinSourceId, state: "active", sourceKind: "suiyin-mcp", displayName: "T031_PRIVATE_BLOCKED_DISPLAY_CANARY", sourceAccountLabels: { "SY-31000001": t031CoverageLabels[0], "SY-31000002": t031CoverageLabels[1], "SY-31000003": t031CoverageLabels[2] }, coverageReceipt: t031BlockedSuiyinCoverage },
  { id: t031InactiveSourceId, state: "removed", sourceKind: "wechat-export-toolkit", sourceBundleRevision: SOURCE_BUNDLE_REVISION, displayName: "T031_PRIVATE_INACTIVE_DISPLAY_CANARY" },
  { id: t031UntrustedSourceId, state: "active", sourceKind: "fictional-untrusted", displayName: "T031_PRIVATE_UNTRUSTED_DISPLAY_CANARY" },
];
const t031People = [
  { id: t031WechatPersonId, name: "纯虚构微信发布者", state: "active", sourceScoped: true },
  { id: t031WechatPendingPersonId, name: "纯虚构微信待确认发布者", state: "pending", sourceScoped: true },
  { id: t031SuiyinPersonId, name: "纯虚构碎银发布者", state: "active", sourceScoped: true },
  { id: t031BlockedSuiyinPersonId, name: "纯虚构受阻碎银发布者", state: "active", sourceScoped: true },
  { id: t031InactivePersonId, name: "纯虚构失效发布者", state: "active", sourceScoped: true },
  { id: t031UntrustedPersonId, name: "纯虚构不可信发布者", state: "active", sourceScoped: true },
];
const t031Mappings = [
  { id: "t031-map-wechat-confirmed", sourceId: t031WechatSourceId, sourcePersonId: t031WechatPersonId, personId: t031WechatPersonId, sourceDisplayName: "纯虚构微信发布者", sourceAccountAliases: [], status: "confirmed" },
  { id: "t031-map-wechat-pending", sourceId: t031WechatSourceId, sourcePersonId: t031WechatPendingPersonId, personId: t031WechatPendingPersonId, sourceDisplayName: "纯虚构微信待确认发布者", sourceAccountAliases: [], status: "pending" },
  { id: "t031-map-suiyin-confirmed", sourceId: t031SuiyinSourceId, sourcePersonId: t031SuiyinPersonId, personId: t031SuiyinPersonId, sourceDisplayName: "纯虚构碎银发布者", sourceAccountAliases: [t031SuiyinAlias], status: "confirmed" },
  { id: "t031-map-suiyin-blocked", sourceId: t031BlockedSuiyinSourceId, sourcePersonId: t031BlockedSuiyinPersonId, personId: t031BlockedSuiyinPersonId, sourceDisplayName: "纯虚构受阻碎银发布者", sourceAccountAliases: [t031SuiyinAlias], status: "confirmed" },
  { id: "t031-map-inactive", sourceId: t031InactiveSourceId, sourcePersonId: t031InactivePersonId, personId: t031InactivePersonId, sourceDisplayName: "纯虚构失效发布者", sourceAccountAliases: [], status: "confirmed" },
  { id: "t031-map-untrusted", sourceId: t031UntrustedSourceId, sourcePersonId: t031UntrustedPersonId, personId: t031UntrustedPersonId, sourceDisplayName: "纯虚构不可信发布者", sourceAccountAliases: [], status: "confirmed" },
];
const t031WechatCanonicalSignalId = "T031_PRIVATE_SIGNAL_WECHAT_CANONICAL";
const t031WechatLegacySignalId = "T031_PRIVATE_SIGNAL_WECHAT_LEGACY";
const t031SuiyinCanonicalSignalId = "T031_PRIVATE_SIGNAL_SUIYIN_CANONICAL";
const t031InvalidTimeSignalId = "T031_PRIVATE_SIGNAL_INVALID_TIME";
const t031Signals = [
  { id: t031WechatCanonicalSignalId, sourceId: t031WechatSourceId, personId: t031WechatPersonId, kind: "moment", status: "topic-approved", text: "纯虚构共同检索词：微信正文", mediaDescription: "纯虚构微信媒体文字说明", publishedAt: "2026-08-20T01:02:03.000Z" },
  { id: t031WechatLegacySignalId, sourceId: t031WechatSourceId, personId: t031WechatPendingPersonId, status: "internal", text: "纯虚构 legacy 唯一词", mediaDescription: "纯虚构 legacy 媒体文字", publishedAt: t031RawEpoch, time: "T031_PRIVATE_RAW_TIME_CANARY" },
  { id: t031SuiyinCanonicalSignalId, sourceId: t031SuiyinSourceId, personId: t031SuiyinPersonId, sourceAccountAlias: t031SuiyinAlias, kind: "moment", status: "topic-approved", text: "纯虚构共同检索词：碎银正文", mediaDescription: "", publishedAt: "2026-08-20T02:03:04.000Z" },
  { id: t031InvalidTimeSignalId, sourceId: t031WechatSourceId, personId: t031WechatPersonId, kind: "moment", status: "sensitive", text: "", mediaDescription: "纯虚构仅媒体文字", publishedAt: "T031_PRIVATE_INVALID_TIME_CANARY" },
  { id: "T031_PRIVATE_SIGNAL_GROUP_CONTEXT", sourceId: t031SuiyinSourceId, kind: "group_context", status: "internal", thirdParty: true, contextId: "T031_PRIVATE_GROUP_CONTEXT_ID", contextLabel: "纯虚构群上下文", text: "T031_GROUP_CONTEXT_MUST_NEVER_ENTER_FEED", publishedAt: "2026-08-20T03:00:00.000Z" },
  { id: "T031_PRIVATE_SIGNAL_UNKNOWN_KIND", sourceId: t031WechatSourceId, personId: t031WechatPersonId, kind: "chat-message", status: "pending", text: "T031_UNKNOWN_KIND_MUST_NEVER_ENTER_FEED", publishedAt: "2026-08-20T03:01:00.000Z" },
  { id: "T031_PRIVATE_SIGNAL_INACTIVE", sourceId: t031InactiveSourceId, personId: t031InactivePersonId, kind: "moment", status: "pending", text: "T031_INACTIVE_MUST_NEVER_ENTER_FEED", publishedAt: "2026-08-20T03:02:00.000Z" },
  { id: "T031_PRIVATE_SIGNAL_UNTRUSTED", sourceId: t031UntrustedSourceId, personId: t031UntrustedPersonId, kind: "moment", status: "pending", text: "T031_UNTRUSTED_MUST_NEVER_ENTER_FEED", publishedAt: "2026-08-20T03:03:00.000Z" },
  { id: "T031_PRIVATE_SIGNAL_SUIYIN_LEGACY", sourceId: t031SuiyinSourceId, personId: t031SuiyinPersonId, sourceAccountAlias: t031SuiyinAlias, status: "pending", text: "T031_SUIYIN_LEGACY_MUST_NEVER_ENTER_FEED", publishedAt: "2026-08-20T03:04:00.000Z" },
  { id: "T031_PRIVATE_SIGNAL_SUIYIN_MISSING_ATTRIBUTION", sourceId: t031SuiyinSourceId, personId: t031SuiyinPersonId, kind: "moment", status: "pending", text: "T031_MISSING_ATTRIBUTION_MUST_NEVER_ENTER_FEED", publishedAt: "2026-08-20T03:05:00.000Z" },
  { id: "T031_PRIVATE_SIGNAL_SUIYIN_BLOCKED", sourceId: t031BlockedSuiyinSourceId, personId: t031BlockedSuiyinPersonId, sourceAccountAlias: t031SuiyinAlias, kind: "moment", status: "pending", text: "T031_BLOCKED_SOURCE_MUST_NEVER_ENTER_FEED", publishedAt: "2026-08-20T03:06:00.000Z" },
  { id: "T031_PRIVATE_SIGNAL_NO_PUBLISHER", sourceId: t031WechatSourceId, personId: "T031_PRIVATE_UNMAPPED_PERSON", kind: "moment", status: "pending", text: "T031_UNMAPPED_PUBLISHER_MUST_NEVER_ENTER_FEED", publishedAt: "2026-08-20T03:07:00.000Z" },
];
const t031MixedGraph = {
  owner: "t031-fictional-owner",
  settings: { schema: 2 },
  sources: t031Sources,
  people: t031People,
  excerpts: [{ id: "T031_PRIVATE_EXCERPT_ID", sourceId: t031WechatSourceId, personId: t031WechatPersonId, kind: "chat-text", text: "T031_EXCERPT_MUST_NEVER_ENTER_FEED", timestamp: "2026-08-20T03:08:00.000Z" }],
  mappings: t031Mappings,
  relationships: [], dictionary: [], signals: t031Signals, topics: [], notes: [], actions: [], trash: [], purgedPersonIds: [], identityDecisions: [],
};
const t031MixedBefore = structuredClone(t031MixedGraph);
const t031First = queryTrustedMoments(t031MixedGraph, { activeGenerationId: t031GenerationA, page: 1, pageSize: 500, sourceTokens: [], search: "", identity: "all", classification: "all" });
assert.equal(t031First.total, 4, "T031-O01 only canonical trusted moments and trusted kindless WeChat legacy may enter the feed");
assert.equal(t031First.items.length, 4);
assert.equal(t031First.pageSize, 50, "T031-O03/O04 domain page size must be bounded to 50");
assert.equal(t031First.page, 1);
assert.equal(typeof t031First.diagnostics?.baseProjectionComputeCount, "number", "T031-O04 query must expose only the safe aggregate base-projection counter for deterministic cache evidence");
const t031FirstProjectionCount = t031First.diagnostics.baseProjectionComputeCount;
assert.deepEqual(t031MixedGraph, t031MixedBefore, "T031-O01/O02 query/cache projection must not mutate or migrate the graph");

const t031ItemAllowed = new Set(["opaqueToken", "publisherLabel", "publishedAtLabel", "bodyLabel", "mediaDescriptionLabel", "sourceToken", "sourceLabel", "identityLabel", "classificationLabel", "classificationAllowed"]);
const t031ItemRequired = ["opaqueToken", "publisherLabel", "publishedAtLabel", "bodyLabel", "sourceToken", "sourceLabel", "identityLabel", "classificationLabel", "classificationAllowed"];
for (const item of t031First.items) {
  assert.equal(Object.keys(item).every((key) => t031ItemAllowed.has(key)), true, "T031-O02 public moment projection contains a non-allowlisted field");
  assert.equal(t031ItemRequired.every((key) => Object.hasOwn(item, key)), true, "T031-O02 public moment projection lost a required safe field");
  assert.match(item.opaqueToken, /^[A-Za-z0-9_-]{24,}$/, "T031-O02 action token must be opaque");
  assert.match(item.sourceToken, /^[A-Za-z0-9_-]{24,}$/, "T031-O02 source filter token must be opaque");
  assert.equal(item.publishedAtLabel === "时间未记录" || /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(item.publishedAtLabel), true, "T031-O02 public time must be formatted or explicitly unrecorded");
}
const t031WechatItem = t031First.items.find((item) => item.bodyLabel.includes("微信正文"));
const t031LegacyItem = t031First.items.find((item) => item.bodyLabel.includes("legacy"));
const t031SuiyinItem = t031First.items.find((item) => item.bodyLabel.includes("碎银正文"));
const t031InvalidTimeItem = t031First.items.find((item) => item.mediaDescriptionLabel === "纯虚构仅媒体文字");
assert.equal(t031WechatItem?.sourceLabel, "我的微信");
assert.equal(t031WechatItem?.publisherLabel, "纯虚构微信发布者");
assert.equal(t031WechatItem?.identityLabel, "身份已确认");
assert.equal(t031WechatItem?.classificationLabel, "可作为话题");
assert.equal(t031WechatItem?.classificationAllowed, true);
assert.equal(t031LegacyItem?.sourceLabel, "我的微信", "T031-O01 trusted kindless WeChat legacy must remain readable without graph migration");
assert.equal(t031LegacyItem?.identityLabel, "身份待确认");
assert.equal(t031LegacyItem?.classificationAllowed, false);
assert.match(t031LegacyItem?.publishedAtLabel || "", /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
assert.equal(t031SuiyinItem?.sourceLabel, `碎银 · ${t031CoverageLabels[0]}`, "T031-O02 source label must close from this moment's exact persona provenance");
assert.equal(t031InvalidTimeItem?.publishedAtLabel, "时间未记录");
assert.equal(t031InvalidTimeItem?.bodyLabel, "无文字");

const t031PublicJson = JSON.stringify(t031First);
for (const canary of [
  t031WechatSourceId, t031SuiyinSourceId, t031WechatPersonId, t031SuiyinPersonId,
  t031WechatCanonicalSignalId, t031WechatLegacySignalId, t031SuiyinCanonicalSignalId,
  t031SuiyinAlias, t031GenerationA, String(t031RawEpoch), "T031_PRIVATE_RAW_TIME_CANARY",
  "T031_PRIVATE_INVALID_TIME_CANARY", "T031_PRIVATE_WECHAT_DISPLAY_CANARY",
]) assert.equal(t031PublicJson.includes(canary), false, `T031-O02 public query leaked internal canary ${canary}`);
for (const forbiddenContent of ["T031_GROUP_CONTEXT_MUST_NEVER_ENTER_FEED", "T031_UNKNOWN_KIND_MUST_NEVER_ENTER_FEED", "T031_INACTIVE_MUST_NEVER_ENTER_FEED", "T031_UNTRUSTED_MUST_NEVER_ENTER_FEED", "T031_SUIYIN_LEGACY_MUST_NEVER_ENTER_FEED", "T031_MISSING_ATTRIBUTION_MUST_NEVER_ENTER_FEED", "T031_BLOCKED_SOURCE_MUST_NEVER_ENTER_FEED", "T031_UNMAPPED_PUBLISHER_MUST_NEVER_ENTER_FEED", "T031_EXCERPT_MUST_NEVER_ENTER_FEED"]) assert.equal(t031PublicJson.includes(forbiddenContent), false, "T031-O01 excluded chat/context/untrusted content reached the public feed");

assert.equal(Array.isArray(t031First.sourceOptions), true);
for (const option of t031First.sourceOptions) assert.deepEqual(Object.keys(option).sort(), ["sourceLabel", "sourceToken"].sort(), "T031-O02 source options may contain only safe label and opaque token");
const t031WechatSourceToken = t031First.sourceOptions.find((option) => option.sourceLabel === "我的微信")?.sourceToken;
const t031SuiyinSourceToken = t031First.sourceOptions.find((option) => option.sourceLabel === `碎银 · ${t031CoverageLabels[0]}`)?.sourceToken;
assert.equal(typeof t031WechatSourceToken, "string");
assert.equal(typeof t031SuiyinSourceToken, "string");
const t031Combined = queryTrustedMoments(t031MixedGraph, { activeGenerationId: t031GenerationA, page: 9, pageSize: 50, sourceTokens: [t031WechatSourceToken, t031SuiyinSourceToken], search: "共同检索词", identity: "confirmed", classification: "topic-approved" });
assert.equal(t031Combined.total, 2, "T031-O03 sources must OR while text, identity and classification AND together");
assert.equal(t031Combined.items.every((item) => item.identityLabel === "身份已确认" && item.classificationLabel === "可作为话题"), true);
const t031OnlySuiyin = queryTrustedMoments(t031MixedGraph, { activeGenerationId: t031GenerationA, sourceTokens: [t031SuiyinSourceToken], search: "共同检索词", identity: "confirmed", classification: "topic-approved" });
assert.deepEqual(t031OnlySuiyin.items.map((item) => item.sourceLabel), [`碎银 · ${t031CoverageLabels[0]}`], "T031-O03 one selected source token must not bleed another source into the result");
assert.equal(queryTrustedMoments(t031MixedGraph, { activeGenerationId: t031GenerationA, search: "碎银", sourceTokens: [], identity: "all", classification: "all" }).total, 1, "T031-O03 text may search the safe source label");
assert.equal(queryTrustedMoments(t031MixedGraph, { activeGenerationId: t031GenerationA, search: t031WechatCanonicalSignalId, sourceTokens: [], identity: "all", classification: "all" }).total, 0, "T031-O02/O03 text must never search internal signal IDs");
assert.equal(queryTrustedMoments(t031MixedGraph, { activeGenerationId: t031GenerationA, search: t031SuiyinAlias, sourceTokens: [], identity: "all", classification: "all" }).total, 0, "T031-O02/O03 text must never search raw account aliases");
assert.equal(queryTrustedMoments(t031MixedGraph, { activeGenerationId: t031GenerationA, sourceTokens: [], identity: "pending", classification: "internal" }).total, 1, "T031-O03 identity and classification must remain independent AND filters");
assert.equal(queryTrustedMoments(t031MixedGraph, { activeGenerationId: t031GenerationA, sourceTokens: [], identity: "confirmed", classification: "sensitive" }).total, 1);
const t031CacheHit = queryTrustedMoments(t031MixedGraph, { activeGenerationId: t031GenerationA, page: 2, pageSize: 2, sourceTokens: [], search: "", identity: "all", classification: "all" });
assert.equal(t031CacheHit.diagnostics.baseProjectionComputeCount, t031FirstProjectionCount, "T031-O04 same graph reference and generation must reuse one base projection across filters/pages");
assert.equal(t031CacheHit.items.length, 2);

const t031ClassifyBefore = structuredClone(t031MixedGraph);
const t031Classified = classifyTrustedMoment(t031MixedGraph, { opaqueToken: t031WechatItem.opaqueToken, classification: "internal", expectedActiveGenerationId: t031GenerationA, currentActiveGenerationId: t031GenerationA });
assert.deepEqual(t031MixedGraph, t031ClassifyBefore, "T031-O06 classification domain must not mutate its input graph");
assert.deepEqual({ changed: t031Classified.changed, formalWriteCount: t031Classified.formalWriteCount, generationDelta: t031Classified.generationDelta }, { changed: true, formalWriteCount: 1, generationDelta: 1 }, "T031-O06 a valid explicit classification is exactly one business graph mutation");
assert.equal(t031Classified.graph.signals.find((signal) => signal.id === t031WechatCanonicalSignalId)?.status, "internal");
assert.equal(t031Classified.graph.signals.find((signal) => signal.id === t031WechatLegacySignalId)?.kind, undefined, "T031-O02/O06 classification must not migrate a legacy kindless record");
const t031InvalidActionBefore = structuredClone(t031MixedGraph);
assert.throws(() => classifyTrustedMoment(t031MixedGraph, { opaqueToken: t031WechatCanonicalSignalId, classification: "internal", expectedActiveGenerationId: t031GenerationA, currentActiveGenerationId: t031GenerationA }), (error) => error?.code === "TRUSTED_MOMENT_TOKEN_INVALID" && !JSON.stringify(error).includes(t031WechatCanonicalSignalId), "T031-O06 raw signal ID must be rejected as an action token without reflection");
assert.deepEqual(t031MixedGraph, t031InvalidActionBefore, "T031-O06 invalid action token must perform zero graph writes");
assert.throws(() => classifyTrustedMoment(t031MixedGraph, { opaqueToken: t031WechatItem.opaqueToken, classification: "internal", expectedActiveGenerationId: t031GenerationA, currentActiveGenerationId: t031GenerationB }), (error) => error?.code === "TRUSTED_MOMENT_GENERATION_STALE", "T031-O06 expected/current generation mismatch must fail before lookup or mutation");
assert.deepEqual(t031MixedGraph, t031InvalidActionBefore, "T031-O06 stale generation must preserve the graph byte-semantically");

const t031RevalidationGraph = structuredClone(t031MixedGraph);
const t031RevalidationGeneration = "T031_PRIVATE_GENERATION_REVALIDATION";
const t031RevalidationQuery = queryTrustedMoments(t031RevalidationGraph, { activeGenerationId: t031RevalidationGeneration });
const t031RevalidationToken = t031RevalidationQuery.items.find((item) => item.bodyLabel.includes("微信正文"))?.opaqueToken;
t031RevalidationGraph.sources.find((source) => source.id === t031WechatSourceId).state = "removed";
const t031RevalidationBefore = structuredClone(t031RevalidationGraph);
assert.throws(() => classifyTrustedMoment(t031RevalidationGraph, { opaqueToken: t031RevalidationToken, classification: "internal", expectedActiveGenerationId: t031RevalidationGeneration, currentActiveGenerationId: t031RevalidationGeneration }), (error) => error?.code === "TRUSTED_MOMENT_INELIGIBLE", "T031-O06 classification must revalidate current source eligibility instead of trusting cached/controller state");
assert.deepEqual(t031RevalidationGraph, t031RevalidationBefore, "T031-O06 failed eligibility revalidation must be zero-write");

const t031GenerationBQuery = queryTrustedMoments(t031MixedGraph, { activeGenerationId: t031GenerationB });
assert.equal(t031GenerationBQuery.diagnostics.baseProjectionComputeCount, t031FirstProjectionCount + 1, "T031-O04 a generation change must invalidate and rebuild the whole base projection exactly once");
assert.notEqual(t031GenerationBQuery.items.find((item) => item.bodyLabel.includes("微信正文"))?.opaqueToken, t031WechatItem.opaqueToken, "T031-O04/O06 action tokens must rotate with the generation");
assert.throws(() => classifyTrustedMoment(t031MixedGraph, { opaqueToken: t031WechatItem.opaqueToken, classification: "internal", expectedActiveGenerationId: t031GenerationB, currentActiveGenerationId: t031GenerationB }), (error) => error?.code === "TRUSTED_MOMENT_TOKEN_STALE", "T031-O06 a prior-generation opaque token must remain distinguishable from an arbitrary invalid token");

const t031CasAdapter = createMemoryVaultAdapter();
const t031CasKey = await generateVaultKey();
const t031CasGeneration1 = await commitGraph(t031CasAdapter, t031MixedGraph, t031CasKey, { now: "2026-08-20T09:00:00.000Z" });
const t031CasGraph = await loadActiveGraph(t031CasAdapter, t031CasKey);
const t031CasQuery = queryTrustedMoments(t031CasGraph, { activeGenerationId: t031CasGeneration1 });
const t031CasToken = t031CasQuery.items.find((item) => item.bodyLabel.includes("微信正文"))?.opaqueToken;
const t031CasMutation = classifyTrustedMoment(t031CasGraph, { opaqueToken: t031CasToken, classification: "internal", expectedActiveGenerationId: t031CasGeneration1, currentActiveGenerationId: t031CasGeneration1 });
await commitGraph(t031CasAdapter, t031CasGraph, t031CasKey, { now: "2026-08-20T09:01:00.000Z", expectedActiveGenerationId: t031CasGeneration1 });
const t031CasBeforeStale = t031CasAdapter.dump();
const t031CasWriteCount = t031CasAdapter.writeCount;
await assert.rejects(() => commitGraph(t031CasAdapter, t031CasMutation.graph, t031CasKey, { now: "2026-08-20T09:02:00.000Z", expectedActiveGenerationId: t031CasGeneration1 }), (error) => error?.code === "BUSINESS_GENERATION_STALE", "T031-O06 stale classification CAS must fail closed");
assert.equal(t031CasAdapter.writeCount, t031CasWriteCount, "T031-O06 stale classification CAS must perform zero persistent writes");
assert.deepEqual(t031CasAdapter.dump(), t031CasBeforeStale, "T031-O06 stale classification CAS must preserve the encrypted active generation");

const t031LargeSourceId = "T031_LARGE_PRIVATE_WECHAT_SOURCE";
const t031LargePersonId = "T031_LARGE_PRIVATE_PERSON";
const t031LargeMomentCount = 10_000;
const t031LargeNonMomentCount = 10_000;
const t031LargeGraph = {
  owner: "t031-large-fictional-owner", settings: { schema: 2 },
  sources: [{ id: t031LargeSourceId, state: "active", sourceKind: "wechat-export-toolkit", sourceBundleRevision: SOURCE_BUNDLE_REVISION, displayName: "T031_LARGE_PRIVATE_DISPLAY" }],
  people: [{ id: t031LargePersonId, name: "纯虚构大样本发布者", state: "active", sourceScoped: true }],
  excerpts: [],
  mappings: [{ id: "t031-large-map", sourceId: t031LargeSourceId, sourcePersonId: t031LargePersonId, personId: t031LargePersonId, sourceDisplayName: "纯虚构大样本发布者", sourceAccountAliases: [], status: "confirmed" }],
  relationships: [], dictionary: [],
  signals: [
    ...Array.from({ length: t031LargeMomentCount }, (_, index) => ({ id: `T031_LARGE_PRIVATE_MOMENT_${String(index).padStart(5, "0")}`, sourceId: t031LargeSourceId, personId: t031LargePersonId, kind: "moment", status: index % 2 === 0 ? "topic-approved" : "internal", text: `纯虚构大样本朋友圈 ${index}`, mediaDescription: "", publishedAt: "2026-08-20T01:00:00.000Z" })),
    ...Array.from({ length: t031LargeNonMomentCount }, (_, index) => ({ id: `T031_LARGE_PRIVATE_CONTEXT_${String(index).padStart(5, "0")}`, sourceId: t031LargeSourceId, kind: "group_context", status: "internal", thirdParty: true, contextId: `T031_LARGE_PRIVATE_GROUP_${String(index).padStart(5, "0")}`, contextLabel: "纯虚构群上下文", text: `纯虚构非朋友圈 ${index}`, publishedAt: "2026-08-20T01:00:00.000Z" })),
  ],
  topics: [], notes: [], actions: [], trash: [], purgedPersonIds: [], identityDecisions: [],
};
const t031LargeStarted = performance.now();
const t031LargeFirst = queryTrustedMoments(t031LargeGraph, { activeGenerationId: "T031_PRIVATE_GENERATION_LARGE", page: 1, pageSize: 50 });
const t031LargeDuration = performance.now() - t031LargeStarted;
assert.equal(t031LargeFirst.total, t031LargeMomentCount, "T031-O04 10k eligible moments must remain complete inside a 20k mixed-signal graph");
assert.equal(t031LargeFirst.items.length, 50, "T031-O04 live/domain page must remain bounded to 50 at 20k signals");
assert.equal(t031LargeDuration < 10_000, true, "T031-O04 20k fictional mixed projection exceeded the bounded local test budget");
const t031LargeComputeCount = t031LargeFirst.diagnostics.baseProjectionComputeCount;
const t031LargeSecond = queryTrustedMoments(t031LargeGraph, { activeGenerationId: "T031_PRIVATE_GENERATION_LARGE", page: 200, pageSize: 50, classification: "all", identity: "all", sourceTokens: [], search: "" });
assert.equal(t031LargeSecond.items.length, 50);
assert.equal(t031LargeSecond.diagnostics.baseProjectionComputeCount, t031LargeComputeCount, "T031-O04 paging a 20k graph must reuse the generation-scoped base projection");
assert.equal(JSON.stringify(t031LargeFirst).includes("T031_LARGE_PRIVATE_MOMENT_00000"), false, "T031-O02/O04 bounded public result must not retain raw large-graph IDs");
assert.equal(t031LargeGraph.signals.length, t031LargeMomentCount + t031LargeNonMomentCount, "T031-O04 large read-only projection must not migrate or delete mixed signals");

// T031-E5 registry-boundary RED.  A graph-reference switch represents a new
// active decrypted generation: action bindings from the prior graph must not
// remain strongly retained or count toward the new graph's safe diagnostics.
// The assertions are deterministic and do not depend on GC/WeakRef timing.
const t031RegistryGraphA = structuredClone(t031MixedGraph);
const t031RegistryGraphB = structuredClone(t031MixedGraph);
const t031RegistryGenerationA = "T031_PRIVATE_REGISTRY_GENERATION_A";
const t031RegistryGenerationB = "T031_PRIVATE_REGISTRY_GENERATION_B";
const t031RegistryAFirst = queryTrustedMoments(t031RegistryGraphA, { activeGenerationId: t031RegistryGenerationA, page: 1, pageSize: 2 });
const t031RegistryACacheHit = queryTrustedMoments(t031RegistryGraphA, { activeGenerationId: t031RegistryGenerationA, page: 2, pageSize: 2 });
assert.equal(Number.isInteger(t031RegistryAFirst.diagnostics?.activeActionTokenCount), true, "T031-E5 diagnostics must expose only the integer active action-token count");
assert.equal(t031RegistryAFirst.diagnostics.activeActionTokenCount > 0 && t031RegistryAFirst.diagnostics.activeActionTokenCount <= t031RegistryAFirst.diagnostics.eligibleCount, true, "T031-E5 active action-token count must be bounded by the current eligible projection");
assert.deepEqual(t031RegistryACacheHit.diagnostics, t031RegistryAFirst.diagnostics, "T031-E5 same graph reference and generation must reuse the projection and active registry without growth");
const t031RegistryOldToken = t031RegistryAFirst.items[0]?.opaqueToken;
assert.equal(typeof t031RegistryOldToken, "string");

const t031RegistryGraphBBefore = structuredClone(t031RegistryGraphB);
const t031RegistryBFirst = queryTrustedMoments(t031RegistryGraphB, { activeGenerationId: t031RegistryGenerationB, page: 1, pageSize: 2 });
assert.equal(Number.isInteger(t031RegistryBFirst.diagnostics?.activeActionTokenCount), true, "T031-E5 switched graph diagnostics must expose only the integer active token count");
assert.equal(t031RegistryBFirst.diagnostics.activeActionTokenCount > 0 && t031RegistryBFirst.diagnostics.activeActionTokenCount <= t031RegistryBFirst.diagnostics.eligibleCount, true, "T031-E5 graph switch must bound the registry to the current graph's eligible actions");
assert.equal(t031RegistryBFirst.diagnostics.activeActionTokenCount < t031RegistryAFirst.diagnostics.eligibleCount + t031RegistryBFirst.diagnostics.eligibleCount, true, "T031-E5 graph switch must not accumulate graph A and graph B action bindings");
assert.deepEqual(t031RegistryGraphB, t031RegistryGraphBBefore, "T031-E5 graph B query/registry replacement must remain read-only");
assert.throws(
  () => classifyTrustedMoment(t031RegistryGraphB, { opaqueToken: t031RegistryOldToken, classification: "internal", expectedActiveGenerationId: t031RegistryGenerationB, currentActiveGenerationId: t031RegistryGenerationB }),
  (error) => ["TRUSTED_MOMENT_TOKEN_STALE", "TRUSTED_MOMENT_TOKEN_INVALID"].includes(error?.code),
  "T031-E5 a graph A token must be stale or invalid against graph B",
);
assert.deepEqual(t031RegistryGraphB, t031RegistryGraphBBefore, "T031-E5 rejected cross-graph action token must perform zero graph writes");
const t031RegistryBCacheHit = queryTrustedMoments(t031RegistryGraphB, { activeGenerationId: t031RegistryGenerationB, page: 2, pageSize: 2 });
assert.deepEqual(t031RegistryBCacheHit.diagnostics, t031RegistryBFirst.diagnostics, "T031-E5 same graph B/generation cache hit must not grow or recompute the active registry");

const knowledge = filterConfirmedKnowledge(graph);
assert.deepEqual(knowledge.signals.map((s) => s.id), ["signal-approved"]);
assert.equal(JSON.stringify(knowledge).includes("虚构第三方内容"), false);
const minimized = minimizeGraph({ ...graph, rawArchive: secret, mediaBytes: secret });
assert.equal("rawArchive" in minimized, false);
assert.equal("mediaBytes" in minimized, false);

const key = await generateVaultKey();
assert.equal(key.extractable, false);
await assert.rejects(() => crypto.subtle.exportKey("raw", key));
const encrypted = await encryptEnvelope(minimized, key);
assert.equal(encrypted.iv.byteLength, 12);
assert.equal(JSON.stringify(encrypted).includes(secret), false);
assert.deepEqual(await decryptEnvelope(encrypted, key), minimized);

const adapter = createMemoryVaultAdapter();
await commitGraph(adapter, minimized, key, { now });
assert.equal(adapter.writeCount, 1);
assert.equal(JSON.stringify(adapter.dump()).includes(secret), false, "captured storage bytes are ciphertext only");
assert.deepEqual(await loadActiveGraph(adapter, key), upgradeRelationshipGraphV2(minimized));

const stableBeforeFailure = structuredClone(await loadActiveGraph(adapter, key));
adapter.failNextCommit("quota-exceeded");
await assert.rejects(() => commitGraph(adapter, upgradeRelationshipGraphV2(minimized), key, { now }), /quota-exceeded/);
assert.deepEqual(await loadActiveGraph(adapter, key), stableBeforeFailure, "failed generation never becomes active");

const removed = removeSource(minimized, sourceId);
assert.equal(removed.sources[0].state, "removed");
assert.equal(removed.excerpts.length, 0);
assert.equal(removed.mappings.length, 0);
assert.equal(removed.signals.length, 0);
assert.equal(removed.topics.length, 0);
assert.equal(removed.notes[0].text, "虚构手写笔记");
assert.equal(removed.notes[0].sourceId, undefined);
assert.equal(removed.notes[0].sourceState, "removed");
assert.equal(removed.actions[0].text, "虚构实际联系");
assert.equal(removed.actions[0].sourceId, undefined);
assert.equal(removed.relationships[0].status, "review-required");
assert.deepEqual(removed.relationships[0].sourceIds, []);
assert.deepEqual(removeSource(removed, sourceId), removed, "source removal is idempotent");

const trashed = trashPerson(minimized, personId, now);
assert.equal(trashed.people[0].state, "trashed");
assert.equal(trashed.people[0].purgeAt, "2026-09-12T08:00:00.000Z");
assert.equal(filterConfirmedKnowledge(trashed).people.length, 0);
assert.deepEqual(restorePerson(trashed, personId).people[0].state, "active");
const purged = purgePerson(trashed, personId);
assert.equal(JSON.stringify(purged).includes(personId), true, "non-sensitive purge tombstone retained for resurrection warning");
assert.equal(purged.people.length, 0);
assert.equal(purged.notes.length, 0);
assert.equal(purged.actions.length, 0);
assert.equal(purged.purgedPersonIds.includes(personId), true);

const retirementAdapter = createMemoryVaultAdapter();
const retirementKey = await generateVaultKey();
await commitGraph(retirementAdapter, minimized, retirementKey, { now });
const oldGeneration = retirementAdapter.dump().generations[0];
const retirement = await commitPurgedGraph(retirementAdapter, purged, retirementKey, { now: "2026-08-13T08:01:00.000Z" });
const retiredState = retirementAdapter.dump();
assert.equal(retiredState.generations.some((item) => item.id === oldGeneration.id), false, "old ciphertext physically retired");
assert.equal(retiredState.generations.length, 1);
assert.equal(retiredState.snapshots.length, 0);
assert.notEqual(retirement.key, retirementKey, "vault key rotated during purge");
assert.deepEqual(await loadActiveGraph(retirementAdapter, retirement.key), purged);
await assert.rejects(() => decryptEnvelope(oldGeneration.envelope, retirement.key), "retired ciphertext is not decryptable with current key");
const retirementBeforeFault = retirementAdapter.dump();
retirementAdapter.failNextCommit("purge-retirement-fault");
await assert.rejects(() => commitPurgedGraph(retirementAdapter, purged, retirement.key), /purge-retirement-fault/);
assert.deepEqual(retirementAdapter.dump(), retirementBeforeFault, "purge retirement fault is atomic");

const sourceRetirementAdapter = createMemoryVaultAdapter();
const sourceRetirementKey = await generateVaultKey();
await commitGraph(sourceRetirementAdapter, minimized, sourceRetirementKey, { now });
const oldSourceGeneration = sourceRetirementAdapter.dump().generations[0];
const sourceRetirement = await commitSourceRemovedGraph(sourceRetirementAdapter, removed, sourceRetirementKey, { now: "2026-08-13T08:02:00.000Z" });
const sourceRetiredState = sourceRetirementAdapter.dump();
assert.equal(sourceRetiredState.generations.some((item) => item.id === oldSourceGeneration.id), false, "source removal retires application-managed plaintext history");
assert.equal(sourceRetiredState.generations.length, 1);
assert.equal(sourceRetiredState.snapshots.length, 0);
assert.notEqual(sourceRetirement.key, sourceRetirementKey);
const sourceRetiredGraph = await loadActiveGraph(sourceRetirementAdapter, sourceRetirement.key);
assert.equal(JSON.stringify(sourceRetiredGraph).includes(secret), false);
assert.equal(sourceRetiredGraph.notes[0].text, "虚构手写笔记");
assert.equal(sourceRetiredGraph.actions[0].text, "虚构实际联系");
const sourceRetirementBeforeFault = sourceRetirementAdapter.dump();
sourceRetirementAdapter.failNextCommit("source-retirement-fault");
await assert.rejects(() => commitSourceRemovedGraph(sourceRetirementAdapter, removed, sourceRetirement.key), /source-retirement-fault/);
assert.deepEqual(sourceRetirementAdapter.dump(), sourceRetirementBeforeFault, "source retirement fault is atomic");

const backup = await createBackup(purged, "fictional recovery phrase", { now });
assert.equal(backup.kdf.iterations >= 310_000, true);
assert.equal(Buffer.from(backup.kdf.salt, "base64").byteLength >= 16, true);
assert.equal(Buffer.from(backup.iv, "base64").byteLength, 12);
assert.equal(JSON.stringify(backup).includes("虚构手写笔记"), false);
const backupPreview = await readBackupPreview(backup, "fictional recovery phrase");
assert.equal(backupPreview.version, 2);
assert.equal(backupPreview.mode, "complete-replace");
await assert.rejects(() => readBackupPreview(backup, "wrong phrase"), /wrong-passphrase-or-corrupt/);
const corrupt = structuredClone(backup);
corrupt.ciphertext = `${corrupt.ciphertext.slice(0, -2)}AA`;
await assert.rejects(() => readBackupPreview(corrupt, "fictional recovery phrase"), /wrong-passphrase-or-corrupt/);
const weakBackup = structuredClone(backup); weakBackup.kdf.iterations = 1;
await assert.rejects(() => readBackupPreview(weakBackup, "fictional recovery phrase"), /unsafe-backup-parameters/);
const shortSaltBackup = structuredClone(backup); shortSaltBackup.kdf.salt = Buffer.alloc(8).toString("base64");
await assert.rejects(() => readBackupPreview(shortSaltBackup, "fictional recovery phrase"), /unsafe-backup-parameters/);
const shortIvBackup = structuredClone(backup); shortIvBackup.iv = Buffer.alloc(8).toString("base64");
await assert.rejects(() => readBackupPreview(shortIvBackup, "fictional recovery phrase"), /unsafe-backup-parameters/);
const malformedSaltBackup = structuredClone(backup); malformedSaltBackup.kdf.salt = "not-base64***";
await assert.rejects(() => readBackupPreview(malformedSaltBackup, "fictional recovery phrase"), /unsafe-backup-parameters/);
const wrongHashBackup = structuredClone(backup); wrongHashBackup.kdf.hash = "SHA-1";
await assert.rejects(() => readBackupPreview(wrongHashBackup, "fictional recovery phrase"), /unsafe-backup-parameters/);
const badVersionBackup = structuredClone(backup); badVersionBackup.version = 3;
await assert.rejects(() => readBackupPreview(badVersionBackup, "fictional recovery phrase"), /unsupported-version/);

const invalidGraphBackup = structuredClone(backup);
{
  const salt = Buffer.from(invalidGraphBackup.kdf.salt, "base64");
  const iv = Buffer.from(invalidGraphBackup.iv, "base64");
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode("fictional recovery phrase"), "PBKDF2", false, ["deriveKey"]);
  const maliciousKey = await crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: invalidGraphBackup.kdf.iterations }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const invalidPayload = { version: 2, createdAt: now, mode: "complete-replace", graph: { ...purged, people: "not-an-array" } };
  invalidGraphBackup.ciphertext = Buffer.from(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, maliciousKey, new TextEncoder().encode(JSON.stringify(invalidPayload)))).toString("base64");
}
await assert.rejects(() => readBackupPreview(invalidGraphBackup, "fictional recovery phrase"), /invalid-backup-graph/);

const contradictoryGraphBackup = await createBackup({ ...importedGraph, purgedPersonIds: [importedGraph.people[0].id] }, "fictional recovery phrase", { now });
await assert.rejects(() => readBackupPreview(contradictoryGraphBackup, "fictional recovery phrase"), /invalid-backup-graph/);

const restoreAdapter = createMemoryVaultAdapter();
await commitGraph(restoreAdapter, minimized, key, { now });
const restoreBeforeInvalid = restoreAdapter.dump();
await assert.rejects(() => restoreBackup(restoreAdapter, key, invalidGraphBackup, "fictional recovery phrase", { now }), /invalid-backup-graph/);
assert.deepEqual(restoreAdapter.dump(), restoreBeforeInvalid, "invalid graph leaves active vault unchanged");
const restored = await restoreBackup(restoreAdapter, key, backup, "fictional recovery phrase", { now });
assert.equal(restored.snapshot.expiresAt, "2026-08-20T08:00:00.000Z");
assert.equal(restoreAdapter.dump().snapshots.length, 1);
const rollbackGenerationId = restored.snapshot.rollbackGenerationId;
assert.equal(typeof rollbackGenerationId, "string", "snapshot identifies its pre-restore generation");
assert.equal(restoreAdapter.dump().generations.some((item) => item.id === rollbackGenerationId), true);
assert.deepEqual(await loadActiveGraph(restoreAdapter, key), purged);
const reopenedSnapshot = await cleanupExpiredSnapshots(restoreAdapter, { now: "2026-08-19T08:00:00.000Z" });
assert.equal(reopenedSnapshot.id, restored.snapshot.id, "unexpired snapshot is recoverable after reopen");
assert.equal(restoreAdapter.dump().snapshots.length, 1);
const expiryBeforeFault = restoreAdapter.dump();
restoreAdapter.failNextCommit("snapshot-expiry-fault");
await assert.rejects(() => cleanupExpiredSnapshots(restoreAdapter, { now: "2026-08-21T08:00:00.000Z" }), /snapshot-expiry-fault/);
assert.deepEqual(restoreAdapter.dump(), expiryBeforeFault, "expiry cleanup fault leaves snapshot intact");
assert.equal(await cleanupExpiredSnapshots(restoreAdapter, { now: "2026-08-21T08:00:00.000Z" }), null);
assert.equal(restoreAdapter.dump().snapshots.length, 0, "expired snapshot is automatically removed");
assert.equal(restoreAdapter.dump().generations.some((item) => item.id === rollbackGenerationId), false, "expiry removes referenced pre-restore generation");
assert.deepEqual(await loadActiveGraph(restoreAdapter, key), purged, "expiry never deletes current active generation");
const restoredAgain = await restoreBackup(restoreAdapter, key, backup, "fictional recovery phrase", { now });
assert.equal((await cleanupExpiredSnapshots(restoreAdapter, { now: "2026-08-19T08:00:00.000Z" })).id, restoredAgain.snapshot.id);
const manualRollbackGenerationId = restoredAgain.snapshot.rollbackGenerationId;
const manualBeforeFault = restoreAdapter.dump();
restoreAdapter.failNextCommit("snapshot-delete-fault");
await assert.rejects(() => deleteSafetySnapshot(restoreAdapter, restoredAgain.snapshot.id), /snapshot-delete-fault/);
assert.deepEqual(restoreAdapter.dump(), manualBeforeFault, "manual deletion fault preserves metadata and rollback generation");
await deleteSafetySnapshot(restoreAdapter, restoredAgain.snapshot.id);
assert.equal(restoreAdapter.dump().snapshots.length, 0);
assert.equal(restoreAdapter.dump().generations.some((item) => item.id === manualRollbackGenerationId), false, "manual deletion removes referenced pre-restore generation");
assert.deepEqual(await loadActiveGraph(restoreAdapter, key), purged, "manual deletion preserves current active graph");

const resurrectedPerson = { id: "fictional-purged-person", name: "虚构旧备份人物", state: "active" };
const oldBackupGraph = { ...purged, people: [resurrectedPerson], purgedPersonIds: [] };
const oldBackup = await createBackup(oldBackupGraph, "fictional recovery phrase", { now });
const currentWithTombstone = { ...purged, purgedPersonIds: [...purged.purgedPersonIds, resurrectedPerson.id] };
const resurrectionAdapter = createMemoryVaultAdapter();
await commitGraph(resurrectionAdapter, currentWithTombstone, key, { now });
const resurrectionPreview = await readBackupPreview(oldBackup, "fictional recovery phrase", { currentGraph: currentWithTombstone });
assert.equal(resurrectionPreview.requiresResurrectionConfirmation, true);
assert.deepEqual(resurrectionPreview.previouslyPurgedPersonIds, [resurrectedPerson.id]);
await assert.rejects(() => restoreBackup(resurrectionAdapter, key, oldBackup, "fictional recovery phrase", { now }), /previously-purged/);
assert.equal((await loadActiveGraph(resurrectionAdapter, key)).people.some((person) => person.id === resurrectedPerson.id), false);
await restoreBackup(resurrectionAdapter, key, oldBackup, "fictional recovery phrase", { now, confirmResurrection: true });
assert.equal((await loadActiveGraph(resurrectionAdapter, key)).people.some((person) => person.id === resurrectedPerson.id), true);

const successfulSink = { bytes: "", closed: false, async write(value) { this.bytes = value; }, async close() { this.closed = true; }, async readText() { return this.bytes; } };
const publishedBackup = await writeVerifiedBackup(purged, "fictional recovery phrase", successfulSink, { now });
assert.equal(successfulSink.closed, true);
assert.deepEqual(await readBackupPreview(JSON.parse(successfulSink.bytes), "fictional recovery phrase"), await readBackupPreview(publishedBackup, "fictional recovery phrase"));
for (const failingSink of [
  { async write() { throw new Error("sink-write-fault"); }, async close() {}, async readText() { return ""; }, async abort() { this.aborted = true; } },
  { async write() {}, async close() { throw new Error("sink-close-fault"); }, async readText() { return ""; }, async abort() { this.aborted = true; } },
]) {
  await assert.rejects(() => writeVerifiedBackup(purged, "fictional recovery phrase", failingSink, { now }), /sink-(write|close)-fault/);
  assert.equal(failingSink.aborted, true);
}
const mismatchedSink = { bytes: "", async write(value) { this.bytes = value; }, async close() {}, async readText() { return `${this.bytes}x`; }, async abort() { this.aborted = true; } };
await assert.rejects(() => writeVerifiedBackup(purged, "fictional recovery phrase", mismatchedSink, { now }), /backup-verification-failed/);
assert.equal(mismatchedSink.aborted, true);

const unavailable = markSourceUnavailable(minimized, sourceId, "permission-denied");
assert.equal(unavailable.sources[0].fullTextAvailable, false);
assert.equal(unavailable.sources[0].unavailableReason, "permission-denied");

let state = { name: "no-source", previousStable: "no-source" };
for (const event of ["SELECT", "PREFLIGHT_OK", "CONFIRM_IMPORT", "IMPORT_OK"]) state = transitionLocalState(state, event);
assert.equal(state.name, "source-active");
const failed = transitionLocalState({ name: "importing", previousStable: "preview-ready" }, "FAIL", { code: "quota" });
assert.equal(failed.name, "preview-ready");
assert.equal(failed.error.code, "quota");

const perfRecords = Array.from({ length: 5000 }, (_, i) => ({ id: `fictional-${i}`, relativePath: `messages/${i}.txt`, kind: "chat-text", text: `虚构消息 ${i}` }));
const started = performance.now();
assert.equal(classifyExportRecords(perfRecords).supported.length, 5000);
assert.equal(performance.now() - started < 10_000, true);

const analysisNow = "2026-08-14T08:00:00.000Z";
const analysisGraph = {
  owner: "fictional-owner",
  sources: [
    { id: "analysis-source-active", state: "active", displayName: "虚构来源" },
    { id: "analysis-source-removed", state: "removed", displayName: "虚构已移除来源" },
  ],
  people: [
    { id: "analysis-key", name: "虚构人物晨光", state: "active" },
    { id: "analysis-natural", name: "虚构人物晚风", state: "pending", sourceScoped: true },
    { id: "analysis-fading", name: "虚构人物远山", state: "active" },
    { id: "analysis-light", name: "虚构人物纸鸢", state: "pending", sourceScoped: true },
    { id: "analysis-system", name: "虚构群发助手", state: "active" },
    { id: "analysis-removed", name: "虚构已移除人物", state: "active" },
    { id: "analysis-trashed", name: "虚构回收站人物", state: "trashed" },
  ],
  excerpts: [
    { id: "analysis-chat-1", sourceId: "analysis-source-active", personId: "analysis-key", kind: "chat-text", conversationKind: "direct", conversationId: "analysis-direct-key", direction: "counterparty", thirdParty: false, text: "纯虚构近期反馈", timestamp: 1786615200 },
    { id: "analysis-chat-2", sourceId: "analysis-source-active", personId: "analysis-key", kind: "chat-text", conversationKind: "direct", conversationId: "analysis-direct-key", direction: "self", thirdParty: false, text: "纯虚构第二条互动", timestamp: 1786528800 },
    { id: "analysis-chat-3", sourceId: "analysis-source-active", personId: "analysis-fading", kind: "chat-text", conversationKind: "direct", conversationId: "analysis-direct-fading", direction: "counterparty", thirdParty: false, text: "纯虚构很久以前互动", timestamp: 1767225600 },
    { id: "analysis-chat-4", sourceId: "analysis-source-active", personId: "analysis-light", kind: "chat-text", conversationKind: "direct", conversationId: "analysis-direct-light", direction: "self", thirdParty: false, text: "纯虚构轻问候互动", timestamp: 1783936800 },
    { id: "analysis-chat-system", sourceId: "analysis-source-active", personId: "analysis-system", kind: "chat-text", text: "纯虚构系统噪声", timestamp: 1786615200 },
    { id: "analysis-chat-removed", sourceId: "analysis-source-removed", personId: "analysis-removed", kind: "chat-text", text: "纯虚构已移除内容", timestamp: 1786615200 },
    { id: "analysis-chat-trashed", sourceId: "analysis-source-active", personId: "analysis-trashed", kind: "chat-text", text: "纯虚构已回收内容", timestamp: 1786615200 },
  ],
  mappings: [
    { id: "analysis-map-key", sourceId: "analysis-source-active", personId: "analysis-key", status: "confirmed" },
    { id: "analysis-map-natural", sourceId: "analysis-source-active", personId: "analysis-natural", status: "pending" },
    { id: "analysis-map-fading", sourceId: "analysis-source-active", personId: "analysis-fading", status: "confirmed" },
    { id: "analysis-map-light", sourceId: "analysis-source-active", personId: "analysis-light", status: "pending" },
  ],
  relationships: [
    { id: "analysis-relation-key", personId: "analysis-key", sourceIds: ["analysis-source-active"], status: "confirmed", label: "虚构朋友", recommendationEligible: true },
  ],
  dictionary: [],
  signals: [
    { id: "analysis-signal-natural", sourceId: "analysis-source-active", personId: "analysis-natural", status: "pending", text: "纯虚构公开近况线索，仅供内部审查，不应整段复制到结果中。" },
  ],
  topics: [],
  notes: [],
  actions: [],
  trash: [{ personId: "analysis-trashed", purgeAt: "2026-09-13T08:00:00.000Z" }],
  purgedPersonIds: ["analysis-purged"],
  settings: { schema: 1 },
};

const analysisBefore = structuredClone(analysisGraph);
const analysis = analyzeLocalRelationshipGraph(analysisGraph, { now: analysisNow });
assert.deepEqual(analysisGraph, analysisBefore, "T003 analysis must leave the full input graph unchanged");
const libraryBefore = structuredClone(analysisGraph);
const libraryRows = projectRelationshipLibrary(analysisGraph, { now: analysisNow });
assert.deepEqual(analysisGraph, libraryBefore, "T003 relationship-library projection must leave the full input graph unchanged");
assert.equal(libraryRows.rows.length, 4, "T003 library must project active real people rather than demo people or excluded records");
assert.deepEqual(libraryRows.rows.map((row) => row.displayName), ["虚构人物晨光", "虚构人物晚风", "虚构人物远山", "虚构人物纸鸢"].sort(), "T003 library rows must be deterministic");
const libraryKey = libraryRows.rows.find((row) => row.displayName === "虚构人物晨光");
assert.deepEqual({ boundary: libraryKey.boundary, excerptCount: libraryKey.excerptCount, relationshipLabels: libraryKey.relationshipLabels, manualStatus: libraryKey.manualStatus }, { boundary: "confirmed", excerptCount: 2, relationshipLabels: ["虚构朋友"], manualStatus: null });
assert.equal(libraryKey.personId, "analysis-key", "T003 library requires an internal exact person reference for the existing identity/contact gate");
const serializedLibrary = JSON.stringify(libraryRows);
for (const forbidden of ["analysis-chat-1", "analysis-source-active", "纯虚构近期反馈", "纯虚构公开近况线索"]) assert.equal(serializedLibrary.includes(forbidden), false, `T003 library projection leaked forbidden source content: ${forbidden}`);
const zeroActiveGraph = { ...analysisGraph, sources: [{ id: "analysis-source-active", state: "removed" }] };
assert.equal(projectRelationshipLibrary(zeroActiveGraph, { now: analysisNow }).aggregate.peopleCount, 0, "T003 ready non-empty graph with zero active rows must remain a truthful local empty state");
assert.deepEqual(analyzeLocalRelationshipGraph(analysisGraph, { now: analysisNow }), analysis, "T003 equal graph and options must be deterministic");
assert.equal(analysis.key.length <= 3, true);
assert.equal(analysis.light.length <= 12, true);
assert.equal(new Set([...analysis.key, ...analysis.light].map((item) => item.personId)).size, analysis.key.length + analysis.light.length, "T003 tiers must not overlap");
assert.equal(analysis.aggregate.candidateCount, analysis.key.length + analysis.light.length);
assert.equal(analysis.aggregate.activeSources, 1);
assert.equal(analysis.aggregate.excludedPeople, 4, "T014 strict mapping adds the pending-only person to T003 removed-source, trash, and noise exclusions");
assert.equal([...analysis.key, ...analysis.light].some((item) => ["analysis-system", "analysis-removed", "analysis-trashed", "analysis-purged"].includes(item.personId)), false);
const analysisCandidates = [...analysis.key, ...analysis.light];
const reasonKinds = new Set(analysisCandidates.flatMap((item) => item.reasons.map((reason) => reason.category)));
for (const kind of ["relationship-significance", "fading-risk", "natural-timing", "recent-feedback"]) assert.equal(reasonKinds.has(kind), true, `T003 missing reason category ${kind}`);
assert.equal(analysisCandidates.every((item) => item.reasons.length > 0 && item.reasons.every((reason) => reason.evidence?.kind && reason.evidence?.value !== undefined)), true, "T003 every reason needs date/count evidence");
assert.equal(analysisCandidates.find((item) => item.personId === "analysis-natural")?.boundary, "pending");
assert.equal(analysisCandidates.find((item) => item.personId === "analysis-natural")?.boundaryLabel, "待确认候选");
const serializedAnalysis = JSON.stringify(analysis);
for (const forbiddenKey of ["score", "draft", "send", "action", "recommendationHistory"]) assert.equal(new RegExp(`\\"${forbiddenKey}\\"`, "i").test(serializedAnalysis), false, `T003 result exposes forbidden ${forbiddenKey}`);
assert.equal(serializedAnalysis.includes("纯虚构公开近况线索，仅供内部审查，不应整段复制到结果中。"), false, "T003 must not copy a full signal body into the bounded result");
assert.equal(analysisCandidates.every((item) => JSON.stringify(item.safeTopic).length < 240), true, "T003 safe topic boundary must stay bounded");

const errorGraph = structuredClone(analysisGraph);
const errorBefore = structuredClone(errorGraph);
assert.throws(() => analyzeLocalRelationshipGraph(errorGraph, { now: "not-a-date" }), /invalid-analysis-reference-time/);
assert.deepEqual(errorGraph, errorBefore, "T003 thrown analysis path must leave graph unchanged");

const largePeople = Array.from({ length: 20 }, (_, index) => ({ id: `large-person-${String(index).padStart(2, "0")}`, name: `虚构规模人物${index}`, state: index % 3 === 0 ? "pending" : "active" }));
const largeGraph = {
  owner: "fictional-large-owner",
  sources: [{ id: "large-source", state: "active", displayName: "虚构规模来源" }],
  people: largePeople,
  excerpts: Array.from({ length: 100_000 }, (_, index) => ({ id: `large-excerpt-${index}`, sourceId: "large-source", personId: largePeople[index % largePeople.length].id, kind: "chat-text", conversationKind: "direct", conversationId: `large-conversation-${largePeople[index % largePeople.length].id}`, direction: index % 2 ? "counterparty" : "self", thirdParty: false, text: "纯虚构规模消息", timestamp: 1786000000 - index })),
  mappings: largePeople.map((person) => ({ id: `map-${person.id}`, sourceId: "large-source", personId: person.id, status: "confirmed" })),
  relationships: [], dictionary: [], signals: [], topics: [], notes: [], actions: [], trash: [], purgedPersonIds: [], settings: { schema: 1 },
};
const largeBefore = structuredClone(largeGraph);
const largeStarted = performance.now();
const largeAnalysis = analyzeLocalRelationshipGraph(largeGraph, { now: analysisNow });
assert.equal(largeAnalysis.key.length + largeAnalysis.light.length <= 15, true, "T003 100k result is not bounded to 15");
assert.equal(largeAnalysis.aggregate.excerptCount, 100_000);
assert.equal(JSON.stringify(largeAnalysis).includes("large-excerpt-99999"), false, "T003 result retained full record references");
assert.equal(performance.now() - largeStarted < 10_000, true, "T003 100k fictional analysis exceeded local-main-chain budget");
assert.deepEqual(largeGraph, largeBefore, "T003 100k analysis mutated input");

// T010 real Moments workbench: all records are synthetic and the production
// query/render helpers must keep the DOM-sized result bounded to one page.
const t010SourceId = "F".repeat(64);
const t010PersonId = "E".repeat(64);
const t010Signals = Array.from({ length: 12_539 }, (_, index) => ({
  id: `fictional-real-signal-${String(index).padStart(5, "0")}`,
  sourceId: t010SourceId,
  personId: t010PersonId,
  status: index % 7 === 0 ? "topic-approved" : "pending",
  text: index === 12_538 ? "纯虚构末条线索-needle" : `纯虚构真实图线索 ${index}`,
  mediaDescription: index % 11 === 0 ? "1 个媒体项目（未打开）" : "",
  publishedAt: 1_786_000_000 + index,
  time: `2026-08-${String((index % 28) + 1).padStart(2, "0")} 08:00:00`,
}));
const t010Graph = {
  owner: "fictional-t010-owner",
  sources: [{ id: t010SourceId, state: "active", displayName: "纯虚构微信导出", sourceKind: "wechat-export-toolkit", importedAt: now, conversationCount: 3, messageCount: 9, momentCount: 12_539, excludedCount: 2, senderlessGroupExcludedCount: 1, momentParseFailureExcludedCount: 1 }],
  people: [{ id: t010PersonId, name: "纯虚构人物松果", state: "active", sourceScoped: true }],
  excerpts: [],
  mappings: [{ id: "fictional-t010-map", sourceId: t010SourceId, personId: t010PersonId, status: "confirmed" }],
  relationships: [{ id: "fictional-t010-identity", identityMappingId: "fictional-t010-map", personId: t010PersonId, sourceIds: [t010SourceId], status: "confirmed", label: "身份已确认", recommendationEligible: true, draftEligible: true }],
  dictionary: [], signals: t010Signals, topics: [], notes: [], actions: [], trash: [], purgedPersonIds: [], settings: { schema: 1 },
};
const t010FirstPage = queryGraphSignals(t010Graph, { page: 1, pageSize: 50 });
assert.equal(t010FirstPage.total, 12_539, "R003 aggregate must cover every real graph signal");
assert.equal(t010FirstPage.items.length, 50, "R003 first page must be bounded to 50");
assert.equal(t010FirstPage.pageCount, 251);
const t010LastPage = queryGraphSignals(t010Graph, { page: 251, pageSize: 50 });
assert.equal(t010LastPage.items.length, 39, "R003 last page must remain reachable without mounting the full list");
const t010Needle = queryGraphSignals(t010Graph, { search: "needle", page: 1, pageSize: 50 });
assert.equal(t010Needle.total, 1);
assert.equal(t010Needle.items[0].id, t010Signals.at(-1).id, "R003 search must reach the final real record");
const t010Approved = queryGraphSignals(t010Graph, { classification: "topic-approved", identity: "confirmed", page: 1, pageSize: 50 });
assert.equal(t010Approved.items.every((item) => item.status === "topic-approved" && item.identityStatus === "confirmed"), true);
const t010RenderSink = { innerHTML: "" };
renderGraphSignalPage(t010Graph, { page: 1, pageSize: 50 }, t010RenderSink);
assert.equal((t010RenderSink.innerHTML.match(/data-real-signal-card=/g) || []).length, 50, "R001/R003 production render sink must mount one page only");
assert.equal(t010RenderSink.innerHTML.includes("虚构演示区"), false, "R001 real render sink cannot mix mock copy");
const t010EmptySink = { innerHTML: "" };
renderGraphSignalPage({ ...t010Graph, signals: [] }, {}, t010EmptySink);
assert.match(t010EmptySink.innerHTML, /真实来源暂无线索/, "R001 zero real signals need a truthful empty state");

const t010LegacyReceipt = describeSourceReceipt({ id: "legacy", state: "active", displayName: "纯虚构旧来源" });
assert.equal(t010LegacyReceipt.importedAtLabel, "时间未记录");
assert.equal(t010LegacyReceipt.excludedLabel, "旧版导入未记录");
assert.equal(JSON.stringify(t010LegacyReceipt).includes('"excludedCount":0'), false, "R002 legacy receipt must not invent zero");
const t010Receipt = describeSourceReceipt(t010Graph.sources[0]);
assert.equal(t010Receipt.excludedLabel, "2");
assert.equal(t010Receipt.momentCountLabel, "12539");

const classificationGraph = structuredClone(t010Graph);
classificationGraph.people.push({ id: "fictional-pending-person", name: "纯虚构待确认", state: "pending", sourceScoped: true });
classificationGraph.mappings.push({ id: "fictional-pending-map", sourceId: t010SourceId, personId: "fictional-pending-person", status: "pending" });
classificationGraph.signals.push({ id: "fictional-pending-signal", sourceId: t010SourceId, personId: "fictional-pending-person", status: "pending", text: "纯虚构待确认线索" });
classificationGraph.signals.push({ id: "fictional-group-context", sourceId: t010SourceId, status: "internal", thirdParty: true, kind: "group_context", contextId: "C".repeat(64), contextLabel: "纯虚构群上下文", text: "纯虚构群消息" });
assert.throws(() => classifyGraphSignal(classificationGraph, "fictional-pending-signal", "topic-approved"), /signal-identity-unconfirmed/);
assert.throws(() => classifyGraphSignal(classificationGraph, "fictional-group-context", "topic-approved"), /signal-context-not-classifiable/);
assert.throws(() => classifyGraphSignal({ ...classificationGraph, sources: [{ ...classificationGraph.sources[0], state: "removed" }] }, t010Signals[1].id, "topic-approved"), /signal-source-inactive/);
const classifiedGraph = classifyGraphSignal(classificationGraph, t010Signals[1].id, "topic-approved");
assert.equal(classificationGraph.signals.find((item) => item.id === t010Signals[1].id).status, "pending", "R004 classification must clone the graph");
assert.equal(classifiedGraph.signals.find((item) => item.id === t010Signals[1].id).status, "topic-approved");
assert.equal(filterConfirmedKnowledge(classifiedGraph).signals.every((item) => item.status === "topic-approved" && item.personId), true);

const importedWithReceipt = buildImportedGraph(parsedFixture, null, { importedAt: now });
assert.equal(importedWithReceipt.sources[0].importedAt, now, "R002/R005 new import must persist its receipt time");
assert.equal(importedWithReceipt.sources[0].messageCount, parsedFixture.messages.length);
assert.equal(importedWithReceipt.sources[0].momentCount, parsedFixture.moments.length);
assert.equal(importedWithReceipt.sources[0].excludedCount, 0);
assert.equal(importedWithReceipt.signals[0].publishedAt, parsedFixture.moments[0].publishedAt);
assert.equal(importedWithReceipt.signals[0].time, parsedFixture.moments[0].time);
const receiptBackup = await createBackup(importedWithReceipt, "fictional t010 recovery phrase", { now });
const receiptAdapter = createMemoryVaultAdapter();
const receiptKey = await generateVaultKey();
await commitGraph(receiptAdapter, t010Graph, receiptKey, { now });
await restoreBackup(receiptAdapter, receiptKey, receiptBackup, "fictional t010 recovery phrase", { now: "2026-08-15T09:00:00.000Z" });
const receiptRestored = await loadActiveGraph(receiptAdapter, receiptKey);
assert.equal(receiptRestored.sources[0].importedAt, now, "R005 backup/restore must preserve receipt fields");
assert.equal(receiptRestored.signals[0].publishedAt, parsedFixture.moments[0].publishedAt, "R005 backup/restore must preserve moment time");
assert.equal(removeSource(importedWithReceipt, importedWithReceipt.sources[0].id).signals.length, 0, "R011 source removal must retire new signals");
assert.equal(purgePerson(importedWithReceipt, importedWithReceipt.people[0].id).signals.some((item) => item.personId === importedWithReceipt.people[0].id), false, "R011 person purge must remove new signals");

const fictionalSuiyinSource = "D6574DC5760F0E3FB79B6EF44E952E99B46C4ABDD9CE84F901F77C4DDC94ECEC";
const fictionalSuiyinPerson = "B".repeat(64);
const fictionalSuiyinScopeReceipt = {
  personaDeclaredCount: 3, personaReadCount: 3,
  allocationCount: 2, allocationDeclaredCount: 5, allocationMissingCount: 3, customerCount: 2,
  friendCount: 1, groupCount: 1, messageCount: 2, unreadableCount: 0, failureCount: 0, missingDisplayNameCount: 0, excludedCount: 3,
  perPersona: [
    { officialLabel: "1号", friendCount: 0, groupCount: 0, messageCount: 0, unreadableCount: 0, failureCount: 0, complete: false },
    { officialLabel: "2号", friendCount: 1, groupCount: 1, messageCount: 2, unreadableCount: 0, failureCount: 0, complete: false },
    { officialLabel: "虚构官方三号", friendCount: 0, groupCount: 0, messageCount: 0, unreadableCount: 0, failureCount: 0, complete: false },
  ],
  scopeKind: "current-allocation-partial-v1", scopeComplete: false, completeScopeUnavailableReason: "UPSTREAM_PERSONA_COHORT_UNAVAILABLE", unavailableReason: "allocation-snapshot-incomplete",
};
const fictionalSuiyinStaging = {
  ok: true,
  formalWriteCount: 0,
  source: { id: fictionalSuiyinSource, state: "active", displayName: "碎银", sourceKind: "suiyin-mcp", environment: "fictional-sandbox", sourceAccountLabels: { "SY-11223344": "2号", "SY-22334455": "1号", "SY-33445566": "虚构官方三号" }, sourceAccountWechatSourceLinks: {}, importedAt: now, ...structuredClone(fictionalSuiyinScopeReceipt), momentsUnsupported: true, attachmentsUnsupported: true },
  people: [{ id: fictionalSuiyinPerson, name: "纯虚构碎银联系人", state: "pending", sourceScoped: true }],
  mappings: [{ id: `${fictionalSuiyinSource}:${fictionalSuiyinPerson}`, sourceId: fictionalSuiyinSource, sourcePersonId: fictionalSuiyinPerson, personId: fictionalSuiyinPerson, sourceDisplayName: "纯虚构碎银联系人", sourceAccountAliases: ["SY-11223344"], status: "pending" }],
  excerpts: [{ id: "D".repeat(64), sourceId: fictionalSuiyinSource, personId: fictionalSuiyinPerson, kind: "chat-text", text: "纯虚构碎银问候", timestamp: "2026-08-15T08:00:00Z", direction: "customer", messageType: "text" }],
  signals: [{ id: "9".repeat(64), sourceId: fictionalSuiyinSource, status: "internal", thirdParty: true, kind: "group_context", contextId: "C".repeat(64), contextLabel: "纯虚构碎银群", text: "纯虚构群上下文", timestamp: "2026-08-15T08:01:00Z", messageType: "text" }],
  aggregate: structuredClone(fictionalSuiyinScopeReceipt),
  unsupported: { moments: true, attachments: true },
};
const suiyinTombstoneGraph = { ...structuredClone(t010Graph), purgedPersonIds: [fictionalSuiyinPerson] };
const beforeRejectedSuiyinMerge = structuredClone(suiyinTombstoneGraph);
assert.throws(() => mergeSuiyinImport(suiyinTombstoneGraph, fictionalSuiyinStaging), (error) => error?.code === "previously-purged" && error?.personIds?.includes(fictionalSuiyinPerson) && error?.reviewRequired === true, "E5-T010-F001 ordinary Suiyin merge must fail closed on a purge tombstone");
assert.deepEqual(suiyinTombstoneGraph, beforeRejectedSuiyinMerge, "E5-T010-F001 rejected Suiyin merge must leave the active graph unchanged");
const beforeSuiyinMerge = structuredClone(t010Graph);
const mergedSuiyin = mergeSuiyinImport(t010Graph, fictionalSuiyinStaging);
assert.deepEqual(t010Graph, beforeSuiyinMerge, "R009 staging merge must not mutate the active graph");
assert.equal(mergedSuiyin.people.some((item) => item.id === fictionalSuiyinPerson && item.state === "pending" && item.sourceScoped === true), true);
assert.equal(mergedSuiyin.people.some((item) => item.id === fictionalSuiyinStaging.signals[0].contextId), false, "R008 group context must never become a person");
assert.equal(mergedSuiyin.signals.some((item) => item.kind === "group_context" && !item.personId), true);
assert.equal(mergedSuiyin.sources.find((source) => source.id === fictionalSuiyinSource)?.allocationDeclaredCount, 5, "partial declared count must persist in the active graph");
assert.equal(mergedSuiyin.sources.find((source) => source.id === fictionalSuiyinSource)?.allocationMissingCount, 3, "partial missing count must persist in the active graph");
assert.deepEqual(mergeSuiyinImport(mergedSuiyin, fictionalSuiyinStaging), mergedSuiyin, "R006/R009 duplicate confirmed import must be idempotent");
const partialSuiyinGraph = mergeSuiyinImport(null, fictionalSuiyinStaging);

// T028 legal RED: a bounded current-allocation partial is upsert-only.  Seed
// six kinds of same-source facts outside the staged cohort; the issued T027
// baseline source-wide replaces excerpt/signal collections and loses them.
const t028OutsidePersonId = "E".repeat(64);
const t028OutsideConversationId = `suiyin:${fictionalSuiyinSource}:${t028OutsidePersonId}`;
const t028PartialSeed = structuredClone(partialSuiyinGraph);
t028PartialSeed.people.push({ id: t028OutsidePersonId, name: "纯虚构范围外人物", state: "active", sourceScoped: true });
t028PartialSeed.mappings.push({ id: `${fictionalSuiyinSource}:${t028OutsidePersonId}`, sourceId: fictionalSuiyinSource, sourcePersonId: t028OutsidePersonId, personId: t028OutsidePersonId, sourceDisplayName: "纯虚构范围外人物", sourceAccountAliases: ["SY-11223344"], status: "confirmed" });
t028PartialSeed.excerpts.push(
  { id: "1".repeat(64), sourceId: fictionalSuiyinSource, personId: t028OutsidePersonId, kind: "chat-text", text: "纯虚构范围外摘录", timestamp: "2026-08-14T08:00:00Z", direction: "counterparty", messageType: "text", conversationKind: "direct", conversationId: t028OutsideConversationId, thirdParty: false },
  { id: "3".repeat(64), sourceId: fictionalSuiyinSource, personId: t028OutsidePersonId, kind: "media-description", text: "图片（未下载）", timestamp: "2026-08-14T08:02:00Z", direction: "self", messageType: "image", conversationKind: "direct", conversationId: t028OutsideConversationId, thirdParty: false },
);
t028PartialSeed.signals.push(
  { id: "A".repeat(64), sourceId: fictionalSuiyinSource, status: "internal", thirdParty: true, kind: "group_context", contextId: "F".repeat(64), contextLabel: "纯虚构范围外群", text: "纯虚构范围外群上下文", timestamp: "2026-08-14T08:01:00Z", direction: "unknown", messageType: "text" },
  { id: "2".repeat(64), sourceId: fictionalSuiyinSource, personId: t028OutsidePersonId, status: "pending", thirdParty: false, kind: "recent_interaction", text: "纯虚构范围外信号", timestamp: "2026-08-14T08:03:00Z", direction: "counterparty", messageType: "text" },
);
const t028OutsideFactsBefore = {
  person: structuredClone(t028PartialSeed.people.find((item) => item.id === t028OutsidePersonId)),
  mapping: structuredClone(t028PartialSeed.mappings.find((item) => item.sourcePersonId === t028OutsidePersonId)),
  context: structuredClone(t028PartialSeed.signals.find((item) => item.id === "A".repeat(64))),
  excerpt: structuredClone(t028PartialSeed.excerpts.find((item) => item.id === "1".repeat(64))),
  signal: structuredClone(t028PartialSeed.signals.find((item) => item.id === "2".repeat(64))),
  message: structuredClone(t028PartialSeed.excerpts.find((item) => item.id === "3".repeat(64))),
};
const t028PartialSeedBefore = structuredClone(t028PartialSeed);
const t028PartialUpsert = mergeSuiyinImport(t028PartialSeed, fictionalSuiyinStaging);
assert.deepEqual(t028PartialSeed, t028PartialSeedBefore, "T028-O08 partial merge must not mutate its prior graph input");
assert.deepEqual({
  person: t028PartialUpsert.people.find((item) => item.id === t028OutsidePersonId),
  mapping: t028PartialUpsert.mappings.find((item) => item.sourcePersonId === t028OutsidePersonId),
  context: t028PartialUpsert.signals.find((item) => item.id === "A".repeat(64)),
  excerpt: t028PartialUpsert.excerpts.find((item) => item.id === "1".repeat(64)),
  signal: t028PartialUpsert.signals.find((item) => item.id === "2".repeat(64)),
  message: t028PartialUpsert.excerpts.find((item) => item.id === "3".repeat(64)),
}, t028OutsideFactsBefore, "T028-O08 current-allocation partial must deep-equal preserve six classes of out-of-scope same-source facts");

const t028CollisionGraph = structuredClone(partialSuiyinGraph);
const t028CollisionExcerpt = t028CollisionGraph.excerpts.find((item) => item.id === fictionalSuiyinStaging.excerpts[0].id);
t028CollisionExcerpt.kind = "media-description";
const t028CollisionBefore = structuredClone(t028CollisionGraph);
assert.throws(() => mergeSuiyinImport(t028CollisionGraph, fictionalSuiyinStaging), (error) => error?.code === "SUIYIN_STAGING_REFERENCE_INVALID", "T028-O08 same stable source ID with conflicting immutable history identity must fail closed");
assert.deepEqual(t028CollisionGraph, t028CollisionBefore, "T028-O08 immutable collision rejection must preserve the prior graph");

const t028SetSinglePersonaCounts = (staging, { friendCount, groupCount, messageCount }) => {
  for (const receipt of [staging.source, staging.aggregate]) {
    receipt.allocationCount = friendCount + groupCount;
    receipt.allocationMissingCount = receipt.allocationDeclaredCount - receipt.allocationCount;
    receipt.customerCount = receipt.allocationCount;
    receipt.friendCount = friendCount;
    receipt.groupCount = groupCount;
    receipt.messageCount = messageCount;
    receipt.perPersona = receipt.perPersona.map((persona) => ({ ...persona, friendCount: persona.officialLabel === "2号" ? friendCount : 0, groupCount: persona.officialLabel === "2号" ? groupCount : 0, messageCount: persona.officialLabel === "2号" ? messageCount : 0 }));
  }
  return staging;
};

const t028IncomingGroupCollision = t028SetSinglePersonaCounts(structuredClone(fictionalSuiyinStaging), { friendCount: 0, groupCount: 1, messageCount: 1 });
t028IncomingGroupCollision.people = [];
t028IncomingGroupCollision.mappings = [];
t028IncomingGroupCollision.excerpts = [];
t028IncomingGroupCollision.signals[0].id = "5".repeat(64);
t028IncomingGroupCollision.signals[0].contextId = fictionalSuiyinPerson;
const t028IncomingGroupBefore = structuredClone(t028IncomingGroupCollision);
const t028FriendPriorBefore = structuredClone(partialSuiyinGraph);
assert.throws(() => mergeSuiyinImport(partialSuiyinGraph, t028IncomingGroupCollision), (error) => error?.code === "SUIYIN_STAGING_REFERENCE_INVALID", "T028-O08 incoming group contextId must not reuse an existing same-source friend sourcePersonId");
assert.deepEqual(partialSuiyinGraph, t028FriendPriorBefore, "T028-O08 friend-to-group kind collision must preserve prior graph");
assert.deepEqual(t028IncomingGroupCollision, t028IncomingGroupBefore, "T028-O08 friend-to-group kind collision must preserve staging");

const t028IncomingFriendCollision = t028SetSinglePersonaCounts(structuredClone(fictionalSuiyinStaging), { friendCount: 1, groupCount: 0, messageCount: 1 });
t028IncomingFriendCollision.signals = [];
t028IncomingFriendCollision.people[0].id = fictionalSuiyinStaging.signals[0].contextId;
t028IncomingFriendCollision.mappings[0].id = `${fictionalSuiyinSource}:${fictionalSuiyinStaging.signals[0].contextId}`;
t028IncomingFriendCollision.mappings[0].sourcePersonId = fictionalSuiyinStaging.signals[0].contextId;
t028IncomingFriendCollision.mappings[0].personId = fictionalSuiyinStaging.signals[0].contextId;
t028IncomingFriendCollision.excerpts[0].id = "4".repeat(64);
t028IncomingFriendCollision.excerpts[0].personId = fictionalSuiyinStaging.signals[0].contextId;
const t028IncomingFriendBefore = structuredClone(t028IncomingFriendCollision);
const t028GroupPriorBefore = structuredClone(partialSuiyinGraph);
assert.throws(() => mergeSuiyinImport(partialSuiyinGraph, t028IncomingFriendCollision), (error) => error?.code === "SUIYIN_STAGING_REFERENCE_INVALID", "T028-O08 incoming friend sourcePersonId must not reuse an existing same-source group contextId");
assert.deepEqual(partialSuiyinGraph, t028GroupPriorBefore, "T028-O08 group-to-friend kind collision must preserve prior graph");
assert.deepEqual(t028IncomingFriendCollision, t028IncomingFriendBefore, "T028-O08 group-to-friend kind collision must preserve staging");

const t028SetMessageCount = (staging, messageCount) => {
  for (const receipt of [staging.source, staging.aggregate]) {
    receipt.messageCount = messageCount;
    receipt.perPersona = receipt.perPersona.map((persona) => ({ ...persona, messageCount: persona.officialLabel === "2号" ? messageCount : 0 }));
  }
  return staging;
};

// T028 count units are intentionally different: one group customer/context may
// own multiple readable message signals.  A valid receipt therefore closes
// messageCount over content rows, never groupCount over signal rows.
const t028RepeatedGroupMessages = t028SetMessageCount(structuredClone(fictionalSuiyinStaging), 3);
t028RepeatedGroupMessages.signals.push({ ...structuredClone(t028RepeatedGroupMessages.signals[0]), id: "6".repeat(64), text: "纯虚构同群第二条消息", timestamp: "2026-08-15T08:02:00Z" });
const t028RepeatedGroupMerged = mergeSuiyinImport(null, t028RepeatedGroupMessages);
assert.equal(t028RepeatedGroupMerged.sources.find((source) => source.id === fictionalSuiyinSource)?.groupCount, 1, "T028-O05 one group customer must remain one group even when it has multiple messages");
assert.equal(t028RepeatedGroupMerged.signals.filter((signal) => signal.kind === "group_context").length, 2, "T028-O05 readable group messages are message rows, not group customers");

const t028AssertReceiptRejects = (caseName, staging, expectedCode) => {
  const priorBefore = structuredClone(partialSuiyinGraph);
  const stagingBefore = structuredClone(staging);
  assert.throws(() => mergeSuiyinImport(partialSuiyinGraph, staging), (error) => error?.code === expectedCode, `T028-O05 ${caseName} must fail closed`);
  assert.deepEqual(partialSuiyinGraph, priorBefore, `T028-O05 ${caseName} must preserve the prior graph`);
  assert.deepEqual(staging, stagingBefore, `T028-O05 ${caseName} must preserve staging`);
};

const t028CustomerAllocationDrift = structuredClone(fictionalSuiyinStaging);
for (const receipt of [t028CustomerAllocationDrift.source, t028CustomerAllocationDrift.aggregate]) {
  receipt.customerCount = 3;
  receipt.missingDisplayNameCount = 1;
}
t028AssertReceiptRejects("customer/allocation arithmetic drift", t028CustomerAllocationDrift, "SUIYIN_STAGING_SOURCE_MISMATCH");

const t028CustomerKindDrift = structuredClone(fictionalSuiyinStaging);
for (const receipt of [t028CustomerKindDrift.source, t028CustomerKindDrift.aggregate]) receipt.missingDisplayNameCount = 1;
t028AssertReceiptRejects("friend/group/missing-name arithmetic drift", t028CustomerKindDrift, "SUIYIN_STAGING_SOURCE_MISMATCH");

const t028FriendArrayDrift = t028SetMessageCount(structuredClone(fictionalSuiyinStaging), 1);
t028FriendArrayDrift.people = [];
t028FriendArrayDrift.mappings = [];
t028FriendArrayDrift.excerpts = [];
t028AssertReceiptRejects("friend count without staged people", t028FriendArrayDrift, "SUIYIN_STAGING_REFERENCE_INVALID");

const t028MessageArrayDrift = t028SetMessageCount(structuredClone(fictionalSuiyinStaging), 999);
t028AssertReceiptRejects("message count without staged content", t028MessageArrayDrift, "SUIYIN_STAGING_REFERENCE_INVALID");

// T028V2-O04 legal RED.  These fixtures are deliberately separate from the
// frozen v1 partial regression above: v2 must accept the corrected local
// adapter reason and a proof-closed persona-complete receipt, while rejecting
// every incomplete complete-claim before any encrypted-vault write.  All
// values and identifiers in this section are code-authored fiction.
const t028V2CorrectedPartialStaging = structuredClone(fictionalSuiyinStaging);
for (const receipt of [t028V2CorrectedPartialStaging.source, t028V2CorrectedPartialStaging.aggregate]) {
  receipt.completeScopeUnavailableReason = "LOCAL_SUIYIN_ADAPTER_RECEIPT_INCOMPLETE";
  receipt.adapterReceipt = {
    appliedScope: false,
    paginationComplete: true,
    completenessComplete: false,
  };
}

const t028V2CompleteStaging = structuredClone(fictionalSuiyinStaging);
for (const receipt of [t028V2CompleteStaging.source, t028V2CompleteStaging.aggregate]) {
  receipt.allocationDeclaredCount = 2;
  receipt.allocationCount = 2;
  receipt.allocationMissingCount = 0;
  receipt.customerCount = 2;
  receipt.scopeKind = "persona-complete-v1";
  receipt.scopeComplete = true;
  delete receipt.completeScopeUnavailableReason;
  delete receipt.unavailableReason;
  receipt.perPersona = receipt.perPersona.map((persona) => ({ ...persona, complete: true }));
  receipt.adapterReceipt = {
    appliedScope: true,
    paginationComplete: true,
    completenessComplete: true,
  };
}

assert.equal(
  JSON.stringify([t028V2CorrectedPartialStaging, t028V2CompleteStaging]).includes("UPSTREAM_PERSONA_COHORT_UNAVAILABLE"),
  false,
  "T028V2-O04 active v2 fixtures must not retain the withdrawn upstream capability blocker",
);

const t028V2O04Failures = [];
const t028V2ExpectAccepted = (caseName, staging, verify) => {
  const prior = structuredClone(partialSuiyinGraph);
  const priorBefore = structuredClone(prior);
  const stagingBefore = structuredClone(staging);
  try {
    const merged = mergeSuiyinImport(prior, staging);
    verify(merged);
  } catch (error) {
    t028V2O04Failures.push(`${caseName}: rejected ${error?.code || error?.message || error}`);
  }
  if (JSON.stringify(prior) !== JSON.stringify(priorBefore)) t028V2O04Failures.push(`${caseName}: mutated prior graph`);
  if (JSON.stringify(staging) !== JSON.stringify(stagingBefore)) t028V2O04Failures.push(`${caseName}: mutated staging`);
};

t028V2ExpectAccepted("corrected current-allocation partial", t028V2CorrectedPartialStaging, (merged) => {
  const source = merged.sources.find((item) => item.id === fictionalSuiyinSource);
  assert.equal(source?.scopeKind, "current-allocation-partial-v1");
  assert.equal(source?.scopeComplete, false);
  assert.equal(source?.completeScopeUnavailableReason, "LOCAL_SUIYIN_ADAPTER_RECEIPT_INCOMPLETE");
  assert.deepEqual(source?.adapterReceipt, { appliedScope: false, paginationComplete: true, completenessComplete: false });
});

t028V2ExpectAccepted("proof-closed persona complete", t028V2CompleteStaging, (merged) => {
  const source = merged.sources.find((item) => item.id === fictionalSuiyinSource);
  assert.deepEqual(
    {
      personaDeclaredCount: source?.personaDeclaredCount,
      personaReadCount: source?.personaReadCount,
      scopeKind: source?.scopeKind,
      scopeComplete: source?.scopeComplete,
      failureCount: source?.failureCount,
      everyPersonaComplete: source?.perPersona?.every((persona) => persona.complete === true),
      adapterReceipt: source?.adapterReceipt,
    },
    {
      personaDeclaredCount: 3,
      personaReadCount: 3,
      scopeKind: "persona-complete-v1",
      scopeComplete: true,
      failureCount: 0,
      everyPersonaComplete: true,
      adapterReceipt: { appliedScope: true, paginationComplete: true, completenessComplete: true },
    },
  );
});

const t028V2InvalidCompleteCases = [
  ["3/3 roster missing", (staging) => {
    for (const receipt of [staging.source, staging.aggregate]) receipt.personaReadCount = 2;
  }],
  ["scope kind missing", (staging) => {
    for (const receipt of [staging.source, staging.aggregate]) delete receipt.scopeKind;
  }],
  ["applied scope proof missing", (staging) => {
    for (const receipt of [staging.source, staging.aggregate]) delete receipt.adapterReceipt.appliedScope;
  }],
  ["pagination proof missing", (staging) => {
    for (const receipt of [staging.source, staging.aggregate]) delete receipt.adapterReceipt.paginationComplete;
  }],
  ["completeness proof missing", (staging) => {
    for (const receipt of [staging.source, staging.aggregate]) delete receipt.adapterReceipt.completenessComplete;
  }],
  ["persona completeness missing", (staging) => {
    for (const receipt of [staging.source, staging.aggregate]) receipt.perPersona[0].complete = false;
  }],
];

const t028V2ZeroWriteAdapter = createMemoryVaultAdapter();
const t028V2ZeroWriteKey = await generateVaultKey();
await commitGraph(t028V2ZeroWriteAdapter, partialSuiyinGraph, t028V2ZeroWriteKey, { now });
for (const [caseName, poison] of t028V2InvalidCompleteCases) {
  const staging = structuredClone(t028V2CompleteStaging);
  poison(staging);
  const stagingBefore = structuredClone(staging);
  const prior = structuredClone(partialSuiyinGraph);
  const priorBefore = structuredClone(prior);
  const vaultBefore = t028V2ZeroWriteAdapter.dump();
  let rejection = null;
  try {
    const merged = mergeSuiyinImport(prior, staging);
    await commitGraph(t028V2ZeroWriteAdapter, merged, t028V2ZeroWriteKey, { now: "2026-08-20T08:28:00.000Z" });
  } catch (error) {
    rejection = error;
  }
  if (!rejection || !["SUIYIN_STAGING_SOURCE_MISMATCH", "SUIYIN_STAGING_REFERENCE_INVALID"].includes(rejection.code)) {
    t028V2O04Failures.push(`${caseName}: invalid complete was not rejected by the strict staging gate`);
  }
  if (JSON.stringify(prior) !== JSON.stringify(priorBefore)) t028V2O04Failures.push(`${caseName}: mutated prior graph`);
  if (JSON.stringify(staging) !== JSON.stringify(stagingBefore)) t028V2O04Failures.push(`${caseName}: mutated staging`);
  if (JSON.stringify(t028V2ZeroWriteAdapter.dump()) !== JSON.stringify(vaultBefore)) t028V2O04Failures.push(`${caseName}: wrote an encrypted-vault generation`);
}

assert.deepEqual(t028V2O04Failures, [], `T028V2-O04 strict corrected partial/complete receipt failures:\n${t028V2O04Failures.join("\n")}`);

const partialSuiyinBackup = await createBackup(partialSuiyinGraph, "fictional partial allocation phrase", { now });
const partialSuiyinRestoreAdapter = createMemoryVaultAdapter();
const partialSuiyinRestoreKey = await generateVaultKey();
await commitGraph(partialSuiyinRestoreAdapter, partialSuiyinGraph, partialSuiyinRestoreKey, { now });
await restoreBackup(partialSuiyinRestoreAdapter, partialSuiyinRestoreKey, partialSuiyinBackup, "fictional partial allocation phrase", { now: "2026-08-15T09:00:30.000Z" });
const restoredPartialSuiyin = await loadActiveGraph(partialSuiyinRestoreAdapter, partialSuiyinRestoreKey);
assert.equal(restoredPartialSuiyin.sources.find((source) => source.id === fictionalSuiyinSource)?.allocationDeclaredCount, 5, "backup restore must preserve partial declared count");
assert.equal(restoredPartialSuiyin.sources.find((source) => source.id === fictionalSuiyinSource)?.allocationMissingCount, 3, "backup restore must preserve partial missing count");
assert.deepEqual(Object.fromEntries(["personaDeclaredCount", "personaReadCount", "scopeKind", "scopeComplete", "completeScopeUnavailableReason"].map((field) => [field, restoredPartialSuiyin.sources.find((source) => source.id === fictionalSuiyinSource)?.[field]])), { personaDeclaredCount: 3, personaReadCount: 3, scopeKind: "current-allocation-partial-v1", scopeComplete: false, completeScopeUnavailableReason: "UPSTREAM_PERSONA_COHORT_UNAVAILABLE" }, "T028-O08 backup restore must preserve the truthful partial scope receipt");
assert.deepEqual(restoredPartialSuiyin.sources.find((source) => source.id === fictionalSuiyinSource)?.perPersona, fictionalSuiyinScopeReceipt.perPersona, "T028-O08 backup restore must preserve the strict per-persona receipt");
const t028InvalidReceiptBackupGraph = structuredClone(partialSuiyinGraph);
t028InvalidReceiptBackupGraph.sources.find((source) => source.id === fictionalSuiyinSource).perPersona[0].complete = true;
const t028InvalidReceiptBackup = await encryptBackupFixture({ version: 2, createdAt: now, mode: "complete-replace", graph: minimizeGraph(t028InvalidReceiptBackupGraph) }, "fictional t028 invalid receipt phrase");
const t028InvalidReceiptRestoreBefore = partialSuiyinRestoreAdapter.dump();
await assert.rejects(() => restoreBackup(partialSuiyinRestoreAdapter, partialSuiyinRestoreKey, t028InvalidReceiptBackup, "fictional t028 invalid receipt phrase", { now: "2026-08-15T09:00:45.000Z" }), /invalid-backup-graph/, "T028-O08 malformed nested scope receipt must fail closed during restore");
assert.deepEqual(partialSuiyinRestoreAdapter.dump(), t028InvalidReceiptRestoreBefore, "T028-O08 rejected scope receipt restore must preserve the active encrypted graph");
const t028ArithmeticBackupGraph = structuredClone(partialSuiyinGraph);
const t028ArithmeticBackupReceipt = t028ArithmeticBackupGraph.sources.find((source) => source.id === fictionalSuiyinSource);
t028ArithmeticBackupReceipt.customerCount = 3;
t028ArithmeticBackupReceipt.missingDisplayNameCount = 1;
const t028ArithmeticBackup = await encryptBackupFixture({ version: 2, createdAt: now, mode: "complete-replace", graph: minimizeGraph(t028ArithmeticBackupGraph) }, "fictional t028 arithmetic receipt phrase");
const t028ArithmeticRestoreBefore = partialSuiyinRestoreAdapter.dump();
await assert.rejects(() => restoreBackup(partialSuiyinRestoreAdapter, partialSuiyinRestoreKey, t028ArithmeticBackup, "fictional t028 arithmetic receipt phrase", { now: "2026-08-15T09:00:46.000Z" }), /invalid-backup-graph/, "T028-O05 impossible receipt arithmetic must fail closed during encrypted restore");
assert.deepEqual(partialSuiyinRestoreAdapter.dump(), t028ArithmeticRestoreBefore, "T028-O05 rejected arithmetic receipt restore must preserve the active encrypted graph");

for (const [caseName, poison, expectedCode] of [
  ["complete masquerade", (staging) => { staging.source.scopeComplete = true; staging.aggregate.scopeComplete = true; }, "SUIYIN_STAGING_SOURCE_MISMATCH"],
  ["persona placeholder", (staging) => { staging.source.perPersona[0].officialLabel = "账号待补"; staging.aggregate.perPersona[0].officialLabel = "账号待补"; }, "SUIYIN_STAGING_SOURCE_MISMATCH"],
  ["aggregate drift", (staging) => { staging.aggregate.messageCount += 1; }, "SUIYIN_STAGING_REFERENCE_INVALID"],
]) {
  const poisoned = structuredClone(fictionalSuiyinStaging);
  poison(poisoned);
  const poisonedBefore = structuredClone(poisoned);
  assert.throws(() => mergeSuiyinImport(partialSuiyinGraph, poisoned), (error) => error?.code === expectedCode, `T028-O05/O07 ${caseName} receipt must fail closed`);
  assert.deepEqual(poisoned, poisonedBefore, `T028-O05/O07 ${caseName} rejection must not mutate staging`);
}
const suiyinCommitAdapter = createMemoryVaultAdapter();
const suiyinCommitKey = await generateVaultKey();
await commitGraph(suiyinCommitAdapter, t010Graph, suiyinCommitKey, { now });
const beforeConfirmState = suiyinCommitAdapter.dump();
assert.deepEqual(suiyinCommitAdapter.dump(), beforeConfirmState, "R009 preview-only staging must have formalWriteCount=0");
await commitGraph(suiyinCommitAdapter, mergedSuiyin, suiyinCommitKey, { now: "2026-08-15T09:01:00.000Z" });
assert.equal(suiyinCommitAdapter.dump().generations.length, beforeConfirmState.generations.length + 1, "R009 explicit confirm must create exactly one generation");
const reopenedPartialSuiyin = await loadActiveGraph(suiyinCommitAdapter, suiyinCommitKey);
assert.equal(reopenedPartialSuiyin.sources.find((source) => source.id === fictionalSuiyinSource)?.allocationDeclaredCount, 5, "normal vault reopen must preserve partial declared count");
assert.equal(reopenedPartialSuiyin.sources.find((source) => source.id === fictionalSuiyinSource)?.allocationMissingCount, 3, "normal vault reopen must preserve partial missing count");

// T013 real relationship facts and metadata-only local candidates. Every name,
// message and source below is code-local fiction; no real vault or MCP is read.
const t013WechatSource = "t013-fictional-wechat-source";
const t013SuiyinSource = "t013-fictional-suiyin-source";
const t013Person = "t013-fictional-person";
const t013LegacyIdentityIdPerson = "t013-fictional-legacy-identity-id-person";
const t013LegacyMappingFieldPerson = "t013-fictional-legacy-mapping-field-person";
const t013LegacyGraph = {
  owner: "t013-fictional-owner",
  sources: [{ id: t013WechatSource, state: "active", sourceKind: "wechat-export-toolkit", displayName: "纯虚构微信来源" }],
  people: [
    { id: t013Person, name: "纯虚构人物星河", state: "active" },
    { id: t013LegacyIdentityIdPerson, name: "纯虚构旧ID人物", state: "active" },
    { id: t013LegacyMappingFieldPerson, name: "纯虚构旧字段人物", state: "active" },
  ],
  excerpts: [{ id: "t013-legacy-excerpt", sourceId: t013WechatSource, personId: t013Person, kind: "chat-text", text: "POISON_T013_LEGACY_BODY", timestamp: "2026-01-01T08:00:00.000Z" }],
  mappings: [
    { id: "t013-legacy-map", sourceId: t013WechatSource, personId: t013Person, status: "confirmed" },
    { id: "t013-legacy-identity-id-map", sourceId: t013WechatSource, personId: t013LegacyIdentityIdPerson, status: "confirmed" },
    { id: "t013-legacy-mapping-field-map", sourceId: t013WechatSource, personId: t013LegacyMappingFieldPerson, status: "confirmed" },
  ],
  relationships: [
    { id: "t013-exact-label-pseudo", personId: t013Person, sourceIds: [t013WechatSource], status: "confirmed", label: "　身份已确认　", recommendationEligible: true, draftEligible: true },
    { id: "t013-legitimate-label", personId: t013Person, sourceIds: [t013WechatSource], status: "confirmed", label: "朋友" },
    { id: "identity-t013-legitimate-friend", personId: t013LegacyIdentityIdPerson, sourceIds: [t013WechatSource], status: "confirmed", label: "朋友" },
    { id: "t013-legitimate-friend-with-mapping-field", identityMappingId: "t013-legacy-mapping-field-map", personId: t013LegacyMappingFieldPerson, sourceIds: [t013WechatSource], status: "confirmed", label: "朋友" },
  ],
  dictionary: [{ id: "t013-legacy-dictionary", label: "自定义旧标签", status: "active" }],
  signals: [], topics: [], notes: [], actions: [], trash: [], purgedPersonIds: [], settings: { schema: 1 },
};
const t013LegacyBefore = structuredClone(t013LegacyGraph);
const t013Upgraded = upgradeRelationshipGraphV2(t013LegacyGraph);
assert.deepEqual(t013LegacyGraph, t013LegacyBefore, "R012 schema upgrade must clone its v1 input");
assert.equal(t013Upgraded.settings.schema, 2);
assert.equal(t013Upgraded.relationships.some((item) => item.label === "身份已确认" || item.identityMappingId), false, "R004/R012 legacy identity pseudo-label must be removed");
assert.deepEqual(t013Upgraded.relationships.map((item) => [item.id, item.personId, item.label, item.status, item.source]), [
  ["t013-legitimate-label", t013Person, "朋友", "current", "legacy-unknown"],
  ["identity-t013-legitimate-friend", t013LegacyIdentityIdPerson, "朋友", "current", "legacy-unknown"],
  ["t013-legitimate-friend-with-mapping-field", t013LegacyMappingFieldPerson, "朋友", "current", "legacy-unknown"],
], "R012 only the exact normalized identity label may be deleted; legacy identity-shaped ID/control fields on a legitimate 朋友 fact must be stripped but the fact must survive");
assert.deepEqual(upgradeRelationshipGraphV2(t013Upgraded), t013Upgraded, "R012 v1-to-v2 upgrade must be idempotent");
assert.throws(() => upgradeRelationshipGraphV2({ ...t013LegacyGraph, settings: { schema: 99 } }), (error) => error?.code === "RELATIONSHIP_SCHEMA_INVALID");

const t013LegacyLoadAdapter = createMemoryVaultAdapter();
const t013LegacyLoadKey = await generateVaultKey();
const t013LegacyEnvelope = await encryptEnvelope(minimizeGraph(t013LegacyGraph), t013LegacyLoadKey);
await t013LegacyLoadAdapter.transaction((draft) => { draft.generations.push({ id: "t013-v1-generation", createdAt: now, envelope: t013LegacyEnvelope }); draft.activeGeneration = "t013-v1-generation"; });
const t013LoadWrites = t013LegacyLoadAdapter.writeCount;
const t013LegacyStateBefore = t013LegacyLoadAdapter.dump();
assert.deepEqual(await loadActiveGraph(t013LegacyLoadAdapter, t013LegacyLoadKey, { now: "2026-08-15T07:59:00.000Z" }), t013Upgraded, "R012 opening a v1 graph must expose only the validated v2 graph");
assert.equal(t013LegacyLoadAdapter.writeCount, t013LoadWrites + 1, "R012 successful v1 migration must atomically create exactly one generation");
assert.equal(t013LegacyLoadAdapter.dump().generations.length, t013LegacyStateBefore.generations.length + 1);
const t013MigratedWrites = t013LegacyLoadAdapter.writeCount;
assert.deepEqual(await loadActiveGraph(t013LegacyLoadAdapter, t013LegacyLoadKey), t013Upgraded);
assert.equal(t013LegacyLoadAdapter.writeCount, t013MigratedWrites, "R012 reopening migrated v2 graph must be idempotent with zero additional generation");
const t013MigrationFailureAdapter = createMemoryVaultAdapter();
await t013MigrationFailureAdapter.transaction((draft) => { draft.generations.push({ id: "t013-v1-failure-generation", createdAt: now, envelope: t013LegacyEnvelope }); draft.activeGeneration = "t013-v1-failure-generation"; });
const t013MigrationFailureBefore = t013MigrationFailureAdapter.dump();
t013MigrationFailureAdapter.failNextCommit("t013-fictional-migration-failure");
await assert.rejects(() => loadActiveGraph(t013MigrationFailureAdapter, t013LegacyLoadKey), (error) => error?.code === "RELATIONSHIP_MIGRATION_FAILED");
assert.deepEqual(t013MigrationFailureAdapter.dump(), t013MigrationFailureBefore, "R012 migration failure must preserve the old active generation byte-semantically");

const t013V1BackupPhrase = "fictional t013 v1 backup phrase";
const t013V1Backup = await encryptBackupFixture({ version: 1, createdAt: now, mode: "complete-replace", graph: minimizeGraph(t013LegacyGraph) }, t013V1BackupPhrase);
assert.equal((await readBackupPreview(t013V1Backup, t013V1BackupPhrase)).version, 1, "R009 approved v1 encrypted backup must remain readable");
const t013V1RestoreAdapter = createMemoryVaultAdapter();
const t013V1RestoreKey = await generateVaultKey();
await commitGraph(t013V1RestoreAdapter, { owner: "t013-v1-restore-base", sources: [], people: [], excerpts: [], mappings: [], relationships: [], dictionary: [], signals: [], topics: [], notes: [], actions: [], trash: [], purgedPersonIds: [], settings: { schema: 2 } }, t013V1RestoreKey, { now });
const t013V1RestoreGenerationCount = t013V1RestoreAdapter.dump().generations.length;
await restoreBackup(t013V1RestoreAdapter, t013V1RestoreKey, t013V1Backup, t013V1BackupPhrase, { now: "2026-08-15T07:59:30.000Z" });
assert.equal(t013V1RestoreAdapter.dump().generations.length, t013V1RestoreGenerationCount + 1, "R009 v1 backup restore must be one atomic replacement generation");
const t013V1Restored = await loadActiveGraph(t013V1RestoreAdapter, t013V1RestoreKey);
assert.equal(t013V1Restored.settings.schema, 2);
assert.equal(t013V1Restored.relationships.some((item) => item.label === "身份已确认" || item.identityMappingId), false, "R009/R012 v1 backup restore must remove only the identity pseudo-relationship");
assert.deepEqual(t013V1Restored.mappings, t013Upgraded.mappings, "R009/R012 v1 backup restore must preserve mapping decisions");
assert.deepEqual(t013V1Restored.relationships, t013Upgraded.relationships, "R009/R012 v1 backup restore must preserve legitimate labels without fabricated evidence");

const t013DirectRecords = (sourceId, conversationId, total, days, selfCount, prefix) => Array.from({ length: total }, (_, index) => ({
  id: `${prefix}-${index}`,
  sourceId,
  personId: t013Person,
  kind: "chat-text",
  conversationKind: "direct",
  conversationId,
  direction: index < selfCount ? "self" : "counterparty",
  thirdParty: false,
  timestamp: new Date(Date.UTC(2026, 6, 1 + (index % days), 8, index)).toISOString(),
  text: `POISON_T013_BODY_${prefix}_${index}`,
}));
const t013CandidateGraph = {
  owner: "t013-fictional-owner",
  sources: [
    { id: t013WechatSource, state: "active", sourceKind: "wechat-export-toolkit", displayName: "纯虚构微信来源" },
    { id: t013SuiyinSource, state: "active", sourceKind: "suiyin-mcp", displayName: "纯虚构碎银来源" },
    { id: "t013-removed-source", state: "removed", sourceKind: "wechat-export-toolkit", displayName: "纯虚构已移除来源" },
  ],
  people: [{ id: t013Person, name: "纯虚构人物星河", state: "active" }, { id: "t013-pending-person", name: "纯虚构待确认人物", state: "pending" }],
  excerpts: [
    ...t013DirectRecords(t013WechatSource, "t013-wechat-conversation", 8, 3, 4, "t013-wechat"),
    ...t013DirectRecords(t013SuiyinSource, "t013-suiyin-conversation", 4, 2, 2, "t013-suiyin"),
    { ...t013DirectRecords(t013WechatSource, "t013-group", 1, 1, 1, "t013-group")[0], id: "t013-group-only", conversationKind: "group", thirdParty: true },
    { ...t013DirectRecords("t013-removed-source", "t013-removed", 1, 1, 1, "t013-removed")[0], id: "t013-removed-only" },
    { id: "t013-old-missing-provenance", sourceId: t013WechatSource, personId: t013Person, kind: "chat-text", timestamp: "2026-07-01T08:00:00.000Z", text: "POISON_T013_OLD" },
  ],
  mappings: [
    { id: "t013-map-wechat", sourceId: t013WechatSource, personId: t013Person, status: "confirmed" },
    { id: "t013-map-suiyin", sourceId: t013SuiyinSource, personId: t013Person, status: "confirmed" },
    { id: "t013-map-removed", sourceId: "t013-removed-source", personId: t013Person, status: "confirmed" },
    { id: "t013-map-pending", sourceId: t013WechatSource, personId: "t013-pending-person", status: "pending" },
  ],
  relationships: [], dictionary: [], signals: [], topics: [], notes: [], actions: [], trash: [], purgedPersonIds: [], settings: { schema: 2 },
};
const t013CandidateBefore = structuredClone(t013CandidateGraph);
const t013Evaluation = evaluateRelationshipLabelCandidates(t013CandidateGraph, { personId: t013Person, now: "2026-08-15T00:00:00.000Z" });
assert.deepEqual(t013CandidateGraph, t013CandidateBefore, "R005 evaluator must leave the encrypted graph projection unchanged");
assert.deepEqual(t013Evaluation.candidates.map((item) => item.label), ["客户", "朋友"], "R005 approved source/threshold/score order must be deterministic");
assert.equal(t013Evaluation.candidates.every((item) => item.status === "pending"), true);
const t013EvaluationJson = JSON.stringify(t013Evaluation);
for (const forbidden of ["POISON_T013", t013WechatSource, t013SuiyinSource, "t013-wechat-conversation", "t013Person", '"text"']) assert.equal(t013EvaluationJson.includes(forbidden), false, `R010 evaluator leaked forbidden body/raw provenance: ${forbidden}`);
const t013PoisonChanged = structuredClone(t013CandidateGraph);
t013PoisonChanged.excerpts.forEach((item) => { item.text = `CHANGED_POISON_${item.id}`; });
assert.deepEqual(evaluateRelationshipLabelCandidates(t013PoisonChanged, { personId: t013Person, now: "2026-08-15T00:00:00.000Z" }), t013Evaluation, "R010 body-only changes must be byte-semantic no-ops");
const t013Reordered = structuredClone(t013CandidateGraph);
t013Reordered.excerpts = [...t013Reordered.excerpts].reverse().concat(structuredClone(t013Reordered.excerpts[0]));
assert.deepEqual(evaluateRelationshipLabelCandidates(t013Reordered, { personId: t013Person, now: "2026-08-15T00:00:00.000Z" }), t013Evaluation, "R005 input order and identical stable duplicates must not affect candidates");
const t013OldOnly = { ...structuredClone(t013CandidateGraph), excerpts: [structuredClone(t013CandidateGraph.excerpts.at(-1))] };
assert.equal(evaluateRelationshipLabelCandidates(t013OldOnly, { personId: t013Person, now: "2026-08-15T00:00:00.000Z" }).code, "RELATIONSHIP_EVIDENCE_INSUFFICIENT", "R008 old missing provenance must fail closed");
assert.equal(evaluateRelationshipLabelCandidates({ ...structuredClone(t013CandidateGraph), people: [{ id: t013Person, name: "纯虚构人物星河", state: "pending" }] }, { personId: t013Person, now: "2026-08-15T00:00:00.000Z" }).code, "RELATIONSHIP_PERSON_INELIGIBLE", "R007 pending identity must be ineligible");

const t013Manual = mutateRelationshipFacts(t013CandidateGraph, { operation: "add", personId: t013Person, label: "  重要伙伴  ", decisionId: "t013-manual-add", at: now });
assert.equal(t013Manual.changed, true);
assert.equal(t013Manual.formalWriteCount, 1);
assert.equal(t013Manual.graph.relationships[0].label, "重要伙伴");
assert.equal(t013Manual.graph.dictionary.some((item) => item.label === "重要伙伴" && item.scope === "custom"), true, "R002 custom dictionary and fact must be one graph mutation");
assert.deepEqual(t013CandidateGraph, t013CandidateBefore, "R003 manual mutation must clone the input graph");
const t013Accepted = mutateRelationshipFacts(t013Manual.graph, { operation: "accept", personId: t013Person, candidate: t013Evaluation.candidates[0], decisionId: "t013-accept-customer", at: "2026-08-15T08:01:00.000Z" });
assert.equal(t013Accepted.graph.relationships.find((item) => item.label === "客户")?.source, "local-evaluation-confirmed");
assert.equal(JSON.stringify(t013Accepted.graph.relationships).includes("POISON_T013"), false);
const t013Replay = mutateRelationshipFacts(t013Accepted.graph, { operation: "accept", personId: t013Person, candidate: t013Evaluation.candidates[0], decisionId: "t013-accept-customer", at: "2026-08-15T08:01:00.000Z" });
assert.equal(t013Replay.changed, false);
assert.equal(t013Replay.formalWriteCount, 0, "R006 replay must require no second generation");
const t013MutationAdapter = createMemoryVaultAdapter();
const t013MutationKey = await generateVaultKey();
await commitGraph(t013MutationAdapter, t013CandidateGraph, t013MutationKey, { now });
const t013BeforeAcceptGenerations = t013MutationAdapter.dump().generations.length;
await commitGraph(t013MutationAdapter, t013Accepted.graph, t013MutationKey, { now: "2026-08-15T08:01:00.000Z" });
assert.equal(t013MutationAdapter.dump().generations.length, t013BeforeAcceptGenerations + 1, "R006 accept must create exactly one generation");
const t013BeforeRejectedCommit = structuredClone(await loadActiveGraph(t013MutationAdapter, t013MutationKey));
t013MutationAdapter.failNextCommit("t013-fictional-commit-failure");
const t013FailedMutation = mutateRelationshipFacts(t013BeforeRejectedCommit, { operation: "add", personId: t013Person, label: "虚构失败标签", decisionId: "t013-failed-add", at: "2026-08-15T08:02:00.000Z" });
await assert.rejects(() => commitGraph(t013MutationAdapter, t013FailedMutation.graph, t013MutationKey, { now: "2026-08-15T08:02:00.000Z" }), /t013-fictional-commit-failure/);
assert.deepEqual(await loadActiveGraph(t013MutationAdapter, t013MutationKey), t013BeforeRejectedCommit, "R003 commit failure must preserve the active graph/generation");
assert.throws(() => mutateRelationshipFacts(t013Accepted.graph, { operation: "delete", personId: t013Person, relationshipId: t013Accepted.relationshipId, decisionId: "t013-delete-cancel", at: now, confirmed: false }), (error) => error?.code === "RELATIONSHIP_WRITE_FAILED");
const t013Deleted = mutateRelationshipFacts(t013Accepted.graph, { operation: "delete", personId: t013Person, relationshipId: t013Accepted.relationshipId, decisionId: "t013-delete-confirm", at: now, confirmed: true });
assert.equal(t013Deleted.graph.relationships.some((item) => item.id === t013Accepted.relationshipId), false);
assert.equal(t013Deleted.graph.dictionary.some((item) => item.label === "重要伙伴"), true, "R003 deleting one fact must retain the global dictionary");

const t013Backup = await createBackup(t013Accepted.graph, "fictional t013 relationship backup", { now });
const t013BackupPreview = await readBackupPreview(t013Backup, "fictional t013 relationship backup");
assert.equal(t013BackupPreview.version, 2);
const t013UnknownEvidenceGraph = structuredClone(t013Accepted.graph);
t013UnknownEvidenceGraph.relationships.find((item) => item.label === "客户").evidence.unapprovedRawDetail = "POISON_T013_UNKNOWN_EVIDENCE";
await assert.rejects(() => createBackup(t013UnknownEvidenceGraph, "fictional t013 unknown evidence"), (error) => error?.code === "RELATIONSHIP_SCHEMA_INVALID", "R009 unknown nested evidence fields must fail closed before backup creation");
const t013UnknownEvidenceBackup = await encryptBackupFixture({ version: 2, createdAt: now, mode: "complete-replace", graph: minimizeGraph(t013UnknownEvidenceGraph) }, "fictional t013 unknown evidence");
await assert.rejects(() => readBackupPreview(t013UnknownEvidenceBackup, "fictional t013 unknown evidence"), /invalid-backup-graph/, "R009 unknown nested evidence fields must fail closed on restore reads");
const t013BackupAdapter = createMemoryVaultAdapter();
const t013BackupKey = await generateVaultKey();
await commitGraph(t013BackupAdapter, t013CandidateGraph, t013BackupKey, { now });
await restoreBackup(t013BackupAdapter, t013BackupKey, t013Backup, "fictional t013 relationship backup", { now: "2026-08-15T08:03:00.000Z" });
const t013RoundTrip = await loadActiveGraph(t013BackupAdapter, t013BackupKey);
assert.deepEqual(t013RoundTrip.relationships, t013Accepted.graph.relationships, "R009 v2 backup must preserve relationship facts byte-semantically");
assert.deepEqual(t013RoundTrip.dictionary, t013Accepted.graph.dictionary, "R009 v2 backup must preserve dictionary byte-semantically");
assert.deepEqual(t013RoundTrip.excerpts, t013Accepted.graph.excerpts, "R008/R009 v2 backup must preserve new import provenance");
const t013SourceRemoved = removeSource(t013Accepted.graph, t013SuiyinSource);
assert.equal(t013SourceRemoved.relationships.find((item) => item.label === "客户")?.status, "current", "R009 confirmed evaluation fact must survive source removal while person remains");
const t013Trashed = trashPerson(t013Accepted.graph, t013Person, now);
assert.equal(projectRelationshipLibrary(t013Trashed, { now }).rows.some((item) => item.personId === t013Person), false, "R009 trash must hide the person's saved facts");
assert.equal(projectRelationshipLibrary(restorePerson(t013Trashed, t013Person), { now }).rows.find((item) => item.personId === t013Person)?.relationshipLabels.includes("客户"), true, "R009 restore must reveal saved facts without restoring candidates");
const t013Purged = purgePerson(t013Accepted.graph, t013Person);
assert.equal(t013Purged.relationships.some((item) => item.personId === t013Person), false, "R009 purge must remove all person relationship facts");
assert.equal(t013Purged.dictionary.some((item) => item.label === "重要伙伴"), true, "R009 purge must retain the global custom dictionary");

// T014 explicit local chat semantics. All bodies and identifiers below are
// code-local fiction; this test never opens a real vault, export, MCP or network.
const t014Source = "t014-fictional-active-source";
const t014Person = "t014-fictional-person";
const t014Direct = (body, count = 6, prefix = "safe") => Array.from({ length: count }, (_, index) => ({
  id: `t014-${prefix}-${String(index).padStart(3, "0")}`,
  sourceId: t014Source,
  personId: t014Person,
  kind: "chat-text",
  conversationKind: "direct",
  conversationId: "t014-fictional-direct-conversation",
  direction: index % 2 ? "counterparty" : "self",
  thirdParty: false,
  timestamp: new Date(Date.UTC(2026, 7, 10 + (index % 3), 8, index)).toISOString(),
  text: body,
}));
const t014Graph = {
  owner: "t014-fictional-owner",
  sources: [{ id: t014Source, state: "active", sourceKind: "wechat-export-toolkit", displayName: "纯虚构来源" }],
  people: [{ id: t014Person, name: "纯虚构人物青松", state: "active", sourceScoped: true }],
  excerpts: t014Direct("工作 进度 安排"),
  mappings: [{ id: "t014-fictional-map", sourceId: t014Source, personId: t014Person, status: "confirmed" }],
  relationships: [], dictionary: [], signals: [], topics: [], notes: [], actions: [], trash: [], purgedPersonIds: [], settings: { schema: 2 },
};
const t014Before = structuredClone(t014Graph);
const t014Work = analyzeLocalChatSemantics(t014Graph, { personId: t014Person, now: "2026-08-15T00:00:00.000Z" });
assert.deepEqual(t014Graph, t014Before, "T014-O02 analysis must leave the unlocked graph deep-equal");
assert.deepEqual(analyzeLocalChatSemantics(t014Graph, { personId: t014Person, now: "2026-08-15T00:00:00.000Z" }), t014Work, "T014-O02 repeated input must be deterministic");
assert.equal(t014Work.safeAngle, "工作近况");
assert.match(t014Work.draft, /最近工作还顺利吗/);
assert.equal(t014Work.algorithmVersion, "local-semantic-v2");
assert.equal(t014Work.aggregate.eligibleMessageCount, 6);
assert.deepEqual(Object.keys(t014Work).sort(), ["aggregate", "algorithmVersion", "candidates", "decisionBaseId", "draft", "personId", "safeAngle", "state"].sort(), "T014-O05 success output must match the exact minimized schema");
assert.equal(t014Work.candidates.every((candidate) => JSON.stringify(Object.keys(candidate).sort()) === JSON.stringify(["label"])), true, "T014-O05 candidates may expose label only");

const t014StudyGraph = structuredClone(t014Graph);
t014StudyGraph.excerpts.forEach((item) => { item.text = "学习 课程 考试"; });
const t014Study = analyzeLocalChatSemantics(t014StudyGraph, { personId: t014Person, now: "2026-08-15T00:00:00.000Z" });
assert.equal(t014Study.safeAngle, "学习近况", "T014-O02 body-only change must change safe semantics");
assert.match(t014Study.draft, /最近学习和进修还顺利吗/);
assert.notEqual(t014Study.draft, t014Work.draft, "T014-O07 safe category must select a different fixed template");
assert.equal(t014Study.candidates.some((candidate) => candidate.label === "老同学"), true);

const t014SensitiveGraph = structuredClone(t014Graph);
t014SensitiveGraph.excerpts.forEach((item) => { item.text = "工作 安排 医疗 健康"; });
const t014Sensitive = analyzeLocalChatSemantics(t014SensitiveGraph, { personId: t014Person, now: "2026-08-15T00:00:00.000Z" });
assert.deepEqual({ state: t014Sensitive.state, safeAngle: t014Sensitive.safeAngle, draft: t014Sensitive.draft, candidates: t014Sensitive.candidates }, { state: "empty", safeAngle: null, draft: "", candidates: [] }, "T026-O02 sensitive-only semantics must contribute zero relationship support and require manual input");
assert.equal(JSON.stringify(t014Sensitive).includes("医疗"), false, "T014-O05 sensitive category detail must not escape");

const t014ExcludedGraph = structuredClone(t014Graph);
t014ExcludedGraph.sources.push({ id: "t014-removed-source", state: "removed", sourceKind: "wechat-export-toolkit" }, { id: "t014-pending-source", state: "active", sourceKind: "wechat-export-toolkit" });
t014ExcludedGraph.mappings.push({ id: "t014-pending-map", sourceId: "t014-pending-source", personId: t014Person, status: "pending" });
t014ExcludedGraph.excerpts.push(
  { ...t014Direct("POISON_T014_GROUP", 1, "group")[0], conversationKind: "group" },
  { ...t014Direct("POISON_T014_THIRD_PARTY", 1, "third")[0], id: "t014-third", thirdParty: true },
  { ...t014Direct("POISON_T014_PENDING", 1, "pending")[0], id: "t014-pending", sourceId: "t014-pending-source" },
  { ...t014Direct("POISON_T014_REMOVED", 1, "removed")[0], id: "t014-removed", sourceId: "t014-removed-source" },
  { ...t014Direct("POISON_T014_MEDIA", 1, "media")[0], id: "t014-media", kind: "media-description" },
);
const t014Excluded = analyzeLocalChatSemantics(t014ExcludedGraph, { personId: t014Person, now: "2026-08-15T00:00:00.000Z" });
assert.equal(t014Excluded.aggregate.eligibleMessageCount, 6, "T014-O03 unsafe provenance must not enter semantic input");
assert.equal(t014Excluded.aggregate.excludedCount >= 5, true);
const t014Serialized = JSON.stringify(t014Excluded);
for (const forbidden of ["POISON_T014", t014Source, "t014-fictional-direct-conversation", "t014-safe-000", '"score"', '"matches"', '"tokens"', '"text"']) assert.equal(t014Serialized.includes(forbidden), false, `T014-O05 semantic output leaked ${forbidden}`);

const t014LegacyGraph = { ...structuredClone(t014Graph), excerpts: [{ id: "t014-old", sourceId: t014Source, personId: t014Person, kind: "chat-text", text: "纯虚构旧正文", timestamp: "2026-08-10T08:00:00.000Z" }] };
const t014Legacy = analyzeLocalChatSemantics(t014LegacyGraph, { personId: t014Person, now: "2026-08-15T00:00:00.000Z" });
assert.deepEqual({ state: t014Legacy.state, code: t014Legacy.code }, { state: "reimport-required", code: "SEMANTIC_INSUFFICIENT_PROVENANCE" });
const t014UnconfirmedGraph = structuredClone(t014Graph);
t014UnconfirmedGraph.mappings[0].status = "pending";
assert.equal(analyzeLocalChatSemantics(t014UnconfirmedGraph, { personId: t014Person }).code, "SEMANTIC_IDENTITY_UNCONFIRMED");

const t014BoundedGraph = structuredClone(t014Graph);
t014BoundedGraph.excerpts = Array.from({ length: 405 }, (_, index) => ({ ...t014Direct(index < 5 ? "学习 课程 考试" : "工作 安排", 1, `bounded-${index}`)[0], id: `t014-bounded-${String(index).padStart(3, "0")}`, timestamp: new Date(Date.UTC(2026, 7, 1, 0, index)).toISOString() }));
const t014Bounded = analyzeLocalChatSemantics(t014BoundedGraph, { personId: t014Person, now: "2026-08-15T00:00:00.000Z" });
assert.equal(t014Bounded.aggregate.eligibleMessageCount, 400, "T014-O04 only the latest 400 records may be processed");
assert.equal(t014Bounded.candidates.some((candidate) => candidate.label === "老同学"), false, "T014-O04 older body semantics must not cross the 400-record boundary");
const t014CharacterGraph = structuredClone(t014Graph);
t014CharacterGraph.excerpts = [
  { ...t014Direct(`${"甲".repeat(80_000)}学习 课程 考试`, 1, "char-first")[0], timestamp: "2026-08-12T08:00:00.000Z" },
  ...t014Direct("学习 课程 考试", 3, "char-later").map((item, index) => ({ ...item, timestamp: `2026-08-${String(9 + index).padStart(2, "0")}T08:00:00.000Z` })),
];
assert.equal(analyzeLocalChatSemantics(t014CharacterGraph, { personId: t014Person, now: "2026-08-15T00:00:00.000Z" }).aggregate.eligibleMessageCount, 1, "T014-O04 normalized body access must stop at 80000 UTF-16 units");

const t014TodayGraph = structuredClone(t014Graph);
t014TodayGraph.people.push({ id: "t014-pending-person", name: "纯虚构待确认", state: "active", sourceScoped: true });
t014TodayGraph.mappings.push({ id: "t014-pending-today-map", sourceId: t014Source, personId: "t014-pending-person", status: "pending" });
t014TodayGraph.relationships.push(
  { id: "t014-current-relation", relationshipId: "t014-current-relation", personId: t014Person, label: "朋友", status: "current", source: "manual-confirmed", sourceIds: [], createdAt: now, updatedAt: now, decisionId: "t014-current-decision" },
  { id: "t014-pending-current", relationshipId: "t014-pending-current", personId: "t014-pending-person", label: "客户", status: "current", source: "manual-confirmed", sourceIds: [], createdAt: now, updatedAt: now, decisionId: "t014-pending-decision" },
);
t014TodayGraph.excerpts = [
  t014Direct("纯虚构合规", 1, "today-direct")[0],
  { ...t014Direct("POISON_T014_TODAY_GROUP", 1, "today-group")[0], id: "t014-today-group", conversationKind: "group" },
  { ...t014Direct("POISON_T014_TODAY_THIRD", 1, "today-third")[0], id: "t014-today-third", thirdParty: true },
  { ...t014Direct("纯虚构待确认互动", 1, "today-pending")[0], id: "t014-today-pending", personId: "t014-pending-person" },
];
const t014Today = analyzeLocalRelationshipGraph(t014TodayGraph, { now: "2026-08-15T00:00:00.000Z" });
const t014TodayRows = [...t014Today.key, ...t014Today.light];
const t014TodayConfirmed = t014TodayRows.find((item) => item.personId === t014Person);
const t014TodayPending = t014TodayRows.find((item) => item.personId === "t014-pending-person");
assert.equal(t014TodayConfirmed.excerptCount, 1, "T014-O10 Today may count exact-mapped direct chat-text only");
assert.equal(t014TodayConfirmed.reasons.some((reason) => reason.summary.includes("1 条确认关系记录")), true, "T014-O10 Today must count current T013 relationship facts");
assert.equal(t014TodayPending.boundary, "pending", "T014-O10 relationship presence must not impersonate a confirmed mapping");

let t014ForbiddenBodyReads = 0;
const t014Unread = (record, marker) => Object.defineProperty(record, "text", { enumerable: true, get() { t014ForbiddenBodyReads += 1; throw new Error(`forbidden-body-read-${marker}`); } });
const t014AccessGraph = structuredClone(t014Graph);
t014AccessGraph.people.push({ id: "t014-unrelated", name: "纯虚构无关人物", state: "active" });
t014AccessGraph.excerpts.push(
  t014Unread({ ...t014Direct("", 1, "unread-group")[0], id: "t014-unread-group", conversationKind: "group" }, "group"),
  t014Unread({ ...t014Direct("", 1, "unread-other")[0], id: "t014-unread-other", personId: "t014-unrelated" }, "other-person"),
);
assert.equal(analyzeLocalChatSemantics(t014AccessGraph, { personId: t014Person, now: "2026-08-15T00:00:00.000Z" }).safeAngle, "工作近况");
assert.equal(t014ForbiddenBodyReads, 0, "T014-O03 must metadata-filter group and other-person records before any body access");

const t014SemanticCandidate = t014Study.candidates.find((item) => item.label === "老同学");
const t014SemanticDecisionId = `${t014Study.decisionBaseId}${t014SemanticCandidate.label}`;
const t014SemanticAccepted = mutateRelationshipFacts(t014StudyGraph, { operation: "accept", personId: t014Person, candidate: t014SemanticCandidate, semanticResult: t014Study, decisionId: t014SemanticDecisionId, at: now });
assert.equal(t014SemanticAccepted.formalWriteCount, 1);
const t014PersistedFact = t014SemanticAccepted.graph.relationships.find((item) => item.id === t014SemanticAccepted.relationshipId);
assert.deepEqual({ confirmation: t014PersistedFact.confirmation, algorithmVersion: t014PersistedFact.algorithmVersion, eligibleMessageCount: t014PersistedFact.eligibleMessageCount, startDate: t014PersistedFact.startDate, endDate: t014PersistedFact.endDate }, { confirmation: "accepted-semantic-suggestion", algorithmVersion: "local-semantic-v2", eligibleMessageCount: 6, startDate: "2026-08-10", endDate: "2026-08-12" }, "T026-O04 new accepted fact may persist only minimized v2 semantic receipt fields");
for (const forbidden of ["safeAngle", "draft", "decisionBaseId", "POISON_T014", "t014-fictional-direct-conversation"]) assert.equal(JSON.stringify(t014PersistedFact).includes(forbidden), false, `T014-O05 accepted fact leaked ${forbidden}`);
const t014SemanticReplay = mutateRelationshipFacts(t014SemanticAccepted.graph, { operation: "accept", personId: t014Person, candidate: t014SemanticCandidate, semanticResult: t014Study, decisionId: t014SemanticDecisionId, at: now });
assert.equal(t014SemanticReplay.formalWriteCount, 0, "T014-O09 semantic decision replay must be zero-write");
const t014SemanticBackup = await createBackup(t014SemanticAccepted.graph, "fictional t014 semantic backup", { now });
const t014SemanticBackupAdapter = createMemoryVaultAdapter();
const t014SemanticBackupKey = await generateVaultKey();
await commitGraph(t014SemanticBackupAdapter, t014StudyGraph, t014SemanticBackupKey, { now });
await restoreBackup(t014SemanticBackupAdapter, t014SemanticBackupKey, t014SemanticBackup, "fictional t014 semantic backup", { now: "2026-08-15T08:04:00.000Z" });
assert.deepEqual((await loadActiveGraph(t014SemanticBackupAdapter, t014SemanticBackupKey)).relationships, t014SemanticAccepted.graph.relationships, "T014-O11 backup/restore must preserve accepted facts and exclude transient semantic state");

// T015 whole-library and affected-person semantics. Everything below is
// code-local fiction; no real vault, export, browser profile, MCP, or network is opened.
const t015PendingPerson = "t015-fictional-pending";
const t015AmbiguousPerson = "t015-fictional-ambiguous";
const t015LegacyPerson = "t015-fictional-legacy";
const t015TrashedPerson = "t015-fictional-trashed";
const t015OtherSource = "t015-fictional-other-source";
const t015Graph = structuredClone(t014StudyGraph);
t015Graph.sources.push({ id: t015OtherSource, state: "active", sourceKind: "suiyin-mcp", displayName: "纯虚构第二来源" });
t015Graph.people.push(
  { id: t015PendingPerson, name: "纯虚构待确认松果", state: "pending", sourceScoped: true },
  { id: t015AmbiguousPerson, name: "纯虚构归属不明", state: "pending", sourceScoped: true },
  { id: t015LegacyPerson, name: "纯虚构旧记录", state: "active", sourceScoped: true },
  { id: t015TrashedPerson, name: "纯虚构回收人物", state: "trashed", sourceScoped: true },
);
t015Graph.mappings.push(
  { id: "t015-pending-map", sourceId: t014Source, personId: t015PendingPerson, status: "pending" },
  { id: "t015-ambiguous-map-a", sourceId: t014Source, personId: t015AmbiguousPerson, status: "pending" },
  { id: "t015-ambiguous-map-b", sourceId: t015OtherSource, personId: t015AmbiguousPerson, status: "pending" },
  { id: "t015-legacy-map", sourceId: t014Source, personId: t015LegacyPerson, status: "confirmed" },
  { id: "t015-trash-map", sourceId: t014Source, personId: t015TrashedPerson, status: "confirmed" },
);
t015Graph.excerpts.push(
  ...Array.from({ length: 6 }, (_, index) => ({
    id: `t015-pending-${index}`,
    sourceId: t014Source,
    personId: t015PendingPerson,
    kind: "chat-text",
    conversationKind: "direct",
    conversationId: "t015-fictional-pending-conversation",
    direction: index % 2 ? "counterparty" : "self",
    thirdParty: false,
    timestamp: new Date(Date.UTC(2026, 7, 10 + (index % 3), 9, index)).toISOString(),
    text: "工作 项目 T015_PRIVATE_POISON_901234567",
  })),
  { id: "t015-legacy-excerpt", sourceId: t014Source, personId: t015LegacyPerson, kind: "chat-text", timestamp: "2026-08-11T10:00:00.000Z", text: "纯虚构旧正文" },
  { id: "t015-trash-excerpt", sourceId: t014Source, personId: t015TrashedPerson, kind: "chat-text", conversationKind: "direct", conversationId: "t015-trash-conversation", direction: "self", thirdParty: false, timestamp: "2026-08-11T10:00:00.000Z", text: "工作" },
);
const t015Before = structuredClone(t015Graph);
let t015ExcerptPasses = 0;
const t015OriginalExcerpts = t015Graph.excerpts;
t015Graph.excerpts = new Proxy(t015OriginalExcerpts, {
  get(target, property, receiver) {
    if (property === Symbol.iterator) t015ExcerptPasses += 1;
    return Reflect.get(target, property, receiver);
  },
});
const t015Snapshot = createLocalSemanticBatchSnapshot(t015Graph, { now: "2026-08-15T00:00:00.000Z" });
assert.equal(t015ExcerptPasses, 1, "T015-O01 full snapshot must bucket the graph excerpt collection in one pass");
assert.deepEqual(t015Snapshot.personIds, [t014Person, t015AmbiguousPerson, t015LegacyPerson, t015PendingPerson].sort(), "T015-O01 queue must contain every non-trash/purge person in stable ordinal order");
assert.equal(t015Snapshot.total, 4, "T015-O02 total must exclude trash/purge without hidden sampling");
const t015Results = new Map(t015Snapshot.personIds.map((personId) => [personId, t015Snapshot.analyze(personId)]));
assert.equal(t015Results.get(t014Person).identityState, "confirmed");
assert.equal(t015Results.get(t014Person).acceptAllowed, true);
assert.equal(t015Results.get(t014Person).contactAllowed, true);
assert.equal(t015Results.get(t015PendingPerson).state, "ready", "T015-O01 exact source-scoped pending identity must be analyzed transiently");
assert.equal(t015Results.get(t015PendingPerson).identityState, "unconfirmed");
assert.equal(t015Results.get(t015PendingPerson).acceptAllowed, false);
assert.equal(t015Results.get(t015PendingPerson).contactAllowed, false);
assert.equal(t015Results.get(t015AmbiguousPerson).state, "unconfirmed", "T015-O01 multi-source pending identity must remain unread and unconfirmed");
assert.equal(t015Results.get(t015LegacyPerson).state, "reimport-required", "T015-O01 incomplete provenance must stay honestly insufficient");
assert.equal(JSON.stringify([...t015Results.values()]).includes("T015_PRIVATE_POISON"), false, "T015-O09 batch results must not leak body poison");
assert.equal(JSON.stringify([...t015Results.values()]).includes("t015-fictional-pending-conversation"), false, "T015-O09 batch results must not leak raw conversation IDs");
t015Graph.excerpts = t015OriginalExcerpts;
assert.deepEqual(t015Graph, t015Before, "T015-O08 whole-library snapshot and evaluation must leave graph deep-equal");

const t015BodyChanged = structuredClone(t015Before);
t015BodyChanged.excerpts.find((item) => item.personId === t015PendingPerson).text = "学习 课程 考试";
assert.deepEqual(computeLocalSemanticAffectedPeople(t015Before, t015BodyChanged), { mode: "affected", personIds: [t015PendingPerson] }, "T015-O04 one person's changed body must produce an exact singleton affected set");
const t015Deleted = structuredClone(t015Before);
t015Deleted.excerpts = t015Deleted.excerpts.filter((item) => item.personId !== t015PendingPerson);
assert.deepEqual(computeLocalSemanticAffectedPeople(t015Before, t015Deleted), { mode: "affected", personIds: [t015PendingPerson] }, "T015-O04 deletions must retain the before-person attribution");
const t015Unknown = structuredClone(t015Before);
t015Unknown.excerpts.push({ id: "t015-unknown", sourceId: "missing-source", personId: "missing-person", kind: "chat-text", text: "不可归属" });
assert.equal(computeLocalSemanticAffectedPeople(t015Before, t015Unknown).mode, "full-rescan", "T015-O04 unknown provenance must fail safe to full rescan");
assert.equal(computeLocalSemanticAffectedPeople(t015Before, t015Before, { beforeAlgorithmVersion: "old", afterAlgorithmVersion: "local-semantic-v2" }).mode, "full-rescan", "T015-O04 algorithm drift must force full rescan");

// T016 cross-source identity/source projection. All identities, aliases and
// bodies are code-local fiction; no real vault, export, DOM, MCP or network is read.
const t016WechatSource = "t016-fictional-wechat-source";
const t016SuiyinSource = fictionalSuiyinSource;
const t016SuiyinSourcePerson = "7".repeat(64);
const t016SuiyinOtherSource = "t016-fictional-suiyin-source-two";
const t016At = "2026-08-16T10:00:00.000Z";
const t016Graph = {
  owner: "t016-fictional-owner",
  sources: [
    { id: t016WechatSource, state: "active", sourceKind: "wechat-export-toolkit", displayName: "纯虚构微信来源" },
    { id: t016SuiyinSource, state: "active", sourceKind: "suiyin-mcp", displayName: "纯虚构碎银来源", environment: "fictional-sandbox", sourceAccountLabels: { "SY-11223344": "2号" } },
    { id: t016SuiyinOtherSource, state: "active", sourceKind: "suiyin-mcp", displayName: "纯虚构碎银第二来源", environment: "fictional-sandbox" },
  ],
  people: [
    { id: "t016-person-wechat", name: "清风", state: "active", sourceScoped: true },
    { id: "t016-person-suiyin", name: "清风", state: "pending", sourceScoped: true },
    { id: "t016-person-single", name: "独行", state: "pending", sourceScoped: true },
    { id: "t016-person-ambiguous-a", name: "星河", state: "pending", sourceScoped: true },
    { id: "t016-person-ambiguous-b", name: "星河", state: "pending", sourceScoped: true },
    { id: "t016-person-ambiguous-c", name: "星河", state: "pending", sourceScoped: true },
    { id: "t016-person-similar", name: "清风甲", state: "pending", sourceScoped: true },
  ],
  mappings: [
    { id: "t016-map-wechat", sourceId: t016WechatSource, sourcePersonId: "t016-source-person-wechat", personId: "t016-person-wechat", sourceDisplayName: " 清风 ", sourceAccountAliases: [], status: "confirmed" },
    { id: "t016-map-suiyin", sourceId: t016SuiyinSource, sourcePersonId: t016SuiyinSourcePerson, personId: "t016-person-suiyin", sourceDisplayName: "清风", sourceAccountAliases: ["SY-11223344"], status: "pending" },
    { id: "t016-map-single", sourceId: t016SuiyinSource, sourcePersonId: "t016-source-person-single", personId: "t016-person-single", sourceDisplayName: "独行", sourceAccountAliases: [], status: "pending" },
    { id: "t016-map-ambiguous-a", sourceId: t016WechatSource, sourcePersonId: "t016-source-person-ambiguous-a", personId: "t016-person-ambiguous-a", sourceDisplayName: "星河", sourceAccountAliases: [], status: "pending" },
    { id: "t016-map-ambiguous-b", sourceId: t016SuiyinSource, sourcePersonId: "t016-source-person-ambiguous-b", personId: "t016-person-ambiguous-b", sourceDisplayName: "星河", sourceAccountAliases: ["SY-11223344"], status: "pending" },
    { id: "t016-map-ambiguous-c", sourceId: t016SuiyinOtherSource, sourcePersonId: "t016-source-person-ambiguous-c", personId: "t016-person-ambiguous-c", sourceDisplayName: "星河", sourceAccountAliases: ["SY-AABBCCDD"], status: "pending" },
    { id: "t016-map-similar", sourceId: t016SuiyinOtherSource, sourcePersonId: "t016-source-person-similar", personId: "t016-person-similar", sourceDisplayName: "清风甲", sourceAccountAliases: ["SY-AABBCCDD"], status: "pending" },
  ],
  excerpts: [
    { id: "t016-excerpt-left", sourceId: t016WechatSource, personId: "t016-person-wechat", kind: "chat-text", conversationKind: "direct", conversationId: "t016-conversation-left", direction: "self", thirdParty: false, timestamp: t016At, text: "T016_PRIVATE_BODY_LEFT" },
    { id: "t016-excerpt-right", sourceId: t016SuiyinSource, personId: "t016-person-suiyin", kind: "chat-text", conversationKind: "direct", conversationId: "t016-conversation-right", direction: "counterparty", thirdParty: false, timestamp: t016At, text: "T016_PRIVATE_BODY_RIGHT" },
  ],
  relationships: [{ id: "t016-relationship", relationshipId: "t016-relationship", personId: "t016-person-suiyin", label: "朋友", status: "current", source: "manual-confirmed", sourceIds: [t016SuiyinSource], createdAt: t016At, updatedAt: t016At, decisionId: "t016-fictional-relationship-decision" }],
  dictionary: [],
  signals: [{ id: "t016-signal", sourceId: t016SuiyinSource, personId: "t016-person-suiyin", status: "pending", text: "T016_PRIVATE_SIGNAL_BODY", thirdParty: false }],
  topics: [], notes: [],
  actions: [{ id: "t016-action", personId: "t016-person-suiyin", kind: "manual-contact", status: "sent-manually", recordedAt: t016At, userMarked: true, text: "T016_PRIVATE_ACTION_BODY" }],
  trash: [], purgedPersonIds: [], identityDecisions: [], settings: { schema: 2 },
};
const t016Before = structuredClone(t016Graph);
const t016Review = projectSourceIdentityReview(t016Graph);
assert.deepEqual(t016Graph, t016Before, "T016-O04 projection must be zero-write and leave graph deep-equal");
assert.equal(t016Review.formalWriteCount, 0);
assert.equal(t016Review.pairs.filter((pair) => pair.status === "pending").length, 1, "T016-O04 only the exact distinct-source unambiguous name may pair");
assert.equal(t016Review.ambiguousCount, 1, "T016-O04 a three-way same-name group must be explicit ambiguity, never an auto-selected pair");
assert.equal(t016Review.singles.find((single) => single.mappingId === "t016-map-single")?.action, "confirm-source-identity", "T016-O03 single mapping must expose confirmation only");
assert.equal(JSON.stringify(t016Review.singles).includes("separate"), false, "T016-O03 single projection must contain no separation action");
const t016Pair = t016Review.pairs.find((pair) => pair.status === "pending");
assert.match(t016Pair.pairKey, /^[0-9A-F]{64}$/);
assert.deepEqual(t016Pair.left.sourceBadges.concat(t016Pair.right.sourceBadges).map((badge) => badge.label).sort(), ["微信导出 · 归属待核对", "碎银 · 2号"].sort());
const t016Library = projectRelationshipLibrary(t016Graph, { now: t016At });
assert.deepEqual(t016Library.rows.find((row) => row.personId === "t016-person-suiyin")?.sourceBadges, [{ kind: "suiyin", label: "碎银 · 2号" }], "T016-O02 relationship library must use the official current-graph account label");
assert.deepEqual(t016Library.rows.find((row) => row.personId === "t016-person-single")?.sourceBadges, [{ kind: "suiyin", label: "碎银 · 账号待补" }], "T016-O02 known Suiyin without a valid alias must remain honest without inventing an account label");

const t016Confirmed = confirmImportedSourceIdentity(t016Graph, { mappingId: "t016-map-single" });
assert.deepEqual({ changed: t016Confirmed.changed, formalWriteCount: t016Confirmed.formalWriteCount, formalRelationshipWriteCount: t016Confirmed.formalRelationshipWriteCount, decision: t016Confirmed.decision }, { changed: true, formalWriteCount: 1, formalRelationshipWriteCount: 0, decision: "confirmed" });
assert.equal(t016Confirmed.graph.mappings.find((mapping) => mapping.id === "t016-map-single").status, "confirmed");
assert.equal(confirmImportedSourceIdentity(t016Confirmed.graph, { mappingId: "t016-map-single" }).formalWriteCount, 0, "T016-O03 confirmation replay must be zero-write");
assert.deepEqual(t016Confirmed.graph.relationships, t016Graph.relationships, "T016-O10 identity confirmation must not write relationship facts");

const t016Separated = separateImportedIdentityPair(t016Graph, { pairKey: t016Pair.pairKey, decisionId: "t016-separate-decision", at: t016At });
assert.equal(t016Separated.formalWriteCount, 1);
assert.deepEqual(t016Separated.graph.people, t016Graph.people, "T016-O06 separation must not mutate people");
assert.deepEqual(t016Separated.graph.mappings, t016Graph.mappings, "T016-O06 separation must not mutate mappings");
assert.equal(separateImportedIdentityPair(t016Separated.graph, { pairKey: t016Pair.pairKey, decisionId: "t016-separate-replay", at: t016At }).formalWriteCount, 0);
const t016SeparatedReview = projectSourceIdentityReview(t016Separated.graph);
assert.equal(t016SeparatedReview.pairs.find((pair) => pair.pairKey === t016Pair.pairKey)?.status, "separated", "T016-O06 separated pair card must remain available for undo");
assert.deepEqual(t016SeparatedReview.singles.filter((single) => ["t016-map-wechat", "t016-map-suiyin"].includes(single.mappingId)).map((single) => [single.mappingId, single.action]).sort(), [["t016-map-suiyin", "confirm-source-identity"], ["t016-map-wechat", null]], "T016-O06 separated sides must remain independently confirmable singles");
assert.deepEqual(undoImportedIdentityPairDecision(t016Separated.graph, { pairKey: t016Pair.pairKey }).graph, t016Graph, "T016-O06 undo separation must restore pending eligibility exactly");

const t016Merged = mergeImportedIdentityPair(t016Graph, { pairKey: t016Pair.pairKey, decisionId: "t016-merge-decision", at: t016At });
assert.deepEqual({ changed: t016Merged.changed, formalWriteCount: t016Merged.formalWriteCount, formalRelationshipWriteCount: t016Merged.formalRelationshipWriteCount, personId: t016Merged.personId }, { changed: true, formalWriteCount: 1, formalRelationshipWriteCount: 0, personId: "t016-person-wechat" }, "T016-O05 exactly one confirmed side must be canonical");
assert.equal(t016Merged.graph.people.some((person) => person.id === "t016-person-suiyin"), false, "T016-O05 secondary must no longer be an active duplicate");
for (const field of ["excerpts", "signals", "relationships", "actions"]) assert.equal(t016Merged.graph[field].some((item) => item.personId === "t016-person-suiyin"), false, `T016-O05 ${field} must be rebound atomically`);
assert.equal(t016Merged.graph.mappings.filter((mapping) => ["t016-map-wechat", "t016-map-suiyin"].includes(mapping.id)).every((mapping) => mapping.personId === "t016-person-wechat" && mapping.status === "confirmed"), true);
assert.equal(mergeImportedIdentityPair(t016Merged.graph, { pairKey: t016Pair.pairKey, decisionId: "t016-merge-replay", at: t016At }).formalWriteCount, 0, "T016-O05 merge replay must be zero-write");
const t016LineageJson = JSON.stringify(t016Merged.graph.identityDecisions[0].lineage);
for (const forbidden of ["T016_PRIVATE_BODY", "T016_PRIVATE_SIGNAL_BODY", "T016_PRIVATE_ACTION_BODY", '"text"', '"conversationId"']) assert.equal(t016LineageJson.includes(forbidden), false, `T016-O12 encrypted identity lineage must remain a minimal receipt without ${forbidden}`);
assert.deepEqual(undoImportedIdentityPairDecision(t016Merged.graph, { pairKey: t016Pair.pairKey }).graph, t016Graph, "T016-O05 merge undo must restore people, mappings and references exactly");
const t016Interleaved = structuredClone(t016Graph);
t016Interleaved.people.splice(1, 0, { id: "t016-person-unaffected", name: "远山", state: "active", sourceScoped: true });
t016Interleaved.mappings.splice(1, 0, { id: "t016-map-unaffected", sourceId: t016WechatSource, sourcePersonId: "t016-source-person-unaffected", personId: "t016-person-unaffected", sourceDisplayName: "远山", sourceAccountAliases: [], status: "confirmed" });
t016Interleaved.excerpts.splice(1, 0, { id: "t016-excerpt-unaffected", sourceId: t016WechatSource, personId: "t016-person-unaffected", kind: "chat-text", conversationKind: "direct", conversationId: "t016-conversation-unaffected", direction: "self", thirdParty: false, timestamp: t016At, text: "纯虚构不受影响正文" });
const t016InterleavedPair = projectSourceIdentityReview(t016Interleaved).pairs.find((pair) => pair.status === "pending");
const t016InterleavedMerged = mergeImportedIdentityPair(t016Interleaved, { pairKey: t016InterleavedPair.pairKey, decisionId: "t016-interleaved-merge", at: t016At });
assert.deepEqual(undoImportedIdentityPairDecision(t016InterleavedMerged.graph, { pairKey: t016InterleavedPair.pairKey }).graph, t016Interleaved, "T016-O05 undo must reinsert affected references at their original positions around unaffected records");
const t016DuplicatePosition = structuredClone(t016InterleavedMerged.graph);
const t016ExcerptReceipts = t016DuplicatePosition.identityDecisions[0].lineage.referencesBefore.excerpts;
t016ExcerptReceipts[1].position = t016ExcerptReceipts[0].position;
assert.throws(() => undoImportedIdentityPairDecision(t016DuplicatePosition, { pairKey: t016InterleavedPair.pairKey }), (error) => error?.code === "IDENTITY_MERGE_UNDO_CONFLICT", "T016-O05 duplicate lineage positions must fail undo closed without partial restoration");
const t016MergeConflict = structuredClone(t016Merged.graph);
t016MergeConflict.actions.push({ id: "t016-later-action", personId: "t016-person-wechat", kind: "manual-contact", status: "sent-manually", recordedAt: "2026-08-16T10:01:00.000Z", userMarked: true, text: "纯虚构后续动作" });
assert.throws(() => undoImportedIdentityPairDecision(t016MergeConflict, { pairKey: t016Pair.pairKey }), (error) => error?.code === "IDENTITY_MERGE_UNDO_CONFLICT", "T016-O05 later affected references must fail undo closed");

const t016Backup = await createBackup(t016Merged.graph, "fictional t016 backup phrase", { now: t016At });
const t016PoisonLineage = structuredClone(t016Merged.graph);
t016PoisonLineage.identityDecisions[0].lineage.referencesBefore.excerpts[0].text = "T016_PRIVATE_LINEAGE_INJECTION";
await assert.rejects(() => createBackup(t016PoisonLineage, "fictional t016 invalid lineage"), (error) => error?.code === "RELATIONSHIP_SCHEMA_INVALID", "T016-O12 nested lineage allowlist must reject hidden body fields before backup");
const t016BackupAdapter = createMemoryVaultAdapter();
const t016BackupKey = await generateVaultKey();
await commitGraph(t016BackupAdapter, t016Graph, t016BackupKey, { now: t016At });
await restoreBackup(t016BackupAdapter, t016BackupKey, t016Backup, "fictional t016 backup phrase", { now: "2026-08-16T10:02:00.000Z" });
assert.deepEqual((await loadActiveGraph(t016BackupAdapter, t016BackupKey)).identityDecisions, t016Merged.graph.identityDecisions, "T016-O11 backup/restore must roundtrip pair decision and minimal lineage");
const t016Removed = removeSource(t016Separated.graph, t016SuiyinSource);
assert.equal(t016Removed.identityDecisions.length, 0, "T016-O11 source removal must clean pair decisions before removing mappings");
assert.equal(t016Removed.mappings.some((mapping) => mapping.sourceId === t016SuiyinSource), false);
const t016MergedRemoved = removeSource(t016Merged.graph, t016SuiyinSource);
assert.equal(t016MergedRemoved.sources.find((source) => source.id === t016SuiyinSource)?.state, "removed", "T016-O11 merged-pair source removal must update the current post-undo graph");
assert.equal(t016MergedRemoved.identityDecisions.length, 0, "T016-O11 merged-pair source removal must retire its decision/lineage without requiring explicit undo");
assert.equal(t016MergedRemoved.mappings.some((mapping) => mapping.sourceId === t016SuiyinSource), false);
assert.equal(t016MergedRemoved.people.some((person) => person.id === "t016-person-wechat"), true, "T016-O11 the other source/person must remain valid after removal");
assert.equal(t016MergedRemoved.people.some((person) => person.id === "t016-person-suiyin"), false, "T016-O11 destructive source removal must not revive the merged secondary");
await createBackup(t016MergedRemoved, "fictional t016 removed merged source", { now: t016At });
const t016Trashed = trashPerson(t016Separated.graph, "t016-person-wechat", t016At);
assert.equal(projectSourceIdentityReview(t016Trashed).pairs.some((pair) => pair.pairKey === t016Pair.pairKey), false, "T016-O11 trash must hide the current pair");
assert.equal(projectSourceIdentityReview(restorePerson(t016Trashed, "t016-person-wechat")).pairs.some((pair) => pair.pairKey === t016Pair.pairKey), true, "T016-O11 restore must reveal the encrypted decision");
assert.equal(purgePerson(t016Separated.graph, "t016-person-wechat").identityDecisions.length, 0, "T016-O11 purge must remove decisions involving the person");
const t016MergedPurged = purgePerson(t016Merged.graph, "t016-person-suiyin");
assert.equal(t016MergedPurged.identityDecisions.length, 0, "T016-O11 purging a merged secondary must directly retire its decision/lineage");
assert.equal(t016MergedPurged.people.some((person) => person.id === "t016-person-suiyin"), false);
await createBackup(t016MergedPurged, "fictional t016 purged merged secondary", { now: t016At });
const t016ReimportStaging = {
  ok: true, formalWriteCount: 0,
  source: { id: t016SuiyinSource, state: "active", sourceKind: "suiyin-mcp", displayName: "碎银", environment: "fictional-sandbox", sourceAccountLabels: { "SY-55667788": "虚构官方三号", "SY-66778899": "1号", "SY-77889900": "2号" }, sourceAccountWechatSourceLinks: {}, importedAt: t016At, personaDeclaredCount: 3, personaReadCount: 3, allocationCount: 1, allocationDeclaredCount: 1, allocationMissingCount: 0, customerCount: 1, friendCount: 1, groupCount: 0, messageCount: 1, unreadableCount: 0, failureCount: 0, missingDisplayNameCount: 0, excludedCount: 0, perPersona: [{ officialLabel: "1号", friendCount: 0, groupCount: 0, messageCount: 0, unreadableCount: 0, failureCount: 0, complete: false }, { officialLabel: "2号", friendCount: 0, groupCount: 0, messageCount: 0, unreadableCount: 0, failureCount: 0, complete: false }, { officialLabel: "虚构官方三号", friendCount: 1, groupCount: 0, messageCount: 1, unreadableCount: 0, failureCount: 0, complete: false }], scopeKind: "current-allocation-partial-v1", scopeComplete: false, completeScopeUnavailableReason: "UPSTREAM_PERSONA_COHORT_UNAVAILABLE", momentsUnsupported: true, attachmentsUnsupported: true },
  people: [{ id: t016SuiyinSourcePerson, name: "清风", state: "pending", sourceScoped: true }],
  mappings: [{ id: `${t016SuiyinSource}:${t016SuiyinSourcePerson}`, sourceId: t016SuiyinSource, sourcePersonId: t016SuiyinSourcePerson, personId: t016SuiyinSourcePerson, sourceDisplayName: "清风", sourceAccountAliases: ["SY-55667788"], status: "pending" }],
  excerpts: [{ id: "8".repeat(64), sourceId: t016SuiyinSource, personId: t016SuiyinSourcePerson, kind: "chat-text", text: "纯虚构重导正文", timestamp: t016At, direction: "customer", messageType: "text" }],
  signals: [],
  aggregate: { personaDeclaredCount: 3, personaReadCount: 3, allocationCount: 1, allocationDeclaredCount: 1, allocationMissingCount: 0, customerCount: 1, friendCount: 1, groupCount: 0, messageCount: 1, unreadableCount: 0, failureCount: 0, missingDisplayNameCount: 0, excludedCount: 0, perPersona: [{ officialLabel: "1号", friendCount: 0, groupCount: 0, messageCount: 0, unreadableCount: 0, failureCount: 0, complete: false }, { officialLabel: "2号", friendCount: 0, groupCount: 0, messageCount: 0, unreadableCount: 0, failureCount: 0, complete: false }, { officialLabel: "虚构官方三号", friendCount: 1, groupCount: 0, messageCount: 1, unreadableCount: 0, failureCount: 0, complete: false }], scopeKind: "current-allocation-partial-v1", scopeComplete: false, completeScopeUnavailableReason: "UPSTREAM_PERSONA_COHORT_UNAVAILABLE" },
  unsupported: { moments: true, attachments: true },
};
const t016ReimportedMerged = mergeSuiyinImport(t016Merged.graph, t016ReimportStaging);
const t016ReimportedMapping = t016ReimportedMerged.mappings.find((mapping) => mapping.id === "t016-map-suiyin");
assert.deepEqual(t016ReimportedMapping.sourceAccountAliases, ["SY-11223344", "SY-55667788"], "T016-O11 reimport must stable-union safe aliases");
assert.equal(t016ReimportedMapping.personId, "t016-person-wechat", "T016-O11 reimport must preserve the canonical mapping target");
assert.equal(t016ReimportedMerged.people.some((person) => person.id === t016SuiyinSourcePerson), false, "T016-O11 reimport must not recreate the merged source identity as an active duplicate");
assert.equal(t016ReimportedMerged.identityDecisions[0]?.status, "merged", "T016-O11 stable pair decision must survive same-source reimport");
assert.deepEqual(mergeSuiyinImport(t016ReimportedMerged, t016ReimportStaging), t016ReimportedMerged, "T016-O11 repeated stable reimport must be idempotent");
await createBackup(t016ReimportedMerged, "fictional t016 reimported merged", { now: t016At });
const t016PostMergeAction = structuredClone(t016Merged.graph);
t016PostMergeAction.actions.push({ id: "t016-post-merge-action", personId: "t016-person-wechat", kind: "manual-contact", status: "sent-manually", recordedAt: "2026-08-16T10:03:00.000Z", userMarked: true, text: "纯虚构合并后用户动作" });
const t016DestructiveLifecycleFailures = [];
const t016DestructiveLifecycleResults = new Map();
for (const [label, input, mutate, verify] of [
  ["reimport then remove merged source", t016ReimportedMerged, (value) => removeSource(value, t016SuiyinSource), (result) => {
    assert.equal(result.sources.find((source) => source.id === t016SuiyinSource)?.state, "removed");
    assert.equal(result.identityDecisions.length, 0);
    assert.equal(result.people.some((person) => person.id === "t016-person-wechat"), true);
    assert.equal(result.people.some((person) => person.id === "t016-person-suiyin"), false);
    assert.equal(result.mappings.some((mapping) => mapping.sourceId === t016SuiyinSource), false);
    assert.equal(result.mappings.some((mapping) => mapping.sourceId === t016WechatSource && mapping.personId === "t016-person-wechat"), true);
  }],
  ["post-merge action then remove merged source", t016PostMergeAction, (value) => removeSource(value, t016SuiyinSource), (result) => {
    assert.equal(result.sources.find((source) => source.id === t016SuiyinSource)?.state, "removed");
    assert.equal(result.identityDecisions.length, 0);
    assert.equal(result.people.some((person) => person.id === "t016-person-suiyin"), false);
    assert.equal(result.actions.some((action) => action.id === "t016-post-merge-action" && action.personId === "t016-person-wechat"), true, "user action must survive removal of the merged source");
    assert.equal(result.mappings.some((mapping) => mapping.sourceId === t016WechatSource && mapping.personId === "t016-person-wechat"), true);
  }],
  ["post-merge action then purge canonical", t016PostMergeAction, (value) => purgePerson(value, "t016-person-wechat"), (result) => {
    assert.equal(result.identityDecisions.length, 0);
    assert.equal(result.people.some((person) => ["t016-person-wechat", "t016-person-suiyin"].includes(person.id)), false, "destructive purge must not revive the secondary person");
    assert.equal(result.mappings.some((mapping) => mapping.personId === "t016-person-wechat"), false);
    for (const field of ["excerpts", "signals", "relationships", "topics", "notes", "actions"]) assert.equal(result[field].some((item) => item.personId === "t016-person-wechat"), false, `${field} canonical reference must be purged`);
    assert.equal(result.purgedPersonIds.includes("t016-person-wechat"), true);
  }],
]) {
  const before = structuredClone(input);
  try { const result = mutate(input); verify(result); t016DestructiveLifecycleResults.set(label, result); }
  catch (error) { t016DestructiveLifecycleFailures.push(`${label}:${error?.code || error?.message || error}`); }
  assert.deepEqual(input, before, `T016-O11 ${label} must leave its input graph deep-equal even on failure`);
}
assert.deepEqual(t016DestructiveLifecycleFailures, [], `T016-O11 destructive lifecycle must retire stale lineage without requiring explicit undo:\n${t016DestructiveLifecycleFailures.join("\n")}`);
for (const [label, result] of t016DestructiveLifecycleResults) await createBackup(result, `fictional t016 lifecycle ${label}`, { now: t016At });
const t016InvalidAlias = structuredClone(t016Graph);
t016InvalidAlias.mappings.find((mapping) => mapping.id === "t016-map-suiyin").sourceAccountAliases = ["RAW_CLIENT_CANARY"];
assert.throws(() => projectSourceIdentityReview(t016InvalidAlias), (error) => error?.code === "SOURCE_ACCOUNT_ALIAS_INVALID", "T016-O12 invalid/raw account aliases must fail closed");

// T018 nickname-first, direct-label authority and combined mutation. Every
// source, identity, nickname and chat body below is code-local fiction; no
// browser profile, real vault/export/DOM, MCP or network is opened.
const t018At = "2026-08-16T14:00:00.000Z";
const t018Generation = "t018-fictional-generation-1";
const t018Source = "t018-fictional-wechat-source";
const t018Person = "t018-fictional-person-single";
const t018Mapping = "t018-fictional-mapping-single";
const t018DisplayGraph = {
  owner: "t018-fictional-owner-display",
  sources: [
    { id: "t018-display-wechat", state: "active", sourceKind: "wechat-export-toolkit" },
    { id: "t018-display-suiyin", state: "active", sourceKind: "suiyin-mcp" },
  ],
  people: [
    { id: "t018-display-source-nickname", name: "纯虚构旧昵称", state: "pending", sourceScoped: true },
    { id: "t018-display-legacy-nickname", name: "  纯虚构  旧档昵称  ", state: "pending", sourceScoped: true },
    { id: "t018-display-no-nickname-a", name: "li******gg", state: "pending", sourceScoped: true },
    { id: "t018-display-no-nickname-b", name: "昵称待补", state: "pending", sourceScoped: true },
  ],
  mappings: [
    { id: "t018-display-map-source", sourceId: "t018-display-wechat", sourcePersonId: "t018-display-sp-source", personId: "t018-display-source-nickname", sourceDisplayName: "  纯虚构  新昵称  ", sourceAccountAliases: [], status: "pending" },
    { id: "t018-display-map-legacy", sourceId: "t018-display-suiyin", sourcePersonId: "t018-display-sp-legacy", personId: "t018-display-legacy-nickname", sourceDisplayName: "SY-1234ABCD", sourceAccountAliases: ["SY-1234ABCD"], status: "pending" },
    { id: "t018-display-map-mask-a", sourceId: "t018-display-wechat", sourcePersonId: "t018-display-sp-mask-a", personId: "t018-display-no-nickname-a", sourceDisplayName: "me********12", sourceAccountAliases: [], status: "pending" },
    { id: "t018-display-map-mask-b", sourceId: "t018-display-suiyin", sourcePersonId: "t018-display-sp-mask-b", personId: "t018-display-no-nickname-b", sourceDisplayName: "sa********22", sourceAccountAliases: ["SY-AABBCCDD"], status: "pending" },
  ],
  excerpts: [], relationships: [], dictionary: [], signals: [], topics: [], notes: [], actions: [], trash: [], purgedPersonIds: [], identityDecisions: [], settings: { schema: 2 },
};
const t018DisplayReview = projectSourceIdentityReview(t018DisplayGraph);
const t018DisplayByPerson = new Map(t018DisplayReview.singles.map((item) => [item.personId, item]));
assert.equal(t018DisplayByPerson.get("t018-display-source-nickname")?.displayName, "纯虚构 新昵称", "T018-O01 current safe source nickname must be the primary name");
assert.equal(t018DisplayByPerson.get("t018-display-legacy-nickname")?.displayName, "纯虚构 旧档昵称", "T018-O01 unsafe alias-like source name must fall back to a safe normalized legacy nickname");
assert.equal(t018DisplayByPerson.get("t018-display-no-nickname-a")?.displayName, "待确认身份", "T018-O01 a masked account with no safe nickname must use the fixed fallback");
assert.equal(t018DisplayByPerson.get("t018-display-no-nickname-b")?.displayName, "待确认身份", "T018-O01 unknown/pending tokens and aliases must never become primary names");
assert.equal(t018DisplayReview.pairs.length, 0, "T018-O01 masked/alias/pending fallback names must not pair-match each other");
assert.equal([...t018DisplayByPerson.values()].every((identity) => identity.directRelationshipAllowed === true), true, "T018-O02 once-per-review singles projection must expose a linear-time direct-label hint without rerunning per row");
assert.equal(t016Review.singles.find((identity) => identity.mappingId === "t016-map-single")?.directRelationshipAllowed, true, "T018-O02 exact single must expose the direct-label hint");
assert.equal(t016Review.singles.find((identity) => identity.mappingId === "t016-map-ambiguous-b")?.directRelationshipAllowed, false, "T018-O05 ambiguous identities must never expose the direct-label hint");
const t018LibraryNames = new Map(projectRelationshipLibrary(t018DisplayGraph, { now: t018At }).rows.map((row) => [row.personId, row.displayName]));
assert.equal(t018LibraryNames.get("t018-display-source-nickname"), "纯虚构 新昵称", "T018-O01 existing encrypted library rows must also project safe source nicknames first");
assert.equal(t018LibraryNames.get("t018-display-no-nickname-a"), "待确认身份", "T018-O01 existing encrypted library rows must suppress masked account-like primary names");

const t018Graph = {
  owner: "t018-fictional-owner",
  sources: [{ id: t018Source, state: "active", sourceKind: "wechat-export-toolkit", sourceBundleRevision: "T018-FICTIONAL-REVISION" }],
  people: [{ id: t018Person, name: "纯虚构单一昵称", state: "pending", sourceScoped: true }],
  mappings: [{ id: t018Mapping, sourceId: t018Source, sourcePersonId: "t018-fictional-source-person", personId: t018Person, sourceDisplayName: "纯虚构单一昵称", sourceAccountAliases: [], status: "pending" }],
  excerpts: Array.from({ length: 6 }, (_, index) => ({
    id: `t018-excerpt-${index}`, sourceId: t018Source, personId: t018Person, kind: "chat-text", conversationKind: "direct", conversationId: "t018-fictional-conversation", direction: index % 2 ? "counterparty" : "self", thirdParty: false,
    timestamp: `2026-08-${String(10 + (index % 3)).padStart(2, "0")}T09:0${index}:00.000Z`, text: "工作 项目 T018_PRIVATE_BODY",
  })),
  relationships: [], dictionary: [], signals: [], topics: [], notes: [], actions: [], trash: [], purgedPersonIds: [], identityDecisions: [], settings: { schema: 2 },
};
const t018Before = structuredClone(t018Graph);
const t018SemanticResult = createLocalSemanticBatchSnapshot(t018Graph, { now: t018At }).analyze(t018Person);
assert.equal(t018SemanticResult.identityState, "unconfirmed", "T018-O06 T015 base result must remain unconfirmed");
assert.equal(t018SemanticResult.acceptAllowed, false, "T018-O06 T015 base accept authority must remain immutable false");
assert.equal(t018SemanticResult.contactAllowed, false, "T018-O06 direct labeling must never grant contact authority");
assert.equal(t018SemanticResult.candidates.length > 0, true, "T018 fictional single must produce a current candidate for the direct-accept oracle");
const t018ManualAuthority = projectRelationshipAuthority(t018Graph, { personId: t018Person, mappingId: t018Mapping, expectedActiveGenerationId: t018Generation, currentActiveGenerationId: t018Generation });
assert.deepEqual({ state: t018ManualAuthority.state, displayName: t018ManualAuthority.displayName, manualAddAllowed: t018ManualAuthority.manualAddAllowed, acceptAllowed: t018ManualAuthority.acceptAllowed, contactAllowed: t018ManualAuthority.contactAllowed, directAtomicAcceptAllowed: t018ManualAuthority.directAtomicAcceptAllowed, formalWriteCount: t018ManualAuthority.formalWriteCount }, { state: "relationship-direct-pending", displayName: "纯虚构单一昵称", manualAddAllowed: true, acceptAllowed: false, contactAllowed: false, directAtomicAcceptAllowed: false, formalWriteCount: 0 }, "T018-O02 eligible exact single must directly open relationship labeling without pretending an absent candidate has authority");
const t018SemanticAuthority = projectRelationshipAuthority(t018Graph, { personId: t018Person, mappingId: t018Mapping, expectedActiveGenerationId: t018Generation, currentActiveGenerationId: t018Generation, semanticResult: t018SemanticResult });
assert.deepEqual({ state: t018SemanticAuthority.state, manualAddAllowed: t018SemanticAuthority.manualAddAllowed, acceptAllowed: t018SemanticAuthority.acceptAllowed, contactAllowed: t018SemanticAuthority.contactAllowed, directAtomicAcceptAllowed: t018SemanticAuthority.directAtomicAcceptAllowed, formalWriteCount: t018SemanticAuthority.formalWriteCount }, { state: "relationship-direct-pending", manualAddAllowed: true, acceptAllowed: true, contactAllowed: false, directAtomicAcceptAllowed: true, formalWriteCount: 0 }, "T018-O06 only the current session projection may grant combined candidate acceptance");
assert.deepEqual(t018Graph, t018Before, "T018-O02 authority projection/open/cancel boundary must be zero-write and leave the graph deep-equal");

let t018ForbiddenBodyReads = 0;
const t018ModalProjectionGraph = structuredClone(t018Graph);
Object.defineProperty(t018ModalProjectionGraph.excerpts[0], "text", { enumerable: true, get() { t018ForbiddenBodyReads += 1; throw new Error("T018_FORBIDDEN_MODAL_BODY_READ"); } });
projectRelationshipAuthority(t018ModalProjectionGraph, { personId: t018Person, mappingId: t018Mapping, expectedActiveGenerationId: t018Generation, currentActiveGenerationId: t018Generation, semanticResult: t018SemanticResult });
assert.equal(t018ForbiddenBodyReads, 0, "T018-O06 modal authority projection must reuse the current result without snapshot/analyzer/body access");

const t018ManualInput = { personId: t018Person, mappingId: t018Mapping, intent: "manual-add", label: "  重要伙伴  ", decisionId: "t018-fictional-manual-decision", at: t018At, expectedActiveGenerationId: t018Generation, currentActiveGenerationId: t018Generation };
const t018ManualMutation = mutateSingleSourceRelationship(t018Graph, t018ManualInput);
assert.deepEqual({ changed: t018ManualMutation.changed, formalWriteCount: t018ManualMutation.formalWriteCount, formalIdentityWriteCount: t018ManualMutation.formalIdentityWriteCount, formalRelationshipWriteCount: t018ManualMutation.formalRelationshipWriteCount, generationDelta: t018ManualMutation.generationDelta }, { changed: true, formalWriteCount: 1, formalIdentityWriteCount: 1, formalRelationshipWriteCount: 1, generationDelta: 1 }, "T018-O03 first label must be one combined business mutation");
assert.equal(t018ManualMutation.graph.people.find((person) => person.id === t018Person)?.state, "active");
assert.equal(t018ManualMutation.graph.mappings.find((mapping) => mapping.id === t018Mapping)?.status, "confirmed");
assert.equal(t018ManualMutation.graph.relationships.find((relationship) => relationship.decisionId === t018ManualInput.decisionId)?.label, "重要伙伴");
assert.deepEqual(t018Graph, t018Before, "T018-O03 combined mutation must construct one next graph without mutating its input");
const t018Replay = mutateSingleSourceRelationship(t018ManualMutation.graph, t018ManualInput);
assert.deepEqual({ changed: t018Replay.changed, formalWriteCount: t018Replay.formalWriteCount, formalIdentityWriteCount: t018Replay.formalIdentityWriteCount, formalRelationshipWriteCount: t018Replay.formalRelationshipWriteCount, generationDelta: t018Replay.generationDelta }, { changed: false, formalWriteCount: 0, formalIdentityWriteCount: 0, formalRelationshipWriteCount: 0, generationDelta: 0 }, "T018-O03 exact replay must be zero-write");

const t018SemanticLabel = t018SemanticResult.candidates[0].label;
const t018SemanticMutation = mutateSingleSourceRelationship(t018Graph, { personId: t018Person, mappingId: t018Mapping, intent: "semantic-accept", label: t018SemanticLabel, decisionId: `${t018SemanticResult.decisionBaseId}${normalizeRelationshipLabel(t018SemanticLabel)}`, at: t018At, expectedActiveGenerationId: t018Generation, currentActiveGenerationId: t018Generation, semanticResult: t018SemanticResult });
assert.deepEqual({ changed: t018SemanticMutation.changed, formalWriteCount: t018SemanticMutation.formalWriteCount, formalIdentityWriteCount: t018SemanticMutation.formalIdentityWriteCount, formalRelationshipWriteCount: t018SemanticMutation.formalRelationshipWriteCount, generationDelta: t018SemanticMutation.generationDelta }, { changed: true, formalWriteCount: 1, formalIdentityWriteCount: 1, formalRelationshipWriteCount: 1, generationDelta: 1 }, "T018-O03 current T015 candidate acceptance must share the same combined sink");

for (const [label, graph, input, code] of [
  ["stale generation", t018Graph, { ...t018ManualInput, currentActiveGenerationId: "t018-fictional-generation-2" }, "DIRECT_RELATIONSHIP_RESULT_STALE"],
  ["cross-source pair", t016Graph, { personId: "t016-person-suiyin", mappingId: "t016-map-suiyin", intent: "manual-add", label: "朋友", decisionId: "t018-pair-block", at: t018At, expectedActiveGenerationId: t018Generation, currentActiveGenerationId: t018Generation }, "DIRECT_IDENTITY_AMBIGUOUS"],
  ["three-way ambiguity", t016Graph, { personId: "t016-person-ambiguous-b", mappingId: "t016-map-ambiguous-b", intent: "manual-add", label: "朋友", decisionId: "t018-ambiguous-block", at: t018At, expectedActiveGenerationId: t018Generation, currentActiveGenerationId: t018Generation }, "DIRECT_IDENTITY_AMBIGUOUS"],
]) {
  const before = structuredClone(graph);
  let captured;
  assert.throws(() => mutateSingleSourceRelationship(graph, input), (error) => { captured = error; return error?.code === code; }, `T018-O04/O05 ${label} must fail closed with its typed error`);
  assert.deepEqual(graph, before, `T018-O04/O05 ${label} must leave its prior graph deep-equal`);
  assert.equal(JSON.stringify(captured).includes(input.personId), false, `T018-O04 ${label} error must not carry private identifiers`);
}
const t018HalfState = structuredClone(t018Graph);
t018HalfState.mappings[0].status = "confirmed";
assert.throws(() => mutateSingleSourceRelationship(t018HalfState, t018ManualInput), (error) => error?.code === "DIRECT_IDENTITY_RELATIONSHIP_INVALID", "T018-O04 historical half-state must fail closed instead of auto-repairing");
const t018SecondMapping = structuredClone(t018Graph);
t018SecondMapping.mappings.push({ id: "t018-fictional-second-map", sourceId: t018Source, sourcePersonId: "t018-fictional-second-source-person", personId: t018Person, sourceDisplayName: "纯虚构单一昵称", sourceAccountAliases: [], status: "pending" });
assert.throws(() => mutateSingleSourceRelationship(t018SecondMapping, t018ManualInput), (error) => error?.code === "DIRECT_IDENTITY_NOT_ELIGIBLE", "T018-O05 any second active mapping must disable the direct shortcut");

const t018Affected = computeLocalSemanticAffectedPeople(t018Graph, t018ManualMutation.graph);
assert.deepEqual(t018Affected, { mode: "affected", personIds: [t018Person] }, "T018-O07 combined success must invalidate the exact affected person, not force a full rescan");
const t018Adapter = createMemoryVaultAdapter();
const t018Key = await generateVaultKey();
const t018Generation1 = await commitGraph(t018Adapter, t018Graph, t018Key, { now: t018At });
const t018CommitInput = { ...t018ManualInput, expectedActiveGenerationId: t018Generation1, currentActiveGenerationId: t018Generation1 };
const t018CommitMutation = mutateSingleSourceRelationship(t018Graph, t018CommitInput);
const t018BeforeCommit = t018Adapter.dump();
const t018WriteCountBeforeCommit = t018Adapter.writeCount;
const t018Generation2 = await commitGraph(t018Adapter, t018CommitMutation.graph, t018Key, { now: "2026-08-16T14:01:00.000Z" });
assert.equal(t018Adapter.writeCount, t018WriteCountBeforeCommit + 1, "T018-O03 UI calling commitGraph once must perform one business transaction");
assert.equal(t018Adapter.dump().generations.length, t018BeforeCommit.generations.length + 1, "T018-O03 combined identity+label must install exactly one generation");
assert.notEqual(t018Generation2, t018Generation1, "T018-O03 successful combined save must advance exactly one generation");
const t018FailureAdapter = createMemoryVaultAdapter();
const t018FailureKey = await generateVaultKey();
const t018FailureGeneration = await commitGraph(t018FailureAdapter, t018Graph, t018FailureKey, { now: t018At });
const t018FailureMutation = mutateSingleSourceRelationship(t018Graph, { ...t018ManualInput, expectedActiveGenerationId: t018FailureGeneration, currentActiveGenerationId: t018FailureGeneration });
const t018FailureBefore = t018FailureAdapter.dump();
const t018FailureWrites = t018FailureAdapter.writeCount;
t018FailureAdapter.failNextCommit("t018-fictional-combined-commit-failure");
await assert.rejects(() => commitGraph(t018FailureAdapter, t018FailureMutation.graph, t018FailureKey, { now: "2026-08-16T14:02:00.000Z" }));
assert.equal(t018FailureAdapter.writeCount, t018FailureWrites, "T018-O04 failed combined commit must perform zero business writes");
assert.deepEqual(t018FailureAdapter.dump(), t018FailureBefore, "T018-O04 failed combined commit must preserve the prior encrypted generation and cache");

// T019 exact-lineage direct management and public source badges. Every source,
// alias, person and signal below is code-local fiction; no real vault/export,
// browser profile, DOM, MCP or network is read.
const t019At = "2026-08-16T15:00:00.000Z";
const t019Generation = "t019-fictional-generation-1";
const t019LegacyWechatSource = "t019-fictional-legacy-wechat-source";
const t019SuiyinSourceA = "t019-fictional-suiyin-source-a";
const t019SuiyinSourceB = "t019-fictional-suiyin-source-b";
const t019RemovedSuiyinSource = "t019-fictional-removed-suiyin-source";
const t019UnknownSource = "t019-fictional-wechat-looking-unknown-source";
const t019LegacyPerson = "t019-fictional-legacy-person";
const t019SuiyinMultiPerson = "t019-fictional-suiyin-multi-person";
const t019SuiyinNoAliasPerson = "t019-fictional-suiyin-no-alias-person";
const t019UnknownPendingPerson = "t019-fictional-unknown-pending-person";
const t019UnknownConfirmedPerson = "t019-fictional-unknown-confirmed-person";
const t019Graph = {
  owner: "t019-fictional-owner",
  sources: [
    { id: t019LegacyWechatSource, state: "active", sourceBundleRevision: SOURCE_BUNDLE_REVISION, displayName: "纯虚构旧微信来源" },
    { id: t019SuiyinSourceA, state: "active", sourceKind: "suiyin-mcp", displayName: "纯虚构碎银来源甲", sourceAccountLabels: { "SY-00000002": "2号", "SY-00000004": "虚构官方三号" } },
    { id: t019SuiyinSourceB, state: "active", sourceKind: "suiyin-mcp", displayName: "纯虚构碎银来源乙", sourceAccountLabels: { "SY-00000001": "另一个号" } },
    { id: t019RemovedSuiyinSource, state: "removed", sourceKind: "suiyin-mcp", displayName: "纯虚构已移除碎银来源", sourceAccountLabels: { "SY-00000000": "已移除号" } },
    { id: t019UnknownSource, state: "active", sourceKind: "fictional-other", displayName: "微信" },
  ],
  people: [
    { id: t019LegacyPerson, name: "纯虚构旧微信人物", state: "pending" },
    { id: t019SuiyinMultiPerson, name: "纯虚构碎银多号人物", state: "pending" },
    { id: t019SuiyinNoAliasPerson, name: "纯虚构碎银无号人物", state: "pending" },
    { id: "t019-fictional-trashed-person", name: "纯虚构回收人物", state: "trashed" },
    { id: "t019-fictional-removed-person", name: "纯虚构移除人物", state: "pending" },
    { id: t019UnknownPendingPerson, name: "纯虚构未知待定人物", state: "pending" },
    { id: t019UnknownConfirmedPerson, name: "纯虚构未知已确认人物", state: "active" },
    { id: "t019-fictional-pair-person-a", name: "纯虚构同名双碎银", state: "pending" },
    { id: "t019-fictional-pair-person-b", name: "纯虚构同名双碎银", state: "pending" },
  ],
  mappings: [
    { id: "t019-map-legacy", sourceId: t019LegacyWechatSource, sourcePersonId: "t019-source-person-legacy", personId: t019LegacyPerson, sourceDisplayName: "纯虚构旧微信人物", sourceAccountAliases: [], status: "pending" },
    { id: "t019-map-suiyin-multi", sourceId: t019SuiyinSourceA, sourcePersonId: "t019-source-person-suiyin-multi", personId: t019SuiyinMultiPerson, sourceDisplayName: "纯虚构碎银多号人物", sourceAccountAliases: ["SY-00000004", "SY-00000002", "SY-00000004"], status: "pending" },
    { id: "t019-map-suiyin-no-alias", sourceId: t019SuiyinSourceA, sourcePersonId: "t019-source-person-suiyin-no-alias", personId: t019SuiyinNoAliasPerson, sourceDisplayName: "纯虚构碎银无号人物", sourceAccountAliases: [], status: "pending" },
    { id: "t019-map-trashed", sourceId: t019SuiyinSourceB, sourcePersonId: "t019-source-person-trashed", personId: "t019-fictional-trashed-person", sourceDisplayName: "纯虚构回收人物", sourceAccountAliases: ["SY-00000001"], status: "pending" },
    { id: "t019-map-removed", sourceId: t019RemovedSuiyinSource, sourcePersonId: "t019-source-person-removed", personId: "t019-fictional-removed-person", sourceDisplayName: "纯虚构移除人物", sourceAccountAliases: ["SY-00000000"], status: "pending" },
    { id: "t019-map-unknown-pending", sourceId: t019UnknownSource, sourcePersonId: "t019-source-person-unknown-pending", personId: t019UnknownPendingPerson, sourceDisplayName: "纯虚构未知待定人物", sourceAccountAliases: [], status: "pending" },
    { id: "t019-map-unknown-confirmed", sourceId: t019UnknownSource, sourcePersonId: "t019-source-person-unknown-confirmed", personId: t019UnknownConfirmedPerson, sourceDisplayName: "纯虚构未知已确认人物", sourceAccountAliases: [], status: "confirmed" },
    { id: "t019-map-pair-a", sourceId: t019SuiyinSourceA, sourcePersonId: "t019-source-person-pair-a", personId: "t019-fictional-pair-person-a", sourceDisplayName: "纯虚构同名双碎银", sourceAccountAliases: [], status: "pending" },
    { id: "t019-map-pair-b", sourceId: t019SuiyinSourceB, sourcePersonId: "t019-source-person-pair-b", personId: "t019-fictional-pair-person-b", sourceDisplayName: "纯虚构同名双碎银", sourceAccountAliases: [], status: "pending" },
  ],
  excerpts: [],
  relationships: [{ id: "t019-relationship-unknown", relationshipId: "t019-relationship-unknown", personId: t019UnknownConfirmedPerson, label: "朋友", status: "current", source: "manual-confirmed", sourceIds: [t019UnknownSource], createdAt: t019At, updatedAt: t019At, decisionId: "t019-fictional-unknown-relationship" }],
  dictionary: [],
  signals: [{ id: "t019-fictional-suiyin-signal", sourceId: t019SuiyinSourceA, personId: t019SuiyinMultiPerson, status: "pending", thirdParty: false, publishedAt: t019At }],
  topics: [], notes: [], actions: [], trash: [], purgedPersonIds: [], identityDecisions: [], settings: { schema: 2 },
};
const t019Before = structuredClone(t019Graph);
const t019Review = projectSourceIdentityReview(t019Graph);
const t019ReviewByMapping = new Map(t019Review.singles.map((identity) => [identity.mappingId, identity]));
assert.deepEqual(t019Graph, t019Before, "T019-O04/O05 source badge/review projection must be zero-write");
assert.deepEqual(t019ReviewByMapping.get("t019-map-legacy")?.sourceBadges, [{ kind: "wechat", label: "微信导出 · 归属待核对" }], "T025-O01 exact current bundle without manual or exact attribution must remain pending");
assert.deepEqual(t019ReviewByMapping.get("t019-map-suiyin-multi")?.sourceBadges, [{ kind: "suiyin", label: "碎银 · 2号" }, { kind: "suiyin", label: "碎银 · 虚构官方三号" }], "T019-O05 all unique aliases use official stable account labels; trash counts and removed sources do not");
assert.deepEqual(t019ReviewByMapping.get("t019-map-suiyin-no-alias")?.sourceBadges, [{ kind: "suiyin", label: "碎银 · 账号待补" }], "T019-O06 known Suiyin without aliases must not invent an account label");
assert.deepEqual(t019ReviewByMapping.get("t019-map-unknown-pending")?.sourceBadges, [{ kind: "unknown", label: "来源未识别 · 请重导" }], "T019-O04/O06 a name/revision-looking conflicting kind must remain honestly unknown");
assert.equal(t019ReviewByMapping.get("t019-map-legacy")?.directRelationshipAllowed, true, "T019-O01 exact pending lineage must not require sourceScoped");
assert.equal(t019ReviewByMapping.get("t019-map-suiyin-no-alias")?.directRelationshipAllowed, true, "T019-O01 known exact pending lineage without sourceScoped must directly manage labels");
assert.equal(t019ReviewByMapping.get("t019-map-unknown-pending")?.directRelationshipAllowed, true, "T019-O06 exact unknown lineage must still allow manual relationship management");
const t019SameChannelPair = t019Review.pairs.find((pair) => [pair.left.mappingId, pair.right.mappingId].includes("t019-map-pair-a"));
assert.equal(t019SameChannelPair?.status, "pending", "T019-O03 same-name identities on two distinct Suiyin sources remain an unresolved pair");
assert.equal(t019Review.singles.some((identity) => ["t019-map-pair-a", "t019-map-pair-b"].includes(identity.mappingId) && identity.directRelationshipAllowed), false, "T019-O03 an unresolved same-channel cross-source pair must not expose direct management");

const t019Library = projectRelationshipLibrary(t019Graph, { now: t019At });
const t019LibraryByPerson = new Map(t019Library.rows.map((row) => [row.personId, row]));
assert.deepEqual(t019LibraryByPerson.get(t019SuiyinMultiPerson)?.sourceBadges, [{ kind: "suiyin", label: "碎银 · 2号" }, { kind: "suiyin", label: "碎银 · 虚构官方三号" }], "T019-O05 library must consume the shared official badge projection");
assert.deepEqual(t019LibraryByPerson.get(t019UnknownPendingPerson)?.sourceBadges, [{ kind: "unknown", label: "来源未识别 · 请重导" }], "T019-O06 library must expose honest unknown without guessing from display metadata");
const t019Today = analyzeLocalRelationshipGraph(t019Graph, { now: t019At });
const t019TodayByPerson = new Map(t019Today.key.concat(t019Today.light).map((candidate) => [candidate.personId, candidate]));
assert.deepEqual(t019TodayByPerson.get(t019SuiyinMultiPerson)?.sourceBadges, [{ kind: "suiyin", label: "碎银 · 2号" }, { kind: "suiyin", label: "碎银 · 虚构官方三号" }], "T019-O05 Today candidates must consume the shared official badge projection");
assert.deepEqual(t019TodayByPerson.get(t019UnknownConfirmedPerson)?.sourceBadges, [{ kind: "unknown", label: "来源未识别 · 请重导" }], "T019-O06 Today must expose the honest unknown badge");
for (const projection of [t019Review, t019Library, t019Today]) {
  assert.equal(JSON.stringify(projection).includes("SY-"), false, "T019-O05 public review/library/Today projections must contain zero raw Suiyin aliases");
  for (const badge of JSON.stringify(projection).includes("sourceBadges") ? [...(projection.singles || []).flatMap((item) => item.sourceBadges || []), ...(projection.pairs || []).flatMap((pair) => [...(pair.left.sourceBadges || []), ...(pair.right.sourceBadges || [])]), ...(projection.rows || []).flatMap((row) => row.sourceBadges || []), ...(projection.key || []).flatMap((item) => item.sourceBadges || []), ...(projection.light || []).flatMap((item) => item.sourceBadges || [])] : []) assert.deepEqual(Object.keys(badge).sort(), ["kind", "label"], "T019-O05 public badges must expose only kind and label");
}

const t019LegacyAuthority = projectRelationshipAuthority(t019Graph, { personId: t019LegacyPerson, mappingId: "t019-map-legacy", expectedActiveGenerationId: t019Generation, currentActiveGenerationId: t019Generation });
assert.deepEqual({ state: t019LegacyAuthority.state, manualAddAllowed: t019LegacyAuthority.manualAddAllowed, sourceBadges: t019LegacyAuthority.sourceBadges }, { state: "relationship-direct-pending", manualAddAllowed: true, sourceBadges: [{ kind: "wechat", label: "微信导出 · 归属待核对" }] }, "T025-O01 legacy exact lineage remains relationship-manageable without claiming private WeChat attribution");
const t019LegacyMutation = mutateSingleSourceRelationship(t019Graph, { personId: t019LegacyPerson, mappingId: "t019-map-legacy", intent: "manual-add", label: "纯虚构伙伴", decisionId: "t019-fictional-legacy-manual", at: t019At, expectedActiveGenerationId: t019Generation, currentActiveGenerationId: t019Generation });
assert.deepEqual({ formalWriteCount: t019LegacyMutation.formalWriteCount, formalIdentityWriteCount: t019LegacyMutation.formalIdentityWriteCount, formalRelationshipWriteCount: t019LegacyMutation.formalRelationshipWriteCount, generationDelta: t019LegacyMutation.generationDelta }, { formalWriteCount: 1, formalIdentityWriteCount: 1, formalRelationshipWriteCount: 1, generationDelta: 1 }, "T019-O02 pending first manual save remains one combined business mutation without sourceScoped");
assert.deepEqual(t019Graph, t019Before, "T019-O02 combined direct save must not mutate its input graph");

const t019SeparatedAuthority = projectRelationshipAuthority(t016Separated.graph, { personId: "t016-person-suiyin", mappingId: "t016-map-suiyin", expectedActiveGenerationId: t019Generation, currentActiveGenerationId: t019Generation });
assert.equal(t016SeparatedReview.singles.find((identity) => identity.mappingId === "t016-map-suiyin")?.directRelationshipAllowed, true, "T019-O03 an explicit separated decision resolves the pair for direct management");
assert.equal(t019SeparatedAuthority.state, "relationship-direct-pending", "T019-O03 separated must not be treated as an unresolved decision conflict");
assert.equal(projectRelationshipAuthority(t016Graph, { personId: "t016-person-suiyin", mappingId: "t016-map-suiyin", expectedActiveGenerationId: t019Generation, currentActiveGenerationId: t019Generation }).state, "identity-review", "T019-O03 unresolved pair remains blocked");

const t019UnknownSemantic = { ...t018SemanticResult, personId: t019UnknownPendingPerson };
const t019UnknownPendingAuthority = projectRelationshipAuthority(t019Graph, { personId: t019UnknownPendingPerson, mappingId: "t019-map-unknown-pending", expectedActiveGenerationId: t019Generation, currentActiveGenerationId: t019Generation, semanticResult: t019UnknownSemantic });
assert.deepEqual({ state: t019UnknownPendingAuthority.state, manualAddAllowed: t019UnknownPendingAuthority.manualAddAllowed, acceptAllowed: t019UnknownPendingAuthority.acceptAllowed, contactAllowed: t019UnknownPendingAuthority.contactAllowed, directAtomicAcceptAllowed: t019UnknownPendingAuthority.directAtomicAcceptAllowed }, { state: "relationship-direct-pending", manualAddAllowed: true, acceptAllowed: false, contactAllowed: false, directAtomicAcceptAllowed: false }, "T019-O06/O07 unknown exact lineage is manual-only even when handed a candidate-shaped result");
assert.throws(() => mutateSingleSourceRelationship(t019Graph, { personId: t019UnknownPendingPerson, mappingId: "t019-map-unknown-pending", intent: "semantic-accept", label: t019UnknownSemantic.candidates[0].label, decisionId: "t019-fictional-unknown-semantic", at: t019At, expectedActiveGenerationId: t019Generation, currentActiveGenerationId: t019Generation, semanticResult: t019UnknownSemantic }), (error) => error?.code === "DIRECT_RELATIONSHIP_RESULT_STALE", "T019-O07 unknown source cannot gain semantic-accept authority");
const t019UnknownManual = mutateSingleSourceRelationship(t019Graph, { personId: t019UnknownPendingPerson, mappingId: "t019-map-unknown-pending", intent: "manual-add", label: "纯虚构手工关系", decisionId: "t019-fictional-unknown-manual", at: t019At, expectedActiveGenerationId: t019Generation, currentActiveGenerationId: t019Generation });
assert.deepEqual({ formalWriteCount: t019UnknownManual.formalWriteCount, formalIdentityWriteCount: t019UnknownManual.formalIdentityWriteCount, formalRelationshipWriteCount: t019UnknownManual.formalRelationshipWriteCount }, { formalWriteCount: 1, formalIdentityWriteCount: 1, formalRelationshipWriteCount: 1 }, "T019-O06 unknown exact pending lineage still supports the combined manual sink");
const t019UnknownConfirmedAuthority = projectRelationshipAuthority(t019Graph, { personId: t019UnknownConfirmedPerson, mappingId: "t019-map-unknown-confirmed", expectedActiveGenerationId: t019Generation, currentActiveGenerationId: t019Generation, semanticResult: { personId: t019UnknownConfirmedPerson, identityState: "confirmed", acceptAllowed: true, contactAllowed: true } });
assert.deepEqual({ state: t019UnknownConfirmedAuthority.state, manualAddAllowed: t019UnknownConfirmedAuthority.manualAddAllowed, acceptAllowed: t019UnknownConfirmedAuthority.acceptAllowed, contactAllowed: t019UnknownConfirmedAuthority.contactAllowed }, { state: "relationship", manualAddAllowed: true, acceptAllowed: false, contactAllowed: false }, "T019-O07 confirmed unknown remains manual-only and cannot prepare contact");

// T017 encrypted persisted semantic cache. Every graph, body, identifier and
// adapter below is code-local fiction; no browser profile, real IDB, export,
// private DOM, network or MCP is opened.
const t017At = "2026-08-16T12:00:00.000Z";
const t017Source = "t017-fictional-source-raw-canary";
const t017PersonA = "t017-fictional-person-a";
const t017PersonB = "t017-fictional-person-b";
const t017Graph = {
  owner: "t017-fictional-owner",
  sources: [{ id: t017Source, state: "active", sourceKind: "wechat-export-toolkit", sourceBundleRevision: "T017-FICTIONAL-REVISION" }],
  people: [
    { id: t017PersonA, name: "纯虚构甲", state: "active", sourceScoped: true },
    { id: t017PersonB, name: "纯虚构乙", state: "active", sourceScoped: true },
  ],
  mappings: [
    { id: "t017-map-a", sourceId: t017Source, sourcePersonId: "t017-source-person-a", personId: t017PersonA, status: "confirmed" },
    { id: "t017-map-b", sourceId: t017Source, sourcePersonId: "t017-source-person-b", personId: t017PersonB, status: "confirmed" },
  ],
  excerpts: [
    ...Array.from({ length: 6 }, (_, index) => ({ id: `t017-a-${index}`, sourceId: t017Source, personId: t017PersonA, kind: "chat-text", conversationKind: "direct", conversationId: "t017-raw-conversation-a", direction: index % 2 ? "counterparty" : "self", thirdParty: false, timestamp: `2026-08-${String(10 + (index % 3)).padStart(2, "0")}T08:0${index}:00.000Z`, text: "工作 项目 T017_PRIVATE_BODY_A" })),
    ...Array.from({ length: 6 }, (_, index) => ({ id: `t017-b-${index}`, sourceId: t017Source, personId: t017PersonB, kind: "chat-text", conversationKind: "direct", conversationId: "t017-raw-conversation-b", direction: index % 2 ? "counterparty" : "self", thirdParty: false, timestamp: `2026-08-${String(10 + (index % 3)).padStart(2, "0")}T09:0${index}:00.000Z`, text: "学习 课程 考试 T017_PRIVATE_BODY_B" })),
  ],
  relationships: [], dictionary: [], signals: [], topics: [], notes: [], actions: [], trash: [], purgedPersonIds: [], identityDecisions: [], settings: { schema: 2 },
};
const t017Snapshot = createLocalSemanticBatchSnapshot(t017Graph, { now: t017At });
assert.equal(typeof t017Snapshot.analyzeForCache, "function", "T017-O01 snapshot must expose one-pass result+revision cache input");
const t017Analyzed = new Map(t017Snapshot.personIds.map((personId) => [personId, t017Snapshot.analyzeForCache(personId)]));
const t017Payload = buildLocalSemanticCachePayload(t017Graph, t017Analyzed);
assert.deepEqual(Object.keys(t017Payload).sort(), ["algorithmVersion", "entries", "schemaVersion"].sort(), "T017-O01 plaintext root allowlist must be exact");
assert.equal(t017Payload.entries.every((entry) => /^[0-9A-F]{64}$/.test(entry.inputRevision)), true, "T017-O04 every active person must have a deterministic SHA-256 revision");
assert.deepEqual(validateLocalSemanticCachePayload(t017Payload, t017Graph), t017Payload, "T017-O01 valid payload must roundtrip strict validation");
const t017PayloadText = JSON.stringify(t017Payload);
for (const forbidden of ["T017_PRIVATE_BODY", "纯虚构甲", "纯虚构乙", t017Source, "t017-raw-conversation", '"draft"', '"safeAngle"', '"candidates"', '"score"', '"matches"']) assert.equal(t017PayloadText.includes(forbidden), false, `T017-O04 cache plaintext leaked ${forbidden}`);
const t017RepeatedAnalyzed = new Map(createLocalSemanticBatchSnapshot(t017Graph, { now: t017At }).personIds.map((personId) => [personId, createLocalSemanticBatchSnapshot(t017Graph, { now: t017At }).analyzeForCache(personId)]));
assert.deepEqual(buildLocalSemanticCachePayload(t017Graph, t017RepeatedAnalyzed), t017Payload, "T017-O04 repeated exact input must produce byte-semantic identical plaintext");
for (const mutate of [
  (payload) => { payload.extra = true; },
  (payload) => { payload.entries[0].draft = "不得缓存"; },
  (payload) => { payload.entries[0].aggregate.extra = 1; },
  (payload) => { payload.entries.reverse(); },
]) {
  const invalid = structuredClone(t017Payload); mutate(invalid);
  assert.throws(() => validateLocalSemanticCachePayload(invalid, t017Graph), (error) => ["ANALYSIS_CACHE_SCHEMA_INVALID", "ANALYSIS_CACHE_COVERAGE_INVALID"].includes(error?.code), "T017-O01/O03 strict nested allowlist/order must fail closed");
}

let t017ForbiddenBodyReads = 0;
const t017ProjectionGraph = structuredClone(t017Graph);
const t017Group = { id: "t017-group-poison", sourceId: t017Source, personId: t017PersonA, kind: "chat-text", conversationKind: "group", conversationId: "t017-group", direction: "counterparty", thirdParty: false, timestamp: t017At };
Object.defineProperty(t017Group, "text", { enumerable: true, get() { t017ForbiddenBodyReads += 1; throw new Error("T017_FORBIDDEN_GROUP_BODY_READ"); } });
t017ProjectionGraph.excerpts.push(t017Group);
createLocalSemanticBatchSnapshot(t017ProjectionGraph, { personIds: [t017PersonA], now: t017At }).analyzeForCache(t017PersonA);
assert.equal(t017ForbiddenBodyReads, 0, "T017-O04 input revision must metadata-filter group bodies before access");

const t017BodyChanged = structuredClone(t017Graph);
t017BodyChanged.excerpts.find((item) => item.personId === t017PersonA).text = "日常 生活 近况 T017_CHANGED_PRIVATE_BODY";
const t017ChangedSnapshot = createLocalSemanticBatchSnapshot(t017BodyChanged, { personIds: [t017PersonA], now: t017At });
const t017ChangedAnalyzed = new Map([[t017PersonA, t017ChangedSnapshot.analyzeForCache(t017PersonA)]]);
const t017AffectedPayload = buildLocalSemanticCachePayload(t017BodyChanged, t017ChangedAnalyzed, { previousPayload: t017Payload, mode: "affected", affectedPersonIds: [t017PersonA] });
assert.notEqual(t017AffectedPayload.entries.find((entry) => entry.personId === t017PersonA).inputRevision, t017Payload.entries.find((entry) => entry.personId === t017PersonA).inputRevision, "T017-O09 affected body must change its revision");
assert.deepEqual(t017AffectedPayload.entries.find((entry) => entry.personId === t017PersonB), t017Payload.entries.find((entry) => entry.personId === t017PersonB), "T017-O09 unaffected cache entry must remain byte-semantic identical");
const t017SourcePersonChanged = structuredClone(t017Graph);
t017SourcePersonChanged.mappings.find((mapping) => mapping.personId === t017PersonA).sourcePersonId = "t017-source-person-a-rebound";
assert.deepEqual(computeLocalSemanticAffectedPeople(t017Graph, t017SourcePersonChanged), { mode: "affected", personIds: [t017PersonA] }, "T017-O09 sourcePersonId changes must invalidate the exact mapped person");
const t017IdentityAffected = ["t016-person-suiyin", "t016-person-wechat"].sort();
assert.deepEqual(computeLocalSemanticAffectedPeople(t016Graph, t016Separated.graph), { mode: "affected", personIds: t017IdentityAffected }, "T017-O09 separation decision must invalidate both exact identity sides");
assert.deepEqual(computeLocalSemanticAffectedPeople(t016Separated.graph, undoImportedIdentityPairDecision(t016Separated.graph, { pairKey: t016Pair.pairKey }).graph), { mode: "affected", personIds: t017IdentityAffected }, "T017-O09 undo separation must invalidate both exact identity sides");

const t017Adapter = createMemoryVaultAdapter();
const t017Key = await generateVaultKey();
const t017Generation1 = await commitGraph(t017Adapter, t017Graph, t017Key, { now: t017At });
const t017BusinessWritesBeforeCache = t017Adapter.writeCount;
const t017Saved = await commitLocalSemanticCache(t017Adapter, t017Key, { expectedActiveGenerationId: t017Generation1, payload: t017Payload });
assert.deepEqual(t017Saved, { ok: true, changed: true, cacheWriteCount: 1, boundActiveGenerationId: t017Generation1 }, "T017-O06 terminal run must perform exactly one cache write");
assert.equal(t017Adapter.writeCount, t017BusinessWritesBeforeCache, "T017-O06 cache-only CAS must not count as or create a business graph write");
assert.equal(t017Adapter.dump().activeGeneration, t017Generation1, "T017-O06 cache-only CAS must not change active generation");
const t017StoredRecord = t017Adapter.dump().semanticCache;
assert.deepEqual(Object.keys(t017StoredRecord).sort(), ["boundActiveGenerationId", "envelope", "recordVersion"].sort());
assert.deepEqual(Object.keys(t017StoredRecord.envelope).sort(), ["algorithm", "ciphertext", "iv", "version"].sort());
for (const forbidden of [t017PersonA, t017PersonB, "T017_PRIVATE_BODY", "纯虚构甲", t017Source, "draft"]) assert.equal(JSON.stringify(t017StoredRecord).includes(forbidden), false, `T017-O01 encrypted meta wrapper leaked ${forbidden}`);
await assert.rejects(() => crypto.subtle.decrypt({ name: "AES-GCM", iv: t017StoredRecord.envelope.iv }, t017Key, t017StoredRecord.envelope.ciphertext), "T017-O01 semantic cache ciphertext must require fixed AAD");
const t017DecryptedBytes = await crypto.subtle.decrypt({ name: "AES-GCM", iv: t017StoredRecord.envelope.iv, additionalData: new TextEncoder().encode("relationship-today-semantic-cache/v1") }, t017Key, t017StoredRecord.envelope.ciphertext);
assert.deepEqual(validateLocalSemanticCachePayload(JSON.parse(new TextDecoder().decode(t017DecryptedBytes)), t017Graph), t017Payload, "T017-O01 correct AAD must decrypt strict plaintext only");
const t017CacheWritesBeforeReplay = t017Adapter.cacheWriteCount;
assert.deepEqual(await commitLocalSemanticCache(t017Adapter, t017Key, { expectedActiveGenerationId: t017Generation1, payload: t017Payload }), { ok: true, changed: false, cacheWriteCount: 0, boundActiveGenerationId: t017Generation1 }, "T017-O06 identical replay must be zero-write");
assert.equal(t017Adapter.cacheWriteCount, t017CacheWritesBeforeReplay);

const t017LoadWrites = { business: t017Adapter.writeCount, cache: t017Adapter.cacheWriteCount };
const t017Loaded = await loadActiveGraphWithSemanticCache(t017Adapter, t017Key, { now: t017At });
assert.deepEqual({ activeGenerationId: t017Loaded.activeGenerationId, status: t017Loaded.semanticCache.status, reason: t017Loaded.semanticCache.reason }, { activeGenerationId: t017Generation1, status: "hit", reason: "vault-cache-hit" }, "T017-O02 exact cache hit must hydrate before any full scheduler");
assert.deepEqual({ business: t017Adapter.writeCount, cache: t017Adapter.cacheWriteCount }, t017LoadWrites, "T017-O02 cache hit must be zero-write");
assert.equal(t017Loaded.semanticCache.baseResults.get(t017PersonA).draft.includes("纯虚构甲"), true, "T017-O04 draft must be rebuilt from safeTopic and current display name");
assert.throws(() => t017Loaded.semanticCache.baseResults.set("x", {}), (error) => error?.code === "ANALYSIS_CACHE_SCHEMA_INVALID", "T017-O05 hydrated base Map must be immutable");
assert.throws(() => { t017Loaded.semanticCache.baseResults.get(t017PersonA).draft = "脏稿"; }, TypeError, "T017-O05 hydrated result must be immutable");
const t017RenamedGraph = structuredClone(t017Graph);
t017RenamedGraph.people.find((person) => person.id === t017PersonA).name = "纯虚构新名字";
assert.equal(hydrateLocalSemanticCache(t017RenamedGraph, t017Payload).get(t017PersonA).draft.includes("纯虚构新名字"), true, "T017-O04 cached payload must never carry the old display name or draft");

const t017MissAdapter = createMemoryVaultAdapter();
const t017MissKey = await generateVaultKey();
await commitGraph(t017MissAdapter, t017Graph, t017MissKey, { now: "2026-08-16T12:01:00.000Z" });
assert.deepEqual((await loadActiveGraphWithSemanticCache(t017MissAdapter, t017MissKey)).semanticCache, { status: "miss", reason: "cache-miss-full", baseResults: null, payload: null }, "T017-O03 old/absent store must miss honestly");
const t017RecordAdapter = (state, semanticCache) => ({ async readState() { return { ...structuredClone(state), semanticCache: structuredClone(semanticCache) }; } });
const t017State = t017Adapter.dump();
const t017WrongGenerationRecord = { ...structuredClone(t017StoredRecord), boundActiveGenerationId: "generation-stale-fictional" };
assert.equal((await loadActiveGraphWithSemanticCache(t017RecordAdapter(t017State, t017WrongGenerationRecord), t017Key)).semanticCache.reason, "cache-invalid-full", "T017-O03 generation mismatch must not hydrate");
const t017EncryptPayload = async (payload) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: new TextEncoder().encode("relationship-today-semantic-cache/v1") }, t017Key, new TextEncoder().encode(JSON.stringify(payload)));
  return { recordVersion: 1, boundActiveGenerationId: t017Generation1, envelope: { version: 1, algorithm: "AES-256-GCM", iv, ciphertext: new Uint8Array(ciphertext) } };
};
assert.equal((await loadActiveGraphWithSemanticCache(t017RecordAdapter(t017State, await t017EncryptPayload({ ...t017Payload, algorithmVersion: "local-semantic-v0" })), t017Key)).semanticCache.reason, "algorithm-upgrade-full", "T017-O03 algorithm drift must force full");
assert.equal((await loadActiveGraphWithSemanticCache(t017RecordAdapter(t017State, await t017EncryptPayload({ ...t017Payload, entries: t017Payload.entries.slice(1) })), t017Key)).semanticCache.reason, "cache-invalid-full", "T017-O03 incomplete coverage must not partially hydrate");

const t017Generation2 = await commitGraph(t017Adapter, t017BodyChanged, t017Key, { now: "2026-08-16T12:02:00.000Z" });
assert.equal(t017Adapter.dump().semanticCache, null, "T017-O08 business graph commit must prune cache in its active-generation transaction");
const t017AfterBusiness = t017Adapter.dump();
await assert.rejects(() => commitLocalSemanticCache(t017Adapter, t017Key, { expectedActiveGenerationId: t017Generation1, payload: t017Payload }), (error) => error?.code === "ANALYSIS_CACHE_STALE", "T017-O07 G1 cache CAS after G2 business commit must be stale");
assert.deepEqual(t017Adapter.dump(), t017AfterBusiness, "T017-O07 stale cache CAS must be zero-write and preserve G2 byte-semantically");
assert.equal(t017Adapter.dump().activeGeneration, t017Generation2);
t017Adapter.failNextCacheCommit("t017-fictional-cache-fault");
await assert.rejects(() => commitLocalSemanticCache(t017Adapter, t017Key, { expectedActiveGenerationId: t017Generation2, payload: t017AffectedPayload }), (error) => error?.code === "ANALYSIS_CACHE_WRITE_FAILED", "T017-O08 cache IO failure must be typed separately");
assert.deepEqual(await loadActiveGraph(t017Adapter, t017Key), upgradeRelationshipGraphV2(t017BodyChanged), "T017-O08 cache failure must never roll back successful business data");

const t017LifecycleAdapter = createMemoryVaultAdapter();
const t017LifecycleKey = await generateVaultKey();
const t017LifecycleGeneration = await commitGraph(t017LifecycleAdapter, t017Graph, t017LifecycleKey, { now: "2026-08-16T12:03:00.000Z" });
await commitLocalSemanticCache(t017LifecycleAdapter, t017LifecycleKey, { expectedActiveGenerationId: t017LifecycleGeneration, payload: t017Payload });
const t017Backup = await createBackup(t017Graph, "fictional t017 backup phrase", { now: t017At });
for (const forbidden of ["semanticCache", "local-semantic-v1", t017PersonA, "safeTopic"]) assert.equal(JSON.stringify(t017Backup).includes(forbidden), false, `T017-O11 external backup must exclude cache marker ${forbidden}`);
const t017BeforeBadRestore = t017LifecycleAdapter.dump();
await assert.rejects(() => restoreBackup(t017LifecycleAdapter, t017LifecycleKey, t017Backup, "wrong fictional phrase"), /wrong-passphrase-or-corrupt/);
assert.deepEqual(t017LifecycleAdapter.dump(), t017BeforeBadRestore, "T017-O11 failed restore must preserve prior graph/cache");
await restoreBackup(t017LifecycleAdapter, t017LifecycleKey, t017Backup, "fictional t017 backup phrase", { now: "2026-08-16T12:04:00.000Z" });
assert.equal(t017LifecycleAdapter.dump().semanticCache, null, "T017-O11 successful restore must prune cache atomically");

const t017SourceAdapter = createMemoryVaultAdapter();
const t017SourceKey = await generateVaultKey();
const t017SourceGeneration = await commitGraph(t017SourceAdapter, t017Graph, t017SourceKey, { now: "2026-08-16T12:05:00.000Z" });
await commitLocalSemanticCache(t017SourceAdapter, t017SourceKey, { expectedActiveGenerationId: t017SourceGeneration, payload: t017Payload });
await commitSourceRemovedGraph(t017SourceAdapter, removeSource(t017Graph, t017Source), t017SourceKey, { now: "2026-08-16T12:06:00.000Z" });
assert.equal(t017SourceAdapter.dump().semanticCache, null, "T017-O12 source remove/key rotation must retire old cache");
const t017PurgeAdapter = createMemoryVaultAdapter();
const t017PurgeKey = await generateVaultKey();
const t017PurgeGeneration = await commitGraph(t017PurgeAdapter, t017Graph, t017PurgeKey, { now: "2026-08-16T12:07:00.000Z" });
await commitLocalSemanticCache(t017PurgeAdapter, t017PurgeKey, { expectedActiveGenerationId: t017PurgeGeneration, payload: t017Payload });
await commitPurgedGraph(t017PurgeAdapter, purgePerson(t017Graph, t017PersonA), t017PurgeKey, { now: "2026-08-16T12:08:00.000Z" });
assert.equal(t017PurgeAdapter.dump().semanticCache, null, "T017-O12 purge/key rotation must retire old cache");

const t017IndexedDbStart = productionSource.indexOf("export async function createIndexedDbVaultAdapter");
const t017CasStart = productionSource.indexOf("async compareAndSwapSemanticCache(expectedGenerationId", t017IndexedDbStart);
const t017CasSource = productionSource.slice(t017CasStart, productionSource.indexOf("async getOrCreateKey()", t017CasStart));
assert.match(t017CasSource, /db\.transaction\("meta", "readwrite"\)/, "T017-O07 IndexedDB CAS must use one meta readwrite transaction");
assert.match(t017CasSource, /store\.get\("activeGeneration"\)/, "T017-O07 IndexedDB CAS must read activeGeneration inside that transaction");
assert.doesNotMatch(t017CasSource, /readState\(/, "T017-O07 IndexedDB CAS must not use split readState/write transactions");
const t017BusinessTxSource = productionSource.slice(productionSource.indexOf("const runStateTransaction"), productionSource.indexOf("return {", productionSource.indexOf("const runStateTransaction")));
assert.match(t017BusinessTxSource, /transaction\(\["meta", "generations", "snapshots", "keys"\], "readwrite"\)/, "T017-O08 business state transition must share one IDB transaction");
assert.match(productionSource.slice(productionSource.indexOf("const runStateTransaction"), productionSource.indexOf("async readSemanticCache()", productionSource.indexOf("const runStateTransaction"))), /delete\("semanticCache"\)/, "T017-O08 business transaction must prune semanticCache");

// T020 public cross-source review projection. All names, sources, mappings,
// aliases and decisions below are code-local fiction; no vault, export, DOM,
// browser profile, MCP, network or real identifier is read.
const t020At = "2026-08-16T16:00:00.000Z";
const t020Sources = {
  wechat: "t020-private-source-wechat",
  suiyinA: "t020-private-source-suiyin-a",
  suiyinB: "t020-private-source-suiyin-b",
  suiyinC: "t020-private-source-suiyin-c",
};
const t020Person = (id, name, state = "pending") => ({ id, name, state, sourceScoped: true });
const t020Mapping = (id, sourceId, sourcePersonId, personId, sourceDisplayName, status = "pending", sourceAccountAliases = []) => ({ id, sourceId, sourcePersonId, personId, sourceDisplayName, sourceAccountAliases, status });
const t020Graph = {
  owner: "t020-fictional-owner",
  sources: [
    { id: t020Sources.wechat, state: "active", sourceKind: "wechat-export-toolkit", displayName: "纯虚构微信来源" },
    { id: t020Sources.suiyinA, state: "active", sourceKind: "suiyin-mcp", displayName: "纯虚构碎银来源甲" },
    { id: t020Sources.suiyinB, state: "active", sourceKind: "suiyin-mcp", displayName: "纯虚构碎银来源乙" },
    { id: t020Sources.suiyinC, state: "active", sourceKind: "suiyin-mcp", displayName: "纯虚构碎银来源丙" },
  ],
  people: [
    t020Person("t020-private-single-pending", "纯虚构单一待建立"),
    t020Person("t020-private-single-confirmed", "纯虚构单一已关联", "active"),
    t020Person("t020-private-pair-a", "纯虚构双来源人物"),
    t020Person("t020-private-pair-b", "纯虚构双来源人物"),
    t020Person("t020-private-ambiguous-a", "纯虚构三方同名"),
    t020Person("t020-private-ambiguous-b", "纯虚构三方同名"),
    t020Person("t020-private-ambiguous-c", "纯虚构三方同名"),
    t020Person("t020-private-resolved-a", "纯虚构已处理人物"),
    t020Person("t020-private-resolved-b", "纯虚构已处理人物"),
    t020Person("t020-private-trash-a", "纯虚构回收同名", "trashed"),
    t020Person("t020-private-trash-b", "纯虚构回收同名"),
    t020Person("t020-private-purged-a", "纯虚构删除同名"),
    t020Person("t020-private-purged-b", "纯虚构删除同名"),
    t020Person("t020-private-half-a", "纯虚构半状态同名", "active"),
    t020Person("t020-private-half-b", "纯虚构半状态同名"),
  ],
  mappings: [
    t020Mapping("t020-private-map-single-pending", t020Sources.wechat, "t020-private-source-person-single-pending", "t020-private-single-pending", "纯虚构单一待建立"),
    t020Mapping("t020-private-map-single-confirmed", t020Sources.suiyinA, "t020-private-source-person-single-confirmed", "t020-private-single-confirmed", "纯虚构单一已关联", "confirmed", ["SY-00000001"]),
    t020Mapping("t020-private-map-pair-a", t020Sources.wechat, "t020-private-source-person-pair-a", "t020-private-pair-a", "纯虚构双来源人物"),
    t020Mapping("t020-private-map-pair-b", t020Sources.suiyinA, "t020-private-source-person-pair-b", "t020-private-pair-b", "纯虚构双来源人物", "pending", ["SY-00000002"]),
    t020Mapping("t020-private-map-ambiguous-a", t020Sources.wechat, "t020-private-source-person-ambiguous-a", "t020-private-ambiguous-a", "纯虚构三方同名"),
    t020Mapping("t020-private-map-ambiguous-b", t020Sources.suiyinA, "t020-private-source-person-ambiguous-b", "t020-private-ambiguous-b", "纯虚构三方同名", "pending", ["SY-00000003"]),
    t020Mapping("t020-private-map-ambiguous-c", t020Sources.suiyinB, "t020-private-source-person-ambiguous-c", "t020-private-ambiguous-c", "纯虚构三方同名", "pending", ["SY-00000004"]),
    t020Mapping("t020-private-map-resolved-a", t020Sources.wechat, "t020-private-source-person-resolved-a", "t020-private-resolved-a", "纯虚构已处理人物"),
    t020Mapping("t020-private-map-resolved-b", t020Sources.suiyinB, "t020-private-source-person-resolved-b", "t020-private-resolved-b", "纯虚构已处理人物", "pending", ["SY-00000005"]),
    t020Mapping("t020-private-map-trash-a", t020Sources.wechat, "t020-private-source-person-trash-a", "t020-private-trash-a", "纯虚构回收同名"),
    t020Mapping("t020-private-map-trash-b", t020Sources.suiyinA, "t020-private-source-person-trash-b", "t020-private-trash-b", "纯虚构回收同名"),
    t020Mapping("t020-private-map-purged-a", t020Sources.wechat, "t020-private-source-person-purged-a", "t020-private-purged-a", "纯虚构删除同名"),
    t020Mapping("t020-private-map-purged-b", t020Sources.suiyinA, "t020-private-source-person-purged-b", "t020-private-purged-b", "纯虚构删除同名"),
    t020Mapping("t020-private-map-half-a", t020Sources.wechat, "t020-private-source-person-half-a", "t020-private-half-a", "纯虚构半状态同名"),
    t020Mapping("t020-private-map-half-b", t020Sources.suiyinC, "t020-private-source-person-half-b", "t020-private-half-b", "纯虚构半状态同名"),
  ],
  excerpts: [], relationships: [], dictionary: [], signals: [], topics: [], notes: [], actions: [], trash: [],
  purgedPersonIds: ["t020-private-purged-a"], identityDecisions: [], settings: { schema: 2 },
};
const t020ResolvedPair = projectSourceIdentityReview(t020Graph).pairs.find((pair) => pair.status === "pending" && pair.left.displayName === "纯虚构已处理人物");
assert.ok(t020ResolvedPair, "T020-O08 fictional resolved-history pair fixture must be projectable before separation");
const t020Separated = separateImportedIdentityPair(t020Graph, { pairKey: t020ResolvedPair.pairKey, decisionId: "t020-fictional-separated-decision", at: t020At });
const t020BeforeProjection = structuredClone(t020Separated.graph);
const t020Review = projectCrossSourceReview(t020Separated.graph);
assert.deepEqual(t020Separated.graph, t020BeforeProjection, "T020-O01/O02 review projection must be zero-write");
assert.deepEqual(Object.keys(t020Review).sort(), ["formalWriteCount", "pendingCount", "pendingGroups", "resolvedDecisions"].sort(), "T020 public projection root allowlist must remain exact");
assert.equal(t020Review.formalWriteCount, 0, "T020-O01 projection cannot create a business write");
assert.equal(t020Review.pendingCount, 2, "T020-O01/O02 singles, resolved, trash, purge and half-state rows must not contribute to review count");
assert.equal(t020Review.pendingGroups.length, 2, "T020-O02 one pair plus one ambiguous scope must produce exactly two canonical groups");
const t020PairGroup = t020Review.pendingGroups.find((group) => group.kind === "pair");
const t020AmbiguousGroup = t020Review.pendingGroups.find((group) => group.kind === "ambiguous");
assert.equal(t020PairGroup?.sides.length, 2, "T020-O02 a distinct-source pair is one group with two safe sides");
assert.equal(t020AmbiguousGroup?.sides.length, 3, "T020-O02 three mutually ambiguous identities must be one group, not three pair edges");
const t020InternalPair = projectSourceIdentityReview(t020Separated.graph).pairs.find((pair) => pair.status === "pending" && pair.left.displayName === "纯虚构双来源人物");
assert.equal(t020PairGroup?.reviewGroupId, t020InternalPair?.pairKey, "T020 pair reviewGroupId must resolve exactly to the current internal pairKey behind a session action token");
for (const group of t020Review.pendingGroups) {
  assert.deepEqual(Object.keys(group).sort(), ["kind", "reviewGroupId", "sides", "status"].sort(), "T020 pending group public allowlist must be exact");
  assert.match(group.reviewGroupId, /^[0-9A-F]{64}$/, "T020 reviewGroupId must be an opaque canonical hash");
  assert.equal(group.status, "pending");
  for (const side of group.sides) assert.deepEqual(Object.keys(side).sort(), ["displayName", "sourceBadges"].sort(), "T020 public side must contain no raw graph identifiers or lifecycle status");
}
assert.equal(t020Review.resolvedDecisions.length, 1, "T020-O08 resolved separation must remain available in history without contributing to count");
assert.deepEqual(Object.keys(t020Review.resolvedDecisions[0]).sort(), ["kind", "reviewGroupId", "sides", "status"].sort(), "T020 resolved history public allowlist must be exact");
assert.equal(t020Review.resolvedDecisions[0].status, "separated");
assert.equal(t020Review.resolvedDecisions[0].sides.length, 2);
assert.equal(t020Review.resolvedDecisions[0].reviewGroupId, t020ResolvedPair.pairKey, "T020 resolved reviewGroupId must resolve to the current decision pairKey for undo");
const t020PublicText = JSON.stringify(t020Review);
for (const forbidden of ["t020-private-", "SY-", "mappingId", "personId", "sourceId", "pairKey", "identityState", "sourceIdentityKey"]) assert.equal(t020PublicText.includes(forbidden), false, `T020 public projection leaked ${forbidden}`);
const t020Reordered = structuredClone(t020Separated.graph);
t020Reordered.sources.reverse(); t020Reordered.people.reverse(); t020Reordered.mappings.reverse(); t020Reordered.identityDecisions.reverse();
assert.deepEqual(projectCrossSourceReview(t020Reordered), t020Review, "T020-O02 canonical groups and local source badges must not depend on graph array order");
const t020Undone = undoImportedIdentityPairDecision(t020Separated.graph, { pairKey: t020ResolvedPair.pairKey, at: "2026-08-16T16:01:00.000Z" });
const t020AfterUndo = projectCrossSourceReview(t020Undone.graph);
assert.equal(t020AfterUndo.pendingCount, 3, "T020-O08 undo must return the still-current pair to pending groups");
assert.equal(t020AfterUndo.resolvedDecisions.length, 0, "T020-O08 undone decision must leave resolved history");
assert.equal(projectSourceIdentityReview(t020Separated.graph).singles.filter((side) => ["纯虚构已处理人物"].includes(side.displayName)).every((side) => side.directRelationshipAllowed), true, "T020-O08 separated sides remain independently relationship-manageable");

const t020FirstRelationship = mutateSingleSourceRelationship(t020Graph, {
  personId: "t020-private-single-pending",
  mappingId: "t020-private-map-single-pending",
  intent: "manual-add",
  label: "朋友",
  decisionId: "t020-fictional-first-relationship",
  at: t020At,
  expectedActiveGenerationId: "t020-fictional-generation",
  currentActiveGenerationId: "t020-fictional-generation",
});
assert.deepEqual({ business: t020FirstRelationship.formalWriteCount, association: t020FirstRelationship.formalIdentityWriteCount, relationship: t020FirstRelationship.formalRelationshipWriteCount, generation: t020FirstRelationship.generationDelta }, { business: 1, association: 1, relationship: 1, generation: 1 }, "T020-O05 first relationship must retain the one-next-graph 1/1/1/1 sink");
const t020ConfirmedBefore = structuredClone(t020Graph);
const t020ConfirmedReview = projectCrossSourceReview(t020Graph);
assert.deepEqual(t020Graph, t020ConfirmedBefore, "T020-O06 projecting an existing active/confirmed single must perform zero migration/write");
assert.equal(t020ConfirmedReview.pendingGroups.some((group) => group.sides.some((side) => side.displayName === "纯虚构单一已关联")), false, "T020-O01 historical confirmed single must never enter cross-source review");

// T021 RED: an absent-kind legacy WeChat receipt that also owns a Suiyin alias
// is mixed provenance and must fail closed instead of being labelled WeChat.
const t021ConflictGraph = structuredClone(t019Graph);
const t021ConflictSource = t021ConflictGraph.sources.find((source) => source.id === t019LegacyWechatSource);
const t021ConflictMapping = t021ConflictGraph.mappings.find((mapping) => mapping.id === "t019-map-legacy");
t021ConflictSource.sourceAccountLabels = { "SY-0A0B0C0D": "2号" };
t021ConflictMapping.sourceAccountAliases = ["SY-0A0B0C0D"];
const t021ConflictBadge = projectRelationshipLibrary(t021ConflictGraph, { now: t019At }).rows.find((row) => row.personId === t019LegacyPerson)?.sourceBadges;
assert.deepEqual(t021ConflictBadge, [{ kind: "conflict", label: "来源冲突 · 请修复" }], "T021-O04 mixed WeChat/Suiyin evidence must fail closed");

// T021 focused source-truth evidence. Every alias, label, person, message and
// generation below is code-local fiction; no real vault, MCP or browser data is read.
const t021InventoryGraph = structuredClone(partialSuiyinGraph);
const t021InventorySource = t021InventoryGraph.sources.find((source) => source.id === fictionalSuiyinSource);
t021InventorySource.sourceAccountLabels = {
  "SY-11223344": "2号",
  "SY-22334455": "虚构官方三号",
  "SY-33445566": null,
};
t021InventoryGraph.sources.push({ id: "t021-fictional-unrelated-source", state: "active", sourceKind: "fictional-other", displayName: "纯虚构无关来源" });
const t021InventoryBefore = structuredClone(t021InventoryGraph);
const t021Inventory = projectSourceReceiptInventory(t021InventoryGraph);
assert.deepEqual(t021InventoryGraph, t021InventoryBefore, "T021-O02 inventory projection must be zero-write");
const t021SuiyinInventory = t021Inventory.sources.find((source) => source.receiptState === "trusted-suiyin");
assert.deepEqual(t021SuiyinInventory.sourceBadges, [
  { kind: "suiyin", label: "碎银 · 2号" },
  { kind: "suiyin", label: "碎银 · 虚构官方三号" },
  { kind: "suiyin", label: "碎银 · 账号待补" },
], "T021-O02 source inventory must project official, registry-only and missing labels from one shared oracle");
assert.deepEqual(t021SuiyinInventory.accountLabels.map(({ label, associatedPeopleCount }) => [label, associatedPeopleCount]), [["2号", 1], ["虚构官方三号", 0], ["账号待补", 0]], "T021-O06 registry-only slots must remain editable without inventing ownership");
assert.equal(t021Inventory.sources.find((source) => source.receiptState === "unknown")?.repairAllowed, false, "T021-O04 unrelated unknown sources must not be offered as Suiyin repair targets");
const t021InventoryPublic = JSON.stringify(t021Inventory);
for (const forbidden of ["SY-", fictionalSuiyinSource, fictionalSuiyinPerson, "t021-fictional-unrelated-source", "sourceId", "sourceAccountAlias"]) assert.equal(t021InventoryPublic.includes(forbidden), false, `T021-O02 public inventory leaked ${forbidden}`);

const t021WrongSourceStaging = structuredClone(fictionalSuiyinStaging);
t021WrongSourceStaging.source.id = "F".repeat(64);
const t021WrongSourceBefore = structuredClone(t021WrongSourceStaging);
assert.throws(() => mergeSuiyinImport(t021InventoryGraph, t021WrongSourceStaging), (error) => error?.code === "SUIYIN_STAGING_SOURCE_MISMATCH", "T021-O03 wrong deterministic sourceId must fail before mutation");
assert.deepEqual(t021WrongSourceStaging, t021WrongSourceBefore, "T021-O03 rejected wrong-source staging must remain byte-semantic equal");
assert.deepEqual(t021InventoryGraph, t021InventoryBefore, "T021-O03 rejected wrong-source staging must leave prior graph equal");
const t021OrphanStaging = structuredClone(fictionalSuiyinStaging);
t021OrphanStaging.people.push({ id: "E".repeat(64), name: "纯虚构孤立人物", state: "pending", sourceScoped: true });
const t021OrphanBefore = structuredClone(t021OrphanStaging);
assert.throws(() => mergeSuiyinImport(t021InventoryGraph, t021OrphanStaging), (error) => error?.code === "SUIYIN_STAGING_REFERENCE_INVALID", "T021-O03 every staged person must have exactly one closed mapping");
assert.deepEqual(t021OrphanStaging, t021OrphanBefore, "T021-O03 rejected orphan staging must remain equal");
assert.deepEqual(t021InventoryGraph, t021InventoryBefore, "T021-O03 rejected orphan staging must leave prior graph equal");
const t021InvalidChildStagingCases = [
  ["mapping cross-sourceId", (staging) => { staging.mappings[0].sourceId = "A".repeat(64); }],
  ["mapping dangling personId", (staging) => { staging.mappings[0].personId = "E".repeat(64); }],
  ["excerpt cross-sourceId", (staging) => { staging.excerpts[0].sourceId = "A".repeat(64); }],
  ["excerpt dangling personId", (staging) => { staging.excerpts[0].personId = "E".repeat(64); }],
  ["signal cross-sourceId", (staging) => { staging.signals[0].sourceId = "A".repeat(64); }],
  ["signal dangling personId", (staging) => {
    const signal = staging.signals[0];
    signal.kind = "recent_interaction";
    signal.personId = "E".repeat(64);
    delete signal.contextId;
    delete signal.contextLabel;
  }],
];
for (const [caseName, poison] of t021InvalidChildStagingCases) {
  const staging = structuredClone(fictionalSuiyinStaging);
  poison(staging);
  const stagingBefore = structuredClone(staging);
  const graphBefore = structuredClone(t021InventoryGraph);
  assert.throws(() => mergeSuiyinImport(t021InventoryGraph, staging), (error) => error?.code === "SUIYIN_STAGING_REFERENCE_INVALID", `T021-O03 ${caseName} must be a typed fail-closed rejection`);
  assert.deepEqual(staging, stagingBefore, `T021-O03 ${caseName} rejection must preserve staging byte-semantically`);
  assert.deepEqual(t021InventoryGraph, graphBefore, `T021-O03 ${caseName} rejection must preserve the prior graph byte-semantically`);
}

const t021ConflictAuthority = projectRelationshipAuthority(t021ConflictGraph, {
  personId: t019LegacyPerson,
  mappingId: "t019-map-legacy",
  expectedActiveGenerationId: "t021-fictional-conflict-generation",
  currentActiveGenerationId: "t021-fictional-conflict-generation",
  semanticResult: { ...t018SemanticResult, personId: t019LegacyPerson },
});
assert.deepEqual({ state: t021ConflictAuthority.state, manual: t021ConflictAuthority.manualAddAllowed, accept: t021ConflictAuthority.acceptAllowed, contact: t021ConflictAuthority.contactAllowed, atomic: t021ConflictAuthority.directAtomicAcceptAllowed }, { state: "relationship-direct-pending", manual: true, accept: false, contact: false, atomic: false }, "T021-O04 conflict exact lineage remains manual-only and gains no semantic/contact authority");

const t021LabelGraph = structuredClone(partialSuiyinGraph);
const t021LabelInventory = projectSourceReceiptInventory(t021LabelGraph).sources.find((source) => source.receiptState === "trusted-suiyin");
const t021LabelDecision = { generationId: "t021-fictional-generation-1", sourceId: fictionalSuiyinSource, sourceAccountAlias: "SY-11223344", label: "2号" };
const t021LabelBefore = structuredClone(t021LabelGraph);
const t021LabelMutation = mutateSuiyinSourceAccountLabel(t021LabelGraph, { sourceIndex: t021LabelInventory.sourceIndex, accountIndex: t021LabelInventory.accountLabels[0].accountIndex, label: "虚构官方三号", decisionBase: t021LabelDecision });
assert.deepEqual(t021LabelGraph, t021LabelBefore, "T021-O06 label mutation must be pure");
assert.deepEqual({ changed: t021LabelMutation.changed, writes: t021LabelMutation.formalWriteCount, generations: t021LabelMutation.generationDelta, analyzer: t021LabelMutation.analyzerInvocationCount, cache: t021LabelMutation.cacheWriteCount }, { changed: true, writes: 1, generations: 1, analyzer: 0, cache: 0 }, "T021-O06 a current legal label decision is exactly one graph mutation");
assert.deepEqual(computeLocalSemanticAffectedPeople(t021LabelGraph, t021LabelMutation.graph), { mode: "affected", personIds: [] }, "T021-O06 label values are presentation-only semantic input");
const t021ReplayDecision = { ...t021LabelDecision, label: "虚构官方三号" };
const t021LabelReplay = mutateSuiyinSourceAccountLabel(t021LabelMutation.graph, { sourceIndex: t021LabelInventory.sourceIndex, accountIndex: t021LabelInventory.accountLabels[0].accountIndex, label: "虚构官方三号", decisionBase: t021ReplayDecision });
assert.deepEqual({ changed: t021LabelReplay.changed, writes: t021LabelReplay.formalWriteCount, generations: t021LabelReplay.generationDelta }, { changed: false, writes: 0, generations: 0 }, "T021-O06 identical replay is zero-write");
const t021StaleLabelBefore = structuredClone(t021LabelMutation.graph);
assert.throws(() => mutateSuiyinSourceAccountLabel(t021LabelMutation.graph, { sourceIndex: t021LabelInventory.sourceIndex, accountIndex: t021LabelInventory.accountLabels[0].accountIndex, label: "另一个安全号位", decisionBase: t021LabelDecision }), (error) => error?.code === "SUIYIN_ACCOUNT_LABEL_STALE", "T021-O06 stale base label must fail closed");
assert.deepEqual(t021LabelMutation.graph, t021StaleLabelBefore, "T021-O06 stale label decision is zero-write");
assert.throws(() => mutateSuiyinSourceAccountLabel(t021LabelMutation.graph, { sourceIndex: t021LabelInventory.sourceIndex, accountIndex: t021LabelInventory.accountLabels[0].accountIndex, label: "单*星", decisionBase: t021ReplayDecision }), (error) => error?.code === "SUIYIN_ACCOUNT_LABEL_INVALID", "T021-O06 masked/raw-looking labels must fail closed");

const t021SemanticGraph = structuredClone(t021LabelGraph);
t021SemanticGraph.people.find((person) => person.id === fictionalSuiyinPerson).state = "active";
t021SemanticGraph.mappings.find((mapping) => mapping.personId === fictionalSuiyinPerson).status = "confirmed";
const t021SemanticSnapshot = createLocalSemanticBatchSnapshot(t021SemanticGraph, { now: t019At });
const t021SemanticAnalyzed = new Map(t021SemanticSnapshot.personIds.map((personId) => [personId, t021SemanticSnapshot.analyzeForCache(personId)]));
const t021SemanticPayload = buildLocalSemanticCachePayload(t021SemanticGraph, t021SemanticAnalyzed);
const t021CacheAdapter = createMemoryVaultAdapter();
const t021CacheKey = await generateVaultKey();
const t021CacheGeneration1 = await commitGraph(t021CacheAdapter, t021SemanticGraph, t021CacheKey, { now: "2026-08-16T17:00:00.000Z" });
await commitLocalSemanticCache(t021CacheAdapter, t021CacheKey, { expectedActiveGenerationId: t021CacheGeneration1, payload: t021SemanticPayload });
const t021CacheBefore = t021CacheAdapter.dump();
const t021CacheInventory = projectSourceReceiptInventory(t021SemanticGraph).sources.find((source) => source.receiptState === "trusted-suiyin");
const t021CacheLabelMutation = mutateSuiyinSourceAccountLabel(t021SemanticGraph, { sourceIndex: t021CacheInventory.sourceIndex, accountIndex: t021CacheInventory.accountLabels[0].accountIndex, label: "虚构官方三号", decisionBase: { generationId: t021CacheGeneration1, sourceId: fictionalSuiyinSource, sourceAccountAlias: "SY-11223344", label: "2号" } });
const t021BusinessWritesBefore = t021CacheAdapter.writeCount;
const t021CacheWritesBefore = t021CacheAdapter.cacheWriteCount;
const t021CacheGeneration2 = await commitGraph(t021CacheAdapter, t021CacheLabelMutation.graph, t021CacheKey, { now: "2026-08-16T17:01:00.000Z", preserveSemanticCache: true, expectedActiveGenerationId: t021CacheGeneration1 });
const t021CacheAfter = t021CacheAdapter.dump();
assert.equal(t021CacheAdapter.writeCount, t021BusinessWritesBefore + 1, "T021-O09 label save installs exactly one new generation");
assert.equal(t021CacheAdapter.cacheWriteCount, t021CacheWritesBefore, "T021-O09 label save performs zero semantic-cache writes");
assert.deepEqual([...t021CacheAfter.semanticCache.envelope.iv], [...t021CacheBefore.semanticCache.envelope.iv], "T021-O09 preserved cache IV must remain byte-identical");
assert.deepEqual([...t021CacheAfter.semanticCache.envelope.ciphertext], [...t021CacheBefore.semanticCache.envelope.ciphertext], "T021-O09 preserved cache ciphertext must remain byte-identical");
assert.equal(t021CacheAfter.semanticCache.boundActiveGenerationId, t021CacheGeneration2, "T021-O09 preserved cache must bind only to the new generation");
assert.equal((await loadActiveGraphWithSemanticCache(t021CacheAdapter, t021CacheKey)).semanticCache.status, "hit", "T021-O09 presentation-only save must keep the semantic cache usable");
const t021StaleCommitBefore = t021CacheAdapter.dump();
const t021StaleWriteCount = t021CacheAdapter.writeCount;
await assert.rejects(() => commitGraph(t021CacheAdapter, t021CacheLabelMutation.graph, t021CacheKey, { now: "2026-08-16T17:02:00.000Z", preserveSemanticCache: true, expectedActiveGenerationId: t021CacheGeneration1 }), (error) => error?.code === "BUSINESS_GENERATION_STALE", "T021-O09 stale generation CAS must fail closed");
assert.equal(t021CacheAdapter.writeCount, t021StaleWriteCount, "T021-O09 stale generation CAS is zero-write");
assert.deepEqual(t021CacheAdapter.dump(), t021StaleCommitBefore, "T021-O09 stale generation CAS preserves graph and cache byte-semantically");

const t021Backup = await createBackup(t021InventoryGraph, "fictional t021 backup phrase", { now: t019At });
const t021BackupAdapter = createMemoryVaultAdapter();
const t021BackupKey = await generateVaultKey();
await commitGraph(t021BackupAdapter, t021LabelGraph, t021BackupKey, { now: "2026-08-16T17:03:00.000Z" });
await restoreBackup(t021BackupAdapter, t021BackupKey, t021Backup, "fictional t021 backup phrase", { now: "2026-08-16T17:04:00.000Z" });
const t021RestoredRegistry = (await loadActiveGraph(t021BackupAdapter, t021BackupKey)).sources.find((source) => source.id === fictionalSuiyinSource).sourceAccountLabels;
assert.deepEqual(t021RestoredRegistry, t021InventorySource.sourceAccountLabels, "T021-O08 encrypted backup/restore must roundtrip the canonical registry");
const t021InvalidRegistryBackupCases = [
  ["invalid alias", { "not-a-suiyin-alias": "2号" }],
  ["single-star label", { "SY-11223344": "单*星" }],
  ["nested registry value", { "SY-11223344": { label: "2号" } }],
];
for (const [caseName, sourceAccountLabels] of t021InvalidRegistryBackupCases) {
  const invalidGraph = structuredClone(t021InventoryGraph);
  invalidGraph.sources.find((source) => source.id === fictionalSuiyinSource).sourceAccountLabels = sourceAccountLabels;
  const phrase = `fictional t021 ${caseName} backup phrase`;
  const invalidBackup = await encryptBackupFixture({ version: 2, createdAt: t019At, mode: "complete-replace", graph: minimizeGraph(invalidGraph) }, phrase);
  const adapterBefore = t021CacheAdapter.dump();
  assert.equal(adapterBefore.semanticCache !== null, true, `T021-O08 ${caseName} fail-closed oracle requires an existing encrypted semantic cache`);
  await assert.rejects(() => restoreBackup(t021CacheAdapter, t021CacheKey, invalidBackup, phrase, { now: "2026-08-16T17:04:30.000Z" }), /invalid-backup-graph/, `T021-O08 ${caseName} must fail closed during encrypted restore`);
  assert.deepEqual(t021CacheAdapter.dump(), adapterBefore, `T021-O08 ${caseName} rejected restore must preserve graph and cache byte-semantically`);
}
const t021Removed = removeSource(t021InventoryGraph, fictionalSuiyinSource);
assert.deepEqual(t021Removed.sources.find((source) => source.id === fictionalSuiyinSource).sourceAccountLabels, {}, "T021-O08 source removal must scrub its account-label registry");

const t021RepairGraph = structuredClone(t016Merged.graph);
t021RepairGraph.people.unshift({ id: "t021-person-previous-unmatched", name: "纯虚构历史未重导联系人", state: "active", sourceScoped: true });
t021RepairGraph.mappings.unshift({ id: "t021-map-previous-unmatched", sourceId: t016SuiyinSource, sourcePersonId: "t021-source-person-previous-unmatched", personId: "t021-person-previous-unmatched", sourceDisplayName: "纯虚构历史未重导联系人", sourceAccountAliases: ["SY-11223344"], status: "confirmed" });
const t021PreviousUnmatchedPerson = structuredClone(t021RepairGraph.people.find((person) => person.id === "t021-person-previous-unmatched"));
const t021PreviousUnmatchedMapping = structuredClone(t021RepairGraph.mappings.find((mapping) => mapping.id === "t021-map-previous-unmatched"));
const t021RepairSource = t021RepairGraph.sources.find((source) => source.id === t016SuiyinSource);
t021RepairSource.sourceKind = "wechat-export-toolkit";
t021RepairSource.sourceBundleRevision = SOURCE_BUNDLE_REVISION;
assert.equal(projectSourceReceiptInventory(t021RepairGraph).sources.find((source) => source.receiptState === "conflict")?.repairAllowed, true, "T021-O04 deterministic mixed receipt must expose explicit repair only");
const t021RepairRelationshipsBefore = structuredClone(t021RepairGraph.relationships);
const t021RepairMappingBefore = structuredClone(t021RepairGraph.mappings.find((mapping) => mapping.id === "t016-map-suiyin"));
const t021Repaired = mergeSuiyinImport(t021RepairGraph, t016ReimportStaging);
const t021RepairedSource = t021Repaired.sources.find((source) => source.id === t016SuiyinSource);
const t021RepairedMapping = t021Repaired.mappings.find((mapping) => mapping.id === "t016-map-suiyin");
assert.equal(projectSourceReceiptInventory(t021Repaired).sources.find((source) => source.sourceIndex === t021Repaired.sources.indexOf(t021RepairedSource))?.receiptState, "trusted-suiyin", "T021-O07 valid same-source staging must repair conflicting metadata");
assert.equal("sourceBundleRevision" in t021RepairedSource, false, "T021-O07 repair must remove WeChat-only receipt metadata");
assert.deepEqual({ personId: t021RepairedMapping.personId, status: t021RepairedMapping.status }, { personId: t021RepairMappingBefore.personId, status: t021RepairMappingBefore.status }, "T021-O07 same-source repair must preserve mapping target and confirmation status");
assert.deepEqual(t021Repaired.people.find((person) => person.id === t021PreviousUnmatchedPerson.id), t021PreviousUnmatchedPerson, "T021-O07 same-source reimport must fully retain an unstaged previous person");
assert.deepEqual(t021Repaired.mappings.find((mapping) => mapping.id === t021PreviousUnmatchedMapping.id), t021PreviousUnmatchedMapping, "T021-O07 same-source reimport must fully retain an unstaged previous mapping");
assert.deepEqual(t021Repaired.relationships, t021RepairRelationshipsBefore, "T021-O07 same-source repair must preserve relationship facts");
assert.deepEqual(t021RepairedSource.sourceAccountLabels, { "SY-11223344": "2号", "SY-55667788": "虚构官方三号", "SY-66778899": "1号", "SY-77889900": "2号" }, "T021-O07 registry merge must preserve prior official labels and add the complete configured roster");
assert.deepEqual(mergeSuiyinImport(t021Repaired, t016ReimportStaging), t021Repaired, "T021-O07 repeated same-source repair must be idempotent");

// T024 focused attribution evidence. All owners, aliases, people, sources and
// bodies are code-local fiction; no real export, vault, MCP or browser is read.
const t024WechatSourceId = (await stableWechatIds({ owner: "fictional-t024-export-owner", platformUserId: "fictional", talker: "fictional", serverId: "fictional", momentId: "fictional" })).sourceId;
const t024UnlinkedWechatSourceId = (await stableWechatIds({ owner: "fictional-t024-unlinked-owner", platformUserId: "fictional", talker: "fictional", serverId: "fictional", momentId: "fictional" })).sourceId;
const t024PreviousWechatSourceId = (await stableWechatIds({ owner: "fictional-t024-previous-owner", platformUserId: "fictional", talker: "fictional", serverId: "fictional", momentId: "fictional" })).sourceId;
const t024LegacyGraph = structuredClone(t021InventoryGraph);
const t024LegacySuiyinSource = t024LegacyGraph.sources.find((source) => source.id === fictionalSuiyinSource);
t024LegacySuiyinSource.sourceAccountWechatSourceLinks = {};
t024LegacyGraph.people.find((person) => person.id === fictionalSuiyinPerson).state = "active";
t024LegacyGraph.mappings.find((mapping) => mapping.personId === fictionalSuiyinPerson).status = "confirmed";
t024LegacyGraph.sources.push(
  { id: t024WechatSourceId, state: "active", sourceKind: "wechat-export-toolkit", sourceBundleRevision: SOURCE_BUNDLE_REVISION, displayName: "纯虚构已关联微信导出" },
  { id: t024UnlinkedWechatSourceId, state: "active", sourceKind: "wechat-export-toolkit", sourceBundleRevision: SOURCE_BUNDLE_REVISION, displayName: "纯虚构私人微信导出" },
);
t024LegacyGraph.mappings.push(
  { id: "t024-map-linked-wechat", sourceId: t024WechatSourceId, sourcePersonId: "t024-source-person-linked", personId: fictionalSuiyinPerson, sourceDisplayName: "纯虚构碎银联系人", sourceAccountAliases: [], status: "confirmed" },
  { id: "t024-map-unlinked-wechat", sourceId: t024UnlinkedWechatSourceId, sourcePersonId: "t024-source-person-unlinked", personId: fictionalSuiyinPerson, sourceDisplayName: "纯虚构碎银联系人", sourceAccountAliases: [], status: "confirmed" },
);
const t024Staging = structuredClone(fictionalSuiyinStaging);
t024Staging.source.sourceAccountWechatSourceLinks = { [t024WechatSourceId]: "SY-11223344" };

const t024PreviewGraphBefore = structuredClone(t024LegacyGraph);
const t024PreviewStagingBefore = structuredClone(t024Staging);
const t024RepairPreview = projectSuiyinSourceAttributionRepair(t024LegacyGraph, t024Staging);
assert.deepEqual(t024RepairPreview, {
  matchedSourceCount: 1,
  affectedPeopleCount: 1,
  attributions: [{ label: "碎银 · 2号", matchedSourceCount: 1, affectedPeopleCount: 1 }],
  formalWriteCount: 0,
}, "T024-O07 explicit repair preview must expose only safe aggregate attribution");
assert.deepEqual(t024LegacyGraph, t024PreviewGraphBefore, "T024-O07 repair preview must be graph zero-write");
assert.deepEqual(t024Staging, t024PreviewStagingBefore, "T024-O07 repair preview must not mutate staging");
const t024RepairPreviewJson = JSON.stringify(t024RepairPreview);
for (const forbidden of [t024WechatSourceId, "SY-11223344", "sourceId", "sourceAccountAlias"]) assert.equal(t024RepairPreviewJson.includes(forbidden), false, `T024-O07 public repair preview leaked ${forbidden}`);

const t024LinkedGraph = structuredClone(t024LegacyGraph);
t024LinkedGraph.sources.find((source) => source.id === fictionalSuiyinSource).sourceAccountWechatSourceLinks = { [t024WechatSourceId]: "SY-11223344" };
const t024LibraryRow = projectRelationshipLibrary(t024LinkedGraph, { now: t019At }).rows.find((row) => row.personId === fictionalSuiyinPerson);
assert.deepEqual(t024LibraryRow.sourceBadges, [{ kind: "wechat", label: "微信导出 · 归属待核对" }, { kind: "suiyin", label: "碎银 · 2号" }], "T025-O01/T024-O04 linked+direct exact attribution must dedupe once while an unlinked WeChat source remains honestly pending");
const t024SameLabelDistinctAliases = structuredClone(t024LinkedGraph);
const t024SameLabelSource = t024SameLabelDistinctAliases.sources.find((source) => source.id === fictionalSuiyinSource);
t024SameLabelSource.sourceAccountLabels = { ...t024SameLabelSource.sourceAccountLabels, "SY-22334455": "2号" };
t024SameLabelDistinctAliases.mappings.find((mapping) => mapping.sourceId === fictionalSuiyinSource).sourceAccountAliases.push("SY-22334455");
assert.deepEqual(projectRelationshipLibrary(t024SameLabelDistinctAliases, { now: t019At }).rows.find((row) => row.personId === fictionalSuiyinPerson).sourceBadges, [
  { kind: "wechat", label: "微信导出 · 归属待核对" },
  { kind: "suiyin", label: "碎银 · 2号" },
  { kind: "suiyin", label: "碎银 · 2号" },
], "T024-O05 distinct aliases with the same safe label must not collapse by public label alone");
const t024TodayCandidate = [...analyzeLocalRelationshipGraph(t024LinkedGraph, { now: t019At }).key, ...analyzeLocalRelationshipGraph(t024LinkedGraph, { now: t019At }).light].find((item) => item.personId === fictionalSuiyinPerson);
assert.deepEqual(t024TodayCandidate.sourceBadges, t024LibraryRow.sourceBadges, "T024-O04 Today must share the relationship-library attribution projector");
const t024Authority = projectRelationshipAuthority(t024LinkedGraph, {
  personId: fictionalSuiyinPerson,
  mappingId: "t024-map-linked-wechat",
  expectedActiveGenerationId: "t024-fictional-generation",
  currentActiveGenerationId: "t024-fictional-generation",
});
assert.deepEqual(t024Authority.sourceBadges, [{ kind: "suiyin", label: "碎银 · 2号" }], "T024-O04 relationship modal authority must project persona only for the linked mapping");
const t024Inventory = projectSourceReceiptInventory(t024LinkedGraph);
const t024LinkedInventory = t024Inventory.sources.find((source) => source.sourceIndex === t024LinkedGraph.sources.findIndex((item) => item.id === t024WechatSourceId));
assert.equal(t024LinkedInventory.collectionChannel, "微信导出", "T024-O06 Sources must retain the collection channel fact");
assert.deepEqual(t024LinkedInventory.accountAttributions, [{ kind: "suiyin", label: "碎银 · 2号" }], "T024-O06 Sources must separately expose safe account attribution");
const t024UnlinkedInventory = t024Inventory.sources.find((source) => source.sourceIndex === t024LinkedGraph.sources.findIndex((item) => item.id === t024UnlinkedWechatSourceId));
assert.deepEqual({ channel: t024UnlinkedInventory.collectionChannel, attribution: t024UnlinkedInventory.accountAttributions }, { channel: "微信导出", attribution: [{ kind: "wechat", label: "微信导出 · 归属待核对" }] }, "T025-O01/T024-O06 Sources must separate the collection channel from a pending account attribution");

const t024PresentationOnlyGraph = structuredClone(t024LegacyGraph);
t024PresentationOnlyGraph.sources.find((source) => source.id === fictionalSuiyinSource).sourceAccountWechatSourceLinks = { [t024WechatSourceId]: "SY-11223344" };
assert.deepEqual(computeLocalSemanticAffectedPeople(t024LegacyGraph, t024PresentationOnlyGraph), { mode: "affected", personIds: [] }, "T024-O09 safe source attribution is presentation-only semantic input");

for (const [caseName, poison, expectedCode] of [
  ["missing required registry", (staging) => { delete staging.source.sourceAccountWechatSourceLinks; }, "SUIYIN_STAGING_SOURCE_MISMATCH"],
  ["invalid source key", (staging) => { staging.source.sourceAccountWechatSourceLinks = { invalid: "SY-11223344" }; }, "SUIYIN_SOURCE_LINK_INVALID"],
  ["dangling alias", (staging) => { staging.source.sourceAccountWechatSourceLinks = { [t024WechatSourceId]: "SY-FFFFFFFF" }; }, "SUIYIN_SOURCE_LINK_INVALID"],
  ["reverse functional conflict", (staging) => { staging.source.sourceAccountWechatSourceLinks = { [t024WechatSourceId]: "SY-11223344", [t024UnlinkedWechatSourceId]: "SY-11223344" }; }, "SUIYIN_SOURCE_LINK_CONFLICT"],
  ["prototype registry", (staging) => { const links = Object.create({ inherited: "SY-11223344" }); links[t024WechatSourceId] = "SY-11223344"; staging.source.sourceAccountWechatSourceLinks = links; }, "SUIYIN_SOURCE_LINK_INVALID"],
  ["raw-only source field", (staging) => { staging.source.clientWcId = "fictional-t024-forbidden-raw"; }, "SUIYIN_STAGING_SOURCE_MISMATCH"],
]) {
  const staging = structuredClone(t024Staging);
  poison(staging);
  const stagingBefore = structuredClone(staging);
  const graphBefore = structuredClone(t024LegacyGraph);
  assert.throws(() => mergeSuiyinImport(t024LegacyGraph, staging), (error) => error?.code === expectedCode, `T024-O02/O03 ${caseName} must fail closed with ${expectedCode}`);
  assert.deepEqual(t024LegacyGraph, graphBefore, `T024-O02/O03 ${caseName} must preserve prior graph`);
  if (caseName !== "prototype registry") assert.deepEqual(staging, stagingBefore, `T024-O02/O03 ${caseName} must preserve staging`);
}

const t024MergeBase = structuredClone(t024LegacyGraph);
const t024MergeBaseSuiyin = t024MergeBase.sources.find((source) => source.id === fictionalSuiyinSource);
t024MergeBaseSuiyin.sourceAccountWechatSourceLinks = { [t024PreviousWechatSourceId]: "SY-22334455" };
const t024MergePreserved = {
  relationships: structuredClone(t024MergeBase.relationships),
  dictionary: structuredClone(t024MergeBase.dictionary),
  identityDecisions: structuredClone(t024MergeBase.identityDecisions),
  otherSources: structuredClone(t024MergeBase.sources.filter((source) => source.id !== fictionalSuiyinSource)),
};
const t024Merged = mergeSuiyinImport(t024MergeBase, t024Staging);
const t024MergedSuiyin = t024Merged.sources.find((source) => source.id === fictionalSuiyinSource);
assert.deepEqual(t024MergedSuiyin.sourceAccountWechatSourceLinks, { [t024WechatSourceId]: "SY-11223344", [t024PreviousWechatSourceId]: "SY-22334455" }, "T024-O08 same-source merge must preserve prior links and add staged exact pairs canonically");
assert.deepEqual({ relationships: t024Merged.relationships, dictionary: t024Merged.dictionary, identityDecisions: t024Merged.identityDecisions, otherSources: t024Merged.sources.filter((source) => source.id !== fictionalSuiyinSource) }, t024MergePreserved, "T024-O08 link merge must preserve relationships, dictionary, identity decisions and other sources");
assert.deepEqual(mergeSuiyinImport(t024Merged, t024Staging), t024Merged, "T024-O08 exact link replay must be idempotent");

for (const [caseName, previousLinks] of [
  ["same key different alias", { [t024WechatSourceId]: "SY-22334455" }],
  ["same alias different key", { [t024PreviousWechatSourceId]: "SY-11223344" }],
]) {
  const graph = structuredClone(t024LegacyGraph);
  graph.sources.find((source) => source.id === fictionalSuiyinSource).sourceAccountWechatSourceLinks = previousLinks;
  const before = structuredClone(graph);
  assert.throws(() => mergeSuiyinImport(graph, t024Staging), (error) => error?.code === "SUIYIN_SOURCE_LINK_CONFLICT", `T024-O03 merge ${caseName} must fail closed`);
  assert.deepEqual(graph, before, `T024-O03 merge ${caseName} must preserve prior graph`);
}

const t024Backup = await createBackup(t024Merged, "fictional t024 backup phrase", { now: t019At });
const t024BackupAdapter = createMemoryVaultAdapter();
const t024BackupKey = await generateVaultKey();
await commitGraph(t024BackupAdapter, t024LegacyGraph, t024BackupKey, { now: "2026-08-19T00:30:00.000Z" });
await restoreBackup(t024BackupAdapter, t024BackupKey, t024Backup, "fictional t024 backup phrase", { now: "2026-08-19T00:31:00.000Z" });
const t024Restored = await loadActiveGraph(t024BackupAdapter, t024BackupKey);
assert.deepEqual(t024Restored.sources.find((source) => source.id === fictionalSuiyinSource).sourceAccountWechatSourceLinks, t024MergedSuiyin.sourceAccountWechatSourceLinks, "T024-O08 encrypted backup/restore must roundtrip safe links");
const t024WritesAfterRestore = t024BackupAdapter.writeCount;
assert.deepEqual(projectRelationshipLibrary(t024Restored, { now: t019At }).rows.find((row) => row.personId === fictionalSuiyinPerson).sourceBadges, t024LibraryRow.sourceBadges, "T024-O07 reopen must recover the same public attribution without reimport");
assert.equal(t024BackupAdapter.writeCount, t024WritesAfterRestore, "T024-O07 reopen/projection must be zero-write");

const t024RemovedWechat = removeSource(t024Merged, t024WechatSourceId);
assert.equal(Object.prototype.hasOwnProperty.call(t024RemovedWechat.sources.find((source) => source.id === fictionalSuiyinSource).sourceAccountWechatSourceLinks, t024WechatSourceId), false, "T024-O08 removing a linked WeChat source must prune its Suiyin link");
const t024RemovedSuiyin = removeSource(t024Merged, fictionalSuiyinSource);
assert.deepEqual(t024RemovedSuiyin.sources.find((source) => source.id === fictionalSuiyinSource).sourceAccountWechatSourceLinks, {}, "T024-O08 removing Suiyin source must scrub its safe links");

// T025 mapping-level account attribution. Every source, person, alias and label
// below is code-local fiction; these oracles never read a real vault, export,
// browser DOM, private chat or MCP response.
const t025At = "2026-08-19T02:00:00.000Z";
const t025WechatSourceId = (await stableWechatIds({ owner: "fictional-t025-owner", platformUserId: "fictional", talker: "fictional", serverId: "fictional", momentId: "fictional" })).sourceId;
const t025ExactWechatSourceId = (await stableWechatIds({ owner: "fictional-t025-exact-owner", platformUserId: "fictional", talker: "fictional", serverId: "fictional", momentId: "fictional" })).sourceId;
const t025SuiyinSourceId = "t025-fictional-suiyin-source";
const t025Graph = {
  owner: "t025-fictional-owner",
  sources: [
    { id: t025WechatSourceId, state: "active", sourceKind: "wechat-export-toolkit", sourceBundleRevision: SOURCE_BUNDLE_REVISION, displayName: "纯虚构微信导出" },
    { id: t025ExactWechatSourceId, state: "active", sourceKind: "wechat-export-toolkit", sourceBundleRevision: SOURCE_BUNDLE_REVISION, displayName: "纯虚构精确归属微信导出" },
    { id: t025SuiyinSourceId, state: "active", sourceKind: "suiyin-mcp", displayName: "纯虚构碎银来源", sourceAccountLabels: { "SY-00000002": "2号", "SY-00000003": "业务号" }, sourceAccountWechatSourceLinks: { [t025ExactWechatSourceId]: "SY-00000002" } },
  ],
  people: [
    { id: "t025-person-one", name: "纯虚构人物一", state: "active", sourceScoped: true },
    { id: "t025-person-two", name: "纯虚构人物二", state: "active", sourceScoped: true },
    { id: "t025-person-exact", name: "纯虚构精确人物", state: "active", sourceScoped: true },
  ],
  mappings: [
    { id: "t025-map-one", sourceId: t025WechatSourceId, sourcePersonId: "t025-source-person-one", personId: "t025-person-one", sourceDisplayName: "纯虚构人物一", sourceAccountAliases: [], status: "confirmed" },
    { id: "t025-map-two", sourceId: t025WechatSourceId, sourcePersonId: "t025-source-person-two", personId: "t025-person-two", sourceDisplayName: "纯虚构人物二", sourceAccountAliases: [], status: "confirmed" },
    { id: "t025-map-exact", sourceId: t025ExactWechatSourceId, sourcePersonId: "t025-source-person-exact", personId: "t025-person-exact", sourceDisplayName: "纯虚构精确人物", sourceAccountAliases: [], status: "confirmed" },
  ],
  excerpts: [], relationships: [], dictionary: [], signals: [], topics: [], notes: [], actions: [], trash: [], purgedPersonIds: [], identityDecisions: [], settings: { schema: 2 },
};
const t025Before = structuredClone(t025Graph);
const t025Pending = projectMappingAccountAttribution(t025Graph, { mappingId: "t025-map-one" });
assert.deepEqual(t025Pending, {
  state: "pending",
  currentLabel: "微信导出 · 归属待核对",
  options: [{ optionIndex: 0, label: "私人微信" }, { optionIndex: 1, label: "2号" }, { optionIndex: 2, label: "业务号" }],
  canEdit: true,
  canUndo: false,
  formalWriteCount: 0,
}, "T025-O01/O03 pending projection must be honest and expose only safe stable options");
assert.deepEqual(t025Graph, t025Before, "T025-O01/O03 projection must be graph zero-write");
const t025PendingJson = JSON.stringify(t025Pending);
for (const forbidden of [t025WechatSourceId, "t025-map-one", "t025-person-one", "SY-00000002", "sourceAccountAlias"]) assert.equal(t025PendingJson.includes(forbidden), false, `T025-O03/O10 safe editor leaked ${forbidden}`);
assert.deepEqual(projectMappingAccountAttribution(t025Graph, { mappingId: "t025-map-exact" }), {
  state: "exact-suiyin-persona",
  currentLabel: "碎银 · 2号",
  options: t025Pending.options,
  canEdit: true,
  canUndo: false,
  formalWriteCount: 0,
}, "T025-O02 exact T024 source link must remain the fallback when no manual override exists");

const t025PrivateInput = { mappingId: "t025-map-one", operation: "set", selectionKind: "private-wechat", decisionId: "t025-private-decision", at: t025At, expectedActiveGenerationId: "t025-generation-1", currentActiveGenerationId: "t025-generation-1" };
const t025Private = mutateMappingAccountAttribution(t025Graph, t025PrivateInput);
assert.deepEqual({ changed: t025Private.changed, formalWriteCount: t025Private.formalWriteCount, generationDelta: t025Private.generationDelta, relationshipWriteCount: t025Private.relationshipWriteCount, identityWriteCount: t025Private.identityWriteCount, analyzerInvocationCount: t025Private.analyzerInvocationCount, cacheWriteCount: t025Private.cacheWriteCount }, { changed: true, formalWriteCount: 1, generationDelta: 1, relationshipWriteCount: 0, identityWriteCount: 0, analyzerInvocationCount: 0, cacheWriteCount: 0 }, "T025-O04/O08/O09 save must be one business generation and zero authority/cache/analyzer writes");
assert.deepEqual(t025Graph, t025Before, "T025-O04 mutation must leave the input graph deep-equal");
assert.deepEqual(t025Private.graph.mappings.filter((mapping) => mapping.id !== "t025-map-one"), t025Graph.mappings.filter((mapping) => mapping.id !== "t025-map-one"), "T025-O04/O11 manual attribution must affect exactly one mapping");
for (const field of ["sources", "people", "excerpts", "relationships", "dictionary", "signals", "topics", "notes", "actions", "trash", "purgedPersonIds", "identityDecisions"]) assert.deepEqual(t025Private.graph[field], t025Graph[field], `T025-O09 attribution must not mutate ${field}`);
assert.deepEqual(projectMappingAccountAttribution(t025Private.graph, { mappingId: "t025-map-one" }), { ...t025Pending, state: "private-wechat", currentLabel: "微信", canUndo: true }, "T025-O04 private-WeChat confirmation must become the highest-priority mapping fact");
assert.equal(projectMappingAccountAttribution(t025Private.graph, { mappingId: "t025-map-two" }).state, "pending", "T025-O11 same-source sibling mapping must remain unchanged");
assert.deepEqual(computeLocalSemanticAffectedPeople(t025Graph, t025Private.graph), { mode: "affected", personIds: [] }, "T025-O08/O09 attribution is presentation-only semantic input");
const t025PrivateReplay = mutateMappingAccountAttribution(t025Private.graph, t025PrivateInput);
assert.deepEqual({ changed: t025PrivateReplay.changed, formalWriteCount: t025PrivateReplay.formalWriteCount, generationDelta: t025PrivateReplay.generationDelta }, { changed: false, formalWriteCount: 0, generationDelta: 0 }, "T025-O05 exact replay must be zero-write");
assert.deepEqual(t025PrivateReplay.graph, t025Private.graph, "T025-O05 replay must preserve the committed graph");

const t025Persona = mutateMappingAccountAttribution(t025Private.graph, { ...t025PrivateInput, selectionKind: "suiyin-persona", optionIndex: 1, decisionId: "t025-persona-decision", at: "2026-08-19T02:01:00.000Z" });
assert.deepEqual(projectMappingAccountAttribution(t025Persona.graph, { mappingId: "t025-map-one" }), { ...t025Pending, state: "suiyin-persona", currentLabel: "碎银 · 2号", canUndo: true }, "T025-O04 manual persona selection must resolve only the commit-time safe option index");
assert.equal(projectRelationshipLibrary(t025Persona.graph, { now: t025At }).rows.find((row) => row.personId === "t025-person-one")?.sourceBadges[0]?.label, "碎银 · 2号", "T025-O04 shared relationship-library projection must show the saved manual persona");
const t025UndoSameDecision = mutateMappingAccountAttribution(t025Persona.graph, { mappingId: "t025-map-one", operation: "undo", decisionId: "t025-persona-decision", at: "2026-08-19T02:01:30.000Z", expectedActiveGenerationId: "t025-generation-2", currentActiveGenerationId: "t025-generation-2" });
assert.deepEqual({ graph: t025UndoSameDecision.graph, changed: t025UndoSameDecision.changed, formalWriteCount: t025UndoSameDecision.formalWriteCount, generationDelta: t025UndoSameDecision.generationDelta }, { graph: t025Persona.graph, changed: false, formalWriteCount: 0, generationDelta: 0 }, "T025-O05 reusing the current set decision id for undo must be a zero-write replay");
const t025Undo = mutateMappingAccountAttribution(t025Persona.graph, { mappingId: "t025-map-one", operation: "undo", decisionId: "t025-undo-decision", at: "2026-08-19T02:02:00.000Z", expectedActiveGenerationId: "t025-generation-2", currentActiveGenerationId: "t025-generation-2" });
assert.deepEqual({ changed: t025Undo.changed, formalWriteCount: t025Undo.formalWriteCount, generationDelta: t025Undo.generationDelta }, { changed: true, formalWriteCount: 1, generationDelta: 1 }, "T025-O05 undo must be exactly one business write");
assert.equal(projectMappingAccountAttribution(t025Undo.graph, { mappingId: "t025-map-one" }).state, "pending", "T025-O05 undo must fall back to pending without an exact link");
assert.throws(() => mutateMappingAccountAttribution(t025Persona.graph, { mappingId: "t025-map-one", operation: "undo", selectionKind: "private-wechat", decisionId: "t025-undo-with-selection", at: "2026-08-19T02:02:30.000Z", expectedActiveGenerationId: "t025-generation-2", currentActiveGenerationId: "t025-generation-2" }), (error) => error?.code === "ACCOUNT_ATTRIBUTION_CONFLICT", "T025-O05 undo must reject a carried selection instead of silently writing");
const t025SiblingDecision = mutateMappingAccountAttribution(t025Persona.graph, { ...t025PrivateInput, mappingId: "t025-map-two", decisionId: "t025-sibling-decision", at: "2026-08-19T02:02:40.000Z" });
assert.throws(() => mutateMappingAccountAttribution(t025SiblingDecision.graph, { mappingId: "t025-map-one", operation: "undo", decisionId: "t025-sibling-decision", at: "2026-08-19T02:02:50.000Z", expectedActiveGenerationId: "t025-generation-2", currentActiveGenerationId: "t025-generation-2" }), (error) => error?.code === "ACCOUNT_ATTRIBUTION_CONFLICT", "T025-O05 undo must not reuse a decision id already bound to a sibling mapping");
const t025ExactPrivate = mutateMappingAccountAttribution(t025Graph, { ...t025PrivateInput, mappingId: "t025-map-exact", decisionId: "t025-exact-private" });
assert.equal(projectMappingAccountAttribution(t025ExactPrivate.graph, { mappingId: "t025-map-exact" }).state, "private-wechat", "T025-O02 manual mapping fact must override a source-level exact link");
const t025ExactUndo = mutateMappingAccountAttribution(t025ExactPrivate.graph, { mappingId: "t025-map-exact", operation: "undo", decisionId: "t025-exact-undo", at: "2026-08-19T02:03:00.000Z", expectedActiveGenerationId: "t025-generation-2", currentActiveGenerationId: "t025-generation-2" });
assert.equal(projectMappingAccountAttribution(t025ExactUndo.graph, { mappingId: "t025-map-exact" }).state, "exact-suiyin-persona", "T025-O02/O05 undo must reveal the lower exact evidence again");

for (const [caseName, mutate, expectedCode] of [
  ["stale generation", () => mutateMappingAccountAttribution(t025Graph, { ...t025PrivateInput, currentActiveGenerationId: "t025-generation-drift" }), "ACCOUNT_ATTRIBUTION_STALE"],
  ["unavailable option", () => mutateMappingAccountAttribution(t025Graph, { ...t025PrivateInput, selectionKind: "suiyin-persona", optionIndex: 99 }), "ACCOUNT_ATTRIBUTION_OPTION_UNAVAILABLE"],
  ["private option index forbidden", () => mutateMappingAccountAttribution(t025Graph, { ...t025PrivateInput, optionIndex: 0 }), "ACCOUNT_ATTRIBUTION_OPTION_UNAVAILABLE"],
  ["parseable non-ISO mutation timestamp", () => mutateMappingAccountAttribution(t025Graph, { ...t025PrivateInput, at: "August 19, 2026" }), "ACCOUNT_ATTRIBUTION_CONFLICT"],
  ["extra mutation field", () => mutateMappingAccountAttribution(t025Graph, { ...t025PrivateInput, sourceAccountAlias: "SY-00000002" }), "ACCOUNT_ATTRIBUTION_CONFLICT"],
]) {
  const before = structuredClone(t025Graph);
  assert.throws(mutate, (error) => error?.code === expectedCode && !JSON.stringify(error).includes("SY-"), `T025-O05/O10 ${caseName} must fail closed with safe typed code ${expectedCode}`);
  assert.deepEqual(t025Graph, before, `T025-O05 ${caseName} must preserve prior graph`);
}
assert.throws(() => projectMappingAccountAttribution(t025Graph, { mappingId: "t025-map-one", sourceId: t025WechatSourceId }), (error) => error?.code === "ACCOUNT_ATTRIBUTION_MAPPING_INELIGIBLE", "T025-O03/O10 projector must reject raw extra input instead of reflecting it");
assert.throws(() => mutateMappingAccountAttribution(t025Private.graph, { ...t025PrivateInput, mappingId: "t025-map-two" }), (error) => error?.code === "ACCOUNT_ATTRIBUTION_CONFLICT", "T025-O05 one opaque decision id cannot be replayed onto another mapping");
const t025ConflictGraph = structuredClone(t025Graph);
t025ConflictGraph.sources.push({ id: "t025-fictional-conflicting-suiyin", state: "active", sourceKind: "suiyin-mcp", displayName: "纯虚构冲突碎银", sourceAccountLabels: { "SY-00000002": "冲突号" }, sourceAccountWechatSourceLinks: {} });
assert.throws(() => projectMappingAccountAttribution(t025ConflictGraph, { mappingId: "t025-map-one" }), (error) => error?.code === "ACCOUNT_ATTRIBUTION_CONFLICT", "T025-O03/O05 same alias with conflicting official labels must fail closed");

const t025ReimportBase = mutateMappingAccountAttribution(importedGraph, { mappingId: importedGraph.mappings[0].id, operation: "set", selectionKind: "private-wechat", decisionId: "t025-reimport-decision", at: t025At, expectedActiveGenerationId: "t025-reimport-generation", currentActiveGenerationId: "t025-reimport-generation" }).graph;
const t025Reimported = buildImportedGraph(parsedFixture, t025ReimportBase);
assert.deepEqual(t025Reimported.mappings.find((mapping) => mapping.id === importedGraph.mappings[0].id).accountAttributionOverride, t025ReimportBase.mappings.find((mapping) => mapping.id === importedGraph.mappings[0].id).accountAttributionOverride, "T025-O06 same-source reimport must preserve an existing valid user decision without creating one");
const t025PoisonedStaging = structuredClone(t024Staging);
t025PoisonedStaging.mappings[0].accountAttributionOverride = { kind: "private-wechat", decisionId: "forbidden-staging-decision", updatedAt: t025At };
assert.throws(() => mergeSuiyinImport(t025Graph, t025PoisonedStaging), (error) => error?.code === "SUIYIN_STAGING_REFERENCE_INVALID", "T025-O06 Suiyin staging must never carry a user attribution decision");

const t025Trashed = trashPerson(t025Persona.graph, "t025-person-one", t025At);
assert.deepEqual(t025Trashed.mappings.find((mapping) => mapping.id === "t025-map-one").accountAttributionOverride, t025Persona.graph.mappings.find((mapping) => mapping.id === "t025-map-one").accountAttributionOverride, "T025-O07 trash must hide but preserve the encrypted override");
const t025RestoredPerson = restorePerson(t025Trashed, "t025-person-one");
assert.equal(projectMappingAccountAttribution(t025RestoredPerson, { mappingId: "t025-map-one" }).state, "suiyin-persona", "T025-O07 restore must recover the saved attribution");
assert.equal(purgePerson(t025Persona.graph, "t025-person-one").mappings.some((mapping) => mapping.id === "t025-map-one"), false, "T025-O07 purge must remove the mapping and its override");
const t025RemovedPersonaSource = removeSource(t025Persona.graph, t025SuiyinSourceId);
assert.equal(t025RemovedPersonaSource.mappings.find((mapping) => mapping.id === "t025-map-one").accountAttributionOverride, undefined, "T025-O07 removing the referenced persona registry must clear the dangling override in the same transaction");
assert.equal(projectMappingAccountAttribution(t025RemovedPersonaSource, { mappingId: "t025-map-one" }).state, "pending", "T025-O07 removed persona must fall back honestly to pending");

const t025MergeGraph = structuredClone(t016Graph);
t025MergeGraph.mappings.find((mapping) => mapping.id === "t016-map-wechat").accountAttributionOverride = { kind: "private-wechat", decisionId: "t025-lineage-decision", updatedAt: t025At };
const t025MergePair = projectSourceIdentityReview(t025MergeGraph).pairs.find((pair) => pair.status === "pending");
const t025Merged = mergeImportedIdentityPair(t025MergeGraph, { pairKey: t025MergePair.pairKey, decisionId: "t025-merge-decision", at: t025At });
assert.deepEqual(t025Merged.graph.mappings.find((mapping) => mapping.id === "t016-map-wechat").accountAttributionOverride, t025MergeGraph.mappings.find((mapping) => mapping.id === "t016-map-wechat").accountAttributionOverride, "T025-O07 identity merge must preserve mapping attribution");
assert.deepEqual(undoImportedIdentityPairDecision(t025Merged.graph, { pairKey: t025MergePair.pairKey }).graph, t025MergeGraph, "T025-O07 identity merge undo must restore the exact override lineage");
const t025PersonaLineageGraph = structuredClone(t016Graph);
t025PersonaLineageGraph.sources.push({ id: "t025-lineage-persona-source", state: "active", sourceKind: "suiyin-mcp", displayName: "纯虚构仅供归属的人设来源", sourceAccountLabels: { "SY-ABCDEF12": "专属号" }, sourceAccountWechatSourceLinks: {} });
t025PersonaLineageGraph.mappings.find((mapping) => mapping.id === "t016-map-wechat").accountAttributionOverride = { kind: "suiyin-persona", sourceAccountAlias: "SY-ABCDEF12", decisionId: "t025-lineage-persona-decision", updatedAt: t025At };
const t025PersonaLineagePair = projectSourceIdentityReview(t025PersonaLineageGraph).pairs.find((pair) => pair.status === "pending");
const t025PersonaLineageMerged = mergeImportedIdentityPair(t025PersonaLineageGraph, { pairKey: t025PersonaLineagePair.pairKey, decisionId: "t025-lineage-merge-decision", at: t025At });
const t025PersonaLineageRemoved = removeSource(t025PersonaLineageMerged.graph, "t025-lineage-persona-source");
const t025PersonaLineageDecision = t025PersonaLineageRemoved.identityDecisions.find((decision) => decision.pairKey === t025PersonaLineagePair.pairKey);
assert.equal(t025PersonaLineageDecision.lineage.mappingsBefore.concat(t025PersonaLineageDecision.lineage.mappingsAfter).some((mapping) => mapping.accountAttributionOverride?.sourceAccountAlias === "SY-ABCDEF12"), false, "T025-O07 persona removal must prune dangling override from live and merge lineage atomically");
const t025PersonaLineageUndone = undoImportedIdentityPairDecision(t025PersonaLineageRemoved, { pairKey: t025PersonaLineagePair.pairKey });
assert.equal(t025PersonaLineageUndone.graph.mappings.find((mapping) => mapping.id === "t016-map-wechat").accountAttributionOverride, undefined, "T025-O07 post-removal identity undo must remain reachable without reviving a dangling attribution");

const t025Backup = await createBackup(t025Persona.graph, "fictional t025 backup phrase", { now: t025At });
const t025BackupAdapter = createMemoryVaultAdapter();
const t025BackupKey = await generateVaultKey();
await commitGraph(t025BackupAdapter, t025Graph, t025BackupKey, { now: "2026-08-19T02:04:00.000Z" });
await restoreBackup(t025BackupAdapter, t025BackupKey, t025Backup, "fictional t025 backup phrase", { now: "2026-08-19T02:05:00.000Z" });
const t025RestoredGraph = await loadActiveGraph(t025BackupAdapter, t025BackupKey);
assert.equal(projectMappingAccountAttribution(t025RestoredGraph, { mappingId: "t025-map-one" }).state, "suiyin-persona", "T025-O06 encrypted backup/restore must recover the saved manual attribution");
const t025WritesAfterRestore = t025BackupAdapter.writeCount;
projectRelationshipLibrary(t025RestoredGraph, { now: t025At });
assert.equal(t025BackupAdapter.writeCount, t025WritesAfterRestore, "T025-O06 reopen/project must be zero-write and require no reimport");
for (const [caseName, poison] of [
  ["extra override field", (graph) => { graph.mappings.find((mapping) => mapping.id === "t025-map-one").accountAttributionOverride.extra = true; }],
  ["parseable non-ISO override timestamp", (graph) => { graph.mappings.find((mapping) => mapping.id === "t025-map-one").accountAttributionOverride.updatedAt = "August 19, 2026"; }],
  ["dangling persona alias", (graph) => { graph.mappings.find((mapping) => mapping.id === "t025-map-one").accountAttributionOverride.sourceAccountAlias = "SY-FFFFFFFF"; }],
  ["duplicate live decision id", (graph) => { graph.mappings.find((mapping) => mapping.id === "t025-map-two").accountAttributionOverride = structuredClone(graph.mappings.find((mapping) => mapping.id === "t025-map-one").accountAttributionOverride); }],
]) {
  const invalidGraph = structuredClone(t025Persona.graph);
  poison(invalidGraph);
  const phrase = `fictional t025 ${caseName}`;
  const invalidBackup = await encryptBackupFixture({ version: 2, createdAt: t025At, mode: "complete-replace", graph: minimizeGraph(invalidGraph) }, phrase);
  const prior = t025BackupAdapter.dump();
  await assert.rejects(() => restoreBackup(t025BackupAdapter, t025BackupKey, invalidBackup, phrase, { now: "2026-08-19T02:06:00.000Z" }), /invalid-backup-graph/, `T025-O06/O07 ${caseName} restore must fail closed`);
  assert.deepEqual(t025BackupAdapter.dump(), prior, `T025-O06/O07 ${caseName} must preserve prior graph/cache`);
}
const t025LineageOnlyDangling = structuredClone(t025PersonaLineageMerged.graph);
delete t025LineageOnlyDangling.mappings.find((mapping) => mapping.id === "t016-map-wechat").accountAttributionOverride;
for (const field of ["mappingsBefore", "mappingsAfter"]) {
  const lineageMapping = t025LineageOnlyDangling.identityDecisions[0].lineage[field].find((mapping) => mapping.id === "t016-map-wechat");
  lineageMapping.accountAttributionOverride.sourceAccountAlias = "SY-FFFFFFFF";
}
const t025LineagePhrase = "fictional t025 lineage-only dangling";
const t025LineageBackup = await encryptBackupFixture({ version: 2, createdAt: t025At, mode: "complete-replace", graph: minimizeGraph(t025LineageOnlyDangling) }, t025LineagePhrase);
const t025LineagePrior = t025BackupAdapter.dump();
await assert.rejects(() => restoreBackup(t025BackupAdapter, t025BackupKey, t025LineageBackup, t025LineagePhrase, { now: "2026-08-19T02:07:00.000Z" }), /invalid-backup-graph/, "T025-O06/O07 lineage-only dangling persona override must fail closed during restore");
assert.deepEqual(t025BackupAdapter.dump(), t025LineagePrior, "T025-O06/O07 rejected lineage-only backup must preserve prior graph/cache");

// T027 collection-location projection. Every source, mapping, alias and label
// below is code-local fiction. These checks exercise the production
// relationship-library projector only; they never open IndexedDB, an export,
// a browser profile or MCP.
const t027Location = (kind, label, reviewRequired) => ({
  kind,
  label,
  filterKey: JSON.stringify(["collection-location-v1", kind, label]),
  reviewRequired,
});
const t027LocationsFor = (graph, personId) => projectRelationshipLibrary(graph, { now: t025At }).rows.find((row) => row.personId === personId)?.collectionLocations;

const t027WechatPending = t027LocationsFor(t025Graph, "t025-person-one");
const t027WechatPrivate = t027LocationsFor(t025Private.graph, "t025-person-one");
const t027WechatPersona = t027LocationsFor(t025Persona.graph, "t025-person-one");
const t027WechatExact = t027LocationsFor(t025Graph, "t025-person-exact");
const t027MyWechat = [t027Location("my-wechat", "我的微信", false)];
assert.deepEqual(t027WechatPending, t027MyWechat, "T027-O01 unlinked WeChat export must project its actual collection location as 我的微信");
assert.deepEqual(t027WechatPrivate, t027MyWechat, "T027-O01 T025 private-WeChat override must not alter collection lineage");
assert.deepEqual(t027WechatPersona, t027MyWechat, "T027-O01 T025 Suiyin-persona override must not alter collection lineage");
assert.deepEqual(t027WechatExact, t027MyWechat, "T027-O01 T024 exact-linked WeChat export must remain 我的微信 as a collection location");

const t027DirectSuiyin = t027LocationsFor(t019Graph, t019SuiyinMultiPerson);
assert.deepEqual(t027DirectSuiyin, [
  t027Location("suiyin-official", "碎银 · 2号", false),
  t027Location("suiyin-official", "碎银 · 虚构官方三号", false),
], "T027-O02 direct Suiyin mappings must use only same-source official SystemName labels in stable order");
assert.deepEqual(t027LocationsFor(t019Graph, t019SuiyinNoAliasPerson), [t027Location("suiyin-pending", "碎银 · 账号待补", true)], "T027-O02 direct Suiyin without an exact official account must fail closed as pending");
assert.deepEqual(t027LocationsFor(t019Graph, t019UnknownPendingPerson), [t027Location("unknown", "采集位置未识别 · 请重导", true)], "T027-O02 unknown provenance must remain an honest collection-location fallback");

const t027ConflictPersonId = t021RepairGraph.mappings.find((mapping) => mapping.sourceId === t016SuiyinSource)?.personId;
assert.deepEqual(t027LocationsFor(t021RepairGraph, t027ConflictPersonId), [t027Location("conflict", "采集位置冲突 · 请修复", true)], "T027-O02 mixed WeChat/Suiyin provenance must fail closed as a collection-location conflict");

const t027LinkedLocationsBefore = t027LocationsFor(t024LegacyGraph, fictionalSuiyinPerson);
const t027LinkedLocationsAfter = t027LocationsFor(t024LinkedGraph, fictionalSuiyinPerson);
assert.deepEqual(t027LinkedLocationsBefore, [
  t027Location("my-wechat", "我的微信", false),
  t027Location("suiyin-official", "碎银 · 2号", false),
], "T027-O03 one person with live WeChat and direct Suiyin mappings must expose both collection locations");
assert.deepEqual(t027LinkedLocationsAfter, t027LinkedLocationsBefore, "T027-O01/O09 adding a T024 account-attribution link must not change collection locations");
assert.deepEqual(t027LocationsFor(t024SameLabelDistinctAliases, fictionalSuiyinPerson), t027LinkedLocationsAfter, "T027-O03 collection locations dedupe by safe kind and label even when distinct aliases share the same public SystemName");

const t027NoMappingGraph = structuredClone(t025Graph);
t027NoMappingGraph.mappings = t027NoMappingGraph.mappings.filter((mapping) => mapping.personId !== "t025-person-one");
t027NoMappingGraph.excerpts.push({ id: "t027-fictional-no-mapping-excerpt", sourceId: t025WechatSourceId, personId: "t025-person-one", kind: "chat-text", text: "纯虚构采集位置回退", timestamp: t025At });
assert.deepEqual(t027LocationsFor(t027NoMappingGraph, "t025-person-one"), [t027Location("unknown", "采集位置未识别 · 请重导", true)], "T027-O03 a visible row without current live mapping authority must still expose one safe unknown location");
const t027RemovedSourceGraph = structuredClone(t025Graph);
t027RemovedSourceGraph.sources.find((source) => source.id === t025WechatSourceId).state = "removed";
assert.equal(projectRelationshipLibrary(t027RemovedSourceGraph, { now: t025At }).rows.some((row) => row.personId === "t025-person-one"), false, "T027-O03 removed source lineage must not keep a person visible or contribute a location");

const t027ProjectionBefore = structuredClone(t024LinkedGraph);
const t027ProjectedLibrary = projectRelationshipLibrary(t024LinkedGraph, { now: t025At });
assert.deepEqual(t024LinkedGraph, t027ProjectionBefore, "T027-O08/O09 collection-location projection must be graph zero-write");
assert.equal(t027ProjectedLibrary.rows.every((row) => Array.isArray(row.collectionLocations) && row.collectionLocations.length > 0), true, "T027-O03 every visible relationship-library row must expose a nonempty collectionLocations array");
for (const row of t027ProjectedLibrary.rows) {
  assert.equal(Object.isFrozen(row.collectionLocations), true, "T027-O03 public collectionLocations must be a readonly projection array");
  for (const location of row.collectionLocations) {
    assert.equal(Object.isFrozen(location), true, "T027-O03 each public collection-location descriptor must be readonly");
    assert.deepEqual(Object.keys(location).sort(), ["filterKey", "kind", "label", "reviewRequired"], "T027-O03 public collection location must have the exact safe shape");
    assert.equal(typeof location.filterKey === "string" && location.filterKey === JSON.stringify(["collection-location-v1", location.kind, location.label]), true, "T027-O05 collection-location filter key must be derived only from public kind and label");
    const serialized = JSON.stringify(location);
    for (const forbidden of ["SY-", t024WechatSourceId, t024UnlinkedWechatSourceId, "t024-map-", fictionalSuiyinPerson]) assert.equal(serialized.includes(forbidden), false, `T027-O03/O06 collection location leaked forbidden identifier ${forbidden}`);
  }
}

// T022-O11 atomic first-key convergence. This fake models only the public
// IndexedDB request/transaction behavior exercised by getOrCreateKey(). It is
// shared by two independent adapters, serializes keys readwrite transactions,
// and never opens a browser profile or real IndexedDB database.
const createT022SharedFakeIndexedDb = ({ initialReadBarrierSize = 2, failNextKeyPut = false } = {}) => {
  const shared = {
    opened: false,
    storeNames: new Set(),
    vaultKey: null,
    keyPutCount: 0,
    initialReadBarrierSize,
    initialReadWaiters: [],
    failNextKeyPut,
    writeTail: Promise.resolve(),
  };

  const finishTransaction = (tx) => {
    if (tx.finished) return;
    tx.finished = true;
    tx.oncomplete?.();
    tx.releaseWrite?.();
  };

  const abortTransaction = (tx, error) => {
    if (tx.finished) return;
    tx.finished = true;
    tx.error = error;
    tx.onerror?.();
    tx.onabort?.();
    tx.releaseWrite?.();
  };

  const schedulePump = (tx) => {
    if (!tx.active || tx.processing || tx.finished) return;
    const operation = tx.operations.shift();
    if (!operation) {
      queueMicrotask(() => {
        if (tx.active && !tx.processing && tx.operations.length === 0 && !tx.finished) finishTransaction(tx);
        else schedulePump(tx);
      });
      return;
    }
    tx.processing = true;
    queueMicrotask(() => operation());
  };

  const settleGet = (tx, request, value) => {
    request.result = value;
    request.onsuccess?.();
    tx.processing = false;
    schedulePump(tx);
  };

  const createTransaction = (mode) => {
    const tx = {
      mode,
      active: mode === "readonly",
      processing: false,
      finished: false,
      operations: [],
      error: null,
      oncomplete: null,
      onerror: null,
      onabort: null,
      releaseWrite: null,
      objectStore(name) {
        assert.equal(name, "keys", "T022 fake DB only exposes the keys store");
        return {
          get(key) {
            assert.equal(key, "vault", "T022 fake DB only exposes keys/vault");
            const request = { result: undefined, error: null, onsuccess: null, onerror: null };
            tx.operations.push(() => {
              if (mode === "readonly" && shared.initialReadBarrierSize > 0) {
                shared.initialReadWaiters.push({ tx, request });
                if (shared.initialReadWaiters.length === shared.initialReadBarrierSize) {
                  const waiters = shared.initialReadWaiters.splice(0);
                  shared.initialReadBarrierSize = 0;
                  const observed = shared.vaultKey;
                  for (const waiter of waiters) queueMicrotask(() => settleGet(waiter.tx, waiter.request, observed));
                }
                return;
              }
              settleGet(tx, request, shared.vaultKey);
            });
            schedulePump(tx);
            return request;
          },
          put(value, key) {
            assert.equal(key, "vault", "T022 fake DB only exposes keys/vault");
            const request = { result: undefined, error: null, onsuccess: null, onerror: null };
            tx.operations.push(() => {
              if (shared.failNextKeyPut) {
                shared.failNextKeyPut = false;
                const error = new Error("t022-fictional-key-put-failed");
                request.error = error;
                request.onerror?.();
                abortTransaction(tx, error);
                return;
              }
              shared.vaultKey = value;
              shared.keyPutCount += 1;
              request.result = key;
              request.onsuccess?.();
              tx.processing = false;
              schedulePump(tx);
            });
            schedulePump(tx);
            return request;
          },
        };
      },
      abort() {
        abortTransaction(tx, tx.error || new Error("t022-fictional-transaction-aborted"));
      },
    };

    if (mode === "readwrite") {
      let releaseWrite;
      const finished = new Promise((resolve) => { releaseWrite = resolve; });
      const previous = shared.writeTail;
      shared.writeTail = previous.then(() => finished, () => finished);
      previous.then(() => {
        tx.releaseWrite = releaseWrite;
        tx.active = true;
        schedulePump(tx);
      });
    }
    return tx;
  };

  const createConnection = () => ({
    objectStoreNames: { contains: (name) => shared.storeNames.has(name) },
    createObjectStore(name) { shared.storeNames.add(name); },
    transaction(storeNames, mode) {
      const names = Array.isArray(storeNames) ? storeNames : [storeNames];
      assert.deepEqual(names, ["keys"], "T022 fake DB must stay scoped to keys transactions");
      return createTransaction(mode);
    },
    close() {},
  });

  return {
    open(name, version) {
      assert.equal(name, "relationship-today-v1");
      assert.equal(version, 1);
      const request = { result: null, error: null, onsuccess: null, onerror: null, onupgradeneeded: null };
      queueMicrotask(() => {
        const needsUpgrade = !shared.opened;
        shared.opened = true;
        request.result = createConnection();
        if (needsUpgrade) request.onupgradeneeded?.();
        queueMicrotask(() => request.onsuccess?.());
      });
      return request;
    },
    inspect() { return { vaultKey: shared.vaultKey, keyPutCount: shared.keyPutCount }; },
  };
};

const t022CanDecrypt = async (envelope, key, expected) => {
  try {
    assert.deepEqual(await decryptEnvelope(envelope, key), expected);
    return true;
  } catch {
    return false;
  }
};

const t022SharedIndexedDb = createT022SharedFakeIndexedDb();
const [t022AdapterA, t022AdapterB] = await Promise.all([
  createIndexedDbVaultAdapter(t022SharedIndexedDb),
  createIndexedDbVaultAdapter(t022SharedIndexedDb),
]);
const [t022KeyA, t022KeyB] = await Promise.all([t022AdapterA.getOrCreateKey(), t022AdapterB.getOrCreateKey()]);
const t022PayloadA = { fixture: "t022-fictional-key-a" };
const t022PayloadB = { fixture: "t022-fictional-key-b" };
const [t022EnvelopeA, t022EnvelopeB] = await Promise.all([encryptEnvelope(t022PayloadA, t022KeyA), encryptEnvelope(t022PayloadB, t022KeyB)]);
const t022StoredAfterRace = t022SharedIndexedDb.inspect();
assert.deepEqual({
  keyPutCount: t022StoredAfterRace.keyPutCount,
  aWithB: await t022CanDecrypt(t022EnvelopeA, t022KeyB, t022PayloadA),
  bWithA: await t022CanDecrypt(t022EnvelopeB, t022KeyA, t022PayloadB),
  aWithStored: await t022CanDecrypt(t022EnvelopeA, t022StoredAfterRace.vaultKey, t022PayloadA),
  bWithStored: await t022CanDecrypt(t022EnvelopeB, t022StoredAfterRace.vaultKey, t022PayloadB),
}, {
  keyPutCount: 1,
  aWithB: true,
  bWithA: true,
  aWithStored: true,
  bWithStored: true,
}, "T022-O11 concurrent first misses must converge on one durable cross-decryptable key with exactly one put");

const t022ExistingAdapter = await createIndexedDbVaultAdapter(t022SharedIndexedDb);
const t022ExistingPutsBefore = t022SharedIndexedDb.inspect().keyPutCount;
const t022ExistingKey = await t022ExistingAdapter.getOrCreateKey();
assert.equal(t022SharedIndexedDb.inspect().keyPutCount, t022ExistingPutsBefore, "T022-O11 existing-key fast path must perform zero puts");
assert.equal(await t022CanDecrypt(t022EnvelopeA, t022ExistingKey, t022PayloadA), true, "T022-O11 later adapters must receive the same durable key");

const t022FailingIndexedDb = createT022SharedFakeIndexedDb({ initialReadBarrierSize: 1, failNextKeyPut: true });
const t022FailingAdapter = await createIndexedDbVaultAdapter(t022FailingIndexedDb);
await assert.rejects(() => t022FailingAdapter.getOrCreateKey(), /t022-fictional-key-put-failed/, "T022-O11 failed key transaction must reject instead of returning a candidate");
assert.deepEqual(t022FailingIndexedDb.inspect(), { vaultKey: null, keyPutCount: 0 }, "T022-O11 failed first-key transaction must persist nothing");

// T026 chat-first relationship suggestions. All text, identifiers, graphs and
// cache records below are code-local fiction; this block never opens a real
// vault/export/browser profile, calls MCP/network/model/send, or writes facts
// except through the explicit fictional mutation oracles.
const t026Now = "2026-08-19T03:00:00.000Z";
const t026Pure = analyzeLocalChatSemantics(t014StudyGraph, { personId: t014Person, now: t026Now });
const t026MixedGraph = structuredClone(t014StudyGraph);
t026MixedGraph.excerpts.push({
  id: "t026-fictional-legacy-missing",
  sourceId: t014Source,
  personId: t014Person,
  kind: "chat-text",
  timestamp: "2026-08-14T08:00:00.000Z",
  text: "T026_PRIVATE_LEGACY_BODY",
});
const t026Mixed = analyzeLocalChatSemantics(t026MixedGraph, { personId: t014Person, now: t026Now });
assert.deepEqual(t026Mixed.candidates, t026Pure.candidates, "T026-O01 a legacy-missing record must not poison the bounded valid non-sensitive subset");
assert.equal(t026Mixed.aggregate.eligibleMessageCount, t026Pure.aggregate.eligibleMessageCount, "T026-O01 eligible aggregate must be based only on the valid processed subset");
assert.equal(t026Mixed.aggregate.excludedCount, t026Pure.aggregate.excludedCount + 1, "T026-O01 mixed legacy must be counted only as excluded");

const t026SensitiveMixedGraph = structuredClone(t014StudyGraph);
t026SensitiveMixedGraph.excerpts.push({
  ...t014Direct("医疗 健康 客户 需求 报价 方案 服务 合作 项目 交付", 1, "t026-sensitive-mixed")[0],
  id: "t026-sensitive-mixed",
  timestamp: "2026-08-14T09:00:00.000Z",
});
const t026SensitiveMixed = analyzeLocalChatSemantics(t026SensitiveMixedGraph, { personId: t014Person, now: t026Now });
assert.deepEqual(t026SensitiveMixed.candidates, t026Pure.candidates, "T026-O02 a sensitive record must contribute zero support to every relationship category");
assert.deepEqual({ state: t026SensitiveMixed.state, safeAngle: t026SensitiveMixed.safeAngle, eligible: t026SensitiveMixed.aggregate.eligibleMessageCount, excluded: t026SensitiveMixed.aggregate.excludedCount }, { state: "generic", safeAngle: "通用问候", eligible: 6, excluded: 1 }, "T026-O02 mixed sensitive input must occupy budget, be excluded, and force generic safety only");
for (const forbidden of ["医疗", "健康", "需求", "报价", "sensitive", "score", "confidence", "matches", "text"]) assert.equal(JSON.stringify(t026SensitiveMixed).includes(forbidden), false, `T026-O11 semantic result leaked forbidden material ${forbidden}`);

const t026SensitiveOnlyGraph = structuredClone(t014StudyGraph);
t026SensitiveOnlyGraph.excerpts.forEach((excerpt) => { excerpt.text = "医疗 健康 客户 需求 报价 方案 服务 合作 项目 交付"; });
const t026SensitiveOnly = analyzeLocalChatSemantics(t026SensitiveOnlyGraph, { personId: t014Person, now: t026Now });
assert.deepEqual({ state: t026SensitiveOnly.state, code: t026SensitiveOnly.code, candidates: t026SensitiveOnly.candidates, eligible: t026SensitiveOnly.aggregate.eligibleMessageCount, excluded: t026SensitiveOnly.aggregate.excludedCount }, { state: "empty", code: "SEMANTIC_NO_ELIGIBLE_TEXT", candidates: [], eligible: 0, excluded: 6 }, "T026-O02 sensitive-only input must become manual-needed data with zero candidate support");
const t026SensitiveLegacyGraph = structuredClone(t026SensitiveOnlyGraph);
t026SensitiveLegacyGraph.excerpts.push({ id: "t026-sensitive-legacy-missing", sourceId: t014Source, personId: t014Person, kind: "chat-text", timestamp: "2026-08-15T07:00:00.000Z", text: "T026_PRIVATE_LEGACY_BODY" });
const t026SensitiveLegacy = analyzeLocalChatSemantics(t026SensitiveLegacyGraph, { personId: t014Person, now: t026Now });
assert.deepEqual({ state: t026SensitiveLegacy.state, code: t026SensitiveLegacy.code }, { state: "reimport-required", code: "SEMANTIC_INSUFFICIENT_PROVENANCE" }, "T026-O03 complete sensitive plus legacy-missing must classify as reimport-required");

let t026MessageBudgetOverflowReads = 0;
const t026MessageBudgetGraph = structuredClone(t014Graph);
const t026UnreadMessageOverflow = { ...t014Direct("", 1, "t026-message-overflow")[0], id: "t026-message-overflow", timestamp: "2026-08-10T08:00:00.000Z" };
Object.defineProperty(t026UnreadMessageOverflow, "text", { enumerable: true, get() { t026MessageBudgetOverflowReads += 1; throw new Error("T026_FORBIDDEN_MESSAGE_OVERFLOW_BODY_READ"); } });
t026MessageBudgetGraph.excerpts = [
  { ...t014Direct("医疗 健康 客户 需求 报价 方案 服务", 1, "t026-message-sensitive")[0], id: "t026-message-sensitive", timestamp: "2026-08-12T08:00:00.000Z" },
  { ...t014Direct("学习 课程 考试", 1, "t026-message-valid")[0], id: "t026-message-valid", timestamp: "2026-08-11T08:00:00.000Z" },
  t026UnreadMessageOverflow,
];
const t026MessageBounded = analyzeLocalChatSemantics(t026MessageBudgetGraph, { personId: t014Person, now: t026Now, maxMessages: 2 });
assert.deepEqual({ state: t026MessageBounded.state, eligible: t026MessageBounded.aggregate.eligibleMessageCount, excluded: t026MessageBounded.aggregate.excludedCount, overflowReads: t026MessageBudgetOverflowReads }, { state: "generic", eligible: 1, excluded: 2, overflowReads: 0 }, "T026-O02 sensitive records must consume a message slot without scanning beyond the bound");

let t026CharacterBudgetOverflowReads = 0;
const t026CharacterBudgetGraph = structuredClone(t014Graph);
const t026UnreadCharacterOverflow = { ...t014Direct("", 1, "t026-character-overflow")[0], id: "t026-character-overflow", timestamp: "2026-08-11T08:00:00.000Z" };
Object.defineProperty(t026UnreadCharacterOverflow, "text", { enumerable: true, get() { t026CharacterBudgetOverflowReads += 1; throw new Error("T026_FORBIDDEN_CHARACTER_OVERFLOW_BODY_READ"); } });
t026CharacterBudgetGraph.excerpts = [
  { ...t014Direct(`医疗${"甲".repeat(79_998)}`, 1, "t026-character-sensitive")[0], id: "t026-character-sensitive", timestamp: "2026-08-12T08:00:00.000Z" },
  t026UnreadCharacterOverflow,
];
const t026CharacterBounded = analyzeLocalChatSemantics(t026CharacterBudgetGraph, { personId: t014Person, now: t026Now });
assert.deepEqual({ state: t026CharacterBounded.state, eligible: t026CharacterBounded.aggregate.eligibleMessageCount, excluded: t026CharacterBounded.aggregate.excludedCount, overflowReads: t026CharacterBudgetOverflowReads }, { state: "empty", eligible: 0, excluded: 2, overflowReads: 0 }, "T026-O02 sensitive records must consume the character budget without scanning later bodies");

let t026OversizedSuffixReads = 0;
const t026OversizedFirstGraph = structuredClone(t014Graph);
const t026OversizedLater = { ...t014Direct("", 1, "t026-oversized-later")[0], id: "t026-oversized-later", timestamp: "2026-08-11T08:00:00.000Z" };
Object.defineProperty(t026OversizedLater, "text", { enumerable: true, get() { t026OversizedSuffixReads += 1; return "日常 生活 近况 T026_FORBIDDEN_LATER_BODY"; } });
t026OversizedFirstGraph.excerpts = [
  { ...t014Direct(`${" ".repeat(80_000)}学习 课程 考试 T026_FORBIDDEN_OVERSIZED_SUFFIX`, 1, "t026-oversized-first")[0], id: "t026-oversized-first", timestamp: "2026-08-12T08:00:00.000Z" },
  t026OversizedLater,
];
const t026OversizedFirst = analyzeLocalChatSemantics(t026OversizedFirstGraph, { personId: t014Person, now: t026Now });
assert.deepEqual({ state: t026OversizedFirst.state, code: t026OversizedFirst.code, eligible: t026OversizedFirst.aggregate.eligibleMessageCount, excluded: t026OversizedFirst.aggregate.excludedCount, laterReads: t026OversizedSuffixReads }, { state: "empty", code: "SEMANTIC_NO_ELIGIBLE_TEXT", eligible: 0, excluded: 2, laterReads: 0 }, "T026-O02 an oversized first record must be sliced before normalization/matching, consume the remaining budget, and hide its suffix and every later body");

let t026IdentityForbiddenReads = 0;
const t026IdentityGraph = structuredClone(t014Graph);
t026IdentityGraph.people[0].state = "pending";
Object.defineProperty(t026IdentityGraph.excerpts[0], "text", { enumerable: true, get() { t026IdentityForbiddenReads += 1; throw new Error("T026_FORBIDDEN_IDENTITY_BODY_READ"); } });
const t026IdentityResult = createLocalSemanticBatchSnapshot(t026IdentityGraph, { now: t026Now }).analyze(t014Person);
assert.deepEqual({ state: t026IdentityResult.state, code: t026IdentityResult.code, reads: t026IdentityForbiddenReads }, { state: "unconfirmed", code: "SEMANTIC_IDENTITY_UNCONFIRMED", reads: 0 }, "T026-O03 identity-ineligible must classify before any body read or match");
const t026GroupOnlyGraph = structuredClone(t014Graph);
t026GroupOnlyGraph.excerpts.forEach((excerpt) => { excerpt.conversationKind = "group"; });
const t026GroupOnly = analyzeLocalChatSemantics(t026GroupOnlyGraph, { personId: t014Person, now: t026Now });
assert.deepEqual({ state: t026GroupOnly.state, code: t026GroupOnly.code }, { state: "empty", code: "SEMANTIC_NO_ELIGIBLE_TEXT" }, "T026-O03 group-only must be honest manual-needed data, not reimport or a guessed label");

const t026BadgeOnlyGraph = structuredClone(t014StudyGraph);
t026BadgeOnlyGraph.mappings[0].accountAttributionOverride = { kind: "private-wechat", decisionId: "t026-fictional-attribution", updatedAt: t026Now };
assert.deepEqual(createLocalSemanticBatchSnapshot(t026BadgeOnlyGraph, { now: t026Now }).analyze(t014Person).candidates, t026Pure.candidates, "T026-O10 account attribution must not change relationship candidates");
assert.equal(createLocalSemanticBatchSnapshot(t026BadgeOnlyGraph, { now: t026Now }).analyzeForCache(t014Person).inputRevision, createLocalSemanticBatchSnapshot(t014StudyGraph, { now: t026Now }).analyzeForCache(t014Person).inputRevision, "T026-O10 presentation-only attribution must not enter the semantic input namespace");
const t026NicknameGraph = structuredClone(t014StudyGraph);
t026NicknameGraph.people[0].name = "纯虚构改名不作为证据";
assert.deepEqual(analyzeLocalChatSemantics(t026NicknameGraph, { personId: t014Person, now: t026Now }).candidates, t026Pure.candidates, "T026-O10 nickname changes must not change relationship candidates");

assert.equal(t017Payload.algorithmVersion, "local-semantic-v2", "T026-O04 cache plaintext must use exact local-semantic-v2 while retaining schemaVersion 1");
assert.equal(productionSource.includes("analysis-cache-person-input/v2\\0"), true, "T026-O04 person input digest must use the exact v2 namespace");
assert.equal(productionSource.includes("analysis-cache-person-input/v1\\0"), false, "T026-O04 current semantic input code must not continue writing the v1 namespace");
const t026V1CacheRecord = await t017EncryptPayload({ ...t017Payload, algorithmVersion: "local-semantic-v1" });
assert.equal((await loadActiveGraphWithSemanticCache(t017RecordAdapter(t017State, t026V1CacheRecord), t017Key)).semanticCache.reason, "algorithm-upgrade-full", "T026-O04 a valid-shaped v1 cache must request exactly one full algorithm upgrade and never hydrate partially");
assert.equal(t017Loaded.semanticCache.baseResults.get(t017PersonA).algorithmVersion, "local-semantic-v2", "T026-O04 the committed v2 cache must hydrate current v2 immutable results");
assert.doesNotMatch(loadActiveGraphWithSemanticCache.toString(), /analyzeLocalChatSemantics|createLocalSemanticBatchSnapshot|semanticMatches|\.text\b/, "T026-O04 cache-hit loader must not contain an analyzer, snapshot, term matcher or body-read path");

const t026V1FactGraph = structuredClone(t014StudyGraph);
t026V1FactGraph.relationships.push({
  id: "t026-v1-accepted-fact",
  relationshipId: "t026-v1-accepted-fact",
  personId: t014Person,
  label: "老同学",
  status: "current",
  source: "local-evaluation-confirmed",
  sourceIds: [],
  createdAt: "2026-08-18T03:00:00.000Z",
  updatedAt: "2026-08-18T03:00:00.000Z",
  decisionId: "t026-v1-accepted-decision",
  confirmation: "accepted-semantic-suggestion",
  algorithmVersion: "local-semantic-v1",
  eligibleMessageCount: 6,
  startDate: "2026-08-10",
  endDate: "2026-08-12",
});
assert.equal(upgradeRelationshipGraphV2(t026V1FactGraph).relationships[0].algorithmVersion, "local-semantic-v1", "T026-O04 strict graph validation must preserve an existing accepted v1 fact without migration");
const t026V1Backup = await createBackup(t026V1FactGraph, "fictional t026 v1 compatibility phrase", { now: t026Now });
const t026V1Adapter = createMemoryVaultAdapter();
const t026V1Key = await generateVaultKey();
await commitGraph(t026V1Adapter, t014StudyGraph, t026V1Key, { now: t026Now });
await restoreBackup(t026V1Adapter, t026V1Key, t026V1Backup, "fictional t026 v1 compatibility phrase", { now: "2026-08-19T03:01:00.000Z" });
assert.equal((await loadActiveGraph(t026V1Adapter, t026V1Key)).relationships[0].algorithmVersion, "local-semantic-v1", "T026-O04 backup/restore/reopen must preserve the existing accepted v1 fact byte-semantically");
assert.equal(t014PersistedFact.algorithmVersion, "local-semantic-v2", "T026-O04 a new explicit semantic accept must write exact local-semantic-v2");

const t026ProjectionGraph = structuredClone(t014StudyGraph);
t026ProjectionGraph.relationships.push({ id: "t026-current-friend", relationshipId: "t026-current-friend", personId: t014Person, label: "朋友", status: "current", source: "manual-confirmed", sourceIds: [], createdAt: t026Now, updatedAt: t026Now, decisionId: "t026-current-friend-decision" });
const t026ProjectionBefore = structuredClone(t026ProjectionGraph);
const t026ProjectionResult = createLocalSemanticBatchSnapshot(t026ProjectionGraph, { now: t026Now }).analyze(t014Person);
const t026Generation = "t026-fictional-generation";
const t026SuggestionIndex = projectRelationshipSuggestionIndex(t026ProjectionGraph, { semanticResults: new Map([[t014Person, t026ProjectionResult]]), batchState: "ready", expectedActiveGenerationId: t026Generation, currentActiveGenerationId: t026Generation });
assert.deepEqual(Object.keys(t026SuggestionIndex).sort(), ["byPerson", "crossSourceReview", "formalWriteCount", "relationshipLibrary", "sourceIdentityReview"].sort(), "T026-O05 indexed seam must return the exact batch projection root");
assert.equal(t026SuggestionIndex.formalWriteCount, 0, "T026-O08 automatic projection must write zero facts");
assert.deepEqual(t026ProjectionGraph, t026ProjectionBefore, "T026-O08 automatic analysis/projection must leave the graph deep-equal");
assert.equal(t026SuggestionIndex.byPerson instanceof Map && Object.isFrozen(t026SuggestionIndex.byPerson), true, "T026-O05 byPerson must be a readonly Map");
assert.throws(() => t026SuggestionIndex.byPerson.set("forbidden", {}), (error) => error?.code === "ANALYSIS_CACHE_SCHEMA_INVALID", "T026-O06 readonly lookup Map must fail closed on set");
assert.throws(() => t026SuggestionIndex.byPerson.delete(t014Person), (error) => error?.code === "ANALYSIS_CACHE_SCHEMA_INVALID", "T026-O06 readonly lookup Map must fail closed on delete");
assert.deepEqual(t026SuggestionIndex.byPerson.get(t014Person), { state: "suggested", currentLabels: ["朋友"], suggestedLabels: ["老同学"], acceptAllowed: true, manualAddAllowed: true }, "T026-O05/O07 confirmed current authority must separate persisted facts from current nonempty suggestions");

const t026ManualResult = Object.freeze({ ...structuredClone(t026ProjectionResult), candidates: [] });
assert.deepEqual(projectRelationshipSuggestionIndex(t026ProjectionGraph, { semanticResults: new Map([[t014Person, t026ManualResult]]), expectedActiveGenerationId: t026Generation, currentActiveGenerationId: t026Generation }).byPerson.get(t014Person), { state: "manual-needed", currentLabels: ["朋友"], suggestedLabels: [], acceptAllowed: false, manualAddAllowed: true }, "T026-O07 zero current suggestions must be manual-needed with only manual authority");
const t026ReimportResult = Object.freeze({ ...structuredClone(t026ProjectionResult), state: "reimport-required", code: "SEMANTIC_INSUFFICIENT_PROVENANCE", candidates: [], safeAngle: null, draft: "", aggregate: { eligibleMessageCount: 0, startDate: null, endDate: null, excludedCount: 1 }, decisionBaseId: null });
assert.deepEqual(projectRelationshipSuggestionIndex(t026ProjectionGraph, { semanticResults: new Map([[t014Person, t026ReimportResult]]), expectedActiveGenerationId: t026Generation, currentActiveGenerationId: t026Generation }).byPerson.get(t014Person), { state: "reimport-required", currentLabels: ["朋友"], suggestedLabels: [], acceptAllowed: false, manualAddAllowed: true }, "T026-O07 reimport-required may retain manual authority but can never enable accept");
assert.deepEqual(projectRelationshipSuggestionIndex(t026ProjectionGraph, { semanticResults: null, batchState: "running", expectedActiveGenerationId: t026Generation, currentActiveGenerationId: t026Generation }).byPerson.get(t014Person), { state: "loading", currentLabels: ["朋友"], suggestedLabels: [], acceptAllowed: false, manualAddAllowed: false }, "T026-O07 loading must disable both permissions");
assert.deepEqual(projectRelationshipSuggestionIndex(t026ProjectionGraph, { semanticResults: new Map([[t014Person, t026ProjectionResult]]), expectedActiveGenerationId: t026Generation, currentActiveGenerationId: "t026-stale-generation" }).byPerson.get(t014Person), { state: "stale", currentLabels: ["朋友"], suggestedLabels: [], acceptAllowed: false, manualAddAllowed: false }, "T026-O07 generation mismatch must hide stale suggestions and disable both permissions");

const t026PendingIndex = projectRelationshipSuggestionIndex(t018Graph, { semanticResults: new Map([[t018Person, t018SemanticResult]]), expectedActiveGenerationId: t018Generation, currentActiveGenerationId: t018Generation });
assert.deepEqual(t026PendingIndex.byPerson.get(t018Person), { state: "suggested", currentLabels: [], suggestedLabels: t018SemanticResult.candidates.map((candidate) => candidate.label), acceptAllowed: true, manualAddAllowed: true }, "T026-O07 T018 exact direct pending authority may accept the current base candidate atomically");
const t026ReviewIndex = projectRelationshipSuggestionIndex(t016Graph, { semanticResults: null, expectedActiveGenerationId: t026Generation, currentActiveGenerationId: t026Generation });
const t026ReviewPerson = t026ReviewIndex.sourceIdentityReview.pairs.find((pair) => pair.status === "pending").left.personId;
assert.deepEqual(t026ReviewIndex.byPerson.get(t026ReviewPerson), { state: "identity-review", currentLabels: [], suggestedLabels: [], acceptAllowed: false, manualAddAllowed: false }, "T026-O07 T020 pending cross-source identity must remain review-only regardless of suggestions");
const t026ConfirmedAmbiguousGraph = structuredClone(t016Graph);
t026ConfirmedAmbiguousGraph.people.find((person) => person.id === "t016-person-ambiguous-a").state = "active";
t026ConfirmedAmbiguousGraph.mappings.find((mapping) => mapping.id === "t016-map-ambiguous-a").status = "confirmed";
const t026ConfirmedAmbiguousIndex = projectRelationshipSuggestionIndex(t026ConfirmedAmbiguousGraph, { semanticResults: null, expectedActiveGenerationId: t026Generation, currentActiveGenerationId: t026Generation });
assert.deepEqual(t026ConfirmedAmbiguousIndex.byPerson.get("t016-person-ambiguous-a"), { state: "identity-review", currentLabels: [], suggestedLabels: [], acceptAllowed: false, manualAddAllowed: false }, "T026-O07 a confirmed identity inside a T020 ambiguous group must remain review-only and cannot regain manual authority");

const t026ProjectorSource = projectRelationshipSuggestionIndex.toString();
for (const projector of ["projectRelationshipLibrary", "projectSourceIdentityReview", "projectCrossSourceReview"]) assert.equal((t026ProjectorSource.match(new RegExp(`\\b${projector}\\s*\\(`, "g")) || []).length, 1, `T026-O05 ${projector} must be invoked exactly once by the indexed seam`);
assert.doesNotMatch(t026ProjectorSource, /projectRelationshipAuthority\s*\(|analyzeLocalChatSemantics|createLocalSemanticBatchSnapshot|mutateRelationshipFacts|mutateSingleSourceRelationship|\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\b/, "T026-O06/O08/O10 row lookup seam must contain no per-person projector, analyzer, fact mutation, contact or network path");
assert.deepEqual(t026SuggestionIndex.byPerson.get(t014Person), t026SuggestionIndex.byPerson.get(t014Person), "T026-O06 repeated People/Today/modal/library lookups must reuse the same immutable descriptor");

console.log("[PASS] T002 local vault contract");
console.log("- production seams executed with code-only fictional fixtures");
console.log("[PASS] T003 local analysis contract");
console.log("- deterministic read-only 3/12 candidates, exclusions, boundaries, and 100k bounded case verified");
console.log("- AES-GCM/PBKDF2, generation transactions, deletion and restore fail-closed oracles passed");
console.log("[PASS] T013 real relationship contract");
console.log("- schema2 migration, metadata-only candidates, 0/1 writes, backup and lifecycle verified");
console.log("[PASS] T014 local chat semantic contract");
console.log("- explicit direct-only body semantics, bounds, minimization and Today accuracy verified with fictional data");
console.log("[PASS] T015 whole-library semantic contract");
console.log("- one-pass full classification, pending source scope, exact affected sets, fail-safe fallback and zero-write privacy verified with fictional data");
console.log("[PASS] T016 cross-source identity data contract");
console.log("- safe badges, exact pairs, explicit 0/1 mutations, minimal lineage, undo and lifecycle verified with fictional data");
console.log("[PASS] T017 encrypted persisted semantic cache data contract");
console.log("- AES-GCM/AAD, strict schema, immutable hit, affected reuse, true CAS, business prune and lifecycle verified with fictional data");
console.log("[PASS] T019 source badge and exact-lineage data contract");
console.log("- legacy/unknown source truth, official account labels, direct manual authority, Today projection, and pair gates verified with fictional data");
console.log("[PASS] T020 cross-source review-only data contract");
console.log("- canonical safe pair/ambiguous groups, resolved history/undo, single exclusion, zero-write projection, and atomic first relationship verified with fictional data");
console.log("[PASS] T021 stable Suiyin provenance and account-label data contract");
console.log("- safe inventory, closed child staging, conflict authority, label/cache CAS, fail-closed backup, lifecycle and lossless same-source repair verified with fictional data");
console.log("[PASS] T022 atomic first-key IndexedDB contract");
console.log("- two adapters, one durable key, cross-decrypt, existing 0-put and failed-write rejection verified with a fictional shared database");
console.log("[PASS] T025 user-confirmed mapping attribution data contract");
console.log("- pending/exact/private/persona projection, safe options, exact one-mapping 0/1 mutations, reopen/backup/lifecycle/lineage and zero semantic authority verified with fictional data");
console.log("[PASS] T026 chat-first relationship suggestion data contract");
console.log("- local-semantic-v2 per-record filtering, sensitive support zero, cache upgrade, readonly indexed authority and explicit-only fact writes verified with fictional data");
console.log("[PASS] T027 collection-location data contract");
console.log("- actual live lineage, official labels, safe fallback, multi-source dedupe, lifecycle, attribution independence and zero-write projection verified with fictional data");
