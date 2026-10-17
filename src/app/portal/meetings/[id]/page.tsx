import { MeetingsView } from "@/components/portal/MeetingsView";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default async function PortalMeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MeetingsView meetingId={id as Id<"meetings">} />;
}
