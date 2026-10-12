import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { useI18n } from "~/i18n/i18n-provider";


interface LoginInputProps {
  formData: {
    login: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LoginInput({ formData, handleChange }: LoginInputProps) {
  const { t } = useI18n();
  return (
    <div>
      <Label htmlFor="login" className="text-[13px] font-bold text-[#4A4361]">
        {t("login.login")}
      </Label>
      <Input
        id="login"
        name="login"
        type="text"
        required
        autoComplete="username"
        className="mt-1.5 block h-12 w-full rounded-xl border-line text-[15px]"
        placeholder={t("login.loginPlaceholder")}
        value={formData.login}
        onChange={handleChange}
      />
    </div>
  );
}

