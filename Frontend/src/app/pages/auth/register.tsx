import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { InputField } from "@/components/auth/InputFields";
import { Button } from "@/components/ui/button";
import { SocialButton } from "@/components/auth/SocialButton";
import { Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleRegister = () => {
    console.log("Register clicked:", { email, phone });
  };

  return (
    <AuthCard title="Create Your Account">
      <div className="flex flex-col gap-5">

        <InputField label="Email Address" value={email} onChange={setEmail} />

        <InputField label="Phone Number" value={phone} onChange={setPhone} />

        <Button
          onClick={handleRegister}
          className="
            w-full py-3 rounded-xl text-white
            bg-gradient-to-r from-indigo-500 to-purple-600 
            hover:opacity-90 transition-all duration-300
          "
        >
          Register
        </Button>

        <div className="text-center text-sm text-gray-600">OR</div>

        <SocialButton
          text="Continue with Google"
          onClick={() => console.log("Google register")}
        />

        <p className="text-center text-sm mt-2 text-gray-700">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-purple-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
