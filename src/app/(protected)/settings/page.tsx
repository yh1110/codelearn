import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { settingsUrl } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function SettingsIndexPage() {
  // /settings is a session-private namespace; require auth even though we are
  // about to redirect, so unauthenticated visitors land on the login flow
  // rather than briefly resolving to /settings/profile.
  await requireAuth();
  redirect(settingsUrl());
}
