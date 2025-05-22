import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function Profile() {
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchRegistrations();
  }, []);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setUser({ ...user, ...profile });
    }
  };

  const fetchRegistrations = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: registrations } = await supabase
        .from("event_registrations")
        .select("*, events(*)")
        .eq("user_id", user.id);

      if (registrations) {
        setRegistrations(registrations);
        setEvents(registrations.map((reg) => reg.events));
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Please sign in to view your profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/login")}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-n-4">Email</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-n-4">Role</p>
            <p>{user.is_organizer ? "Event Organizer" : "Attendee"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <p className="text-n-4">
              You haven't registered for any events yet.
            </p>
          ) : (
            <div className="space-y-4">
              {registrations.map((registration) => (
                <Card key={registration.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">
                      {registration.events.name}
                    </h3>
                    <p className="text-sm text-n-4">
                      {new Date(registration.events.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-n-4 mt-2">
                      Status: {registration.status}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
