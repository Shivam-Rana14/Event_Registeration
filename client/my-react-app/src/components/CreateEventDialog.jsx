import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "../hooks/use-toast";
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

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  date: z.date().min(new Date(), "Date must be in the future"),
  category: z.enum(["workshop", "conference", "meetup"]),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must be less than 300 characters"),
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

export function CreateEventDialog() {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(eventSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert([
          {
            name: data.name,
            date: data.date.toISOString(),
            category: data.category,
            description: data.description,
            total_capacity: data.capacity,
            remaining_capacity: data.capacity,
            is_featured: data.isFeatured,
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

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
                <label htmlFor="name">Event Name</label>
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
                <label>Date</label>
                <DatePicker
                  date={watch("date")}
                  setDate={(date) => setValue("date", date)}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label>Category</label>
                <Select
                  onValueChange={(value) => setValue("category", value)}
                  value={watch("category")}
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
                <label htmlFor="description">Description</label>
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
                disabled={!isValid}
                className="w-full"
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="capacity">Capacity</label>
                <Input
                  id="capacity"
                  type="number"
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
                <label htmlFor="customQuestion">
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  onCheckedChange={(checked) => setValue("isFeatured", checked)}
                />
                <label
                  htmlFor="isFeatured"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Feature this event
                </label>
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
