import { RespondForm } from "./respond-form";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: { id: string };
};

export default async function TicketDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/ticket/${params.id}/view`, {
    cache: "no-store",
    headers: {
      Cookie: "", // allow server-side fetch
    },
  });

  if (!res.ok) {
    notFound();
  }

  const { ticket } = await res.json();

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Ticket Details</h1>

      <Card>
        <CardContent className="p-6 space-y-2">
          <div className="text-xl font-semibold">{ticket.title}</div>
          <div className="text-muted-foreground">By {ticket.user.name} ({ticket.user.email})</div>
          <div>
            <Badge variant="outline">{ticket.category.name}</Badge>
            <Badge variant="default" className="ml-2">{ticket.status}</Badge>
          </div>
          <div className="mt-4">{ticket.description}</div>

          {ticket.attachments?.length > 0 && (
            <div className="mt-4">
              <strong>Attachments:</strong>
              <ul className="list-disc list-inside">
                {ticket.attachments.map((att: string, idx: number) => (
                  <li key={idx}>
                    <a className="text-blue-500 underline" href={att} target="_blank">{att}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Conversation</h2>
        {ticket.comments.length === 0 ? (
          <p className="text-muted-foreground">No replies yet.</p>
        ) : (
          <div className="space-y-4">
            {ticket.comments.map((comment: any) => (
              <Card key={comment.id}>
                <CardContent className="p-4 space-y-1">
                  <div className="text-sm font-semibold">
                    {comment.author.name} <span className="text-muted-foreground text-xs">({comment.author.role})</span>
                  </div>
                  <div>{comment.message}</div>
                  <div className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Respond Form */}
      {(role === "SUPPORT_AGENT" || role === "ADMIN") && (
        <RespondForm ticketId={params.id} />
      )}
    </div>
  );
}
