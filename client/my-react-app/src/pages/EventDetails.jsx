import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { motion } from "framer-motion";
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

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);

  useEffect(() => {
    fetchEvent();
    fetchRegistrationCount();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
      navigate("/events");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegistrationCount = async () => {
    try {
      const { count, error } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", id);

      if (error) throw error;
      setRegistrationCount(count || 0);
    } catch (error) {
      console.error("Error fetching registration count:", error);
    }
  };

  const isEventFull = event && registrationCount >= event.capacity;
  const isEventPast = event && new Date(event.date) < new Date();

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
          <p className="text-n-4">
            {format(new Date(event.date), "MMMM d, yyyy h:mm a")}
          </p>
        </div>
        <FavoriteButton eventId={event.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-n-2">{event.description}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Location</h3>
            <p className="text-n-2">{event.location}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Category</h3>
            <p className="text-n-2">{event.category}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Capacity</h3>
            <div className="space-y-2">
              <Progress
                value={(registrationCount / event.capacity) * 100}
                className="h-2"
              />
              <p className="text-sm text-n-4">
                {registrationCount} / {event.capacity} registered
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    onClick={() => setIsRegistrationModalOpen(true)}
                    disabled={isEventFull || isEventPast}
                  >
                    {isEventFull
                      ? "Event Full"
                      : isEventPast
                      ? "Event Ended"
                      : "Register Now"}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {isEventFull
                  ? "This event has reached its capacity"
                  : isEventPast
                  ? "This event has already ended"
                  : "Click to register for this event"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CommentForm eventId={event.id} />
          <CommentList eventId={event.id} />
        </CardContent>
      </Card>

      <RegistrationModal
        event={event}
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onSuccess={fetchRegistrationCount}
      />
    </motion.div>
  );
}
