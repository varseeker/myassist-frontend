'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardList,
  Headphones,
  Plus,
  Shield,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getDashboardSummaryRequest } from '@/features/dashboard/api';
import { useAuthStore } from '@/features/auth/store';
import { APP_NAME, TICKET_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

const PRIORITY_COLORS = ['#64748b', '#3b82f6', '#f97316', '#ef4444'];
const STATUS_COLORS = [
  '#3b82f6',
  '#a855f7',
  '#6366f1',
  '#f59e0b',
  '#f97316',
  '#10b981',
  '#f43f5e',
  '#64748b',
  '#ef4444',
];

const ROLE_INTROS: Record<UserRole, string> = {
  ADMIN:
    'Oversee the entire service desk — manage users, monitor ticket flow, and keep operations running smoothly.',
  QA: 'Review incoming requests, validate details, and assign the right work to the development team.',
  DEVELOPER:
    'Pick up assigned tickets, collaborate through comments, and deliver resolutions on time.',
  USER:
    'Submit service requests, track progress in real time, and stay informed every step of the way.',
};

function formatStatusLabel(label: string) {
  return label.replaceAll('_', ' ');
}

function formatTrendDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <EmptyState
      compact
      icon={BarChart3}
      title="No data to display"
      description={message}
      className="h-full border-0 bg-transparent"
    />
  );
}

export function DashboardPageContent() {
  const user = useAuthStore((state) => state.user);

  const dashboardQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummaryRequest,
  });

  const data = dashboardQuery.data;
  const summary = data?.summary;
  const role = user?.role ?? 'USER';

  const statCards = summary
    ? [
        { label: 'Total Tickets', value: summary.totalTickets, icon: Ticket },
        { label: 'Open', value: summary.openTickets, icon: ClipboardList },
        { label: 'In Progress', value: summary.inProgressTickets, icon: TrendingUp },
        { label: 'Resolved', value: summary.resolvedTickets, icon: CheckCircle2 },
        { label: 'Closed', value: summary.closedTickets, icon: Shield },
        {
          label: 'Unread Notifications',
          value: summary.unreadNotifications,
          icon: Bell,
        },
        ...(summary.totalUsers !== undefined
          ? [{ label: 'Active Users', value: summary.totalUsers, icon: Users }]
          : []),
      ]
    : [];

  const statusChartData =
    data?.ticketsByStatus
      .filter((item) => item.count > 0)
      .map((item) => ({
        name: formatStatusLabel(item.label),
        count: item.count,
      })) ?? [];

  const priorityChartData =
    data?.ticketsByPriority.map((item) => ({
      name: item.label,
      count: item.count,
    })) ?? [];

  const typeChartData =
    data?.ticketsByType
      .filter((item) => item.count > 0)
      .map((item) => ({
        name: TICKET_TYPE_LABELS[item.label as keyof typeof TICKET_TYPE_LABELS],
        count: item.count,
      })) ?? [];

  const trendChartData =
    data?.ticketsTrend.map((item) => ({
      name: formatTrendDate(item.date),
      count: item.count,
    })) ?? [];

  const hasTicketData = (summary?.totalTickets ?? 0) > 0;
  const hasTrendData = trendChartData.some((item) => item.count > 0);

  return (
    <div className="space-y-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/8 via-background to-muted/40 p-6 sm:p-8">
          <div className="absolute -top-16 -right-16 size-48 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 size-40 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Headphones className="size-3.5 text-primary" />
              Internal Service Desk Platform
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome to {APP_NAME}
                {user ? `, ${user.fullName}` : ''}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {APP_NAME} is Azure Enterprise&apos;s service desk system for
                managing IT support, bug reports, and enhancement requests.
                Submit tickets, collaborate with your team, and track every
                request from submission to resolution — all in one place.
              </p>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {ROLE_INTROS[role]}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/tickets" className={buttonVariants({ size: 'sm' })}>
                <Ticket className="size-4" />
                Browse tickets
              </Link>
              <Link
                href="/notifications"
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                <Bell className="size-4" />
                Notifications
              </Link>
              {role === 'ADMIN' ? (
                <Link
                  href="/users"
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  <Users className="size-4" />
                  Manage users
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        {dashboardQuery.isLoading ? (
          <LoadingState message="Loading dashboard..." />
        ) : dashboardQuery.isError ? (
          <EmptyState
            icon={BarChart3}
            title="Unable to load dashboard"
            description="We could not fetch your service desk overview. Please check your connection and try again."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void dashboardQuery.refetch()}
              >
                Retry
              </Button>
            }
          />
        ) : (
          <>
            {/* Stats */}
            <section className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Overview
                </h2>
                <p className="text-sm text-muted-foreground">
                  Key metrics for your current scope
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                  <Card key={card.label} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardDescription>{card.label}</CardDescription>
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                        <card.icon className="size-4 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-3xl tabular-nums">
                        {card.value}
                      </CardTitle>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Charts */}
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Analytics
                </h2>
                <p className="text-sm text-muted-foreground">
                  Visual breakdown of ticket activity in your scope
                </p>
              </div>

              {!hasTicketData ? (
                <EmptyState
                  icon={Ticket}
                  title="No ticket activity yet"
                  description="Once tickets are created and processed, charts and trends will appear here to help you monitor workload and performance."
                  action={
                    <Link href="/tickets" className={buttonVariants({ size: 'sm' })}>
                      <Plus className="size-4" />
                      Go to tickets
                    </Link>
                  }
                />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tickets by Status</CardTitle>
                      <CardDescription>
                        Distribution across workflow stages
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                      {statusChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={statusChartData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              className="stroke-muted"
                            />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {statusChartData.map((entry, index) => (
                                <Cell
                                  key={entry.name}
                                  fill={
                                    STATUS_COLORS[index % STATUS_COLORS.length]
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <ChartEmpty message="No tickets are currently in any workflow status." />
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tickets by Priority</CardTitle>
                      <CardDescription>Priority breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                      {priorityChartData.some((item) => item.count > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={priorityChartData.filter(
                                (item) => item.count > 0,
                              )}
                              dataKey="count"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={90}
                              label={(props) =>
                                `${props.name ?? ''}: ${props.value ?? 0}`
                              }
                            >
                              {priorityChartData.map((entry, index) => (
                                <Cell
                                  key={entry.name}
                                  fill={
                                    PRIORITY_COLORS[
                                      index % PRIORITY_COLORS.length
                                    ]
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <ChartEmpty message="No priority data available for your tickets yet." />
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tickets Created (Last 7 Days)</CardTitle>
                      <CardDescription>Daily submission trend</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                      {hasTrendData ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendChartData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              className="stroke-muted"
                            />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="count"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <ChartEmpty message="No tickets were created in the last 7 days." />
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tickets by Type</CardTitle>
                      <CardDescription>Request category breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                      {typeChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={typeChartData} layout="vertical">
                            <CartesianGrid
                              strokeDasharray="3 3"
                              className="stroke-muted"
                            />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={120}
                              tick={{ fontSize: 11 }}
                            />
                            <Tooltip />
                            <Bar
                              dataKey="count"
                              fill="#6366f1"
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <ChartEmpty message="No ticket types have been recorded yet." />
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </section>

            {/* Recent tickets */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Recent Tickets</CardTitle>
                  <CardDescription>
                    Latest tickets in your scope
                  </CardDescription>
                </div>
                <Link
                  href="/tickets"
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                {data?.recentTickets.length === 0 ? (
                  <EmptyState
                    compact
                    icon={Ticket}
                    title="No recent tickets"
                    description="Tickets you create or have access to will show up here for quick access."
                    action={
                      <Link
                        href="/tickets"
                        className={cn(buttonVariants({ size: 'sm' }))}
                      >
                        <Plus className="size-4" />
                        Create a ticket
                      </Link>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {data?.recentTickets.map((ticket) => (
                      <Link
                        key={ticket.id}
                        href={`/tickets/${ticket.id}`}
                        className="flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:border-primary/30 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium">
                            {ticket.ticketNumber} · {ticket.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {TICKET_TYPE_LABELS[ticket.type]} ·{' '}
                            {new Date(ticket.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <StatusBadge status={ticket.status} />
                          <PriorityBadge priority={ticket.priority} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
  );
}
