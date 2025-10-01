import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, LogOut, User, Home, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Navigation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive',
      });
    } else {
      navigate('/');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              JobQuestionGenerator
            </span>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <Button
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                variant={isActive('/profile') ? 'default' : 'ghost'}
                onClick={() => navigate('/profile')}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Login
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}