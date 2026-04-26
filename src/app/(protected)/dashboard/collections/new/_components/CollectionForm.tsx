"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { z } from "zod";
import { createCollectionAction, updateCollectionAction } from "@/actions/dashboard/collection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateCollectionSchema, UpdateCollectionSchema } from "@/types/collection";

type Values = {
  slug: string;
  title: string;
  description: string;
  order: string;
};

type Props =
  | {
      mode: "create";
      initial?: Partial<Values>;
    }
  | {
      mode: "edit";
      collectionId: string;
      initial: Values;
    };

const emptyValues: Values = { slug: "", title: "", description: "", order: "0" };

export function CollectionForm(props: Props) {
  const router = useRouter();
  const initial = props.mode === "create" ? { ...emptyValues, ...props.initial } : props.initial;
  const [values, setValues] = useState<Values>(initial);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Values, string>>>({});
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

    const baseInput = {
      slug: values.slug,
      title: values.title,
      description: values.description,
      order: Number.isFinite(orderNum) ? orderNum : Number.NaN,
    };

    const parsed =
      props.mode === "create"
        ? CreateCollectionSchema.safeParse(baseInput)
        : UpdateCollectionSchema.safeParse({ id: props.collectionId, ...baseInput });

    if (!parsed.success) {
      setFieldErrors(mapZodError(parsed.error));
      return;
    }

    startTransition(async () => {
      const result =
        props.mode === "create"
          ? await createCollectionAction(parsed.data as z.infer<typeof CreateCollectionSchema>)
          : await updateCollectionAction(parsed.data as z.infer<typeof UpdateCollectionSchema>);

      if (result?.serverError) {
        setFormError(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        setFieldErrors(extractFieldErrors(result.validationErrors));
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="collection-title">タイトル</Label>
        <Input
          id="collection-title"
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
        <Label htmlFor="collection-slug">slug</Label>
        <Input
          id="collection-slug"
          value={values.slug}
          onChange={(e) => setValue("slug", e.target.value)}
          placeholder="my-collection"
          aria-invalid={!!fieldErrors.slug}
        />
        <p className="text-xs text-muted-foreground">
          URL に使われます。小文字英数字とハイフンのみ。あなたのプロフィール内で重複不可。
        </p>
        {fieldErrors.slug && (
          <p className="text-xs text-destructive" role="alert">
            {fieldErrors.slug}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="collection-description">説明</Label>
        <Textarea
          id="collection-description"
          rows={4}
          value={values.description}
          onChange={(e) => setValue("description", e.target.value)}
          aria-invalid={!!fieldErrors.description}
        />
        {fieldErrors.description && (
          <p className="text-xs text-destructive" role="alert">
            {fieldErrors.description}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="collection-order">表示順</Label>
        <Input
          id="collection-order"
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

function mapZodError(error: z.ZodError): Partial<Record<keyof Values, string>> {
  const result: Partial<Record<keyof Values, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (
      typeof key === "string" &&
      (key === "slug" || key === "title" || key === "description" || key === "order")
    ) {
      if (!result[key]) result[key] = issue.message;
    }
  }
  return result;
}

type FormattedErrors = {
  _errors?: string[];
  [key: string]: { _errors?: string[] } | string[] | undefined;
};

function extractFieldErrors(errors: unknown): Partial<Record<keyof Values, string>> {
  const result: Partial<Record<keyof Values, string>> = {};
  if (typeof errors !== "object" || errors === null) return result;
  const ve = errors as FormattedErrors;
  for (const key of ["slug", "title", "description", "order"] as const) {
    const entry = ve[key] as { _errors?: string[] } | undefined;
    const msg = entry?._errors?.[0];
    if (msg) result[key] = msg;
  }
  return result;
}
