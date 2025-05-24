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
    <div className="min-h-screen bg-gradient-to-b from-n-8 to-n-9 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-8 text-n-2 hover:text-n-1 transition-colors duration-200 flex items-center gap-2"
            onClick={() => navigate("/events")}
          >
            <span className="text-lg">←</span>
            <span>Back to Events</span>
          </Button>

          {/* Event Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-n-7/90 backdrop-blur-sm rounded-xl overflow-hidden border border-n-6 mb-8 shadow-lg"
          >
            <div className="h-64 bg-n-6 relative">
              {event.image_url && (
                <img 
                  src={event.image_url} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start gap-4 mb-6">
                <h1 className="text-3xl font-bold text-n-1 tracking-tight">{event.name}</h1>
                <FavoriteButton eventId={event.id} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center text-n-3 group hover:text-n-1 transition-colors duration-200">
                  <Calendar className="w-5 h-5 mr-3 text-primary" />
                  <span>{format(new Date(event.date), "MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center text-n-3 group hover:text-n-1 transition-colors duration-200">
                  <Clock className="w-5 h-5 mr-3 text-primary" />
                  <span>{format(new Date(event.date), "h:mm a")}</span>
                </div>
                <div className="flex items-center text-n-3 group hover:text-n-1 transition-colors duration-200">
                  <MapPin className="w-5 h-5 mr-3 text-primary" />
                  <span>{event.location || "Online"}</span>
                </div>
                <div className="flex items-center text-n-3 group hover:text-n-1 transition-colors duration-200">
                  <Users className="w-5 h-5 mr-3 text-primary" />
                  <span>
                    {event.registered_count || 0} / {event.capacity} registered
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Event Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-n-7/90 backdrop-blur-sm rounded-xl border border-n-6 p-6 sm:p-8 mb-8 shadow-lg"
              >
                <h2 className="text-2xl font-semibold text-n-1 mb-6">About the Event</h2>
                <p className="text-n-2 leading-relaxed mb-8 whitespace-pre-wrap">{event.description}</p>

                <h3 className="text-xl font-semibold text-n-1 mb-4">Organizer</h3>
                <div className="bg-n-6/50 backdrop-blur-sm rounded-lg p-4 border border-n-5/10">
                  <p className="text-n-1 font-medium mb-1">
                    {event.organizer?.full_name ||
                      event.organizer?.email ||
                      "N/A"}
                  </p>
                  {event.organizer?.email && (
                    <p className="text-n-3 text-sm">{event.organizer.email}</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Registration Card */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-n-7/90 backdrop-blur-sm rounded-xl border border-n-6 p-6 sm:p-8 sticky top-8 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-n-1 mb-6">Registration Details</h3>
                <div className="space-y-6 mb-8">
                  <div className="flex justify-between items-center text-n-2">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 text-primary">💰</span>
                      Price
                    </span>
                    <span className="text-n-1 font-medium">
                      {event.price > 0 ? `$${event.price.toFixed(2)}` : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-n-2">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 text-primary">🎟️</span>
                      Available Spots
                    </span>
                    <span className="text-n-1 font-medium">
                      {event.capacity > 0
                        ? `${remainingSpots} / ${event.capacity}`
                        : "Unlimited"}
                    </span>
                  </div>
                </div>

                {event.capacity > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-n-3 mb-2">
                      <span>Registration Progress</span>
                      <span>{Math.round((event.registered_count / event.capacity) * 100)}%</span>
                    </div>
                    <Progress
                      value={(event.registered_count / event.capacity) * 100}
                      className="h-2"
                    />
                  </div>
                )}

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 transition-all duration-200 shadow-lg shadow-primary/25"
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
                {!user && (
                  <p className="text-n-3 text-sm text-center mt-4">
                    Please sign in to register for this event
                  </p>
                )}
              </motion.div>
            </div>
          </div>

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <Card className="bg-n-7/90 backdrop-blur-sm border-n-6 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold text-n-1">Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <CommentForm 
                  eventId={event.id} 
                  onSuccess={() => {
                    // Force refresh of comment list
                    const commentList = document.querySelector('[data-testid="comment-list"]');
                    if (commentList) {
                      commentList.dispatchEvent(new Event('refresh-comments'));
                    }
                  }} 
                />
                <div className="mt-6">
                  <CommentList eventId={event.id} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

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
