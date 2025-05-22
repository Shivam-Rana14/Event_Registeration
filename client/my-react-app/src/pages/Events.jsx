import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { createClient } from "@supabase/supabase-js";
import { Input } from "../components/ui/input";
import { CreateEventDialog } from "../components/CreateEventDialog";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Events() {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    status: "upcoming",
    capacity: "all",
    category: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchUser();
  }, [filters, page]);

  const fetchEvents = async () => {
    let query = supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    // Apply filters
    if (filters.status === "upcoming") {
      query = query.gte("date", new Date().toISOString());
    }
    if (filters.capacity === "available") {
      query = query.gt("remaining_capacity", 0);
    }
    if (filters.category !== "all") {
      query = query.eq("category", filters.category);
    }

    // Apply pagination
    const from = (page - 1) * 10;
    const to = from + 9;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching events:", error);
      return;
    }

    setEvents(data);
    setHasMore(data.length === 10);
  };

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_organizer")
        .eq("id", user.id)
        .single();
      setUser({ ...user, ...profile });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events</h1>
        {user?.is_organizer && <CreateEventDialog />}
        <div className="flex gap-4">
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.capacity}
            onValueChange={(value) => handleFilterChange("capacity", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="available">Available Spots</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="seminar">Seminar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          type="search"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
              <CardDescription>{event.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {new Date(event.date).toLocaleDateString()}
              </p>
              <div className="mt-4">
                <p className="text-sm mb-2">Capacity</p>
                <Progress
                  value={
                    (event.remaining_capacity / event.total_capacity) * 100
                  }
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {event.remaining_capacity} spots remaining
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to={`/events/${event.id}`}>View Details</Link>
              </Button>
              <Button variant="outline" className="flex-1">
                Register
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={() => setPage((prev) => prev + 1)}>Load More</Button>
        </div>
      )}
    </div>
  );
}
