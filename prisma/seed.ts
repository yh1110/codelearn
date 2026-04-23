import { prisma } from "@/lib/prisma";

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
        slug: "let-const",
        title: "let と const",
        order: 3,
        contentMd: `# let と const

ES2015 以降の JavaScript / TypeScript では、変数宣言に \`var\` ではなく \`let\` と \`const\` を使います。

- \`const\` : 再代入できない変数 (定数)
- \`let\`   : 再代入できる変数

**原則 \`const\` を使い、再代入が必要なときだけ \`let\`** にするのが基本方針です。

## やること

\`count\` を \`let\` で \`0\` から始め、3 回インクリメントしてから出力してください。

## 期待出力

\`\`\`
3
\`\`\`

> 参考: [TypeScript Deep Dive — let](https://typescript-jp.gitbook.io/deep-dive/future-javascript/let)
`,
        starterCode: `const pi = 3.14;
let count = 0;
// TODO: count を 3 回 +1 する

console.log(count);
`,
        expectedOutput: "3",
      },
      {
        slug: "booleans",
        title: "真偽値と truthy / falsy",
        order: 4,
        contentMd: `# 真偽値と truthy / falsy

\`boolean\` 型は \`true\` / \`false\` の 2 値だけを取ります。条件式では \`boolean\` 以外の値も真偽値として評価されます (truthy / falsy)。

代表的な falsy: \`false\` \`0\` \`""\` \`null\` \`undefined\` \`NaN\`。これら以外は truthy です。

## やること

\`age\` (= 20) が 18 以上のとき \`true\` になるよう \`isAdult\` を埋めて、結果を出力してください。

## 期待出力

\`\`\`
adult
\`\`\`

> 参考: [サバイバル TypeScript — boolean](https://typescriptbook.jp/reference/values-types-variables/boolean)
`,
        starterCode: `const age = 20;
// TODO: age が 18 以上のとき true になる式を入れる
const isAdult: boolean = false;

console.log(isAdult ? "adult" : "child");
`,
        expectedOutput: "adult",
      },
      {
        slug: "conditionals",
        title: "条件分岐",
        order: 5,
        contentMd: `# 条件分岐

\`if\` / \`else if\` / \`else\` で処理を分けます。多くの条件を **値の同値判定** で分けたいときは \`switch\` も便利です。

## やること

\`score\` (= 75) を判定して \`grade\` に以下を入れてください。

- 80 以上 → \`"A"\`
- 60 以上 → \`"B"\`
- それ未満 → \`"C"\`

## 期待出力

\`\`\`
B
\`\`\`

> 参考: [サバイバル TypeScript — 条件分岐](https://typescriptbook.jp/reference/statements/if-else)
`,
        starterCode: `const score = 75;
let grade = "";

// TODO: score に応じて grade に "A" / "B" / "C" を代入

console.log(grade);
`,
        expectedOutput: "B",
      },
      {
        slug: "template-literals",
        title: "テンプレートリテラル",
        order: 6,
        contentMd: `# テンプレートリテラル

バッククォート \`\` \` \`\` で囲み \`\${ ... }\` を埋め込むと、文字列に式の評価結果を組み込めます。

\`\`\`ts
const n = 3;
console.log(\`n = \${n}\`); // → "n = 3"
\`\`\`

複数行の文字列もそのまま改行を含められます。

## やること

\`name\` と \`age\` をテンプレートリテラルで組み立て、\`Alice (30)\` という形式で出力してください。

## 期待出力

\`\`\`
Alice (30)
\`\`\`

> 参考: [サバイバル TypeScript — テンプレート文字列](https://typescriptbook.jp/reference/values-types-variables/string-literal)
`,
        starterCode: `const name = "Alice";
const age = 30;

// TODO: テンプレートリテラルで \`Alice (30)\` を作って出力
console.log("");
`,
        expectedOutput: "Alice (30)",
      },
      {
        slug: "functions",
        title: "関数",
        order: 7,
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
      {
        slug: "tuple",
        title: "タプル",
        order: 3,
        contentMd: `# タプル

**タプル (tuple)** は要素数と各位置の型が決まった配列です。例えば \`[number, string]\` は「1 番目は数値、2 番目は文字列」の固定長配列を表します。

## やること

座標を表すタプル \`point: [number, number]\` (= \`[3, 4]\`) から x, y を取り出し、その和を出力してください。

## 期待出力

\`\`\`
7
\`\`\`

> 参考: [TypeScript Deep Dive — Tuple](https://typescript-jp.gitbook.io/deep-dive/type-system/tuple)
`,
        starterCode: `const point: [number, number] = [3, 4];

// TODO: 分割代入で x と y を取り出して和を出力
const [x, y] = point;
console.log(0);
`,
        expectedOutput: "7",
      },
      {
        slug: "readonly-array",
        title: "readonly 配列",
        order: 4,
        contentMd: `# readonly 配列

配列の **要素を変更させたくない** とき、型を \`readonly T[]\` (または \`ReadonlyArray<T>\`) にすると、push / pop / 代入などの破壊的操作が型エラーになります。

\`\`\`ts
const xs: readonly number[] = [1, 2, 3];
// xs.push(4); // ❌ Property 'push' does not exist
\`\`\`

## やること

\`fruits\` の最初の要素を取り出して出力してください。

## 期待出力

\`\`\`
apple
\`\`\`

> 参考: [サバイバル TypeScript — readonly 配列](https://typescriptbook.jp/reference/values-types-variables/array/readonly-array)
`,
        starterCode: `const fruits: readonly string[] = ["apple", "banana", "cherry"];

// TODO: 最初の要素を first に取り出す
const first: string = "";

console.log(first);
`,
        expectedOutput: "apple",
      },
      {
        slug: "map-filter",
        title: "map と filter",
        order: 5,
        contentMd: `# map と filter

- \`Array.prototype.filter\` : 条件を満たす要素だけを残した新しい配列を返す
- \`Array.prototype.map\`    : 各要素を変換した新しい配列を返す

どちらも **元の配列は変更しない** イミュータブル操作です。

## やること

\`numbers\` から **偶数だけ** を残し、それぞれを **2 倍** にした配列を作って、カンマ区切りで出力してください。

## 期待出力

\`\`\`
4,8
\`\`\`

> 参考: [サバイバル TypeScript — 配列](https://typescriptbook.jp/reference/values-types-variables/array)
`,
        starterCode: `const numbers: number[] = [1, 2, 3, 4, 5];

// TODO: 偶数だけを抽出して、それぞれ 2 倍にした配列にする
const result: number[] = [];

console.log(result.join(","));
`,
        expectedOutput: "4,8",
      },
      {
        slug: "record-type",
        title: "Record 型",
        order: 6,
        contentMd: `# Record 型

\`Record<K, V>\` は **キーが K 型、値が V 型のオブジェクト** を表す組み込みのユーティリティ型です。辞書 (連想配列) を表現するのに便利です。

\`\`\`ts
const ages: Record<string, number> = { alice: 30, bob: 25 };
\`\`\`

## やること

\`scores\` から \`alice\` のスコアを取り出して出力してください。

## 期待出力

\`\`\`
80
\`\`\`

> 参考: [サバイバル TypeScript — Record](https://typescriptbook.jp/reference/type-reuse/utility-types/record)
`,
        starterCode: `const scores: Record<string, number> = {
  alice: 80,
  bob: 70,
};

// TODO: alice のスコアを取り出す
const aliceScore: number = 0;

console.log(aliceScore);
`,
        expectedOutput: "80",
      },
    ],
  },
  {
    slug: "ts-functions",
    title: "関数とスコープ",
    description: "アロー関数・オプション引数・コールバックなど、関数まわりの書き方を学びます。",
    order: 3,
    lessons: [
      {
        slug: "arrow-function",
        title: "アロー関数",
        order: 1,
        contentMd: `# アロー関数

アロー関数は \`function\` 文より短く書ける関数式です。

\`\`\`ts
const double = (n: number): number => n * 2;
\`\`\`

本体が式 1 つなら \`{}\` と \`return\` を省略できます。

## やること

2 つの \`number\` を受け取り、その和を返すアロー関数 \`sum\` を実装してください。

## 期待出力

\`\`\`
30
\`\`\`

> 参考: [サバイバル TypeScript — アロー関数](https://typescriptbook.jp/reference/functions/arrow-functions)
`,
        starterCode: `// TODO: a + b を返すアロー関数にする
const sum = (a: number, b: number): number => 0;

console.log(sum(10, 20));
`,
        expectedOutput: "30",
      },
      {
        slug: "optional-params",
        title: "オプション引数とデフォルト引数",
        order: 2,
        contentMd: `# オプション引数とデフォルト引数

- \`name?: string\` … 省略可能 (型は \`string | undefined\`)
- \`name: string = "World"\` … 省略時のデフォルト値を持つ

デフォルト引数を使うと省略時の値が確定し、本体内では \`string\` として扱えます。

## やること

\`greet("World")\` のように呼んだとき \`Hello, World!\` を返すよう、\`greet\` を実装してください (\`greeting\` のデフォルトは \`"Hello"\`)。

## 期待出力

\`\`\`
Hello, World!
\`\`\`

> 参考: [サバイバル TypeScript — デフォルト引数](https://typescriptbook.jp/reference/functions/default-parameters)
`,
        starterCode: `function greet(name: string, greeting: string = "Hello"): string {
  // TODO: \`\${greeting}, \${name}!\` を返す
  return "";
}

console.log(greet("World"));
`,
        expectedOutput: "Hello, World!",
      },
      {
        slug: "rest-params",
        title: "レスト引数",
        order: 3,
        contentMd: `# レスト引数

\`...args\` 構文で **可変長の引数** を 1 つの配列としてまとめて受け取れます。

\`\`\`ts
function log(...messages: string[]): void {
  for (const m of messages) console.log(m);
}
\`\`\`

## やること

任意個の \`number\` を受け取り、その合計を返す \`sumAll\` を実装してください。

## 期待出力

\`\`\`
10
\`\`\`

> 参考: [サバイバル TypeScript — 残余引数](https://typescriptbook.jp/reference/functions/rest-parameters)
`,
        starterCode: `function sumAll(...nums: number[]): number {
  // TODO: nums の合計を返す
  return 0;
}

console.log(sumAll(1, 2, 3, 4));
`,
        expectedOutput: "10",
      },
      {
        slug: "function-types",
        title: "関数型と型エイリアス",
        order: 4,
        contentMd: `# 関数型と型エイリアス

関数のシグネチャ自体に名前を付けたいとき、\`type\` で関数型エイリアスを定義します。

\`\`\`ts
type Predicate<T> = (value: T) => boolean;
const isEven: Predicate<number> = (n) => n % 2 === 0;
\`\`\`

## やること

\`BinaryOp\` 型を満たす \`multiply\` を実装してください。

## 期待出力

\`\`\`
42
\`\`\`

> 参考: [サバイバル TypeScript — 関数型](https://typescriptbook.jp/reference/functions/function-type)
`,
        starterCode: `type BinaryOp = (a: number, b: number) => number;

// TODO: a * b を返すアロー関数にする
const multiply: BinaryOp = (a, b) => 0;

console.log(multiply(6, 7));
`,
        expectedOutput: "42",
      },
      {
        slug: "callback-basics",
        title: "コールバック関数の基礎",
        order: 5,
        contentMd: `# コールバック関数の基礎

関数を **引数として受け取る** と、呼び出し側に処理を差し込んでもらえます (= コールバック)。

\`\`\`ts
[1, 2, 3].forEach((n) => console.log(n));
\`\`\`

## やること

\`repeat(times, callback)\` を実装し、\`0\` から \`times - 1\` まで順に \`callback(i)\` を呼んでください。

## 期待出力

\`\`\`
0,1,2
\`\`\`

> 参考: [サバイバル TypeScript — コールバック関数](https://typescriptbook.jp/reference/functions/callback)
`,
        starterCode: `function repeat(times: number, callback: (i: number) => void): void {
  // TODO: 0 から times - 1 まで callback を呼ぶ
}

const out: number[] = [];
repeat(3, (i) => out.push(i));
console.log(out.join(","));
`,
        expectedOutput: "0,1,2",
      },
    ],
  },
  {
    slug: "ts-types-advanced",
    title: "発展的な型",
    description: "union / intersection / リテラル型 / 型の絞り込み / ジェネリクスを学びます。",
    order: 4,
    lessons: [
      {
        slug: "union-types",
        title: "ユニオン型",
        order: 1,
        contentMd: `# ユニオン型

\`A | B\` と書くと、A か B のどちらかを取りうる型 (ユニオン型) になります。

\`\`\`ts
let id: number | string = 1;
id = "x1"; // OK
\`\`\`

## やること

\`Status\` を受け取り、\`"ok"\` なら \`"成功"\`、\`"error"\` なら \`"失敗"\` を返す \`describe\` を実装してください。

## 期待出力

\`\`\`
成功
\`\`\`

> 参考: [サバイバル TypeScript — ユニオン型](https://typescriptbook.jp/reference/values-types-variables/union)
`,
        starterCode: `type Status = "ok" | "error";

function describe(s: Status): string {
  // TODO: s に応じて "成功" / "失敗" を返す
  return "";
}

console.log(describe("ok"));
`,
        expectedOutput: "成功",
      },
      {
        slug: "intersection-types",
        title: "インターセクション型",
        order: 2,
        contentMd: `# インターセクション型

\`A & B\` と書くと、A の性質と B の性質を **両方持つ** 型になります。複数の型を合成したいときに使います。

\`\`\`ts
type WithId = { id: string };
type WithName = { name: string };
type Item = WithId & WithName; // { id: string; name: string }
\`\`\`

## やること

\`Person\` 型 (\`Named & Aged\`) のオブジェクトから \`Bob (25)\` の形式で出力してください。

## 期待出力

\`\`\`
Bob (25)
\`\`\`

> 参考: [サバイバル TypeScript — インターセクション型](https://typescriptbook.jp/reference/values-types-variables/intersection)
`,
        starterCode: `type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;

const p: Person = { name: "Bob", age: 25 };

// TODO: \`Bob (25)\` の形式の文字列を作って出力
console.log("");
`,
        expectedOutput: "Bob (25)",
      },
      {
        slug: "literal-types",
        title: "リテラル型",
        order: 3,
        contentMd: `# リテラル型

\`"up"\` のような **特定の値だけ** を表す型を **リテラル型** と呼びます。ユニオン型と組み合わせて、列挙のように使うのが定番です。

\`\`\`ts
type Direction = "up" | "down" | "left" | "right";
\`\`\`

## やること

\`Direction\` を受け取り \`move up\` のような文字列を返す \`move\` 関数を実装してください。

## 期待出力

\`\`\`
move up
\`\`\`

> 参考: [サバイバル TypeScript — リテラル型](https://typescriptbook.jp/reference/values-types-variables/literal-types)
`,
        starterCode: `type Direction = "up" | "down" | "left" | "right";

function move(d: Direction): string {
  // TODO: \`move \${d}\` を返す
  return "";
}

console.log(move("up"));
`,
        expectedOutput: "move up",
      },
      {
        slug: "narrowing",
        title: "型の絞り込み",
        order: 4,
        contentMd: `# 型の絞り込み (Narrowing)

ユニオン型の値は、\`typeof\` / \`instanceof\` / プロパティの有無 などで条件分岐すると、その分岐内では **より狭い型** として扱えます。

\`\`\`ts
function f(x: string | number) {
  if (typeof x === "string") {
    // ここでは x は string
  }
}
\`\`\`

## やること

\`string | number\` を受け取り、

- \`string\` なら \`"str:<value>"\`
- \`number\` なら \`"num:<value>"\`

を返す \`describe\` を実装してください。

## 期待出力

\`\`\`
num:42
\`\`\`

> 参考: [TypeScript Deep Dive — Type Guard](https://typescript-jp.gitbook.io/deep-dive/type-system/typeguard)
`,
        starterCode: `function describe(value: string | number): string {
  // TODO: typeof で絞り込み、それぞれの形式で文字列を返す
  return "";
}

console.log(describe(42));
`,
        expectedOutput: "num:42",
      },
      {
        slug: "generics-basics",
        title: "ジェネリクスの基礎",
        order: 5,
        contentMd: `# ジェネリクスの基礎

ジェネリクスは **型をパラメータ化** する仕組みです。関数や型に \`<T>\` を付けて、呼び出し時に型を決めます。

\`\`\`ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
\`\`\`

## やること

\`identity<T>\` を実装し、受け取った値をそのまま返してください。

## 期待出力

\`\`\`
123
\`\`\`

> 参考: [サバイバル TypeScript — ジェネリクス](https://typescriptbook.jp/reference/generics)
`,
        starterCode: `function identity<T>(value: T): T {
  // TODO: value をそのまま返す
  return value;
}

console.log(identity<number>(123));
`,
        expectedOutput: "123",
      },
    ],
  },
];

async function main() {
  // Progress rows are owned by Supabase Auth users (see prisma Profile model).
  // They are out of scope for content seeding — do not touch them here.
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();

  let lessonCount = 0;
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
    lessonCount += course.lessons.length;
  }

  console.log(`Seeded ${courses.length} courses / ${lessonCount} lessons`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
