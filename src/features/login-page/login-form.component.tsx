import { Button } from "~/components/ui/button";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput } from "~/features/login-page/password-input.component";
import { LoginInput } from "~/features/login-page/login-input.component";
import { useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";


export function LoginForm() {
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
    <div className="w-full max-w-md overflow-hidden rounded-lg bg-white p-8 shadow-lg">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#2E2A5D]">
            <span className="text-2xl font-bold text-white">MG</span>
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-[#2E2A5D]">Mario Group</h2>
        <p className="mt-2 text-gray-600">Sign in</p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <LoginInput formData={formData} handleChange={handleChange}/>
          <PasswordInput handleChange={handleChange} error={error} formData={formData}/>
        </div>
        <Button
          type="submit"
          className="flex w-full justify-center rounded-md border border-transparent bg-[#2E2A5D] px-4 py-2 text-sm font-medium 
          text-white shadow-sm hover:bg-[#7B3C7D] focus:outline-none focus:ring-2 focus:ring-[#352961] focus:ring-offset-2"
          disabled={isDisabled}
        >
          <LogIn className="mr-2 h-5 w-5" />
          Sign in
        </Button>
      </form>
    </div>
  );
}
