import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Input } from "../components/ui/input";
import { CreateEventDialog } from "../components/CreateEventDialog";
import { Skeleton } from "../components/ui/skeleton";
import { Calendar, MapPin, Search, Users } from "lucide-react";
import { format } from "date-fns";
import { toast } from "../components/ui/use-toast";
import { RegistrationModal } from "../components/RegistrationModal";

const EVENTS_PER_PAGE = 10;

export default function Events() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    status: "upcoming",
    capacity: "all",
    category: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isOrganizer } = useAuth();
  const location = useLocation();
  const [selectedEventForRegistration, setSelectedEventForRegistration] =
    useState(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  // Extract search query from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchTerm = params.get("search");
    if (searchTerm) {
      setSearchQuery(searchTerm);
    }
  }, [location.search]);

  useEffect(() => {
    fetchEvents(page === 1); // Refetch completely if page is 1
  }, [filters, page, searchQuery]); // Depend on filters, page, and searchQuery

  const fetchEvents = async (reset = false) => {
    if (reset) {
      setIsLoading(true);
      setPage(1);
      setHasMore(true);
    } else if (!hasMore) {
      return;
    }

    try {
      setError(null);
      const from = (page - (reset ? 1 : 0)) * EVENTS_PER_PAGE;
      const to = from + EVENTS_PER_PAGE - 1;

      let query = supabase
        .from("events")
        .select(
          `
          *,\
          organizer:users(id, email),\
          registrations:registrations(count)
        `,
          { count: "exact" }
        )
        .order("date", { ascending: true });

      // Apply filters
      if (filters.status === "upcoming") {
        query = query.gte("date", format(new Date(), "yyyy-MM-dd")); // Filter upcoming based on date only
      } else if (filters.status === "past") {
        query = query.lt("date", format(new Date(), "yyyy-MM-dd"));
      }

      // Capacity filter is tricky with count aggregation, might need RLS or a database function
      // For now, filtering based on whether capacity > 0 if 'available' is selected
      if (filters.capacity === "available") {
        query = query.gt("capacity", 0);
      }

      if (filters.category !== "all") {
        query = query.eq("category", filters.category);
      }

      // Apply search query
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`); // Case-insensitive search by name
      }

      // Apply pagination
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      if (reset) {
        setEvents(data || []);
      } else {
        setEvents((prevEvents) => [...prevEvents, ...(data || [])]);
      }

      setHasMore((data?.length || 0) === EVENTS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1 on filter change
    setHasMore(true); // Assume there might be more results with new filters
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // Memoize filtered events based on client-side search filtering
  const displayedEvents = useMemo(() => {
    // If search query is applied via URL, we filter in the Supabase query.
    // If search query is typed in the input directly, we might need client-side filtering
    // based on the fetched data if the Supabase search is not comprehensive enough.
    // For simplicity with the current Supabase query, the search is applied server-side.
    // The filtering logic below is left as a fallback/example if client-side filtering was needed.
    return events; // Assuming server-side filtering and search are sufficient
  }, [events]);

  const handleRegisterClick = (event) => {
    if (!user) {
      // Redirect to login if not authenticated
      // This might be handled by a ProtectedRoute, but adding a toast for clarity
      toast({
        title: "Sign In Required",
        description: "Please sign in to register for events.",
        variant: "destructive",
      });
      // Optionally navigate to login: navigate('/login');
      return;
    }
    setSelectedEventForRegistration(event);
    setIsRegistrationModalOpen(true);
  };

  const handleRegistrationSuccess = () => {
    // Refresh events after successful registration to update capacity count
    fetchEvents(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md bg-n-7 border-n-6 text-card-foreground">
          <CardHeader>
            <CardTitle className="text-n-1">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button
              onClick={() => fetchEvents(true)}
              className="mt-4 bg-color-1 hover:bg-color-1/90"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-n-8 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="h1 text-n-1 mb-2">Events</h1>
            <p className="body-1 text-n-2">
              Discover and join amazing events happening around you.
            </p>
          </div>
          {isOrganizer && (
            <CreateEventDialog onSuccess={() => fetchEvents(true)} />
          )}
        </div>

        {/* Filters and Search */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-n-3" />
            <Input
              type="text"
              placeholder="Search events by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-n-7 border-n-6 text-n-1"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="bg-n-7 border-n-6 text-n-1">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger className="bg-n-7 border-n-6 text-n-1">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="meetup">Meetup</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.capacity}
            onValueChange={(value) => handleFilterChange("capacity", value)}
          >
            <SelectTrigger className="bg-n-7 border-n-6 text-n-1">
              <SelectValue placeholder="Capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Capacities</SelectItem>
              <SelectItem value="available">Available Spots</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Grid */}
        {isLoading && displayedEvents.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: EVENTS_PER_PAGE }).map((_, i) => (
              <Card
                key={i}
                className="animate-pulse bg-n-7 border-n-6 text-card-foreground"
              >
                <CardHeader>
                  <Skeleton className="h-6 bg-n-6 rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 bg-n-6 rounded w-1/2 mb-2" />
                  <Skeleton className="h-4 bg-n-6 rounded w-full mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 bg-n-6 rounded w-full" />
                    <Skeleton className="h-4 bg-n-6 rounded w-full" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 bg-n-6 rounded w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-n-2">No events found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedEvents.map((event) => (
              <Card
                key={event.id}
                className="bg-n-7 rounded-lg overflow-hidden border border-n-6 text-card-foreground"
              >
                <div className="h-48 bg-n-6"></div>
                <CardHeader>
                  <CardTitle className="text-n-1">{event.name}</CardTitle>
                  <CardDescription className="text-n-3">
                    {event.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-n-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-n-3">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.location || "Online"}</span>
                    </div>
                    <div className="flex items-center text-n-3">
                      <Users className="w-4 h-4 mr-2" />
                      <span>
                        {event.registrations[0]?.count || 0} / {event.capacity}
                        registered
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-n-2 line-clamp-3">
                    {event.description}
                  </p>

                  {/* Progress Bar for Capacity */}
                  {event.capacity > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm text-n-2">
                        <span>Capacity</span>
                        <span>
                          {event.registrations[0]?.count || 0} /{" "}
                          {event.capacity}
                        </span>
                      </div>
                      <Progress
                        value={
                          event.capacity > 0
                            ? ((event.registrations[0]?.count || 0) /
                                event.capacity) *
                              100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Link to={`/events/${event.id}`} className="flex-grow">
                    <Button className="w-full bg-color-1 hover:bg-color-1/90">
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="default"
                    className="w-full bg-color-4 hover:bg-color-4/90"
                    onClick={() => handleRegisterClick(event)}
                    disabled={
                      !user ||
                      (event.capacity > 0 &&
                        (event.registrations[0]?.count || 0) >=
                          event.capacity) ||
                      new Date(event.date) < new Date()
                    }
                  >
                    {new Date(event.date) < new Date()
                      ? "Event Ended"
                      : event.capacity > 0 &&
                        (event.registrations[0]?.count || 0) >= event.capacity
                      ? "Full"
                      : "Register"}
                  </Button>
                  {/* Placeholder for Favorite Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-n-2 text-n-2 hover:bg-n-7 hover:text-n-1"
                  >
                    {/* Heart Icon */}
                    ❤️
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {hasMore && !isLoading && displayedEvents.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              className="border-n-2 text-n-2 hover:bg-n-7 hover:text-n-1"
              disabled={isLoading}
            >
              Load More
            </Button>
          </div>
        )}

        {isLoading && displayedEvents.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        event={selectedEventForRegistration}
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
}
