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
      className="
        w-full flex items-center justify-center gap-3 rounded-xl py-5 
        bg-white shadow-md hover:bg-gray-100 transition-all duration-300
      "
    >
      <FcGoogle size={24} />
      <span className="font-medium">{text}</span>
    </Button>
  );
};
