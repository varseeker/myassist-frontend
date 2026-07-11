import { Suspense } from 'react';
import { LoadingState } from '@/components/shared/loading-state';
import LoginPage from './login-page';

export default function LoginRoutePage() {
  return (
    <Suspense fallback={<LoadingState message="Loading page..." />}>
      <LoginPage />
    </Suspense>
  );
}