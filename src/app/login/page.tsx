"use client"

import { LoginForm } from "~/features/login-page/login-form.component";


export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <LoginForm />
    </div>
  );
}