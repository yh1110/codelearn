import { z } from "zod";

export const ProblemSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "slug は小文字英数字とハイフンのみ");

export const ExecutorSchema = z.enum(["WORKER", "SANDPACK"]);
export type Executor = z.infer<typeof ExecutorSchema>;

// Curated Sandpack template list. Sandpack supports more, but limiting the
// authoring surface keeps the runtime asset budget predictable and lets us
// add templates intentionally.
export const SandpackTemplateSchema = z.enum([
  "react",
  "react-ts",
  "vue",
  "vue-ts",
  "vanilla",
  "vanilla-ts",
  "vite",
  "vite-react",
  "vite-react-ts",
  "vite-vue",
  "vite-vue-ts",
]);
export type SandpackTemplate = z.infer<typeof SandpackTemplateSchema>;

export const SandpackStarterFilesSchema = z
  .record(
    z.string().min(1).regex(/^\//, "Sandpack file path must start with '/'"),
    z.string().max(50_000),
  )
  .refine((files) => Object.keys(files).length > 0, {
    message: "starterFiles に最低 1 ファイル必要です",
  });
export type SandpackStarterFiles = z.infer<typeof SandpackStarterFilesSchema>;

const ProblemBaseFields = {
  slug: ProblemSlugSchema,
  title: z.string().min(1).max(120),
  contentMd: z.string().min(1).max(50_000),
  starterCode: z.string().max(50_000),
  expectedOutput: z.string().max(10_000).nullable(),
  order: z.number().int().min(0).max(10_000),
  executor: ExecutorSchema.default("WORKER"),
  sandpackTemplate: SandpackTemplateSchema.nullable().default(null),
  starterFiles: SandpackStarterFilesSchema.nullable().default(null),
} as const;

// SANDPACK requires both template and starter files; WORKER does not use them.
// Enforced server-side regardless of UI gating.
const executorPayloadCheck = (
  data: {
    executor: Executor;
    sandpackTemplate: SandpackTemplate | null;
    starterFiles: SandpackStarterFiles | null;
  },
  ctx: z.RefinementCtx,
) => {
  if (data.executor !== "SANDPACK") return;
  if (!data.sandpackTemplate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["sandpackTemplate"],
      message: "SANDPACK では sandpackTemplate が必須です",
    });
  }
  if (!data.starterFiles) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["starterFiles"],
      message: "SANDPACK では starterFiles が必須です",
    });
  }
};

export const CreateProblemSchema = z
  .object({
    collectionId: z.cuid(),
    ...ProblemBaseFields,
  })
  .superRefine(executorPayloadCheck);

export const UpdateProblemSchema = z
  .object({
    id: z.cuid(),
    ...ProblemBaseFields,
  })
  .superRefine(executorPayloadCheck);

export const DeleteProblemSchema = z.object({
  id: z.cuid(),
});

export const TogglePublishProblemSchema = z.object({
  id: z.cuid(),
  isPublished: z.boolean(),
});

export type CreateProblemInput = z.infer<typeof CreateProblemSchema>;
export type UpdateProblemInput = z.infer<typeof UpdateProblemSchema>;
