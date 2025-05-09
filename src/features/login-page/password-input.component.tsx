import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error: boolean;
    formData: {
        password: string;
    };
}

export function PasswordInput({ handleChange, error, formData }: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

  return (
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
          <p className="pt-2 text-sm text-red-500">*Invalid password</p>
        )}
      </div>
    </div>
  );
}

