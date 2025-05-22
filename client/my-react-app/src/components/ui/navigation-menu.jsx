import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import { Button } from "./button";
import { Menu } from "lucide-react";

export function NavigationMenu() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              EventHub
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link
              to="/events"
              className="text-sm font-medium hover:text-primary"
            >
              Events
            </Link>
            <Link
              to="/my-registrations"
              className="text-sm font-medium hover:text-primary"
            >
              My Registrations
            </Link>
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                <Link to="/" className="text-sm font-medium hover:text-primary">
                  Home
                </Link>
                <Link
                  to="/events"
                  className="text-sm font-medium hover:text-primary"
                >
                  Events
                </Link>
                <Link
                  to="/my-registrations"
                  className="text-sm font-medium hover:text-primary"
                >
                  My Registrations
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
