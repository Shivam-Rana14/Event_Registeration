import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { LogIn } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user, error } = await signIn(formData.email, formData.password);
      if (error) throw error;
      navigate("/");
    } catch (error) {
      setError("Failed to sign in. Please check your credentials.");
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
              <LogIn className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-n-1">
              Welcome back
            </h2>
            <p className="text-sm text-n-3">
              New to our platform?{" "}
              <Link 
                to="/register" 
                className="text-primary hover:text-primary/90 transition-colors font-medium"
              >
                Create an account
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
                    placeholder="Enter your password"
                    className="bg-n-6/50 border-n-5/50 text-n-1 placeholder:text-n-4"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 transition-all duration-200 shadow-lg shadow-primary/25"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-n-1 border-t-transparent"></span>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
