import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { InputField } from "@/components/auth/InputFields";
import { Button } from "@/components/ui/button";
import { SocialButton } from "@/components/auth/SocialButton";
import { Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // NOTE: ye backend connect hone ke baad implement hoga
  const handleRegister = () => {
    console.log("Register clicked:", { email, phone });
  };

  return (
    <AuthCard title="Create Your Account">
      <div className="flex flex-col gap-4">
        {/* Email Input */}
        <InputField label="Email" value={email} onChange={setEmail} />

        {/* Phone Input */}
        <InputField label="Phone Number" value={phone} onChange={setPhone} />

        {/* Register Button */}
        <Button onClick={handleRegister} className="w-full rounded-lg">
          Register
        </Button>

        {/* Divider */}
        <div className="text-center text-sm text-muted-foreground">OR</div>

        {/* Google Login */}
        <SocialButton
          text="Continue with Google"
          onClick={() => console.log("Google register")}
        />

        <p className="text-center text-sm mt-2">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-blue-600 font-medium">
            Login
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
