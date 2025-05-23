import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    capacity: "",
    price: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Add your event creation logic here
      console.log("Creating event:", formData);
      navigate("/events");
    } catch (error) {
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-n-8 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="h1 text-n-1 mb-4">Create New Event</h1>
            <p className="body-1 text-n-2">
              Fill out the form below to create your event.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-n-1">
                  Event Title
                </Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="bg-n-7 border-n-6 text-n-1"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-n-1">
                  Description
                </Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-n-7 border-n-6 text-n-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-n-1">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="bg-n-7 border-n-6 text-n-1"
                  />
                </div>

                <div>
                  <Label htmlFor="time" className="text-n-1">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="bg-n-7 border-n-6 text-n-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-n-1">
                  Location
                </Label>
                <Input
                  id="location"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="bg-n-7 border-n-6 text-n-1"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-n-1">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="bg-n-7 border-n-6 text-n-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity" className="text-n-1">
                    Capacity
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    className="bg-n-7 border-n-6 text-n-1"
                  />
                </div>

                <div>
                  <Label htmlFor="price" className="text-n-1">
                    Price ($)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="bg-n-7 border-n-6 text-n-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-color-1 hover:bg-color-1/90"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Event"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-n-2 text-n-2"
                onClick={() => navigate("/events")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
