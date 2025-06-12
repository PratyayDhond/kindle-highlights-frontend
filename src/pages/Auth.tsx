import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { useCoins } from "@/context/CoinsContext";

const Auth = () => {
  const { setCoins } = useCoins();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"main" | "login" | "signup">("main");

  // Form state for login/signup
  const [form, setForm] = useState({
    email: "",
    password: "",
    otp: "",
    firstName: "",
    lastName: "",
    confirmPassword: "",
  });

  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState(""); // For other form errors
  const [backendError, setBackendError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Live email validation
    if (name === "email") {
      const errorMsg = validateEmail(value);
      setEmailError(errorMsg);
    }
    // You can add more live validation for other fields if needed
  };

  // Placeholder submit handlers
  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedEmail = cleanEmail(form.email);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanedEmail,
          password: form.password,
        }),
        credentials: "include", // <-- This is important
        // Why credentials: "include"?
        // This ensures cookies (like session cookies) are sent with the request
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Login failed. Please check your credentials.");
        return;
      }
      // Set coins from the login API result
      if (typeof data.coins === "number") {
        setCoins(data.coins);
      }
      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error("Login failed. Please try again.");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateEmail(form.email);
    setEmailError(errorMsg);
    if (errorMsg) return;

    const cleanedEmail = cleanEmail(form.email);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanedEmail,
          firstName: form.firstName,
          lastName: form.lastName,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
        credentials: "include", // <-- This is important!
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 || data.message?.toLowerCase().includes("already")) {
          toast.error(data.message || "This email is already in use.");
        }
        else if (res.status === 400 && data.message?.toLowerCase().includes("password")) {
          toast.error(data.message || "Password does not meet requirements.");
        }
        else {
          toast.error(data.message || "Signup failed. Please try again.");
        }
        return;
      }

      toast.success(data.message || "Signup successful! Please check your email for verification.");
      setAuthMode("login");
    } catch (err) {
      toast.error("Something went wrong. Please try again later.");
    }
  };

  const validateEmail = (email: string) => {
    // Basic email format check
    const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidFormat) return "Please enter a valid email address.";

    // Special Gmail rules
    const [username, domain] = email.split("@");
    if (domain && domain.toLowerCase() === "gmail.com") {
      if (username.includes("+")) return "The character + is not allowed in the email";
    }
    return "";
  };

  const cleanEmail = (email: string) => {
    const [username, domain] = email.split("@");
    if (domain && domain.toLowerCase() === "gmail.com") {
      const cleanedUsername = username.split("+")[0].replace(/\./g, "");
      return `${cleanedUsername}@${domain}`;
    }
    return email;
  };

  // Helper to check if any required field is empty
  const isSignupDisabled =
    !form.email ||
    !form.firstName ||
    !form.lastName ||
    !form.password ||
    !form.confirmPassword ||
    !!emailError ||
    form.password !== form.confirmPassword;

  // Move Google login logic to its own function
  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
        credentials: "include", // <-- This is required!
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Backend verification failed:", data);
        toast.error(data.message || "Backend verification failed");
        return;
      }
      if (!data.googleId) {
        toast.error(data.message || "Login failed. You did not use Google to login with this email.");
      } else {
        // Set coins from the Google login API result
        if (typeof data.coins === "number") {
          setCoins(data.coins);
        }
        toast.success(data.message || "Login successful!");
        navigate("/");
      }
    } catch (error) {
      console.error("Error during backend verification:", error);
      toast.error("Backend verification failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-royal-100/30 to-royal-200/30 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 glass-effect">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login to Kindle Clippings
        </h2>
        <div className="space-y-4">
          {authMode === "main" && (
            <>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  toast.error("Google sign-in failed");
                }}
                width="100%"
                theme="outline"
                size="large"
              />
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-200" />
                <span className="mx-2 text-gray-400 text-xs">or</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>
              <Button
                onClick={() => setAuthMode("login")}
                className="w-full flex items-center justify-center bg-royal-500 text-white hover:bg-royal-600"
              >
                <Mail className="mr-2 h-5 w-5" />
                Continue with Email
              </Button>
            </>
          )}

          {authMode === "login" && (
            <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowLoginPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button type="submit" className="w-full bg-royal-500 text-white hover:bg-royal-600">
                Login
              </Button>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <span
                  className="text-royal-600 font-semibold cursor-pointer"
                  onClick={() => setAuthMode("signup")}
                >
                  Sign up
                </span>
              </div>
              <div className="text-center">
                <Button
                  variant="ghost"
                  className="text-royal-500 underline"
                  onClick={() => setAuthMode("main")}
                  type="button"
                >
                  ← Back
                </Button>
              </div>
            </form>
          )}

          {authMode === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
                {emailError && (
                  <div className="text-red-500 text-xs mt-1">{emailError}</div>
                )}
              </div>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
              <div className="relative">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowSignupPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowSignupPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button
                type="submit"
                className="w-full bg-royal-500 text-white hover:bg-royal-600"
                disabled={isSignupDisabled}
              >
                Sign Up
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <span
                  className="text-royal-600 font-semibold cursor-pointer"
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </span>
              </div>
              <div className="text-center">
                <Button
                  variant="ghost"
                  className="text-royal-500 underline"
                  onClick={() => setAuthMode("main")}
                  type="button"
                >
                  ← Back
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;