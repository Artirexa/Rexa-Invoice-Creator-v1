
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { FileText, Home, LayoutDashboard, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/App';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const result = await logout();
      
      if (result.success) {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account",
        });
      } else {
        toast({
          title: "Logout failed",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  return (
    <header className="border-b border-gray-200 bg-white/70 backdrop-blur-lg fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
          <FileText size={24} />
          <span className="font-display">Artirexa</span>
        </Link>
        
        <nav>
          <ul className="flex items-center space-x-2">
            <li>
              <Button variant="ghost" asChild>
                <Link to="/" className="flex items-center gap-1">
                  <Home size={18} />
                  <span className="hidden sm:inline">Home</span>
                </Link>
              </Button>
            </li>
            {isAuthenticated && (
              <>
                <li>
                  <Button variant="ghost" asChild>
                    <Link to="/dashboard" className="flex items-center gap-1">
                      <LayoutDashboard size={18} />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" asChild>
                    <Link to="/editor" className="flex items-center gap-1">
                      <FileText size={18} />
                      <span className="hidden sm:inline">Create Invoice</span>
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button variant="default" asChild>
                    <Link to="/invoices">View Invoices</Link>
                  </Button>
                </li>
                <li>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                          <AvatarFallback className="text-xs">
                            {user?.email ? getUserInitials(user.email) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.user_metadata?.full_name || 'User'}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/editor" className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Create Invoice</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/invoices" className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>View Invoices</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="text-red-600 focus:text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              </>
            )}
            {!isAuthenticated && (
              <li>
                <Button variant="default" asChild>
                  <Link to="/login">Login</Link>
                </Button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
