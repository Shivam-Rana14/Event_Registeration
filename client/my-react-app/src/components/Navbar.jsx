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
            <Link to="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
              EventHub
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="space-x-6">
                <NavigationMenuItem>
                  <Link to="/events" legacyBehavior passHref>
                    <NavigationMenuLink className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Events
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                {user && (
                  <NavigationMenuItem>
                    <Link to="/my-registrations" legacyBehavior passHref>
                      <NavigationMenuLink className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                        My Registrations
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )}
                
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-6">
            {user ? (
              <Button variant="outline" onClick={signOut} className="px-6">
                Sign Out
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="outline" className="px-6">Sign In</Button>
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
                    className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-accent"
                  >
                    Events
                  </Link>
                  {user && (
                    <Link
                      to="/my-registrations"
                      className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-accent"
                    >
                      My Registrations
                    </Link>
                  )}
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
