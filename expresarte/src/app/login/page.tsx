// app/login/page.tsx
'use client';

import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <LoginForm />
    </div>
  );
}
