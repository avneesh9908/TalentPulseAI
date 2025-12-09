import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  title: string;
  children: React.ReactNode;
}

export const AuthCard = ({ title, children }: Props) => {
  return (
    <Card className="w-full max-w-md shadow-xl border-none rounded-2xl">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
