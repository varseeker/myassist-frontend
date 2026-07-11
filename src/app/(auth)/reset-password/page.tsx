import { Suspense } from 'react';
import { LoadingState } from '@/components/shared/loading-state';
import ResetPasswordPage from './reset-password-page';

export default function ResetPasswordRoutePage() {
  return (
    <Suspense fallback={<LoadingState message="Loading page..." />}>
      <ResetPasswordPage />
    </Suspense>
  );
}