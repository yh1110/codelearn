import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

type LessonSeed = {
  slug: string;
  title: string;
  order: number;
  contentMd: string;
  starterCode: string;
  expectedOutput: string | null;
};

type CourseSeed = {
  slug: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonSeed[];
};

const courses: CourseSeed[] = [
  {
    slug: "ts-intro",
    title: "TypeScript 入門",
    description: "変数・関数・型注釈まで、TypeScript の基礎を手を動かして学びます。",
    order: 1,
    lessons: [
      {
        slug: "hello-world",
        title: "Hello, World",
        order: 1,
        contentMd: `# Hello, World

TypeScript の最初の一歩です。\`console.log\` を使って文字列を出力してみましょう。

## やること

右のエディタのコードを **そのまま実行** してみてください。「▶ 実行」ボタンをクリックします。

## 期待出力

\`\`\`
Hello, TypeScript!
\`\`\`

## ポイント

- \`console.log("...")\` は引数の文字列を出力します。
- TypeScript のファイルは \`.ts\` 拡張子で、実行時にコンパイルされます。
`,
        starterCode: `console.log("Hello, TypeScript!");
`,
        expectedOutput: "Hello, TypeScript!",
      },
      {
        slug: "variables-and-types",
        title: "変数と型注釈",
        order: 2,
        contentMd: `# 変数と型注釈

TypeScript は変数に **型** を付けられます。間違った型の値を代入するとコンパイル時にエラーになります。

## やること

\`name\` に自分の名前 (文字列) を入れて、\`\`Hello, \${name}!\`\` の形式で出力してください。

## ヒント

- \`let name: string = "..."\` で文字列型の変数を宣言できます。
- テンプレートリテラル \`\` \`Hello, \${name}!\` \`\` で値を埋め込めます。

## 期待出力

\`\`\`
Hello, Alice!
\`\`\`

(name は \`Alice\` として判定します)
`,
        starterCode: `const name: string = "";
console.log(\`Hello, \${name}!\`);
`,
        expectedOutput: "Hello, Alice!",
      },
      {
        slug: "functions",
        title: "関数",
        order: 3,
        contentMd: `# 関数

引数と戻り値に型を付けた関数を定義してみましょう。

## やること

2 つの数値を受け取って、その和を返す関数 \`add\` を実装してください。\`add(2, 3)\` を呼び出して結果を出力します。

## ヒント

\`\`\`ts
function add(a: number, b: number): number {
  return a + b;
}
\`\`\`

## 期待出力

\`\`\`
5
\`\`\`
`,
        starterCode: `function add(a: number, b: number): number {
  // TODO: a と b の和を返す
  return 0;
}

console.log(add(2, 3));
`,
        expectedOutput: "5",
      },
    ],
  },
  {
    slug: "ts-collections",
    title: "配列とオブジェクト",
    description: "配列・タプル・オブジェクト型の扱いを学びます。",
    order: 2,
    lessons: [
      {
        slug: "array-sum",
        title: "配列の合計",
        order: 1,
        contentMd: `# 配列の合計

配列の要素をすべて足し合わせてみましょう。

## やること

\`numbers\` 配列の要素の合計を計算して出力してください。

## ヒント

- \`Array.prototype.reduce\` を使うと 1 行で書けます。
- \`for\` ループでも OK です。

## 期待出力

\`\`\`
15
\`\`\`
`,
        starterCode: `const numbers: number[] = [1, 2, 3, 4, 5];

// TODO: numbers の合計を計算
const sum: number = 0;

console.log(sum);
`,
        expectedOutput: "15",
      },
      {
        slug: "object-type",
        title: "オブジェクトの型",
        order: 2,
        contentMd: `# オブジェクトの型

オブジェクトのプロパティにも型を付けられます。

## やること

\`User\` 型のオブジェクトを作り、\`\`\${user.name} is \${user.age} years old\`\` の形で出力してください。

## 期待出力

\`\`\`
Alice is 30 years old
\`\`\`
`,
        starterCode: `type User = {
  name: string;
  age: number;
};

const user: User = {
  name: "Alice",
  age: 30,
};

console.log(\`\${user.name} is \${user.age} years old\`);
`,
        expectedOutput: "Alice is 30 years old",
      },
    ],
  },
];

async function main() {
  await prisma.progress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();

  for (const course of courses) {
    await prisma.course.create({
      data: {
        slug: course.slug,
        title: course.title,
        description: course.description,
        order: course.order,
        lessons: {
          create: course.lessons.map((l) => ({
            slug: l.slug,
            title: l.title,
            order: l.order,
            contentMd: l.contentMd,
            starterCode: l.starterCode,
            expectedOutput: l.expectedOutput,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${courses.length} courses`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
