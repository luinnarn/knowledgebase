# IAM Domain (SysDesign::Compendium) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an 11th domain, Identity & Access Management (`sd-iam`), to SysDesign::Compendium — 8 new topics fully wired into the domain list, lazy topic loader, knowledge graph, and book references, verified by the integrity test suite and a headless-browser diagram sweep.

**Architecture:** Pure content + data addition using the existing multi-compendium architecture — no code/type changes required. Content lives in a new `Topic[]` file; it's wired into three existing per-compendium data files (`domains.ts`, `topics/index.ts`, `graph.ts`) plus four new entries in `books.ts`.

**Tech Stack:** TypeScript, Vitest (integrity suite), Vite, Mermaid (diagram blocks), puppeteer-core + Microsoft Edge (headless visual verification — no Chrome installed on this machine).

## Global Constraints

- New topic ids (frozen, do not deviate): `authentication-fundamentals`, `oauth2-and-openid-connect`, `sso-and-identity-federation`, `token-based-sessions-and-jwts`, `authorization-models`, `api-and-service-to-service-auth`, `zero-trust-architecture`, `secrets-management-and-credential-storage`.
- Domain id: `sd-iam`, title `Identity & Access Management`, color `#14B8A6`, inserted after `sd-networking` and before `sd-caching` in every file that lists domains in that order (`domains.ts`, `topics/index.ts`, `graph.ts`'s `topicNodeSpecs`).
- All `code` blocks must be Java — the app's syntax highlighter (`highlightJava`/`CodeBlock`) is Java-only, even for language-agnostic concepts (established convention from the CS::Compendium build).
- `keyPoints` are plain strings only — **no** `{ text, detail }` expandable-detail objects. All 10 existing System Design domains are still at this baseline; this domain must match it and stay consistent for a future uniform `content-pass` retrofit (confirmed with user).
- `refs[].book` must be one of the registered book keys only: the existing 10 (`ddia`, `database-internals`, `designing-distributed-systems`, `sdi-vol1`, `sdi-vol2`, `grokking-sdi`, `bytebytego-archive`, `web-scalability`, `sre-book`, `release-it`) plus the 4 new ones added in Task 2 (`oauth2-in-action`, `identity-mgmt-modern-apps`, `zero-trust-networks`, `api-security-in-action`). Every topic needs at least 1 ref (2 preferred, matching existing topic density).
- `[[topic-id]]` inline links and every `related` array entry must resolve to either one of the 8 new ids above, or one of these existing, already-authored SD topic ids: `service-mesh`, `api-gateways-and-service-discovery`, `microservices-vs-monolith`, `stateless-services-and-session-management`, `rate-limiting-algorithms`, `load-balancing`, `caching-fundamentals`, `monitoring-and-metrics`. Do not invent or guess any other existing topic id.
- Mermaid `diagram` blocks: avoid `%` or `==` characters inside a `|edge label|` — this previously broke the Mermaid parser in this compendium (fixed by rephrasing to words like `mod`/`is`). Prefer `flowchart TD` for architecture-style diagrams and `sequenceDiagram` for protocol flows (both used elsewhere in this compendium).
- Route pattern for manual verification: `/system-design/topics/sd-iam/<topicId>` (compendium-scoped routing, confirmed in `src/App.tsx:43`).

---

### Task 1: Author the IAM domain topic content

**Files:**
- Create: `src/data/system-design/topics/sd-iam.ts`

**Interfaces:**
- Consumes: `Topic`, `ContentBlock`, `KeyPoint`, `BookRef` types from `src/types/content.ts` (already defined, no changes needed). Reference `src/data/system-design/topics/sd-foundations.ts` for exact shape, prose density, and voice to match (dense, expert, opinionated — see e.g. its `scalability-fundamentals` and `cap-theorem` topics).
- Produces: `export const topics: Topic[]` — an array of exactly 8 `Topic` objects, each with `domainId: 'sd-iam'`, consumed by Task 2's `topicLoaders` registration.

The `Topic` shape (copy exactly from `src/types/content.ts`):
```ts
export type ContentBlock =
  | { kind: 'paragraph'; text: string } // supports **bold**, `code`, [[topic-id]] links
  | { kind: 'subheading'; text: string }
  | { kind: 'code'; title?: string; code: string; caption?: string }
  | { kind: 'pitfall'; title: string; text: string; code?: string; detail?: string }
  | { kind: 'bestPractice'; title: string; text: string; code?: string; detail?: string }
  | { kind: 'note'; title?: string; text: string; detail?: string }
  | { kind: 'table'; caption?: string; headers: string[]; rows: string[][] }
  | { kind: 'diagram'; title?: string; code: string; caption?: string } // Mermaid syntax

export interface BookRef {
  book: string    // must be a registered key — see Global Constraints
  chapter: string
}

export type KeyPoint = string  // this domain uses only the string form, no { text, detail }

export interface Topic {
  id: string
  domainId: string   // 'sd-iam' for every topic in this file
  title: string
  summary: string       // TL;DR, 1-3 sentences, supports **bold** and [[links]]
  keyPoints: KeyPoint[]  // 3-7 skimmable bullets (plain strings only, per Global Constraints)
  blocks: ContentBlock[] // deep dive — at least 1
  refs: BookRef[]        // at least 1, prefer 2
  related: string[]      // related topic ids
}
```

Author exactly these 8 topics, in this order, using the brief below for each. The brief gives the concrete facts, comparisons, and callouts each topic must cover — expand each into full prose `summary`/`keyPoints`/block text in the compendium's voice (see exemplar file), rather than copying the brief bullets verbatim as final keyPoints. Every topic needs a `diagram` block (Mermaid), at least one `table`, and a mix of `pitfall`/`bestPractice`/`note` blocks matching the exemplar's density (`sd-foundations.ts` topics average 5-6 blocks each).

1. **`authentication-fundamentals`** — title "Authentication Fundamentals"
   - Authentication ("who are you") vs authorization ("what can you do") — conflating them is a common design mistake
   - Password hashing must use a slow, salted algorithm (bcrypt/scrypt/Argon2), never a fast general-purpose hash (MD5/SHA-256 alone) which makes offline brute-force cheap
   - MFA factor categories: something you know / have / are — combining factors from *different* categories raises assurance, not just adding more of the same category
   - Passkeys/WebAuthn replace shared secrets with public-key challenge-response, eliminating phishable passwords and server-side password-breach risk
   - Credential stuffing exploits password reuse across sites; mitigations: rate limiting login attempts, CAPTCHA after failures, leaked-password checks, device fingerprinting — cross-link `[[rate-limiting-algorithms]]`
   - Exponential backoff per identity+IP beats hard account lockout, which is itself a denial-of-service vector against legitimate users
   - Blocks: table comparing hashing algorithms (MD5/SHA-256 vs bcrypt/scrypt/Argon2 — design goal, GPU-resistant?, typical use); sequence diagram of password login with salted-hash check + optional MFA step; Java code block validating a password against a stored hash via a `PasswordEncoder`-style interface; pitfall on rolling your own crypto / reversible password encryption; bestPractice on using a vetted library instead
   - refs: `identity-mgmt-modern-apps` ("Ch. 2 — Authentication Fundamentals"), `bytebytego-archive` ("Fundamentals — Password Hashing & MFA")
   - related: `['oauth2-and-openid-connect', 'token-based-sessions-and-jwts', 'rate-limiting-algorithms']`

2. **`oauth2-and-openid-connect`** — title "OAuth 2.0 & OpenID Connect"
   - OAuth 2.0 is a delegated **authorization** protocol (grants a client access on a user's behalf) — it is not an authentication protocol by itself
   - OpenID Connect (OIDC) is a thin identity layer on top of OAuth 2.0 that adds the ID token, giving the client verified proof of who the user is
   - Authorization Code + PKCE is the only grant type recommended for modern clients (SPAs, mobile, server apps); Implicit and Resource Owner Password grants are deprecated for leaking tokens/credentials
   - Three token types: authorization code (short-lived, exchanged once), access token (calls APIs), ID token (JWT describing the user, meant for the *client only* — never send it to an API as a bearer token)
   - PKCE binds the code exchange to the party that started the flow via a `code_verifier`/`code_challenge` pair, closing the interception gap for public clients that can't hold a secret
   - Scopes define what a token is authorized for; the `aud` (audience) claim defines who it's valid for — narrowing both limits the blast radius of a leaked token
   - Blocks: sequence diagram of the Authorization Code + PKCE flow (client → authorization server → redirect with code → token exchange → access+ID token → resource server); table of grant types (Auth Code+PKCE, Client Credentials, Refresh Token, and the two deprecated ones) with use case + status; Java code block validating a JWT access token's signature/audience/expiry; pitfall on using the ID token as an API bearer token
   - refs: `oauth2-in-action` ("Ch. 4 — The Authorization Code Grant"), `bytebytego-archive` ("Protocols — OAuth 2.0 and OpenID Connect Explained")
   - related: `['authentication-fundamentals', 'sso-and-identity-federation', 'token-based-sessions-and-jwts', 'api-and-service-to-service-auth']`

3. **`sso-and-identity-federation`** — title "SSO & Identity Federation"
   - Federation lets a user authenticate once at an Identity Provider (IdP) and access many Service Providers (SPs) without re-entering credentials, via an out-of-band trust relationship (metadata/certificates)
   - SAML (XML, browser-redirect assertions) remains the enterprise-SSO default for many established identity stacks; OIDC (JSON/JWT over OAuth2) is the modern default for anything new
   - Just-in-time (JIT) provisioning creates/updates a local user record from IdP assertion attributes on first login instead of requiring pre-provisioning
   - SCIM standardizes user/group lifecycle sync (create/update/deactivate) between IdP and downstream apps — solves the "employee left, access wasn't revoked" gap SSO alone doesn't close
   - SP-initiated vs IdP-initiated flows differ in where login starts, and matter for CSRF-style protections (`RelayState`/`state` parameter)
   - Federation moves trust, it doesn't eliminate risk — a compromised IdP session compromises every federated SP at once
   - Blocks: diagram of the SAML/OIDC federation flow (user → SP → redirect to IdP → auth → assertion/token posted back to SP); table comparing SAML vs OIDC (format, transport, primary use case, token type); note tying SCIM to `[[secrets-management-and-credential-storage]]` (deprovisioning) and `[[authorization-models]]` (permission removal); pitfall on skipping assertion audience/signature validation
   - refs: `identity-mgmt-modern-apps` ("Ch. 7 — SAML and Enterprise Federation"), `grokking-sdi` ("Key Concepts — Single Sign-On")
   - related: `['oauth2-and-openid-connect', 'authentication-fundamentals', 'authorization-models']`

4. **`token-based-sessions-and-jwts`** — title "Token-Based Sessions & JWTs"
   - Stateful sessions (server-side store + opaque cookie id) support instant revocation but need a shared store (e.g. Redis) once there's more than one server — cross-link `[[stateless-services-and-session-management]]`
   - Stateless sessions (signed tokens like JWTs) need no server-side lookup, but a stolen valid token can't be revoked before it expires — a fundamental tradeoff, not a solved problem
   - JWT = `header.payload.signature`, base64url-encoded — the payload is only *encoded*, not encrypted; never put secrets in a JWT payload
   - HS256 (shared-secret HMAC) requires every verifier to hold the signing secret; RS256/ES256 (asymmetric) let any service verify with a public key while only the issuer holds the private key
   - Short-lived access tokens (minutes) + long-lived refresh tokens (rotated on each use, reuse detection to catch theft) is the standard mitigation for "can't revoke a JWT"
   - Storage tradeoff: HttpOnly+Secure+SameSite cookies resist XSS but need CSRF defenses; localStorage resists CSRF but is fully exposed to any XSS on the page — no storage location is immune to both
   - Blocks: table of JWT storage locations (cookie vs localStorage) × (XSS exposure, CSRF exposure, cross-subdomain sharing); diagram of refresh-token rotation + reuse detection; Java code block decoding/verifying a JWT's signature and expiry; pitfall on algorithm-confusion attacks (trusting `alg: none` or not pinning the expected algorithm); bestPractice on rotating refresh tokens every use and revoking the whole family on detected reuse
   - refs: `api-security-in-action` ("Ch. 6 — Session Cookie and Token Authentication"), `oauth2-in-action` ("Ch. 6 — Tokens")
   - related: `['oauth2-and-openid-connect', 'authentication-fundamentals', 'stateless-services-and-session-management']`

5. **`authorization-models`** — title "Authorization Models: RBAC, ABAC & ReBAC"
   - RBAC assigns permissions to roles, users to roles — simple at small scale, but suffers "role explosion" as real access needs outgrow any fixed role hierarchy
   - ABAC evaluates policies against attributes of subject, resource, action, and environment (e.g. "finance dept AND business hours AND owns the record") — more expressive, harder to audit
   - ReBAC (relationship-based, Zanzibar-style) models permissions as a graph of relationships ("user is a member of group, group is an editor of doc") — fits sharing/collaboration products naturally
   - Centralizing authorization in a policy engine (e.g. OPA/Rego) decouples the "who can do what" decision from application code, giving one auditable place to change policy instead of scattered role checks in code
   - Coarse-grained checks belong at the edge (is this token valid, does its scope allow this endpoint); fine-grained, data-dependent checks (row-level, field-level) usually stay close to the data
   - Deny-by-default with explicit allow rules is safer than allow-by-default with explicit deny rules — a forgotten rule fails closed instead of open
   - Blocks: table comparing RBAC/ABAC/ReBAC (model, granularity, auditability, good fit); diagram of a ReBAC relationship graph (User —member of→ Group —editor of→ Document); Java code block for a simple `isAllowed(subject, action, resource)` policy check; pitfall on role explosion (dozens of near-duplicate roles); note tying enforcement to `[[api-and-service-to-service-auth]]`
   - refs: `identity-mgmt-modern-apps` ("Ch. 9 — Authorization Models"), `bytebytego-archive` ("Fundamentals — RBAC vs ABAC vs ReBAC")
   - related: `['authentication-fundamentals', 'api-and-service-to-service-auth', 'zero-trust-architecture']`

6. **`api-and-service-to-service-auth`** — title "API & Service-to-Service Authentication"
   - API keys are simple bearer secrets identifying a *caller* (not a user) — easy to leak (committed to source, logged), don't expire by default, carry no scoping unless the issuer builds it in
   - OAuth2 Client Credentials grant is the standard for service-to-service calls with no human user in the loop — the service authenticates as itself and gets a scoped access token
   - mTLS authenticates both sides of a connection via certificates — common inside a service mesh where every workload gets an identity certificate
   - SPIFFE/SPIRE issues short-lived, cryptographically verifiable workload identities (SVIDs) independent of network location — solves "which service am I actually talking to" in dynamic container environments
   - A service mesh's sidecar proxies can enforce mTLS and authorization policy transparently, without every service reimplementing auth — cross-link `[[service-mesh]]`
   - A leaked shared API key affects every caller using it; per-caller credentials or short-lived workload identities contain the blast radius of one compromised credential
   - Blocks: diagram of a service-mesh sidecar mTLS handshake between two workloads with SPIFFE IDs; table comparing API key vs OAuth client credentials vs mTLS (identifies, expiry, revocation, typical use); pitfall on a long-lived API key committed to a public repo or baked into an image; bestPractice on preferring short-lived, auto-rotated workload credentials; note tying to `[[api-gateways-and-service-discovery]]` as the edge validation layer
   - refs: `api-security-in-action` ("Ch. 11 — Securing Service-to-Service APIs"), `zero-trust-networks` ("Ch. 4 — Workload Identity")
   - related: `['authorization-models', 'zero-trust-architecture', 'service-mesh', 'api-gateways-and-service-discovery']`

7. **`zero-trust-architecture`** — title "Zero Trust Architecture"
   - Perimeter security assumes "inside the network = trusted" — once an attacker breaches the perimeter, lateral movement is largely unchecked; zero trust assumes breach and verifies every request regardless of network location
   - Core principle: "never trust, always verify" — every request is authenticated, authorized, and encrypted, whether it originates outside or inside the network
   - BeyondCorp (Google's internal implementation) replaced VPN-based access with per-request device+user verification, making the corporate network itself untrusted
   - Microsegmentation breaks a flat network into small zones with policy enforced between them, so a compromised workload can't freely reach unrelated services
   - Continuous verification includes device posture (patched, encrypted disk, managed) alongside user identity — a valid user on a compromised device is still a risk
   - Zero trust is applied gradually (identity-aware proxies, mTLS everywhere, short-lived credentials) — rarely a single product, and ties directly into `[[api-and-service-to-service-auth]]` and `[[authorization-models]]` for enforcement mechanics
   - Blocks: diagram comparing a flat, perimeter-trusted network to a microsegmented, per-request-verified one; table comparing perimeter vs zero trust (trust boundary, lateral-movement risk, verification frequency, key technologies); note summarizing the BeyondCorp case; pitfall on treating zero trust as "buy a VPN-replacement product" instead of an ongoing architectural shift
   - refs: `zero-trust-networks` ("Ch. 1 — Zero Trust Fundamentals"), `zero-trust-networks` ("Ch. 8 — Case Study: BeyondCorp")
   - related: `['api-and-service-to-service-auth', 'authorization-models', 'microservices-vs-monolith']`

8. **`secrets-management-and-credential-storage`** — title "Secrets Management & Credential Storage"
   - Secret sprawl — API keys, DB passwords, TLS private keys, signing keys scattered across env vars, config files, CI logs, and source control — is one of the most common root causes of real-world breaches
   - Dedicated secrets managers (HashiCorp Vault, AWS/GCP/Azure KMS) centralize storage, access control, and audit logging instead of every service inventing its own
   - Envelope encryption: encrypt data with a fast-to-rotate data encryption key (DEK), then encrypt the DEK itself with a rarely-rotated key-encryption key (KEK) held in a KMS/HSM — rotating the KEK doesn't require re-encrypting all the data
   - Dynamic secrets (short-lived, generated on demand per client — e.g. a Vault-issued database credential valid for an hour) shrink the exposure window compared to a static, long-lived password
   - Rotation policy matters as much as storage: a securely-stored secret that's never rotated is still a long-lived liability if it ever leaks silently
   - Secrets must never end up in source control, container images, or CI/CD logs — a leaked secret persists in git history even after a later commit removes it
   - Blocks: diagram of the envelope-encryption flow (DEK encrypts data, KEK in KMS encrypts DEK); table comparing static vs dynamic secrets (lifetime, exposure window, rotation effort, revocation); pitfall on a secret committed to git history; bestPractice on dynamic, short-lived, per-workload credentials with audited access; note tying to `[[api-and-service-to-service-auth]]` (workload identity and secrets management are often deployed together)
   - refs: `zero-trust-networks` ("Ch. 6 — Secrets and Credential Management"), `api-security-in-action` ("Ch. 5 — Protecting Credentials")
   - related: `['api-and-service-to-service-auth', 'zero-trust-architecture', 'token-based-sessions-and-jwts']`

- [ ] **Step 1: Write `src/data/system-design/topics/sd-iam.ts`**

Author the file per the type shape and 8-topic brief above. Start the file with:
```ts
import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  // ... 8 topic objects, in the order listed above
]
```

- [ ] **Step 2: Typecheck the new file**

Run: `npx tsc -b --noEmit`
Expected: no errors. (This only catches type-shape mistakes — e.g. a typo'd `ContentBlock` kind or a missing required field. It will NOT catch broken links, unregistered book keys, or unmatched `related`/`topicIds` — that's Task 2's job, once this file is wired into the domain plan and loader.)

- [ ] **Step 3: Commit**

```bash
git add src/data/system-design/topics/sd-iam.ts
git commit -m "$(cat <<'EOF'
content: author Identity & Access Management domain topics

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Wire the IAM domain into the compendium

**Files:**
- Modify: `src/data/system-design/books.ts`
- Modify: `src/data/system-design/domains.ts`
- Modify: `src/data/system-design/topics/index.ts`
- Modify: `src/data/system-design/graph.ts`

**Interfaces:**
- Consumes: `src/data/system-design/topics/sd-iam.ts` from Task 1 (`export const topics: Topic[]`, 8 topics with `domainId: 'sd-iam'` and the exact ids/refs/related listed in Task 1).
- Produces: a fully registered `sd-iam` domain — `data.domains`, `data.topicLoaders['sd-iam']`, `data.bookByKey` entries for the 4 new keys, and graph nodes/edges covering all 8 topics — consumed by the integrity test suite (no other task depends on this directly; it's the end of the wiring chain).

- [ ] **Step 1: Add the 4 new book entries**

In `src/data/system-design/books.ts`, add these 4 objects to the `books` array (order doesn't matter — `bookByKey` is derived automatically):
```ts
  { key: 'oauth2-in-action', title: 'OAuth 2 in Action', authors: 'Justin Richer, Antonio Sanso' },
  { key: 'identity-mgmt-modern-apps', title: 'Solving Identity Management in Modern Applications (2nd ed.)', authors: 'Yvonne Wilson, Abhishek Hingnikar' },
  { key: 'zero-trust-networks', title: 'Zero Trust Networks (2nd ed.)', authors: 'Razi Rais, Christina Morillo, Evan Gilman, Doug Barth' },
  { key: 'api-security-in-action', title: 'API Security in Action', authors: 'Neil Madden' },
```

- [ ] **Step 2: Add the domain entry**

In `src/data/system-design/domains.ts`, insert this object into the `domains` array immediately after the `sd-networking` object and before the `sd-caching` object:
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

- [ ] **Step 3: Register the topic loader**

In `src/data/system-design/topics/index.ts`, add this line to `topicLoaders`, immediately after the `'sd-networking'` line:
```ts
  'sd-iam': () => import('./sd-iam'),
```

- [ ] **Step 4: Add graph nodes and edges**

In `src/data/system-design/graph.ts`:

a) In `topicNodeSpecs`, add this entry immediately after the `'sd-networking'` entry:
```ts
  'sd-iam': [
    ['authentication-fundamentals', 'Authentication Fundamentals', 3],
    ['oauth2-and-openid-connect', 'OAuth 2.0 & OIDC', 3],
    ['sso-and-identity-federation', 'SSO & Identity Federation', 2],
    ['token-based-sessions-and-jwts', 'Token-Based Sessions & JWTs', 3],
    ['authorization-models', 'Authorization Models', 3],
    ['api-and-service-to-service-auth', 'API & Service-to-Service Auth', 2],
    ['zero-trust-architecture', 'Zero Trust Architecture', 2],
    ['secrets-management-and-credential-storage', 'Secrets Management', 2],
  ],
```

b) In `prerequisites`, add these 4 tuples (anywhere in the array — order doesn't matter to the integrity suite, but append at the end for a clean diff):
```ts
  ['authentication-fundamentals', 'oauth2-and-openid-connect'],
  ['oauth2-and-openid-connect', 'sso-and-identity-federation'],
  ['oauth2-and-openid-connect', 'token-based-sessions-and-jwts'],
  ['authorization-models', 'api-and-service-to-service-auth'],
```

c) In `related`, add these 15 tuples (append at the end) — this list was cross-checked against every topic's `related` array from Task 1 so the graph visualization matches the in-content links exactly:
```ts
  ['authentication-fundamentals', 'token-based-sessions-and-jwts'],
  ['authentication-fundamentals', 'rate-limiting-algorithms'],
  ['authentication-fundamentals', 'sso-and-identity-federation'],
  ['authentication-fundamentals', 'authorization-models'],
  ['oauth2-and-openid-connect', 'api-and-service-to-service-auth'],
  ['sso-and-identity-federation', 'authorization-models'],
  ['authorization-models', 'zero-trust-architecture'],
  ['api-and-service-to-service-auth', 'zero-trust-architecture'],
  ['secrets-management-and-credential-storage', 'api-and-service-to-service-auth'],
  ['secrets-management-and-credential-storage', 'zero-trust-architecture'],
  ['secrets-management-and-credential-storage', 'token-based-sessions-and-jwts'],
  ['api-and-service-to-service-auth', 'service-mesh'],
  ['api-and-service-to-service-auth', 'api-gateways-and-service-discovery'],
  ['zero-trust-architecture', 'microservices-vs-monolith'],
  ['token-based-sessions-and-jwts', 'stateless-services-and-session-management'],
```

- [ ] **Step 5: Run the integrity suite**

Run: `npm test`
Expected: PASS — all `describe.each` blocks green, including `compendium: system-design`'s `domains`, `topics`, and `graph` suites. If it fails, the assertion message names the exact topic/edge/ref at fault (e.g. `topic authentication-fundamentals inline link -> some-typo-id`) — fix the source (Task 1's file or this task's wiring) and re-run.

- [ ] **Step 6: Run the production build**

Run: `npm run build`
Expected: succeeds, including the new `sd-iam` lazy chunk (visible in the Vite build output topic-chunk list) and the prerender step (`scripts/prerender.mjs`) completing without error for the new routes.

- [ ] **Step 7: Commit**

```bash
git add src/data/system-design/books.ts src/data/system-design/domains.ts src/data/system-design/topics/index.ts src/data/system-design/graph.ts
git commit -m "$(cat <<'EOF'
feat: wire Identity & Access Management domain into System Design compendium

Registers the sd-iam domain, its topic loader, book refs, and graph
nodes/edges so the content authored in the previous commit is live.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Visual verification sweep for diagram errors

**Files:**
- Create (temporary, not committed): `$CLAUDE_JOB_DIR/tmp/verify-iam-diagrams.mjs` (or, outside a background-job session, any scratch path outside the repo — do not add this file to git)
- Modify (only if a diagram bug is found): `src/data/system-design/topics/sd-iam.ts`

**Interfaces:**
- Consumes: the 8 live routes `/system-design/topics/sd-iam/<topicId>` served by `vite preview`, from Task 2's build output.
- Produces: a pass/fail confirmation that none of the new domain's Mermaid `diagram` blocks render a `.diagram-error` element (`src/components/Diagram.tsx:101`, styled in `src/components/Diagram.css:58`) — the same check the original System Design domain build-out used, which previously caught one bad Mermaid edge label.

- [ ] **Step 1: Start a preview server of the built app**

Run (background): `npx vite preview --port 4173`
Expected: server listening on `http://localhost:4173`.

- [ ] **Step 2: Write the verification script**

Create `$CLAUDE_JOB_DIR/tmp/verify-iam-diagrams.mjs` (adjust the path if not running in a background job — any non-repo scratch path is fine):
```js
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const TOPIC_IDS = [
  'authentication-fundamentals',
  'oauth2-and-openid-connect',
  'sso-and-identity-federation',
  'token-based-sessions-and-jwts',
  'authorization-models',
  'api-and-service-to-service-auth',
  'zero-trust-architecture',
  'secrets-management-and-credential-storage',
]

const browser = await puppeteer.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: true,
})
const page = await browser.newPage()

const consoleErrors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => consoleErrors.push(`PAGEERROR ${err.message}`))

let failures = 0
for (const topicId of TOPIC_IDS) {
  const url = `${BASE}/system-design/topics/sd-iam/${topicId}`
  await page.goto(url, { waitUntil: 'networkidle0' })
  // Diagrams are lazy-loaded/async-rendered by Mermaid — give them a moment.
  await new Promise((r) => setTimeout(r, 800))
  const errorTexts = await page.$$eval('.diagram-error', (els) => els.map((el) => el.textContent))
  if (errorTexts.length > 0) {
    failures++
    console.log(`FAIL ${topicId}:`, errorTexts)
  } else {
    console.log(`OK   ${topicId}`)
  }
}

console.log(`\n${failures} of ${TOPIC_IDS.length} topics had diagram errors.`)
if (consoleErrors.length > 0) console.log('Console errors seen:', consoleErrors)

await browser.close()
process.exit(failures > 0 ? 1 : 0)
```

- [ ] **Step 3: Run the sweep**

Run: `node $CLAUDE_JOB_DIR/tmp/verify-iam-diagrams.mjs`
Expected: `OK` for all 8 topics, `0 of 8 topics had diagram errors`, exit code 0.

If any topic FAILs: open `src/data/system-design/topics/sd-iam.ts`, find that topic's `diagram` block, and fix the reported Mermaid syntax error (check first for `%`/`==` inside a `|label|`, per the Global Constraints note — this was the exact bug the original domain build hit). Re-run this step until all 8 pass.

- [ ] **Step 4: Stop the preview server**

Kill the `vite preview` process started in Step 1.

- [ ] **Step 5: Commit, only if Step 3 required a fix**

If no fix was needed, skip this step — Task 2's commit already reflects the final, verified state.

If a fix was needed:
```bash
git add src/data/system-design/topics/sd-iam.ts
git commit -m "$(cat <<'EOF'
fix: correct Mermaid diagram syntax in sd-iam topic content

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
