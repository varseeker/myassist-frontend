import { AppFooter } from '@/components/layouts/app-footer';
import { LandingHeader } from '@/components/layouts/landing-header';
import { ScrollToTop } from '@/components/layouts/scroll-to-top';
import { LandingPageSections } from '@/features/homepage/components/landing-page-sections';

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <LandingHeader />
      <ScrollToTop />
      <main className="flex-1">
        <LandingPageSections />
      </main>
      <AppFooter variant="full" />
    </div>
  );
}
