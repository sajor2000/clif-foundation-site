import { Effect } from "effect";
import { NextResponse } from "next/server";
import { exitToJsonResponse } from "@/lib/effect/http";
import { inquiryMailto, validateInquiry } from "@/lib/effect/inquiry";

export async function POST(request: Request) {
  const body = await Effect.runPromise(
    Effect.tryPromise({
      try: () => request.json() as Promise<unknown>,
      catch: () => null,
    }),
  );

  if (body === null) {
    return NextResponse.json(
      { error: "InvalidInquiry", message: "Expected JSON body" },
      { status: 400 },
    );
  }

  const exit = await Effect.runPromiseExit(validateInquiry(body));

  return exitToJsonResponse(exit, {
    onSuccess: (inquiry) =>
      NextResponse.json({
        ok: true as const,
        mailto: inquiryMailto(inquiry),
      }),
    onTagged: {
      InvalidInquiry: (error) =>
        NextResponse.json(
          { error: "InvalidInquiry", message: error.reason },
          { status: 400 },
        ),
    },
  });
}
