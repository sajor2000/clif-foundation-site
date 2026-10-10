import { Exit } from "effect";
import { NextResponse } from "next/server";
import { runCreateDonationSession } from "@/lib/effect/donations";

export async function POST() {
  const exit = await runCreateDonationSession();

  if (Exit.isFailure(exit)) {
    return NextResponse.json(
      {
        error: "DonationsNotConfigured",
        message: "Online giving — coming soon",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      error: "DonationsNotConfigured",
      message: "Online giving — coming soon",
    },
    { status: 503 },
  );
}

export async function GET() {
  return POST();
}
