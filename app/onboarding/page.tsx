import { redirect } from 'next/navigation';

/** Old address for sign-up; kept so existing links still work. */
export default function Onboarding() {
  redirect('/signup');
}
