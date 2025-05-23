import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Skeleton } from "../components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { RegistrationModal } from "../components/RegistrationModal";
import { CommentForm } from "../components/CommentForm";
import { CommentList } from "../components/CommentList";
import { FavoriteButton } from "../components/FavoriteButton";
import { Calendar, MapPin, Users, Clock } from "lucide-react";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvent();
    fetchRegistrationCount();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          organizer:users!events_organizer_id_fkey(id, email, full_name),
          registrations(count)
        `
        )
        .eq("id", id);

      if (error) throw error;

      if (data && data.length > 0) {
        setEvent({
          ...data[0],
          registered_count: data[0].registrations[0]?.count || 0,
        });
      } else {
        setEvent(null);
        setError("Event not found.");
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      setError("Failed to load event details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegistrationCount = async () => {
    try {
      const { count, error } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", id);

      if (error) throw error;
      setRegistrationCount(count || 0);
    } catch (error) {
      console.error("Error fetching registration count:", error);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Open the registration modal
    setIsRegistrationModalOpen(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchEvent} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-[200px] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const remainingSpots = event.capacity - (event.registered_count || 0);
  const isEventFull = remainingSpots <= 0;
  const isEventPast = new Date(event.date) < new Date();

  return (
    <div className="min-h-screen bg-n-8 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-8 text-n-2 hover:text-n-1"
            onClick={() => navigate("/events")}
          >
            ← Back to Events
          </Button>

          {/* Event Header */}
          <div className="bg-n-7 rounded-lg overflow-hidden border border-n-6 mb-8">
            <div className="h-64 bg-n-6"></div>
            <div className="p-8">
              <h1 className="h1 text-n-1 mb-4">{event.name}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-n-3">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{format(new Date(event.date), "MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center text-n-3">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{format(new Date(event.date), "h:mm a")}</span>
                </div>
                <div className="flex items-center text-n-3">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{event.location || "Online"}</span>
                </div>
                <div className="flex items-center text-n-3">
                  <Users className="w-5 h-5 mr-2" />
                  <span>
                    {event.registered_count || 0} / {event.capacity} registered
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-n-7 rounded-lg border border-n-6 p-8 mb-8">
                <h2 className="h3 text-n-1 mb-4">About the Event</h2>
                <p className="body-1 text-n-2 mb-6">{event.description}</p>

                <h3 className="h4 text-n-1 mb-4">Organizer</h3>
                <div className="bg-n-6 rounded-lg p-4">
                  <p className="text-n-1 font-semibold">
                    {event.organizer?.full_name ||
                      event.organizer?.email ||
                      "N/A"}
                  </p>
                  {event.organizer?.email && <p>{event.organizer.email}</p>}
                </div>
              </div>
            </div>

            {/* Registration Card */}
            <div className="md:col-span-1">
              <div className="bg-n-7 rounded-lg border border-n-6 p-8 sticky top-8">
                <h3 className="h4 text-n-1 mb-4">Registration</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-n-2">
                    <span>Price</span>
                    <span className="text-n-1">
                      ${event.price > 0 ? `$${event.price.toFixed(2)}` : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between text-n-2">
                    <span>Available Spots</span>
                    <span className="text-n-1">
                      {event.capacity > 0
                        ? `${remainingSpots} / ${event.capacity}`
                        : "Unlimited"}
                    </span>
                  </div>
                </div>

                {event.capacity > 0 && (
                  <Progress
                    value={(event.registered_count / event.capacity) * 100}
                    className="h-2"
                  />
                )}

                <Button
                  className="w-full bg-color-1 hover:bg-color-1/90"
                  onClick={handleRegister}
                  disabled={isEventFull || isEventPast || !user}
                >
                  {isEventPast
                    ? "Event Ended"
                    : isEventFull
                    ? "Event Full"
                    : user
                    ? "Register Now"
                    : "Sign in to Register"}
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CommentForm eventId={event.id} onSuccess={() => {
                // Force refresh of comment list
                const commentList = document.querySelector('[data-testid="comment-list"]');
                if (commentList) {
                  commentList.dispatchEvent(new Event('refresh-comments'));
                }
              }} />
              <CommentList eventId={event.id} />
            </CardContent>
          </Card>

          <RegistrationModal
            event={event}
            isOpen={isRegistrationModalOpen}
            onClose={() => setIsRegistrationModalOpen(false)}
            onSuccess={fetchRegistrationCount}
          />
        </div>
      </div>
    </div>
  );
}
