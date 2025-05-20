
import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Target, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

// Component: navigation bar for site-wide navigation
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="bg-finance-dark border-b border-finance-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-finance-text text-lg font-bold">
          FinTrack
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-finance-text hover:text-finance-blue">
            Home
          </Link>
          <Link
            to="/expenses"
            className="text-finance-text hover:text-finance-blue"
          >
            Expenses
          </Link>
          <Link
            to="/budgets"
            className="text-finance-text hover:text-finance-blue"
          >
            Budgets
          </Link>
          <Link
            to="/goals"
            className="text-finance-text hover:text-finance-blue"
          >
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-1" />
              Goals
            </div>
          </Link>
          <Link
            to="/community"
            className="text-finance-text hover:text-finance-blue"
          >
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Community
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              {user ? (
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign out
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/auth">Sign in</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/expenses">Expenses</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/budgets">Budgets</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/goals">Goals</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/community">Community</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              {user ? (
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign out
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/auth">Sign in</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
