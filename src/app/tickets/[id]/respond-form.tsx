"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const responseSchema = z.object({
  message: z.string().min(1, "Response is required"),
});

type Props = {
  ticketId: string;
};

export function RespondForm({ ticketId }: Props) {
  const form = useForm<z.infer<typeof responseSchema>>({
    resolver: zodResolver(responseSchema),
    defaultValues: { message: "" },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: z.infer<typeof responseSchema>) => {
    setLoading(true);
     try {
      const res = await fetch("/api/tickets/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId,
          message: values.message,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to respond");
      }

      toast.success("Response added successfully");
      form.reset();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
      <Textarea
        placeholder="Type your response here..."
        {...form.register("message")}
        disabled={loading}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Submit Response"}
      </Button>
    </form>
  );
}
