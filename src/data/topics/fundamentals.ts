import type { Topic } from '../../types/content'

/** Seed topic — full domain content authored in the content phase. */
export const topics: Topic[] = [
  {
    id: 'program-anatomy',
    domainId: 'fundamentals',
    title: 'Anatomy of a Java Program',
    summary:
      'Every Java program is a set of classes; execution starts at a public static void main method. Source files compile to bytecode that the JVM executes.',
    keyPoints: [
      'One public top-level class per .java file, named after the file',
      'main(String[] args) is the entry point',
      'javac compiles to .class bytecode; java runs it on the JVM',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Java is **compiled to bytecode**, not native machine code. The `javac` compiler produces `.class` files that the Java Virtual Machine loads and executes.',
      },
      {
        kind: 'code',
        title: 'HelloWorld.java',
        code: 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 3 — Fundamental Programming Structures' },
      { book: 'learning-java', chapter: 'Ch. 2 — A First Application' },
    ],
    related: [],
  },
]
