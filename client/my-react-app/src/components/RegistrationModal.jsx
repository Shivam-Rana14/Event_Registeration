import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  customAnswer: z.string().optional(),
});

export function RegistrationModal({ event, isOpen, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      customAnswer: "",
    },
  });

  const onSubmit = async (data) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Error",
        description: "Please sign in to register for events",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Check capacity before registration
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("remaining_capacity")
        .eq("id", event.id)
        .single();

      if (eventError) throw eventError;

      if (eventData.remaining_capacity <= 0) {
        toast({
          title: "Error",
          description: "Sorry, this event is full",
          variant: "destructive",
        });
        return;
      }

      // Create registration
      const { error: registrationError } = await supabase
        .from("registrations")
        .insert({
          event_id: event.id,
          user_id: user.id,
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          custom_answer: data.customAnswer,
          status: "pending",
        });

      if (registrationError) throw registrationError;

      // Update event capacity
      const { error: updateError } = await supabase
        .from("events")
        .update({
          remaining_capacity: eventData.remaining_capacity - 1,
        })
        .eq("id", event.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Registration submitted successfully!",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to register for event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register for {event?.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-n-1">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-n-1">Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {event?.custom_question && (
              <FormField
                control={form.control}
                name="customAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-n-1">
                      {event.custom_question}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your answer..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
