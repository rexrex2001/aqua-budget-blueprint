
import { useState } from "react";
import { Link } from "react-router-dom";
import { User, FileText } from "lucide-react";

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
    <div className="bg-blue-600 border-b border-blue-500">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-white text-lg font-bold">
          FinTrack
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-white hover:text-blue-200">
            Dashboard
          </Link>
          <Link
            to="/expenses"
            className="text-white hover:text-blue-200"
          >
            Expenses
          </Link>
          <Link
            to="/budgets"
            className="text-white hover:text-blue-200"
          >
            Budgets
          </Link>
          <Link
            to="/reports"
            className="text-white hover:text-blue-200"
          >
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Reports
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white">
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
              <Button variant="outline" size="icon" className="bg-white">
                <User className="h-4 w-4" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/expenses">Expenses</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/budgets">Budgets</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/reports">Reports</Link>
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
