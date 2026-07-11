import {
  ArrowRight,
  BarChart3,
  Bell,
  FolderKanban,
  Layers,
  MessageSquare,
  Shield,
  Ticket,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { AppFooter } from '@/components/layouts/app-footer';
import { LandingHeader } from '@/components/layouts/landing-header';
import { LandingHero } from '@/components/layouts/landing-hero';
import { ScrollToTop } from '@/components/layouts/scroll-to-top';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: FolderKanban,
    title: 'Project Management',
    description:
      'Organize work by active projects. Each project maintains its own tickets, members, and sprint backlog.',
  },
  {
    icon: Layers,
    title: 'Sprint Planning',
    description:
      'Break projects into sprints. Every ticket is linked to a project and an active sprint for clear delivery cycles.',
  },
  {
    icon: Ticket,
    title: 'Ticket Management',
    description:
      'Submit bug reports, issues, enhancements, and support requests with priority, type, and full traceability.',
  },
  {
    icon: Users,
    title: 'Project-based Teams',
    description:
      'Users belong to one project. QA and Developers can collaborate across multiple projects simultaneously.',
  },
  {
    icon: Workflow,
    title: 'Structured Workflow',
    description:
      'Tickets flow through QA review, assignment, in-progress work, and resolution with complete audit history.',
  },
  {
    icon: MessageSquare,
    title: 'Team Collaboration',
    description:
      'Discuss tickets with comments and @mentions. Attach files and receive real-time notifications on every update.',
  },
  {
    icon: Bell,
    title: 'Real-time Notifications',
    description:
      'Instant alerts when tickets are assigned, updated, commented on, or when you are mentioned.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Analytics',
    description:
      'Monitor ticket volume, priorities, and trends scoped to your projects and role.',
  },
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Set up projects',
    description:
      'Admins create active projects, define sprints, and assign users to the right teams.',
  },
  {
    step: '02',
    title: 'Submit to a sprint',
    description:
      'Users create tickets tied to their project and the current active sprint.',
  },
  {
    step: '03',
    title: 'QA & development',
    description:
      'QA reviews and assigns work. Developers resolve tickets within their assigned projects.',
  },
  {
    step: '04',
    title: 'Track & notify',
    description:
      'Everyone follows ticket activity, comments, and status changes in real time until closure.',
  },
];

const HIGHLIGHTS = [
  {
    icon: FolderKanban,
    label: 'Project & sprint scope',
    detail: 'Tickets organized by project and sprint',
  },
  {
    icon: Zap,
    label: 'Real-time updates',
    detail: 'Live notifications via WebSocket',
  },
  {
    icon: Shield,
    label: 'Role-based access',
    detail: 'Admin, QA, Developer & User roles',
  },
];

const PROJECT_CARDS = [
  {
    icon: FolderKanban,
    title: 'Active projects',
    description:
      'Admins maintain a list of active projects. Each project has its own members, sprints, and ticket backlog.',
  },
  {
    icon: Layers,
    title: 'Sprint cycles',
    description:
      'Tickets are created against the current active sprint, keeping work aligned with your delivery timeline.',
  },
  {
    icon: Users,
    title: 'Team assignments',
    description:
      'Users are bound to one project. QA and Developers can work across multiple projects at the same time.',
  },
];

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <LandingHeader />

      <ScrollToTop />

      <main className="flex-1">
        <LandingHero />

        {/* Highlights */}
        <section className="border-y border-border/60 bg-muted/20 py-10">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-3">
            {HIGHLIGHTS.map((item, index) => (
              <ScrollReveal key={item.label} delay={index * 50}>
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:py-20"
        >
          <ScrollReveal>
            <div className="mb-10 max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Everything your service desk needs
              </h2>
              <p className="mt-3 text-muted-foreground">
                A complete toolkit for internal support — designed to be simple
                for requesters and powerful for your operations team.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <ScrollReveal key={feature.title} delay={index * 35}>
                <Card
                  className={cn(
                    'h-full border-border/80 landing-card-hover',
                    'hover:border-primary/30 hover:bg-muted/20',
                  )}
                >
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="size-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Projects & workflow */}
        <div className="border-t border-border/60 bg-muted/10">
          <section
            id="projects"
            className="mx-auto max-w-6xl scroll-mt-20 px-6 pt-12 sm:pt-16"
          >
            <ScrollReveal>
              <div className="mb-8 max-w-2xl">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Built around projects &amp; sprints
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Every piece of work lives inside a project. Sprints give your
                  team a focused delivery window — so nothing gets lost between
                  teams or releases.
                </p>
              </div>
            </ScrollReveal>
            <div className="grid gap-4 md:grid-cols-3">
              {PROJECT_CARDS.map((card, index) => (
                <ScrollReveal key={card.title} delay={index * 50}>
                  <Card className="h-full bg-background/80 landing-card-hover">
                    <CardHeader>
                      <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <card.icon className="size-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{card.title}</CardTitle>
                      <CardDescription className="leading-relaxed">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </section>

          <section
            id="workflow"
            className="mx-auto max-w-6xl scroll-mt-20 px-6 pt-10 pb-12 sm:pt-12 sm:pb-16"
          >
            <ScrollReveal>
              <div className="mb-8 max-w-2xl">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  How it works
                </h2>
                <p className="mt-3 text-muted-foreground">
                  A clear, traceable path from request to resolution — so nothing
                  falls through the cracks.
                </p>
              </div>
            </ScrollReveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {WORKFLOW_STEPS.map((item, index) => (
                <ScrollReveal key={item.step} delay={index * 50}>
                  <Card className="relative h-full bg-background/80 landing-card-hover">
                    <CardHeader>
                      <p className="text-xs font-semibold tracking-widest text-primary">
                        STEP {item.step}
                      </p>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    {index < WORKFLOW_STEPS.length - 1 ? (
                      <ArrowRight
                        className="absolute top-1/2 -right-3 hidden size-4 -translate-y-1/2 text-muted-foreground lg:block"
                        aria-hidden
                      />
                    ) : null}
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </div>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-muted/40 p-8 sm:p-12">
              <div className="landing-hero-glow absolute -top-12 -right-12 size-40 rounded-full bg-primary/5 blur-3xl" />
              <div className="relative max-w-xl space-y-4">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Ready to streamline your support?
                </h2>
                <p className="text-muted-foreground">
                  Sign in to manage projects, submit sprint-scoped tickets, and
                  collaborate with your Azure Enterprise team.
                </p>
                <Link
                  href="/login"
                  className={cn(buttonVariants({ size: 'lg' }), 'group')}
                >
                  Sign in to {APP_NAME}
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <AppFooter variant="full" />
    </div>
  );
}
