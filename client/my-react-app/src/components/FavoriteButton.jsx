import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function FavoriteButton({ eventId }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkFavoriteStatus();
  }, [eventId]);

  const checkFavoriteStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to favorite events",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Event removed from favorites",
        });
      } else {
        const { error } = await supabase.from("favorites").insert({
          event_id: eventId,
          user_id: user.id,
        });

        if (error) throw error;
        toast({
          title: "Success",
          description: "Event added to favorites",
        });
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorite status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      disabled={isLoading}
      className="relative"
    >
      <motion.div
        initial={false}
        animate={{ scale: isFavorite ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`h-5 w-5 ${
            isFavorite ? "fill-primary text-primary" : "text-n-4"
          }`}
        />
      </motion.div>
    </Button>
  );
}
