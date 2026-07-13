'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/shared/loading-button';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Logout failed');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium">{user.fullName}</p>
        <p className="text-xs text-muted-foreground">
          {user.email ?? user.username}
        </p>
      </div>
      <Badge variant="outline">{user.role}</Badge>
      <Link
        href="/profile"
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
      >
        Profile
      </Link>
      <LoadingButton
        variant="outline"
        size="sm"
        loading={isLoggingOut}
        loadingText="Logging out..."
        onClick={() => void handleLogout()}
      >
        Logout
      </LoadingButton>
    </div>
  );
}
