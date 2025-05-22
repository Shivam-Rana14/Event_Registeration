import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { createClient } from "@supabase/supabase-js";
import { Heart } from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    fetchComments();
    checkFavoriteStatus();
  }, [id]);

  const fetchEventDetails = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching event details:", error);
      return;
    }

    setEvent(data);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("event_comments")
      .select("*")
      .eq("event_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return;
    }

    setComments(data);
  };

  const checkFavoriteStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking favorite status:", error);
      return;
    }

    setIsFavorite(!!data);
  };

  const handleCommentSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("event_comments").insert([
      {
        event_id: id,
        user_id: user.id,
        content: newComment,
      },
    ]);

    if (error) {
      console.error("Error submitting comment:", error);
      return;
    }

    setNewComment("");
    fetchComments();
  };

  const handleRegister = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setIsRegistering(true);
    const { error } = await supabase.from("registrations").insert([
      {
        event_id: id,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error("Error registering for event:", error);
      return;
    }

    setIsRegistering(false);
    fetchEventDetails();
  };

  const toggleFavorite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("event_id", id)
        .eq("user_id", user.id);
    } else {
      const { error } = await supabase.from("favorites").insert([
        {
          event_id: id,
          user_id: user.id,
        },
      ]);
    }

    setIsFavorite(!isFavorite);
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <p className="text-muted-foreground">{event.category}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleFavorite}>
          <Heart
            className={`h-6 w-6 ${
              isFavorite ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            {new Date(event.date).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p>{event.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Capacity</h3>
            <Progress
              value={(event.remaining_capacity / event.total_capacity) * 100}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {event.remaining_capacity} spots remaining
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Location</h3>
            <iframe
              src={`https://www.google.com/maps/embed?pb=${event.map_embed_url}`}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4">
                <p className="text-sm text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
                <p>{comment.content}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={280}
            />
            <Button onClick={handleCommentSubmit}>Post Comment</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">Register for Event</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register for {event.name}</DialogTitle>
            <DialogDescription>
              Please confirm your registration for this event.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegistering(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegister} disabled={isRegistering}>
              {isRegistering ? "Registering..." : "Confirm Registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
