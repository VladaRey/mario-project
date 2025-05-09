import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";


interface LoginInputProps {
  formData: {
    login: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LoginInput({ formData, handleChange }: LoginInputProps) {
  return (
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
  );
}

