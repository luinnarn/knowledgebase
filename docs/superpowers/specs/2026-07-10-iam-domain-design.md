# Design: Identity & Access Management domain for SysDesign::Compendium

## Context

SysDesign::Compendium currently has 10 domains / 57 topics (`src/data/system-design/`). None of them cover authentication, authorization, or identity — a grep across all existing SD topic files turns up only passing mentions (a rate-limiting example, an API-gateway aside), never a dedicated treatment. This adds an 11th domain, **Identity & Access Management**, following the exact architecture already used by the other 10 domains and by the CS::Compendium build-out: `Domain` entry → `topicLoaders` entry → a `Topic[]` file → graph nodes/edges → book refs.

No architectural changes are needed — this is a content addition using existing infrastructure (typed content model in `src/types/content.ts`, lazy-loaded topic chunks, the d3-force graph, the integrity test suite).

## Domain metadata

Added to `src/data/system-design/domains.ts`, positioned after `sd-networking` and before `sd-caching` (all other domains keep their current position/color):

```ts
{
  id: 'sd-iam',
  title: 'Identity & Access Management',
  blurb: 'Who is this request from, and what are they allowed to do — the authentication and authorization layer every other domain in this compendium quietly assumes already works.',
  color: '#14B8A6',
  topicIds: [
    'authentication-fundamentals',
    'oauth2-and-openid-connect',
    'sso-and-identity-federation',
    'token-based-sessions-and-jwts',
    'authorization-models',
    'api-and-service-to-service-auth',
    'zero-trust-architecture',
    'secrets-management-and-credential-storage',
  ],
},
```

`#14B8A6` (teal) is distinct from all 10 existing domain colors (blue, cyan, amber, green, purple, indigo, red, pink, emerald, orange).

## Topics (8)

Each topic follows the standard `Topic` shape (`summary`, `keyPoints`, mixed `blocks` — table/diagram/code/pitfall/note/bestPractice/paragraph, `refs`, `related`), at the same density as existing SD topics (e.g. `scalability-fundamentals`). Roughly 8-10 `diagram` blocks across the domain in total — in line with non-case-study domains, not case-study-level saturation.

1. **`authentication-fundamentals`** — passwords/hashing (bcrypt/argon2), MFA (TOTP, WebAuthn/passkeys), credential stuffing, login-endpoint rate limiting.
2. **`oauth2-and-openid-connect`** — delegated authorization vs. authentication, authorization code flow + PKCE, ID tokens vs. access tokens, client types, why implicit/password grants are deprecated.
3. **`sso-and-identity-federation`** — SAML vs. OIDC federation, IdP/SP roles, just-in-time provisioning, SCIM for lifecycle sync.
4. **`token-based-sessions-and-jwts`** — stateless vs. stateful sessions, JWT structure/signing (HS256 vs. RS256), the revocation problem, refresh-token rotation, cookie vs. localStorage storage tradeoffs (CSRF vs. XSS).
5. **`authorization-models`** — RBAC role explosion, ABAC, ReBAC (Zanzibar-style), policy engines (OPA), centralized vs. embedded authorization checks.
6. **`api-and-service-to-service-auth`** — API keys vs. OAuth client-credentials grant, mTLS, workload identity (SPIFFE/SPIRE), service-mesh identity.
7. **`zero-trust-architecture`** — perimeter model vs. zero trust, continuous verification, BeyondCorp, microsegmentation, device posture.
8. **`secrets-management-and-credential-storage`** — secret sprawl, dedicated secrets managers (Vault, KMS), rotation, envelope encryption, avoiding secrets in env vars/code/CI logs.

Topic ids are new and don't collide with any existing id in the SD compendium.

## Book references

Added to `src/data/system-design/books.ts`, as citation anchors only — consistent with how the rest of the compendium was built (content authored from expertise, not extracted from these books' PDFs; no PDF sourcing needed for these four):

```ts
{ key: 'oauth2-in-action', title: 'OAuth 2 in Action', authors: 'Justin Richer, Antonio Sanso' },
{ key: 'identity-mgmt-modern-apps', title: 'Solving Identity Management in Modern Applications (2nd ed.)', authors: 'Yvonne Wilson, Abhishek Hingnikar' },
{ key: 'zero-trust-networks', title: 'Zero Trust Networks (2nd ed.)', authors: 'Razi Rais, Christina Morillo, Evan Gilman, Doug Barth' },
{ key: 'api-security-in-action', title: 'API Security in Action', authors: 'Neil Madden' },
```

## Graph wiring

In `src/data/system-design/graph.ts`:
- Add an `'sd-iam'` entry to `topicNodeSpecs` with the 8 `[id, label, importance]` tuples (hub node and `part-of` edges are generated automatically from `domains`/`topicNodes`, same as every other domain).
- `prerequisites`: `authentication-fundamentals → oauth2-and-openid-connect`, `oauth2-and-openid-connect → sso-and-identity-federation`, `oauth2-and-openid-connect → token-based-sessions-and-jwts`, `authorization-models → api-and-service-to-service-auth`.
- `related` (cross-domain): `api-and-service-to-service-auth ↔ service-mesh`, `api-and-service-to-service-auth ↔ api-gateways-and-service-discovery`, `zero-trust-architecture ↔ microservices-vs-monolith`, `token-based-sessions-and-jwts ↔ stateless-services-and-session-management`.

## Expandable detail: deferred

All 10 existing SD domains are still at the pre-`content-pass` baseline (plain-string `keyPoints`, no `detail` fields on callouts) — the expandable-detail retrofit hasn't been rolled out to System Design yet (memory: "Remaining known work: all 10 System Design topic files untouched for expandable-detail"). This new domain will be authored at that same baseline rather than shipping deepened from day one, so it stays consistent with its siblings and gets picked up in a future uniform `content-pass` sweep across all 11 SD domains together — confirmed with the user.

## Execution approach

1. One fresh, non-fork subagent authors `src/data/system-design/topics/sd-iam.ts` — given the frozen topic-id list above, the book-key list, and `sd-foundations.ts` as a shape/voice exemplar. Keeps the ~600+ lines of generated prose out of the coordinating conversation, mirroring the `content-pass` skill's dispatch pattern.
2. The coordinator (not the subagent) makes the mechanical, cross-cutting edits itself: `domains.ts` entry, `topics/index.ts` loader registration, `graph.ts` nodes/edges, `books.ts` additions.
3. Verification: `npm test` (integrity suite — validates `[[topic-id]]` links, graph edges, `topicIds` ↔ loaded topics match, 1:1 summary/class checks where applicable) and `npm run build`.
4. Visual verification: full sweep (not spot-check) of all 8 new topic pages via the existing Edge/puppeteer `scripts/verify-visual.mjs` pipeline, checking for `.diagram-error` elements — this is the same approach that caught a Mermaid syntax bug during the original SD domain build-out.
5. Commit.

## Testing

- `src/data/integrity.test.ts` (existing, generalized via `describe.each` over `compendiumRegistry` — no new test file needed) must pass with the new domain's 8 topics, graph nodes/edges, and `topicIds`.
- Headless-browser diagram sweep (step 4 above) must show zero `.diagram-error` elements across the 8 new pages.
- `npm run build` must succeed (new lazy chunk for `sd-iam` topics).

## Out of scope

- Expandable `detail` fields (deferred, see above).
- A dedicated IAM case study under `sd-case-studies` (could be a natural follow-up — e.g. "Designing an SSO/IdP system" — but not part of this addition).
- Retrofitting existing topics that mention auth in passing (e.g. rate-limiting's login example) to cross-link into the new domain — could be a light follow-up, not required for this domain to stand on its own.
