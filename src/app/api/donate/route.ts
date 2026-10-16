import { Effect } from "effect";
import { NextResponse } from "next/server";
import { createDonationInstructions } from "@/lib/effect/donations";
import { exitToJsonResponse } from "@/lib/effect/http";

async function handle(request: Request) {
  let body: unknown = {};
  if (request.method === "POST") {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = await Effect.runPromise(
        Effect.tryPromise({
          try: () => request.json(),
          catch: () => ({}),
        }),
      );
    }
  }

  const exit = await Effect.runPromiseExit(createDonationInstructions(body));

  return exitToJsonResponse(exit, {
    onSuccess: (instructions) =>
      NextResponse.json({ ok: true as const, ...instructions }),
    onTagged: {
      InvalidDonationRequest: (error) =>
        NextResponse.json(
          {
            error: "InvalidDonationRequest",
            message: error.reason,
          },
          { status: 400 },
        ),
    },
  });
}

export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}
