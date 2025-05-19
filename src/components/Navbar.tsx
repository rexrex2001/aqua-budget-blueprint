
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Navbar = () => {
  const { userData } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { title: "Dashboard", path: "/" },
    { title: "Expenses", path: "/expenses" },
    { title: "Budgets", path: "/budgets" },
    { title: "Profile", path: "/profile" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-finance-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-finance-blue-dark font-bold text-xl">FinTrack</span>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? "bg-finance-blue text-white"
                        : "text-finance-text hover:bg-finance-gray-light"
                    }`
                  }
                >
                  {link.title}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center">
            <div className="flex-shrink-0">
              <NavLink to="/profile">
                <div className="flex items-center">
                  <div className="bg-finance-blue text-white rounded-full h-8 w-8 flex items-center justify-center">
                    {userData.name.charAt(0)}
                  </div>
                  <span className="ml-2 text-sm font-medium text-finance-text">
                    {userData.name}
                  </span>
                </div>
              </NavLink>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? "bg-finance-blue text-white"
                      : "text-finance-text hover:bg-finance-gray-light"
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.title}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
