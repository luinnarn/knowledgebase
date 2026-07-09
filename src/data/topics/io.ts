import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'io-streams',
    domainId: 'io',
    title: 'I/O Streams',
    summary:
      'Byte streams (`InputStream`/`OutputStream`) move raw bytes; the library builds everything else by decorating them — buffering, compression, encryption — one wrapper at a time. Understand the decorator stack and all of java.io falls into place.',
    keyPoints: [
      {
        text: '`InputStream`/`OutputStream`: bytes. `Reader`/`Writer`: characters ([[readers-writers]])',
        detail: 'The split exists because bytes and characters are different things — a byte stream has no concept of encoding, while a character stream must decode bytes through a `Charset` to produce text. Mixing them up (treating UTF-8 bytes as Latin-1 characters, say) is a common source of silent corruption.',
      },
      {
        text: 'Streams are composable decorators: wrap a raw stream to add capability',
        detail: 'Each decorator implements the same `InputStream`/`OutputStream` interface while wrapping another instance of it, so you can stack `BufferedInputStream` around a `GZIPInputStream` around a `FileInputStream`, and each layer only knows about the layer directly inside it — the classic Decorator pattern, applied uniformly across the whole `java.io` package.',
      },
      {
        text: '**Always buffer** file and network streams — unbuffered reads are per-byte syscalls',
        detail: 'Every unbuffered `read()` call is potentially a system call into the OS — reading a file one byte at a time can run 100x slower than reading through a buffer that batches many bytes per syscall. The JIT cannot optimize this away because the syscall boundary is opaque to it.',
      },
      {
        text: 'Close streams with try-with-resources; closing the outermost closes the chain',
        detail: 'try-with-resources calls `close()` on the outermost wrapper, and each decorator\'s `close()` is responsible for closing (and usually flushing) the stream it wraps — closing the outermost stream cascades all the way down to the underlying file or socket, so you never close each layer individually.',
      },
      {
        text: '`transferTo(out)` copies a whole stream in one call (Java 9+)',
        detail: 'Before `transferTo`, copying a stream meant hand-rolling a read-into-buffer/write-from-buffer loop; `transferTo` does exactly that internally, sized appropriately, without you allocating or managing a byte array yourself.',
      },
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
        detail: 'The `int` return type reserves values 0–255 for actual byte data (which needs only 8 bits) plus one extra sentinel, −1, for end-of-stream. A byte in Java is signed (−128 to 127) and cannot represent −1 unambiguously alongside all 256 possible data values, so `int` is the only type wide enough to carry both.',
      },
      {
        kind: 'pitfall',
        title: 'The forgotten buffer',
        text: 'Wrapping `FileInputStream` directly in a parser reads one byte per system call — a 100× slowdown that profilers show as "sys time". `BufferedInputStream`/`BufferedReader` (or NIO channel reads into a [[binary-data-buffers|ByteBuffer]]) is the fix. This is the single most common Java I/O performance bug.',
        detail: 'This bug is a performance regression, not a correctness one, so it typically survives code review and unit tests undetected — it only surfaces under load, when the extra syscalls saturate the OS, showing up in profiler flame graphs as unexpectedly high time spent inside `read()` itself rather than in application logic.',
      },
      {
        kind: 'note',
        title: 'In-memory endpoints',
        text: '`ByteArrayInputStream`/`ByteArrayOutputStream` adapt byte arrays to the stream interfaces — invaluable for tests and for APIs that insist on streams.',
        detail: 'Because they implement the exact same `InputStream`/`OutputStream` contract as file- or network-backed streams, code written against the stream abstraction can be redirected to an in-memory buffer for a unit test without changing the production code path — you are testing the real decorator stack, just swapping the source/sink at the bottom.',
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
      {
        text: 'Text = bytes + encoding; without the encoding, bytes are meaningless',
        detail: 'The same byte `0xE9` might mean "é" under Latin-1, a stray continuation byte under UTF-8, or something else entirely under Windows-1252 — a byte sequence alone does not carry its own interpretation, which is why every text I/O boundary needs an explicit `Charset` to be unambiguous.',
      },
      {
        text: 'Since Java 18, UTF-8 is the default charset everywhere — but be explicit at boundaries anyway',
        detail: 'JEP 400 changed `Charset.defaultCharset()` to always be UTF-8 regardless of OS locale, closing a class of "works on my machine" bugs where a file written correctly on a US Linux box came out as mojibake on a Japanese Windows one. Being explicit anyway documents intent and protects code that might one day run on an older JDK.',
      },
      {
        text: '`InputStreamReader`/`OutputStreamWriter` bridge byte ↔ char streams',
        detail: 'These two classes are the literal adapter between the two worlds: an `InputStreamReader` wraps a byte-oriented `InputStream` and a `Charset`, and exposes a character-oriented `Reader` — most higher-level `Reader`/`Writer` classes are ultimately built on one of these at the bottom of the stack.',
      },
      {
        text: '`BufferedReader.lines()` streams a file lazily; `Scanner` parses tokens',
        detail: '`lines()` returns a `Stream<String>` that pulls one line at a time from the underlying reader as the stream is consumed, so it never loads the whole file into memory. `Scanner` is built for tokenizing mixed content (numbers, words, delimiters) rather than raw line-by-line throughput, and is noticeably slower for large files.',
      },
      {
        text: '`PrintWriter` for human-oriented output (`println`, `printf`)',
        detail: '`PrintWriter` never throws `IOException` from its print methods — it swallows errors internally and exposes them via `checkError()` — which makes it convenient for casual/human-facing output but the wrong choice when you need to detect and react to a failed write.',
      },
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
        detail: '`nextInt` (and the other `next*` methods) only consumes the token itself, leaving the trailing newline character sitting unread in the input buffer; the very next `nextLine()` call then immediately hits that leftover newline and returns before reading any real text, appearing to return an empty string for no apparent reason.',
      },
      {
        kind: 'note',
        title: 'Line endings',
        text: '`println` emits the platform separator; `\\n` in a format string does not — use `%n` in `printf`/`format` when platform-correct endings matter. `BufferedReader.readLine()` strips any of `\\n`, `\\r`, `\\r\\n`.',
        detail: '`println`\'s behavior depends on the system property `line.separator`, which is `\\r\\n` on Windows and `\\n` on Unix — hardcoding `\\n` in a format string produces a file whose line endings look "wrong" if opened on Windows in a naive tool; `%n` resolves to the platform separator at format time instead.',
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
      {
        text: '`Path.of("dir", "file.txt")`; `resolve` joins, `relativize` inverts, `normalize` cleans',
        detail: '`resolve` and `relativize` are inverses of each other: `base.resolve(rel)` produces the combined path, and `base.relativize(combined)` recovers `rel` — exactly what you need to turn an absolute path into something storable/portable and back again. `normalize` purely simplifies `.`/`..` segments without touching the filesystem.',
      },
      {
        text: '`Files.readString`/`readAllLines`/`lines` for reading; `writeString`/`write` for writing',
        detail: '`readString`/`writeString` (Java 11+) are the one-liners for whole small text files; `readAllLines` materializes every line into a `List` (fine for modest files); `lines()` streams lazily and should be used for anything that might be large, since it never holds the whole file in memory at once.',
      },
      {
        text: '`Files.copy`/`move` with options: `REPLACE_EXISTING`, `ATOMIC_MOVE`',
        detail: 'Without `REPLACE_EXISTING`, `copy`/`move` throws `FileAlreadyExistsException` if the target exists rather than silently overwriting — the API defaults to the safer behavior and makes you opt in to clobbering. `ATOMIC_MOVE` is the option that turns move into the all-or-nothing rename discussed below.',
      },
      {
        text: '`Files.walk` streams a subtree; `Files.list` one directory — both need try-with-resources',
        detail: 'Both open OS-level directory-traversal resources that must be released explicitly; because they return a `Stream` rather than a `Collection`, and `Stream` does not eagerly consume the underlying resource, forgetting to close them leaks file descriptors even though nothing looks obviously "open" in your code.',
      },
      {
        text: 'Prefer `Files.createTempFile`, check with `exists`/`isRegularFile`, delete with `deleteIfExists`',
        detail: '`createTempFile` picks a name guaranteed not to collide with anything else on the system and creates it atomically, avoiding the classic race condition of "check if a name is free, then create it" (someone else can create it in between). `deleteIfExists` avoids a redundant existence check before deletion.',
      },
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
        detail: 'The stream returned by `walk` is backed by an open `DirectoryStream` — essentially a live OS handle into the directory tree — that is only released when the Java `Stream` itself is closed. This is unlike most streams, which are just lazy views over already-in-memory or already-open data, so it is easy to assume (wrongly) that no explicit closing is needed.',
      },
      {
        kind: 'paragraph',
        text: '`WatchService` delivers filesystem change events (create/modify/delete per directory); `FileSystem` abstractions let the same code operate inside zip files (`FileSystems.newFileSystem(zipPath)`). Legacy interop: `path.toFile()` and `file.toPath()` convert freely.',
      },
      {
        kind: 'note',
        title: 'Metadata',
        text: '`Files.size`, `getLastModifiedTime`, `isSymbolicLink`, `getPosixFilePermissions` — and bulk reads via `Files.readAttributes(path, BasicFileAttributes.class)`, one syscall instead of five.',
        detail: 'Calling `size()`, `getLastModifiedTime()`, etc. individually each costs a separate system call (a `stat()`) against the filesystem; `readAttributes` bundles all common metadata into a single object from a single syscall, which matters when checking metadata for thousands of files, e.g. while walking a large tree.',
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
      {
        text: 'ByteBuffer state machine: `position`, `limit`, `capacity`; **`flip()` before reading what you wrote**',
        detail: 'A `ByteBuffer` is one fixed block of memory viewed through three cursors: `capacity` never changes, `position` marks where the next read/write happens, and `limit` marks how far you may go — writing advances `position` toward `capacity`, and `flip()` resets it to read from the beginning up to what was actually written (the old `position` becomes the new `limit`).',
      },
      {
        text: 'Direct buffers (`allocateDirect`) skip a copy for I/O but cost more to create',
        detail: 'A heap `ByteBuffer` lives inside the JVM heap, so the OS cannot read/write it directly during a syscall — the JVM must first copy it to/from a native (off-heap) buffer behind the scenes. A direct buffer already lives off-heap in that native form, so I/O can operate on it with zero extra copy, at the cost of a more expensive (and GC-invisible) allocation.',
      },
      {
        text: '`FileChannel.map` memory-maps a region: fastest random access to big files',
        detail: 'Memory-mapping asks the OS to place a file (or part of it) directly into the process\'s virtual address space, so `buffer.getInt(offset)` becomes a plain memory access that faults in the needed page from disk on demand rather than an explicit `read()` system call — this is why random access into a large mapped file can be dramatically faster than seek+read.',
      },
      {
        text: 'Byte order matters: `buffer.order(ByteOrder.LITTLE_ENDIAN)` for foreign formats',
        detail: 'Multi-byte numeric values (ints, longs, doubles) can be stored most-significant-byte-first (big-endian, the JVM\'s own default) or least-significant-byte-first (little-endian, used by x86 native formats and many file formats); reading a value with the wrong byte order silently produces a completely different, usually nonsensical, number rather than an error.',
      },
      {
        text: 'Mapped buffers have no unmap — the mapping lives until GC (or Arena, with [[ffm-api]])',
        detail: 'There is historically no public API to explicitly release a `MappedByteBuffer`\'s underlying OS mapping — it stays resident until the buffer object itself is garbage collected, which can pin file handles or memory open longer than you would like on some platforms; the FFM API\'s `Arena` finally gives deterministic, explicit unmapping.',
      },
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
        detail: 'After a sequence of `put()` calls, `position` has advanced to just past the last byte written and `limit` is still sitting at `capacity` — so a subsequent `get()` would happily read from `position` onward into the buffer\'s unwritten tail rather than from the start of your actual data. `flip()` is what re-points `position` at the beginning and `limit` at the end of what you wrote.',
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
        detail: 'Scatter/gather I/O lets one system call fill or drain multiple buffers in sequence — e.g. reading a fixed header into one buffer and the variable-length body into another, in a single `read` call — instead of one syscall per field. Positional reads let multiple threads read different offsets of the same channel concurrently without a shared, mutable file-position cursor to synchronize over.',
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
      {
        text: 'Deserialization executes attacker-influenced code paths — a remote-code-execution class of bugs (EJ 85)',
        detail: '`readObject` reconstructs objects by directly setting their fields from the byte stream and then running any custom `readObject`/`readResolve` logic those classes define — an attacker who controls the bytes effectively controls which classes get instantiated and what code inside them runs, without ever calling a normal constructor or going through your application\'s validation.',
      },
      {
        text: 'Never deserialize untrusted bytes; use `ObjectInputFilter` if you must',
        detail: '`ObjectInputFilter` lets you specify an allowlist of classes (and limits on graph depth, array size, etc.) that deserialization is permitted to instantiate, rejecting anything else before it can run — a mitigation for cases where legacy Java serialization cannot be avoided, not a reason to consider untrusted deserialization safe.',
      },
      {
        text: '`serialVersionUID`: declare it explicitly or refactoring breaks old data',
        detail: 'If you do not declare `serialVersionUID`, the JVM computes one automatically from the class\'s structure at compile time — so a seemingly harmless refactor like adding a method can silently change the computed UID, and any previously-serialized data (which has the old UID baked in) then fails to deserialize with an `InvalidClassException`.',
      },
      {
        text: '`readObject` is a constructor that skips your constructor — validate and copy defensively (EJ 88)',
        detail: 'The default `readObject` sets fields directly from the stream, bypassing every constructor your class defines — any invariant-checking or defensive-copying logic that normally lives in the constructor must be duplicated inside a custom `readObject`, or a malicious/corrupted stream can produce an object in an invalid state.',
      },
      {
        text: 'Prefer explicit formats: JSON (Jackson), protobuf, or a custom serialized form (EJ 87)',
        detail: 'These formats describe pure data with an explicit, versioned schema and no ability to instantiate arbitrary classes or run arbitrary constructors during parsing — the deserializer only ever produces the plain data structures you declared, which is what eliminates the gadget-chain attack surface entirely rather than just mitigating it.',
      },
      {
        text: 'Records serialize safely by construction — deserialization runs the canonical constructor',
        detail: 'Unlike ordinary classes, a record\'s deserialization is specified to go through the canonical constructor (using the deserialized component values as arguments) rather than setting fields directly — so any validation or normalization written in the canonical constructor runs on every deserialized instance too, closing the "readObject bypasses the constructor" hole by design.',
      },
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
        detail: 'A "gadget" is a class already present on the classpath whose `readObject`/`readResolve`/`finalize` (or similar) method has some side effect; attackers chain sequences of such gadgets — found in common libraries — so that deserializing one crafted byte stream triggers a cascade of method calls ending in something like `Runtime.exec`. No vulnerability needs to exist in your own code, only in something on your classpath.',
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
        detail: 'The common thread across JSON/protobuf/Avro and hand-written DTOs is that deserializing them can only ever produce inert data objects with no embedded behavior to hijack — object serialization\'s core danger is that the bytes can reconstruct arbitrary live objects, complete with whatever code those objects\' classes contain.',
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
      {
        text: 'Compile once, match many: `private static final Pattern P = Pattern.compile(...)`',
        detail: 'Compiling a regex parses the pattern string and builds an internal automaton — real, non-trivial work. Doing it once as a static final field means every match after that reuses the already-built automaton, whereas compiling inside a loop or a frequently-called method redoes that work on every single call.',
      },
      {
        text: '`matches` = whole input; `find` = anywhere; anchors `^ $ \\b` control position',
        detail: '`matches` implicitly anchors the pattern to both the start and end of the input, as if wrapped in `^...$` — so a pattern that would find a substring match with `find()` can fail `matches()` entirely if it does not account for the rest of the string, a very common source of "why doesn\'t my regex match" confusion.',
      },
      {
        text: 'Named groups `(?<year>\\d{4})` beat numbered groups for readability',
        detail: 'Numbered groups (`group(1)`, `group(2)`, ...) require counting parentheses and re-counting every time the pattern changes — insert one more group earlier in the pattern and every later numbered reference silently shifts to the wrong group. Named groups are immune to that renumbering hazard and self-document what each captured piece means.',
      },
      {
        text: 'Greedy `*` vs reluctant `*?` — the classic HTML-tag mismatch',
        detail: 'A greedy quantifier tries to consume as much input as possible first, then backtracks only as far as needed to let the rest of the pattern still match — against text with multiple similar delimiters (like several HTML tags on one line), that "as much as possible" instinct is exactly what makes `<.*>` swallow far more than intended.',
      },
      {
        text: 'Catastrophic backtracking: nested quantifiers can hang on crafted input',
        detail: 'When a quantified group is itself repeated — like `(a+)+` — there can be an exponential number of ways to partition the same matched text among the nested repetitions, and on non-matching input the engine tries combination after combination before giving up; a handful of extra characters can turn a sub-millisecond match into a multi-minute hang.',
      },
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
        detail: 'Regex engines are not "smart" about tag structure — `<.*>` has no concept of matching tags, it is just "less-than, then any characters, then greater-than" — so the greedy `.*` stretches across every `<`...`>` pair in the input to find the last possible `>`, unless you make the quantifier reluctant or, better, restrict the character class so it cannot cross a `>` at all.',
      },
      {
        kind: 'pitfall',
        title: 'Catastrophic backtracking (ReDoS)',
        text: 'Patterns with nested quantifiers — `(a+)+$`, `(\\s*,?)*` — explode exponentially on non-matching input: seconds, then minutes of CPU on a 40-character string. Any regex applied to *user input* must avoid ambiguous nesting; possessive quantifiers (`a++`) and atomic groups `(?>...)` cut off backtracking.',
        detail: 'The exponential blowup comes from ambiguity: if the engine has many different ways to split the same substring across repeated groups, and none of them lead to an overall match, it tries all of them before failing. An attacker who can supply a regex\'s input (a search box, a validation field) can weaponize an innocuous-looking pattern into a denial-of-service with a short crafted string.',
      },
      {
        kind: 'note',
        title: 'When not to regex',
        text: '`contains`, `startsWith`, `indexOf`, and `split` on a literal cover most real cases faster and clearer. Parsing nested structures (JSON, XML, code) with regex is a category error — use a parser. And for one-off scans, `String.matches` recompiles the pattern per call: hoist the `Pattern` to a constant.',
        detail: 'Nested/structured formats have recursive, context-sensitive grammars that regular expressions — which are fundamentally about matching flat, regular patterns — cannot correctly express in general. A regex that "mostly works" on such input will eventually break on some valid-but-unusual document, whereas a real parser handles the grammar completely.',
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
      {
        text: 'Client: `new Socket(host, port)` → `getInputStream()`/`getOutputStream()`',
        detail: 'Constructing a `Socket` this way immediately attempts the TCP handshake and blocks until it completes or fails — once connected, the socket exposes the connection as an ordinary `InputStream`/`OutputStream` pair, so everything you already know about `java.io` streams (buffering, decorators) applies directly to network communication.',
      },
      {
        text: 'Server loop: `accept()` blocks → hand the socket to a worker',
        detail: '`accept()` blocks the calling thread until a client connects, then returns a brand-new `Socket` representing just that one connection (the `ServerSocket` itself keeps listening for the next one) — the classic pattern hands that new socket to a separate thread so the accept loop can immediately go back to waiting.',
      },
      {
        text: '**Always set timeouts** — `connect(addr, ms)` and `setSoTimeout(ms)`; defaults block forever',
        detail: 'Without an explicit timeout, both connecting and reading can block indefinitely if the remote host is unreachable, slow, or has silently disappeared — from the JVM\'s perspective a hung connection looks identical to a slow but healthy one, so an explicit deadline is the only way to bound how long you are willing to wait.',
      },
      {
        text: 'Thread-per-connection is simple; [[virtual-threads]] make it scale to 100k+ connections',
        detail: 'With platform threads, each blocked connection permanently occupies an OS thread (with its multi-MB stack) for as long as it is open, so a server handling tens of thousands of slow/idle connections needs tens of thousands of platform threads — impractical. Virtual threads unmount from their carrier while blocked on I/O, so the same simple code scales to vastly more connections on the same hardware.',
      },
      {
        text: '`InetAddress` resolves names; UDP uses `DatagramSocket`/`DatagramPacket`',
        detail: '`InetAddress` wraps the DNS lookup that turns a hostname into the IP address actually used to connect; UDP\'s API looks nothing like TCP\'s stream-based `Socket` because UDP itself has no connection or ordering guarantees — you send and receive discrete packets, each of which might arrive out of order, duplicated, or not at all.',
      },
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
        detail: 'TCP guarantees that bytes arrive in the order sent, but makes no promise about how those bytes are grouped into individual `read()`/`write()` calls — the OS is free to coalesce or split them based on network conditions, buffer sizes, and timing. Any protocol that assumes "one write equals one read" will eventually break; you need your own framing to know where one logical message ends and the next begins.',
      },
      {
        kind: 'note',
        title: 'The URL family',
        text: '`URI` parses and builds identifiers (use it); `URL.openStream()` is the quick way to fetch a resource; but for HTTP work, the modern [[http-client]] supersedes `URLConnection` entirely.',
        detail: '`URLConnection` predates and awkwardly overlaps with both `URI` (parsing) and `HttpClient` (actual HTTP transport) — a legacy, low-level abstraction that mixes URI parsing with protocol handling and lacks HTTP/2, proper timeouts, and a fluent API. New code should use `URI` purely for parsing and `HttpClient` for the actual request/response exchange.',
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
      {
        text: 'Build one `HttpClient`, reuse it — it pools connections',
        detail: '`HttpClient` instances are immutable and thread-safe by design specifically so they can be shared: internally they maintain a connection pool (keep-alive TCP connections, HTTP/2 multiplexed streams) that only pays off if the same instance is reused across many requests — creating a new one per call throws away that pool and pays the connection-setup cost every single time.',
      },
      {
        text: '`send(request, bodyHandler)` blocks; `sendAsync` returns `CompletableFuture<HttpResponse<T>>`',
        detail: '`send()` ties up the calling thread until the full response is received, which is fine (and simple) when running inside a cheap virtual thread; `sendAsync` returns immediately with a `CompletableFuture` you can chain, combine with other futures, or attach timeouts to, without ever blocking a thread while waiting on the network.',
      },
      {
        text: 'Body handlers: `ofString`, `ofFile`, `ofInputStream`, `ofLines`; publishers for upload',
        detail: 'A `BodyHandler` decides how the response body gets materialized — as a fully-buffered `String`, streamed straight to a file, exposed as a lazy `InputStream`, or split into lines — so you pick the handler based on expected response size and whether you need it all in memory at once. `BodyPublishers` are the upload-side mirror.',
      },
      {
        text: 'HTTP/2 by default with HTTP/1.1 fallback; redirects and timeouts are opt-in configuration',
        detail: 'The client negotiates HTTP/2 automatically when the server supports it, falling back to HTTP/1.1 transparently otherwise — this brings multiplexing, multiple requests sharing one TCP connection without head-of-line blocking at the application level. But redirect-following and request/connect timeouts must be explicitly configured on the builder; the out-of-the-box defaults do neither.',
      },
      {
        text: 'Check `response.statusCode()` — non-2xx does **not** throw',
        detail: '`HttpClient` treats "the HTTP exchange completed" and "the HTTP exchange succeeded" as separate concerns: a 404 or 500 response is still a fully successful exchange from the client\'s point of view, so it returns normally with that status code rather than throwing — only network-level failures (timeouts, connection refused, etc.) throw exceptions.',
      },
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
        detail: 'Every new `HttpClient` spins up its own connection pool and (for the async API) its own executor/selector threads behind the scenes; creating one per request means every call pays the full TCP+TLS handshake cost from scratch and leaves behind threads/resources that only get cleaned up once the object is garbage collected — the exact inverse of what the immutable, poolable design was meant to encourage.',
      },
      {
        kind: 'note',
        title: 'Timeout taxonomy',
        text: '`connectTimeout` (client) bounds the TCP handshake; `timeout` (request) bounds the full exchange — absent, a stuck server holds your thread or future forever. Production checklists treat missing HTTP timeouts as a defect (they cascade into thread-pool exhaustion; see [[scalability-patterns]]).',
        detail: '`connectTimeout` only bounds the initial TCP+TLS handshake — once connected, a request with no request-level timeout can still hang forever waiting for the server to send a response, because that phase is a completely separate timer that `connectTimeout` has no control over; both need to be set for a genuinely bounded call.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 4.4 — The HTTP Client' },
      { book: 'learning-java', chapter: 'Ch. 12 — Programming for the Web' },
    ],
    related: ['completable-future', 'sockets-networking', 'virtual-threads', 'cloud-native-java'],
  },
]
