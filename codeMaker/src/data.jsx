// Static demo data for codeMaker (JP/EN mix)

const COLLECTIONS = [
  {
    id: "getting-started",
    slug: "getting-started",
    title: "はじめての競プロ — 入門10問",
    author: { name: "codeMaker Team", handle: "official", avatar: "C" },
    official: true,
    desc: "標準入出力・ループ・条件分岐まで。プログラミング経験はあるけど競プロは初めての方向け。1問あたり10〜15分。",
    tags: ["入門", "I/O", "Python", "JavaScript"],
    difficulty: 1,
    problemCount: 10,
    stars: 1842,
    attempts: 28451,
    acRate: 73,
    progress: { done: 7, total: 10 },
    cover: "cover-1",
    glyph: "C/01",
  },
  {
    id: "array-tricks",
    slug: "array-tricks",
    title: "配列テクニック入門",
    author: { name: "yuki", handle: "yuki", avatar: "Y" },
    desc: "累積和・しゃくとり法・二分探索。配列系の定番テクを短い問題で。",
    tags: ["配列", "累積和", "しゃくとり"],
    difficulty: 2,
    problemCount: 8,
    stars: 612,
    attempts: 4280,
    acRate: 51,
    progress: { done: 2, total: 8 },
    cover: "cover-2",
    glyph: "[ ]",
  },
  {
    id: "binary-search",
    slug: "binary-search",
    title: "Binary Search Bootcamp",
    author: { name: "Chen", handle: "chen", avatar: "C" },
    desc: "Master binary search in 6 hand-picked problems. Ranges from classic lower-bound to parametric search.",
    tags: ["二分探索", "Bootcamp"],
    difficulty: 2,
    problemCount: 6,
    stars: 892,
    attempts: 7214,
    acRate: 44,
    progress: { done: 0, total: 6 },
    cover: "cover-3",
    glyph: "lo..hi",
  },
  {
    id: "graph-intro",
    slug: "graph-intro",
    title: "グラフ・DFS・BFS入門",
    author: { name: "hanako", handle: "hanako", avatar: "H" },
    desc: "隣接リストから始めて、DFS/BFS、連結成分判定まで。",
    tags: ["グラフ", "DFS", "BFS"],
    difficulty: 2,
    problemCount: 12,
    stars: 1033,
    attempts: 6120,
    acRate: 38,
    progress: { done: 3, total: 12 },
    cover: "cover-4",
    glyph: "⬢⬡",
  },
  {
    id: "dp-classics",
    slug: "dp-classics",
    title: "DP古典10選",
    author: { name: "alice", handle: "alice", avatar: "A" },
    desc: "ナップサック、LCS、区間DP、bitDP。1問ずつ噛み締めていく。",
    tags: ["DP", "古典"],
    difficulty: 3,
    problemCount: 10,
    stars: 2301,
    attempts: 12008,
    acRate: 28,
    progress: { done: 0, total: 10 },
    cover: "cover-5",
    glyph: "dp[i][j]",
  },
  {
    id: "string-ninja",
    slug: "string-ninja",
    title: "String Ninja — 文字列アルゴ道場",
    author: { name: "sato", handle: "sato", avatar: "S" },
    desc: "Z-algorithm, KMP, Suffix Array。本番で使えるレベルまで。",
    tags: ["文字列", "道場"],
    difficulty: 3,
    problemCount: 9,
    stars: 548,
    attempts: 2410,
    acRate: 22,
    progress: { done: 0, total: 9 },
    cover: "cover-6",
    glyph: "str[]",
  },
  {
    id: "warmup-daily",
    slug: "warmup-daily",
    title: "毎日5分ウォームアップ",
    author: { name: "takeshi", handle: "takeshi", avatar: "T" },
    desc: "朝のコーヒーと一緒に解ける5分問題を30問。",
    tags: ["入門", "ウォームアップ"],
    difficulty: 1,
    problemCount: 30,
    stars: 3122,
    attempts: 41200,
    acRate: 82,
    progress: { done: 14, total: 30 },
    cover: "cover-1",
    glyph: "☕",
  },
  {
    id: "math-foundations",
    slug: "math-foundations",
    title: "数学的思考の基礎",
    author: { name: "codeMaker Team", handle: "official", avatar: "C" },
    official: true,
    desc: "GCD, LCM, 素数判定, モジュラー演算。競プロの数学をゼロから。",
    tags: ["数学", "公式"],
    difficulty: 2,
    problemCount: 14,
    stars: 1456,
    attempts: 15803,
    acRate: 46,
    progress: { done: 5, total: 14 },
    cover: "cover-2",
    glyph: "∑",
  },
  {
    id: "interview-prep",
    slug: "interview-prep",
    title: "Tech Interview Prep — 25 Problems",
    author: { name: "Maria", handle: "maria", avatar: "M" },
    desc: "Common patterns from FAANG interviews, with detailed explanations.",
    tags: ["面接対策", "LeetCode風", "English"],
    difficulty: 2,
    problemCount: 25,
    stars: 4120,
    attempts: 28900,
    acRate: 39,
    progress: { done: 0, total: 25 },
    cover: "cover-3",
    glyph: "FAANG",
  },
];

// Problems for "getting-started" collection
const PROBLEMS = [
  {
    id: "p01", slug: "hello-world", num: 1,
    title: "Hello, codeMaker",
    subtitle: "最初の一歩 — 文字列を出力するだけ",
    difficulty: 1,
    acRate: 94,
    status: "ac",
    solveTime: "3 min",
  },
  {
    id: "p02", slug: "ab-sum", num: 2,
    title: "A + B",
    subtitle: "標準入力から2つの整数を読み、和を出力する",
    difficulty: 1,
    acRate: 88,
    status: "ac",
    solveTime: "5 min",
  },
  {
    id: "p03", slug: "max-of-three", num: 3,
    title: "3つの中で最大",
    subtitle: "条件分岐の基礎",
    difficulty: 1,
    acRate: 81,
    status: "ac",
    solveTime: "8 min",
  },
  {
    id: "p04", slug: "fizzbuzz", num: 4,
    title: "FizzBuzz, again",
    subtitle: "ループと条件分岐の合わせ技",
    difficulty: 1,
    acRate: 76,
    status: "ac",
    solveTime: "10 min",
  },
  {
    id: "p05", slug: "prefix-sum", num: 5,
    title: "区間スケジューリング",
    subtitle: "累積和を使って区間の和を高速に求める",
    difficulty: 2,
    acRate: 52,
    status: "try",
    solveTime: null,
  },
  {
    id: "p06", slug: "two-pointers", num: 6,
    title: "Two Sum (sorted)",
    subtitle: "ソート済み配列から和がKになる2要素を",
    difficulty: 2,
    acRate: 48,
    status: "wa",
    solveTime: null,
  },
  {
    id: "p07", slug: "bin-search", num: 7,
    title: "めぐる式二分探索",
    subtitle: "条件を満たす最小の値を見つける",
    difficulty: 2,
    acRate: 41,
    status: "none",
  },
  {
    id: "p08", slug: "sliding-window", num: 8,
    title: "Longest Unique Substring",
    subtitle: "Find the longest substring with no repeating chars",
    difficulty: 2,
    acRate: 36,
    status: "none",
  },
  {
    id: "p09", slug: "dp-intro", num: 9,
    title: "階段の登り方",
    subtitle: "1段 or 2段ずつ登る時の登り方の総数",
    difficulty: 2,
    acRate: 58,
    status: "none",
  },
  {
    id: "p10", slug: "graph-intro", num: 10,
    title: "連結成分の数",
    subtitle: "グラフが何個の連結成分に分かれるか",
    difficulty: 3,
    acRate: 29,
    status: "none",
  },
];

// Current problem (p05) — full content
const CURRENT_PROBLEM = {
  id: "p05",
  slug: "prefix-sum",
  num: 5,
  title: "区間スケジューリング",
  difficulty: 2,
  collection: { slug: "getting-started", title: "はじめての競プロ — 入門10問" },
  author: { name: "codeMaker Team", handle: "official", avatar: "C" },
  limits: { time: "2 sec", memory: "256 MB" },
  statement: [
    { kind: "h2", text: "問題文" },
    { kind: "p", text: "長さ N の整数列 A = (A₁, A₂, ..., Aₙ) が与えられます。Q 個のクエリが与えられ、各クエリは区間 [L, R] を表します。" },
    { kind: "p", text: "各クエリについて、A_L + A_{L+1} + ... + A_R の値を出力してください。" },
    { kind: "h2", text: "制約" },
    { kind: "ul", items: [
      "1 ≤ N, Q ≤ 10^5",
      "1 ≤ Aᵢ ≤ 10^9",
      "1 ≤ L ≤ R ≤ N",
      "入力は全て整数",
    ]},
    { kind: "h2", text: "入力形式" },
    { kind: "code", text: "N Q\nA_1 A_2 ... A_N\nL_1 R_1\nL_2 R_2\n:\nL_Q R_Q" },
    { kind: "h2", text: "出力形式" },
    { kind: "p", text: "各クエリに対する答えを、1行に1つずつ出力してください。" },
  ],
  samples: [
    {
      in: "5 3\n1 2 3 4 5\n1 3\n2 5\n1 5",
      out: "6\n14\n15",
      note: "1+2+3 = 6, 2+3+4+5 = 14, 1+2+3+4+5 = 15",
    },
    {
      in: "3 2\n10 20 30\n1 1\n1 3",
      out: "10\n60",
      note: null,
    },
  ],
  hints: [
    { level: 1, text: "愚直に各クエリごとに和を計算すると O(NQ) になり、間に合いません。" },
    { level: 2, text: "累積和を前計算すると、1クエリ O(1) で答えられます。" },
    { level: 3, text: "S[i] = A_1 + ... + A_i としたとき、A_L + ... + A_R = S[R] - S[L-1]。" },
  ],
};

// Starter code per language
const STARTERS = {
  python: `# 区間スケジューリング — prefix sum
import sys
input = sys.stdin.readline

def main():
    N, Q = map(int, input().split())
    A = list(map(int, input().split()))
    # TODO: build prefix sum and answer queries
    for _ in range(Q):
        L, R = map(int, input().split())
        print(0)

if __name__ == "__main__":
    main()
`,
  javascript: `// 区間スケジューリング — prefix sum
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const [N, Q] = lines[0].split(' ').map(Number);
const A = lines[1].split(' ').map(Number);

// TODO: build prefix sum and answer queries
const out = [];
for (let i = 0; i < Q; i++) {
  const [L, R] = lines[2 + i].split(' ').map(Number);
  out.push(0);
}
console.log(out.join('\\n'));
`,
  cpp: `// 区間スケジューリング — prefix sum
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int N, Q; cin >> N >> Q;
    vector<long long> A(N);
    for (auto &x : A) cin >> x;

    // TODO: build prefix sum and answer queries
    while (Q--) {
        int L, R; cin >> L >> R;
        cout << 0 << "\\n";
    }
    return 0;
}
`,
  rust: `// 区間スケジューリング — prefix sum
use std::io::{self, Read, Write, BufWriter};

fn main() {
    let mut s = String::new();
    io::stdin().read_to_string(&mut s).unwrap();
    let stdout = io::stdout();
    let mut out = BufWriter::new(stdout.lock());
    let mut it = s.split_ascii_whitespace();
    let mut next = || it.next().unwrap().parse::<i64>().unwrap();

    let n = next() as usize;
    let q = next() as usize;
    let a: Vec<i64> = (0..n).map(|_| next()).collect();

    // TODO: build prefix sum and answer queries
    for _ in 0..q {
        let _l = next();
        let _r = next();
        writeln!(out, "0").unwrap();
    }
}
`,
};

// Submissions (for profile / me page)
const SUBMISSIONS = [
  { id: 41203, when: "2026-04-24 13:42", problem: "区間スケジューリング", collection: "はじめての競プロ", lang: "Python", status: "WA", time: "—", mem: "—" },
  { id: 41198, when: "2026-04-24 13:35", problem: "区間スケジューリング", collection: "はじめての競プロ", lang: "Python", status: "TLE", time: "2.00s", mem: "48 MB" },
  { id: 41150, when: "2026-04-24 11:02", problem: "FizzBuzz, again", collection: "はじめての競プロ", lang: "Python", status: "AC", time: "32 ms", mem: "12 MB" },
  { id: 40880, when: "2026-04-23 22:18", problem: "3つの中で最大", collection: "はじめての競プロ", lang: "JavaScript", status: "AC", time: "18 ms", mem: "24 MB" },
  { id: 40821, when: "2026-04-23 21:50", problem: "A + B", collection: "はじめての競プロ", lang: "JavaScript", status: "AC", time: "14 ms", mem: "21 MB" },
  { id: 40302, when: "2026-04-22 19:40", problem: "Two Sum (sorted)", collection: "配列テクニック入門", lang: "Python", status: "WA", time: "—", mem: "—" },
  { id: 40290, when: "2026-04-22 19:12", problem: "Two Sum (sorted)", collection: "配列テクニック入門", lang: "Python", status: "AC", time: "88 ms", mem: "18 MB" },
  { id: 39911, when: "2026-04-21 09:04", problem: "Hello, codeMaker", collection: "はじめての競プロ", lang: "Python", status: "AC", time: "28 ms", mem: "10 MB" },
];

// Users the current user created collections for
const MY_CREATIONS = [
  {
    id: "mine-1",
    title: "木DP 超入門 — 5問",
    status: "draft",
    problems: 3,
    lastEdited: "2時間前",
    attempts: 0,
    acRate: null,
    cover: "cover-4",
  },
  {
    id: "mine-2",
    title: "累積和のキホン",
    status: "pub",
    problems: 6,
    lastEdited: "2週間前",
    attempts: 412,
    acRate: 58,
    cover: "cover-2",
  },
  {
    id: "mine-3",
    title: "Segment Tree in 5 steps",
    status: "pub",
    problems: 5,
    lastEdited: "1ヶ月前",
    attempts: 1204,
    acRate: 34,
    cover: "cover-6",
  },
];

// Generate 52 weeks * 7 days heatmap
const HEATMAP = (() => {
  const days = 52 * 7;
  const arr = [];
  // Use deterministic pseudo-random (seeded)
  let seed = 42;
  const rng = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < days; i++) {
    const r = rng();
    let v = 0;
    if (r > 0.55) v = 1;
    if (r > 0.75) v = 2;
    if (r > 0.88) v = 3;
    if (r > 0.96) v = 4;
    // a few empty streaks for realism
    if (i > 120 && i < 140) v = 0;
    if (i > 300 && i < 320 && r > 0.7) v = 0;
    arr.push(v);
  }
  return arr;
})();

const CURRENT_USER = {
  name: "Kenji Tanaka",
  handle: "kenji",
  avatar: "K",
  bio: "アルゴリズム練習中 / Python, Rust / コードを書いて学ぶのが好きです。",
  joined: "2025-11",
  acCount: 142,
  createdCount: 3,
  likes: 1616,
  streak: 14,
};

// Tags for Explore filter
const ALL_TAGS = [
  "入門", "DP", "グラフ", "二分探索", "文字列", "数学",
  "累積和", "しゃくとり", "面接対策", "古典", "Bootcamp", "English",
];

window.DATA = {
  COLLECTIONS, PROBLEMS, CURRENT_PROBLEM, STARTERS,
  SUBMISSIONS, MY_CREATIONS, HEATMAP, CURRENT_USER, ALL_TAGS,
};
