import { Link, useLocation } from 'react-router-dom';
import { WalletButton } from './WalletButton';
import { Coins } from 'lucide-react';

export const Header = () => {
  const location = useLocation();

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

          <WalletButton />
        </div>
      </div>
    </header>
  );
};
