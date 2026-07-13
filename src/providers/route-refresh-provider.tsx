'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function RouteRefreshEffect() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const search = searchParams.toString();

  useEffect(() => {
    void queryClient.invalidateQueries();
  }, [pathname, search, queryClient]);

  return null;
}

/**
 * Re-inquire active queries whenever the user navigates to another
 * page/view (including query-string changes).
 */
export function RouteRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <RouteRefreshEffect />
      </Suspense>
      {children}
    </>
  );
}
