STATUS: PREVIEW-VALIDATED

# T028/T030/T031 implementation validation

Validated on 2026-08-20 with code-authored fictional fixtures only.

## Outcome

- Existing Suiyin MCP reads are discovered through a read-only semantic allowlist; local mapping, pagination, permission and receipt failures fail closed with `LOCAL_SUIYIN_*` codes.
- WeChat and Suiyin source cards share one strict six-metric receipt projection.
- Canonical trusted Moments flow from MCP adapter to vault, query projection and encrypted backup/restore without group/chat fallback.
- The feed is capped at 50 items per page, supports safe source filtering and 200ms latest-wins search, and exposes no raw source/person/signal IDs in DOM attributes.
- Classification uses generation-bound opaque tokens; stale tokens perform zero writes and the registry stays bounded to the active graph/generation.
- Legacy 10-digit seconds, 13-digit milliseconds and valid ISO instants normalize to one canonical ISO value; ambiguous or invalid time input fails closed.

## Commands

The following commands passed from this directory:

```text
node --check prototype/local-vault.js
node --check scripts/suiyin-mcp-client.mjs
node --check scripts/start-local-preview.mjs
node scripts/test-local-vault.mjs
node scripts/test-suiyin-mcp.mjs
node scripts/test-pilot.mjs
node scripts/lint-prototype.mjs
```

All seven commands above pass on this sanitized public snapshot. The private implementation tuple separately passed E4 functional and E5 privacy/bounds review; its source bytes intentionally differ from this public derivative where privacy-safe substitutions are required.

## Sanitized provenance

The issued orchestration contracts, issuance manifests and local detailed reports remain private by design. Their non-sensitive integrity anchors are recorded here so the public payload can be traced without publishing local paths or private review material.

| Task | Contract ID | Contract SHA-256 | Issuance input revision | Issuance manifest SHA-256 | Local report SHA-256 | Disclosure |
|---|---|---|---|---|---|---|
| T028 | `CONTRACT-T028-V2` | `492241B83BBFD789E66B7E7D388869DFD522E3C5AF77D2BC26977FEE9BFA5F39` | `B08344F9296E7D99F82F4D631D4F8C3130932A3B24C64D12A8C66FEE47BD0070` | `40B72AE7CFC82287AE71F7D20898FA513CDE3738D645D2CA67BC219C01398BFD` | `267219429C8020AB943A9E605C2556DA834E706C2EF0DEEFD4010FD0EDE65D40` | `not_public_by_design` |
| T030 | `CONTRACT-T030` | `CC97FBFDA2E0B2098FF01DCA3AD604EB5F2A2EE8202DD8B9854CA70C49A8F142` | `85DF1F07E01428C65229D4ACB46C77C44B6C4F69B09669F447DBFC595C076295` | `4AF717FE5429A131D59478BDDC8F8A1590059096BAA77F43A25DF62EE8411D9F` | `EF6CA3A3101C31A2E62C7A839819C685265F6EFE3C097264BEA5E2E738DDA12B` | `not_public_by_design` |
| T031 | `CONTRACT-T031` | `4660C1C23DB8E2F202232A4B5B1ED3E723613DD5ACD3E6C97B1FB6D431314F05` | `A3535681275DED1C1A4BE5CD3BC1AA0EF87EC28AADAB98AD10571965E361BA0A` | `0D5B745BC2A88A39C207123BD7287D06245CF3FB4C64D541F5D0322DC04F0A77` | `2CBDAD7560D82E15FB18B79B35A1D0CDAE649D463EB6EACF3245E59AD10ED4B5` | `not_public_by_design` |

The immutable `v2026082002-existing-mcp-read-correction` SDD package correctly says implementation had not started at issuance time. This delivery tag adds later implementation evidence only; it does not mutate the `1.1.0` SDD or its historical state.

## Public-snapshot sanitization

- Private persona labels are replaced by explicit `虚构官方*` labels.
- Private aggregate values are replaced by deliberately non-matching synthetic test counts.
- The private MCP environment identifier is not embedded; runtime wiring requires `SUIYIN_MCP_ENVIRONMENT`, while executable tests use `fictional-sandbox`.
- The 20 inline UI examples are hand-authored synthetic copy with numbered `虚构联系人*` names. They are not sampled from the encrypted relationship graph.
- These substitutions do not change the six-metric state machine, provenance rules, pagination/completeness gates, trusted-Moments projection, filtering, classification or fail-closed behavior.

## Privacy evidence boundary

No live MCP call, browser IndexedDB export, real contact/chat/Moments body, screenshot, credential, raw cursor, local handle or private DOM capture is included in this package. The included export fixture and inline UI examples are explicitly fictional and are only used by executable tests or static preview copy.

The repository-level `_redirects` rule redirects every Pages request under `/hosted/*` to `/`, so this source snapshot cannot become the hosted stateful entry while remaining downloadable from GitHub for local engineering use.
