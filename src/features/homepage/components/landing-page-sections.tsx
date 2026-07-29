'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { LandingHero } from '@/components/layouts/landing-hero';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LandingClientsSection } from '@/features/clients/components/landing-clients-section';
import { getPublicHomepageSectionsRequest } from '@/features/homepage/api';
import { HOMEPAGE_SECTION_FALLBACKS } from '@/features/homepage/constants';
import {
  asRecordArray,
  asString,
  resolveHomepageIcon,
} from '@/features/homepage/utils';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { HomepageSection, HomepageSectionKey } from '@/types';

function sectionContent(section: HomepageSection) {
  return section.content ?? {};
}

function HighlightsSection({ section }: { section: HomepageSection }) {
  const items = asRecordArray(sectionContent(section).items);

  return (
    <section className="border-y border-border/60 bg-muted/20 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-3">
        {items.map((item, index) => {
          const Icon = resolveHomepageIcon(asString(item.iconKey));
          const label = asString(item.label);

          return (
            <ScrollReveal key={`${label}-${index}`} delay={index * 50}>
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">
                    {asString(item.detail)}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}

function FeaturesSection({ section }: { section: HomepageSection }) {
  const content = sectionContent(section);
  const items = asRecordArray(content.items);

  return (
    <section
      id="features"
      className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:py-20"
    >
      <ScrollReveal>
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {asString(content.heading)}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {asString(content.subheading)}
          </p>
        </div>
      </ScrollReveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((feature, index) => {
          const Icon = resolveHomepageIcon(asString(feature.iconKey));
          const title = asString(feature.title);

          return (
            <ScrollReveal key={`${title}-${index}`} delay={index * 35}>
              <Card
                className={cn(
                  'h-full border-border/80 landing-card-hover',
                  'hover:border-primary/30 hover:bg-muted/20',
                )}
              >
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {asString(feature.description)}
                  </CardDescription>
                </CardHeader>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}

function ProjectsSection({ section }: { section: HomepageSection }) {
  const content = sectionContent(section);
  const items = asRecordArray(content.items);

  return (
    <section
      id="projects"
      className="mx-auto max-w-6xl scroll-mt-20 px-6 pt-12 sm:pt-16"
    >
      <ScrollReveal>
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {asString(content.heading)}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {asString(content.subheading)}
          </p>
        </div>
      </ScrollReveal>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((card, index) => {
          const Icon = resolveHomepageIcon(asString(card.iconKey));
          const title = asString(card.title);

          return (
            <ScrollReveal key={`${title}-${index}`} delay={index * 50}>
              <Card className="h-full bg-background/80 landing-card-hover">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {asString(card.description)}
                  </CardDescription>
                </CardHeader>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}

function WorkflowSection({ section }: { section: HomepageSection }) {
  const content = sectionContent(section);
  const steps = asRecordArray(content.steps);

  return (
    <section
      id="workflow"
      className="mx-auto max-w-6xl scroll-mt-20 px-6 pt-10 pb-12 sm:pt-12 sm:pb-16"
    >
      <ScrollReveal>
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {asString(content.heading)}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {asString(content.subheading)}
          </p>
        </div>
      </ScrollReveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((item, index) => {
          const step = asString(item.step);

          return (
            <ScrollReveal key={`${step}-${index}`} delay={index * 50}>
              <Card className="relative h-full bg-background/80 landing-card-hover">
                <CardHeader>
                  <p className="text-xs font-semibold tracking-widest text-primary">
                    STEP {step}
                  </p>
                  <CardTitle className="text-base">
                    {asString(item.title)}
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    {asString(item.description)}
                  </CardDescription>
                </CardHeader>
                {index < steps.length - 1 ? (
                  <ArrowRight
                    className="absolute top-1/2 -right-3 hidden size-4 -translate-y-1/2 text-muted-foreground lg:block"
                    aria-hidden
                  />
                ) : null}
              </Card>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}

function CtaSection({ section }: { section: HomepageSection }) {
  const content = sectionContent(section);
  const ctaHref = asString(content.ctaHref, '/login');
  const ctaLabel = asString(content.ctaLabel, `Sign in to ${APP_NAME}`);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-muted/40 p-8 sm:p-12">
          <div className="landing-hero-glow absolute -top-12 -right-12 size-40 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative max-w-xl space-y-4">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {asString(content.heading)}
            </h2>
            <p className="text-muted-foreground">{asString(content.body)}</p>
            <Link
              href={ctaHref}
              className={cn(buttonVariants({ size: 'lg' }), 'group')}
            >
              {ctaLabel}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

export function useVisibleHomepageKeys() {
  const sectionsQuery = useQuery({
    queryKey: ['homepage-public'],
    queryFn: getPublicHomepageSectionsRequest,
    staleTime: 60_000,
    retry: 1,
  });

  const sections =
    sectionsQuery.data && sectionsQuery.data.length > 0
      ? sectionsQuery.data
      : HOMEPAGE_SECTION_FALLBACKS;

  return new Set<HomepageSectionKey>(
    sections
      .filter((section) => section.isVisible)
      .map((section) => section.key),
  );
}

export function LandingPageSections() {
  const sectionsQuery = useQuery({
    queryKey: ['homepage-public'],
    queryFn: getPublicHomepageSectionsRequest,
    staleTime: 60_000,
    retry: 1,
  });

  const sections =
    sectionsQuery.data && sectionsQuery.data.length > 0
      ? [...sectionsQuery.data].sort((a, b) => a.sortOrder - b.sortOrder)
      : HOMEPAGE_SECTION_FALLBACKS.filter((section) => section.isVisible);

  const rendered = new Set<HomepageSectionKey>();
  const nodes: React.ReactNode[] = [];

  for (const section of sections) {
    if (rendered.has(section.key)) continue;

    if (section.key === 'PROJECTS' || section.key === 'WORKFLOW') {
      const projects =
        section.key === 'PROJECTS'
          ? section
          : sections.find((item) => item.key === 'PROJECTS');
      const workflow =
        section.key === 'WORKFLOW'
          ? section
          : sections.find((item) => item.key === 'WORKFLOW');

      nodes.push(
        <div
          key="projects-workflow-band"
          className="border-t border-border/60 bg-muted/10"
        >
          {projects ? <ProjectsSection section={projects} /> : null}
          {workflow ? <WorkflowSection section={workflow} /> : null}
        </div>,
      );
      if (projects) rendered.add('PROJECTS');
      if (workflow) rendered.add('WORKFLOW');
      continue;
    }

    rendered.add(section.key);

    switch (section.key) {
      case 'HERO':
        nodes.push(
          <LandingHero key={section.id} content={section.content} />,
        );
        break;
      case 'HIGHLIGHTS':
        nodes.push(<HighlightsSection key={section.id} section={section} />);
        break;
      case 'FEATURES':
        nodes.push(<FeaturesSection key={section.id} section={section} />);
        break;
      case 'CLIENTS':
        nodes.push(
          <LandingClientsSection
            key={section.id}
            eyebrow={asString(section.content.eyebrow)}
            heading={asString(section.content.heading)}
            subheading={asString(section.content.subheading)}
          />,
        );
        break;
      case 'CTA':
        nodes.push(<CtaSection key={section.id} section={section} />);
        break;
      default:
        break;
    }
  }

  return <>{nodes}</>;
}
