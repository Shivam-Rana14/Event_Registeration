import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { DatePicker } from "./ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  date: z.date().min(new Date(), "Date must be in the future"),
  category: z.enum(["workshop", "conference", "meetup"]),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must be less than 300 characters"),
  location: z.string().min(1, "Location is required"),
  capacity: z
    .number()
    .min(10, "Capacity must be at least 10")
    .max(1000, "Capacity must be less than 1000"),
  customQuestion: z
    .string()
    .max(100, "Question must be less than 100 characters")
    .optional(),
  isFeatured: z.boolean().default(false),
});

export function CreateEventDialog({ onSuccess }) {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user, isOrganizer } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(eventSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      date: undefined,
      category: undefined,
      description: "",
      location: "",
      capacity: 10,
      customQuestion: "",
      isFeatured: false,
    },
  });

  const watchedFields = watch();

  const isStep1Valid = () => {
    return (
      watchedFields.name &&
      watchedFields.date &&
      watchedFields.category &&
      watchedFields.description &&
      watchedFields.location &&
      !errors.name &&
      !errors.date &&
      !errors.category &&
      !errors.description &&
      !errors.location
    );
  };

  const onSubmit = async (data) => {
    if (!user || !isOrganizer) {
      toast({
        title: "Error",
        description: "You must be an organizer to create events",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, verify the user's organizer status
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("is_organizer")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;
      if (!userData.is_organizer) {
        throw new Error("You must be an organizer to create events");
      }

      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert([
          {
            name: data.name,
            date: data.date.toISOString(),
            category: data.category,
            description: data.description,
            location: data.location,
            total_capacity: data.capacity,
            remaining_capacity: data.capacity,
            is_featured: data.isFeatured,
            organizer_id: user.id,
          },
        ])
        .select()
        .single();

      if (eventError) throw eventError;

      if (data.customQuestion) {
        const { error: questionError } = await supabase
          .from("event_questions")
          .insert([
            {
              event_id: event.id,
              question: data.customQuestion,
            },
          ]);

        if (questionError) throw questionError;
      }

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      setOpen(false);
      setStep(1);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    }
  };

  if (!isOrganizer) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Event</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <label htmlFor="name" className="text-n-1">
                  Event Name
                </label>
                <Input
                  id="name"
                  {...register("name")}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-n-1">Date</label>
                <DatePicker
                  date={watchedFields.date}
                  setDate={(date) => {
                    setValue("date", date, { shouldValidate: true });
                    trigger("date");
                  }}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-n-1">Category</label>
                <Select
                  onValueChange={(value) => {
                    setValue("category", value, { shouldValidate: true });
                    trigger("category");
                  }}
                  value={watchedFields.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-n-1">
                  Location
                </label>
                <Input
                  id="location"
                  {...register("location")}
                  className={errors.location ? "border-destructive" : ""}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-n-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  {...register("description")}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!isStep1Valid()}
                className="w-full"
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="capacity" className="text-n-1">
                  Capacity
                </label>
                <Input
                  id="capacity"
                  type="number"
                  min="10"
                  max="1000"
                  {...register("capacity", { valueAsNumber: true })}
                  className={errors.capacity ? "border-destructive" : ""}
                />
                {errors.capacity && (
                  <p className="text-sm text-destructive">
                    {errors.capacity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="customQuestion" className="text-n-1">
                  Custom Question (Optional)
                </label>
                <Input
                  id="customQuestion"
                  {...register("customQuestion")}
                  className={errors.customQuestion ? "border-destructive" : ""}
                />
                {errors.customQuestion && (
                  <p className="text-sm text-destructive">
                    {errors.customQuestion.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 border rounded-lg p-4 bg-accent/20">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={watchedFields.isFeatured}
                    onCheckedChange={(checked) => setValue("isFeatured", checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="isFeatured"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Feature this event
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Featured events are displayed prominently on the homepage and may attract more attendees.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Create Event
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
