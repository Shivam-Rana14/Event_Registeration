import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRegistrations();
    }
  }, [isAuthenticated, user]);

  const fetchRegistrations = async () => {
    try {
      const { data: registrations } = await supabase
        .from("registrations")
        .select(
          `
          *,
          event:events(*)
        `
        )
        .eq("user_id", user.id);

      if (registrations) {
        setRegistrations(registrations);
        setEvents(registrations.map((reg) => reg.event));
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Please sign in to view your profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/login")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Account Type</p>
              <p className="mt-1">
                {user.is_organizer ? "Organizer" : "Attendee"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>My Event Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <p className="text-gray-500">
              You haven't registered for any events yet.
            </p>
          ) : (
            <div className="space-y-4">
              {registrations.map((registration) => (
                <Card key={registration.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-medium">{registration.event.name}</h3>
                    <p className="text-sm text-gray-500">
                      Date:{" "}
                      {new Date(registration.event.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {registration.status}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSignOut} variant="destructive">
        Sign Out
      </Button>
    </div>
  );
}
