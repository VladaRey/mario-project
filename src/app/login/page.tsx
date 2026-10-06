"use client";
import { LoginForm } from "~/features/login-page/login-form.component";
import { LangSwitch } from "~/components/shell/lang-switch";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-brand-900 p-4">
      <div className="flex justify-end"><LangSwitch /></div>
      <div className="flex flex-1 items-center justify-center"><LoginForm /></div>
    </div>
  );
}
