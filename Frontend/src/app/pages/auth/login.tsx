import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { InputField } from "@/components/auth/InputFields";
import { Button } from "@/components/ui/button";
import { SocialButton } from "@/components/auth/SocialButton";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    console.log("Login clicked:", { email });
  };

  return (
    <AuthCard title="Welcome Back">
      <div className="flex flex-col gap-4">
        <InputField label="Email" value={email} onChange={setEmail} />

        <Button onClick={handleLogin} className="w-full rounded-lg">
          Login
        </Button>

        <div className="text-center text-sm text-muted-foreground">OR</div>

        <SocialButton
          text="Login with Google"
          onClick={() => console.log("Google login")}
        />

        <p className="text-center text-sm mt-2">
          Don’t have an account?{" "}
          <Link to="/auth/register" className="text-blue-600 font-medium">
            Register now
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
