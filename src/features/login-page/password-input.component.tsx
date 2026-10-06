import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useI18n } from "~/i18n/i18n-provider";

interface PasswordInputProps {
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error: boolean;
    formData: {
        password: string;
    };
}

export function PasswordInput({ handleChange, error, formData }: PasswordInputProps) {
    const { t } = useI18n();
    const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <Label htmlFor="password" className="text-[13px] font-bold text-[#4A4361]">
        {t("login.password")}
      </Label>
      <div className="mt-1.5">
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="block h-12 w-full rounded-xl border-line pr-11 text-[15px]"
            placeholder={t("login.passwordPlaceholder")}
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            aria-label={showPassword ? t("login.hide") : t("login.show")}
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
          <p className="pt-2 text-sm text-red-500">{t("login.error")}</p>
        )}
      </div>
    </div>
  );
}

