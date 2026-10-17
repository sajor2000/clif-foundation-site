import { convexTest } from "convex-test";
import { api } from "../../convex/_generated/api";
import schema from "../../convex/schema";

export { api };

export const ADMIN = "info@clificufoundation.org";

const modules = import.meta.glob("../../convex/**/*.*s");

/** Fresh mock backend with the production bootstrap email configured. */
export function backend() {
  process.env.BOOTSTRAP_ADMIN_EMAIL = ADMIN;
  return convexTest(schema, modules);
}

export type Backend = ReturnType<typeof backend>;

/** A signed-in Clerk user with a verified email. */
export function as(t: Backend, email: string) {
  return t.withIdentity({ email, emailVerified: true, subject: `user|${email}` });
}

/** Seed allowlist rows directly (admin claims first via the real mutation). */
export async function seedBoard(
  t: Backend,
  members: { email: string; role?: "member" | "secretary" | "chair" | "admin"; isDirector?: boolean }[],
) {
  await as(t, ADMIN).mutation(api.board.bootstrapAdmin, {});
  for (const m of members) {
    await as(t, ADMIN).mutation(api.board.upsertMember, {
      email: m.email,
      role: m.role ?? "member",
      isDirector: m.isDirector ?? true,
    });
  }
}
