import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
}

export const InputField = ({ label, type = "text", value, onChange }: Props) => {
  return (
    <div className="flex flex-col gap-1">
      <Label className="font-medium text-gray-700">{label}</Label>

      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          rounded-xl px-4 py-2
          border border-gray-300
          focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-purple-500
          transition-all duration-300
          bg-white/60 backdrop-blur-lg
        "
      />
    </div>
  );
};
