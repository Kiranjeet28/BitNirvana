// components/TicketCard.tsx
// import { Badge } from "@/components/ui/badge";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TicketCard({ ticket,onClick }: { ticket: any, onClick: () => void }) {
  return (
    <Card className="border-green-500 bg-zinc-900 text-white hover:shadow-lg transition-all">
      <CardHeader>
        <CardTitle className="text-green-400 text-lg">
          {ticket.title}
        </CardTitle>
        <div className="text-sm text-zinc-400">
          Created by: {ticket.user?.name || "Unknown"} ({ticket.user?.role})
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-zinc-300 line-clamp-3">
          {ticket.description}
        </div>
        <div className="flex gap-2 flex-wrap pt-2">
          <Badge variant="outline" className="border-green-500 text-green-500">
            {ticket.status}
          </Badge>
          {ticket.category && (
            <Badge variant="secondary" className="bg-green-700 text-white">
              {ticket.category.name}
            </Badge>
          )}
          <Badge variant="secondary" className="bg-zinc-800">
            {new Date(ticket.createdAt).toLocaleDateString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
