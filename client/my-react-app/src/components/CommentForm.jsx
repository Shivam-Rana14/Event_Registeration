import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "./ui/form";
import { Textarea } from "./ui/textarea";

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

      console.log('Submitting comment:', {
        eventId,
        userId: user.id,
        content: data.content
      });
      
      const { error } = await supabase.from("event_comments").insert({
        event_id: eventId,
        user_id: user.id,
        content: data.content,
      });
      
      console.log('Comment submission result:', error ? 'error' : 'success');

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment posted successfully!",
      });

      form.reset();
      // Trigger refresh of comments
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
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
              <FormLabel className="text-n-1">Your Comment</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your comment..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Posting..." : "Post Comment"}
        </Button>
      </form>
    </Form>
  );
}
