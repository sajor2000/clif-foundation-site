import { Cause, Exit } from "effect";
import { NextResponse } from "next/server";

/** Map an Effect Exit to a JSON NextResponse by tagged error `_tag`. */
export function exitToJsonResponse<A, E extends { readonly _tag: string }>(
  exit: Exit.Exit<A, E>,
  handlers: {
    onSuccess: (value: A) => NextResponse;
    onTagged: Partial<Record<string, (error: E) => NextResponse>>;
    onUnknown?: (message: string) => NextResponse;
  },
): NextResponse {
  if (Exit.isSuccess(exit)) {
    return handlers.onSuccess(exit.value);
  }

  const squashed = Cause.squash(exit.cause);
  if (
    squashed &&
    typeof squashed === "object" &&
    "_tag" in squashed &&
    typeof (squashed as { _tag: unknown })._tag === "string"
  ) {
    const tagged = squashed as E;
    const handler = handlers.onTagged[tagged._tag];
    if (handler) {
      return handler(tagged);
    }
  }

  const message = Cause.pretty(exit.cause);
  return (
    handlers.onUnknown?.(message) ??
    NextResponse.json(
      { error: "InternalError", message: "Unexpected failure" },
      { status: 500 },
    )
  );
}
