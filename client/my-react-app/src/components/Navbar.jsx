import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-foreground">
              EventHub
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/events" legacyBehavior passHref>
                    <NavigationMenuLink className="text-foreground hover:text-primary">
                      Events
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                {user && (
                  <NavigationMenuItem>
                    <Link to="/my-registrations" legacyBehavior passHref>
                      <NavigationMenuLink className="text-foreground hover:text-primary">
                        My Registrations
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )}
                <NavigationMenuItem>
                  <Link to="/about" legacyBehavior passHref>
                    <NavigationMenuLink className="text-foreground hover:text-primary">
                      About
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/contact" legacyBehavior passHref>
                    <NavigationMenuLink className="text-foreground hover:text-primary">
                      Contact
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* {user?.is_organizer && (
              <Link to="/events/create">
                <Button variant="default" className="hidden md:block">
                  Create Event
                </Button>
              </Link>
            )} */}
            {user ? (
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  <Link
                    to="/events"
                    className="text-foreground hover:text-primary"
                  >
                    Events
                  </Link>
                  {user && (
                    <Link
                      to="/my-registrations"
                      className="text-foreground hover:text-primary"
                    >
                      My Registrations
                    </Link>
                  )}
                  <Link
                    to="/about"
                    className="text-foreground hover:text-primary"
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    className="text-foreground hover:text-primary"
                  >
                    Contact
                  </Link>
                  {/* {user?.is_organizer && (
                    <Link to="/events/create">
                      <Button variant="default" className="w-full">
                        Create Event
                      </Button>
                    </Link>
                  )} */}
                  {user ? (
                    <Button
                      variant="outline"
                      onClick={signOut}
                      className="w-full"
                    >
                      Sign Out
                    </Button>
                  ) : (
                    <Link to="/login">
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
