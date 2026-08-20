#!/usr/bin/env node

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "prototype", "index.html");
const serverPath = path.join(root, "scripts", "start-local-preview.mjs");
const selfPath = fileURLToPath(import.meta.url);
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function section(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start < 0) return "";
  const end = source.indexOf(endMarker, start + startMarker.length);
  return source.slice(start, end < 0 ? source.length : end);
}

function request(server, target, method = "GET") {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const req = http.request({
      host: "127.0.0.1",
      port: address.port,
      method,
      path: target,
      headers: { Host: "127.0.0.1:8765" }
    }, response => {
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => resolve({
        status: response.statusCode,
        headers: response.headers,
        body: Buffer.concat(chunks)
      }));
    });
    req.on("error", reject);
    req.end();
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
}

function close(server) {
  return new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

const html = fs.readFileSync(indexPath, "utf8");
const picker = section(html, "function normalizeLocalPickerError(error)", "const demoPeople = [");
const shellSource = section(html, '<div class="app-shell">', "<script type=\"module\">");
const personFlowMarkup = section(html, '<div class="dialog-backdrop" id="personFlowBackdrop"', '<div class="toast-region"');
const todayRender = section(html, "function renderToday()", "function renderLocalAnalysis()");
const todayAnalysis = section(html, "function renderLocalAnalysis", "function renderMissed");
const t026TodayCandidateCardSource = section(html, "function localAnalysisCandidateCard", "function renderLocalAnalysisQueue");
const missedRender = section(html, "function renderMissed()", "function historyState");
const historyRender = section(html, "function renderHistory()", "function personRelationships");
const peopleRender = section(html, "function renderPeople()", "function renderRelationshipWorkbench");
const identitiesRender = section(html, "function renderIdentities()", "function renderColdStorage()");
const identityModelSource = section(html, "function buildIdentityViewModel", "function renderIdentities()");
const coldStorageRender = section(html, "function renderColdStorage()", "function renderSources()");
const sourcesRender = section(html, "function renderSources()", "function render()");
const rootRender = section(html, "function render()", "function navigate(page)");
const runtimeModelSource = section(html, "function buildRealRuntimeModel", "function formatRuntimeCount");
const honestRouteSource = section(html, "function renderHonestEmptyRoute", "function escapeHtml");
const realRelationshipPanelSource = section(html, "function renderRealRelationshipPanel", "function renderPeople");
const realRelationshipMutationSource = section(html, "async function applyRealRelationshipMutation", "const backupPhrase");
const localVaultOpenSource = section(html, "async function openLocalVault", "async function confirmLocalImport");
const localSemanticCacheHitSource = section(html, "function installLocalSemanticCacheHit", "function resetLocalAnalysis");
const localSemanticSchedulerSource = section(html, "function scheduleLocalSemanticRefresh", "async function runLocalSemanticBatch");
const localSemanticBatchRunnerSource = section(html, "async function runLocalSemanticBatch", "async function runLocalSemanticAnalysis");
const localSemanticRunnerSource = section(html, "async function runLocalSemanticAnalysis", "async function applyRealRelationshipMutation");
const localSemanticBatchStatusSource = section(html, "function renderLocalSemanticBatchStatus", "function renderLocalSemanticPanel");
const localSemanticPanelSource = section(html, "function renderLocalSemanticPanel", "function renderPeople");
const relationshipModalContentSource = section(html, "function renderRelationshipModalContent", "function renderSourceBadges");
const sourceBadgeSource = section(html, "function renderSourceBadges", "function renderSourceBadgeHelp");
const identityPairCardSource = section(html, "function renderIdentityCard", "function renderColdStorage");
const personFlowModalSource = section(html, "function renderPersonFlowDialog", "function syncPersonFlowDialog");
const personFlowSyncSource = section(html, "function syncPersonFlowDialog", "function openPersonFlow");
const personFlowOpenSource = section(html, "function openPersonFlow", "function closePersonFlow");
const personFlowCloseSource = section(html, "function closePersonFlow", "async function commitPersonIdentity");
const personFlowCommitSource = section(html, "async function commitPersonIdentity", "function renderPeople");
const suiyinImportPreviewSource = section(html, "async function previewSuiyinImport", "async function cancelSuiyinImport");
const suiyinImportConfirmSource = section(html, "async function confirmSuiyinImport", "async function commitLocalMutation");
const suiyinAccountLabelSaveSource = section(html, "async function saveSuiyinAccountLabel", "function openSuiyinAccountLabelDialog");
const vaultStartupSource = section(html, "const VAULT_STARTUP_DEADLINE_MS", "async function confirmLocalImport");
const vaultTransitionRouteSource = section(html, "function renderVaultTransitionRoute", "function renderHonestEmptyRoute");
const sourceControlStateSource = section(html, "function buildSourceControlState", "function renderVaultTransitionRoute");
const localImportConfirmSource = section(html, "async function confirmLocalImport", "const suiyinErrorCopy");
const localExportPickerSource = section(html, "async function chooseLocalExport", "const confirmedLocalCandidate");
const bootstrapSource = section(html, "function bootstrapLocalVault", "async function confirmLocalImport");
const relationshipStatusSource = section(html, "function currentRelationshipAuthority", "const manualActionId");
const t023ProjectionViewModelSource = section(html, "let localProjectionViewModelCache", "function currentProjectedSourceBadges");
const t023ReviewGroupResolverSource = section(html, "function resolveCurrentReviewGroup", "function buildRealRuntimeModel");
const t023WindowMathSource = section(html, "function computePeopleWindow", "function renderPeopleTableRow");
const t023TableRowSource = section(html, "function renderPeopleTableRow", "function renderPeopleWindowRows");
const t023WindowRowsSource = section(html, "function renderPeopleWindowRows", "function refreshPeopleWindow");
const t023WindowUiSource = section(html, "function refreshPeopleWindow", "function createPeopleSearchDebouncer");
const t023SearchDebouncerSource = section(html, "function createPeopleSearchDebouncer", "function applyPeopleSearch");
const t023SearchUiSource = section(html, "function applyPeopleSearch", "function renderPeople");
const t023ProgressPainterSource = section(html, "function createLocalSemanticProgressPainter", "function updateLocalSemanticProgressSurface");
const t023ProgressUiSource = section(html, "function updateLocalSemanticProgressSurface", "function renderLocalSemanticBatchStatus");
const t025AttributionProjectionSource = section(html, "function currentMappingAccountAttribution", "function renderAccountAttributionAction");
const t025AttributionActionSource = section(html, "function renderAccountAttributionAction", "function renderAccountAttributionReviewStatus");
const t025AttributionReviewSource = section(html, "function renderAccountAttributionReviewStatus", "function openMappingAccountAttributionDialog");
const t025AttributionEditorSource = section(html, "function openMappingAccountAttributionDialog", "async function commitMappingAccountAttribution");
const t025AttributionCommitSource = section(html, "async function commitMappingAccountAttribution", "function resolveCurrentReviewGroup");
const t026SuggestionLookupSource = section(html, "function currentRelationshipSuggestion", "function relationshipSuggestionCopy");
const t026SuggestionCopySource = section(html, "function relationshipSuggestionCopy", "function renderRelationshipSuggestionSummary");
const t026FactsRenderSource = section(html, "function renderRelationshipFactsSummary", "function renderRelationshipSuggestionSummary");
const t026SuggestionRenderSource = section(html, "function renderRelationshipSuggestionSummary", "function renderRelationshipModalContent");
const t026SelectionHandlersSource = section(html, '} else if (action === "local-semantic-cancel")', '} else if (action === "local-semantic-copy")');
const t026AcceptHandlerSource = section(html, '} else if (action === "local-semantic-accept")', '} else if (action === "local-semantic-edit-accept")');
const t026EditAcceptHandlerSource = section(html, '} else if (action === "local-semantic-edit-accept")', '} else if (action === "real-relationship-save")');
const t026ManualSaveHandlerSource = section(html, '} else if (action === "real-relationship-save")', '} else if (action === "real-relationship-edit")');
const t026LibraryTodayHandlerSource = section(html, '} else if (action === "local-library-open-today")', '} else if (action === "local-semantic-analyze")');
const t026TodayActionHandlersSource = section(html, '} else if (action === "local-analysis-select")', '} else if (action === "choose-local-export")');
const peopleInputHandlersSource = section(html, 'pageHost.addEventListener("input"', 'pageHost.addEventListener("change"');
const peopleChangeHandlersSource = section(html, 'pageHost.addEventListener("change"', 'document.addEventListener("click"');
const t027CollectionLocationRenderSource = section(html, "function renderCollectionLocations", "function renderPeopleTableRow");
const t027CollectionLocationSelectionSource = section(html, "function reconcilePeopleCollectionLocationSelection", "function filterPeopleRows");
const t027CollectionLocationFilterSource = section(html, "function filterPeopleRows", "function installPeopleWindow");
const t027CollectionLocationApplySource = section(html, "function applyPeopleCollectionLocationFilter", "function schedulePeopleSearch");
const t028SuiyinScopeUiSource = section(html, "function buildSuiyinScopeViewModel", "function renderSources()");
const t030UnifiedSourceCoverageUiSource = section(html, "function renderUnifiedSourceCoverageReceipt", "function renderSources()");
const t031QueryOptionsSource = section(html, "function buildRealMomentFeedQueryOptions", "function renderRealMomentFeedPage");
const t031FeedRendererSource = section(html, "function renderRealMomentFeedPage", "function createRealMomentSearchDebouncer");
const t031SearchDebouncerSource = section(html, "function createRealMomentSearchDebouncer", "function applyRealMomentSearch");
const t031SearchApplySource = section(html, "function applyRealMomentSearch", "function renderRealMomentFeedOnly");
const t031FeedOnlyRenderSource = section(html, "function renderRealMomentFeedOnly", "function renderSources()");
const t031SourceFilterHandlerSource = section(html, 'if (event.target.matches?.("[data-real-moment-source-token]"))', 'if (event.target.id !== "localBackupFile")');
const t031PageHandlerSource = section(html, '} else if (action === "real-moment-page")', '} else if (action === "real-moment-classify")')
  || section(html, '} else if (action === "real-signal-page")', '} else if (action === "real-signal-classify")');
const t031ClassificationHandlerSource = section(html, '} else if (action === "real-moment-classify")', '} else if (action === "local-source-remove")')
  || section(html, '} else if (action === "real-signal-classify")', '} else if (action === "local-source-remove")');
const confirmLocalRestoreSource = section(html, "async function confirmLocalRestore", "function normalizeLocalPickerError");
let executableProjectionEvidence = null;
let executablePeopleRowEvidence = null;

// T023 RED/GREEN contract. Every fixture below is synthetic and lives only in
// this Node process; these checks never open IndexedDB, a picker, MCP or a
// browser profile. The issued baseline is expected to fail these assertions
// for real product seams: repeated projectors, all-row DOM and render storms.
check(t023ProjectionViewModelSource.length > 0, "T023-O01 missing generation-scoped projection view-model seam");
check(/graph\s*===|graphRef/.test(t023ProjectionViewModelSource) && /activeGenerationId|generationId/.test(t023ProjectionViewModelSource), "T023-O02 projection cache key must bind graph reference and active generation");
check(/publicStatusByPerson\s*=\s*new Map|publicStatusByPerson:\s*new Map/.test(t023ProjectionViewModelSource), "T023-O01 public relationship status must be precomputed in a Map");
check(relationshipStatusSource.length > 0 && /publicStatusByPerson/.test(relationshipStatusSource) && !/publicRelationshipStatus[\s\S]*?(?:projectRelationshipLibrary|projectSourceIdentityReview|projectCrossSourceReview|currentRelationshipAuthority)\s*\(/.test(relationshipStatusSource), "T023-O01 public status lookup still invokes a whole-graph/person authority path");
check(t023ReviewGroupResolverSource.length > 0, "T020-O07 missing executable current-generation review-group resolver seam");
check(t023WindowMathSource.length > 0 && t023WindowRowsSource.length > 0, "T023-O03 missing executable fixed-row People window and spacer seams");
check(t023TableRowSource.length > 0 && /aria-rowindex/.test(t023TableRowSource) && /person-flow-open-pair/.test(t023TableRowSource) && /person-flow-open-relationship/.test(t023TableRowSource) && /real-relationship-manage/.test(t023TableRowSource) && /local-library-open-today/.test(t023TableRowSource), "T023-O04 virtual row must preserve actions and accessible row position");
check(/aria-rowcount/.test(peopleRender) && /\.standard-page|data-people-scroll/.test(t023WindowUiSource) && !/people-(?:virtual-)?(?:viewport|scroll)[^{]*\{[^}]*overflow\s*:\s*auto/.test(html), "T023-O04 People window must expose total rows and retain the outer standard-page scroller");
check(/const PEOPLE_SEARCH_DEBOUNCE_MS\s*=\s*200/.test(html) && t023SearchDebouncerSource.length > 0, "T023-O05 People search must use the fixed 200ms debounce seam");
check(t023SearchUiSource.length > 0 && !/(?:\brender\s*\(|\brenderPeople\s*\(|projectRelationshipLibrary\s*\(|projectSourceIdentityReview\s*\(|projectCrossSourceReview\s*\()/m.test(t023SearchUiSource), "T023-O05 search commit must repaint only list/count without global render or projector");
check(t023ProgressPainterSource.length > 0 && t023ProgressUiSource.length > 0 && /data-local-semantic-batch/.test(t023ProgressUiSource), "T023-O06 missing dedicated coalesced semantic progress painter");
check(!/\brender\s*\(\s*\)/.test(localSemanticBatchRunnerSource) && /localSemanticProgressPainter|updateLocalSemanticProgressSurface/.test(localSemanticBatchRunnerSource), "T023-O06 batch chunks still call global render instead of the progress sink");
check(/fallback\s*\(/.test(t023ProgressPainterSource) && /localSemanticProgressPainter\.fallback/.test(localSemanticBatchRunnerSource), "T023-O06 no-batch current failure lacks a terminal repaint owned by the progress sink");
for (const [label, source] of [
  ["projection view model", t023ProjectionViewModelSource],
  ["window math", t023WindowMathSource],
  ["window rows", t023WindowRowsSource],
  ["window UI", t023WindowUiSource],
  ["search debounce", t023SearchDebouncerSource],
  ["search UI", t023SearchUiSource],
  ["progress painter", t023ProgressPainterSource],
  ["progress UI", t023ProgressUiSource],
]) {
  check(!/commitGraph\s*\(|commitLocalSemanticCache\s*\(|showDirectoryPicker|\/api\/suiyin\/import|\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage/.test(source), `T023-O07 ${label} may not write, import, call MCP/network or persist view state`);
}

// T027 focused UI RED/GREEN. These checks only inspect the issued public UI
// seams; collectionLocations themselves must come from the real data projector,
// never from a UI stub, sourceBadges, aliases or a private browser profile.
check(t023ProjectionViewModelSource.includes("collectionLocationsByPerson") && t023ProjectionViewModelSource.includes("collectionLocationOptions") && t023ProjectionViewModelSource.includes("collectionLocationOptionTokenByKey"), "T027-O05/O06 generation view model must precompute collection-location Maps and opaque option tokens once");
check(t027CollectionLocationRenderSource.length > 0 && /collectionLocations/.test(t027CollectionLocationRenderSource) && !/sourceBadges|projectMappingAccountAttribution|accountAttributionOverride/.test(t027CollectionLocationRenderSource), "T027-O01/O04 所在微信 renderer must consume only safe collectionLocations");
check(/<th scope="col">人物<\/th><th scope="col">所在微信<\/th><th scope="col">当前关系<\/th><th scope="col">本机聚合<\/th><th scope="col">最近活动<\/th><th scope="col">下一步<\/th>/.test(peopleRender) && !/renderSourceBadges\(person\.sourceBadges\)/.test(t023TableRowSource) && /renderCollectionLocations/.test(t023TableRowSource) && /renderAccountAttributionAction/.test(t023TableRowSource), "T027-O04 People must render six exact columns, move account badges out of the person cell, and retain the T025 action");
check(/\.people-table th:nth-child\(1\)\s*\{\s*width:\s*22%/.test(html) && /\.people-table th:nth-child\(2\)\s*\{\s*width:\s*18%/.test(html) && /\.people-table th:nth-child\(3\)\s*\{\s*width:\s*18%/.test(html) && /\.people-table th:nth-child\(4\)\s*\{\s*width:\s*12%/.test(html) && /\.people-table th:nth-child\(5\)\s*\{\s*width:\s*12%/.test(html) && /\.people-table th:nth-child\(6\)\s*\{\s*width:\s*18%/.test(html), "T027-O04 People six-column widths must be exactly 22/18/18/12/12/18");
check(!/colspan="5"/.test(t023WindowRowsSource + t023WindowUiSource + peopleRender) && (t023WindowRowsSource.match(/colspan="6"/g) || []).length >= 2 && /colspan="6"/.test(t023WindowUiSource), "T027-O08 virtual spacers and empty state must span all six People columns");
check(t027CollectionLocationSelectionSource.length > 0 && /Set/.test(t027CollectionLocationSelectionSource) && /filterKey/.test(t027CollectionLocationSelectionSource) && /collectionLocationsByPerson/.test(t027CollectionLocationFilterSource) && /applyPeopleCollectionLocationFilter/.test(peopleChangeHandlersSource), "T027-O05/O06 location selection must use safe semantic keys, OR with row locations, and repaint the list only");
for (const source of [t027CollectionLocationSelectionSource, t027CollectionLocationFilterSource, t027CollectionLocationApplySource, t023SearchUiSource, peopleChangeHandlersSource]) {
  check(!/(?:\brender\s*\(|\brenderPeople\s*\(|projectRelationship|projectSourceIdentity|projectCrossSource|projectMappingAccountAttribution|analyzeLocal|commitGraph\s*\(|commitLocalSemanticCache\s*\(|showDirectoryPicker|\/api\/suiyin\/import)/.test(source), "T027-O07 filter/search/change seams must perform zero global render, projector, analyzer, import or write");
}

// T028 focused fictional UI RED/GREEN. The view model and renderer must
// consume only the public aggregate receipt. This fixture is code-authored,
// never opens IndexedDB, calls MCP/network, or reads a browser profile.
check(t028SuiyinScopeUiSource.length > 0, "T028-O05/O06 missing public Suiyin scope view-model/receipt renderer seam");
check(sourcesRender.includes("renderSuiyinScopeReceipt"), "T028-O05/O06 Sources must delegate Suiyin units and scope actions to the receipt renderer");
check(!/\u53ef\u8bfb\u804a\u5929/.test(sourcesRender), "T028-O06 Sources still calls messageCount 可读聊天 instead of 可读消息条数");
check(t028SuiyinScopeUiSource.includes("更新当前分配（不是三账号全量）"), "T028-O05 partial CTA must explicitly say it is not the three-account complete import");
check(t028SuiyinScopeUiSource.includes("确认三账号完整导入") && t028SuiyinScopeUiSource.includes("当前接口只能读取“当前分配”；可修正当前对象，但尚不能证明三账号好友完整"), "T028-O09 Sources must keep the three-account complete CTA visibly blocked with the exact capability reason");

if (t028SuiyinScopeUiSource.length > 0) {
  try {
    const api = Function("escapeHtml", `${t028SuiyinScopeUiSource}; return { buildSuiyinScopeViewModel, renderSuiyinScopeReceipt };`)(value => String(value ?? "").replace(/[&<>"']/g, ""));
    const partialAggregate = Object.freeze({
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
      excludedCount: 0,
      perPersona: Object.freeze([
        Object.freeze({ officialLabel: "纯虚构1号", friendCount: 2, groupCount: 1, messageCount: 12, unreadableCount: 0, failureCount: 0, complete: false }),
        Object.freeze({ officialLabel: "纯虚构2号", friendCount: 1, groupCount: 1, messageCount: 9, unreadableCount: 0, failureCount: 0, complete: false }),
        Object.freeze({ officialLabel: "纯虚构3号", friendCount: 1, groupCount: 1, messageCount: 7, unreadableCount: 0, failureCount: 0, complete: false }),
      ]),
      scopeKind: "current-allocation-partial-v1",
      scopeComplete: false,
      completeScopeUnavailableReason: "UPSTREAM_PERSONA_COHORT_UNAVAILABLE",
    });
    const partial = api.buildSuiyinScopeViewModel(partialAggregate);
    check(partial.scopeKind === "current-allocation-partial-v1" && partial.scopeComplete === false && partial.partialConfirmEnabled === true && partial.completeConfirmEnabled === false, "T028-O05 stable current-allocation partial must enable only the partial confirm");
    check(partial.allocationDeclaredCount === 9 && partial.allocationCount === 7 && partial.allocationMissingCount === 2 && partial.customerCount === 7 && partial.friendCount === 4 && partial.groupCount === 3 && partial.messageCount === 28, "T028-O05/O06 allocation/customer/friend/group/message units were mixed in the public view model");
    check(partial.failureCount === 0 && partial.allocationMissingCount === 2 && partial.perPersona.length === 3, "T028-O05/O07 allocation missing must stay separate from failure and must not erase the official persona rows");
    const namedExclusion = api.buildSuiyinScopeViewModel({ ...partialAggregate, friendCount: 3, missingDisplayNameCount: 1, excludedCount: 1 });
    check(namedExclusion.partialConfirmEnabled === true, "T028-O03/O05 a stable partial with one explicitly excluded unnamed friend must remain confirmable");
    const unexplainedCustomerMismatch = api.buildSuiyinScopeViewModel({ ...partialAggregate, friendCount: 2, missingDisplayNameCount: 1, excludedCount: 1 });
    check(unexplainedCustomerMismatch.partialConfirmEnabled === false, "T028-O03/O05 an unexplained customer/friend/group mismatch must fail closed");
    const partialMarkup = api.renderSuiyinScopeReceipt(partialAggregate, { mode: "preview" });
    for (const copy of [
      "当前分配声明 9、实际读取 7、缺失 2",
      "好友人物 4",
      "群上下文 3",
      "可读消息条数 28",
      "更新当前分配（不是三账号全量）",
      "确认三账号完整导入",
      "当前接口只能读取“当前分配”；可修正当前对象，但尚不能证明三账号好友完整",
      "纯虚构1号",
      "纯虚构2号",
      "纯虚构3号",
    ]) check(partialMarkup.includes(copy), `T028-O04/O05/O06/O09 partial receipt missing truthful copy: ${copy}`);
    check(/data-action="suiyin-import-confirm"/.test(partialMarkup) && /<button[^>]*disabled[^>]*>确认三账号完整导入<\/button>/.test(partialMarkup), "T028-O05/O09 partial receipt must expose one enabled partial action and one disabled complete action");
    check(!/可读聊天|客户\s*28|SY-[0-9A-F]{8}|wxid_|clientId|customerId/.test(partialMarkup), "T028-O02/O06 public partial receipt leaked raw identifiers or a false message unit");
    const savedPartialMarkup = api.renderSuiyinScopeReceipt(partialAggregate, { mode: "ready" });
    check(savedPartialMarkup.includes("当前接口只能读取“当前分配”；可修正当前对象，但尚不能证明三账号好友完整") && /<button[^>]*disabled[^>]*>确认三账号完整导入<\/button>/.test(savedPartialMarkup) && !/data-action="suiyin-import-confirm"/.test(savedPartialMarkup), "T028-O05/O09 saved partial receipt must retain the capability blocker without exposing another write action");

    const failed = api.buildSuiyinScopeViewModel({ ...partialAggregate, failureCount: 1 });
    check(failed.partialConfirmEnabled === false && failed.completeConfirmEnabled === false, "T028-O05/O09 request failure must disable both partial and complete confirmation");
    const complete = api.buildSuiyinScopeViewModel({ ...partialAggregate, allocationMissingCount: 0, failureCount: 0, perPersona: partialAggregate.perPersona.map(item => ({ ...item, complete: true })), scopeKind: "persona-complete-v1", scopeComplete: true });
    check(complete.partialConfirmEnabled === false && complete.completeConfirmEnabled === true, "T028-O09 a proven persona-complete receipt must enable only complete confirmation");
  } catch (error) {
    failures.push(`T028-O04/O05/O06/O09 executable Suiyin scope UI Oracle failed: ${error?.message || error}`);
  }
}

// T030 legal RED/GREEN. These are code-authored coverage receipts only; the
// renderer oracle never opens a picker, IndexedDB, MCP, network or private DOM.
const t030MetricLabels = ["好友", "1 对 1 聊天", "1 对 1 消息", "群聊", "群消息", "朋友圈内容"];
check(t030UnifiedSourceCoverageUiSource.length > 0, "T030-O01 missing the shared six-metric coverage renderer");
check((sourcesRender.match(/renderUnifiedSourceCoverageReceipt\s*\(/g) || []).length >= 2, "T030-O01 WeChat and Suiyin cards must call the same six-metric renderer");
check(!/sourceReceipt\.messageCountLabel[\s\S]{0,900}sourceReceipt\.momentCountLabel[\s\S]{0,900}sourceReceipt\.excludedLabel/.test(sourcesRender), "T030-O01/O04 legacy WeChat three-stat renderer is still active");
check(!/renderSuiyinScopeReceipt\s*\(\s*suiyinAggregate/.test(sourcesRender), "T030-O01/O06 legacy Suiyin six-stat renderer is still active");

if (t030UnifiedSourceCoverageUiSource.length > 0) {
  try {
    const renderUnifiedSourceCoverageReceipt = Function("escapeHtml", `${t030UnifiedSourceCoverageUiSource}; return renderUnifiedSourceCoverageReceipt;`)(value => String(value ?? "").replace(/[&<>"']/g, ""));
    const exact = value => Object.freeze({ value, state: "exact" });
    const partial = value => Object.freeze({ value, state: "partial" });
    const blocked = reason => Object.freeze({ value: null, state: "blocked", reason });
    const wechatReceipt = Object.freeze({
      version: 1,
      scopeKind: "wechat-export-batch-v1",
      scopeComplete: false,
      metrics: Object.freeze({
        friends: blocked("WECHAT_ROSTER_NOT_PROVIDED"),
        directConversations: exact(2),
        directMessages: exact(7),
        groupConversations: exact(1),
        groupMessages: exact(4),
        moments: exact(3),
      }),
      observedDirectParticipantCount: 2,
      excludedCount: 1,
    });
    const suiyinReceipt = Object.freeze({
      version: 1,
      scopeKind: "suiyin-current-allocation-partial-v1",
      scopeComplete: false,
      metrics: Object.freeze({
        friends: partial(4),
        directConversations: partial(4),
        directMessages: partial(72),
        groupConversations: partial(3),
        groupMessages: partial(41),
        moments: blocked("LOCAL_SUIYIN_MOMENTS_MAPPING_PENDING"),
      }),
    });
    const legacyReceipt = Object.freeze({
      version: 1,
      scopeKind: "wechat-export-batch-v1",
      scopeComplete: false,
      metrics: Object.freeze(Object.fromEntries([
        "friends", "directConversations", "directMessages", "groupConversations", "groupMessages", "moments"
      ].map(key => [key, Object.freeze({ value: null, state: "legacy-unknown" })]))),
    });
    const wechatMarkup = renderUnifiedSourceCoverageReceipt(wechatReceipt, { sourceKind: "wechat" });
    const suiyinMarkup = renderUnifiedSourceCoverageReceipt(suiyinReceipt, { sourceKind: "suiyin" });
    const legacyMarkup = renderUnifiedSourceCoverageReceipt(legacyReceipt, { sourceKind: "wechat" });
    for (const [name, markup] of [["WeChat", wechatMarkup], ["Suiyin", suiyinMarkup], ["legacy", legacyMarkup]]) {
      const positions = t030MetricLabels.map(label => String(markup).indexOf(label));
      check(positions.every(position => position >= 0) && positions.every((position, index) => index === 0 || positions[index - 1] < position), `T030-O01 ${name} metrics are missing or not in the fixed six-item order`);
    }
    check(/data-metric-state=["']blocked["']/.test(wechatMarkup) && wechatMarkup.includes("完整好友数：当前导出未提供可信好友清单") && wechatMarkup.includes("本批次单聊中出现 2 人") && !wechatMarkup.includes("好友总数 2"), "T030-O02/O03 WeChat friends must be blocked while the observed direct participant count stays separately scoped");
    check(/data-metric-state=["']partial["']/.test(suiyinMarkup) && /data-metric-state=["']blocked["']/.test(suiyinMarkup) && suiyinMarkup.includes("当前已读片段，不代表三个账号完整范围") && !/upstream-unsupported|上游不支持/i.test(suiyinMarkup), "T030-O02/O06 Suiyin partial metrics and local moments block need an honest local-scope explanation");
    check(legacyMarkup.includes("旧版导入未记录") && /data-metric-state=["']legacy-unknown["']/.test(legacyMarkup) && !/<strong[^>]*>0<\/strong>/.test(legacyMarkup), "T030-O02/O05 legacy unknown metrics need explicit copy and must not become zero");
  } catch (error) {
    failures.push(`T030-O01/O02/O03/O06 executable six-metric UI oracle failed: ${error?.message || error}`);
  }
}

// T031 legal RED/GREEN. Every value below is code-authored fiction. These
// checks inspect/exercise pure UI seams only; they do not open the browser,
// IndexedDB, an export, MCP, network, or any private DOM.
check(t031QueryOptionsSource.length > 0 && t031FeedRendererSource.length > 0, "T031-O01/O03 missing the real-moments feed UI/query seams");
check(html.includes("真实朋友圈内容流") && !sourcesRender.includes("真实朋友圈工作台"), "T031-O01 Sources must present the strict 真实朋友圈内容流 title");
check(!/\bqueryGraphSignals\s*\(|\brenderGraphSignalPage\s*\(/.test(sourcesRender) && /renderRealMomentFeedPage\s*\(/.test(sourcesRender), "T031-O01 active Sources still renders the all-signal feed instead of the moments-only feed");
check(/const\s+REAL_MOMENT_SEARCH_DEBOUNCE_MS\s*=\s*200\b/.test(html) && t031SearchDebouncerSource.length > 0, "T031-O05 missing the fixed 200ms real-moment search debouncer");
check(t031SearchApplySource.length > 0 && /generationId/.test(t031SearchApplySource) && /activeGenerationId/.test(t031SearchApplySource) && /graph/.test(t031SearchApplySource) && /renderRealMomentFeedOnly\s*\(/.test(t031SearchApplySource) && !/renderSources\s*\(/.test(t031SearchApplySource), "T031-O05 search apply must discard stale graph/generation work and repaint only the feed");
check(/realSignalSearch[\s\S]{0,900}(?:realMomentSearchDebouncer|scheduleRealMomentSearch)/.test(peopleInputHandlersSource) && !/realSignalSearch[\s\S]{0,900}renderSources\s*\(/.test(peopleInputHandlersSource), "T031-O05 search input still repaints the whole Sources page");
check(t031FeedOnlyRenderSource.length > 0 && /(?:innerHTML|replaceChildren)/.test(t031FeedOnlyRenderSource) && /(?:feed|moment)/i.test(t031FeedOnlyRenderSource) && !/renderSources\s*\(/.test(t031FeedOnlyRenderSource), "T031-O05/O07 missing a dedicated feed-only renderer");
check(t031SourceFilterHandlerSource.length > 0 && /\.add\s*\(|\.delete\s*\(/.test(t031SourceFilterHandlerSource) && /page\s*=\s*1/.test(t031SourceFilterHandlerSource) && /renderRealMomentFeedOnly\s*\(/.test(t031SourceFilterHandlerSource) && !/renderSources\s*\(/.test(t031SourceFilterHandlerSource), "T031-O03 source multi-select/filter changes must reset page 1 and repaint only the feed");
check(t031PageHandlerSource.length > 0 && /renderRealMomentFeedOnly\s*\(/.test(t031PageHandlerSource) && !/renderSources\s*\(/.test(t031PageHandlerSource), "T031-O05/O07 moment pagination must repaint only the feed");
check(t031ClassificationHandlerSource.length > 0 && /dataset\.actionToken/.test(t031ClassificationHandlerSource) && !/dataset\.signalId|data-signal-id/.test(t031ClassificationHandlerSource), "T031-O02/O06 classification must use an opaque action token rather than a raw signalId");
check(!/data-source-id/.test(sourcesRender) && /data-action=["']local-source-remove["'][^>]*data-action-token/.test(sourcesRender), "T031-O02 active Sources DOM must use an opaque token for local-source removal instead of a raw source ID");

if (t031QueryOptionsSource.length > 0) {
  try {
    const buildRealMomentFeedQueryOptions = Function(`${t031QueryOptionsSource}; return buildRealMomentFeedQueryOptions;`)();
    const selectedSourceTokens = new Set(["opaque-source-wechat", "opaque-source-suiyin-fictional"]);
    const combined = buildRealMomentFeedQueryOptions({
      page: 7,
      search: "纯虚构晚霞",
      identity: "confirmed",
      classification: "topic-approved",
      selectedSourceTokens,
    });
    const allSources = buildRealMomentFeedQueryOptions({ page: 1, search: "", identity: "all", classification: "all", selectedSourceTokens: new Set() });
    check(combined?.sourceOperator === "or" && Array.isArray(combined.sourceTokens) && combined.sourceTokens.length === 2 && combined.sourceTokens.every(token => selectedSourceTokens.has(token)), "T031-O03 selected sources must remain an explicit same-group OR");
    check(combined?.search === "纯虚构晚霞" && combined?.identity === "confirmed" && combined?.classification === "topic-approved", "T031-O03 source OR must combine with text/identity/classification by AND without dropping a filter");
    check(Array.isArray(allSources?.sourceTokens) && allSources.sourceTokens.length === 0, "T031-O03 an empty source selection must mean all eligible moments");
    check(Number.isInteger(combined?.pageSize) && combined.pageSize > 0 && combined.pageSize <= 50, "T031-O07 real-moment query page size must be bounded at 50");
  } catch (error) {
    failures.push(`T031-O03/O07 executable query-options Oracle failed: ${error?.message || error}`);
  }
}

if (t031FeedRendererSource.length > 0) {
  try {
    const escapeFixtureHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
    const renderRealMomentFeedPage = Function("escapeHtml", `${t031FeedRendererSource}; return renderRealMomentFeedPage;`)(escapeFixtureHtml);
    const rawCanaries = Object.freeze({
      signalId: "raw-signal-t031-canary",
      sourceId: "raw-source-t031-canary",
      personId: "raw-person-t031-canary",
      sourceAlias: "SY-RAW-T031-CANARY",
      timestamp: "1787012345678",
      path: "C:/private/t031-canary",
    });
    const items = Array.from({ length: 51 }, (_, index) => Object.freeze({
      opaqueToken: `opaque-moment-${index}`,
      publisherLabel: `纯虚构发布者${index}`,
      publishedAtLabel: index === 1 ? "时间未记录" : "2026-08-20 09:30",
      body: index === 1 ? "" : `纯虚构正文${index}`,
      mediaDescription: index === 0 ? "图片：纯虚构晚霞" : "",
      sourceToken: index % 2 ? "opaque-source-suiyin-fictional" : "opaque-source-wechat",
      sourceLabel: index % 2 ? "碎银 · 纯虚构1号" : "我的微信",
      identityLabel: "身份已确认",
      classification: "pending",
      classificationLabel: "待分类",
      classifiable: true,
      ...rawCanaries,
    }));
    const sourceOptions = Object.freeze([
      Object.freeze({ opaqueToken: "opaque-source-wechat", label: "我的微信" }),
      Object.freeze({ opaqueToken: "opaque-source-suiyin-fictional", label: "碎银 · 纯虚构1号" }),
    ]);
    const markup = String(renderRealMomentFeedPage(Object.freeze({ total: 51, page: 1, pageSize: 50, pageCount: 2, items, sourceOptions }), { selectedSourceTokens: new Set(sourceOptions.map(option => option.opaqueToken)) }));
    const liveCards = (markup.match(/<article\b[^>]*class=["'][^"']*\bmoment-card\b[^"']*["']/g) || []).length;
    check(markup.includes("真实朋友圈内容流") && /\u53ea\u663e\u793a[^<]{0,30}\u670b\u53cb\u5708/u.test(markup), "T031-O01 feed shell must say it shows moments only");
    check(markup.includes("我的微信") && markup.includes("碎银 · 纯虚构1号") && (markup.match(/type=["']checkbox["']/g) || []).length >= 2 && !/group_context|群上下文/.test(markup), "T031-O01/O03 source options must be multi-select safe labels with no group-context option");
    check(markup.includes("纯虚构发布者0") && markup.includes("2026-08-20 09:30") && markup.includes("时间未记录") && markup.includes("纯虚构正文0") && markup.includes("无文字") && markup.includes("图片：纯虚构晚霞"), "T031-O02/O05 moment cards must show safe publisher/time/body/media fallbacks");
    check(liveCards === 50, `T031-O07 fictional 51-item result rendered ${liveCards} live cards instead of the bounded 50`);
    check(/data-action-token=["']opaque-moment-0["']/.test(markup) && !/data-signal-id|data-source-id|data-person-id|data-customer-id|data-client-id|data-wc-id/i.test(markup), "T031-O02/O06 public actions must expose only opaque action tokens");
    check(!Object.values(rawCanaries).some(canary => markup.includes(canary)) && !/\b(?:signalId|sourceId|personId|sourceAlias|timestamp|path)\b/.test(markup), "T031-O02 public feed markup leaked a raw ID, alias, epoch, or path canary");
  } catch (error) {
    failures.push(`T031-O01/O02/O03/O05/O07 executable feed-render Oracle failed: ${error?.message || error}`);
  }
}

if (t031SearchDebouncerSource.length > 0) {
  try {
    const createRealMomentSearchDebouncer = Function("REAL_MOMENT_SEARCH_DEBOUNCE_MS", `${t031SearchDebouncerSource}; return createRealMomentSearchDebouncer;`)(200);
    const timers = new Map();
    const cleared = new Set();
    const commits = [];
    let timerSequence = 0;
    const debouncer = createRealMomentSearchDebouncer(request => commits.push(request), {
      setTimer(callback, delay) {
        const timerId = ++timerSequence;
        timers.set(timerId, { callback, delay });
        return timerId;
      },
      clearTimer(timerId) { cleared.add(timerId); },
    });
    const staleRequest = Object.freeze({ value: "纯虚构旧搜索", token: 1, graph: Object.freeze({ fixture: 1 }), generationId: "fictional-generation-1" });
    const latestRequest = Object.freeze({ value: "纯虚构新搜索", token: 2, graph: staleRequest.graph, generationId: staleRequest.generationId });
    debouncer.schedule(staleRequest);
    debouncer.schedule(latestRequest);
    check([...timers.values()].every(timer => timer.delay === 200) && cleared.has(1), "T031-O05 search must clear the prior timer and use exactly 200ms");
    timers.get(1)?.callback();
    timers.get(2)?.callback();
    check(commits.length === 1 && commits[0] === latestRequest, "T031-O05 an expired timer must not commit over the latest search");
  } catch (error) {
    failures.push(`T031-O05 executable latest-wins debounce Oracle failed: ${error?.message || error}`);
  }
}

// Execute the issued all-row implementation with 2,500 fictional people. This
// is deliberately the real extracted renderPeople/public-status source, not a
// simulated failure flag, so the RED proves product fan-out and DOM scale.
if (peopleRender.length > 0 && runtimeModelSource.length > 0 && relationshipStatusSource.length > 0 && t023ProjectionViewModelSource.length === 0) {
  try {
    const fictionalRows = Array.from({ length: 2500 }, (_, index) => ({
      personId: `t023-fictional-person-${String(index).padStart(5, "0")}`,
      displayName: `纯虚构人物${String(index).padStart(5, "0")}`,
      boundary: index % 2 === 0 ? "confirmed" : "pending",
      relationshipLabels: index % 3 === 0 ? ["纯虚构关系"] : [],
      excerptCount: index % 17,
      signalCount: index % 5,
      lastActivityDate: "2026-08-18",
      sourceBadges: [{ kind: "wechat", label: "微信" }],
    }));
    const fictionalSingles = fictionalRows.map(row => ({ personId: row.personId, mappingId: `t023-fictional-map-${row.personId}`, directRelationshipAllowed: true }));
    const calls = { library: 0, identity: 0, cross: 0 };
    const sink = { innerHTML: "" };
    const executeIssuedPeople = Function(
      "pageHost",
      "renderVaultTransitionRoute",
      "projectRelationshipLibrary",
      "projectSourceIdentityReview",
      "projectCrossSourceReview",
      "projectRelationshipAuthority",
      "fictionalRows",
      "fictionalSingles",
      `
        const state = { personFilter: "" };
        const graph = { sources: [{ id: "t023-fictional-source" }], people: fictionalRows.map(row => ({ id: row.personId })), excerpts: [], mappings: [], relationships: [], signals: [], actions: [] };
        const localVaultStatus = { state: "ready", graph, activeGenerationId: "t023-fictional-generation" };
        const currentLocalSemanticEntry = () => null;
        const renderLocalSemanticBatchStatus = () => "";
        const renderSourceBadgeHelp = () => "";
        const renderSourceBadges = () => "";
        const createViewActionToken = (_tokens, payload) => payload.personId;
        const escapeHtml = value => String(value ?? "");
        let peopleActionTokens = new Map();
        ${relationshipStatusSource}
        ${runtimeModelSource}
        ${peopleRender}
        renderPeople();
      `
    );
    executeIssuedPeople(
      sink,
      () => false,
      () => { calls.library += 1; return { aggregate: { peopleCount: fictionalRows.length }, rows: fictionalRows }; },
      () => { calls.identity += 1; return { singles: fictionalSingles, pairs: [], ambiguousCount: 0 }; },
      () => { calls.cross += 1; return { pendingCount: 0, pendingGroups: [], resolvedDecisions: [] }; },
      (_graph, { personId }) => ({ state: fictionalRows.find(row => row.personId === personId)?.boundary === "confirmed" ? "relationship" : "relationship-direct-pending" }),
      fictionalRows,
      fictionalSingles,
    );
    const issuedLiveRows = (sink.innerHTML.match(/<tbody>[\s\S]*?<\/tbody>/)?.[0].match(/<tr>/g) || []).length;
    check(calls.library <= 1 && calls.identity <= 1 && calls.cross <= 1, `T023-O01 issued People fan-out remains library=${calls.library}, identity=${calls.identity}, cross=${calls.cross}`);
    check(issuedLiveRows >= 40 && issuedLiveRows <= 80, `T023-O03 issued People inserted ${issuedLiveRows} live data rows instead of a 40-80 window`);
  } catch (error) {
    failures.push(`T023-O01/O03 issued baseline reproduction harness failed: ${error?.message || error}`);
  }
}

if (t023ProjectionViewModelSource.length > 0) {
  try {
    const calls = { batch: 0, library: 0, identity: 0, cross: 0 };
    const projectRelationshipLibrary = graph => { calls.library += 1; return { aggregate: { peopleCount: graph.rows.length }, rows: graph.rows }; };
    const projectSourceIdentityReview = graph => { calls.identity += 1; return graph.identityReview; };
    const projectCrossSourceReview = graph => { calls.cross += 1; return graph.crossSourceReview; };
    const projectRelationshipSuggestionIndex = graph => {
      calls.batch += 1;
      const relationshipLibrary = projectRelationshipLibrary(graph);
      const sourceIdentityReview = projectSourceIdentityReview(graph);
      const crossSourceReview = projectCrossSourceReview(graph);
      const singleByPerson = new Map(sourceIdentityReview.singles.map(single => [single.personId, single]));
      const pairPeople = new Set(sourceIdentityReview.pairs.flatMap(pair => [pair.left?.personId, pair.right?.personId]).filter(Boolean));
      const byPerson = new Map(relationshipLibrary.rows.map(row => {
        const single = singleByPerson.get(row.personId);
        const manualAddAllowed = single?.directRelationshipAllowed === true && !pairPeople.has(row.personId);
        return [row.personId, Object.freeze({
          state: pairPeople.has(row.personId) ? "identity-review" : manualAddAllowed ? "manual-needed" : "reimport-required",
          currentLabels: Object.freeze([...(row.relationshipLabels || [])]),
          suggestedLabels: Object.freeze([]),
          acceptAllowed: false,
          manualAddAllowed,
        })];
      }));
      return Object.freeze({ relationshipLibrary, sourceIdentityReview, crossSourceReview, byPerson, formalWriteCount: 0 });
    };
    const sourceBundleRevision = "F94A61B13F749F2D486C2C510762FE07016153F6A289DEFB90B8D1CB2F3BF511";
    const getLocalProjectionViewModel = Function("projectRelationshipSuggestionIndex", "readonlyLocalSemanticMap", "localSemanticState", "localSemanticBatchState", "SOURCE_BUNDLE_REVISION", `${t023ProjectionViewModelSource}; return getLocalProjectionViewModel;`)(projectRelationshipSuggestionIndex, entries => new Map(entries), new Map(), { status: "ready" }, sourceBundleRevision);
    const location = (kind, label, reviewRequired = false) => Object.freeze({ kind, label, filterKey: JSON.stringify(["collection-location-v1", kind, label]), reviewRequired });
    const myWechatLocation = location("my-wechat", "我的微信");
    const suiyinTwoLocation = location("suiyin-official", "碎银 · 2号");
    const unknownLocation = location("unknown", "采集位置未识别 · 请重导", true);
    const makeGraph = marker => ({
      marker,
      sources: [{ id: `${marker}-wechat-source`, state: "active", sourceKind: "wechat-export-toolkit", sourceBundleRevision }],
      mappings: [
        { id: `${marker}-map-pending`, personId: `${marker}-pending`, sourceId: `${marker}-wechat-source` },
        { id: `${marker}-map-confirmed`, personId: `${marker}-confirmed`, sourceId: `${marker}-wechat-source` },
        { id: `${marker}-map-ineligible`, personId: `${marker}-ineligible`, sourceId: `${marker}-wechat-source` },
      ],
      rows: [
        { personId: `${marker}-pair`, displayName: "纯虚构同名", boundary: "pending", relationshipLabels: [], sourceBadges: [{ kind: "unknown", label: "来源未识别 · 请重导" }], collectionLocations: [myWechatLocation, suiyinTwoLocation] },
        { personId: `${marker}-pending`, displayName: "纯虚构待管理", boundary: "pending", relationshipLabels: [], sourceBadges: [{ kind: "wechat", label: "微信导出 · 归属待核对" }], collectionLocations: [myWechatLocation] },
        { personId: `${marker}-confirmed`, displayName: "纯虚构已关联", boundary: "confirmed", relationshipLabels: ["纯虚构关系"], sourceBadges: [{ kind: "suiyin", label: "碎银 · 2号" }], collectionLocations: [myWechatLocation] },
        { personId: `${marker}-ineligible`, displayName: "纯虚构需重导", boundary: "pending", relationshipLabels: [], collectionLocations: [unknownLocation] },
      ],
      identityReview: {
        singles: [
          { personId: `${marker}-pending`, mappingId: `${marker}-map-pending`, directRelationshipAllowed: true },
          { personId: `${marker}-confirmed`, mappingId: `${marker}-map-confirmed`, directRelationshipAllowed: true },
          { personId: `${marker}-ineligible`, mappingId: `${marker}-map-ineligible`, directRelationshipAllowed: false },
        ],
        pairs: [{ pairKey: `${marker}-pair-key`, status: "pending", left: { personId: `${marker}-pair` }, right: { personId: `${marker}-other` } }],
        ambiguousCount: 0,
      },
      crossSourceReview: { pendingCount: 1, pendingGroups: [], resolvedDecisions: [] },
    });
    const graphA = makeGraph("a");
    const first = getLocalProjectionViewModel({ state: "ready", graph: graphA, activeGenerationId: "generation-a" });
    const same = getLocalProjectionViewModel({ state: "ready", graph: graphA, activeGenerationId: "generation-a" });
    check(first === same && calls.batch === 1 && calls.library === 1 && calls.identity === 1 && calls.cross === 1, `T023-O01/T026-O05 same-key batch/projection calls must be 1/1/1/1, got ${calls.batch}/${calls.library}/${calls.identity}/${calls.cross}`);
    check(first.rowByPerson instanceof Map && first.singleByPerson instanceof Map && first.pendingPairByPerson instanceof Map && first.accountAttributionByPerson instanceof Map && first.publicStatusByPerson instanceof Map && first.searchTextByPerson instanceof Map && first.relationshipSuggestionByPerson instanceof Map && first.collectionLocationsByPerson instanceof Map && first.collectionLocationOptionTokenByKey instanceof Map && first.collectionLocationOptionByToken instanceof Map, "T023-O01/T025-O08/T026-O05/T027-O05 People row/status/search/attribution/suggestion/location indexes must be precomputed Maps");
    check(first.accountAttributionByPerson.size === 3 && first.searchTextByPerson.get("a-pending").includes("我的微信") && !first.searchTextByPerson.get("a-pending").includes("归属待核对"), "T025-O01/T027-O01/O05 cached search must keep exact mapping eligibility but index collection location, not account-attribution badges");
    check(first.collectionLocationsByPerson.get("a-pair")?.map(item => item.label).join("|") === "我的微信|碎银 · 2号" && first.collectionLocationsByPerson.get("a-confirmed")?.[0]?.label === "我的微信", "T027-O01/O03 generation view model must preserve independent multi-lineage locations even when the account badge says 碎银 · 2号");
    check(first.collectionLocationOptions.length === 3 && first.collectionLocationOptions.every(option => /^collection-location-option-\d+-\d+$/.test(option.token) && !option.token.includes(option.label) && !option.token.includes(option.filterKey)), "T027-O05/O06 location options must be generated once with opaque DOM tokens");
    check(first.publicStatusByPerson.get("a-pair") === "来源需重导" && first.publicStatusByPerson.get("a-pending") === "关系可管理" && first.publicStatusByPerson.get("a-confirmed") === "来源已关联" && first.publicStatusByPerson.get("a-ineligible") === "来源需重导", "T023-O01 public status Map changed T020 relationship/cross-source semantics");
    executableProjectionEvidence = { first, calls };
    getLocalProjectionViewModel({ state: "ready", graph: graphA, activeGenerationId: "generation-b" });
    const graphB = makeGraph("b");
    getLocalProjectionViewModel({ state: "ready", graph: graphB, activeGenerationId: "generation-b" });
    check(calls.batch === 3 && calls.library === 3 && calls.identity === 3 && calls.cross === 3, `T023-O02/T026-O05 graph or generation invalidation must rebuild once, got ${calls.batch}/${calls.library}/${calls.identity}/${calls.cross}`);
  } catch (error) {
    failures.push(`T023-O01/O02 executable view-model Oracle failed: ${error?.message || error}`);
  }
}

if (t027CollectionLocationSelectionSource.length > 0 && t027CollectionLocationFilterSource.length > 0) {
  try {
    const api = Function(`${t027CollectionLocationSelectionSource}\n${t027CollectionLocationFilterSource}; return { reconcilePeopleCollectionLocationSelection, filterPeopleRows };`)();
    const location = (kind, label, reviewRequired = false) => Object.freeze({ kind, label, filterKey: JSON.stringify(["collection-location-v1", kind, label]), reviewRequired });
    const myWechat = location("my-wechat", "我的微信");
    const suiyinTwo = location("suiyin-official", "碎银 · 2号");
    const rows = Object.freeze([
      Object.freeze({ personId: "fictional-wechat-badge-only", displayName: "账号徽章是假碎银位置", sourceBadges: Object.freeze([{ kind: "suiyin", label: "碎银 · 2号" }]) }),
      Object.freeze({ personId: "fictional-direct-suiyin", displayName: "直接碎银" }),
      Object.freeze({ personId: "fictional-multi", displayName: "多来源关键字" }),
    ]);
    const viewModel = Object.freeze({
      rows,
      collectionLocationsByPerson: new Map([
        [rows[0].personId, Object.freeze([myWechat])],
        [rows[1].personId, Object.freeze([suiyinTwo])],
        [rows[2].personId, Object.freeze([myWechat, suiyinTwo])],
      ]),
      searchTextByPerson: new Map([
        [rows[0].personId, "账号徽章是假碎银位置 我的微信"],
        [rows[1].personId, "直接碎银 碎银 · 2号"],
        [rows[2].personId, "多来源关键字 我的微信 碎银 · 2号"],
      ]),
      collectionLocationOptionTokenByKey: new Map([[myWechat.filterKey, "opaque-my"], [suiyinTwo.filterKey, "opaque-suiyin-two"]]),
    });
    const ids = result => result.map(row => row.personId).join("|");
    check(ids(api.filterPeopleRows(viewModel, "", new Set([suiyinTwo.filterKey]))) === "fictional-direct-suiyin|fictional-multi", "T027-O01/O05 selecting 碎银 · 2号 must match direct/multi lineage but not a WeChat row whose account badge merely says 碎银 · 2号");
    check(ids(api.filterPeopleRows(viewModel, "", new Set([myWechat.filterKey]))) === "fictional-wechat-badge-only|fictional-multi", "T027-O05 selecting 我的微信 must match WeChat and multi-lineage rows");
    check(ids(api.filterPeopleRows(viewModel, "", new Set([myWechat.filterKey, suiyinTwo.filterKey]))) === "fictional-wechat-badge-only|fictional-direct-suiyin|fictional-multi", "T027-O05 multiple location selections must be OR");
    check(ids(api.filterPeopleRows(viewModel, "多来源关键字", new Set([suiyinTwo.filterKey]))) === "fictional-multi", "T027-O05 normalized text must combine with location selection using AND");
    check(ids(api.filterPeopleRows(viewModel, "", new Set())) === ids(rows), "T027-O05 empty location selection must mean all rows");
    const nextGeneration = { collectionLocationOptionTokenByKey: new Map([[myWechat.filterKey, "new-opaque-my"]]) };
    check([...api.reconcilePeopleCollectionLocationSelection(nextGeneration, new Set([myWechat.filterKey, suiyinTwo.filterKey]))].join("") === myWechat.filterKey, "T027-O06 generation refresh must retain only still-present semantic keys");
    check(api.reconcilePeopleCollectionLocationSelection(nextGeneration, new Set([suiyinTwo.filterKey])).size === 0, "T027-O06 generation refresh with an empty intersection must fall back to all");
  } catch (error) {
    failures.push(`T027-O01/O05/O06 executable location filter Oracle failed: ${error?.message || error}`);
  }
}

if (t027CollectionLocationSelectionSource.length > 0 && t027CollectionLocationFilterSource.length > 0 && t027CollectionLocationApplySource.length > 0) {
  try {
    const counters = { list: 0, global: 0, projector: 0, analyzer: 0, body: 0, write: 0 };
    const graph = Object.freeze({ marker: "fictional-current-graph" });
    const kind = "suiyin-official", label = "碎银 · 2号";
    const filterKey = JSON.stringify(["collection-location-v1", kind, label]);
    const token = "collection-location-option-fictional-current";
    const rows = Object.freeze([Object.freeze({ personId: "fictional-my" }), Object.freeze({ personId: "fictional-suiyin" })]);
    const summary = { textContent: "所在微信：全部" };
    const harness = Function("selectionSource", "filterSource", "applySource", "counters", "graph", "rows", "filterKey", "token", "summary", `
      const state = { page: "people", personFilter: "", peopleCollectionLocationFilterKeys: new Set() };
      const localVaultStatus = { state: "ready", graph, activeGenerationId: "fictional-generation-current" };
      const location = Object.freeze({ kind: "suiyin-official", label: "碎银 · 2号", filterKey, reviewRequired: false });
      const viewModel = Object.freeze({
        rows,
        collectionLocationsByPerson: new Map([[rows[0].personId, Object.freeze([{ kind: "my-wechat", label: "我的微信", filterKey: JSON.stringify(["collection-location-v1", "my-wechat", "我的微信"]), reviewRequired: false }])], [rows[1].personId, Object.freeze([location])]]),
        searchTextByPerson: new Map([[rows[0].personId, "fictional my"], [rows[1].personId, "fictional suiyin"]]),
        collectionLocationOptionTokenByKey: new Map([[filterKey, token]]),
        collectionLocationOptionByToken: new Map([[token, Object.freeze({ filterKey, expectedActiveGenerationId: "fictional-generation-current" })]]),
      });
      const peopleWindowState = { graph, generationId: "fictional-generation-current", rows: [...rows], viewModel, start: 0, end: 2, emptyCopy: "" };
      const pageHost = { querySelector: selector => selector === "[data-people-location-summary]" ? summary : null };
      const refreshPeopleWindow = () => { counters.list += 1; return true; };
      const render = () => { counters.global += 1; };
      const renderPeople = () => { counters.global += 1; };
      const projectRelationshipLibrary = () => { counters.projector += 1; };
      const projectRelationshipSuggestionIndex = () => { counters.projector += 1; };
      const analyzeLocalChatSemantics = () => { counters.analyzer += 1; };
      const readBody = () => { counters.body += 1; };
      const commitGraph = () => { counters.write += 1; };
      eval(selectionSource + "\\n" + filterSource + "\\n" + applySource);
      return { run: applyPeopleCollectionLocationFilter, state, current: peopleWindowState };
    `)(t027CollectionLocationSelectionSource, t027CollectionLocationFilterSource, t027CollectionLocationApplySource, counters, graph, rows, filterKey, token, summary);
    check(harness.run(token, true) === true && harness.current.rows.length === 1 && harness.current.rows[0].personId === "fictional-suiyin" && harness.state.peopleCollectionLocationFilterKeys.has(filterKey), "T027-O05 executable location change must apply the selected safe key immediately");
    check(counters.list === 1 && counters.global === 0 && counters.projector === 0 && counters.analyzer === 0 && counters.body === 0 && counters.write === 0, `T027-O07 location change must be list-only (list/global/projector/analyzer/body/write=${counters.list}/${counters.global}/${counters.projector}/${counters.analyzer}/${counters.body}/${counters.write})`);
    check(summary.textContent === "所在微信：已选 1 项", "T027-O05 location change must update the accessible visible summary");
    check(harness.run("stale-or-forged-token", true) === false && counters.list === 1 && harness.state.peopleCollectionLocationFilterKeys.size === 1, "T027-O06 stale/forged option token must perform zero action and zero repaint");
  } catch (error) {
    failures.push(`T027-O05/O06/O07 executable list-only location change Oracle failed: ${error?.message || error}`);
  }
}

if (t023TableRowSource.length > 0) {
  try {
    const rowHarness = new Function("safeCollectionLocations", "renderAccountAttributionAction", "renderRelationshipFactsSummary", "renderRelationshipSuggestionSummary", "escapeHtml", `
      let peopleActionTokens = new Map();
      let sequence = 0;
      const localVaultStatus = { activeGenerationId: "fictional-generation-current" };
      const createViewActionToken = (collection, payload, prefix) => {
        const token = prefix + "-" + (++sequence);
        collection.set(token, payload);
        return token;
      };
      ${t027CollectionLocationRenderSource}
      ${t023TableRowSource}
      return { render: renderPeopleTableRow, tokens: () => new Map(peopleActionTokens) };
    `)(
      locations => Object.freeze([...(Array.isArray(locations) ? locations : [])]),
      (personId, _surface, actionToken) => ["fictional-pending", "fictional-confirmed"].includes(personId) ? `<button data-action="account-attribution-open" data-action-token="${actionToken}">核对来源归属</button>` : "",
      (suggestion, { fallbackLabels = [] } = {}) => {
        const labels = suggestion?.currentLabels || fallbackLabels;
        if (!labels.length && ["loading", "stale"].includes(suggestion?.state)) return "";
        return labels.length ? labels.join("、") : "尚未添加关系标签";
      },
      suggestion => suggestion ? `<aside data-relationship-suggestion-state="${suggestion.state}">${suggestion.state === "suggested" ? `系统建议：${suggestion.suggestedLabels.join("、")} · 待你确认` : suggestion.state}</aside>` : "",
      value => String(value ?? "").replace(/[&<>"']/g, "")
    );
    const location = (kind, label, reviewRequired = false) => Object.freeze({ kind, label, filterKey: JSON.stringify(["collection-location-v1", kind, label]), reviewRequired });
    const myWechatLocation = location("my-wechat", "我的微信");
    const suiyinTwoLocation = location("suiyin-official", "碎银 · 2号");
    const unknownLocation = location("unknown", "采集位置未识别 · 请重导", true);
    const rawBadgeCanary = "RAW-SOURCE-ALIAS-SY-DEADBEEF";
    const pairPerson = { personId: "fictional-pair", displayName: "纯虚构跨来源", boundary: "pending", relationshipLabels: [], excerptCount: 4, signalCount: 2, lastActivityDate: "2026-08-18", sourceBadges: [{ kind: "wechat", label: rawBadgeCanary }, { kind: "suiyin", label: "碎银 · 9号账号归属" }] };
    const pendingPerson = { personId: "fictional-pending", displayName: "纯虚构待管理", boundary: "pending", relationshipLabels: [], excerptCount: 3, signalCount: 1, lastActivityDate: "2026-08-17", sourceBadges: [{ kind: "wechat", label: rawBadgeCanary }] };
    const confirmedPerson = { personId: "fictional-confirmed", displayName: "纯虚构已关联", boundary: "confirmed", relationshipLabels: ["朋友", "客户"], excerptCount: 6, signalCount: 3, lastActivityDate: "2026-08-16", sourceBadges: [{ kind: "suiyin", label: "碎银 · 2号" }] };
    const directSuiyinPerson = { personId: "fictional-direct-suiyin-official", displayName: "纯虚构真实昵称", boundary: "pending", relationshipLabels: [], excerptCount: 8, signalCount: 0, lastActivityDate: "2026-08-19", sourceBadges: [{ kind: "suiyin", label: "碎银 · 纯虚构2号" }] };
    const unknownPerson = { personId: "fictional-unknown", displayName: "纯虚构需重导", boundary: "pending", relationshipLabels: [], excerptCount: 0, signalCount: 0, lastActivityDate: "", sourceBadges: [{ kind: "unknown", label: rawBadgeCanary }] };
    const viewModel = {
      singleByPerson: new Map([
        [pendingPerson.personId, { mappingId: "fictional-map-pending", directRelationshipAllowed: true }],
        [confirmedPerson.personId, { mappingId: "fictional-map-confirmed", directRelationshipAllowed: true }],
        [directSuiyinPerson.personId, { mappingId: "fictional-map-direct-suiyin", directRelationshipAllowed: true }],
      ]),
      pendingPairByPerson: new Map([[pairPerson.personId, { pairKey: "fictional-review-group-current" }]]),
      accountAttributionByPerson: new Map([
        [pendingPerson.personId, { mappingId: "fictional-map-pending" }],
        [confirmedPerson.personId, { mappingId: "fictional-map-confirmed" }],
      ]),
      publicStatusByPerson: new Map([
        [pairPerson.personId, "来源需重导"],
        [pendingPerson.personId, "关系可管理"],
        [confirmedPerson.personId, "来源已关联"],
        [directSuiyinPerson.personId, "关系可管理"],
        [unknownPerson.personId, "来源需重导"],
      ]),
      collectionLocationsByPerson: new Map([
        [pairPerson.personId, Object.freeze([myWechatLocation, suiyinTwoLocation])],
        [pendingPerson.personId, Object.freeze([myWechatLocation])],
        [confirmedPerson.personId, Object.freeze([myWechatLocation])],
        [directSuiyinPerson.personId, Object.freeze([location("suiyin-official", "碎银 · 纯虚构2号")])],
        [unknownPerson.personId, Object.freeze([unknownLocation])],
      ]),
      relationshipSuggestionByPerson: new Map([
        [pairPerson.personId, Object.freeze({ state: "identity-review", currentLabels: Object.freeze([]), suggestedLabels: Object.freeze([]), acceptAllowed: false, manualAddAllowed: false })],
        [pendingPerson.personId, Object.freeze({ state: "manual-needed", currentLabels: Object.freeze([]), suggestedLabels: Object.freeze([]), acceptAllowed: false, manualAddAllowed: true })],
        [confirmedPerson.personId, Object.freeze({ state: "suggested", currentLabels: Object.freeze(["朋友", "客户"]), suggestedLabels: Object.freeze(["合作伙伴"]), acceptAllowed: true, manualAddAllowed: true })],
        [directSuiyinPerson.personId, Object.freeze({ state: "manual-needed", currentLabels: Object.freeze([]), suggestedLabels: Object.freeze([]), acceptAllowed: false, manualAddAllowed: true })],
        [unknownPerson.personId, Object.freeze({ state: "reimport-required", currentLabels: Object.freeze([]), suggestedLabels: Object.freeze([]), acceptAllowed: false, manualAddAllowed: false })],
      ]),
    };
    const pair = rowHarness.render(pairPerson, 2, viewModel);
    const pending = rowHarness.render(pendingPerson, 3, viewModel);
    const confirmed = rowHarness.render(confirmedPerson, 4, viewModel);
    const directSuiyin = rowHarness.render(directSuiyinPerson, 5, viewModel);
    const unknown = rowHarness.render(unknownPerson, 6, viewModel);
    viewModel.relationshipSuggestionByPerson.set(pendingPerson.personId, Object.freeze({ state: "loading", currentLabels: Object.freeze([]), suggestedLabels: Object.freeze([]), acceptAllowed: false, manualAddAllowed: false }));
    const loading = rowHarness.render(pendingPerson, 7, viewModel);
    const tokens = [...rowHarness.tokens().values()];
    const pairToken = tokens.find(item => item.personId === pairPerson.personId);
    executablePeopleRowEvidence = { pair, pending, confirmed, directSuiyin, unknown, tokens, pairToken };
    check(/data-action="person-flow-open-pair"/.test(pair) && pair.includes("核对跨来源身份") && pair.includes("我的微信") && pair.includes("碎银 · 2号"), "T016/T027 executable People pair row lost its review action or multi-lineage collection locations");
    check(pairToken?.reviewGroupId === "fictional-review-group-current" && pairToken?.expectedActiveGenerationId === "fictional-generation-current", "T020-O04 executable People pair action token lost its opaque current-generation review group");
    check(/data-action="person-flow-open-relationship"/.test(pending) && pending.includes("管理关系标签") && pending.includes("关系可管理") && pending.includes("我的微信") && !/确认(?:这个|此来源)?身份/.test(pending), "T018/T020/T027 executable pending-single row no longer opens direct relationship management with its collection location");
    check(/data-action="account-attribution-open"/.test(pending) && pending.includes("核对来源归属") && !pending.includes("微信导出 · 归属待核对"), "T025-O03/T027-O04 executable pending row must retain the per-person attribution editor without mixing its account badge into the person/location cells");
    check(/data-action="real-relationship-manage"/.test(confirmed) && /data-action="local-library-open-today"[^>]*data-action-token="[^\"]+"/.test(confirmed) && !confirmed.includes(confirmedPerson.personId) && confirmed.includes("来源已关联") && confirmed.includes("朋友") && confirmed.includes("客户") && confirmed.includes("我的微信") && !confirmed.includes("碎银 · 2号"), "T026-O11/T027-O01 People row must expose only safe collection location plus opaque actions, never the raw personId or account badge");
    check(directSuiyin.includes("纯虚构真实昵称") && directSuiyin.includes("碎银 · 纯虚构2号") && !/待确认身份|昵称待补|碎银 · 账号待补/.test(directSuiyin), "T028-O04/O05 direct Suiyin People row must retain the real safe display name and official collection-location label without placeholders");
    check(unknown.includes("采集位置未识别 · 请重导") && unknown.includes("来源未识别 · 请重导") && unknown.includes("来源需重导") && !/person-flow-open-(?:pair|relationship)/.test(unknown), "T019/T027 executable unknown-source row must fail closed to reimport");
    check(loading.includes("loading") && loading.includes("正在分析聊天") && !loading.includes("尚未添加关系标签") && !/person-flow-open-relationship|real-relationship-manage/.test(loading), "T026-O05/O07 loading People row must show analysis state before any empty fact/manual action");
    for (const [label, markup] of Object.entries({ pair, pending, confirmed, directSuiyin, unknown, loading })) {
      check((markup.match(/<td>/g) || []).length === 6, `T027-O04 ${label} People row must render exactly six cells`);
      check(!markup.includes(rawBadgeCanary) && !markup.includes("data-safe-badge"), `T027-O01/O04 ${label} People row leaked account-attribution/raw badge content into the six-column renderer`);
    }
  } catch (error) {
    failures.push(`T003/T013/T016/T018/T019/T020/T021 executable People row Oracle failed: ${error?.message || error}`);
  }
}

if (t023ReviewGroupResolverSource.length > 0) {
  try {
    let projectionCalls = 0;
    const currentPair = { pairKey: "fictional-review-group-current", status: "pending" };
    const resolveCurrentReviewGroup = Function("getLocalProjectionViewModel", `${t023ReviewGroupResolverSource}; return resolveCurrentReviewGroup;`)(() => {
      projectionCalls += 1;
      return { identityReview: { pairs: [currentPair] } };
    });
    check(resolveCurrentReviewGroup("fictional-review-group-current", { state: "ready" }) === currentPair && projectionCalls === 1, "T020-O07 current review group must resolve through the cached current-generation projection exactly once");
    check(resolveCurrentReviewGroup("fictional-review-group-stale", { state: "ready" }) === null && projectionCalls === 2, "T020-O07 stale opaque review-group token must fail closed against the current projection");
  } catch (error) {
    failures.push(`T020-O07 executable current review-group resolver Oracle failed: ${error?.message || error}`);
  }
}

if (t023WindowMathSource.length > 0 && t023WindowRowsSource.length > 0) {
  try {
    const computePeopleWindow = Function(`${t023WindowMathSource}; return computePeopleWindow;`)();
    const renderPeopleWindowRows = Function(`${t023WindowRowsSource}; return renderPeopleWindowRows;`)();
    for (const total of [2500, 10000]) {
      const rows = Array.from({ length: total }, (_, index) => ({ personId: `t023-fictional-window-${total}-${index}` }));
      const rowHeight = 96;
      for (const scrollTop of [0, Math.floor(total / 2) * rowHeight, total * rowHeight]) {
        const windowState = computePeopleWindow(rows, { scrollTop, viewportHeight: 720, rowHeight });
        check(windowState.visibleRows.length >= 40 && windowState.visibleRows.length <= 80, `T023-O03 ${total} rows at ${scrollTop} produced ${windowState.visibleRows.length} live rows`);
        check(windowState.start >= 0 && windowState.end <= total && windowState.end - windowState.start === windowState.visibleRows.length, `T023-O03 ${total} window bounds are inconsistent`);
        check(windowState.topSpacerHeight + windowState.visibleRows.length * rowHeight + windowState.bottomSpacerHeight === total * rowHeight, `T023-O03 ${total} spacer extent is not continuous`);
      }
      const middle = computePeopleWindow(rows, { scrollTop: Math.floor(total / 2) * rowHeight, viewportHeight: 720, rowHeight });
      const markup = renderPeopleWindowRows(middle, (row, ariaRowIndex) => `<tr data-people-row aria-rowindex="${ariaRowIndex}"><td>${row.personId}</td></tr>`);
      check((markup.match(/data-people-row/g) || []).length === middle.visibleRows.length && !/hidden[^>]*data-people-row|data-people-row[^>]*hidden/.test(markup), `T023-O03 ${total} renderer retained offscreen hidden data rows`);
      check(markup.includes(`aria-rowindex="${middle.start + 2}"`), `T023-O04 ${total} first recycled row exposes the wrong accessible index`);
      check((markup.match(/colspan="6"/g) || []).length === 2 && !markup.includes('colspan="5"'), `T027-O08 ${total} virtual top/bottom spacers must span exactly six columns`);
    }
  } catch (error) {
    failures.push(`T023-O03/O04 executable virtual-window Oracle failed: ${error?.message || error}`);
  }
}

if (t023SearchDebouncerSource.length > 0) {
  try {
    const createPeopleSearchDebouncer = Function(`const PEOPLE_SEARCH_DEBOUNCE_MS = 200; ${t023SearchDebouncerSource}; return createPeopleSearchDebouncer;`)();
    let clock = 0, nextId = 1;
    const timers = new Map();
    const setTimer = (callback, delay) => { const id = nextId++; timers.set(id, { callback, at: clock + delay }); return id; };
    const clearTimer = id => timers.delete(id);
    const tick = milliseconds => {
      clock += milliseconds;
      const due = [...timers.entries()].filter(([, timer]) => timer.at <= clock).sort((left, right) => left[1].at - right[1].at);
      for (const [id, timer] of due) { timers.delete(id); timer.callback(); }
    };
    const commits = [];
    const debouncer = createPeopleSearchDebouncer(value => commits.push(value), { setTimer, clearTimer });
    debouncer.schedule("纯"); debouncer.schedule("纯虚"); debouncer.schedule("纯虚构");
    tick(199);
    check(commits.length === 0, `T023-O05 search committed ${commits.length} times before 200ms`);
    tick(1);
    check(commits.length === 1 && commits[0] === "纯虚构", `T023-O05 search must commit latest-only once at 200ms, got ${JSON.stringify(commits)}`);
  } catch (error) {
    failures.push(`T023-O05 executable debounce Oracle failed: ${error?.message || error}`);
  }
}

if (t023SearchDebouncerSource.length === 0 && peopleInputHandlersSource.length > 0) {
  try {
    const inputHandlers = [];
    let peopleRenders = 0;
    const pageHost = { addEventListener: (type, handler) => { if (type === "input") inputHandlers.push(handler); } };
    const executeIssuedSearch = Function("pageHost", "state", "renderPeople", "document", `${peopleInputHandlersSource}`);
    executeIssuedSearch(pageHost, { personFilter: "" }, () => { peopleRenders += 1; }, {
      querySelector: () => null,
      getElementById: () => ({ focus() {}, setSelectionRange() {}, value: "纯虚构" }),
    });
    for (const handler of inputHandlers) handler({ target: { id: "peopleSearch", value: "纯虚构" } });
    check(peopleRenders === 0, `T023-O05 issued search performed ${peopleRenders} immediate full People renders before 200ms`);
  } catch (error) {
    failures.push(`T023-O05 issued search reproduction harness failed: ${error?.message || error}`);
  }
}

if (t023ProgressPainterSource.length > 0) {
  try {
    const createLocalSemanticProgressPainter = Function(`${t023ProgressPainterSource}; return createLocalSemanticProgressPainter;`)();
    let nextFrame = 1, progressPaints = 0, terminalPaints = 0;
    const frames = new Map();
    const painter = createLocalSemanticProgressPainter({
      paint: () => { progressPaints += 1; },
      paintTerminal: () => { terminalPaints += 1; },
      requestFrame: callback => { const id = nextFrame++; frames.set(id, callback); return id; },
      cancelFrame: id => frames.delete(id),
    });
    for (let index = 0; index < 106; index += 1) painter.progress();
    check(progressPaints === 0 && terminalPaints === 0 && frames.size === 1, "T023-O06 106 chunk updates must coalesce before the next frame with 0 global render");
    for (const [id, callback] of [...frames]) { frames.delete(id); callback(); }
    check(progressPaints === 1 && terminalPaints === 0, "T023-O06 one animation frame must paint the dedicated progress sink once");
    painter.terminal();
    check(terminalPaints === 1, `T023-O06 current terminal must repaint at most once, got ${terminalPaints}`);
    painter.progress();
    painter.discard();
    for (const [id, callback] of [...frames]) { frames.delete(id); callback(); }
    check(terminalPaints === 1 && progressPaints === 1, "T023-O06 stale/discarded work must not paint progress or a terminal page");
    if (typeof painter.fallback === "function") {
      painter.fallback("fictional-current-no-batch");
      check(terminalPaints === 2, "T023-O06 current no-batch/early failure must receive exactly one fallback terminal paint");
    }
  } catch (error) {
    failures.push(`T023-O06 executable progress-painter Oracle failed: ${error?.message || error}`);
  }
}

async function runRelationshipCallerTerminalCase(mode) {
  const meter = { started: false, renders: 0, queuedTerminal: null };
  const batchResult = mode === "stale"
    ? { ok: false, code: "BATCH_STALE_DISCARDED" }
    : mode === "failed"
      ? { ok: false, code: "BATCH_ANALYSIS_FAILED" }
      : { ok: true, code: null };
  const initialGraph = { marker: `fictional-relationship-${mode}-before` };
  const nextGraph = { marker: `fictional-relationship-${mode}-after` };
  const refreshAfterCommittedBusiness = async () => {
    meter.started = true;
    if (mode !== "stale") meter.queuedTerminal = () => { meter.renders += 1; };
    return batchResult;
  };
  const run = new Function(
    "mutateRelationshipFacts",
    "mutateSingleSourceRelationship",
    "commitGraph",
    "refreshAfterCommittedBusiness",
    "resetLocalAnalysis",
    "renderPeople",
    "showToast",
    "meter",
    "initialGraph",
    `
      let localVaultStatus = { state: "ready", graph: initialGraph, activeGenerationId: "fictional-generation-before", adapter: {}, key: {} };
      let personFlowState = { open: false, phase: null, personId: null, single: null, expectedActiveGenerationId: null };
      let realRelationshipState = { personId: "fictional-person", status: "idle", candidates: [], error: null, saving: false };
      let analysisInProgress = false;
      let localAnalysisState = { status: "ready", result: {}, error: null };
      const state = { analysisSelectedId: "fictional-person" };
      ${realRelationshipMutationSource}
      return () => applyRealRelationshipMutation(
        { operation: "delete", personId: "fictional-person", relationshipId: "fictional-relationship", decisionId: "fictional-decision", at: "2026-08-18T00:00:00.000Z" },
        "纯虚构成功",
        () => { if (meter.started) meter.renders += 1; }
      );
    `
  )(
    () => ({ graph: nextGraph, changed: true, formalWriteCount: 1, formalIdentityWriteCount: 0, relationshipId: "fictional-relationship" }),
    () => { throw new Error("unexpected-direct-single"); },
    async () => "fictional-generation-after",
    refreshAfterCommittedBusiness,
    () => {},
    () => {},
    () => {},
    meter,
    initialGraph,
  );
  await run();
  meter.queuedTerminal?.();
  return meter.renders;
}

async function runRestoreCallerTerminalCase(mode) {
  const meter = { started: false, renders: 0, queuedTerminal: null };
  const batchResult = mode === "stale"
    ? { ok: false, code: "BATCH_STALE_DISCARDED" }
    : mode === "failed"
      ? { ok: false, code: "BATCH_SNAPSHOT_INVALID" }
      : { ok: true, code: null };
  const runLocalSemanticBatch = async () => {
    meter.started = true;
    if (mode !== "stale") meter.queuedTerminal = () => { meter.renders += 1; };
    return batchResult;
  };
  const run = new Function("restoreBackup", "loadActiveGraphWithSemanticCache", "runLocalSemanticBatch", "meter", `
    let localRestorePreview = { ok: true, requiresResurrectionConfirmation: false };
    let pendingRestorePhrase = "fictional-restore-phrase";
    let localSafetySnapshot = null;
    let localVaultStatus = { state: "ready", graph: { marker: "fictional-before" }, activeGenerationId: "fictional-generation-before", adapter: {}, key: {} };
    const localBackupArtifact = { marker: "fictional-backup" };
    const clearPendingRestore = () => { pendingRestorePhrase = null; };
    const resetLocalAnalysis = () => {};
    const renderSources = () => { if (meter.started) meter.renders += 1; };
    const render = () => { if (meter.started) meter.renders += 1; };
    const showToast = () => {};
    const openDialog = () => {};
    const closeDialog = () => {};
    ${confirmLocalRestoreSource}
    return confirmLocalRestore;
  `)(
    async () => ({ snapshot: { marker: "fictional-snapshot" } }),
    async () => ({ graph: { marker: "fictional-after" }, activeGenerationId: "fictional-generation-after" }),
    runLocalSemanticBatch,
    meter,
  );
  await run(false);
  meter.queuedTerminal?.();
  return meter.renders;
}

async function runIdentityCallerTerminalCase(mode) {
  const meter = { started: false, afterSemanticRenders: 0, allRenders: 0, queuedTerminal: null };
  const changed = mode !== "unchanged";
  const mutation = { graph: { marker: `fictional-identity-${mode}-after` }, changed, formalWriteCount: changed ? 1 : 0, formalRelationshipWriteCount: 0, formalIdentityWriteCount: changed ? 1 : 0, personId: "fictional-left", decision: "merged", pairKey: "fictional-review-group-current" };
  const batchResult = mode === "stale"
    ? { ok: false, code: "BATCH_STALE_DISCARDED" }
    : mode === "failed"
      ? { ok: false, code: "BATCH_ANALYSIS_FAILED" }
      : { ok: true, code: null };
  const semanticRefresh = async () => {
    meter.started = true;
    if (mode !== "stale") meter.queuedTerminal = () => { meter.afterSemanticRenders += 1; meter.allRenders += 1; };
    return batchResult;
  };
  const harness = new Function(
    "mutation",
    "semanticRefresh",
    "meter",
    "commitPersonIdentitySource",
    `
      let personFlowState = { open: true, phase: "identity", status: "idle", mode: "pair", personId: null, single: null, pair: { pairKey: "fictional-review-group-current", left: { personId: "fictional-left" }, right: { personId: "fictional-right" } }, expectedActiveGenerationId: "fictional-generation-before", error: null };
      let localVaultStatus = { state: "ready", graph: { marker: "fictional-before" }, activeGenerationId: "fictional-generation-before", adapter: {}, key: {} };
      const syncPersonFlowDialog = () => {};
      const mergeImportedIdentityPair = () => mutation;
      const separateImportedIdentityPair = () => mutation;
      const undoImportedIdentityPairDecision = () => mutation;
      const commitGraph = async () => "fictional-generation-after";
      const resetLocalAnalysis = () => {};
      const projectSourceIdentityReview = () => ({ pairs: [] });
      const getLocalProjectionViewModel = () => ({ identityReview: { pairs: [] } });
      const render = () => { meter.allRenders += 1; if (meter.started) meter.afterSemanticRenders += 1; };
      const scheduleLocalSemanticRefresh = semanticRefresh;
      const refreshAfterCommittedBusiness = semanticRefresh;
      const showToast = () => {};
      eval(commitPersonIdentitySource);
      return { run: commitPersonIdentity, flow: () => ({ ...personFlowState }) };
    `
  )(mutation, semanticRefresh, meter, personFlowCommitSource);
  await harness.run("merged");
  meter.queuedTerminal?.();
  return { ...meter, flow: harness.flow() };
}

if (realRelationshipMutationSource.length > 0 && confirmLocalRestoreSource.length > 0 && personFlowCommitSource.length > 0) {
  try {
    check(await runRelationshipCallerTerminalCase("current") === 1, "T023-O06 applyRealRelationshipMutation current batch must have exactly one terminal global render across caller and batch");
    check(await runRelationshipCallerTerminalCase("failed") === 1, "T023-O06 applyRealRelationshipMutation failed current batch must retain one truthful terminal global render");
    check(await runRelationshipCallerTerminalCase("stale") === 0, "T023-O06 applyRealRelationshipMutation stale batch must not repaint from the discarded caller");
    check(await runRestoreCallerTerminalCase("current") === 1, "T023-O06 confirmLocalRestore current batch must have exactly one terminal global render across caller and batch");
    check(await runRestoreCallerTerminalCase("failed") === 1, "T023-O06 confirmLocalRestore no-batch/current failure must still reach one truthful terminal global render");
    check(await runRestoreCallerTerminalCase("stale") === 0, "T023-O06 confirmLocalRestore stale batch must not repaint from the discarded caller");
    const identityCurrent = await runIdentityCallerTerminalCase("current");
    const identityFailed = await runIdentityCallerTerminalCase("failed");
    const identityStale = await runIdentityCallerTerminalCase("stale");
    const identityUnchanged = await runIdentityCallerTerminalCase("unchanged");
    check(identityCurrent.afterSemanticRenders === 1 && identityCurrent.flow.status === "ready", "T023-O06 commitPersonIdentity current batch must have one terminal global render with final ready modal state");
    check(identityFailed.afterSemanticRenders === 1 && identityFailed.flow.error === "RELATIONSHIP_REFRESH_FAILED", "T023-O06 commitPersonIdentity failed current batch must have one terminal global render with truthful error state");
    check(identityStale.afterSemanticRenders === 0, "T023-O06 commitPersonIdentity stale batch must not repaint from the discarded caller");
    check(identityUnchanged.allRenders === 1 && identityUnchanged.flow.status === "ready", "T023-O06 commitPersonIdentity no-batch unchanged path must still render its final modal state exactly once");
  } catch (error) {
    failures.push(`T023-O06 executable caller terminal-ownership Oracle failed: ${error?.message || error}`);
  }
}

// T012 RED/GREEN contract: normal runtime has no demo mode. These checks are
// intentionally source-local first so the pre-fix runtime fails for its actual
// reachable built-in fixtures, rather than for a browser or harness problem.
for (const [label, source, forbidden] of [
  ["shell", shellSource, /fixtureSelect|fixtureHelp|reset-demo|状态实验室|重置演示/],
  ["Today", todayRender, /demoPeople|missedItems|虚构演示|离线演示|操作不可用演示/],
  ["Missed", missedRender, /missedItems|模拟跨日|missed-prepare|missed-today|missed-snooze|missed-ignore/],
  ["History", historyRender, /historyFixtures|history-fixture|演示日期/],
  ["People", peopleRender, /demoPeople|demoRows|usingDemo|虚构演示/],
  ["Identities", identitiesRender, /demoPairs|identityPairs/],
  ["Cold storage", coldStorageRender, /coldStorage|simulate-due-review|模拟一人到期/],
  ["Sources", sourcesRender, /filteredSources|原型分流示例|以下名称全部虚构/],
  ["root render", rootRender, /fixtureSelect|state\.fixture|demoPeople\.length|missedItems|identityPairs|coldStorage\.length/]
]) {
  check(source.length > 0, `T012 missing ${label} production render seam`);
  check(!forbidden.test(source), `T012 ${label} normal runtime still reaches a built-in fixture or demo activator`);
}

check(picker.length > 0, "LP-01 missing local picker error normalization seam");
check(/AbortError:\s*"cancelled"/.test(picker), "LP-01 AbortError must map to cancelled by name");
check(/NotAllowedError:\s*"permission-denied"/.test(picker), "LP-01 NotAllowedError must map to permission-denied by name");
check(!/const code\s*=\s*error\?\.code\s*\|\|/.test(html), "LP-01 numeric DOMException code can win before the error name");
check(/if \(code === "cancelled"\)[\s\S]*?localImportPreview = null;[\s\S]*?return;/.test(picker), "LP-01 cancellation must clear temporary preview and return without a write");
check(!/\$\{typedError\b/.test(html), "LP-01 unknown parser code must not be echoed into the UI");
check(!/localRestorePreview = \{ error: error\.message \}/.test(html), "LP-01 raw error.message must not be rendered");
check(/没有获得目录权限/.test(html) && /在系统窗口允许读取/.test(html), "LP-01 permission guidance is not actionable");
check(/http:\/\/127\.0\.0\.1:8765\/prototype\/index\.html#\/sources/.test(html), "LP-01 unsupported-browser guidance must name the local Chrome entry");

for (const copy of [
  "正在恢复已保存的本机关系库",
  "本机加密库可用",
  "暂时未能打开已保存的本机关系库；数据没有被删除。",
  "重试本机加密库",
  "只有成功打开且关系库确实为空时才显示 0"
]) check(html.includes(copy), `LP-02/T022 missing truthful runtime copy: ${copy}`);
check(!html.includes("未连接微信或碎银 · 没有真实发送 · 刷新会重置"), "LP-02 misleading global reset copy remains");
check(bootstrapSource.length > 0 && /openLocalVault\(\)/.test(bootstrapSource) && !/render\(\)\s*;\s*openLocalVault/.test(html), "T022-O01/O03 bootstrap must start vault open independently of initial render success");
check(/data-action="local-vault-retry"/.test(html), "LP-02 unavailable state lacks a retry action");
check(html.includes('warningCount("senderless-group-context-excluded")') && html.includes("未归人、未保存"), "LP-02 senderless group exclusion warning is not shown as a safe aggregate");
check(html.includes('warningCount("moments-parse-failures-excluded")') && html.includes("来源可能不完整"), "LP-02 moments parse-failure warning is not shown as a safe aggregate");

check(html.includes("analyzeLocalRelationshipGraph"), "T003-UI missing production analysis import");
check(todayAnalysis.length > 0, "T003-UI missing local analysis Today render seam");
for (const copy of [
  "开始本地分析",
  "先到数据来源导入",
  "待确认候选",
  "仅供你内部审查",
  "已在本机生成候选；没有上传或发送",
  "关键维护",
  "轻问候"
]) check(html.includes(copy), `T003-UI missing truthful analysis copy: ${copy}`);
check(/data-action="local-analysis-start"/.test(html), "T003-UI missing start/retry action");
check(/analysisInProgress/.test(html) && /if \(analysisInProgress\) return/.test(html), "T003-UI duplicate starts are not guarded");
check(/analyzeLocalRelationshipGraph\(localVaultStatus\.graph/.test(html), "T003-UI analysis does not use the already-open in-memory graph");
check(/localAnalysisState\s*=\s*\{\s*status:\s*"loading"/.test(html), "T003-UI missing loading state");
check(/status:\s*result\.aggregate\.candidateCount\s*\?\s*"ready"\s*:\s*"empty"/.test(html), "T003-UI missing ready/empty terminal split");
check(/localAnalysisState\s*=\s*\{\s*status:\s*"error"/.test(html), "T003-UI missing retryable error state");
check(/data-page="sources"/.test(todayAnalysis), "T003-UI disabled state must route to Sources");
check(!/commitGraph\(/.test(section(html, "async function runLocalAnalysis", "const demoPeople = [")), "T003-UI analysis path must not commit the graph");
check(/\.queue-panel\s*\{[^}]*grid-template-rows:\s*auto auto auto minmax\(0, 1fr\)/.test(html), "T003-UI C003 queue panel must own four explicit grid rows");
check(/\.queue-scroll\s*\{[^}]*min-height:\s*0/.test(html), "T003-UI C003 queue scroll must be the sole remaining-height region");
check(executableProjectionEvidence?.first?.relationshipLibrary?.rows?.length === 4, "T003-UI C001 People must use the executable local graph projection");
check(!peopleRender.includes("虚构演示：尚无可用本机关系库"), "T012 People absent vault must be an honest empty state, never a demo");
check(!/rows = demoPeople|demoRows|usingDemo/.test(peopleRender), "T012 People must never construct demo fallback rows");
check(!/peopleProjection\?\.aggregate\.peopleCount\s*\|\|\s*demoPeople\.length/.test(html), "T003-UI R3 nav count must preserve a truthful zero rather than fall back to demo");
check(/localVaultStatus\.state\s*===\s*"ready"/.test(peopleRender), "T012 People must distinguish ready (including ready-empty) from unavailable");
check(!/data-person-id=|data-source-id=|data-mapping-id=|data-conversation-id=|data-message-id=/.test(executablePeopleRowEvidence?.confirmed || ""), "T026-O11 production People actions must not publish raw internal identifiers in DOM datasets");
check(/peopleActionTokens\.get\(target\.dataset\.actionToken\)/.test(t026LibraryTodayHandlerSource) && /expectedActiveGenerationId/.test(t026LibraryTodayHandlerSource) && /runLocalAnalysis\(\)/.test(t026LibraryTodayHandlerSource) && /analysisSelectedId/.test(t026LibraryTodayHandlerSource) && !/target\.dataset\.personId/.test(t026LibraryTodayHandlerSource), "T003-UI C002/T026-O11 library click must resolve the exact person through a current-generation opaque action token");
check(/local-analysis-select[\s\S]*?state\.librarySelectedPersonId\s*=\s*null/.test(html), "T003-UI R3 direct candidate selection must clear a prior library-only selection");
check(executablePeopleRowEvidence?.pending?.includes("管理关系标签") && executablePeopleRowEvidence?.pair?.includes("核对跨来源身份") && executablePeopleRowEvidence?.confirmed?.includes("查看今天"), "T003-UI C002 library must preserve direct-label/cross-source/confirmed action boundaries");
check(!Object.values(executablePeopleRowEvidence || {}).filter(value => typeof value === "string").join("").includes("edit-relationships"), "T003-UI C002 must not attach the demo relationship editor to real graph rows");
check(html.includes("mutateRelationshipFacts"), "T013-UI missing production relationship mutation wiring");
check(executablePeopleRowEvidence?.confirmed?.includes('data-action="real-relationship-manage"'), "T013-UI People lacks the real relationship label editor entry");
check(executablePeopleRowEvidence?.pending?.includes("管理关系标签") && executablePeopleRowEvidence?.pending?.includes("尚未添加关系标签"), "T013-UI People lacks truthful real multi-label copy");
for (const action of ["real-relationship-save", "real-relationship-delete"]) {
  check(html.includes(`data-action="${action}"`), `T013-UI missing real relationship action: ${action}`);
}
check(html.includes("接受前不是关系事实"), "T013-UI missing pending relationship-candidate boundary copy");
check(relationshipModalContentSource.length > 0 && realRelationshipMutationSource.length > 0, "T013-UI missing executable relationship modal/mutation sinks");
check(!peopleRender.includes("renderRealRelationshipPanel") && !peopleRender.includes("renderLocalSemanticPanel"), "T016-O09 People must not mount an inline relationship or semantic editor above the long table");
check(!/scrollIntoView\s*\(/.test(html), "T016-O09 relationship management must not scroll the People list to a top editor");

// T014 per-person correction remains available, while T015 supersedes the
// old click-only trigger and makes the same Map available whole-library first.
check(html.includes("analyzeLocalChatSemantics"), "T014-O06 missing production semantic analyzer import/wiring");
check(/localSemanticState\s*=\s*readonlyLocalSemanticMap\(\)/.test(html), "T014-O06/T017-O05 People/Today lack a shared immutable per-person base Map");
check(localSemanticRunnerSource.length > 0, "T014-O01 missing explicit semantic runner seam");
check(localSemanticPanelSource.length > 0, "T014-O06 missing shared semantic panel renderer");
check(/data-action="local-semantic-analyze"/.test(html), "T014-O01 missing exact-person explicit analyze action");
check(personFlowModalSource.includes("renderLocalSemanticPanel") && todayAnalysis.includes("renderLocalSemanticPanel"), "T014-O06 relationship modal and Today must render the same transient semantic panel");
check(!/analyzeLocalChatSemantics\(/.test(peopleRender) && !/analyzeLocalChatSemantics\(/.test(todayAnalysis), "T014-O01 render/navigation must not read semantic bodies");
check(/runLocalSemanticBatch\(["']person-refresh-affected["'][\s\S]*?personIds:\s*\[personId\]/.test(localSemanticRunnerSource), "T014-O01/T017-O05 exact-person retry must delegate to the immutable affected/full batch controller");
check(!/commitGraph\(|fetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/.test(localSemanticRunnerSource), "T014-O08 analyze path may not write or use network capability");
for (const copy of ["分析聊天语义", "已分析聊天语义", "证据不足，请重新导入", "通用问候", "接受前不是关系事实", "我已在外部发送"]) check(html.includes(copy), `T014-UI missing truthful copy: ${copy}`);
for (const action of ["local-semantic-analyze", "local-semantic-accept", "local-semantic-edit-accept", "local-semantic-reject", "local-semantic-copy", "local-semantic-cancel"]) check(html.includes(`data-action="${action}"`), `T014-UI missing action: ${action}`);
check(/local-semantic-accept[\s\S]*?applyRealRelationshipMutation/.test(html), "T014-O09 semantic accept must reuse the existing T013 single-commit sink");
check(!/POISON_T014|matchedTerms|semanticScore/.test(html), "T014-O05 UI source contains a forbidden semantic output field or fictional poison");

// T015 executable UI wiring: automatic full, post-commit affected refresh,
// stale protection, honest progress, shared results and confirmed-only writes.
check(html.includes("createLocalSemanticBatchSnapshot") && html.includes("computeLocalSemanticAffectedPeople"), "T015-O01/O04 missing production whole-library imports");
check(/localSemanticBatchState\s*=\s*\{\s*status:\s*"idle"/.test(html), "T015-O06 missing safe batch progress state");
check(/localSemanticBatchToken\s*=\s*0/.test(html), "T015-O05 missing monotonic stale-run token");
check(localSemanticBatchRunnerSource.length > 0, "T015-O01 missing whole-library batch runner seam");
check(/createLocalSemanticBatchSnapshot\(activeGraph/.test(localSemanticBatchRunnerSource), "T015-O01 batch runner must use one prebuilt graph snapshot");
check(/capturedToken\s*!==\s*localSemanticBatchToken|localVaultStatus\.activeGenerationId\s*!==\s*activeGenerationId/.test(localSemanticBatchRunnerSource), "T015-O05/T017-O06 batch runner lacks token/generation stale discard");
check(/slice\([^)]*20/.test(localSemanticBatchRunnerSource) && /window\.setTimeout\(resolve,\s*0\)/.test(localSemanticBatchRunnerSource), "T015-O01 batch queue must be bounded and yield between chunks");
check(/refreshLocalRelationshipAnalysis\(\)/.test(localSemanticBatchRunnerSource), "T015-O07 current batch completion must rerun Today on the latest graph");
check(!/commitGraph\(|fetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|showDirectoryPicker/.test(localSemanticBatchRunnerSource), "T015-O08/O09 batch analysis path may not write, read an export, or use network capability");
check(/openLocalVault[\s\S]*?semanticCache\?\.status\s*===\s*["']hit["'][\s\S]*?installLocalSemanticCacheHit[\s\S]*?else if[\s\S]*?runLocalSemanticBatch/.test(html), "T015-O02/T017-O02 vault ready must hydrate a hit and schedule full only on miss");
check(/confirmLocalImport[\s\S]*?await commitGraph[\s\S]*?wechat-import-affected[\s\S]*?scheduleLocalSemanticRefresh/.test(html), "T015-O03 successful WeChat commit must schedule affected refresh");
check(/confirmSuiyinImport[\s\S]*?await commitGraph[\s\S]*?suiyin-merge-affected[\s\S]*?scheduleLocalSemanticRefresh/.test(html), "T015-O03 successful Suiyin commit must schedule affected refresh");
check(/data-action="local-semantic-refresh-all"/.test(html) && /action === "local-semantic-refresh-all"[\s\S]*?manual-refresh-full/.test(html), "T015-O06 missing executable manual refresh-all action");
check(localSemanticBatchStatusSource.length > 0 && /processed/.test(localSemanticBatchStatusSource) && /total/.test(localSemanticBatchStatusSource) && /reimportRequired/.test(localSemanticBatchStatusSource) && /重新分析全部/.test(localSemanticBatchStatusSource), "T015-O06 batch status must render real progress and classifications");
check(todayRender.includes("renderLocalSemanticBatchStatus") && peopleRender.includes("renderLocalSemanticBatchStatus"), "T015-O06 Today and People must share the public batch status");
check(/identityState\s*===\s*"unconfirmed"/.test(localSemanticPanelSource) && /acceptAllowed/.test(localSemanticPanelSource) && /contactAllowed/.test(localSemanticPanelSource), "T015-O01 pending source-scoped results need explicit disabled authority");
check(/local-contact-prepare[\s\S]{0,700}?confirmedLocalCandidate/.test(html) && /contactAllowed/.test(section(html, 'action === "local-contact-prepare"', 'action === "local-contact-cancel"')), "T015-O08 pending semantic drafts must not bypass confirmed-only contact preparation");

// T017 focused RED/GREEN contract: the signed cache APIs are source-visible so
// this fails for the real pre-cache product, before any browser harness runs.
for (const api of [
  "loadActiveGraphWithSemanticCache",
  "buildLocalSemanticCachePayload",
  "commitLocalSemanticCache",
  "validateLocalSemanticCachePayload",
  "hydrateLocalSemanticCache"
]) check(html.includes(api), `T017-O01/O02 missing signed semantic-cache API wiring: ${api}`);
check(localVaultOpenSource.length > 0, "T017-O02 missing cache-first vault-open controller seam");
check(localSemanticCacheHitSource.length > 0 && !/createLocalSemanticBatchSnapshot|analyzeLocalChatSemantics|runLocalSemanticBatch|commitLocalSemanticCache|fetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/.test(localSemanticCacheHitSource), "T017-O02 cache-hit installer must hydrate without snapshot, analyzer, cache write, or network capability");
check(/loadActiveGraphWithSemanticCache\(/.test(localVaultOpenSource), "T017-O02 vault ready must load graph, exact generation and encrypted cache together");
check(/semanticCache\?\.status\s*===\s*["']hit["']|semanticCache\.status\s*===\s*["']hit["']/.test(localVaultOpenSource), "T017-O02 valid same-generation cache hit must have an explicit hydrate branch");
check(/installLocalSemanticCacheHit\(loaded\)/.test(localVaultOpenSource) && /reason:\s*["']vault-cache-hit["']/.test(html), "T017-O02 cache hit must install the signed vault-cache-hit status");
check(!/vault-ready-full/.test(localVaultOpenSource), "T017-O02 vault open must not keep the old unconditional vault-ready-full path");
check(/cache-miss-full|cache-invalid-full|algorithm-upgrade-full/.test(localVaultOpenSource) && /runLocalSemanticBatch/.test(localVaultOpenSource), "T017-O03 only a fixed cache miss/invalid/upgrade reason may schedule the initial full run");
check(/localSemanticDraftOverlay\s*=\s*new Map\(\)/.test(html), "T017-O05 draft edits need an independent session-only overlay");
check(/localSemanticRejectedOverlay\s*=\s*new Map\(\)/.test(html), "T017-O05 candidate rejection needs an independent session-only overlay");
check(/localSemanticDismissedOverlay\s*=\s*new Set\(\)/.test(html), "T017-O05 cancel/dismiss needs an independent session-only overlay");
check(!/localSemanticState\.set\([^\n]+draft:/.test(html), "T017-O05 textarea edits must not mutate the immutable analyzer base Map");
check(!/localSemanticState\.delete\(/.test(html), "T017-O05 reject/cancel must not delete immutable analyzer base entries");
check(/analyzeForCache\(/.test(localSemanticBatchRunnerSource) && /buildLocalSemanticCachePayload\(/.test(localSemanticBatchRunnerSource) && /commitLocalSemanticCache\(/.test(localSemanticBatchRunnerSource), "T017-O04/O06 terminal batches must persist one strict candidate built from immutable analyzeForCache results");
check(/action === ["']local-semantic-refresh-all["'][\s\S]{0,260}?clearLocalSemanticOverlays\(\)[\s\S]{0,180}?clearLocalSemanticComputedBase\(\)[\s\S]{0,220}?manual-refresh-full/.test(html), "T017-O09/O10 manual refresh-all must clear immutable session results and overlays before forcing a real full run");
for (const copy of [
  "已恢复上次本机分析结果",
  "本机分析缓存缺失，正在完成首次分析",
  "已有结果已过期，正在按当前数据重新分析",
  "本次分析已完成，但未保存；下次打开需重新分析",
  "数据已保存；分析缓存未更新，可重试"
]) check(html.includes(copy), `T017-O02/O03/O08 missing truthful cache status copy: ${copy}`);

if (localVaultOpenSource.length > 0 && vaultStartupSource.length === 0) {
  try {
    const runOpenCase = async loaded => {
      const events = { installs: 0, refreshes: 0, batches: [] };
      const harness = Function("loaded", "events", "openSource", `
        let localVaultStatus = { state: "checking", graph: null, activeGenerationId: null };
        let localSafetySnapshot = null;
        let localSemanticCoverageGraph = null;
        let localSemanticCoverageGenerationId = null;
        let localSemanticCoveragePersonIds = new Set();
        let localSemanticBatchState = null;
        const resetLocalAnalysis = () => {};
        const render = () => {};
        const createIndexedDbVaultAdapter = async () => ({ getOrCreateKey: async () => ({}), readState: async () => ({ snapshots: [] }) });
        const loadActiveGraphWithSemanticCache = async () => loaded;
        const cleanupExpiredSnapshots = async () => null;
        const installLocalSemanticCacheHit = () => { events.installs += 1; };
        const refreshLocalRelationshipAnalysis = () => { events.refreshes += 1; };
        const activeLocalSemanticPersonIds = graph => (graph?.people || []).filter(person => person?.id && person.state !== "trashed" && !(graph?.purgedPersonIds || []).includes(person.id)).map(person => person.id);
        const runLocalSemanticBatch = (reason, options) => { events.batches.push({ reason, options }); return Promise.resolve({ ok: true }); };
        eval(openSource);
        return { run: openLocalVault, status: () => localVaultStatus, batchState: () => localSemanticBatchState };
      `)(loaded, events, localVaultOpenSource);
      await harness.run();
      return { events, status: harness.status(), batchState: harness.batchState() };
    };
    const graph = { people: [{ id: "fictional-cache-person", state: "active" }], purgedPersonIds: [] };
    const hit = await runOpenCase({ graph, activeGenerationId: "fictional-generation", semanticCache: { status: "hit", reason: "vault-cache-hit", baseResults: new Map(), payload: { schemaVersion: 1, algorithmVersion: "local-semantic-v1", entries: [] } } });
    check(hit.events.installs === 1 && hit.events.refreshes === 1 && hit.events.batches.length === 0, "T017-O02 executable valid cache hit must hydrate and refresh Today with zero full scheduler calls");
    check(hit.status.state === "ready" && hit.status.activeGenerationId === "fictional-generation", "T017-O02 executable cache hit must retain the exact active generation");
    const miss = await runOpenCase({ graph, activeGenerationId: "fictional-generation", semanticCache: { status: "miss", reason: "cache-miss-full", baseResults: null, payload: null } });
    check(miss.events.installs === 0 && miss.events.batches.length === 1 && miss.events.batches[0].reason === "cache-miss-full" && miss.events.batches[0].options.mode === "full", "T017-O03 executable cache miss must schedule exactly one real full run");
    const invalid = await runOpenCase({ graph, activeGenerationId: "fictional-generation", semanticCache: { status: "miss", reason: "algorithm-upgrade-full", baseResults: null, payload: null } });
    check(invalid.events.batches.length === 1 && invalid.events.batches[0].reason === "algorithm-upgrade-full", "T017-O03 executable algorithm drift must preserve its fixed full-run reason");
    const empty = await runOpenCase({ graph: { people: [], purgedPersonIds: [] }, activeGenerationId: "fictional-empty-generation", semanticCache: { status: "miss", reason: "cache-miss-full", baseResults: null, payload: null } });
    check(empty.events.batches.length === 0 && empty.batchState?.status === "ready" && empty.batchState?.coverageTotal === 0, "T017-O02 executable empty graph must stay truthful zero without starting the analyzer");
  } catch (error) {
    failures.push(`T017-O02/O03 executable cache-first open Oracle failed: ${error?.message || error}`);
  }
}

// T016/T020 real cross-source review and in-place relationship flow. Exact
// singles are relationship-manageable in People/Today and never enter this page.
check(sourceBadgeSource.length > 0 && /sourceBadges/.test(sourceBadgeSource), "T016-O02 missing safe source-badge renderer");
check(executablePeopleRowEvidence?.pair?.includes("我的微信") && executablePeopleRowEvidence?.pair?.includes("碎银 · 2号") && !t023TableRowSource.includes("renderSourceBadges"), "T016-O02/T027-O03 People must show independent collection locations while account source badges remain off the row");
check(identityPairCardSource.includes("sourceBadges"), "T016-O02 cross-source cards must display projected real source badges");
check(!/sourceId|sourcePersonId|clientId|conversationId|rawId/.test(sourceBadgeSource), "T016-O12 source badge renderer may not consume or expose raw identifiers");
check(identityPairCardSource.length > 0 && /item\.sides/.test(identityPairCardSource) && /reviewGroupId/.test(identityPairCardSource), "T020-O02 cross-source card must consume only safe group sides and its opaque reviewGroupId");
check(personFlowModalSource.includes('data-action="person-flow-separate-pair"') && personFlowModalSource.includes('data-action="person-flow-merge-pair"') && personFlowModalSource.includes("保持为两个人") && personFlowModalSource.includes("确认是同一个人"), "T016-O04 pair modal lacks explicit merge/separate intents");
check(/item\.status\s*!==\s*"pending"[\s\S]*?查看或撤销决定/.test(identityPairCardSource), "T016-O05 decided pair must show its real state and only a review/undo entry");
check(identityPairCardSource.includes("核对跨来源身份") && !/data-intent=/.test(identityPairCardSource) && !/>保持为两个人<\/button>|>确认是同一个人<\/button>/.test(identityPairCardSource), "T016-O04 pending pair list card must use one neutral modal entry and reserve final decisions for the modal");
check(/data-action="person-flow-open-relationship"/.test(executablePeopleRowEvidence?.pending || "") && /data-action="person-flow-open-pair"/.test(executablePeopleRowEvidence?.pair || "") && !/local-library-open-today[^>]*>确认这个身份/.test(executablePeopleRowEvidence?.confirmed || ""), "T018-O04 People must open relationship labels for singles and identity review only for pairs");
check(personFlowMarkup.length > 0 && /role="dialog"/.test(personFlowMarkup) && /aria-modal="true"/.test(personFlowMarkup), "T016-O07 missing dedicated accessible identity/relationship modal");
check(personFlowOpenSource.length > 0 && /window\.location\.hash/.test(personFlowOpenSource) && /scrollTop/.test(personFlowOpenSource) && /document\.activeElement/.test(personFlowOpenSource), "T016-O07 modal open must snapshot route, scroll, and trigger focus");
check(/appShell\.inert\s*=\s*true/.test(personFlowOpenSource) && /person-flow-open/.test(personFlowOpenSource), "T016-O07 modal open must lock the background");
check(!/state\.page\s*=|window\.location\.hash\s*=|scrollIntoView/.test(personFlowOpenSource), "T016-O07 modal open must not navigate or move the list");
check(personFlowCloseSource.length > 0 && /scrollTop\s*=/.test(personFlowCloseSource) && /\.focus\(/.test(personFlowCloseSource), "T016-O07 close/ESC must restore list scroll and trigger focus");
check(/appShell\.inert\s*=\s*false/.test(personFlowCloseSource) && /person-flow-open/.test(personFlowCloseSource), "T016-O07 modal close must unlock the background");
check(/const returnPage\s*=/.test(personFlowCloseSource) && /const returnHash\s*=/.test(personFlowCloseSource) && /history\.replaceState/.test(personFlowCloseSource), "T016-O07 modal close must restore its captured route if browser history drifted while open");
check(personFlowCommitSource.length > 0 && /await commitGraph/.test(personFlowCommitSource), "T016-O07 cross-source decision lacks a current-graph atomic commit seam");
check(/phase:\s*"relationship"/.test(personFlowCommitSource) && /await refreshAfterCommittedBusiness/.test(personFlowCommitSource), "T016-O08 merge success must stay in the same modal and await the terminal-owning T015 affected refresh");
check((personFlowCommitSource.match(/if \(!refreshResult\?\.ok\)/g) || []).length === 2, "T016-E5-F002 merge and separate/undo paths must treat resolved non-ok semantic refreshes as post-commit failures");
check(/if \(decision === "separated" \|\| decision === "undone"\)[\s\S]{0,900}?phase:\s*"identity"[\s\S]{0,500}?pair:\s*refreshedPair/.test(personFlowCommitSource), "T016-O05 separation success must show the decided pair in place and must not enter an empty relationship phase");
check(/data-action="person-flow-undo-pair"/.test(personFlowModalSource) && /action === "person-flow-undo-pair"[\s\S]{0,180}?commitPersonIdentity\("undone"\)/.test(html), "T016-O05 decided pair lacks an executable undo action");
check(!/mutateRelationshipFacts/.test(personFlowCommitSource), "T016-O10 identity confirmation must not write a relationship label");
check(personFlowModalSource.includes("renderRelationshipModalContent") && personFlowModalSource.includes("renderLocalSemanticPanel"), "T016-O08 relationship phase must reuse saved labels and the current whole-library semantic Map");
check(personFlowModalSource.includes("跨来源决定已保存，但聊天分析刷新失败；请重试分析") && personFlowModalSource.includes("跨来源身份决定已保存，但聊天分析刷新失败；请重试分析"), "T016-E4-F002 modal copy must distinguish a post-commit analysis refresh failure from a write failure");
check(/currentLocalSemanticEntry/.test(localSemanticPanelSource) && /acceptAllowed/.test(localSemanticPanelSource), "T016-O08 relationship modal must reject stale or unconfirmed semantic acceptance");
check(/action === "person-flow-open-relationship" \|\| action === "real-relationship-manage"[\s\S]{0,1600}?openPersonFlow/.test(html), "T016-O09 Manage relationship labels must open the same modal directly");
check(!/action === "real-relationship-manage"[\s\S]{0,700}?(?:renderPeople|scrollIntoView)/.test(html), "T016-O09 Manage relationship labels must not rerender/scroll to a top editor");
check(executablePeopleRowEvidence?.pairToken?.reviewGroupId === "fictional-review-group-current", "T020-O04 People cross-source actions must carry an opaque review group token");
check(rootRender.includes("syncPersonFlowDialog"), "T016-O08 whole-library progress rerenders must keep the active modal synchronized");
check(/const activeDialog\s*=\s*!dialogBackdrop\.hidden\s*\?\s*dialogBackdrop\s*:\s*!personFlowBackdrop\.hidden\s*\?\s*personFlowBackdrop/.test(html), "T016-O07 focus trap and Escape handling must include the person modal while preserving nested confirmations");
check(!/sourceId|sourcePersonId|clientId|conversationId|matchedTerms|semanticScore/.test(personFlowModalSource), "T016-O12 person modal may not render raw provenance, chat matches, or scores");

// T018/T020 preview: a proven single-source person goes straight to the shared
// relationship modal. Identity reconciliation remains only for real
// cross-source pairs or ambiguity, and the first label is one atomic commit.
check(html.includes("projectRelationshipAuthority") && html.includes("mutateSingleSourceRelationship"), "T018-O03/O06 missing single-source relationship authority and atomic mutation wiring");
check(executablePeopleRowEvidence?.pending?.includes("管理关系标签") && executablePeopleRowEvidence?.pending?.includes('data-action="person-flow-open-relationship"'), "T018-O04 People pending single must open the in-place relationship modal");
check(!Object.values(executablePeopleRowEvidence || {}).filter(value => typeof value === "string").join("").includes(">确认这个身份</button>"), "T018-O04 People must not retain the obsolete single-source identity confirmation button");
check(todayAnalysis.includes("管理关系标签") && todayAnalysis.includes('data-action="local-analysis-open-relationship"'), "T018-O04 Today pending single must open the same relationship modal");
check(!todayAnalysis.includes('data-action="local-analysis-confirm-identity"'), "T018-O04 Today must not perform a separate single-source identity commit");
check(/mutateSingleSourceRelationship/.test(realRelationshipMutationSource) && /await commitGraph/.test(realRelationshipMutationSource), "T018-O06 first label must combine source promotion and relationship fact in one commit sink");
check(/relationship-direct-pending/.test(localSemanticPanelSource) && /contactAllowed/.test(localSemanticPanelSource), "T018-O05 cached whole-library candidates must be accept-enabled for a current single source while contact stays gated");
check(/projectCrossSourceReview/.test(html) && /pendingCount:\s*review\.pendingCount/.test(identityModelSource), "T020-O01/O02 page count must consume only the public cross-source projection");
check(relationshipModalContentSource.includes("首次保存关系标签时会同时建立来源归属；取消不会写入。"), "T020-O04 modal lacks truthful one-step single-source association copy");

// T019/T021 preview: every provable exact single uses one in-place relationship
// action. T021 supersedes the old hash-ordinal badge with the official
// SystemName projection and gives Sources explicit, zero-guess repair actions.
check(!html.includes("来源归属需核对"), "T019-O01 obsolete generic source-review copy must stay retired");
check(!html.includes("来源待补"), "T019-O04/O06 the UI must not collapse known provenance into 来源待补");
check(!Object.values(executablePeopleRowEvidence || {}).filter(value => typeof value === "string").join("").includes("打关系标签") && !todayAnalysis.includes("打关系标签"), "T019-O01 People/Today must use the same 管理关系标签 action label");
check(executablePeopleRowEvidence?.pending?.includes("管理关系标签") && executablePeopleRowEvidence?.unknown?.includes("来源未识别 · 请重导") && executablePeopleRowEvidence?.pair?.includes("核对跨来源身份"), "T019-O01/O03/O06 People must keep direct, pair and unknown boundaries distinct");
check(todayAnalysis.includes("管理关系标签") && todayAnalysis.includes("来源未识别 · 请重导") && todayAnalysis.includes("核对跨来源身份"), "T019-O01/O03/O06 Today must keep direct, pair and unknown boundaries distinct");
check(identityPairCardSource.includes("核对跨来源身份"), "T019-O03 cross-source pairs must retain a dedicated identity-review action");
check(!/碎银\s*·\s*本机\s*\d+号|本机编号只用于区分当前关系库中的碎银人设|本机编号不是后台官方号/.test(html), "T021-O02 product must remove every hash-ordinal/本机N号 promise");
check(html.includes("碎银 · 账号待补") && html.includes("来源冲突 · 请修复") && html.includes("来源未识别 · 请重导"), "T021-O03/O04 shared source projection copy is incomplete");
check(!/SY-|sourceAccountAliases|sourceId|sourcePersonId|mappingId|personId|clientId|rawId/.test(sourceBadgeSource), "T019-O05 badge renderer must consume only scrubbed public badge labels");
check(todayAnalysis.includes("renderSourceBadges(currentProjectedSourceBadges(candidate.personId, candidate.sourceBadges))"), "T019-O05/T027-O09 Today candidates must retain the current projected account badges independently from People collection locations");
check(executablePeopleRowEvidence?.pair?.includes("我的微信") && executablePeopleRowEvidence?.pair?.includes("碎银 · 2号") && todayAnalysis.includes("renderSourceBadges") && personFlowModalSource.includes("renderSourceBadges") && sourcesRender.includes("renderSourceBadges"), "T021-O02/T027-O09 People locations and Today/modal/Sources account badges must coexist without changing the latter surfaces");
check(!/source\.sourceKind\s*===\s*["']wechat-export-toolkit["']\s*\|\|\s*source\.sourceBundleRevision/.test(sourcesRender), "T021-O05/O06 Sources must not keep the independent kind-or-bundle classifier");
check(sourcesRender.includes("设置人设号") && sourcesRender.includes("重新读取碎银") && sourcesRender.includes("重新读取碎银以修复来源"), "T021-O06 Sources lacks explicit account-label setup/re-read/repair actions");
check(/sourceAccountLabelActionTokens|suiyinAccountLabelActionTokens/.test(html), "T021-O06 account-label modal must resolve aliases through an ephemeral in-memory token map");
check(!/data-(?:source-account-alias|mapping-id|person-id)|data-action="suiyin-account-label-open"[^>]*(?:sourceAccountAlias|SY-)|aria-[^=]*=["'][^"']*SY-/.test(sourcesRender), "T021-O06 account-label controls must expose only an ephemeral action token, never aliases or stable graph identifiers");
check(/expectedActiveGenerationId:\s*localVaultStatus\.activeGenerationId/.test(suiyinImportPreviewSource), "T021-O09 Suiyin preview must freeze the current generation decision base");
check(/previous\.expectedActiveGenerationId\s*!==\s*localVaultStatus\.activeGenerationId/.test(suiyinImportConfirmSource) && /commitGraph\([\s\S]*?expectedActiveGenerationId:\s*previous\.expectedActiveGenerationId/.test(suiyinImportConfirmSource), "T021-O09 Suiyin confirm must reject a stale preview and commit with generation CAS");
check(/preserveSemanticCache:\s*true/.test(suiyinAccountLabelSaveSource) && /expectedActiveGenerationId:\s*slot\.decisionBase\?\.generationId/.test(suiyinAccountLabelSaveSource), "T021-O06 account-label save must preserve semantic cache and commit against the displayed generation");
check(suiyinAccountLabelSaveSource.indexOf("slot.decisionBase?.generationId !== localVaultStatus.activeGenerationId") >= 0 && suiyinAccountLabelSaveSource.indexOf("slot.decisionBase?.generationId !== localVaultStatus.activeGenerationId") < suiyinAccountLabelSaveSource.indexOf("mutateSuiyinSourceAccountLabel"), "T021-O06 stale account-label no-op must be rejected before mutation");
check(/returnScrollTop[\s\S]*?renderSources\(\)[\s\S]*?nextActionToken[\s\S]*?focus\(\{\s*preventScroll:\s*true\s*\}\)/.test(suiyinAccountLabelSaveSource) && /sourceIndex:\s*suiyinInventorySource\.sourceIndex[\s\S]*?accountIndex:\s*account\.accountIndex/.test(sourcesRender), "T021-O06 successful account-label save must preserve route/scroll and restore focus through a fresh safe token");

if (sourceBadgeSource.length > 0) {
  try {
    const renderSourceBadges = Function("escapeHtml", `${sourceBadgeSource}; return renderSourceBadges;`)(value => String(value).replace(/[&<>\"']/g, ""));
    const safeBadges = renderSourceBadges([{ kind: "wechat", label: "微信" }, { kind: "suiyin", label: "碎银 · 2号" }, { kind: "suiyin", label: "碎银 · 虚构官方三号" }, { kind: "conflict", label: "来源冲突 · 请修复" }]);
    check(safeBadges.includes("微信") && safeBadges.includes("碎银 · 2号") && safeBadges.includes("碎银 · 虚构官方三号") && safeBadges.includes("来源冲突 · 请修复"), "T021-O02/O03/O04 safe official SystemName/conflict badges must render unchanged");
    const poisonedBadge = renderSourceBadges([{ kind: "suiyin", label: "碎银 · 账号 SY-DEADBEEF" }]);
    check(!poisonedBadge.includes("SY-") && poisonedBadge.includes("来源未识别 · 请重导"), "T019-O05 invalid alias-like public labels must fail closed without entering DOM");
    for (const unsafe of ["碎银 · 虚构*号", "碎银 · li******gg", "碎银 · wxid_private", "碎银 · unknown", "碎银 · 12345678"]) {
      const scrubbed = renderSourceBadges([{ kind: "suiyin", label: unsafe }]);
      check(!scrubbed.includes(unsafe) && scrubbed.includes("来源未识别 · 请重导"), `T021-O04 unsafe legacy SystemName must fail closed: ${unsafe}`);
    }
    check(renderSourceBadges([]).includes("来源未识别 · 请重导"), "T019-O06 empty badge projection must be an explicit reimport state");
  } catch (error) { failures.push(`T019 source badge renderer could not execute: ${error?.message || error}`); }
}

// T024 preview: a WeChat export remains the chat acquisition channel while an
// exact persisted clientWcId link changes only the public account attribution.
// The UI may consume only a safe aggregate repair preview: no source hash or
// SY alias may enter HTML, action tokens, ARIA, toast copy or test evidence.
check(html.includes("projectSuiyinSourceAttributionRepair") && suiyinImportPreviewSource.includes("projectSuiyinSourceAttributionRepair") && suiyinImportPreviewSource.includes("repairPreview"), "T024-O06 preview must retain the shared safe matched-source/person/account aggregate");
check(sourcesRender.includes("聊天采集渠道：") && sourcesRender.includes("source.collectionChannel") && sourcesRender.includes("账号归属："), "T024-O06 Sources must show acquisition channel and account attribution separately");
check(sourcesRender.includes("读取并修复已导入来源") && sourcesRender.includes("repairPreviewMarkup") && t028SuiyinScopeUiSource.includes("只更新当前分配（不是三账号全量）"), "T024-O06/O07 Sources must retain the one-time repair preview while using the T028 partial-scope confirmation copy");
check(suiyinImportConfirmSource.includes("刷新或重开无需再次读取"), "T024-O07 successful repair must promise persisted reopen semantics, not another import");
check(suiyinImportConfirmSource.includes("保持归属待核对") && !suiyinImportConfirmSource.includes("保持微信"), "T025-O01 Suiyin confirm must keep unmatched WeChat mappings pending instead of claiming private WeChat attribution");
check(sourcesRender.includes("repairPreview.matchedSourceCount") && sourcesRender.includes("repairPreview.affectedPeopleCount") && sourcesRender.includes("repairPreview.attributions"), "T024-O06 Sources must render matched imported sources, affected people and official persona groups from the safe repair preview");
check(!sourcesRender.includes("sourceAccountWechatSourceLinks") && !/data-(?:wechat-source|source-account-alias)|data-action=["'][^"']*["'][^>]*(?:wechatSourceId|sourceAccountAlias)/.test(sourcesRender), "T024-O02/O06 Sources rendering must consume only the safe repair aggregate, never source links or aliases");
check(executablePeopleRowEvidence?.confirmed?.includes("我的微信") && !executablePeopleRowEvidence?.confirmed?.includes("碎银 · 2号"), "T024-O04/T027-O01 a WeChat lineage must remain 我的微信 in People even when its independent account attribution is 碎银 · 2号");
check(todayAnalysis.includes("currentProjectedSourceBadges(candidate.personId, candidate.sourceBadges)") && personFlowModalSource.includes("renderSourceBadges(person.sourceBadges)"), "T024-O04/T027-O09 Today/relationship modal must retain their shared projected account attribution");

// T025 focused fictional UI RED/GREEN. No fixture below opens IndexedDB,
// reads a real export, calls MCP/network or writes a real graph. The issued
// baseline must fail because it still renders an unlinked WeChat mapping as
// private WeChat and has no mapping-level editor/undo path.
check(html.includes("projectMappingAccountAttribution") && html.includes("mutateMappingAccountAttribution"), "T025-O03/O04 UI must import the exact mapping attribution projector and mutation exports");
check(t023ProjectionViewModelSource.includes("accountAttributionByPerson") && !t023ProjectionViewModelSource.includes("projectMappingAccountAttribution"), "T025-O01/O08 generation-scoped view model must cache only projected badges/editable mapping indexes and perform zero per-row attribution projections");
check(t025AttributionProjectionSource.length > 0 && /accountAttributionByPerson/.test(t025AttributionProjectionSource) && (t025AttributionProjectionSource.match(/projectMappingAccountAttribution/g) || []).length === 1, "T025-O03 missing single-person current-generation attribution projector");
check(t025AttributionActionSource.includes('data-action="account-attribution-open"') && !/data-(?:mapping|source|person|client|alias)-id|sourceAccountAlias|clientWcId|\bSY-[0-9A-F]{8}\b/.test(t025AttributionActionSource), "T025-O03/O10 attribution actions must expose only an opaque action token and safe copy");
check(t025AttributionReviewSource.includes("微信导出 · 归属待核对") && t025AttributionReviewSource.includes("逐人") && t025AttributionReviewSource.includes("1 人"), "T025-O01/O11 People attribution status must be honest and keep correction mapping-level");
check(t023TableRowSource.includes("renderAccountAttributionAction") && todayAnalysis.includes("renderAccountAttributionAction") && relationshipModalContentSource.includes("renderAccountAttributionAction"), "T025-O03 People/Today/relationship modal must expose the same per-person attribution editor");
check(sourcesRender.includes('data-action="account-attribution-open-people"') && sourcesRender.includes("归属待核对") && !sourcesRender.includes("mutateMappingAccountAttribution"), "T025-O11 Sources must only navigate to People for mapping-level review and never bulk-write");
check(t025AttributionEditorSource.includes("私人微信") && t025AttributionEditorSource.includes("碎银 · ") && t025AttributionEditorSource.includes("仅修改当前人物（1人）") && t025AttributionEditorSource.includes('data-option-index='), "T025-O03 editor must contain only private WeChat plus safe official persona options and the fixed one-person preview");
check(t025AttributionEditorSource.includes('data-action="account-attribution-undo"') && t025AttributionEditorSource.includes("原归属未改变") && t025AttributionEditorSource.includes("重新打开"), "T025-O05 editor must expose undo and truthful stale/failure recovery copy");
check(t025AttributionCommitSource.includes("mutateMappingAccountAttribution") && t025AttributionCommitSource.includes("expectedActiveGenerationId") && t025AttributionCommitSource.includes("currentActiveGenerationId") && t025AttributionCommitSource.includes("await commitGraph"), "T025-O04/O05 save/undo must use the exact current-generation mutation and atomic commit seam");
check(!/refreshAfterCommittedBusiness|runLocalSemanticBatch|analyzeLocalChatSemantics|analyzeLocalRelationshipGraph/.test(t025AttributionCommitSource), "T025-O08 attribution save/undo must not invoke either analyzer or semantic refresh");
check(!/sourceAccountAlias|clientWcId|sourcePersonId|data-(?:mapping|source|person|client|alias)-id|\bSY-[0-9A-F]{8}\b/.test(t025AttributionEditorSource + t025AttributionCommitSource), "T025-O10 editor DOM, errors and commit controller must not expose raw identifiers or aliases");

if (t025AttributionProjectionSource.length > 0) {
  try {
    let projectionCalls = 0;
    const accountAttributionActionTokens = new Map([["fictional-token", { personId: "fictional-person", expectedActiveGenerationId: "fictional-generation" }]]);
    const peopleActionTokens = new Map();
    const getLocalProjectionViewModel = () => ({ accountAttributionByPerson: new Map([["fictional-person", { mappingId: "fictional-mapping" }]]) });
    const projectMappingAccountAttribution = (_graph, { mappingId }) => {
      projectionCalls += 1;
      return { state: "pending", currentLabel: "微信导出 · 归属待核对", options: [{ optionIndex: 0, label: "私人微信" }], canEdit: true, canUndo: false, formalWriteCount: 0, marker: mappingId };
    };
    const currentMappingAccountAttribution = Function("accountAttributionActionTokens", "peopleActionTokens", "getLocalProjectionViewModel", "projectMappingAccountAttribution", `${t025AttributionProjectionSource}; return currentMappingAccountAttribution;`)(accountAttributionActionTokens, peopleActionTokens, getLocalProjectionViewModel, projectMappingAccountAttribution);
    const projected = currentMappingAccountAttribution("fictional-token", { state: "ready", graph: {}, activeGenerationId: "fictional-generation" });
    check(projected.projection.marker === "fictional-mapping" && projectionCalls === 1, `T025-O03/O08 opening one editor must project exactly one current mapping, got ${projectionCalls}`);
    check((() => { try { currentMappingAccountAttribution("stale-token", { state: "ready", graph: {}, activeGenerationId: "fictional-generation" }); return false; } catch (error) { return error?.code === "ACCOUNT_ATTRIBUTION_STALE"; } })(), "T025-O05 stale opaque attribution token must fail closed before projection");
    check(projectionCalls === 1, `T025-O05 stale editor open must add zero projection calls, got ${projectionCalls}`);
  } catch (error) {
    failures.push(`T025-O03/O05/O08 executable single-person attribution projector Oracle failed: ${error?.message || error}`);
  }
}

if (sourceBadgeSource.length > 0) {
  try {
    const renderSourceBadges = Function("escapeHtml", `${sourceBadgeSource}; return renderSourceBadges;`)(value => String(value).replace(/[&<>\"']/g, ""));
    const pending = renderSourceBadges([{ kind: "wechat", label: "微信导出 · 归属待核对" }]);
    check(pending.includes("微信导出 · 归属待核对") && !/>微信<\//.test(pending) && !pending.includes("来源未识别 · 请重导"), "T025-O01 unlinked WeChat must render the pending attribution badge instead of private WeChat or reimport");
  } catch (error) {
    failures.push(`T025-O01 executable pending badge Oracle failed: ${error?.message || error}`);
  }
}

// T026 focused fictional UI RED/GREEN. These assertions only inspect and
// execute public rendering seams with code-local labels. They never open the
// real vault, read a chat body, call MCP/network, or commit a relationship.
check(html.includes("projectRelationshipSuggestionIndex"), "T026-O05 UI must import the exact projectRelationshipSuggestionIndex batch export");
check((t023ProjectionViewModelSource.match(/projectRelationshipSuggestionIndex\s*\(/g) || []).length === 1 && /relationshipSuggestionByPerson/.test(t023ProjectionViewModelSource), "T026-O05 generation view model must build exactly one readonly relationship suggestion Map");
check(!/(?:projectRelationshipLibrary|projectSourceIdentityReview|projectCrossSourceReview|projectRelationshipAuthority)\s*\(/.test(t023ProjectionViewModelSource), "T026-O05 generation view model must not retain direct or per-person whole-graph projectors beside the indexed seam");
check(t026SuggestionLookupSource.includes("relationshipSuggestionByPerson") && t026SuggestionLookupSource.includes("getLocalProjectionViewModel") && !/(?:projectRelationship|projectSourceIdentity|projectCrossSource|analyzeLocal|createLocalSemanticBatchSnapshot)\s*\(/.test(t026SuggestionLookupSource), "T026-O06 current suggestion lookup must be a Map-only seam");
check(t026SuggestionCopySource.includes("正在分析聊天") && t026SuggestionCopySource.includes("系统建议：") && t026SuggestionCopySource.includes("暂未判断出关系，可手动补充") && t026SuggestionCopySource.includes("部分旧聊天缺少来源信息；你仍可手动补充"), "T026-O05 UI is missing one or more fixed truthful suggestion states");
check(!html.includes("只有逐人点击“分析聊天语义”才会读取合规直聊正文") && html.includes("整库聊天语义会在本机自动分析合规一对一直聊"), "T026-O05 Today must describe automatic whole-library chat analysis truthfully");
check(t023TableRowSource.includes("renderRelationshipSuggestionSummary") && todayAnalysis.includes("renderRelationshipSuggestionSummary") && relationshipModalContentSource.includes("renderRelationshipSuggestionSummary"), "T026-O05 People, Today and relationship modal must render the shared current suggestion state");
check(t026FactsRenderSource.includes('includes(suggestion?.state)') && t023TableRowSource.includes("renderRelationshipFactsSummary") && todayAnalysis.includes("renderRelationshipFactsSummary"), "T026-O05 loading must precede any empty-fact copy while People and Today keep confirmed facts separate");
check(t023TableRowSource.includes("person.relationshipLabels") && t023TableRowSource.includes("renderRelationshipSuggestionSummary"), "T026-O05 People must keep persisted relationship facts separate from pending suggestions");
check(relationshipModalContentSource.indexOf("renderRelationshipSuggestionSummary") >= 0 && relationshipModalContentSource.indexOf("renderRelationshipSuggestionSummary") < relationshipModalContentSource.indexOf("realRelationshipLabelInput"), "T026-O06 modal must show suggestions before the manual relationship fallback");
check(/\$\{suggestionMarkup\}\$\{semanticPanelMarkup\}<section class="detail-section"><div class="detail-section-title"><h3>手动补充关系/.test(relationshipModalContentSource), "T026-O06 modal must place suggestion chips and supporting semantic state before manual choices");
check(!/(?:projectRelationship|projectSourceIdentity|projectCrossSource|analyzeLocal|createLocalSemanticBatchSnapshot)\s*\(/.test(t023TableRowSource + t026SuggestionRenderSource), "T026-O06 row and suggestion renderers must perform zero analyzer or whole-graph projection calls");
check(!/currentRelationshipAuthority\s*\(/.test(t023TableRowSource + todayAnalysis + relationshipModalContentSource + localSemanticPanelSource + personFlowModalSource), "T026-O06 People/Today/modal render paths must use the generation suggestion Map instead of per-person authority projection");
check(t026AcceptHandlerSource.includes("currentRelationshipSuggestion") && t026AcceptHandlerSource.includes("acceptAllowed") && t026AcceptHandlerSource.includes("suggestedLabels"), "T026-O07/O09 accept must re-check current indexed permission and base suggestion membership");
check(t026EditAcceptHandlerSource.includes("currentRelationshipSuggestion") && t026EditAcceptHandlerSource.includes("acceptAllowed") && t026EditAcceptHandlerSource.includes("suggestedLabels"), "T026-O07/O09 edit-accept must re-check current indexed permission and base suggestion membership");
check(t026ManualSaveHandlerSource.includes("currentRelationshipSuggestion") && t026ManualSaveHandlerSource.includes("manualAddAllowed"), "T026-O07/O09 manual save must re-check current T013/T018 indexed authority");
check(!/applyRealRelationshipMutation|mutateRelationshipFacts|mutateSingleSourceRelationship|commitGraph\s*\(/.test(t026SelectionHandlersSource), "T026-O08 suggestion close/reject selection must perform zero fact writes");
const t026PrivateDomSources = [t023TableRowSource, todayAnalysis, localSemanticPanelSource, relationshipModalContentSource, t026SuggestionRenderSource].join("\n");
check(!/data-(?:person|source|mapping|conversation|message)-id|data-semantic-person(?:-id)?/.test(t026PrivateDomSources), "T026-O11 production People/Today/modal renderers must not publish raw internal IDs in DOM datasets");
check(/resolvePrivatePersonAction\(todayActionTokens, target\.dataset\.actionToken, action\)/.test(t026TodayActionHandlersSource) && !/target\.dataset\.personId/.test(t026TodayActionHandlersSource), "T026-O11 Today actions must resolve people only through current-generation opaque tokens");
check(/resolvePrivatePersonAction\(localSemanticActionTokens, event\.target\.dataset\.actionToken, "local-semantic-draft"\)/.test(peopleInputHandlersSource) && !/dataset\.semanticPersonId/.test(peopleInputHandlersSource), "T026-O11 semantic textarea tracking must resolve its person through an opaque token");
check(/resolvePrivatePersonAction\(localSemanticActionTokens, target\.dataset\.actionToken, action\)/.test(t026SelectionHandlersSource + t026AcceptHandlerSource + t026EditAcceptHandlerSource + t026ManualSaveHandlerSource), "T026-O11 suggestion and manual-save handlers must resolve their private person through the in-memory token Map");

if (t026TodayCandidateCardSource.length > 0 && localSemanticPanelSource.length > 0) {
  try {
    const fictionalPersonId = "t026-private-person-do-not-expose";
    const candidateHarness = new Function("personId", `
      const state = { analysisSelectedId: null };
      const reasonClass = { "轻问候": "is-light" };
      const todayActionTokens = new Map();
      let sequence = 0;
      const createPrivatePersonActionToken = (collection, privatePersonId, surface, allowedActions) => {
        const token = "opaque-today-action-" + (++sequence);
        collection.set(token, { personId: privatePersonId, surface, allowedActions });
        return token;
      };
      const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, "");
      const publicRelationshipStatus = () => "关系可管理";
      const currentProjectedSourceBadges = (_personId, badges) => badges;
      const renderSourceBadges = badges => (badges || []).map(item => '<span class="source-badge">' + escapeHtml(item.label) + '</span>').join("");
      ${t026TodayCandidateCardSource}
      const markup = localAnalysisCandidateCard({ personId, displayName: "纯虚构候选", lastActivityDate: "2026-08-19", excerptCount: 3, signalCount: 1, sourceBadges: [{ kind: "suiyin", label: "碎银 · 2号" }], reasons: [{ label: "轻问候", summary: "纯虚构安全摘要" }] });
      return { markup, tokens: [...todayActionTokens.values()] };
    `)(fictionalPersonId);
    check(candidateHarness.markup.includes('data-action-token="opaque-today-action-1"') && !candidateHarness.markup.includes(fictionalPersonId) && candidateHarness.tokens[0]?.personId === fictionalPersonId, "T026-O11 executable Today candidate must keep the private personId only in the in-memory token Map");

    const semanticHarness = new Function("personId", `
      const localSemanticDismissedOverlay = new Set();
      const localSemanticRejectedOverlay = new Map();
      const localSemanticDraftOverlay = new Map();
      const localSemanticActionTokens = new Map();
      const localVaultStatus = { state: "ready", activeGenerationId: "fictional-generation", graph: { people: [{ id: personId, name: "纯虚构人物" }] } };
      const suggestion = Object.freeze({ state: "suggested", currentLabels: Object.freeze([]), suggestedLabels: Object.freeze(["客户"]), acceptAllowed: true, manualAddAllowed: true });
      const semanticResult = Object.freeze({ identityState: "confirmed", contactAllowed: true, candidates: Object.freeze([{ label: "客户" }]), safeAngle: "通用问候", draft: "纯虚构安全草稿" });
      const currentLocalSemanticEntry = requestedId => requestedId === personId ? { status: "ready", result: semanticResult, error: null } : null;
      const getLocalProjectionViewModel = () => ({ rowByPerson: new Map([[personId, { boundary: "confirmed" }]]), relationshipSuggestionByPerson: new Map([[personId, suggestion]]), singleByPerson: new Map() });
      let sequence = 0;
      const createPrivatePersonActionToken = (collection, privatePersonId, surface, allowedActions) => {
        const token = "opaque-semantic-action-" + (++sequence);
        collection.set(token, { personId: privatePersonId, surface, allowedActions });
        return token;
      };
      const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, "");
      ${localSemanticPanelSource}
      const today = renderLocalSemanticPanel(personId, "today");
      const modal = renderLocalSemanticPanel(personId, "modal");
      return { today, modal, tokens: [...localSemanticActionTokens.values()] };
    `)(fictionalPersonId);
    const semanticMarkup = semanticHarness.today + semanticHarness.modal;
    const semanticInteractiveTags = semanticMarkup.match(/<(?:button|textarea)\b[^>]*(?:data-action=|id="localSemanticDraft")[^>]*>/g) || [];
    check(!semanticMarkup.includes(fictionalPersonId) && !/data-(?:person|source|mapping|conversation|message)-id|data-semantic-person(?:-id)?/.test(semanticMarkup), "T026-O11 executable Today/modal semantic panels must not render the private personId or any raw-ID dataset");
    check(semanticInteractiveTags.length > 0 && semanticInteractiveTags.every(tag => /data-action-token="opaque-semantic-action-\d+"/.test(tag)) && semanticHarness.tokens.every(item => item.personId === fictionalPersonId), "T026-O11 every executable semantic action and textarea must carry an opaque token backed by the private in-memory Map");
  } catch (error) {
    failures.push(`T026-O11 executable opaque-action rendering Oracle failed: ${error?.message || error}`);
  }
}

if (t026SuggestionCopySource.length > 0 && t026SuggestionRenderSource.length > 0) {
  try {
    const escape = value => String(value).replace(/[&<>\"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" })[character]);
    const suggestionUi = Function("escapeHtml", `${t026SuggestionCopySource}\n${t026SuggestionRenderSource}\nreturn { relationshipSuggestionCopy, renderRelationshipFactsSummary, renderRelationshipSuggestionSummary };`)(escape);
    const suggested = Object.freeze({ state: "suggested", currentLabels: Object.freeze([]), suggestedLabels: Object.freeze(["客户", "合作伙伴"]), acceptAllowed: true, manualAddAllowed: true });
    const loading = Object.freeze({ state: "loading", currentLabels: Object.freeze([]), suggestedLabels: Object.freeze([]), acceptAllowed: false, manualAddAllowed: false });
    const manual = Object.freeze({ state: "manual-needed", currentLabels: Object.freeze([]), suggestedLabels: Object.freeze([]), acceptAllowed: false, manualAddAllowed: true });
    const reimport = Object.freeze({ state: "reimport-required", currentLabels: Object.freeze([]), suggestedLabels: Object.freeze([]), acceptAllowed: false, manualAddAllowed: true });
    check(suggestionUi.relationshipSuggestionCopy(suggested) === "系统建议：客户、合作伙伴 · 待你确认", "T026-O05 suggested copy must remain exact and must not claim a fact");
    check(suggestionUi.relationshipSuggestionCopy(loading) === "正在分析聊天", "T026-O05 loading copy must not masquerade as an empty relationship");
    check(suggestionUi.relationshipSuggestionCopy(manual) === "暂未判断出关系，可手动补充", "T026-O05 manual fallback copy changed");
    check(suggestionUi.relationshipSuggestionCopy(reimport) === "部分旧聊天缺少来源信息；你仍可手动补充", "T026-O05 reimport copy changed");
    check(suggestionUi.renderRelationshipFactsSummary(loading, { surface: "people" }) === "" && suggestionUi.renderRelationshipFactsSummary(manual, { surface: "people" }).includes("尚未添加关系标签"), "T026-O05 loading must not masquerade as an empty saved relationship");
    const suggestedModal = suggestionUi.renderRelationshipSuggestionSummary(suggested, { surface: "modal", candidateIndexByLabel: new Map([["客户", 0], ["合作伙伴", 1]]), actionToken: "opaque-modal-action" });
    const blockedModal = suggestionUi.renderRelationshipSuggestionSummary({ ...suggested, acceptAllowed: false }, { surface: "modal", candidateIndexByLabel: new Map([["客户", 0], ["合作伙伴", 1]]), actionToken: "opaque-modal-action" });
    const manualModal = suggestionUi.renderRelationshipSuggestionSummary(manual, { surface: "modal" });
    check(suggestedModal.includes("系统关系建议") && suggestedModal.includes("接受前不是关系事实") && suggestedModal.includes('data-action="local-semantic-accept"') && suggestedModal.includes('data-action="local-semantic-edit-accept"') && suggestedModal.includes('data-action="local-semantic-reject"'), "T026-O06 modal must render suggestion-first explicit controls");
    check((suggestedModal.match(/data-action-token="opaque-modal-action"/g) || []).length === suggested.suggestedLabels.length * 3, "T026-O11 every executable suggestion choice must carry the opaque modal token");
    check(/data-action="local-semantic-accept"[^>]*disabled/.test(blockedModal) && /data-action="local-semantic-edit-accept"[^>]*disabled/.test(blockedModal), "T026-O07 suggested controls must stay disabled without current authority");
    check(!/local-semantic-(?:accept|edit-accept|reject)/.test(manualModal), "T026-O07 manual-needed state must not invent suggestion controls");
    const fictionalPersonId = "t026-modal-private-person-do-not-expose";
    const fictionalRelationshipId = "t026-modal-private-relationship-do-not-expose";
    const modalHarness = new Function("escapeHtml", "renderRelationshipSuggestionSummary", "personId", "relationshipId", `
      const localVaultStatus = { activeGenerationId: "fictional-generation" };
      const projection = { relationshipSuggestionByPerson: new Map([[personId, { state: "suggested", currentLabels: ["朋友"], suggestedLabels: ["客户"], acceptAllowed: true, manualAddAllowed: true }]]), singleByPerson: new Map([[personId, { directRelationshipAllowed: true }]]) };
      const getLocalProjectionViewModel = () => projection;
      const renderAccountAttributionAction = () => '<button data-action="account-attribution-open" data-action-token="opaque-attribution-action">核对账号归属</button>';
      let relationshipActionTokens = new Map();
      let localSemanticActionTokens = new Map();
      let sequence = 0;
      const createViewActionToken = (collection, payload, prefix) => { const token = "opaque-" + prefix + "-" + (++sequence); collection.set(token, payload); return token; };
      const createPrivatePersonActionToken = (collection, privatePersonId, surface, allowedActions) => { const token = "opaque-modal-private-action"; collection.set(token, { personId: privatePersonId, surface, allowedActions }); return token; };
      const realRelationshipState = { status: "idle", saving: false };
      const currentLocalSemanticEntry = requestedId => requestedId === personId ? { result: { candidates: [{ label: "客户" }] } } : null;
      const RELATIONSHIP_SYSTEM_LABELS = ["朋友", "客户"];
      ${relationshipModalContentSource}
      const graph = { relationships: [{ id: relationshipId, personId, label: "朋友", status: "current", createdAt: "2026-08-19T00:00:00.000Z" }], dictionary: [] };
      return { markup: renderRelationshipModalContent(graph, { personId, boundary: "confirmed" }, '<section data-semantic-surface="modal">纯虚构语义支持</section>'), privateTokens: [...localSemanticActionTokens.values()] };
    `)(escape, suggestionUi.renderRelationshipSuggestionSummary, fictionalPersonId, fictionalRelationshipId);
    check(!modalHarness.markup.includes(fictionalPersonId) && !modalHarness.markup.includes(fictionalRelationshipId) && !/data-(?:person|source|mapping|conversation|message|relationship)-id|data-semantic-person(?:-id)?/.test(modalHarness.markup), "T026-O11 executable relationship modal must not render private person or relationship IDs");
    check(/data-action="real-relationship-save"[^>]*data-action-token="opaque-modal-private-action"/.test(modalHarness.markup) && /data-action="local-semantic-accept"[^>]*data-action-token="opaque-modal-private-action"/.test(modalHarness.markup) && modalHarness.privateTokens[0]?.personId === fictionalPersonId, "T026-O11 modal suggestion/manual actions must resolve through one private in-memory token");
  } catch (error) {
    failures.push(`T026-O05/O06/O07 executable suggestion UI Oracle failed: ${error?.message || error}`);
  }
}

// T020 focused public-UI Oracle. The compatibility hash remains #/identities,
// but the live model, page, count and controls contain cross-source groups only.
check(shellSource.includes('<span class="nav-text">跨来源核对</span>'), "T020-O03 sidebar must be named 跨来源核对");
check(/identities:\s*"跨来源核对"/.test(html), "T020-O03 route label must be named 跨来源核对");
check(identityModelSource.includes("pendingGroups") && identityModelSource.includes("resolvedDecisions") && !/singles|ambiguousCount|\.pairs\b/.test(identityModelSource), "T020-O01 page model must expose pending groups and resolved history, never singles or raw pair arrays");
check(identitiesRender.includes("identityModel.pendingGroups") && identitiesRender.includes("identityModel.resolvedDecisions") && !/identityModel\.singles|id="local-imported-identities"|<h3>单一来源人物<\/h3>/.test(identitiesRender), "T020-O01 identities page must not render any single-source section");
check(identitiesRender.includes("暂无需要核对的跨来源人物") && /data-page="people"[^>]*>查看全部关系<\/button>/.test(identitiesRender), "T020-O03 zero-group page needs the truthful empty state and People CTA");
check(identitiesRender.includes("已处理的跨来源决定"), "T020-O08 resolved decisions need a separate history region");
check(!/person-flow-open-identity|person-flow-confirm-single|local-analysis-confirm-identity/.test(html), "T020-O01/O04 obsolete single identity actions and handlers must be unreachable");
check(!/confirmImportedSourceIdentity|decideImportedIdentity|undoImportedIdentityDecision/.test(html), "T020-O01 obsolete standalone single identity imports must be removed");
check(!/mode\s*===\s*"single"/.test(personFlowModalSource + personFlowCommitSource), "T020-O04 modal and commit sink must not retain a standalone single identity branch");
check(t023ReviewGroupResolverSource.length > 0 && /resolveCurrentReviewGroup\(view\?\.reviewGroupId/.test(html), "T020-O07 cross-source click must re-resolve its opaque group through the executable current-generation resolver");
for (const [surface, source] of [["People", Object.values(executablePeopleRowEvidence || {}).filter(value => typeof value === "string").join("")], ["Today", todayAnalysis], ["direct relationship modal", relationshipModalContentSource]]) {
  check(!/待确认身份|确认身份|身份已确认|确认这个身份|确认此来源身份|确认这个来源身份/.test(source), `T020-O04 ${surface} retains obsolete single identity copy`);
}
check(executablePeopleRowEvidence?.confirmed?.includes("来源已关联") && executablePeopleRowEvidence?.pending?.includes("关系可管理"), "T020-O04 People must expose executable relationship/association status instead of identity state");
check(todayAnalysis.includes("publicRelationshipStatus") && executableProjectionEvidence?.first?.publicStatusByPerson?.get("a-confirmed") === "来源已关联" && executableProjectionEvidence?.first?.publicStatusByPerson?.get("a-pending") === "关系可管理", "T020-O04 Today must consume the executable relationship/association status Map instead of identity state");

if (personFlowOpenSource.length > 0 && personFlowCloseSource.length > 0) {
  try {
    const focusLog = [];
    const bodyClasses = new Set();
    const scroller = { scrollTop: 413 };
    const returnTrigger = { isConnected: true, focus: options => focusLog.push(["return", options]) };
    const modalButton = { focus: options => focusLog.push(["modal", options]) };
    const pageHost = { querySelector: selector => selector === ".standard-page" ? scroller : null, focus: options => focusLog.push(["page", options]) };
    const appShell = { inert: false };
    const personFlowBackdrop = { hidden: true, querySelector: () => modalButton };
    const browserWindow = {
      location: { hash: "#/people", pathname: "/prototype/index.html", search: "" },
      history: { replaceState: () => { throw new Error("stable route must not be rewritten"); } },
      setTimeout: callback => callback(),
      requestAnimationFrame: callback => callback(),
    };
    const browserDocument = {
      activeElement: returnTrigger,
      body: { classList: { add: value => bodyClasses.add(value), remove: value => bodyClasses.delete(value) } },
      querySelector: () => null,
    };
    const createHarness = Function("window", "document", "pageHost", "appShell", "personFlowBackdrop", "syncPersonFlowDialog", `
      const state = { page: "people" };
      const localVaultStatus = { activeGenerationId: "fictional-generation" };
      let personFlowState = { open: false, phase: null, status: "idle", mode: null, personId: null, single: null, pair: null, expectedActiveGenerationId: null, error: null, returnPage: null, returnHash: "", returnScrollTop: 0, returnFocus: null };
      let peopleActionTokens = new Map(), identityActionTokens = new Map();
      const render = () => {};
      ${personFlowOpenSource}
      ${personFlowCloseSource}
      return { openPersonFlow, closePersonFlow, state: () => state, flow: () => personFlowState };
    `);
    const harness = createHarness(browserWindow, browserDocument, pageHost, appShell, personFlowBackdrop, () => { personFlowBackdrop.hidden = false; });
    harness.openPersonFlow({ phase: "relationship", personId: "fictional-person" });
    check(harness.state().page === "people" && browserWindow.location.hash === "#/people", "T016 executable modal open changed the current route");
    check(appShell.inert === true && bodyClasses.has("person-flow-open") && personFlowBackdrop.hidden === false, "T016 executable modal open did not lock/show the dialog");
    scroller.scrollTop = 0;
    harness.closePersonFlow();
    check(scroller.scrollTop === 413 && appShell.inert === false && !bodyClasses.has("person-flow-open"), "T016 executable modal close did not restore scroll/background state");
    check(focusLog.some(([kind]) => kind === "modal") && focusLog.at(-1)?.[0] === "return", "T016 executable modal focus entry/return failed");
  } catch (error) {
    failures.push(`T016 executable in-place modal Oracle failed: ${error?.message || error}`);
  }
}

if (personFlowCommitSource.length > 0) {
  try {
    const createResolvedRefreshHarness = ({ mode, mutation, pair = null }) => {
      const previousGraph = { revision: `fictional-${mode}-before` };
      const toasts = [];
      let commitCount = 0;
      const harness = Function(
        "previousGraph",
        "mode",
        "mutation",
        "pair",
        "toasts",
        "onCommit",
        "commitPersonIdentitySource",
        `
          let personFlowState = {
            open: true,
            phase: "identity",
            status: "idle",
            mode,
            personId: null,
            single: null,
            pair,
            error: null,
          };
          let localVaultStatus = { state: "ready", graph: previousGraph, activeGenerationId: "fictional-generation-before", adapter: {}, key: {} };
          const syncPersonFlowDialog = () => {};
          const mergeImportedIdentityPair = () => mutation;
          const separateImportedIdentityPair = () => mutation;
          const undoImportedIdentityPairDecision = () => mutation;
          const commitGraph = async () => { onCommit(); return "fictional-generation-after"; };
          const resetLocalAnalysis = () => {};
          const projectSourceIdentityReview = () => ({ pairs: pair ? [{ ...pair, status: "separated" }] : [] });
          const render = () => {};
          const refreshAfterCommittedBusiness = async () => ({ ok: false, code: "BATCH_SNAPSHOT_INVALID" });
          const showToast = value => toasts.push(value);
          eval(commitPersonIdentitySource);
          return {
            run: commitPersonIdentity,
            graph: () => localVaultStatus.graph,
            flow: () => ({ ...personFlowState }),
          };
        `
      )(previousGraph, mode, mutation, pair, toasts, () => { commitCount += 1; }, personFlowCommitSource);
      return { harness, toasts, commitCount: () => commitCount };
    };

    const pair = { pairKey: "fictional-pair", status: "pending", left: { personId: "fictional-left" }, right: { personId: "fictional-right" } };
    const mergedGraph = { revision: "fictional-merged-committed" };
    const merged = createResolvedRefreshHarness({
      mode: "pair",
      pair,
      mutation: { graph: mergedGraph, changed: true, formalWriteCount: 1, formalRelationshipWriteCount: 0, personId: "fictional-left", decision: "merged", pairKey: pair.pairKey },
    });
    await merged.harness.run("merged");
    const mergedFlow = merged.harness.flow();
    check(merged.commitCount() === 1 && merged.harness.graph() === mergedGraph, "T016-E5-F002 resolved-failure merge path must retain its one committed graph");
    check(mergedFlow.phase === "relationship" && mergedFlow.status === "ready" && mergedFlow.error === "RELATIONSHIP_REFRESH_FAILED", "T016-E5-F002 resolved-failure merge path must remain in the relationship modal with a truthful error");
    check(merged.toasts.includes("数据已保存；分析缓存未更新，可重试"), "T016-E5-F002/T017-O08 resolved-failure merge toast must report saved business data and retryable cache analysis");

    const separatedGraph = { revision: "fictional-separated-committed" };
    const separated = createResolvedRefreshHarness({
      mode: "pair",
      pair,
      mutation: { graph: separatedGraph, changed: true, formalWriteCount: 1, formalRelationshipWriteCount: 0, personId: null, decision: "separated", pairKey: pair.pairKey },
    });
    await separated.harness.run("separated");
    const separatedFlow = separated.harness.flow();
    check(separated.commitCount() === 1 && separated.harness.graph() === separatedGraph, "T016-E5-F002 resolved-failure separated path must retain its one committed graph");
    check(separatedFlow.phase === "identity" && separatedFlow.status === "idle" && separatedFlow.pair?.status === "separated" && separatedFlow.error === "RELATIONSHIP_REFRESH_FAILED", "T016-E5-F002 resolved-failure separated path must retain the decided pair with a truthful post-commit error");
    check(separated.toasts.includes("数据已保存；分析缓存未更新，可重试"), "T016-E5-F002/T017-O08 resolved-failure separated toast must report saved business data and retryable cache analysis");
  } catch (error) {
    failures.push(`T016-E5-F002 executable resolved refresh Oracle failed: ${error?.message || error}`);
  }
}

if (localSemanticSchedulerSource.length > 0 && localSemanticBatchRunnerSource.length > 0) {
  const fictionalPeople = Array.from({ length: 40 }, (_, index) => ({ id: `t015-race-p${String(index).padStart(2, "0")}`, state: "active" }));
  const oldGraph = { marker: "old", people: fictionalPeople, purgedPersonIds: [] };
  const newGraph = { marker: "new", people: fictionalPeople, purgedPersonIds: [] };
  const newestGraph = { marker: "newest", people: fictionalPeople, purgedPersonIds: [] };
  const initialEntries = fictionalPeople.map(person => [person.id, Object.freeze({ status: "ready", result: Object.freeze({ personId: person.id, state: "ready", candidates: [] }), error: null, inputRevision: "A".repeat(64) })]);
  const yields = [];
  const snapshot = (graph, options = {}) => {
    const ids = Array.isArray(options.personIds) ? options.personIds : graph.people.map(person => person.id);
    return { algorithmVersion: "local-semantic-v1", total: ids.length, personIds: ids, analyzeForCache: personId => Object.freeze({ result: Object.freeze({ personId, state: "ready", code: null, candidates: [], identityState: "confirmed", acceptAllowed: true, contactAllowed: true }), inputRevision: "B".repeat(64) }) };
  };
  const buildPayload = (graph, analyzed, options) => ({ marker: graph.marker, ids: [...analyzed.keys()], mode: options.mode });
  let cacheCommitCount = 0;
  let batchGlobalRenderCount = 0;
  let batchProgressPaintCount = 0;
  const commitCache = async (_adapter, _key, { expectedActiveGenerationId }) => { cacheCommitCount += 1; return { ok: true, changed: true, cacheWriteCount: 1, boundActiveGenerationId: expectedActiveGenerationId }; };
  const controller = new Function("createLocalSemanticBatchSnapshot", "computeLocalSemanticAffectedPeople", "buildLocalSemanticCachePayload", "commitLocalSemanticCache", "loadActiveGraphWithSemanticCache", "window", "render", "refreshLocalRelationshipAnalysis", "localSemanticProgressPainter", "initialGraph", "initialEntries", `
    let localVaultStatus = { state: "ready", graph: initialGraph, activeGenerationId: "generation-old", adapter: {}, key: {} };
    let localSemanticBatchToken = 0;
    let localSemanticBatchState = { status: "idle", processed: 0, total: 0 };
    const readonlyLocalSemanticMap = entries => Object.freeze(new Map(entries));
    const immutableLocalSemanticEntry = (result, inputRevision = null) => Object.freeze({ status: result?.state || "error", result, error: result?.code || null, inputRevision });
    let localSemanticState = readonlyLocalSemanticMap(initialEntries);
    let localSemanticCachePayload = { marker: "old-cache" };
    let localSemanticDraftOverlay = new Map();
    let localSemanticRejectedOverlay = new Map();
    let localSemanticDismissedOverlay = new Set();
    let localSemanticCoverageGraph = initialGraph;
    let localSemanticCoverageGenerationId = "generation-old";
    let localSemanticCoveragePersonIds = new Set(initialGraph.people.map(person => person.id));
    function clearLocalSemanticOverlays(personIds = null) {
      if (personIds === null) { localSemanticDraftOverlay.clear(); localSemanticRejectedOverlay.clear(); localSemanticDismissedOverlay.clear(); return; }
      for (const personId of personIds) { localSemanticDraftOverlay.delete(personId); localSemanticRejectedOverlay.delete(personId); localSemanticDismissedOverlay.delete(personId); }
    }
    function activeLocalSemanticPersonIds(graph) { const purged = new Set(graph.purgedPersonIds || []); return (graph.people || []).filter(person => person?.id && person.state !== "trashed" && person.state !== "purged" && !purged.has(person.id)).map(person => person.id); }
    function countLocalSemanticEntries(entries) { const counts = { ready: 0, generic: 0, empty: 0, reimportRequired: 0, unconfirmed: 0, error: 0 }; for (const entry of entries.values()) { const key = entry.status === "reimport-required" ? "reimportRequired" : entry.status; if (Object.hasOwn(counts, key)) counts[key] += 1; else counts.error += 1; } return counts; }
    ${localSemanticSchedulerSource}
    ${localSemanticBatchRunnerSource}
    return {
      run: runLocalSemanticBatch,
      schedule: scheduleLocalSemanticRefresh,
      setGraph: (graph, generationId) => { localVaultStatus.graph = graph; localVaultStatus.activeGenerationId = generationId; },
      results: () => new Map(localSemanticState),
      batch: () => ({ ...localSemanticBatchState }),
    };
  `)(snapshot, () => ({ mode: "affected", personIds: [fictionalPeople[0].id] }), buildPayload, commitCache, async () => null, { setTimeout: callback => { yields.push(callback); } }, () => { batchGlobalRenderCount += 1; }, () => {}, { progress: () => { batchProgressPaintCount += 1; }, terminal: () => { batchGlobalRenderCount += 1; }, discard: () => {} }, oldGraph, initialEntries);
  const oldFull = controller.run("cache-miss-full", { mode: "full" });
  controller.setGraph(newGraph, "generation-new");
  const imported = controller.schedule(oldGraph, newGraph, "wechat-import-affected");
  for (let index = 0; index < 8; index += 1) {
    while (yields.length) yields.shift()();
    await Promise.resolve();
  }
  await Promise.all([oldFull, imported]);
  check(controller.results().size === fictionalPeople.length, "T015-O05 full-yield then affected import must retain classification for every active person");
  check(cacheCommitCount === 1, "T017-O06 stale old full plus current affected terminal must produce only one cache CAS attempt");
  controller.setGraph(newestGraph, "generation-newest");
  await controller.schedule(newGraph, newestGraph, "wechat-import-affected");
  const incrementalStatus = controller.batch();
  check(incrementalStatus.scope === "affected" && incrementalStatus.coverageProcessed === fictionalPeople.length && incrementalStatus.coverageTotal === fictionalPeople.length, "T015-O06 true incremental status must distinguish affected work from complete whole-library coverage");
  check(cacheCommitCount === 2, "T017-O06 each completed affected run must issue exactly one terminal cache CAS");
  const renderCountBeforeManual = batchGlobalRenderCount;
  const progressCountBeforeManual = batchProgressPaintCount;
  const manualFull = controller.run("manual-refresh-full", { mode: "full" });
  check(batchGlobalRenderCount === renderCountBeforeManual, `T023-O06 running chunk performed ${batchGlobalRenderCount - renderCountBeforeManual} global renders before yielding`);
  for (let index = 0; index < 8; index += 1) {
    while (yields.length) yields.shift()();
    await Promise.resolve();
  }
  const manualResult = await manualFull;
  check(manualResult.ok === true && cacheCommitCount === 3 && controller.batch().scope === "full", "T017-O10 executable manual refresh must run a real full and issue exactly one terminal cache CAS");
  check(batchGlobalRenderCount - renderCountBeforeManual <= 1, `T023-O06 current terminal performed ${batchGlobalRenderCount - renderCountBeforeManual} global renders`);
  check(batchProgressPaintCount > progressCountBeforeManual, "T023-O06 running batch never reached the dedicated progress painter");
}
check(/batch\.scope\s*===\s*"affected"/.test(localSemanticBatchStatusSource) && /增量更新/.test(localSemanticBatchStatusSource) && /coverageProcessed/.test(localSemanticBatchStatusSource), "T015-O06 public copy must not call an affected 1/1 run a whole-library completion");

if (realRelationshipPanelSource.length > 0) {
  const escape = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const createPanel = relationshipState => new Function("escapeHtml", "RELATIONSHIP_SYSTEM_LABELS", "realRelationshipState", `${realRelationshipPanelSource}\nreturn renderRealRelationshipPanel;`)(escape, ["家人", "朋友", "客户"], relationshipState);
  const panelGraph = {
    relationships: [{ id: "fictional-relationship", personId: "fictional-person", label: "朋友", status: "current", createdAt: "2026-08-15T08:00:00.000Z" }],
    dictionary: [{ id: "fictional-dictionary", label: "虚构自定义", status: "active" }],
    excerpts: [{ id: "fictional-excerpt", personId: "fictional-person", text: "POISON_T013_PILOT_BODY" }],
  };
  const panelPerson = { personId: "fictional-person", displayName: "纯虚构人物", boundary: "confirmed" };
  const idlePanel = createPanel({ personId: "fictional-person", status: "idle", candidates: [], error: null, saving: false })(panelGraph, panelPerson);
  check(/朋友/.test(idlePanel) && /real-relationship-save/.test(idlePanel) && /real-relationship-evaluate/.test(idlePanel), "T013 executable idle panel lacks saved fact/manual/evaluator controls");
  const readyPanel = createPanel({ personId: "fictional-person", status: "ready", candidates: [{ label: "客户", status: "pending", evidence: { sourceCategory: "suiyin-mcp", excerptCount: 4, utcDateCount: 2, directions: { self: 2, counterparty: 2 } } }], error: null, saving: false })(panelGraph, panelPerson);
  check(/待你确认；接受前不是关系事实/.test(readyPanel) && /real-relationship-accept/.test(readyPanel) && /real-relationship-edit-accept/.test(readyPanel) && /real-relationship-reject/.test(readyPanel), "T013 executable ready panel lacks pending decision controls");
  check(!readyPanel.includes("POISON_T013_PILOT_BODY"), "T013 executable relationship panel leaked a message body");
  const legacyPanel = createPanel({ personId: "fictional-person", status: "empty", candidates: [], error: "RELATIONSHIP_EVIDENCE_INSUFFICIENT", saving: false })(panelGraph, panelPerson);
  check(/证据不足：旧记录未保留完整会话范围/.test(legacyPanel), "T013 executable legacy panel must be honestly insufficient");
}

if (realRelationshipMutationSource.length > 0) {
  const instantiateMutationSink = ({ mutate, mutateSingle = () => { throw new Error("unexpected-single-source-mutation"); }, commit, graph, flow = { open: false, phase: null, personId: null, single: null, expectedActiveGenerationId: null } }) => {
    let localVaultStatus = { state: "ready", graph, activeGenerationId: "fictional-generation-before", adapter: {}, key: {} };
    const stateStub = { analysisSelectedId: "fictional-selected" };
    const sink = new Function("mutateRelationshipFacts", "mutateSingleSourceRelationship", "commitGraph", "renderPeople", "showToast", "state", "initialVaultStatus", "initialFlow", `let localVaultStatus = initialVaultStatus; let personFlowState = initialFlow; let realRelationshipState = { personId: "fictional-person", status: "idle", candidates: [], error: null, saving: false }; let analysisInProgress = false; let localAnalysisState = { status: "ready", result: {}, error: null }; ${realRelationshipMutationSource}\nreturn { run: applyRealRelationshipMutation, status: () => localVaultStatus, flow: () => personFlowState };`)(mutate, mutateSingle, commit, () => {}, () => {}, stateStub, localVaultStatus, flow);
    return { sink: sink.run, status: sink.status };
  };
  const original = { marker: "original" };
  const next = { marker: "next" };
  let commitCount = 0;
  const successSink = instantiateMutationSink({ graph: original, mutate: () => ({ graph: next, changed: true, formalWriteCount: 1, relationshipId: "fictional-relation" }), commit: async () => { commitCount += 1; } });
  const success = await successSink.sink({ personId: "fictional-person" }, "saved");
  check(success.ok === true && success.formalWriteCount === 1 && commitCount === 1 && successSink.status().graph === next, "T013 executable mutation sink must replace graph only after exactly one commit");
  commitCount = 0;
  const failureOriginal = { marker: "failure-original" };
  const failureSink = instantiateMutationSink({ graph: failureOriginal, mutate: () => ({ graph: { marker: "never-active" }, changed: true, formalWriteCount: 1 }), commit: async () => { commitCount += 1; throw new Error("fictional-failure"); } });
  const failure = await failureSink.sink({ personId: "fictional-person" }, "saved");
  check(failure.ok === false && failure.formalWriteCount === 0 && commitCount === 1 && failureSink.status().graph === failureOriginal, "T013 executable failed commit must leave the active graph reference unchanged");
  commitCount = 0;
  const replaySink = instantiateMutationSink({ graph: original, mutate: () => ({ graph: original, changed: false, formalWriteCount: 0 }), commit: async () => { commitCount += 1; } });
  const replay = await replaySink.sink({ personId: "fictional-person" }, "saved");
  check(replay.ok === true && replay.formalWriteCount === 0 && commitCount === 0, "T013 executable replay/no-op must not commit a generation");

  commitCount = 0;
  let atomicInput = null;
  const directOriginal = { marker: "direct-original" };
  const directNext = { marker: "direct-next" };
  const directSink = instantiateMutationSink({
    graph: directOriginal,
    flow: { open: true, phase: "relationship", personId: "fictional-person", single: { mappingId: "fictional-mapping" }, expectedActiveGenerationId: "fictional-generation-before" },
    mutate: () => { throw new Error("separate identity and relationship writes are forbidden"); },
    mutateSingle: (_graph, input) => { atomicInput = input; return { graph: directNext, changed: true, relationshipId: "fictional-relation", formalWriteCount: 1, formalIdentityWriteCount: 1, formalRelationshipWriteCount: 1, generationDelta: 1 }; },
    commit: async () => { commitCount += 1; return "fictional-generation-after"; }
  });
  const direct = await directSink.sink({ operation: "add", personId: "fictional-person", label: "朋友", decisionId: "fictional-decision", at: "2026-08-16T00:00:00.000Z" }, "saved");
  check(direct.ok === true && direct.formalWriteCount === 1 && commitCount === 1 && directSink.status().graph === directNext, "T018-O06 pending single first label must install identity plus relationship through exactly one commit");
  check(atomicInput?.intent === "manual-add" && atomicInput?.mappingId === "fictional-mapping" && atomicInput?.expectedActiveGenerationId === "fictional-generation-before" && atomicInput?.currentActiveGenerationId === "fictional-generation-before", "T018-O06 atomic single-source mutation must revalidate its current mapping and generation");
}
check(todayAnalysis.includes("candidate.safeTopic.label") && todayAnalysis.includes("下一步：管理关系标签") && todayAnalysis.includes("由你决定管理关系标签或准备一条通用问候"), "T003-UI C004 detail lacks bounded safe-topic and next-step evidence");

for (const copy of [
  "管理关系标签",
  "准备联系",
  "复制文案",
  "我已在外部发送",
  "有回复",
  "暂无回复",
  "待跟进",
  "系统未验证送达"
]) check(todayAnalysis.includes(copy), `T004-UI missing contact-loop copy: ${copy}`);
for (const action of [
  "local-analysis-open-relationship",
  "local-contact-prepare",
  "local-contact-copy",
  "local-contact-mark-sent",
  "local-contact-feedback"
]) check(todayAnalysis.includes(`data-action="${action}"`), `T004-UI missing action: ${action}`);
check(/createLocalContactDraft/.test(html) && /recordManualContactEvent/.test(html) && /getManualContactState/.test(html), "T004-UI missing production contact-loop imports/wiring");
check(/navigator\.clipboard\.writeText/.test(html), "T004-UI copy must be an explicit clipboard write");
check(!/fetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/.test(todayAnalysis), "T004-UI Today contact loop contains a network client");

for (const copy of [
  "选择的是 wechat-export-toolkit 的输出根目录。",
  "请先使用同一 revision 的 export_json.py",
  "json/_index.json",
  "json/all_messages.jsonl",
  "json/&lt;_index.json 中列出的会话文件&gt;.json",
  "moments/data.js（可选；没有时仍可只导入聊天）",
  "不递归扫描其他目录",
  "不打开图片、语音、视频或附件内容",
  "不上传、不登录、不自动发送；碎银仅由你点击后通过本机只读 MCP 读取",
  "不代替你运行 exporter"
]) check(html.includes(copy), `LP-03 missing first-use boundary: ${copy}`);

for (const helper of ["queryGraphSignals", "renderGraphSignalPage", "describeSourceReceipt", "classifyGraphSignal", "mergeSuiyinImport"]) {
  check(html.includes(helper), `R001-R005/R009 UI missing production helper wiring: ${helper}`);
}
for (const control of ["realSignalSearch", "realSignalIdentity", "realSignalClassification", "real-signal-page", "real-signal-classify", "suiyin-import-preview", "suiyin-import-confirm", "suiyin-import-cancel"]) {
  check(html.includes(control), `R001/R003/R004/R009 UI missing real-source control: ${control}`);
}
for (const copy of [
  "真实朋友圈内容流",
  "每页最多 50 条",
  "旧版导入未记录",
  "时间未记录",
  "读取碎银当前分配",
  "当前分配范围已加密保存",
  "当前分配声明",
  "实际读取",
  "可读消息条数"
]) check(html.includes(copy), `R001/R002/R003/R010 missing truthful copy: ${copy}`);
for (const forbiddenCopy of [
  "当前接口只能读取“当前分配”",
  "三账号完整范围尚受上游接口限制",
  "碎银朋友圈及附件原件不可用",
  "UPSTREAM_PERSONA_COHORT_UNAVAILABLE"
]) check(!sourcesRender.includes(forbiddenCopy), `T028V2-O05 Sources still presents the local adapter gap as an MCP capability limit: ${forbiddenCopy}`);
check(sourcesRender.includes("现有 MCP"), "T028V2-O05 Sources must state that the existing MCP provides the read capability");
check(/本地(?:适配|映射)/.test(sourcesRender), "T028V2-O05 Sources must describe the remaining local adapter/mapping boundary");
check(sourcesRender.length > 0, "R001 missing Sources production render seam");
check(!sourcesRender.includes("momentSources.map(renderMomentSource)"), "R001 real Sources main path still renders mock source cards");
check(!sourcesRender.includes("pendingSignals.map(renderMomentSignal)"), "R001 real Sources main path still renders mock pending signals");
check(!sourcesRender.includes("confirmedSignals.map(renderMomentSignal)"), "R001 real Sources main path still renders mock confirmed signals");
check(/fetch\("\/api\/suiyin\/import\/preview"/.test(html), "R009 missing same-origin Suiyin preview request");
check(/allocationMissingCount/.test(sourcesRender) && /allocationDeclaredCount/.test(sourcesRender), "T010 partial allocation receipt must render from preview and persisted source fields");
check(sourcesRender.includes("renderSuiyinScopeReceipt") && t028SuiyinScopeUiSource.includes("blockedReason") && t028SuiyinScopeUiSource.includes('mode === "preview"'), "T010/T028 partial allocation warning must appear in preview and saved-card paths through the shared receipt renderer");
check(!/fetch\(["']https?:/.test(html), "R007/R011 UI contains an external fetch target");

check(identityModelSource.length > 0, "T011 missing pure identity real/demo view model");
if (identityModelSource.length > 0) {
  try {
    const projectCrossSourceReview = graph => ({
      pendingGroups: graph?.fictionalPendingGroups || [],
      resolvedDecisions: graph?.fictionalResolvedDecisions || [],
      pendingCount: (graph?.fictionalPendingGroups || []).length,
      formalWriteCount: 0,
    });
    const projectSourceIdentityReview = graph => ({
      singles: (graph?.mappings || []).map(item => ({ mappingId: item.id, personId: item.personId || "fictional-person", displayName: "纯虚构人物", identityState: item.status === "pending" ? "pending" : "confirmed", sourceBadges: [{ kind: "wechat", label: "微信" }] })),
      pairs: [],
      ambiguousCount: 0,
      formalWriteCount: 0,
    });
    const buildIdentityViewModel = Function("projectCrossSourceReview", "projectSourceIdentityReview", `${identityModelSource}; return buildIdentityViewModel;`)(projectCrossSourceReview, projectSourceIdentityReview);
    const realPending = buildIdentityViewModel({ state: "ready", graph: { sources: [{ id: "fictional-source" }], mappings: [{ id: "fictional-map-a", status: "pending" }, { id: "fictional-map-b", status: "confirmed" }] } });
    check(realPending.mode === "real" && realPending.pendingCount === 0 && Array.isArray(realPending.pendingGroups) && realPending.pendingGroups.length === 0 && Array.isArray(realPending.resolvedDecisions) && realPending.resolvedDecisions.length === 0 && !("singles" in realPending), "T020 exact singles must not enter or leak from the public cross-source page model");
    const pairGroup = { reviewGroupId: "A".repeat(64), kind: "pair", status: "pending", sides: [{ displayName: "纯虚构甲", sourceBadges: [{ kind: "wechat", label: "微信" }] }, { displayName: "纯虚构乙", sourceBadges: [{ kind: "suiyin", label: "碎银 · 2号" }] }] };
    const realPair = buildIdentityViewModel({ state: "ready", graph: { fictionalPendingGroups: [pairGroup] } });
    check(realPair.mode === "real" && realPair.pendingCount === 1 && realPair.pendingGroups?.length === 1, "T020 real pair projection must contribute one canonical pending review group");
    const resolved = buildIdentityViewModel({ state: "ready", graph: { fictionalResolvedDecisions: [{ ...pairGroup, status: "separated" }] } });
    check(resolved.pendingCount === 0 && resolved.pendingGroups?.length === 0 && resolved.resolvedDecisions?.length === 1, "T020 resolved history must remain reachable without contributing to count");
    const readyEmpty = buildIdentityViewModel({ state: "ready", graph: { sources: [], mappings: [] } });
    check(readyEmpty.mode === "real" && readyEmpty.pendingCount === 0 && readyEmpty.pendingGroups?.length === 0 && readyEmpty.resolvedDecisions?.length === 0, "T020 ready-empty cross-source state must stay real zero without mock fallback");
    const unavailable = buildIdentityViewModel({ state: "unavailable", graph: null });
    check(unavailable.mode === "unavailable" && unavailable.pendingCount === null && unavailable.pendingGroups?.length === 0 && unavailable.resolvedDecisions?.length === 0, "T022-O02 unavailable cross-source state must remain unknown rather than claim a real zero");
  } catch (error) { failures.push(`T011 identity view model could not execute: ${error?.message || error}`); }
}
check(identitiesRender.length > 0 && /identityModel\.pendingGroups/.test(identitiesRender) && /identityModel\.resolvedDecisions/.test(identitiesRender) && !/demoPairs|identityPairs|identityModel\.singles/.test(identitiesRender), "T020 cross-source render must consume only the safe public group projection");
check(/identityNavCount"\)\.textContent\s*=\s*formatRuntimeCount\(runtime\.counts\.identities\)/.test(rootRender), "T022-O02 left nav count must format an unknown projection as an em dash");

check(runtimeModelSource.length > 0, "T012 missing executable real runtime model seam");
check(honestRouteSource.length > 0, "T012 missing executable honest route render seam");
if (runtimeModelSource.length > 0 && honestRouteSource.length > 0) {
  try {
    const buildRealRuntimeModel = Function(`${runtimeModelSource}; return buildRealRuntimeModel;`)();
    const renderHonestEmptyRoute = Function(`${honestRouteSource}; return renderHonestEmptyRoute;`)();
    const projectPeople = graph => ({ aggregate: { peopleCount: Array.isArray(graph?.people) ? graph.people.length : 0 }, rows: [] });
    const projectIdentities = () => ({ pendingCount: 0, pendingGroups: [], resolvedDecisions: [], pairs: [], ambiguousCount: 0, formalWriteCount: 0 });
    const states = [
      [{ state: "checking", graph: null }, "checking", null, null],
      [{ state: "ready", graph: { sources: [], people: [], excerpts: [], mappings: [], relationships: [], signals: [], actions: [] } }, "ready-empty", 0, 0],
      [{ state: "ready", graph: { sources: [{ id: "fictional-source" }], people: [{ id: "fictional-person" }], excerpts: [], mappings: [{ id: "fictional-mapping", status: "pending" }], relationships: [], signals: [], actions: [] } }, "ready-nonempty", 1, 0],
      [{ state: "unavailable", graph: null }, "unavailable", null, null]
    ];
    for (const [vaultStatus, phase, people, identities] of states) {
      const model = buildRealRuntimeModel(vaultStatus, projectPeople, projectIdentities);
      const expectedAuxiliaryCount = phase === "checking" || phase === "unavailable" ? null : 0;
      check(model.phase === phase && model.counts.people === people && model.counts.identities === identities && model.counts.missed === expectedAuxiliaryCount && model.counts.cold === expectedAuxiliaryCount, `T012 executable runtime model mismatch for ${phase}`);
    }
    for (const route of ["missed", "history", "cold-storage"]) {
      const sink = { innerHTML: "" };
      check(renderHonestEmptyRoute(route, sink) === true && /data-runtime-source="empty"/.test(sink.innerHTML) && />0</.test(sink.innerHTML) && !/data-action=/.test(sink.innerHTML), `T012 ${route} must execute to a zero-action honest final DOM`);
    }
  } catch (error) { failures.push(`T012 executable runtime render seam failed: ${error?.message || error}`); }
}

// T022 focused UI/startup contract. All execution below uses fictional in-memory
// values, fake promises and a fake clock. It never opens IndexedDB, a picker or
// the Suiyin endpoint.
check(vaultStartupSource.length > 0, "T022-O03/O04 missing finite vault-startup controller seam");
check(sourceControlStateSource.length > 0, "T022-O07/O08 missing terminal Sources control reconciliation seam");
check(vaultTransitionRouteSource.length > 0, "T022-O01/O02 missing seven-route checking/unavailable shell seam");
check(/VAULT_STARTUP_DEADLINE_MS\s*=\s*10000/.test(vaultStartupSource), "T022-O03 startup deadline must be exactly 10000ms");
check(/localVaultAttemptSequence/.test(vaultStartupSource) && /localVaultAttemptInFlight/.test(vaultStartupSource), "T022-O09 startup attempts need monotonic latest-token and single-flight state");
check(/state:\s*"ready"[\s\S]*?renderSafely\(\)[\s\S]*?cleanupExpiredSnapshots/.test(vaultStartupSource), "T022-O04 ready graph must render before optional snapshot cleanup starts");
check(!/showDirectoryPicker|\/api\/suiyin\/import|commitGraph\s*\(|commitLocalSemanticCache\s*\(/.test(vaultStartupSource), "T022-O05/O10 ordinary startup must not picker, MCP, import, or write business/cache state");
check(/expectedActiveGenerationId/.test(localImportConfirmSource) && /commitGraph\([\s\S]*?expectedActiveGenerationId/.test(localImportConfirmSource), "T022-O12 WeChat confirm must pass the preview generation to business CAS");
check(/BUSINESS_GENERATION_STALE/.test(localImportConfirmSource) && /loadActiveGraphWithSemanticCache/.test(localImportConfirmSource) && /reconcileLocalImportPreview/.test(localImportConfirmSource), "T022-O12 typed stale WeChat commit must reload and re-diff in place");
check(!/showDirectoryPicker/.test(localImportConfirmSource), "T022-O12 stale WeChat confirm must never reopen the picker");

const t022RouteSources = [
  ["today", "renderToday", todayRender],
  ["missed", "renderMissed", missedRender],
  ["history", "renderHistory", historyRender],
  ["people", "renderPeople", peopleRender],
  ["identities", "renderIdentities", identitiesRender],
  ["cold-storage", "renderColdStorage", coldStorageRender],
  ["sources", "renderSources", sourcesRender],
];
for (const [route, name, source] of t022RouteSources) {
  const hasGuard = new RegExp(`function ${name}\\(\\)\\s*\\{\\s*if \\(renderVaultTransitionRoute\\(["']${route}["']\\)\\) return;`).test(source);
  check(hasGuard, `T022-O01 ${route} renderer must stop at the availability shell before graph-only work`);
  if (hasGuard) {
    try {
      let guardCalls = 0;
      const renderer = Function("renderVaultTransitionRoute", `${source}\n; return ${name};`)(seenRoute => { guardCalls += 1; return seenRoute === route; });
      renderer();
      check(guardCalls === 1, `T022-O01 ${route} checking renderer did not execute exactly one availability guard`);
    } catch (error) {
      failures.push(`T022-O01 ${route} checking renderer crossed its guard: ${error?.message || error}`);
    }
  }
}

// Reproduce the issued People failure with the real source: the safe product
// must call its route guard before the null graph can reach a projector.
if (peopleRender.length > 0 && runtimeModelSource.length > 0) {
  try {
    let guardCalls = 0;
    let graphProjectorCalls = 0;
    const sink = { innerHTML: "" };
    const runPeopleChecking = Function(
      "pageHost",
      "renderVaultTransitionRoute",
      "projectRelationshipLibrary",
      "projectSourceIdentityReview",
      "projectCrossSourceReview",
      `
        const state = { personFilter: "" };
        const localVaultStatus = { state: "checking", graph: null, activeGenerationId: null };
        const renderLocalSemanticBatchStatus = () => "";
        const renderSourceBadgeHelp = () => "";
        const publicRelationshipStatus = () => "";
        const renderSourceBadges = () => "";
        const createViewActionToken = () => "fictional-token";
        const escapeHtml = value => String(value ?? "");
        ${runtimeModelSource}
        ${peopleRender}
        renderPeople();
      `
    );
    runPeopleChecking(
      sink,
      route => { guardCalls += 1; if (route === "people") { sink.innerHTML = '<section data-vault-state="checking">—</section>'; return true; } return false; },
      () => { graphProjectorCalls += 1; throw new Error("GRAPH_REQUIRED"); },
      () => { graphProjectorCalls += 1; throw new Error("GRAPH_REQUIRED"); },
      () => { graphProjectorCalls += 1; throw new Error("GRAPH_REQUIRED"); },
    );
    check(guardCalls === 1 && graphProjectorCalls === 0 && sink.innerHTML.includes("—"), "T022-O01/O02 People checking must render unknown without calling any graph projector");
  } catch (error) {
    failures.push(`T022-O01 issued People null-graph failure remains reachable: ${error?.message || error}`);
  }
}

if (sourceControlStateSource.length > 0) {
  try {
    const buildSourceControlState = Function(`${sourceControlStateSource}; return buildSourceControlState;`)();
    const validPreview = { ok: true, state: "preview-ready", expectedActiveGenerationId: "fictional-generation", diff: { conflicts: [] } };
    const checking = buildSourceControlState({ state: "checking", activeGenerationId: null }, validPreview, { suiyinBusy: false, suiyinStatus: "idle" });
    const ready = buildSourceControlState({ state: "ready", activeGenerationId: "fictional-generation" }, validPreview, { suiyinBusy: false, suiyinStatus: "idle" });
    const unavailable = buildSourceControlState({ state: "unavailable", activeGenerationId: null }, validPreview, { suiyinBusy: false, suiyinStatus: "idle" });
    check(checking.wechatPickerEnabled === true && checking.wechatConfirmEnabled === false && checking.suiyinReadEnabled === false, "T022-O07 checking must retain explicit WeChat selection while blocking commits and MCP");
    check(ready.wechatConfirmEnabled === true && ready.suiyinReadEnabled === true, "T022-O07/O08 ready must re-enable valid WeChat confirm and Suiyin read");
    check(unavailable.retryEnabled === true && unavailable.wechatConfirmEnabled === false && unavailable.suiyinReadEnabled === false, "T022-O03/O07 unavailable must offer retry without enabling writes");
  } catch (error) {
    failures.push(`T022-O07/O08 Sources control reconciliation could not execute: ${error?.message || error}`);
  }
}

if (vaultTransitionRouteSource.length > 0 && sourceControlStateSource.length > 0) {
  try {
    const createTransitionRenderer = Function("escapeHtml", `${sourceControlStateSource}\n${vaultTransitionRouteSource}; return renderVaultTransitionRoute;`);
    const renderVaultTransitionRoute = createTransitionRenderer(value => String(value ?? "").replace(/[&<>"']/g, ""));
    for (const stateName of ["checking", "unavailable"]) {
      for (const [route] of t022RouteSources) {
        const sink = { innerHTML: "" };
        const handled = renderVaultTransitionRoute(route, { state: stateName, graph: null, activeGenerationId: null }, sink, { preview: null, suiyinBusy: false, suiyinStatus: "idle" });
        check(handled === true && sink.innerHTML.includes("—") && !/>0</.test(sink.innerHTML), `T022-O01/O02 ${route} ${stateName} shell must show unknown, never factual zero`);
        if (stateName === "unavailable") check(/data-action="local-vault-retry"(?![^>]*disabled)/.test(sink.innerHTML), `T022-O03 ${route} unavailable shell lacks enabled retry`);
      }
    }
  } catch (error) {
    failures.push(`T022-O01/O02 transition shell could not execute: ${error?.message || error}`);
  }
}

function t022Deferred() {
  let resolve;
  let reject;
  const promise = new Promise((onResolve, onReject) => { resolve = onResolve; reject = onReject; });
  return { promise, resolve, reject };
}

function createT022VaultHarness(options = {}) {
  const events = { adapterOpen: 0, keyRead: 0, load: 0, renders: [], installs: 0, refreshes: 0, batches: [], cleanup: 0, picker: 0, mcp: 0, importCommit: 0, businessWrite: 0, cacheWrite: 0, diff: 0 };
  const timers = new Map();
  let timerSequence = 0;
  const loads = options.loads || [];
  const api = Function("startupSource", "options", "events", "timers", "loads", `
    let localImportPreview = options.preview || null;
    let localImportPreviewSequence = 0;
    let localVaultStatus = { state: "checking", graph: null, activeGenerationId: null };
    let localSafetySnapshot = null;
    let localSemanticCoverageGraph = null;
    let localSemanticCoverageGenerationId = null;
    let localSemanticCoveragePersonIds = new Set();
    let localSemanticBatchState = { status: "idle", coverageTotal: 0 };
    const state = { page: options.page || "people" };
    const pageHost = { innerHTML: "" };
    const window = {
      setTimeout(callback, delay) { const id = ++options.timerSequence.value; timers.set(id, { callback, delay }); return id; },
      clearTimeout(id) { timers.delete(id); },
    };
    const render = () => {
      events.renders.push({ state: localVaultStatus.state, graph: localVaultStatus.graph, installs: events.installs, refreshes: events.refreshes });
      pageHost.innerHTML = localVaultStatus.state === "unavailable" ? '<button data-action="local-vault-retry">重试本机加密库</button>' : '<section data-vault-state="' + localVaultStatus.state + '"></section>';
      if (options.renderThrows) throw new Error("FICTIONAL_RENDER_FAILURE");
    };
    const updateLocalRuntimeStatus = () => {};
    const resetLocalAnalysis = () => {};
    const renderSources = render;
    const showToast = () => {};
    const createIndexedDbVaultAdapter = async () => {
      events.adapterOpen += 1;
      return { getOrCreateKey: async () => { events.keyRead += 1; return { kind: "fictional-key" }; }, readState: async () => ({ snapshots: [] }) };
    };
    const loadActiveGraphWithSemanticCache = async () => { events.load += 1; const next = loads.shift(); return await (typeof next === "function" ? next() : next); };
    const cleanupExpiredSnapshots = async () => { events.cleanup += 1; if (options.cleanup) return await options.cleanup(); return null; };
    const installLocalSemanticCacheHit = () => { events.installs += 1; if (options.installThrows) throw new Error("FICTIONAL_CACHE_FAILURE"); };
    const refreshLocalRelationshipAnalysis = () => { events.refreshes += 1; };
    const activeLocalSemanticPersonIds = graph => (graph?.people || []).filter(person => person?.id).map(person => person.id);
    const runLocalSemanticBatch = (reason, runOptions) => { events.batches.push({ reason, options: runOptions }); return Promise.resolve({ ok: true }); };
    const diffImportedPreview = async (preview, graph) => { events.diff += 1; return options.diff ? await options.diff(preview, graph) : { added: [], updated: [], suspectedDeleted: [], unchanged: [], conflicts: [] }; };
    return eval(startupSource + "\\n;({ openLocalVault, bootstrapLocalVault, reconcileLocalImportPreview, status: () => localVaultStatus, preview: () => localImportPreview, page: () => pageHost.innerHTML });");
  `)(vaultStartupSource, { ...options, timerSequence: { get value() { return timerSequence; }, set value(value) { timerSequence = value; } } }, events, timers, loads);
  return {
    ...api,
    events,
    loads,
    fireDeadline() {
      const entry = [...timers.entries()].find(([, timer]) => timer.delay === 10000);
      if (!entry) return false;
      timers.delete(entry[0]);
      entry[1].callback();
      return true;
    },
  };
}

if (vaultStartupSource.length > 0) {
  try {
    const readyGraph = { people: [{ id: "fictional-restored-person" }], sources: [{ id: "fictional-restored-source", sourceAccountLabels: { "SY-00000001": "纯虚构2号" } }], mappings: [{ id: "fictional-map" }], relationships: [{ id: "fictional-relationship" }], dictionary: [{ id: "fictional-dictionary" }] };
    const readyLoaded = { graph: readyGraph, activeGenerationId: "fictional-generation-ready", semanticCache: { status: "hit", reason: "vault-cache-hit", payload: {}, baseResults: new Map() } };

    const renderFailure = createT022VaultHarness({ renderThrows: true, loads: [readyLoaded] });
    await renderFailure.bootstrapLocalVault();
    check(renderFailure.events.adapterOpen === 1 && renderFailure.status().state === "ready" && renderFailure.status().graph === readyGraph, "T022-O03 initial render failure must still open exactly once and publish the restored graph");

    const attemptA = t022Deferred();
    const retryGraph = { people: [{ id: "fictional-retry-person" }], sources: [], mappings: [], relationships: [], dictionary: [] };
    const latest = createT022VaultHarness({ loads: [attemptA.promise, { graph: retryGraph, activeGenerationId: "fictional-generation-b", semanticCache: { status: "miss", reason: "cache-miss-full" } }] });
    const first = latest.openLocalVault();
    const duplicate = latest.openLocalVault();
    await Promise.resolve();
    check(latest.events.adapterOpen === 1, "T022-O03/O09 duplicate checking open must reuse one active attempt");
    check(latest.fireDeadline() === true, "T022-O03 fake clock did not find the fixed 10s startup deadline");
    await Promise.all([first, duplicate]);
    check(latest.status().state === "unavailable" && latest.page().includes("data-action=\"local-vault-retry\""), "T022-O03 timeout must settle unavailable with active retry");
    await latest.openLocalVault();
    check(latest.events.adapterOpen === 2 && latest.status().state === "ready" && latest.status().graph === retryGraph, "T022-O09 retry must publish the latest successful attempt");
    attemptA.resolve({ graph: { people: [{ id: "fictional-stale-person" }] }, activeGenerationId: "fictional-generation-a", semanticCache: { status: "hit" } });
    await Promise.resolve();
    await Promise.resolve();
    check(latest.status().graph === retryGraph && latest.status().activeGenerationId === "fictional-generation-b", "T022-O09 late completion from a timed-out attempt overwrote the latest graph");

    const cleanupPending = t022Deferred();
    const restored = createT022VaultHarness({ loads: [readyLoaded], cleanup: () => cleanupPending.promise });
    await restored.openLocalVault();
    check(restored.status().state === "ready" && restored.status().graph === readyGraph && restored.events.renders.some(item => item.state === "ready" && item.graph === readyGraph), "T022-O04 graph must be rendered ready before cleanup settles");
    check(restored.events.picker === 0 && restored.events.mcp === 0 && restored.events.importCommit === 0 && restored.events.businessWrite === 0 && restored.events.cacheWrite === 0, "T022-O05/O10 persisted restore must perform zero reimport, picker, MCP, business or cache writes");
    check(JSON.stringify(restored.status().graph) === JSON.stringify(readyGraph) && restored.status().graph.sources[0].sourceAccountLabels["SY-00000001"] === "纯虚构2号", "T022-O05 persisted graph/source/account labels were not restored unchanged");
    check(restored.events.installs === 1 && restored.events.refreshes === 1 && restored.events.batches.length === 0, "T022-O05/O06 valid cache hit must restore derived state without a new batch/write");
    check(restored.events.renders.some(item => item.state === "ready" && item.graph === readyGraph && item.installs === 1 && item.refreshes === 1), "T022-O04/O06 Today must repaint after the restored semantic cache rebuilds its derived analysis");

    const optionalFailure = createT022VaultHarness({ loads: [readyLoaded], cleanup: async () => { throw new Error("FICTIONAL_CLEANUP_FAILURE"); }, installThrows: true });
    await optionalFailure.openLocalVault();
    await Promise.resolve();
    check(optionalFailure.status().state === "ready" && optionalFailure.status().graph === readyGraph, "T022-O06 cache/cleanup failure must not revoke the restored business graph");

    const parsedPreview = { ok: true, state: "awaiting-vault", rootName: "fictional-export", conversations: [], messages: [], moments: [], warnings: [], peopleScopeLabel: "纯虚构范围" };
    const previewRestore = createT022VaultHarness({ preview: parsedPreview, loads: [readyLoaded] });
    await previewRestore.openLocalVault();
    await Promise.resolve();
    await Promise.resolve();
    check(previewRestore.events.diff === 1 && previewRestore.preview()?.state === "preview-ready" && previewRestore.preview()?.expectedActiveGenerationId === "fictional-generation-ready", "T022-O07/O12 checking WeChat input must re-diff against the restored graph and bind its exact generation");
  } catch (error) {
    failures.push(`T022-O03-O10 executable startup Oracle failed: ${error?.message || error}`);
  }
}

if (localExportPickerSource.length > 0) {
  try {
    const parsed = { ok: true, conversations: [], messages: [], moments: [], warnings: [], peopleScopeLabel: "纯虚构范围" };
    const events = { picker: 0, parse: 0, diff: 0, reconcile: 0, parseOptions: null };
    const pickerHarness = Function("source", "parsed", "events", `
      let localImportPreview = null;
      let localImportPreviewSequence = 0;
      const localVaultStatus = { state: "checking", graph: null, activeGenerationId: null };
      const privateHandle = { name: "output_53365692", fullPath: "C:/private-canary/output_53365692", lastModified: 123456789, marker: "private-handle-canary" };
      const window = { showDirectoryPicker: async () => { events.picker += 1; return privateHandle; } };
      const SOURCE_BUNDLE_REVISION = "fictional-revision";
      const parseWechatExportToolkit = async (_root, options) => { events.parse += 1; events.parseOptions = options; return { ...parsed, receipt: { batchName: "output_53365692", selectedAt: options?.selectedAt, exportedAt: null } }; };
      const diffImportedPreview = async () => { events.diff += 1; return { added: [], updated: [], suspectedDeleted: [], unchanged: [], conflicts: [] }; };
      const reconcileLocalImportPreview = async () => { events.reconcile += 1; };
      const normalizeLocalPickerError = error => error?.name === "AbortError" ? "cancelled" : "read-failed";
      const renderSources = () => {};
      const showToast = () => {};
      return eval(source + "\\n;({ run: chooseLocalExport, preview: () => localImportPreview });");
    `)(localExportPickerSource, parsed, events);
    await pickerHarness.run({ now: () => "2026-08-19T03:04:05.000Z" });
    check(events.picker === 1 && events.parse === 1 && events.diff === 0 && events.reconcile === 0 && pickerHarness.preview()?.state === "awaiting-vault", "T022-O07/O12 checking picker must retain parsed input without diffing a null graph");
    check(events.parseOptions?.selectedAt === "2026-08-19T03:04:05.000Z" && JSON.stringify(pickerHarness.preview()?.receipt) === JSON.stringify({ batchName: "output_53365692", selectedAt: "2026-08-19T03:04:05.000Z", exportedAt: null }), "T029-O07 accepted picker must pass injected selectedAt and retain the exact safe transient receipt");
    check(!JSON.stringify(pickerHarness.preview()).includes("private-canary") && !JSON.stringify(pickerHarness.preview()).includes("private-handle-canary") && !Object.hasOwn(pickerHarness.preview() || {}, "handle"), "T029-O07 preview must retain no full path, filesystem metadata or DirectoryHandle");
  } catch (error) {
    failures.push(`T022-O07/O12 checking picker Oracle failed: ${error?.message || error}`);
  }
}

check(/已选择：\$\{[^}]*receipt[^}]*batchName[^}]*\} · 选择时间 \$\{[^}]*receipt[^}]*selectedAt[^}]*\}/s.test(sourcesRender) || /已选择：\$\{[^}]*previewReceipt[^}]*\}/s.test(sourcesRender), "T029-O07 Sources preview must render the safe batch receipt as batch name plus selection time");
check(sourcesRender.includes("aria-describedby=\"wechatConfirmReason\"") && sourcesRender.includes("wechatConfirmDisabledReason"), "T029-O05 confirm control must expose its nearby disabled reason through aria-describedby");
check(sourcesRender.includes("导出批次") && sourcesRender.includes("sourceReceipt.batchNameLabel") && sourcesRender.includes("选择时间") && sourcesRender.includes("sourceReceipt.selectedAtLabel") && sourcesRender.includes("导入时间") && sourcesRender.includes("sourceReceipt.importedAtLabel") && sourcesRender.includes("导出时间") && sourcesRender.includes("sourceReceipt.exportedAtLabel"), "T029-O08/O09 committed source card must render four separate receipt semantics with domain-provided legacy fallbacks");
check(!/lastModified|creationTime|fullPath|webkitRelativePath/.test(localExportPickerSource + sourcesRender), "T029-O07/O09 UI picker/render path must not inspect or display filesystem path/time metadata");
check(!sourcesRender.includes("已同步微信"), "T029-O09 source receipt copy must not claim WeChat sync");

if (localImportConfirmSource.length > 0) {
  try {
    const makeConfirmHarness = ({ currentGeneration, previewGeneration, commitStale = false }) => {
      const events = { commits: 0, businessWrites: 0, reconciles: 0, reloads: 0, picker: 0, commitOptions: null };
      const api = Function("source", "events", "currentGeneration", "previewGeneration", "commitStale", `
        const latestGraph = { marker: "fictional-latest" };
        let localImportPreview = { ok: true, state: "preview-ready", expectedActiveGenerationId: previewGeneration, receipt: { batchName: "fictional-export", selectedAt: "2026-08-19T03:04:05.000Z", exportedAt: null }, diff: { conflicts: [] } };
        let localVaultStatus = { state: "ready", graph: { marker: "fictional-current" }, activeGenerationId: currentGeneration, adapter: {}, key: {} };
        let localImportSaving = false;
        let localImportConfirmInFlight = null;
        const buildImportedGraph = () => ({ marker: "fictional-imported" });
        const diffImportedPreview = async () => ({ added: [], updated: [], suspectedDeleted: [], unchanged: [], conflicts: [] });
        const validateLocalImportConfirmation = preview => preview.receipt;
        const commitGraph = async (_adapter, _graph, _key, options) => { events.commits += 1; events.commitOptions = options; if (commitStale) throw Object.assign(new Error("stale"), { code: "BUSINESS_GENERATION_STALE" }); events.businessWrites += 1; return "fictional-generation-after"; };
        const loadActiveGraphWithSemanticCache = async () => { events.reloads += 1; return { graph: latestGraph, activeGenerationId: "fictional-generation-latest", semanticCache: { status: "miss", reason: "cache-miss-full" } }; };
        const reconcileLocalImportPreview = async () => { events.reconciles += 1; localImportPreview = { ...localImportPreview, state: "preview-ready", expectedActiveGenerationId: localVaultStatus.activeGenerationId, diff: { conflicts: [] } }; return { ok: true }; };
        const resetLocalAnalysis = () => {};
        const refreshAfterCommittedBusiness = async () => ({ ok: true });
        const renderSafely = () => {};
        const renderSources = () => {};
        const showToast = () => {};
        const openDialog = () => {};
        const closeDialog = () => {};
        return eval(source + "\\n;({ run: confirmLocalImport, status: () => localVaultStatus, preview: () => localImportPreview });");
      `)(localImportConfirmSource, events, currentGeneration, previewGeneration, commitStale);
      return { ...api, events };
    };

    const valid = makeConfirmHarness({ currentGeneration: "fictional-generation-one", previewGeneration: "fictional-generation-one" });
    await valid.run();
    check(valid.events.commits === 1 && valid.events.businessWrites === 1 && valid.events.commitOptions?.expectedActiveGenerationId === "fictional-generation-one", "T022-O12 valid WeChat confirm must issue one exact-generation CAS");

    const staleBeforeCommit = makeConfirmHarness({ currentGeneration: "fictional-generation-two", previewGeneration: "fictional-generation-one" });
    await staleBeforeCommit.run();
    check(staleBeforeCommit.events.commits === 0 && staleBeforeCommit.events.businessWrites === 0 && staleBeforeCommit.events.reconciles === 1 && staleBeforeCommit.events.picker === 0 && staleBeforeCommit.preview()?.expectedActiveGenerationId === "fictional-generation-two" && staleBeforeCommit.preview()?.receipt?.batchName === "fictional-export", "T022-O12/T029-O06 pre-commit stale preview must zero-write, retain receipt and re-preview without a picker");

    const staleCas = makeConfirmHarness({ currentGeneration: "fictional-generation-one", previewGeneration: "fictional-generation-one", commitStale: true });
    await staleCas.run();
    check(staleCas.events.commits === 1 && staleCas.events.businessWrites === 0 && staleCas.events.reloads === 1 && staleCas.events.reconciles === 1 && staleCas.events.picker === 0 && staleCas.preview()?.expectedActiveGenerationId === "fictional-generation-latest" && staleCas.preview()?.receipt?.selectedAt === "2026-08-19T03:04:05.000Z", "T022-O12/T029-O06 typed CAS stale must retain receipt while reloading/re-previewing with zero write and no re-picker");
  } catch (error) {
    failures.push(`T022-O12 executable WeChat generation Oracle failed: ${error?.message || error}`);
  }
}

if (sourceControlStateSource.length > 0) {
  try {
    const controlState = Function("source", `
      return eval(source + "\\n;buildSourceControlState");
    `)(sourceControlStateSource);
    const current = { state: "ready", graph: { marker: "fictional-current" }, activeGenerationId: "fictional-generation-current" };
    const validPreview = {
      ok: true,
      state: "preview-ready",
      expectedActiveGenerationId: "fictional-generation-current",
      batchName: "output_53365692",
      selectedAt: "2026-08-19T03:04:05.000Z",
      exportedAt: null,
      diff: { conflicts: [] },
    };
    const controlOptions = { suiyinBusy: false, suiyinStatus: "idle", wechatSaving: false };
    const ready = controlState(current, validPreview, controlOptions);
    check(ready.wechatConfirmEnabled === true && ready.wechatConfirmDisabledReason === "", "T029-O05 valid/current/0-conflict/not-saving preview must enable confirm with no disabled reason");

    const unavailable = controlState({ state: "checking", graph: null, activeGenerationId: null }, { ...validPreview, expectedActiveGenerationId: "fictional-stale", diff: { conflicts: [{ id: "fictional-conflict" }] } }, { ...controlOptions, wechatSaving: true });
    check(unavailable.wechatConfirmEnabled === false && unavailable.wechatConfirmDisabledReason === "库未就绪", "T029-O05 disabled reason priority must start with vault-not-ready");
    const stale = controlState(current, { ...validPreview, expectedActiveGenerationId: "fictional-stale", diff: { conflicts: [{ id: "fictional-conflict" }] } }, { ...controlOptions, wechatSaving: true });
    check(stale.wechatConfirmEnabled === false && stale.wechatConfirmDisabledReason === "预览失效待重算", "T029-O05 disabled reason priority must place stale before conflict/saving");
    const conflict = controlState(current, { ...validPreview, diff: { conflicts: [{ id: "fictional-conflict-a" }, { id: "fictional-conflict-b" }] } }, { ...controlOptions, wechatSaving: true });
    check(conflict.wechatConfirmEnabled === false && conflict.wechatConfirmDisabledReason === "有 2 个真实冲突" && conflict.wechatConflictCopy === "有 2 条原始内容/来源冲突，处理后才能确认", "T029-O05 true conflicts must expose stable count reason and contracted nearby copy");
    const saving = controlState(current, validPreview, { ...controlOptions, wechatSaving: true });
    check(saving.wechatConfirmEnabled === false && saving.wechatConfirmDisabledReason === "正在保存", "T029-O05 disabled reason priority must end with saving");
  } catch (error) {
    failures.push(`T029-O05 executable confirm-control Oracle failed: ${error?.message || error}`);
  }
}

if (localImportConfirmSource.length > 0) {
  try {
    const deferred = () => {
      let resolve;
      const promise = new Promise(settle => { resolve = settle; });
      return { promise, resolve };
    };
    const makeT029ConfirmHarness = ({
      receipt = { batchName: "output_53365692", selectedAt: "2026-08-19T03:04:05.000Z", exportedAt: null },
      authoritativeConflicts = [],
      holdCommit = null,
    } = {}) => {
      const events = { diffs: 0, validations: 0, builds: 0, commits: 0, businessWrites: 0, cacheWrites: 0, reconciles: 0, picker: 0, buildOptions: null, commitOptions: null };
      const api = Function("source", "events", "receipt", "authoritativeConflicts", "holdCommit", `
        let localImportPreview = { ok: true, state: "preview-ready", expectedActiveGenerationId: "fictional-generation-current", receipt, diff: { conflicts: [] } };
        let localVaultStatus = { state: "ready", graph: { marker: "fictional-current" }, activeGenerationId: "fictional-generation-current", adapter: {}, key: {} };
        let localImportSaving = false;
        let localImportConfirmInFlight = null;
        const diffImportedPreview = async () => { events.diffs += 1; return { added: [], updated: [], suspectedDeleted: [], unchanged: [], conflicts: authoritativeConflicts }; };
        const validateLocalImportConfirmation = (preview, diff) => {
          events.validations += 1;
          if (diff.conflicts.length > 0) throw Object.assign(new Error("conflict"), { code: "IMPORT_CONFLICTS_UNRESOLVED", conflictCount: diff.conflicts.length });
          if (!preview.receipt || typeof preview.receipt.batchName !== "string" || !preview.receipt.selectedAt || preview.receipt.exportedAt !== null) throw Object.assign(new Error("receipt"), { code: "IMPORT_RECEIPT_INVALID" });
          return preview.receipt;
        };
        const buildImportedGraph = (_preview, _previous, options) => { events.builds += 1; events.buildOptions = options; return { marker: "fictional-imported" }; };
        const commitGraph = async (_adapter, _graph, _key, options) => { events.commits += 1; events.commitOptions = options; if (holdCommit) await holdCommit.promise; events.businessWrites += 1; return "fictional-generation-after"; };
        const loadActiveGraphWithSemanticCache = async () => ({ graph: localVaultStatus.graph, activeGenerationId: localVaultStatus.activeGenerationId });
        const reconcileLocalImportPreview = async () => { events.reconciles += 1; return { ok: true }; };
        const resetLocalAnalysis = () => {};
        const refreshAfterCommittedBusiness = async () => { events.cacheWrites += 1; return { ok: true }; };
        const renderSafely = () => {};
        const renderSources = () => {};
        const showToast = () => {};
        const openDialog = () => {};
        const closeDialog = () => {};
        return eval(source + "\\n;({ run: confirmLocalImport, preview: () => localImportPreview, saving: () => localImportSaving });");
      `)(localImportConfirmSource, events, receipt, authoritativeConflicts, holdCommit);
      return { ...api, events };
    };

    const conflict = makeT029ConfirmHarness({ authoritativeConflicts: [{ id: "fictional-true-conflict" }] });
    const conflictResult = await conflict.run(false, { now: () => "2026-08-19T03:05:06.000Z" });
    check(conflictResult?.code === "IMPORT_CONFLICTS_UNRESOLVED" && conflict.events.diffs === 1 && conflict.events.validations === 1 && conflict.events.builds === 0 && conflict.events.commits === 0 && conflict.events.businessWrites === 0 && conflict.events.cacheWrites === 0, "T029-O05 direct confirm must authoritative re-diff then reject true conflicts before every build/write");

    const invalidReceipt = makeT029ConfirmHarness({ receipt: null });
    const invalidReceiptResult = await invalidReceipt.run(false, { now: () => "2026-08-19T03:05:06.000Z" });
    check(invalidReceiptResult?.code === "IMPORT_RECEIPT_INVALID" && invalidReceipt.events.diffs === 1 && invalidReceipt.events.validations === 1 && invalidReceipt.events.builds === 0 && invalidReceipt.events.commits === 0 && invalidReceipt.events.businessWrites === 0 && invalidReceipt.events.cacheWrites === 0, "T029-O05 invalid receipt must fail closed before every build/write");

    const committed = makeT029ConfirmHarness();
    const committedResult = await committed.run(false, { now: () => "2026-08-19T03:05:06.000Z" });
    check(committedResult?.ok === true && committed.events.diffs === 1 && committed.events.validations === 1 && committed.events.builds === 1 && committed.events.commits === 1 && committed.events.businessWrites === 1 && committed.events.buildOptions?.importedAt === "2026-08-19T03:05:06.000Z" && committed.events.commitOptions?.now === "2026-08-19T03:05:06.000Z", "T029-O08 valid confirm must use one committedAt for build receipt and exact-generation commit");

    const heldCommit = deferred();
    const singleFlight = makeT029ConfirmHarness({ holdCommit: heldCommit });
    const firstConfirm = singleFlight.run(false, { now: () => "2026-08-19T03:05:06.000Z" });
    await Promise.resolve();
    await Promise.resolve();
    const duplicateConfirm = singleFlight.run(false, { now: () => "2026-08-19T03:05:07.000Z" });
    await Promise.resolve();
    check(singleFlight.events.commits === 1 && singleFlight.saving() === true, "T029-O05 confirm double-click must share one in-flight business generation");
    heldCommit.resolve();
    const [firstResult, duplicateResult] = await Promise.all([firstConfirm, duplicateConfirm]);
    check(firstResult?.ok === true && duplicateResult?.ok === true && singleFlight.events.commits === 1 && singleFlight.events.businessWrites === 1 && singleFlight.events.cacheWrites === 1 && singleFlight.saving() === false, "T029-O05 single-flight confirm must settle one business/cache refresh and clear saving state");
  } catch (error) {
    failures.push(`T029-O05/O08 executable domain-confirm Oracle failed: ${error?.message || error}`);
  }
}

let serverSource = "";
let serverModule = null;
if (!fs.existsSync(serverPath)) {
  failures.push("LP-04 missing scripts/start-local-preview.mjs");
} else {
  serverSource = fs.readFileSync(serverPath, "utf8");
  try {
    serverModule = await import(pathToFileURL(serverPath).href);
  } catch (error) {
    failures.push(`LP-04 server module cannot load: ${error?.name || "load-error"}`);
  }
}

if (serverModule) {
  const { HOST, PORT, ENTRY_URL, ALLOWED_PATHS, createRequestHandler } = serverModule;
  check(HOST === "127.0.0.1", "LP-04 host is not fixed loopback");
  check(PORT === 8765, "LP-04 port is not fixed to 8765");
  check(ENTRY_URL === "http://127.0.0.1:8765/prototype/index.html#/sources", "LP-04 main entry is not fixed");
  check(Array.isArray(ALLOWED_PATHS) && ALLOWED_PATHS.length === 2 && ALLOWED_PATHS.includes("/prototype/index.html") && ALLOWED_PATHS.includes("/prototype/local-vault.js"), "LP-04 static allowlist is not exact");
  check(typeof createRequestHandler === "function", "LP-04 missing pure request handler seam");

  if (typeof createRequestHandler === "function") {
    const server = http.createServer(createRequestHandler());
    try {
      await listen(server);
      const getIndex = await request(server, "/prototype/index.html");
      check(getIndex.status === 200 && getIndex.body.includes(Buffer.from("关系·今天")), "LP-04 allowlisted index GET failed");
      const headModule = await request(server, "/prototype/local-vault.js", "HEAD");
      check(headModule.status === 200 && headModule.body.length === 0, "LP-04 allowlisted module HEAD failed");
      const rootRedirect = await request(server, "/");
      check(rootRedirect.status === 302 && rootRedirect.headers.location === "/prototype/index.html#/sources", "LP-04 root does not redirect to the only main entry");
      check((await request(server, "/prototype/index.html", "POST")).status === 405, "LP-04 non-GET/HEAD method was not rejected");
      for (const target of [
        "/prototype/",
        "/AGENTS.md",
        "/prototype/../AGENTS.md",
        "/prototype/%2e%2e/AGENTS.md",
        "/prototype/..%2FAGENTS.md",
        "/prototype%5Clocal-vault.js",
        "/prototype/%00index.html",
        "/C:/Windows/win.ini"
      ]) {
        const result = await request(server, target);
        check(result.status >= 400 && !result.body.includes(Buffer.from("Agent Entry")), `LP-04 unsafe or unknown target was not rejected: ${target}`);
      }
    } catch (error) {
      failures.push(`LP-04 handler verification failed: ${error?.name || "request-error"}`);
    } finally {
      if (server.listening) await close(server);
    }
  }
}

const selfSource = fs.readFileSync(selfPath, "utf8");
const sources = [html, serverSource, selfSource];
const externalUrls = sources.flatMap(source => source.match(/https?:\/\/[^\s"'`<>]+/g) || [])
  .filter(url => !url.startsWith("http://127.0.0.1:8765"));
check(externalUrls.length === 0, `LP-05 external URL found: ${externalUrls[0] || "unknown"}`);
check(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/.test(serverSource), "LP-05 server contains a network client or telemetry seam");
for (const [label, source] of [["server", serverSource], ["pilot test", selfSource]]) {
  const imports = [...source.matchAll(/(?:from\s+|import\s*\()(["'])([^"']+)\1/g)].map(match => match[2]);
  for (const specifier of imports) {
    check(specifier.startsWith("node:") || (label === "server" && specifier === "./suiyin-mcp-client.mjs") || (label === "pilot test" && specifier === "./start-local-preview.mjs"), `LP-05 ${label} has a remote or third-party import: ${specifier}`);
  }
}
const legacyRunner = ["test", "prototype"].join("-") + ".mjs";
const importedSpecifiers = sources.flatMap(source => [...source.matchAll(/(?:from\s+|import\s*\()(["'])([^"']+)\1/g)].map(match => match[2]));
check(!importedSpecifiers.some(specifier => specifier === legacyRunner || specifier.endsWith(`/${legacyRunner}`)), "LP-05 legacy runner import/call found");

if (failures.length > 0) {
  console.error(`[FAIL] local pilot (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[PASS] local pilot");
console.log("- picker errors, vault status, first-use guidance, loopback allowlist, and no-network boundary verified");
