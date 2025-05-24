import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Calendar, MapPin, Users, Search } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          registrations:registrations(count)
        `
        )
        .eq("is_featured", true)
        .limit(3);

      if (error) throw error;
      setFeaturedEvents(data || []);
    } catch (error) {
      console.error("Error fetching featured events:", error);
      setError("Failed to load featured events.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/events?search=${encodeURIComponent(
        searchQuery.trim()
      )}`;
    }
  };

  return (
    <div className="min-h-screen bg-n-8 py-12">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <h1 className="h1 text-n-1 mb-6">
              Discover and Join Amazing Events
            </h1>
            <p className="body-1 text-n-2 mb-8 max-w-2xl">
              Find the perfect events to attend, connect with like-minded
              people, and create unforgettable memories.
            </p>
            <div className="flex items-center justify-center gap-x-6">
              <div className="relative w-full max-w-md">
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="pl-10 bg-n-7 border-n-6 text-n-1"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-n-3" />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-color-1 hover:bg-color-1/90"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-n-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="h2 text-n-1 text-center md:text-left">
              Featured Events
            </h2>
            <Link to="/events">
              <Button
                variant="outline"
                className="border-n-2 text-n-2 bg-black hover:bg-n-7 hover:text-n-1"
              >
                View All Events
              </Button>
            </Link>
          </div>

          {error && (
            <div className="text-center text-destructive mb-8">{error}</div>
          )}

          {loading ? (
            // Loading skeletons
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
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
          ) : featuredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-n-2">No featured events found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="bg-n-7 rounded-lg overflow-hidden border border-n-6 text-card-foreground"
                >
                  <div className="h-48 bg-n-6"></div>{" "}
                  {/* Placeholder for image */}
                  <CardHeader>
                    <CardTitle className="text-n-1">{event.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-n-3">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-n-3">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location || "Online"}</span>{" "}
                        {/* Assuming location can be null/online */}
                      </div>
                      <div className="flex items-center text-n-3">
                        <Users className="w-4 h-4 mr-2" />
                        <span>
                          {event.registrations[0]?.count || 0}/{event.capacity}{" "}
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
                            {event.registrations[0]?.count || 0}/
                            {event.capacity}
                          </span>
                        </div>
                        <Progress
                          value={
                            ((event.registrations[0]?.count || 0) /
                              event.capacity) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link to={`/events/${event.id}`} className="w-full">
                      <Button className="w-full bg-color-1 hover:bg-color-1/90">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
