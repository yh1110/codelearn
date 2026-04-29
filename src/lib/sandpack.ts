// Pure helpers to bridge Prisma's Json columns and the strongly-typed
// SandpackTemplate / SandpackStarterFiles surfaces consumed by client
// components. Kept framework-agnostic so it can be imported from Server
// Components and Server Actions without dragging in `server-only`.

import {
  type SandpackStarterFiles,
  SandpackStarterFilesSchema,
  type SandpackTemplate,
  SandpackTemplateSchema,
} from "@/types/problem";

type RawSandpackInput = {
  sandpackTemplate: string | null;
  starterFiles: unknown;
};

/**
 * Validate the persisted `sandpack_template` / `starter_files` columns and
 * narrow them to the typed unions the UI expects. Invalid rows fall back to
 * `null` so the dispatch wrapper can render a clear error instead of crashing
 * the page render.
 */
export function coerceSandpackFields(input: RawSandpackInput): {
  sandpackTemplate: SandpackTemplate | null;
  starterFiles: SandpackStarterFiles | null;
} {
  const templateResult = input.sandpackTemplate
    ? SandpackTemplateSchema.safeParse(input.sandpackTemplate)
    : null;
  const filesResult = input.starterFiles
    ? SandpackStarterFilesSchema.safeParse(input.starterFiles)
    : null;
  return {
    sandpackTemplate: templateResult?.success ? templateResult.data : null,
    starterFiles: filesResult?.success ? filesResult.data : null,
  };
}
