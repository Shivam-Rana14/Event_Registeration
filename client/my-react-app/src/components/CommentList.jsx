import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea } from "./ui/scroll-area";

export function CommentList({ eventId }) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
    
    // Add event listener for refresh
    const commentList = document.querySelector('[data-testid="comment-list"]');
    if (commentList) {
      const handleRefresh = () => fetchComments();
      commentList.addEventListener('refresh-comments', handleRefresh);
      return () => commentList.removeEventListener('refresh-comments', handleRefresh);
    }
  }, [eventId]);

  const fetchComments = async () => {
    try {
      console.log('Fetching comments for event:', eventId);
      const { data, error } = await supabase
        .from("event_comments")
        .select('*')
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log('Fetched comments:', data);
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-n-4 text-center py-4">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4" data-testid="comment-list">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 rounded-lg border border-n-6 bg-n-8"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-medium">
                User {comment.user_id?.substring(0, 8)}
              </p>
              <p className="text-xs text-n-4">
                {format(new Date(comment.created_at), "MMM d, yyyy h:mm a")}
              </p>
            </div>
            <p className="text-n-2">{comment.content}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
