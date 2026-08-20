#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "prototype", "index.html");
const failures = [];

function section(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start < 0) return "";
  const end = source.indexOf(endMarker, start + startMarker.length);
  return source.slice(start, end < 0 ? source.length : end);
}

if (!fs.existsSync(file)) {
  failures.push("missing prototype/index.html");
} else {
  const html = fs.readFileSync(file, "utf8");
  const executableHtml = html
    .replace(/^[\t ]*\/\/[^\r\n]*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  for (const landmark of ["<nav", "<main", "<aside"]) {
    if (!html.includes(landmark)) failures.push(`missing landmark ${landmark}`);
  }
  if (!/:focus-visible/.test(html)) failures.push("missing :focus-visible styles");
  if (!/role=["']dialog["']/.test(html)) failures.push("missing accessible dialog role");
  if (!/aria-modal=["']true["']/.test(html)) failures.push("dialog missing aria-modal=true");
  if (!/aria-live=["']polite["']/.test(html)) failures.push("missing polite live region");
  if (/\sonclick\s*=/.test(html)) failures.push("inline onclick handlers are not allowed");

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) failures.push(`duplicate id: ${id}`);
    seen.add(id);
  }

  const buttons = html.match(/<button\b[^>]*>/gi) ?? [];
  for (const button of buttons) {
    if (!/\stype=["']button["']/.test(button)) failures.push(`button missing type=button: ${button.slice(0, 90)}`);
  }
  if (buttons.length < 10) failures.push(`expected interactive controls, found only ${buttons.length} buttons`);

  for (const page of ["missed", "history"]) {
    if (!html.includes(`data-page="${page}"`)) failures.push(`missing second-version navigation: ${page}`);
  }
  for (const control of ["relationshipDialog", "relationshipLabel", "relationshipEffectiveFrom", "relationshipPrimary"]) {
    if (!html.includes(`id="${control}"`)) failures.push(`missing relationship editor control: ${control}`);
  }
  if (!/aria-describedby=["']relationshipEditorHelp["']/.test(html)) failures.push("relationship editor missing explicit help association");
  for (const control of ["relationshipCustomOptions", "relationshipCustomHelp", "relationshipFailNext"]) {
    if (!html.includes(`id="${control}"`)) failures.push(`missing T007 relationship dictionary control: ${control}`);
  }
  for (const action of ["history-fixture", "history-step", "select-history", "dictionary-status"]) {
    if (!html.includes(`data-action="${action}"`)) failures.push(`missing T007 action: ${action}`);
  }
  for (const selector of [".history-months", ".history-days", ".dictionary-list", ".dictionary-label"]) {
    if (!html.includes(selector)) failures.push(`missing T007 overflow/structure style: ${selector}`);
  }
  if (!/\.relationship-dialog \.dialog-body\s*\{[^}]*overflow:\s*auto/.test(html)) failures.push("relationship dictionary dialog is not overflow-safe");
  if (!/class="history-picker"/.test(html) || !/aria-current=/.test(html)) failures.push("history picker lacks keyboard/current-date semantics");
  for (const action of ["moment-identity", "moment-classify", "moment-source-revoke", "moment-source-delete"]) {
    if (!html.includes(`data-action="${action}"`)) failures.push(`missing T008 action: ${action}`);
  }
  for (const selector of [".moments-boundary", ".moments-layout", ".moment-stack", ".moment-body", ".prepared-topic"]) {
    if (!html.includes(selector)) failures.push(`missing T008 overflow/structure style: ${selector}`);
  }
  for (const helper of ["deriveMomentSignals", "assignMomentIdentity", "classifyMomentSignal", "buildMomentInsights", "eligiblePreparedTopics", "invalidateMomentSource", "renderMomentSource", "renderMomentSignal", "renderPreparedMomentTopic"]) {
    if (!html.includes(`function ${helper}(`)) failures.push(`missing T008 production helper: ${helper}`);
  }
  if (!/\.moment-body\s*\{[^}]*overflow-wrap:\s*anywhere[^}]*overflow:\s*auto/.test(html)) failures.push("moment content is not overflow-safe");
  if (!/尚未选择真实目录/.test(html) || !/下方内容仍是虚构演示/.test(html)) failures.push("T002 truthful local-source boundary is not prominent");
  if (!/type="module"/.test(html) || !/from "\.\/local-vault\.js(?:\?v=[A-Za-z0-9._-]+)?"/.test(html)) failures.push("missing T002 local vault module wiring");
  if (!/data-action="choose-local-export"/.test(html) || !/showDirectoryPicker\(\{ mode: "read" \}\)/.test(html)) failures.push("directory picker is not user-triggered read-only wiring");
  if (/Compatibility anchor/.test(html)) failures.push("comment-only compatibility anchor can fake a production wiring gate");
  if (!/parseWechatExportToolkit\(root,\s*\{\s*sourceBundleRevision:\s*SOURCE_BUNDLE_REVISION,\s*selectedAt\s*\}\)/.test(executableHtml)) failures.push("page bypasses canonical production parser with selected receipt time");
  if (!/data-action="confirm-local-import"/.test(html) || !/commitGraph\(localVaultStatus\.adapter,\s*graph,\s*localVaultStatus\.key,\s*\{\s*expectedActiveGenerationId,\s*now:\s*committedAt\s*\}\)/.test(executableHtml)) failures.push("preview is not wired to exact-generation encrypted import with one committed time");
  if (/\b(?:root|handle)\.(?:entries|values|keys)\s*\(/.test(html)) failures.push("directory enumeration found");
  if (/\beval\s*\(|\bFunction\s*\(/.test(html)) failures.push("JavaScript execution parser found");
  if (/localStorage|sessionStorage|caches\.|serviceWorker/.test(html)) failures.push("unapproved browser persistence found");
  if (/本原型没有持久化|永久删除不提供/.test(html)) failures.push("conflicting local-vault lifecycle copy found");
  if (!/t002-test/.test(html) || !/fictional/.test(html) || !/location\.hostname/.test(html) || !/__RELATION_T002_TEST__/.test(html)) failures.push("missing localhost-only fictional Chrome seam");

  const t012Sections = [
    ["shell", section(html, '<div class="app-shell">', '<script type="module">'), /fixtureSelect|fixtureHelp|reset-demo|状态实验室|重置演示/],
    ["Today", section(html, "function renderToday()", "function renderLocalAnalysis()"), /demoPeople|missedItems|虚构演示|离线演示|操作不可用演示/],
    ["Missed", section(html, "function renderMissed()", "function historyState"), /missedItems|模拟跨日|missed-prepare|missed-today|missed-snooze|missed-ignore/],
    ["History", section(html, "function renderHistory()", "function personRelationships"), /historyFixtures|history-fixture|演示日期/],
    ["People", section(html, "function renderPeople()", "function renderRelationshipWorkbench"), /demoPeople|demoRows|usingDemo|虚构演示/],
    ["Identities", section(html, "function renderIdentities()", "function renderIdentityCard"), /demoPairs|renderIdentityCard|identityPairs/],
    ["Cold storage", section(html, "function renderColdStorage()", "function renderSources()"), /coldStorage|simulate-due-review|模拟一人到期/],
    ["Sources", section(html, "function renderSources()", "function render()"), /filteredSources|原型分流示例|以下名称全部虚构/],
    ["root render", section(html, "function render()", "function navigate(page)"), /fixtureSelect|state\.fixture|demoPeople\.length|missedItems|identityPairs|coldStorage\.length/]
  ];
  for (const [label, source, forbidden] of t012Sections) {
    if (!source) failures.push(`T012 missing ${label} runtime section`);
    else if (forbidden.test(source)) failures.push(`T012 ${label} contains a normal-runtime fixture activator or fallback`);
  }
  for (const id of ["todayNavCount", "missedNavCount", "peopleNavCount", "identityNavCount", "coldNavCount"]) {
    if (!new RegExp(`<span[^>]+id=["']${id}["'][^>]*>0<\\/span>`).test(html)) failures.push(`T012 ${id} must start at truthful zero`);
  }
  if (!/id="currentLocalDate"/.test(html) || !/Intl\.DateTimeFormat\("zh-CN"/.test(html)) failures.push("T012 shell date is not sourced from the local clock");
  if (/new URLSearchParams\(location\.search\)[\s\S]{0,220}t002-test/.test(html) || /window\.__RELATION_T002_TEST__\?\./.test(html)) failures.push("T012 runtime query/window fixture activator remains executable");
  if (!/function buildRealRuntimeModel\(/.test(html) || !/function renderHonestEmptyRoute\(/.test(html)) failures.push("T012 executable real-only runtime seams are missing");
}

if (failures.length > 0) {
  console.error(`[FAIL] prototype lint (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[PASS] prototype lint");
console.log("- landmarks, dialogs, local-vault wiring, button types, unique IDs, and focus styles present");
