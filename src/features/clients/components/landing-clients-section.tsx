'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Building2, ExternalLink } from 'lucide-react';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { getPublicClientsRequest } from '@/features/clients/api';

interface LandingClientsSectionProps {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
}

export function LandingClientsSection({
  eyebrow = 'Our Clients',
  heading = 'Trusted by organizations we support',
  subheading = 'Mitra yang kami dampingi dalam operasional service desk dan kolaborasi digital sehari-hari.',
}: LandingClientsSectionProps) {
  const clientsQuery = useQuery({
    queryKey: ['clients-public'],
    queryFn: getPublicClientsRequest,
    staleTime: 60_000,
    retry: 1,
  });

  const clients = clientsQuery.data ?? [];

  return (
    <section
      id="clients"
      className="border-t border-border/60 bg-muted/10 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <ScrollReveal>
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {heading}
            </h2>
            <p className="mt-3 text-muted-foreground">{subheading}</p>
          </div>
        </ScrollReveal>

        {clientsQuery.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-2xl border border-border/60 bg-muted/40"
              />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Client profiles will appear here once they are published in CMS.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {clients.map((client, index) => (
              <ScrollReveal key={client.id} delay={index * 60}>
                <article className="flex h-full flex-col gap-5 rounded-2xl border border-border/80 bg-background/90 p-6 shadow-sm transition-colors hover:border-primary/25">
                  <div className="flex items-start gap-4">
                    <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white p-2">
                      {client.logoUrl ? (
                        <Image
                          src={client.logoUrl}
                          alt={`${client.name} logo`}
                          width={72}
                          height={72}
                          className="max-h-16 w-auto object-contain"
                          unoptimized
                        />
                      ) : (
                        <Building2 className="size-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">
                        {client.name}
                      </h3>
                      {client.companyName ? (
                        <p className="text-sm font-medium text-primary/90">
                          {client.companyName}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {client.description}
                  </p>
                  {client.websiteUrl ? (
                    <a
                      href={client.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      Visit website
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : null}
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
