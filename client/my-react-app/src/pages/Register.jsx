import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { UserPlus } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    is_organizer: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { user, error } = await signUp(
        formData.email,
        formData.password,
        formData.full_name,
        formData.is_organizer
      );
      if (error) throw error;
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      setError("Failed to create an account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-n-8 to-n-9 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-n-7/90 backdrop-blur-sm border-n-6 shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-n-1">
              Create your account
            </h2>
            <p className="text-sm text-n-3">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-primary hover:text-primary/90 transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-destructive/15 border border-destructive/30 p-4 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label 
                    htmlFor="full_name" 
                    className="text-sm font-medium text-n-2"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="bg-n-6/50 border-n-5/50 text-n-1 placeholder:text-n-4"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor="email" 
                    className="text-sm font-medium text-n-2"
                  >
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="bg-n-6/50 border-n-5/50 text-n-1 placeholder:text-n-4"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor="password" 
                    className="text-sm font-medium text-n-2"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="Choose a strong password"
                    className="bg-n-6/50 border-n-5/50 text-n-1 placeholder:text-n-4"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor="confirmPassword" 
                    className="text-sm font-medium text-n-2"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder="Confirm your password"
                    className="bg-n-6/50 border-n-5/50 text-n-1 placeholder:text-n-4"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <Checkbox
                    id="is_organizer"
                    checked={formData.is_organizer}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_organizer: checked })
                    }
                    className="border-n-5/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    htmlFor="is_organizer"
                    className="text-sm font-medium text-n-2 leading-tight"
                  >
                    I want to create events (Organizer Account)
                  </Label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 transition-all duration-200 shadow-lg shadow-primary/25 mt-8"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-n-1 border-t-transparent"></span>
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
