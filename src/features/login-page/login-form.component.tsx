import { Button } from "~/components/ui/button";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput } from "~/features/login-page/password-input.component";
import { LoginInput } from "~/features/login-page/login-input.component";
import { useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";
import { useI18n } from "~/i18n/i18n-provider";
import Link from "next/link";


export function LoginForm() {
    const { t } = useI18n();
    const router = useRouter();
    const searchParams = useSearchParams();

    const redirect = searchParams.get("redirect") || "/";

    const [error, setError] = useState(false);

    const [formData, setFormData] = useState({
      login: "",
      password: "",
    });

    const { login } = useGetRole();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      // Store password in localStorage
      const result = login(formData.password);
      if (result === Role.Guest) {
        setError(true);
        return;
      }
      // Navigate to previous page
      router.push(redirect);
    };   

    const isDisabled = !formData.login || !formData.password;

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-coral text-3xl font-extrabold text-ink">M</div>
        <div className="text-[28px] font-extrabold tracking-tight">Mario Group</div>
      </div>
      <form className="flex flex-col gap-3 rounded-[22px] bg-white p-5" onSubmit={handleSubmit}>
        <h1 className="mb-1 text-xl font-extrabold">{t("login.title")}</h1>
        <LoginInput formData={formData} handleChange={handleChange} />
        <PasswordInput handleChange={handleChange} error={error} formData={formData} />
        <Button type="submit" size="lg" disabled={isDisabled} className="mt-1"><LogIn />{t("login.submit")}</Button>
        <Link href="/" className="py-1.5 text-center text-[13px] font-bold text-brand-700">{t("login.guest")}</Link>
      </form>
    </div>
  );
}
