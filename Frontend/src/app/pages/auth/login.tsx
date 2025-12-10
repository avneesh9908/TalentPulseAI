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
      <div className="flex flex-col gap-5">
        
        <InputField label="Email Address" value={email} onChange={setEmail} />

        <Button
          onClick={handleLogin}
          className="
            w-full py-3 rounded-xl text-white
            bg-gradient-to-r from-indigo-500 to-purple-600 
            hover:opacity-90 transition-all duration-300
          "
        >
          Login
        </Button>

        <div className="text-center text-sm text-gray-600">OR</div>

        <SocialButton
          text="Login with Google"
          onClick={() => console.log("Google login")}
        />

        <p className="text-center text-sm mt-2 text-gray-700">
          Don’t have an account?{" "}
          <Link to="/auth/register" className="text-purple-600 font-semibold">
            Register now
          </Link>
        </p>

      </div>
    </AuthCard>
  );
}
