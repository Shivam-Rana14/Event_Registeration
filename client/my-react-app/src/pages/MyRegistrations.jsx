import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [filter, setFilter] = useState("upcoming");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [filter]);

  const fetchRegistrations = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("registrations")
      .select(
        `
        *,
        events (*)
      `
      )
      .eq("user_id", user.id);

    if (filter === "upcoming") {
      query = query.gte("events.date", new Date().toISOString());
    } else if (filter === "past") {
      query = query.lt("events.date", new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching registrations:", error);
      return;
    }

    setRegistrations(data);
    fetchRecommendedEvents(data);
  };

  const fetchRecommendedEvents = async (userRegistrations) => {
    if (!userRegistrations.length) return;

    // Get categories from user's registrations
    const categories = [
      ...new Set(userRegistrations.map((reg) => reg.events.category)),
    ];

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .in("category", categories)
      .neq(
        "id",
        userRegistrations.map((reg) => reg.event_id)
      )
      .gte("date", new Date().toISOString())
      .limit(3);

    if (error) {
      console.error("Error fetching recommended events:", error);
      return;
    }

    setRecommendedEvents(data);
  };

  const handleCancelRegistration = async (registrationId) => {
    setIsCancelling(true);
    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("id", registrationId);

    if (error) {
      console.error("Error cancelling registration:", error);
      return;
    }

    setIsCancelling(false);
    fetchRegistrations();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Registrations</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Events</CardTitle>
          <CardDescription>
            View and manage your event registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>
                    <Link
                      to={`/events/${registration.event_id}`}
                      className="hover:underline"
                    >
                      {registration.events.name}
                    </Link>
                  </TableCell>
                  <TableCell>{registration.events.category}</TableCell>
                  <TableCell>
                    {new Date(registration.events.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(registration.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Cancel
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Registration</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to cancel your registration
                            for {registration.events.name}?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsCancelling(false)}
                          >
                            No, Keep Registration
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleCancelRegistration(registration.id)
                            }
                            disabled={isCancelling}
                          >
                            {isCancelling
                              ? "Cancelling..."
                              : "Yes, Cancel Registration"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {recommendedEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Events</CardTitle>
            <CardDescription>Events you might be interested in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.name}</CardTitle>
                    <CardDescription>{event.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="mt-2">{event.description}</p>
                  </CardContent>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to={`/events/${event.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
