import { VotesView } from "@/components/portal/VotesView";

export default async function PortalVoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VotesView focusId={id} />;
}
