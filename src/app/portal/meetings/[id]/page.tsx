import { MeetingsView } from "@/components/portal/MeetingsView";

export default async function PortalMeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MeetingsView meetingId={id} />;
}
