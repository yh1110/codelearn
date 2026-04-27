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
import { CreateProblemSchema, UpdateProblemSchema } from "@/types/problem";

type Values = {
  slug: string;
  title: string;
  contentMd: string;
  starterCode: string;
  expectedOutput: string;
  order: string;
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

type FieldKey = "slug" | "title" | "contentMd" | "starterCode" | "expectedOutput" | "order";

const FIELD_KEYS: readonly FieldKey[] = [
  "slug",
  "title",
  "contentMd",
  "starterCode",
  "expectedOutput",
  "order",
] as const;

const emptyValues: Values = {
  slug: "",
  title: "",
  contentMd: "",
  starterCode: "",
  expectedOutput: "",
  order: "0",
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

    const payload = {
      slug: values.slug,
      title: values.title,
      contentMd: values.contentMd,
      starterCode: values.starterCode,
      expectedOutput: values.expectedOutput.length === 0 ? null : values.expectedOutput,
      order: Number.isFinite(orderNum) ? orderNum : Number.NaN,
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
