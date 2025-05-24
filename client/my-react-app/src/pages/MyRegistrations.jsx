import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"; // Uncommented for dialog
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"; // Uncomment if using Card for recommended events
// import { Skeleton } from "../components/ui/skeleton"; // Uncomment if adding skeletons
import { Calendar, MapPin, Users } from "lucide-react";

export default function MyRegistrations() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("upcoming");
  const [isCancelling, setIsCancelling] = useState(false); // State for cancellation loading
  const [showCancelDialog, setShowCancelDialog] = useState(false); // State to control dialog visibility
  const [registrationToCancel, setRegistrationToCancel] = useState(null); // State to store registration ID for cancellation
  // const [recommendedEvents, setRecommendedEvents] = useState([]); // State for recommended events

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    } else {
      setLoading(false);
      setRegistrations([]);
    }
  }, [user, filter]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("registrations")
        .select(
          `
          id,
          created_at,
          event:events(id, name, date, location, total_capacity, remaining_capacity, registrations(count))
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (filter === "upcoming") {
        query = query.gte("event.date", new Date().toISOString());
      } else if (filter === "past") {
        query = query.lt("event.date", new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setRegistrations(data || []);

      // TODO: Implement fetching recommended events
      // For now, let's keep it commented out until the logic is ready.
      // fetchRecommendedEvents(data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      setError("Failed to load your registrations.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!registrationToCancel) return; // Ensure there's a registration to cancel

    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("id", registrationToCancel);

      if (error) throw error;

      // Refetch registrations after successful cancellation
      fetchRegistrations();
      // Close the dialog
      setShowCancelDialog(false);
      setRegistrationToCancel(null); // Clear the ID
    } catch (error) {
      console.error("Error cancelling registration:", error);
      setError("Failed to cancel registration. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Placeholder for fetching recommended events
  // const fetchRecommendedEvents = async (userRegistrations) => {
  //   // Example: Fetch events that are not in userRegistrations and match some criteria
  //   // This will likely involve more complex Supabase queries or a backend function
  //   try {
  //     const registeredEventIds = userRegistrations.map(reg => reg.event.id);
  //     const { data, error } = await supabase
  //       .from('events')
  //       .select('*')
  //       .not('id', 'in', `(${registeredEventIds.join(',')})`) // Exclude already registered events
  //       .limit(3); // Limit to a few recommendations

  //     if (error) throw error;
  //     setRecommendedEvents(data || []);
  //   } catch (error) {
  //     console.error("Error fetching recommended events:", error);
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-n-8 py-12 text-n-1 text-center">
        Loading registrations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-n-8 py-12 container mx-auto px-4 max-w-4xl text-destructive text-center">
        <div className="rounded-md bg-destructive/15 p-4">{error}</div>
        <Button
          onClick={fetchRegistrations}
          className="mt-4 bg-color-1 hover:bg-color-1/90"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-n-8 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="h1 text-n-1 mb-2">My Registrations</h1>
              <p className="body-1 text-n-2">
                View and manage your event registrations.
              </p>
            </div>
            {/* Filter Select */}
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px] bg-n-7 border-n-6 text-n-1">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {registrations.length === 0 ? (
            <div className="bg-n-7 rounded-lg border border-n-6 p-8 text-center">
              <p className="text-n-2 mb-4">
                {filter === "upcoming"
                  ? "You have no upcoming registrations."
                  : filter === "past"
                  ? "You have no past registrations."
                  : "You haven't registered for any events yet."}
              </p>
              <Link to="/events">
                <Button className="bg-color-1 hover:bg-color-1/90">
                  Browse Events
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {registrations.map((registration) => (
                <div
                  key={registration.id}
                  className="bg-n-7 rounded-lg border border-n-6 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <Link
                        to={`/events/${registration.event?.id}`}
                        className="text-n-1 hover:underline"
                      >
                        <h3 className="h4 mb-2 md:mb-0">
                          {registration.event?.name ||
                            "Event Details Not Available"}
                        </h3>
                      </Link>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          registration.event?.date &&
                          new Date(registration.event.date) >= new Date()
                            ? "bg-color-4/20 text-color-4"
                            : "bg-color-2/20 text-color-2"
                        }`}
                      >
                        {registration.event?.date &&
                        new Date(registration.event.date) >= new Date()
                          ? "Upcoming"
                          : "Past"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-n-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {registration.event?.date
                            ? new Date(
                                registration.event.date
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{registration.event?.location || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>
                          Attendees:{" "}
                          {registration.event?.registrations[0]?.count || 0} /{" "}
                          {registration.event?.total_capacity || "Unlimited"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span>Available Spots: </span>
                        <span className="ml-2">
                          {registration.event?.total_capacity > 0
                            ? `${
                                (registration.event?.total_capacity || 0) -
                                (registration.event?.registrations[0]?.count ||
                                  0)
                              } / ${registration.event?.total_capacity}`
                            : "Unlimited"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span>Registered on: </span>
                        <span className="ml-2">
                          {registration.created_at
                            ? new Date(
                                registration.created_at
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Link to={`/events/${registration.event?.id}`}>
                        <Button
                          variant="outline"
                          className="border-n-2 text-n-2 hover:bg-n-7 hover:text-n-1"
                        >
                          View Event
                        </Button>
                      </Link>
                      {registration.event?.date &&
                        new Date(registration.event.date) >= new Date() && (
                          <Dialog
                            open={showCancelDialog}
                            onOpenChange={setShowCancelDialog}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  setRegistrationToCancel(registration.id)
                                } // Set the ID here
                                disabled={isCancelling}
                              >
                                Cancel Registration
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-n-7 text-n-1 border-n-6">
                              <DialogHeader>
                                <DialogTitle className="text-n-1">
                                  Confirm Cancellation
                                </DialogTitle>
                                <DialogDescription className="text-n-3">
                                  Are you sure you want to cancel your
                                  registration for "
                                  {registration.event?.name || "this event"}
                                  "? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowCancelDialog(false)}
                                  disabled={isCancelling}
                                  className="border-n-2 text-n-2 hover:bg-n-7 hover:text-n-1"
                                >
                                  Keep Registration
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleCancelRegistration}
                                  disabled={isCancelling}
                                >
                                  {isCancelling
                                    ? "Cancelling..."
                                    : "Yes, Cancel"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommended Events Section - TODO */}
          {/*
           {recommendedEvents.length > 0 && (
            <div className="mt-12">
              <h2 className="h2 text-n-1 mb-8">Recommended Events</h2>
               {/* Display recommended events here, similar to the Home page featured section
               {/* You would map over recommendedEvents here and display them, likely using a Card component.
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {recommendedEvents.map(event => (
                   <Card key={event.id} className="bg-n-7 border-n-6">
                     <CardHeader>
                       <CardTitle>{event.name}</CardTitle>
                       <CardDescription>{event.location}</CardDescription>
                     </CardHeader>
                     <CardContent>
                       <p className="text-sm text-n-3">{new Date(event.date).toLocaleDateString()}</p>
                       <Link to={`/events/${event.id}`}>
                         <Button className="mt-4 bg-color-1 hover:bg-color-1/90">View Details</Button>
                       </Link>
                     </CardContent>
                   </Card>
                 ))}
               </div>
            </div>
           )}
           */}
        </div>
      </div>
    </div>
  );
}
