import { AppFooter } from '@/components/layouts/app-footer';
import { PublicHeader } from '@/components/layouts/public-header';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      <PublicHeader />
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
      <AppFooter />
    </div>
  );
}
