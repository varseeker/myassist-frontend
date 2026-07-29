'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Building2, ExternalLink } from 'lucide-react';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { getPublicClientsRequest } from '@/features/clients/api';
import type { Client } from '@/types';

const FALLBACK_CLIENTS: Client[] = [
  {
    id: 'fallback-net-fashion',
    name: 'Net Fashion Indonesia',
    companyName: 'PT NET PERSADA INDONESIA',
    description:
      'PT NET PERSADA INDONESIA, kami adalah perusahan yang fokus dalam memproduksi kaos polos dengan bahan TERBAIK dan TERJAMIN kualitasnya (ASLI) dan pastinya dengan harga TERMURAH di Indonesia.',
    logoUrl: '/clients/net-fashion-indonesia.png',
    websiteUrl: null,
    sortOrder: 1,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'fallback-ksu',
    name: 'KSU Mitra Saudara',
    companyName: 'Koperasi Serba Usaha Mitra Saudara',
    description:
      'Koperasi Serba Usaha (KSU) Mitra Saudara didirikan di Bandung, pada tanggal 16 Februari 1999 oleh 45 orang pendiri. KSU Mitra Saudara merupakan koperasi karyawan PT Bank Himpunan Saudara 1906 (sekarang PT. Bank Woori Saudara Indonesia 1906,Tbk) dan merupakan mitra utama dalam memenuhi kebutuhan internal Bank Woori Saudara di seluruh cabangnya.',
    logoUrl: '/clients/ksu-mitra-saudara.png',
    websiteUrl: null,
    sortOrder: 2,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
];

export function LandingClientsSection() {
  const clientsQuery = useQuery({
    queryKey: ['clients-public'],
    queryFn: getPublicClientsRequest,
    staleTime: 60_000,
    retry: 1,
  });

  const clients =
    clientsQuery.data && clientsQuery.data.length > 0
      ? clientsQuery.data
      : FALLBACK_CLIENTS;

  return (
    <section
      id="clients"
      className="border-t border-border/60 bg-muted/10 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <ScrollReveal>
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Our Clients
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Trusted by organizations we support
            </h2>
            <p className="mt-3 text-muted-foreground">
              Mitra yang kami dampingi dalam operasional service desk dan
              kolaborasi digital sehari-hari.
            </p>
          </div>
        </ScrollReveal>

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
      </div>
    </section>
  );
}
