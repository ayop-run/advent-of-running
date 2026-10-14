import { Suspense } from 'react';
import Done from './Done';

export default function DonePage() {
  return (
    <Suspense>
      <Done />
    </Suspense>
  );
}
