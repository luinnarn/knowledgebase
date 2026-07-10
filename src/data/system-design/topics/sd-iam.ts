import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'authentication-fundamentals',
    domainId: 'sd-iam',
    title: 'Authentication Fundamentals',
    summary:
      'Authentication answers **"who are you"**; authorization ([[authorization-models]]) answers **"what can you do"** — conflating the two is one of the most common access-control design mistakes. Getting authentication wrong (weak hashing, no MFA, no rate limiting) undermines every authorization decision built on top of it.',
    keyPoints: [
      'Authentication verifies identity; authorization decides what an authenticated identity may do — treating them as one step instead of two independent decisions is a recurring design mistake',
      'Password hashing must use a slow, purpose-built, salted algorithm (bcrypt, scrypt, Argon2) — a fast general-purpose hash like MD5 or bare SHA-256 lets an attacker who steals the hash table brute-force billions of guesses per second on commodity GPUs',
      'MFA factors fall into three categories — something you **know** (password), something you **have** (phone, hardware key), something you **are** (biometric) — assurance goes up only when factors come from *different* categories, not from piling on more of the same one',
      "Passkeys (WebAuthn) replace a shared secret with public-key challenge-response: the private key never leaves the device, so there's no password to phish and no server-side password database to breach",
      'Credential stuffing replays password/username pairs leaked from one breach against every other site, banking on password reuse; defenses include rate limiting ([[rate-limiting-algorithms]]), CAPTCHA after repeated failures, leaked-password checks at signup, and device fingerprinting',
      'Exponential backoff scoped to identity+IP slows a real attacker without punishing legitimate users; a hard account lockout after N failures is itself a denial-of-service vector — anyone who knows a username can lock out its owner',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Password hashing algorithms compared',
        headers: ['Algorithm', 'Design goal', 'GPU/ASIC-resistant?', 'Typical use'],
        rows: [
          ['MD5', 'Fast checksumming', 'No — billions of hashes/sec on a GPU', 'Never for passwords; fine for non-security checksums'],
          ['SHA-256 (unsalted, single pass)', 'Fast general-purpose hashing', 'No — same GPU brute-force problem', 'Never alone for passwords; fine as a building block inside HMAC'],
          ['bcrypt', 'Deliberately slow, tunable cost factor', 'Partially — resists early GPUs, less so ASICs', 'Long-standing default for password storage'],
          ['scrypt', 'Slow *and* memory-hard', 'Yes — memory cost blocks cheap parallel hardware', 'Password storage where memory-hardness matters most'],
          ['Argon2 (id variant)', 'Winner of the Password Hashing Competition; tunable time/memory/parallelism', 'Yes — designed to resist GPU/ASIC/FPGA', 'Current best-practice default for new systems'],
        ],
      },
      {
        kind: 'diagram',
        title: 'Password login with salted-hash check and optional MFA',
        code: 'sequenceDiagram\n  participant U as User\n  participant S as Auth Service\n  participant D as Password Store\n  U->>S: submit username + password\n  S->>D: fetch salt + stored hash\n  D-->>S: salt, hash\n  S->>S: recompute hash and compare to stored hash\n  alt hash mismatch\n    S-->>U: reject\n  else hash matches\n    S->>U: request second factor\n    U->>S: submit MFA code\n    S->>S: verify code\n    S-->>U: issue session/token\n  end',
        caption: 'The stored hash is never reversed — the login attempt is re-hashed with the same salt and compared',
      },
      {
        kind: 'code',
        title: 'Validating a password via a PasswordEncoder-style interface',
        code: 'interface PasswordEncoder {\n    String encode(CharSequence rawPassword);\n    boolean matches(CharSequence rawPassword, String encodedPassword);\n}\n\nclass LoginService {\n    private final PasswordEncoder encoder; // backed by BCrypt/Argon2, never a raw digest\n    private final UserRepository users;\n\n    boolean authenticate(String username, String rawPassword) {\n        User user = users.findByUsername(username).orElse(null);\n        if (user == null) {\n            encoder.matches(rawPassword, DUMMY_HASH); // do the same work for unknown users\n            return false;\n        }\n        return encoder.matches(rawPassword, user.getPasswordHash());\n    }\n}',
        caption: "matches() re-derives the hash using the stored salt and cost factor and compares — a correctly hashed password cannot be decrypted at all, only re-verified",
      },
      {
        kind: 'pitfall',
        title: 'Rolling your own crypto or reversible password "encryption"',
        text: "Storing passwords encrypted (reversible) instead of hashed means that whoever holds the encryption key can recover every password in plaintext — a single key compromise unravels the entire user base at once. Home-grown hashing schemes fare no better: they routinely miss salting, timing side channels, and algorithm agility, and are never audited at the scale a widely-used library is.",
      },
      {
        kind: 'bestPractice',
        title: 'Delegate to a vetted library, never hand-roll',
        text: "Use an established password-hashing abstraction (Spring Security's PasswordEncoder, libsodium, Bouncy Castle) rather than composing hash functions by hand. These libraries pick sane defaults, handle salting automatically, and get security-reviewed continuously — properties a one-off implementation almost never has.",
      },
      {
        kind: 'note',
        title: 'Passkeys remove the shared secret entirely',
        text: "A password is a shared secret both the user and the server must protect — one leaked database compromises every account that reused it elsewhere. WebAuthn-based passkeys replace that shared secret with a public/private key pair generated on the device: the server only ever stores a public key, so there is nothing left for a breach to leak that would let an attacker authenticate as the user.",
      },
    ],
    refs: [
      { book: 'identity-mgmt-modern-apps', chapter: 'Ch. 2 — Authentication Fundamentals' },
      { book: 'bytebytego-archive', chapter: 'Fundamentals — Password Hashing & MFA' },
    ],
    related: ['oauth2-and-openid-connect', 'token-based-sessions-and-jwts', 'rate-limiting-algorithms'],
  },

  {
    id: 'oauth2-and-openid-connect',
    domainId: 'sd-iam',
    title: 'OAuth 2.0 & OpenID Connect',
    summary:
      "OAuth 2.0 is a delegated **authorization** protocol — it lets a client obtain limited access to a resource on a user's behalf — not an authentication protocol; OpenID Connect (OIDC) layers a verified identity (the **ID token**) on top of it to answer who the user actually is.",
    keyPoints: [
      "OAuth 2.0 grants a client an access token scoped to act on a user's behalf against an API — it says nothing, by itself, about who the user is",
      'OpenID Connect (OIDC) is a thin identity layer on OAuth 2.0 that adds the **ID token** (a JWT describing the authenticated user) — this is what actually gives the client proof of identity',
      'Authorization Code + PKCE is the only grant recommended for modern clients (SPAs, mobile apps, server apps); the Implicit grant (tokens in the URL fragment) and Resource Owner Password Credentials grant (client handles raw credentials) are deprecated for leaking tokens and passwords',
      'Three distinct tokens: the **authorization code** (short-lived, single-use, exchanged at the token endpoint), the **access token** (presented to APIs), and the **ID token** (a JWT for the client to read) — the ID token is not a bearer credential and should never be sent to an API',
      'PKCE adds a `code_verifier`/`code_challenge` pair generated by the client: the authorization server only releases tokens to whoever holds the original verifier, closing the interception gap for public clients that cannot keep a secret',
      "**Scope** narrows what a token can do; **`aud`** (audience) narrows who may accept it — tightening both limits how much damage a leaked token can cause",
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Authorization Code + PKCE flow',
        code: 'sequenceDiagram\n  participant C as Client (SPA/mobile)\n  participant U as User (browser)\n  participant AS as Authorization Server\n  participant RS as Resource Server\n  C->>C: generate code_verifier, derive code_challenge\n  C->>U: redirect to AS with code_challenge\n  U->>AS: authenticate + consent\n  AS-->>U: redirect back with authorization code\n  U->>C: authorization code\n  C->>AS: exchange code + code_verifier for tokens\n  AS-->>C: access token + ID token (+ refresh token)\n  C->>RS: call API with access token\n  RS-->>C: response',
        caption: "The code_verifier never leaves the client until the final exchange, so an intercepted redirect alone can't be used to claim the tokens",
      },
      {
        kind: 'table',
        caption: 'OAuth 2.0 grant types',
        headers: ['Grant type', 'Use case', 'Status'],
        rows: [
          ['Authorization Code + PKCE', 'SPAs, mobile apps, server-side web apps', 'Recommended for all modern clients'],
          ['Client Credentials', 'Service-to-service, no user in the loop', 'Recommended for machine-to-machine'],
          ['Refresh Token', 'Silently obtaining new access tokens', 'Recommended, paired with rotation'],
          ['Implicit', 'Legacy SPAs (token returned directly in the redirect)', 'Deprecated — leaks tokens via browser history/referrer'],
          ['Resource Owner Password Credentials', 'Legacy first-party trusted apps', 'Deprecated — exposes raw credentials to the client'],
        ],
      },
      {
        kind: 'code',
        title: "Validating a JWT access token's signature, audience, and expiry",
        code: 'JwtParser parser = Jwts.parserBuilder()\n    .setSigningKey(issuerPublicKey)   // RS256/ES256: verify with the issuer\'s public key\n    .build();\n\nJws<Claims> parsed;\ntry {\n    parsed = parser.parseClaimsJws(accessToken);\n} catch (JwtException e) {\n    throw new UnauthorizedException("invalid signature or malformed token");\n}\n\nClaims claims = parsed.getBody();\nif (!claims.getAudience().equals(expectedAudience)) {\n    throw new UnauthorizedException("token not intended for this API");\n}\nif (claims.getExpiration().before(new Date())) {\n    throw new UnauthorizedException("token expired");\n}',
        caption: 'Signature, audience, and expiry are the three checks every resource server must perform — skipping any one accepts a token that was never meant for it',
      },
      {
        kind: 'pitfall',
        title: 'Treating the ID token as an API bearer token',
        text: "The ID token is meant for the client to read, describing the authentication event — it was never issued to authorize a call to a resource server. Sending it to an API as if it were an access token routinely bypasses scoping entirely, since many APIs don't correctly validate an audience that was never meant for them in the first place.",
      },
      {
        kind: 'bestPractice',
        title: 'Use PKCE even for confidential clients',
        text: 'PKCE was originally designed for public clients that cannot hold a secret, but OAuth 2.1 recommends it universally: it costs nothing for a confidential client and closes the same authorization-code-interception gap regardless of client type. There is no longer a good reason to omit it.',
      },
    ],
    refs: [
      { book: 'oauth2-in-action', chapter: 'Ch. 4 — The Authorization Code Grant' },
      { book: 'bytebytego-archive', chapter: 'Protocols — OAuth 2.0 and OpenID Connect Explained' },
    ],
    related: ['authentication-fundamentals', 'sso-and-identity-federation', 'token-based-sessions-and-jwts', 'api-and-service-to-service-auth'],
  },

  {
    id: 'sso-and-identity-federation',
    domainId: 'sd-iam',
    title: 'SSO & Identity Federation',
    summary:
      'Federation lets a user authenticate once at an **Identity Provider (IdP)** and access many **Service Providers (SPs)** without re-entering credentials, via an out-of-band trust relationship — SAML remains the enterprise default, OIDC ([[oauth2-and-openid-connect]]) the modern one for anything new.',
    keyPoints: [
      'Federation separates *where* a user authenticates (the IdP) from *what* they access (many SPs) — trust between them is established out-of-band via exchanged metadata and certificates, not per-login',
      'SAML (XML assertions over browser redirects) is still the enterprise-SSO backbone for many established identity stacks; OIDC (JSON/JWT on top of OAuth 2.0) is the default choice for anything built new',
      'Just-in-time (JIT) provisioning creates or updates a local user record from the attributes in an IdP assertion on first login, instead of requiring an admin to pre-create every account',
      'SCIM standardizes user/group lifecycle sync (create, update, deactivate) between the IdP and downstream apps — it closes the gap SSO alone leaves open: the employee left the company, but their access in a dozen SaaS apps was never revoked',
      "SP-initiated flows start at the service provider, which redirects to the IdP; IdP-initiated flows start at the identity provider's own portal — the distinction matters for CSRF-style protections carried in `RelayState` (SAML) or `state` (OIDC)",
      'Federation moves trust, it does not eliminate it: a compromised IdP session — or the IdP itself — compromises every federated SP behind it at once, making the IdP the single highest-value target in the whole system',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'SAML/OIDC federation flow',
        code: 'sequenceDiagram\n  participant U as User\n  participant SP as Service Provider\n  participant IdP as Identity Provider\n  U->>SP: request protected resource\n  SP-->>U: redirect to IdP (SAML AuthnRequest / OIDC authorize)\n  U->>IdP: authenticate\n  IdP-->>U: redirect back with assertion/token\n  U->>SP: post assertion (SAML) or code/token (OIDC)\n  SP->>SP: validate signature + audience\n  SP-->>U: session established',
        caption: 'The user never gives the SP their IdP credentials directly — the SP only ever sees a signed assertion or token',
      },
      {
        kind: 'table',
        caption: 'SAML vs OIDC',
        headers: ['', 'SAML', 'OIDC'],
        rows: [
          ['Format', 'XML', 'JSON / JWT'],
          ['Transport', 'Browser redirect + POST binding', 'OAuth 2.0 redirects + token endpoint'],
          ['Primary use case', 'Enterprise SSO into legacy/established stacks', 'Modern web/mobile apps, consumer + enterprise'],
          ['Token type', 'Signed XML assertion', 'ID token (JWT) + access token'],
        ],
      },
      {
        kind: 'note',
        title: 'SCIM closes the offboarding gap SSO leaves open',
        text: 'SSO controls the front door — can this person log in — but says nothing about what stale entitlements they still hold in each app. SCIM-driven deprovisioning ties directly into [[secrets-management-and-credential-storage]] (revoking any standing credentials tied to the account) and [[authorization-models]] (removing roles/permissions), which is why a federation rollout is incomplete without a SCIM or equivalent deprovisioning pipeline behind it.',
      },
      {
        kind: 'pitfall',
        title: 'Skipping assertion audience or signature validation',
        text: "An SP that accepts any signed assertion without checking it was issued for *this* SP, or without correctly validating the IdP's signing certificate (including rotation), is vulnerable to assertions minted for a different SP or, worse, forged ones. The entire trust model of federation rests on that validation being exact, on every single login.",
      },
      {
        kind: 'paragraph',
        text: "JIT provisioning trades administrative overhead for a different risk: since the local record is built from whatever attributes the assertion carries, an SP must treat the IdP as the source of truth for those attributes and re-evaluate them on every login — a stale local copy of group membership from six months ago silently drifts from what the IdP would say today.",
      },
    ],
    refs: [
      { book: 'identity-mgmt-modern-apps', chapter: 'Ch. 7 — SAML and Enterprise Federation' },
      { book: 'grokking-sdi', chapter: 'Key Concepts — Single Sign-On' },
    ],
    related: ['oauth2-and-openid-connect', 'authentication-fundamentals', 'authorization-models'],
  },

  {
    id: 'token-based-sessions-and-jwts',
    domainId: 'sd-iam',
    title: 'Token-Based Sessions & JWTs',
    summary:
      "Stateful sessions (server-side store + opaque cookie) support instant revocation but need a shared store once there's more than one server; stateless sessions (signed tokens like JWTs) need no lookup but can't be revoked before they expire — a fundamental tradeoff, not a solved problem.",
    keyPoints: [
      'Stateful sessions: the server holds session state, the client holds only an opaque id — revocation is instant (delete the row), but every server needs access to the same store ([[stateless-services-and-session-management]]), typically Redis, once there is more than one instance',
      'Stateless sessions: a signed token (JWT) carries its own claims, verified without a server-side lookup — cheap to scale horizontally, but a stolen valid token remains valid until it expires; there is no "delete the row"',
      'A JWT is `header.payload.signature`, each part base64url-encoded — the payload is *encoded*, not encrypted, and readable by anyone holding the token; secrets never belong in a JWT payload',
      'HS256 (HMAC, shared secret) requires every verifier to hold the same signing secret, which means every verifier could also forge tokens; RS256/ES256 (asymmetric) let any number of services verify with a public key while only the issuer holds the private signing key',
      "The standard mitigation for \"can't revoke a JWT\": short-lived access tokens (minutes) plus long-lived refresh tokens that rotate on every use, with reuse detection — a refresh token used twice signals theft and revokes the whole token family",
      'Storage is a genuine tradeoff, not a solved problem: HttpOnly+Secure+SameSite cookies are inaccessible to page JavaScript (resist XSS) but need CSRF defenses; localStorage is immune to CSRF but fully readable by any script on the page (any XSS exposes it) — no storage location defeats both attack classes',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'JWT storage locations, by exposure',
        headers: ['Storage', 'XSS exposure', 'CSRF exposure', 'Cross-subdomain sharing'],
        rows: [
          ['HttpOnly+Secure+SameSite cookie', 'Low — inaccessible to page JS', 'Needs explicit defenses (SameSite, CSRF token)', 'Easy via the Domain attribute'],
          ['localStorage', 'High — any XSS can read and exfiltrate it', 'None — not sent automatically with requests', 'Not shared across subdomains by default'],
        ],
      },
      {
        kind: 'diagram',
        title: 'Refresh-token rotation with reuse detection',
        code: 'sequenceDiagram\n  participant C as Client\n  participant AS as Auth Server\n  C->>AS: refresh_token (v1)\n  AS->>AS: mark v1 used, issue v2\n  AS-->>C: new access token + refresh_token (v2)\n  Note over C,AS: attacker later replays stolen v1\n  C->>AS: refresh_token (v1) [already used]\n  AS->>AS: detect reuse of a consumed token\n  AS-->>C: reject + revoke entire token family',
        caption: 'Reusing an already-rotated refresh token is a theft signal, not a legitimate race — the whole family gets revoked, not just the reused token',
      },
      {
        kind: 'code',
        title: "Verifying a JWT's signature, pinned algorithm, and expiry",
        code: 'JwtParser parser = Jwts.parserBuilder()\n    .setSigningKey(issuerPublicKey)\n    .build();               // configured to accept ONLY RS256 — never trust the token\'s own "alg" header\n\nClaims claims;\ntry {\n    claims = parser.parseClaimsJws(token).getBody();\n} catch (SignatureException | ExpiredJwtException | MalformedJwtException e) {\n    throw new UnauthorizedException("token rejected: " + e.getMessage());\n}\n\nInstant expiry = claims.getExpiration().toInstant();\nif (expiry.isBefore(Instant.now())) {\n    throw new UnauthorizedException("token expired");\n}',
        caption: 'A parser must be configured with the expected algorithm ahead of time — deriving it from the token itself is exactly the algorithm-confusion vulnerability below',
      },
      {
        kind: 'pitfall',
        title: 'Algorithm-confusion attacks',
        text: 'A JWT library that trusts the token\'s own `alg` header is exploitable: an attacker can submit a token with `alg: none` (no signature required) or switch from RS256 to HS256 and sign it using the server\'s *public* key as if it were an HMAC secret — both bypass verification entirely if the verifier does not pin the algorithm ahead of time. Always configure the expected algorithm on the verifier; never derive it from the token.',
      },
      {
        kind: 'bestPractice',
        title: 'Rotate refresh tokens on every use, revoke the family on reuse',
        text: 'Issue a new refresh token every time one is redeemed, invalidate the old one immediately, and treat any later attempt to redeem that old token as evidence of theft — revoke every token descended from it, not just the one reused. This turns a stolen refresh token into a short-lived, self-limiting exposure instead of a standing one.',
      },
    ],
    refs: [
      { book: 'api-security-in-action', chapter: 'Ch. 6 — Session Cookie and Token Authentication' },
      { book: 'oauth2-in-action', chapter: 'Ch. 6 — Tokens' },
    ],
    related: ['oauth2-and-openid-connect', 'authentication-fundamentals', 'stateless-services-and-session-management'],
  },

  {
    id: 'authorization-models',
    domainId: 'sd-iam',
    title: 'Authorization Models: RBAC, ABAC & ReBAC',
    summary:
      "RBAC, ABAC, and ReBAC are three different answers to \"what can this identity do\" — increasing in expressiveness and decreasing in how easy they are to audit at a glance; most real systems eventually blend more than one.",
    keyPoints: [
      'RBAC assigns permissions to roles and users to roles — simple and auditable at small scale, but tends toward **role explosion** as real access needs (this team, this region, this specific record) outgrow any fixed role hierarchy',
      "ABAC evaluates a policy against attributes of the subject, resource, action, and environment at request time (e.g. \"finance dept AND business hours AND owns the record\") — far more expressive than a role list, but harder to audit because the effective permission set is computed, not enumerated",
      'ReBAC (relationship-based, Zanzibar-style) models permissions as a graph of relationships — user is a member of group, group is an editor of document — and fits sharing/collaboration products (docs, drives, project tools) far more naturally than roles or flat attributes',
      "Centralizing authorization in a policy engine (e.g. OPA/Rego) decouples the \"who can do what\" decision from application code — one auditable place to change policy, instead of role checks scattered through dozens of services",
      "Coarse-grained checks (is this token valid, does its scope cover this endpoint) belong at the edge; fine-grained, data-dependent checks (row-level, field-level) usually have to stay close to the data, since the edge often doesn't have the record loaded yet",
      'Deny-by-default with explicit allow rules is safer than allow-by-default with explicit deny rules: a forgotten rule in a deny-by-default system fails **closed** (access denied); the same gap in an allow-by-default system fails **open** (access granted)',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'RBAC vs ABAC vs ReBAC',
        headers: ['Model', 'Granularity', 'Auditability', 'Good fit'],
        rows: [
          ['RBAC', 'Coarse — permission set per role', 'High at small scale, degrades with role explosion', 'Stable org structures, small-to-mid permission surface'],
          ['ABAC', 'Fine — computed per request from attributes', "Lower — effective permissions aren't enumerable", 'Context-dependent rules (time, location, department)'],
          ['ReBAC', 'Fine — derived from a relationship graph', 'Moderate — traceable by walking relationships', 'Sharing/collaboration products, nested resource ownership'],
        ],
      },
      {
        kind: 'diagram',
        title: 'A ReBAC relationship graph',
        code: 'flowchart LR\n  U[User: Alice] -->|member of| G[Group: Engineering]\n  G -->|editor of| D[Document: Design Spec]\n  U2[User: Bob] -->|viewer of| D',
        caption: "Alice's edit access to the document is derived by walking the graph (Alice -> Engineering -> editor of -> Document), not stored as a direct grant",
      },
      {
        kind: 'code',
        title: 'A deny-by-default isAllowed(subject, action, resource) check',
        code: 'interface Policy {\n    boolean isAllowed(String subject, String action, String resource);\n}\n\nclass DenyByDefaultPolicy implements Policy {\n    private final List<Rule> allowRules;\n\n    @Override\n    public boolean isAllowed(String subject, String action, String resource) {\n        return allowRules.stream()\n            .anyMatch(rule -> rule.matches(subject, action, resource));\n        // no matching rule => false: fails closed, not open\n    }\n}',
        caption: 'The absence of a matching rule is treated as a denial, not an implicit grant',
      },
      {
        kind: 'pitfall',
        title: 'Role explosion',
        text: 'Dozens of near-duplicate, hand-maintained roles — "editor-region-us-finance", "editor-region-eu-finance", and so on for every combination — is what RBAC pushed past its natural fit looks like. The same rule an ABAC policy or a ReBAC relationship expresses in one line ends up as an unauditable pile of one-off roles that nobody fully remembers the purpose of.',
      },
      {
        kind: 'note',
        title: 'Where enforcement actually happens',
        text: 'Coarse checks (valid token, correct scope) run at the edge, close to [[api-and-service-to-service-auth]] — cheap, and stops obviously-unauthorized traffic before it reaches application code. Fine-grained checks that depend on the actual record (row ownership, field-level visibility) have to run wherever that record is loaded, because the edge rarely has it.',
      },
    ],
    refs: [
      { book: 'identity-mgmt-modern-apps', chapter: 'Ch. 9 — Authorization Models' },
      { book: 'bytebytego-archive', chapter: 'Fundamentals — RBAC vs ABAC vs ReBAC' },
    ],
    related: ['authentication-fundamentals', 'api-and-service-to-service-auth', 'zero-trust-architecture'],
  },

  {
    id: 'api-and-service-to-service-auth',
    domainId: 'sd-iam',
    title: 'API & Service-to-Service Authentication',
    summary:
      'Once a call has no human user behind it, authentication changes shape entirely: API keys, OAuth2 Client Credentials, mTLS, and workload identities (SPIFFE/SPIRE) are the tools for proving "which service is this, really" between machines.',
    keyPoints: [
      'API keys are simple bearer secrets that identify a *caller*, not a user — easy to leak (committed to source, printed in logs), typically do not expire on their own, and carry no scoping unless the issuing service builds it in',
      'The OAuth 2.0 Client Credentials grant is the standard for service-to-service calls with no human in the loop: the calling service authenticates as itself (client id + secret, or a certificate) and receives a scoped, short-lived access token',
      'mTLS authenticates both sides of a TLS connection via certificates, not just the server — the norm inside a service mesh ([[service-mesh]]), where every workload is issued its own identity certificate at startup',
      'SPIFFE/SPIRE issues short-lived, cryptographically verifiable workload identities (SVIDs) tied to *what* a workload is rather than *where* it is running — solving "which service am I actually talking to" in an environment where IPs and hostnames are ephemeral',
      "A service mesh's sidecar proxies can enforce mTLS and authorization policy transparently at the network layer, so individual services don't each reimplement their own auth",
      'Blast radius is the deciding factor: a leaked shared API key compromises every caller using it at once; per-caller credentials or short-lived workload identities contain a single compromised credential to a single caller',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Sidecar mTLS handshake between two workloads with SPIFFE IDs',
        code: 'sequenceDiagram\n  participant A as Service A (sidecar)\n  participant B as Service B (sidecar)\n  A->>A: present SVID (spiffe://cluster/service-a)\n  A->>B: mTLS handshake, exchange certs\n  B->>B: verify A SVID against trust bundle\n  A->>A: verify B SVID against trust bundle\n  A->>B: request (mTLS-encrypted, identity authenticated)\n  B-->>A: response',
        caption: 'Neither service handles certificates directly — the sidecar terminates mTLS and hands the application plain HTTP over a verified identity',
      },
      {
        kind: 'table',
        caption: 'API key vs OAuth Client Credentials vs mTLS',
        headers: ['', 'API key', 'OAuth2 Client Credentials', 'mTLS'],
        rows: [
          ['Identifies', 'A caller (often coarse)', 'A registered client application', 'A workload/certificate identity'],
          ['Expiry', 'Usually none, unless built manually', 'Short-lived access token (minutes-hours)', 'Certificate lifetime, often hours with auto-rotation'],
          ['Revocation', 'Manual key rotation/deletion', 'Revoke the client or let the token expire', 'Revoke/rotate the certificate; short lifetime limits exposure'],
          ['Typical use', 'Simple internal tools, third-party API access', 'Service-to-service behind a token-based API layer', 'Service mesh, zero-trust internal networks'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'A long-lived API key committed to a public repo or baked into an image',
        text: 'Automated scanners find exposed keys in public repositories within minutes of a push, often faster than a human would notice the mistake. A key baked into a container image is worse still: it persists in every layer and every copy of that image in a registry, and simply rotating the key elsewhere does not remove it from images already built and shipped.',
      },
      {
        kind: 'bestPractice',
        title: 'Prefer short-lived, auto-rotated workload credentials',
        text: 'Where the infrastructure supports it (a service mesh, SPIFFE/SPIRE, a cloud provider\'s workload identity), issue short-lived credentials automatically rather than a long-lived static key. A credential that expires in an hour and rotates itself removes an entire class of "forgot to rotate it" incidents.',
      },
      {
        kind: 'note',
        title: 'Workload identity and gateways cover different traffic',
        text: 'mTLS and SPIFFE authenticate east-west, service-to-service traffic inside the system. A gateway ([[api-gateways-and-service-discovery]]) is usually the layer that validates north-south, client-to-service traffic at the edge. Production systems typically need both, not one instead of the other.',
      },
    ],
    refs: [
      { book: 'api-security-in-action', chapter: 'Ch. 11 — Securing Service-to-Service APIs' },
      { book: 'zero-trust-networks', chapter: 'Ch. 4 — Workload Identity' },
    ],
    related: ['authorization-models', 'zero-trust-architecture', 'service-mesh', 'api-gateways-and-service-discovery'],
  },

  {
    id: 'zero-trust-architecture',
    domainId: 'sd-iam',
    title: 'Zero Trust Architecture',
    summary:
      'Perimeter security assumes "inside the network = trusted"; zero trust assumes breach and verifies every request — regardless of network location — every time: **never trust, always verify**.',
    keyPoints: [
      'Perimeter security draws a hard line at the network edge and trusts everything inside it — once an attacker breaches that edge, lateral movement to other systems is largely unchecked',
      'Zero trust\'s core principle: **never trust, always verify** — every request is authenticated, authorized, and encrypted, whether it originates from outside the network or from a machine sitting right next to the target',
      "BeyondCorp, Google's internal implementation, replaced VPN-based access entirely with per-request device-and-user verification — the corporate network itself is treated as no more trustworthy than the public internet",
      "Microsegmentation breaks a flat network into many small zones with policy enforced between them, so a single compromised workload can't freely reach every other service on the same network",
      'Continuous verification checks device posture (patched OS, encrypted disk, managed/enrolled) alongside user identity — a valid, correctly-authenticated user on a compromised laptop is still a real risk',
      'Zero trust is adopted gradually — identity-aware proxies, mTLS everywhere, short-lived credentials — rarely a single product; the enforcement mechanics live in [[api-and-service-to-service-auth]] and [[authorization-models]], zero trust is the architectural stance tying them together',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'A flat, perimeter-trusted network vs a microsegmented, per-request-verified one',
        code: 'flowchart TD\n  subgraph Perimeter["Perimeter model: trust inside the firewall"]\n    FW[Firewall] --> PA[Service A]\n    FW --> PB[Service B]\n    PA -.->|unchecked lateral access| PB\n  end\n  subgraph ZeroTrust["Zero trust: verify every request"]\n    ZA[Service A] -->|authenticated + authorized| ZB[Service B]\n    ZB -->|authenticated + authorized| ZC[Service C]\n  end',
        caption: 'In the perimeter model, one breached service can reach its neighbors freely; in the zero-trust model, every hop is independently checked',
      },
      {
        kind: 'table',
        caption: 'Perimeter vs zero trust',
        headers: ['', 'Perimeter model', 'Zero trust'],
        rows: [
          ['Trust boundary', 'Network edge (firewall/VPN)', 'Every individual request'],
          ['Lateral-movement risk', 'High once inside the perimeter', 'Low — each hop re-verified'],
          ['Verification frequency', 'Once, at the network boundary', 'Continuous, per-request'],
          ['Key technologies', 'VPN, firewall, flat internal network', 'Identity-aware proxy, mTLS, short-lived credentials, microsegmentation'],
        ],
      },
      {
        kind: 'note',
        title: 'BeyondCorp: zero trust before the term was common',
        text: "Google's internal BeyondCorp initiative removed the VPN as the basis for access to internal applications, replacing it with per-request checks of user identity and device posture — an employee on an unmanaged or unpatched device is denied access to a sensitive internal tool even while sitting on the corporate network. It is one of the earliest large-scale, production proofs that the model works at real organizational scale.",
      },
      {
        kind: 'pitfall',
        title: 'Treating zero trust as a VPN-replacement product you buy',
        text: 'Zero trust is an ongoing architectural shift, not a single purchase: every internal call, service, and team needs to progressively adopt per-request verification. A vendor product that replaces VPN login for user access is one piece of the picture — organizations that stop there have not actually reduced their lateral-movement risk for east-west traffic between existing services.',
      },
      {
        kind: 'bestPractice',
        title: 'Roll out incrementally, prioritized by blast radius',
        text: 'Start with identity-aware proxies fronting the most sensitive internal applications, then extend mTLS to the services handling the most sensitive data, then broaden from there. Trying to convert an entire estate to zero trust in one project stalls; prioritizing by potential impact ships the highest-value protection first.',
      },
    ],
    refs: [
      { book: 'zero-trust-networks', chapter: 'Ch. 1 — Zero Trust Fundamentals' },
      { book: 'zero-trust-networks', chapter: 'Ch. 8 — Case Study: BeyondCorp' },
    ],
    related: ['api-and-service-to-service-auth', 'authorization-models', 'microservices-vs-monolith'],
  },

  {
    id: 'secrets-management-and-credential-storage',
    domainId: 'sd-iam',
    title: 'Secrets Management & Credential Storage',
    summary:
      'Secret sprawl — API keys, DB passwords, TLS keys, signing keys scattered across env vars, config files, CI logs, and source control — is one of the most common root causes of real-world breaches; centralized secrets managers and short-lived dynamic secrets are how mature systems contain it.',
    keyPoints: [
      "Secret sprawl (credentials scattered across env vars, config files, CI logs, and — worst of all — source control) is one of the most common root causes behind real-world breaches, precisely because it's so easy to accumulate without anyone deciding to",
      'Dedicated secrets managers (HashiCorp Vault, AWS/GCP/Azure KMS) centralize storage, access control, and audit logging in one place, instead of every service inventing its own ad hoc handling',
      'Envelope encryption: data is encrypted with a fast-to-rotate data encryption key (DEK); the DEK itself is encrypted with a rarely-rotated key-encryption key (KEK) held in a KMS/HSM — rotating the KEK re-wraps the DEKs, not the underlying data',
      'Dynamic secrets are generated on demand, per client, with a short lifetime (e.g. a Vault-issued database credential valid for one hour) — they shrink the exposure window dramatically compared to a static password valid until someone remembers to rotate it',
      "Rotation matters as much as storage: a securely-stored secret that's never rotated is still a long-lived liability the moment it leaks silently — and a leak is rarely announced",
      'Secrets must never end up in source control, container images, or CI/CD logs — a secret committed to git remains recoverable from history even after a later commit deletes it; the fix is revoking the secret, not just removing the line',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Envelope encryption',
        code: 'flowchart LR\n  P[Plaintext data] -->|encrypt with DEK| C[Ciphertext]\n  DEK[Data Encryption Key] -->|encrypt with KEK| WrappedDEK[Wrapped DEK]\n  KEK["Key Encryption Key (KMS/HSM)"] --> WrappedDEK\n  C --> Store[(Storage)]\n  WrappedDEK --> Store',
        caption: 'Rotating the KEK means re-wrapping the (small) DEKs, not re-encrypting the (potentially huge) underlying dataset',
      },
      {
        kind: 'table',
        caption: 'Static vs dynamic secrets',
        headers: ['', 'Static secret', 'Dynamic secret'],
        rows: [
          ['Lifetime', 'Long-lived, often indefinite', 'Short-lived, generated per request/lease'],
          ['Exposure window if leaked', 'Until someone notices and rotates it', 'Minutes to hours, then auto-expires'],
          ['Rotation effort', 'Manual, often skipped in practice', 'Automatic by design'],
          ['Revocation', 'Requires finding every place it was used', 'Lease expiry or explicit revoke, scoped to one client'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'A secret committed to git history',
        text: 'Deleting the line that contains a secret in a later commit does not remove it — the secret remains fully recoverable from the repository\'s history for as long as that history exists, and forever in any clone or fork made before the deletion. The only real fix once a secret is committed is to treat it as compromised and rotate it; rewriting history is a secondary cleanup, not the fix itself.',
      },
      {
        kind: 'bestPractice',
        title: 'Prefer dynamic, short-lived, per-workload credentials with audited access',
        text: 'Where a secrets manager supports it, issue credentials on demand, scoped to a single workload, and short-lived by default — and log every access. This turns "who had this credential and when" from a forensic guessing game into a queryable audit trail.',
      },
      {
        kind: 'note',
        title: 'Workload identity and secrets management are usually deployed together',
        text: 'A service typically authenticates itself to the secrets manager using its workload identity ([[api-and-service-to-service-auth]]) rather than a bootstrap secret, and only then fetches the dynamic credentials it actually needs — removing the chicken-and-egg problem of needing a secret in order to fetch your secrets.',
      },
    ],
    refs: [
      { book: 'zero-trust-networks', chapter: 'Ch. 6 — Secrets and Credential Management' },
      { book: 'api-security-in-action', chapter: 'Ch. 5 — Protecting Credentials' },
    ],
    related: ['api-and-service-to-service-auth', 'zero-trust-architecture', 'token-based-sessions-and-jwts'],
  },
]
