import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { WalletButton } from './WalletButton';
import { Coins, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      } else {
        setUserEmail(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border/50 backdrop-blur-xl fixed top-0 w-full z-50 glass-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <span className="text-xl sm:text-2xl font-bold gradient-text">YourCoin</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm lg:text-base">
            <Link
              to="/"
              className={`transition-colors ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Home
            </Link>
            <Link
              to="/mint"
              className={`transition-colors ${
                isActive('/mint') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mint
            </Link>
            <Link
              to="/swap"
              className={`transition-colors ${
                isActive('/swap') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Swap
            </Link>
            <Link
              to="/mining"
              className={`transition-colors ${
                isActive('/mining') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mining
            </Link>
            <Link
              to="/treasury"
              className={`transition-colors ${
                isActive('/treasury') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Treasury
            </Link>
            <Link
              to="/admin"
              className={`transition-colors ${
                isActive('/admin') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Admin
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {session && userEmail ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    {userEmail}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium text-foreground/80">
                    {userEmail}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
};
