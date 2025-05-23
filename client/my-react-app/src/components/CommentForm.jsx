import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const formSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(280, "Comment cannot exceed 280 characters"),
});

export function CommentForm({ eventId, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to post comments",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("event_comments").insert({
        event_id: eventId,
        user_id: user.id,
        content: data.content,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment posted successfully!",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Write a comment..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between items-center">
                <FormMessage />
                <span className="text-sm text-n-4">
                  {field.value.length}/280
                </span>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Posting..." : "Post"}
        </Button>
      </form>
    </Form>
  );
}
