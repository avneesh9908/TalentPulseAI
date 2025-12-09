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
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg"
      />
    </div>
  );
};
