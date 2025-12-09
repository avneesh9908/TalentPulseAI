import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

interface Props {
  text: string;
  onClick: () => void;
}

export const SocialButton = ({ text, onClick }: Props) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="w-full flex items-center gap-2 rounded-lg"
    >
      <FcGoogle size={22} /> 
      {text}
    </Button>
  );
};
