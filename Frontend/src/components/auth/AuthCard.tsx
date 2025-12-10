import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const AuthCard = ({ title, children, className }: Props) => {
  return (
    <div className="w-full max-w-md">
      <Card
        className={cn(
          "backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-3xl p-8",
          "transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.15)]",
          className
        )}
      >
        <h1 className="text-center text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h1>

        {children}
      </Card>
    </div>
  );
};
