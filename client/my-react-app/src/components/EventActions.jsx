import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { updateEvent, deleteEvent } from "../lib/supabase";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const EventActions = ({ event, onUpdate }) => {
  const { user, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  if (!isOrganizer || user.id !== event.organizer_id) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await deleteEvent(event.id);
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      });
      navigate("/events");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (updatedData) => {
    setIsUpdating(true);
    try {
      const updatedEvent = await updateEvent(event.id, updatedData);
      onUpdate(updatedEvent);
      toast({
        title: "Event updated",
        description: "The event has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => navigate(`/events/${event.id}/edit`)}
        disabled={isUpdating}
      >
        Edit Event
      </Button>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" disabled={isUpdating}>
            Delete Event
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isUpdating}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventActions;
