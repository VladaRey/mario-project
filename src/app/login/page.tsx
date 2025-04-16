"use client"

import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
const FAME_PASSWORD = process.env.NEXT_PUBLIC_FAME_PASSWORD;

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const redirect = searchParams.get("redirect") || "/";

    const [error, setError] = useState(false);

    const [formData, setFormData] = useState({
      login: "",
      password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      // Store password in localStorage
      if (formData.password === ADMIN_PASSWORD) {
        localStorage.setItem("admin-password", formData.password);
      } else if (formData.password === FAME_PASSWORD) {
        localStorage.setItem("fame-password", formData.password);
      } else {
        setError(true);
        return;
      }
      // Navigate to previous page
      router.push(redirect);
    };

    const [showPassword, setShowPassword] = useState(false);

    const isDisabled = !formData.login || !formData.password;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#2E2A5D]">
              <span className="text-2xl font-bold text-white">MG</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-[#2E2A5D]">
            Mario Group
          </h2>
          <p className="mt-2 text-gray-600">Sign in</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="login" className="text-gray-700">
                Login
              </Label>
              <Input
                id="login"
                name="login"
                type="text"
                required
                className="mt-1 block w-full border-gray-300 focus:border-[#2E2A5D] focus:ring-[#352961]"
                placeholder="Enter your login"
                value={formData.login}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <div className="mt-1">
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full border-gray-300 pr-10 focus:border-[#2E2A5D] focus:ring-[#352961]"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="pt-2 text-sm text-red-500">
                    *Invalid password
                  </p>
                )}
              </div>
            </div>
          </div>
          <Button
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-[#2E2A5D] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#7B3C7D] focus:outline-none focus:ring-2 focus:ring-[#352961] focus:ring-offset-2"
            disabled={isDisabled}
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

