"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { z } from "zod";
import { createProblemAction, updateProblemAction } from "@/actions/dashboard/problem";
import { MonacoCodeInput } from "@/components/editor/MonacoCodeInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateProblemSchema,
  type Executor,
  ExecutorSchema,
  SandpackStarterFilesSchema,
  SandpackTemplateSchema,
  UpdateProblemSchema,
} from "@/types/problem";

type Values = {
  slug: string;
  title: string;
  contentMd: string;
  starterCode: string;
  expectedOutput: string;
  order: string;
  executor: Executor;
  sandpackTemplate: string;
  /** JSON string edited by hand; parsed on submit. */
  starterFilesJson: string;
};

type Props =
  | {
      mode: "create";
      collectionId: string;
      initial?: Partial<Values>;
    }
  | {
      mode: "edit";
      collectionId: string;
      problemId: string;
      initial: Values;
    };

type FieldKey =
  | "slug"
  | "title"
  | "contentMd"
  | "starterCode"
  | "expectedOutput"
  | "order"
  | "executor"
  | "sandpackTemplate"
  | "starterFiles";

const FIELD_KEYS: readonly FieldKey[] = [
  "slug",
  "title",
  "contentMd",
  "starterCode",
  "expectedOutput",
  "order",
  "executor",
  "sandpackTemplate",
  "starterFiles",
] as const;

const SANDPACK_TEMPLATE_OPTIONS = SandpackTemplateSchema.options;

const emptyValues: Values = {
  slug: "",
  title: "",
  contentMd: "",
  starterCode: "",
  expectedOutput: "",
  order: "0",
  executor: "WORKER",
  sandpackTemplate: "react-ts",
  starterFilesJson:
    '{\n  "/App.tsx": "export default function App() {\\n  return <div>Hello</div>;\\n}\\n"\n}\n',
};

export function ProblemForm(props: Props) {
  const router = useRouter();
  const initial = props.mode === "create" ? { ...emptyValues, ...props.initial } : props.initial;
  const [values, setValues] = useState<Values>(initial);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const setValue = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const orderNum = Number(values.order);
    const isSandpack = values.executor === "SANDPACK";

    let starterFilesParsed: unknown = null;
    if (isSandpack) {
      try {
        starterFilesParsed = JSON.parse(values.starterFilesJson);
      } catch (_err) {
        setFieldErrors({ starterFiles: "JSON が不正です" });
        return;
      }
    }

    const payload = {
      slug: values.slug,
      title: values.title,
      contentMd: values.contentMd,
      starterCode: values.starterCode,
      expectedOutput: values.expectedOutput.length === 0 ? null : values.expectedOutput,
      order: Number.isFinite(orderNum) ? orderNum : Number.NaN,
      executor: values.executor,
      sandpackTemplate: isSandpack ? values.sandpackTemplate : null,
      starterFiles: isSandpack ? starterFilesParsed : null,
    };

    const parsed =
      props.mode === "create"
        ? CreateProblemSchema.safeParse({ collectionId: props.collectionId, ...payload })
        : UpdateProblemSchema.safeParse({ id: props.problemId, ...payload });

    if (!parsed.success) {
      setFieldErrors(mapZodError(parsed.error));
      return;
    }

    startTransition(async () => {
      const result =
        props.mode === "create"
          ? await createProblemAction(parsed.data as z.infer<typeof CreateProblemSchema>)
          : await updateProblemAction(parsed.data as z.infer<typeof UpdateProblemSchema>);

      if (result?.serverError) {
        setFormError(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        setFieldErrors(extractFieldErrors(result.validationErrors));
        return;
      }
      router.push(`/dashboard/collections/${props.collectionId}`);
      router.refresh();
    });
  };

  const isSandpack = values.executor === "SANDPACK";

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="problem-title">タイトル</Label>
        <Input
          id="problem-title"
          value={values.title}
          onChange={(e) => setValue("title", e.target.value)}
          aria-invalid={!!fieldErrors.title}
        />
        {fieldErrors.title && (
          <p className="text-xs text-destructive" role="alert">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="problem-slug">slug</Label>
        <Input
          id="problem-slug"
          value={values.slug}
          onChange={(e) => setValue("slug", e.target.value)}
          placeholder="hello-world"
          aria-invalid={!!fieldErrors.slug}
        />
        {fieldErrors.slug && (
          <p className="text-xs text-destructive" role="alert">
            {fieldErrors.slug}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="problem-content">説明 (Markdown)</Label>
        <Textarea
          id="problem-content"
          rows={10}
          value={values.contentMd}
          onChange={(e) => setValue("contentMd", e.target.value)}
          aria-invalid={!!fieldErrors.contentMd}
        />
        {fieldErrors.contentMd && (
          <p className="text-xs text-destructive" role="alert">
            {fieldErrors.contentMd}
          </p>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">実行モード</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          {ExecutorSchema.options.map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="radio"
                name="executor"
                value={opt}
                checked={values.executor === opt}
                onChange={() => setValue("executor", opt)}
              />
              <span>
                {opt === "WORKER"
                  ? "WORKER (esbuild-wasm + Web Worker, stdout 比較)"
                  : "SANDPACK (iframe + bundler, React/フロント)"}
              </span>
            </label>
          ))}
        </div>
        {fieldErrors.executor && (
          <p className="text-xs text-destructive" role="alert">
            {fieldErrors.executor}
          </p>
        )}
      </fieldset>

      {!isSandpack ? (
        <>
          <div className="space-y-1.5">
            <Label id="problem-starter-label">スターターコード</Label>
            <MonacoCodeInput
              ariaLabelledBy="problem-starter-label"
              height="300px"
              id="problem-starter"
              value={values.starterCode}
              onChange={(v) => setValue("starterCode", v)}
            />
            {fieldErrors.starterCode && (
              <p className="text-xs text-destructive" role="alert">
                {fieldErrors.starterCode}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="problem-expected">期待出力 (空欄なら判定なし)</Label>
            <Textarea
              id="problem-expected"
              rows={3}
              value={values.expectedOutput}
              onChange={(e) => setValue("expectedOutput", e.target.value)}
              aria-invalid={!!fieldErrors.expectedOutput}
            />
            {fieldErrors.expectedOutput && (
              <p className="text-xs text-destructive" role="alert">
                {fieldErrors.expectedOutput}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="problem-sandpack-template">Sandpack テンプレート</Label>
            <select
              id="problem-sandpack-template"
              className="block h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={values.sandpackTemplate}
              onChange={(e) => setValue("sandpackTemplate", e.target.value)}
              aria-invalid={!!fieldErrors.sandpackTemplate}
            >
              {SANDPACK_TEMPLATE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {fieldErrors.sandpackTemplate && (
              <p className="text-xs text-destructive" role="alert">
                {fieldErrors.sandpackTemplate}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="problem-starter-files">スターターファイル (JSON)</Label>
            <Textarea
              id="problem-starter-files"
              rows={10}
              value={values.starterFilesJson}
              onChange={(e) => setValue("starterFilesJson", e.target.value)}
              aria-invalid={!!fieldErrors.starterFiles}
              className="font-mono text-xs"
              placeholder='{"/App.tsx": "..."}'
            />
            <p className="text-xs text-muted-foreground">
              キーは <code>/</code> から始まるパス、値はファイル内容の文字列。
            </p>
            {fieldErrors.starterFiles && (
              <p className="text-xs text-destructive" role="alert">
                {fieldErrors.starterFiles}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="problem-expected">
              判定キーワード (カンマ区切り、空欄なら判定なし)
            </Label>
            <Textarea
              id="problem-expected"
              rows={2}
              value={values.expectedOutput}
              onChange={(e) => setValue("expectedOutput", e.target.value)}
              aria-invalid={!!fieldErrors.expectedOutput}
              placeholder="useState,onClick"
            />
            <p className="text-xs text-muted-foreground">
              指定したキーワードがファイル内容にすべて含まれていればクリア扱い。
            </p>
            {fieldErrors.expectedOutput && (
              <p className="text-xs text-destructive" role="alert">
                {fieldErrors.expectedOutput}
              </p>
            )}
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="problem-order">表示順</Label>
        <Input
          id="problem-order"
          type="number"
          min={0}
          value={values.order}
          onChange={(e) => setValue("order", e.target.value)}
          aria-invalid={!!fieldErrors.order}
        />
        {fieldErrors.order && (
          <p className="text-xs text-destructive" role="alert">
            {fieldErrors.order}
          </p>
        )}
      </div>

      {formError && (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button disabled={isPending} onClick={() => router.back()} type="button" variant="outline">
          キャンセル
        </Button>
        <Button disabled={isPending} type="submit">
          {isPending ? "保存中..." : props.mode === "create" ? "作成" : "更新"}
        </Button>
      </div>
    </form>
  );
}

// Re-export so the edit page can build initial Values without taking an extra
// dependency on the schema module just for parsing JSON strings.
export function starterFilesToJsonString(value: unknown): string {
  if (value === null || value === undefined) return emptyValues.starterFilesJson;
  const parsed = SandpackStarterFilesSchema.safeParse(value);
  if (!parsed.success) return JSON.stringify(value, null, 2);
  return JSON.stringify(parsed.data, null, 2);
}

function mapZodError(error: z.ZodError): Partial<Record<FieldKey, string>> {
  const result: Partial<Record<FieldKey, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && (FIELD_KEYS as readonly string[]).includes(key)) {
      const k = key as FieldKey;
      if (!result[k]) result[k] = issue.message;
    }
  }
  return result;
}

function extractFieldErrors(errors: unknown): Partial<Record<FieldKey, string>> {
  const result: Partial<Record<FieldKey, string>> = {};
  if (typeof errors !== "object" || errors === null) return result;
  const ve = errors as Record<string, { _errors?: string[] } | undefined>;
  for (const key of FIELD_KEYS) {
    const msg = ve[key]?._errors?.[0];
    if (msg) result[key] = msg;
  }
  return result;
}
