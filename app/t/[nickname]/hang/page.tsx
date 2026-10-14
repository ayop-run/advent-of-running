import { Suspense } from 'react';
import HangForm from './HangForm';

export default function HangPage() {
  return (
    <Suspense>
      <HangForm />
    </Suspense>
  );
}
