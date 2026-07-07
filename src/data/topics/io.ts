import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'io-streams',
    domainId: 'io',
    title: 'I/O Streams',
    summary:
      'Byte streams (`InputStream`/`OutputStream`) move raw bytes; the library builds everything else by decorating them — buffering, compression, encryption — one wrapper at a time. Understand the decorator stack and all of java.io falls into place.',
    keyPoints: [
      '`InputStream`/`OutputStream`: bytes. `Reader`/`Writer`: characters ([[readers-writers]])',
      'Streams are composable decorators: wrap a raw stream to add capability',
      '**Always buffer** file and network streams — unbuffered reads are per-byte syscalls',
      'Close streams with try-with-resources; closing the outermost closes the chain',
      '`transferTo(out)` copies a whole stream in one call (Java 9+)',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The decorator stack',
        code: 'try (var in = new DataInputStream(\n                new BufferedInputStream(\n                  new GZIPInputStream(\n                    Files.newInputStream(path))))) {\n    // bytes flow: file → gunzip → buffer → typed reads\n    int magic = in.readInt();\n    double price = in.readDouble();\n}',
      },
      {
        kind: 'paragraph',
        text: 'Each wrapper adds one responsibility — the [[composition-vs-inheritance|decorator pattern]] at its best. `BufferedInputStream` batches syscalls; `GZIPInputStream` decompresses; `DataInputStream` adds typed reads. You assemble exactly the pipeline you need, and the same wrappers work over files, sockets, and byte arrays alike.',
      },
      {
        kind: 'code',
        title: 'Bulk copying',
        code: 'try (InputStream in = url.openStream();\n     OutputStream out = Files.newOutputStream(target)) {\n    in.transferTo(out);              // the modern one-liner\n}\nbyte[] all = in.readAllBytes();      // small payloads: slurp',
      },
      {
        kind: 'pitfall',
        title: 'read() returns an int for a reason',
        text: '`read()` yields 0–255 for data and **−1** for end of stream — storing it in a `byte` first destroys the sentinel. Also `read(byte[])` may fill *fewer* bytes than requested even mid-stream; loop, or use `readNBytes`/`readAllBytes` which handle it.',
      },
      {
        kind: 'pitfall',
        title: 'The forgotten buffer',
        text: 'Wrapping `FileInputStream` directly in a parser reads one byte per system call — a 100× slowdown that profilers show as "sys time". `BufferedInputStream`/`BufferedReader` (or NIO channel reads into a [[binary-data-buffers|ByteBuffer]]) is the fix. This is the single most common Java I/O performance bug.',
      },
      {
        kind: 'note',
        title: 'In-memory endpoints',
        text: '`ByteArrayInputStream`/`ByteArrayOutputStream` adapt byte arrays to the stream interfaces — invaluable for tests and for APIs that insist on streams.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 2.1 — Input/Output Streams' },
      { book: 'learning-java', chapter: 'Ch. 11 — Networking and I/O' },
    ],
    related: ['readers-writers', 'files-paths-nio', 'binary-data-buffers', 'composition-vs-inheritance'],
  },

  {
    id: 'readers-writers',
    domainId: 'io',
    title: 'Readers, Writers & Character Encodings',
    summary:
      '`Reader`/`Writer` handle text: bytes decoded to characters through a `Charset`. Specify UTF-8 explicitly at every boundary — encoding bugs are silent, cumulative, and international.',
    keyPoints: [
      'Text = bytes + encoding; without the encoding, bytes are meaningless',
      'Since Java 18, UTF-8 is the default charset everywhere — but be explicit at boundaries anyway',
      '`InputStreamReader`/`OutputStreamWriter` bridge byte ↔ char streams',
      '`BufferedReader.lines()` streams a file lazily; `Scanner` parses tokens',
      '`PrintWriter` for human-oriented output (`println`, `printf`)',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Reading and writing text, explicitly encoded',
        code: 'try (var reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {\n    reader.lines()\n          .filter(line -> !line.isBlank())\n          .forEach(this::process);\n}\n\ntry (var writer = new PrintWriter(\n        Files.newBufferedWriter(path, StandardCharsets.UTF_8))) {\n    writer.printf("%-20s %8.2f%n", name, amount);\n}\n\nString whole = Files.readString(path);              // small files\nFiles.writeString(path, content);',
      },
      {
        kind: 'paragraph',
        text: 'The mojibake mechanism: writer encodes `é` as UTF-8 (`0xC3 0xA9`), reader decodes as Windows-1252 and displays `Ã©`. Nothing throws — the data is just wrong, and a second round trip compounds it. Every historical "default charset" call site was a latent bug on the machine with a different locale; Java 18\'s UTF-8 default (JEP 400) fixed the default, not the principle: **name the charset at every I/O boundary you don\'t control.**',
      },
      {
        kind: 'code',
        title: 'Scanner vs BufferedReader',
        code: 'var sc = new Scanner(System.in);          // tokenizing: words, ints, patterns\nint age = sc.nextInt();\n\nvar console = System.console();            // echo-free password entry\nchar[] pw = console.readPassword("Password: ");',
      },
      {
        kind: 'pitfall',
        title: 'Scanner.nextInt() + nextLine()',
        text: '`nextInt` consumes the digits but not the newline, so a following `nextLine` returns an empty string. Either call `nextLine` twice or read lines and parse with `Integer.parseInt`. A rite of passage for every Java learner.',
      },
      {
        kind: 'note',
        title: 'Line endings',
        text: '`println` emits the platform separator; `\\n` in a format string does not — use `%n` in `printf`/`format` when platform-correct endings matter. `BufferedReader.readLine()` strips any of `\\n`, `\\r`, `\\r\\n`.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 2.1.5–2.1.8 — Text Input and Output' },
      { book: 'core-java-1', chapter: 'Ch. 3.7 — Input and Output' },
      { book: 'learning-java', chapter: 'Ch. 8, 11 — Text; I/O' },
    ],
    related: ['io-streams', 'files-paths-nio', 'internationalization', 'strings-text'],
  },

  {
    id: 'files-paths-nio',
    domainId: 'io',
    title: 'Files & Paths (NIO.2)',
    summary:
      '`Path` models locations, `Files` performs the operations: read, write, copy, move, walk, watch. This java.nio.file API (Java 7) replaced `java.io.File`\'s boolean-returning guesswork with real exceptions and atomic options.',
    keyPoints: [
      '`Path.of("dir", "file.txt")`; `resolve` joins, `relativize` inverts, `normalize` cleans',
      '`Files.readString`/`readAllLines`/`lines` for reading; `writeString`/`write` for writing',
      '`Files.copy`/`move` with options: `REPLACE_EXISTING`, `ATOMIC_MOVE`',
      '`Files.walk` streams a subtree; `Files.list` one directory — both need try-with-resources',
      'Prefer `Files.createTempFile`, check with `exists`/`isRegularFile`, delete with `deleteIfExists`',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Path algebra',
        code: 'Path base = Path.of("/deploy/app");\nPath cfg = base.resolve("conf/app.yaml");        // /deploy/app/conf/app.yaml\nPath rel = base.relativize(cfg);                  // conf/app.yaml\nPath clean = Path.of("/a/./b/../c").normalize();  // /a/c\nPath parent = cfg.getParent();\nPath name = cfg.getFileName();',
      },
      {
        kind: 'code',
        title: 'Files: the everyday operations',
        code: 'Files.createDirectories(target.getParent());\nFiles.copy(source, target, StandardCopyOption.REPLACE_EXISTING);\nFiles.move(tmp, live, StandardCopyOption.ATOMIC_MOVE);   // publish atomically\n\ntry (Stream<Path> tree = Files.walk(root)) {\n    List<Path> bigLogs = tree\n            .filter(p -> p.toString().endsWith(".log"))\n            .filter(p -> uncheckedSize(p) > 10_000_000)\n            .toList();\n}',
      },
      {
        kind: 'paragraph',
        text: 'The `ATOMIC_MOVE` idiom — write to a temp file, then atomically rename into place — is how you publish files that other processes read: consumers see either the old file or the complete new one, never a half-written state. (Atomicity holds within a filesystem; cross-device moves fall back to copy+delete.)',
      },
      {
        kind: 'pitfall',
        title: 'Files.walk leaks directory handles if not closed',
        text: '`walk`, `list`, `find`, and `lines` return **lazily-populated streams holding OS resources**. Outside try-with-resources they exhaust file descriptors under load — an error that only appears in production. The compiler won\'t warn; the linter might; the habit must.',
      },
      {
        kind: 'paragraph',
        text: '`WatchService` delivers filesystem change events (create/modify/delete per directory); `FileSystem` abstractions let the same code operate inside zip files (`FileSystems.newFileSystem(zipPath)`). Legacy interop: `path.toFile()` and `file.toPath()` convert freely.',
      },
      {
        kind: 'note',
        title: 'Metadata',
        text: '`Files.size`, `getLastModifiedTime`, `isSymbolicLink`, `getPosixFilePermissions` — and bulk reads via `Files.readAttributes(path, BasicFileAttributes.class)`, one syscall instead of five.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 2.4 — Working with Files' },
      { book: 'learning-java', chapter: 'Ch. 11 — Networking and I/O' },
    ],
    related: ['io-streams', 'readers-writers', 'binary-data-buffers'],
  },

  {
    id: 'binary-data-buffers',
    domainId: 'io',
    title: 'Buffers, Channels & Memory-Mapped Files',
    summary:
      'NIO\'s `ByteBuffer` + `FileChannel` give block-oriented, random-access I/O; memory-mapping puts a file directly into the address space — the OS pages data in on demand, and reads become memory access.',
    keyPoints: [
      'ByteBuffer state machine: `position`, `limit`, `capacity`; **`flip()` before reading what you wrote**',
      'Direct buffers (`allocateDirect`) skip a copy for I/O but cost more to create',
      '`FileChannel.map` memory-maps a region: fastest random access to big files',
      'Byte order matters: `buffer.order(ByteOrder.LITTLE_ENDIAN)` for foreign formats',
      'Mapped buffers have no unmap — the mapping lives until GC (or Arena, with [[ffm-api]])',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Channel + buffer read loop',
        code: 'try (FileChannel ch = FileChannel.open(path, StandardOpenOption.READ)) {\n    ByteBuffer buf = ByteBuffer.allocate(64 * 1024);\n    while (ch.read(buf) != -1) {\n        buf.flip();                 // switch from filling to draining\n        process(buf);\n        buf.clear();                // switch back to filling\n    }\n}',
      },
      {
        kind: 'pitfall',
        title: 'Forgetting flip()',
        text: 'After writing into a buffer, `position` sits at the end — reading from there yields nothing (or garbage). `flip()` sets `limit = position; position = 0`. The trio to internalize: **fill → flip → drain → clear**. Half of all NIO bugs are a missing flip.',
      },
      {
        kind: 'code',
        title: 'Memory-mapped file',
        code: 'try (FileChannel ch = FileChannel.open(path, StandardOpenOption.READ)) {\n    MappedByteBuffer map = ch.map(FileChannel.MapMode.READ_ONLY, 0, ch.size());\n    map.order(ByteOrder.LITTLE_ENDIAN);\n    int recordCount = map.getInt(HEADER_OFFSET);      // random access, no seek+read\n}',
      },
      {
        kind: 'paragraph',
        text: 'Core Java\'s benchmark ordering for scanning a large file: mapped ≈ buffered stream ≫ raw random access ≫ unbuffered stream. Mapping shines for **random access to large files** (databases, index files — Kafka and Lucene are built on it): no syscall per read, and the OS page cache is shared across processes. For one sequential pass, a buffered stream is simpler and equally good.',
      },
      {
        kind: 'paragraph',
        text: '**Direct buffers** allocate outside the heap so the OS can DMA straight into them — but allocation is expensive and the memory is invisible to the GC heap accounting (a classic "where did my RSS go" in containers, see [[cloud-native-java]]). Pool them, or stick to heap buffers until profiling says otherwise.',
      },
      {
        kind: 'note',
        title: 'Scattering, locking, and the modern successor',
        text: '`FileChannel` also does scatter/gather (`read(ByteBuffer[])`), positional reads (`read(buf, position)` — thread-safe), and [[serialization|file locking]] via `lock()`. For off-heap memory with deterministic lifetime and structured layouts, the Foreign Function & Memory API ([[ffm-api]]) is the modern replacement for direct-buffer tricks.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 2.5–2.6 — Memory-Mapped Files; File Locking' },
      { book: 'java-secrets', chapter: 'I/O performance chapters' },
    ],
    related: ['files-paths-nio', 'ffm-api', 'hardware-memory', 'io-streams'],
  },

  {
    id: 'serialization',
    domainId: 'io',
    title: 'Serialization',
    summary:
      'Java\'s built-in object serialization writes whole object graphs — and reads them back through a gaping security hole. Effective Java\'s modern verdict: prefer JSON/protobuf; if you must implement `Serializable`, do it defensively.',
    keyPoints: [
      'Deserialization executes attacker-influenced code paths — a remote-code-execution class of bugs (EJ 85)',
      'Never deserialize untrusted bytes; use `ObjectInputFilter` if you must',
      '`serialVersionUID`: declare it explicitly or refactoring breaks old data',
      '`readObject` is a constructor that skips your constructor — validate and copy defensively (EJ 88)',
      'Prefer explicit formats: JSON (Jackson), protobuf, or a custom serialized form (EJ 87)',
      'Records serialize safely by construction — deserialization runs the canonical constructor',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The mechanics (when you control both ends)',
        code: 'public class Session implements Serializable {\n    @Serial private static final long serialVersionUID = 1L;\n    private String user;\n    private transient SocketChannel channel;   // transient: not written\n}\n\ntry (var out = new ObjectOutputStream(Files.newOutputStream(path))) {\n    out.writeObject(session);\n}\ntry (var in = new ObjectInputStream(Files.newInputStream(path))) {\n    Session s = (Session) in.readObject();\n}',
      },
      {
        kind: 'paragraph',
        text: 'Serialization preserves **object graphs** — shared references stay shared, cycles work — using serial numbers per stream. That power is also the attack surface: the byte stream decides which classes instantiate and with what field values, bypassing every constructor invariant you wrote ([[immutability-class-design]]).',
      },
      {
        kind: 'pitfall',
        title: 'The gadget-chain attack (EJ Item 85)',
        text: 'Attackers chain `readObject` side effects of classes already on your classpath ("gadgets") into arbitrary code execution — real-world incidents include the 2016 San Francisco Muni ransomware. Bloch\'s rule: **there is no reason to use Java serialization in any new system you write.** If legacy demands it, filter (`ObjectInputFilter.allowedClasses(...)`) and never accept bytes across a trust boundary.',
      },
      {
        kind: 'code',
        title: 'Defensive readObject (EJ Item 88)',
        code: '@Serial\nprivate void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {\n    in.defaultReadObject();\n    // copy mutable components (the stream may alias them elsewhere!)\n    start = new Date(start.getTime());\n    end = new Date(end.getTime());\n    // then validate invariants the constructor would have enforced\n    if (start.after(end)) throw new InvalidObjectException(start + " > " + end);\n}',
      },
      {
        kind: 'paragraph',
        text: 'For classes with meaningful invariants, the **serialization proxy pattern** (EJ Item 90) is cleaner: `writeReplace` swaps in a tiny immutable proxy record, whose `readResolve` reconstructs through the real constructor — invariants enforced by construction, no direct attack surface on the real class.',
      },
      {
        kind: 'note',
        title: 'What to use instead',
        text: 'Cross-system data: JSON (human-readable) or protobuf/Avro (compact, versioned schemas). Java-internal caching: still prefer explicit DTO records + a library. These formats deserialize *data*, not object graphs with behavior — which is exactly the point.',
      },
    ],
    refs: [
      { book: 'effective-java', chapter: 'Items 85–90' },
      { book: 'core-java-2', chapter: 'Ch. 2.3 — Object Input/Output Streams and Serialization' },
    ],
    related: ['security-basics', 'io-streams', 'records', 'immutability-class-design'],
  },

  {
    id: 'regex',
    domainId: 'io',
    title: 'Regular Expressions',
    summary:
      '`Pattern` compiles a regex once; `Matcher` runs it. Java\'s flavor: doubled backslashes in string literals, named groups, and greedy-by-default quantifiers. Powerful, and famously easy to overuse.',
    keyPoints: [
      'Compile once, match many: `private static final Pattern P = Pattern.compile(...)`',
      '`matches` = whole input; `find` = anywhere; anchors `^ $ \\b` control position',
      'Named groups `(?<year>\\d{4})` beat numbered groups for readability',
      'Greedy `*` vs reluctant `*?` — the classic HTML-tag mismatch',
      'Catastrophic backtracking: nested quantifiers can hang on crafted input',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The working set',
        code: 'private static final Pattern DATE =\n        Pattern.compile("(?<year>\\\\d{4})-(?<month>\\\\d{2})-(?<day>\\\\d{2})");\n\nMatcher m = DATE.matcher(input);\nif (m.matches()) {                       // entire input must match\n    int year = Integer.parseInt(m.group("year"));\n}\n\nwhile (m.find()) {                        // every occurrence\n    System.out.println(m.group());\n}\n\nString cleaned = input.replaceAll("\\\\s+", " ");\nString[] cells = row.split("\\\\s*,\\\\s*");\nList<String> words = DATE.splitAsStream(text).toList();',
      },
      {
        kind: 'paragraph',
        text: 'In string literals every regex backslash doubles: the regex `\\d` is written `"\\\\d"`. Character classes `[a-z]`, predefined `\\d \\w \\s` (and negations `\\D \\W \\S`), quantifiers `* + ? {n,m}`, alternation `|`, grouping `(...)`, lookarounds `(?=...) (?<=...)`. Flags like `Pattern.CASE_INSENSITIVE` or inline `(?i)`.',
      },
      {
        kind: 'pitfall',
        title: 'Greedy quantifiers eat too much',
        text: 'Against `<b>bold</b> and <i>italic</i>`, the pattern `<.*>` matches the **entire string** — `*` grabs maximally, then backtracks just enough. You wanted `<.*?>` (reluctant) or better `<[^>]*>` (possessive-ish character class, no backtracking).',
      },
      {
        kind: 'pitfall',
        title: 'Catastrophic backtracking (ReDoS)',
        text: 'Patterns with nested quantifiers — `(a+)+$`, `(\\s*,?)*` — explode exponentially on non-matching input: seconds, then minutes of CPU on a 40-character string. Any regex applied to *user input* must avoid ambiguous nesting; possessive quantifiers (`a++`) and atomic groups `(?>...)` cut off backtracking.',
      },
      {
        kind: 'note',
        title: 'When not to regex',
        text: '`contains`, `startsWith`, `indexOf`, and `split` on a literal cover most real cases faster and clearer. Parsing nested structures (JSON, XML, code) with regex is a category error — use a parser. And for one-off scans, `String.matches` recompiles the pattern per call: hoist the `Pattern` to a constant.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 2.7 — Regular Expressions' },
      { book: 'learning-java', chapter: 'Ch. 8 — Text and Core Utilities' },
    ],
    related: ['strings-text', 'readers-writers'],
  },

  {
    id: 'sockets-networking',
    domainId: 'io',
    title: 'Sockets & Networking',
    summary:
      'TCP programming in Java is `Socket` + streams on the client, `ServerSocket.accept` + a thread per connection on the server. Set timeouts on everything, and let virtual threads make thread-per-connection scale again.',
    keyPoints: [
      'Client: `new Socket(host, port)` → `getInputStream()`/`getOutputStream()`',
      'Server loop: `accept()` blocks → hand the socket to a worker',
      '**Always set timeouts** — `connect(addr, ms)` and `setSoTimeout(ms)`; defaults block forever',
      'Thread-per-connection is simple; [[virtual-threads]] make it scale to 100k+ connections',
      '`InetAddress` resolves names; UDP uses `DatagramSocket`/`DatagramPacket`',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Client with timeouts',
        code: 'try (var socket = new Socket()) {\n    socket.connect(new InetSocketAddress("time.example.com", 8013), 5_000);\n    socket.setSoTimeout(10_000);                        // reads may not hang forever\n    try (var in = new Scanner(socket.getInputStream(), StandardCharsets.UTF_8)) {\n        while (in.hasNextLine()) System.out.println(in.nextLine());\n    }\n}   // SocketTimeoutException on silence — recoverable, unlike an eternal hang',
      },
      {
        kind: 'code',
        title: 'Server: one virtual thread per connection (Java 21)',
        code: 'try (var server = new ServerSocket(8189);\n     var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    while (true) {\n        Socket client = server.accept();               // blocks until a connection\n        executor.submit(() -> handle(client));         // cheap thread per client\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'The blocking model reads top-to-bottom and handles one client per thread. Historically it capped at a few thousand platform threads, pushing servers toward NIO selectors and callback labyrinths. Virtual threads ([[virtual-threads]]) restored the simple model: the JVM parks the virtual thread during blocking I/O and the carrier thread moves on — thread-per-connection semantics at event-loop scale.',
      },
      {
        kind: 'pitfall',
        title: 'Half-closed connections and partial reads',
        text: 'TCP is a byte stream, not a message stream: one `write` can arrive as several `read`s and vice versa. Protocols need explicit framing (length prefixes or delimiters). And a peer that vanishes without FIN leaves your read blocked — which is why `setSoTimeout` is non-negotiable in production.',
      },
      {
        kind: 'note',
        title: 'The URL family',
        text: '`URI` parses and builds identifiers (use it); `URL.openStream()` is the quick way to fetch a resource; but for HTTP work, the modern [[http-client]] supersedes `URLConnection` entirely.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 4.1–4.2 — Connecting to a Server; Implementing Servers' },
      { book: 'learning-java', chapter: 'Ch. 11 — Networking and I/O' },
    ],
    related: ['http-client', 'virtual-threads', 'io-streams'],
  },

  {
    id: 'http-client',
    domainId: 'io',
    title: 'The HTTP Client',
    summary:
      '`java.net.http.HttpClient` (Java 11) is the modern built-in: fluent requests, HTTP/2, synchronous or `CompletableFuture` async, and pluggable body handlers. No third-party dependency needed for straightforward HTTP.',
    keyPoints: [
      'Build one `HttpClient`, reuse it — it pools connections',
      '`send(request, bodyHandler)` blocks; `sendAsync` returns `CompletableFuture<HttpResponse<T>>`',
      'Body handlers: `ofString`, `ofFile`, `ofInputStream`, `ofLines`; publishers for upload',
      'HTTP/2 by default with HTTP/1.1 fallback; redirects and timeouts are opt-in configuration',
      'Check `response.statusCode()` — non-2xx does **not** throw',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'GET and POST',
        code: 'HttpClient client = HttpClient.newBuilder()\n        .connectTimeout(Duration.ofSeconds(5))\n        .followRedirects(HttpClient.Redirect.NORMAL)\n        .build();\n\nHttpRequest get = HttpRequest.newBuilder(URI.create("https://api.example.com/users"))\n        .header("Accept", "application/json")\n        .timeout(Duration.ofSeconds(10))\n        .GET().build();\n\nHttpResponse<String> resp = client.send(get, HttpResponse.BodyHandlers.ofString());\nif (resp.statusCode() == 200) process(resp.body());\n\nHttpRequest post = HttpRequest.newBuilder(URI.create("https://api.example.com/users"))\n        .header("Content-Type", "application/json")\n        .POST(HttpRequest.BodyPublishers.ofString(json))\n        .build();',
      },
      {
        kind: 'code',
        title: 'Async composition',
        code: 'List<CompletableFuture<String>> futures = urls.stream()\n        .map(u -> client.sendAsync(reqFor(u), BodyHandlers.ofString())\n                        .thenApply(HttpResponse::body))\n        .toList();\n\nCompletableFuture.allOf(futures.toArray(CompletableFuture[]::new)).join();',
      },
      {
        kind: 'paragraph',
        text: 'The async form rides on [[completable-future]] — compose, time out (`orTimeout`), and fan out without blocking threads. With [[virtual-threads]], the **synchronous** API inside cheap threads is often the most readable concurrent design: straight-line code, per-request thread, no callback chains.',
      },
      {
        kind: 'pitfall',
        title: 'One client per request',
        text: 'Building a new `HttpClient` per call discards connection pooling and HTTP/2 multiplexing, and leaks its executor threads until GC. Create it once (it\'s immutable and thread-safe), share it application-wide — same rule as for `ObjectMapper` or an SSLContext.',
      },
      {
        kind: 'note',
        title: 'Timeout taxonomy',
        text: '`connectTimeout` (client) bounds the TCP handshake; `timeout` (request) bounds the full exchange — absent, a stuck server holds your thread or future forever. Production checklists treat missing HTTP timeouts as a defect (they cascade into thread-pool exhaustion; see [[scalability-patterns]]).',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 4.4 — The HTTP Client' },
      { book: 'learning-java', chapter: 'Ch. 12 — Programming for the Web' },
    ],
    related: ['completable-future', 'sockets-networking', 'virtual-threads', 'cloud-native-java'],
  },
]
