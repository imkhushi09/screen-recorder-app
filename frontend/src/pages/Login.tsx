// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// const API_URL = import.meta.env.VITE_API_URL;

// const Login = ({ onSwitch }: { onSwitch: () => void }) => {
//   const { login } = useAuth();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Clear fields on mount
//   useEffect(() => {
//     setEmail("");
//     setPassword("");
//   }, []);

//   const handleLogin = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await axios.post(`${API_URL}/auth/login`, { email, password });
//       login(res.data.access_token, res.data.email);
//     } catch (err: any) {
//       setError(err.response?.data?.detail || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center px-4">
//       <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl w-full max-w-md">

//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 border border-white/20">
//             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//             </svg>
//           </div>
//           <h1 className="text-3xl font-bold text-white">Welcome back</h1>
//           <p className="text-white/60 mt-1">Sign in to your account</p>
//         </div>

//         {/* Form */}
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="you@example.com"
//               autoComplete="off"
//               className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               autoComplete="new-password"
//               className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
//               onKeyDown={(e) => e.key === "Enter" && handleLogin()}
//             />
//           </div>

//           {error && (
//             <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
//               {error}
//             </div>
//           )}

//           <button
//             onClick={handleLogin}
//             disabled={loading}
//             className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
//           >
//             {loading ? "Signing in..." : "Sign In"}
//           </button>
//         </div>

//         {/* Switch to signup */}
//         <p className="text-center text-white/50 text-sm mt-6">
//           Don't have an account?{" "}
//           <button onClick={onSwitch} className="text-blue-400 hover:text-blue-300 font-medium">
//             Sign up
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;






import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const Login = ({ onSwitch }: { onSwitch: () => void }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setEmail("");
    setPassword("");
  }, []);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");
    setError("");

    if (!email && !password) {
      setEmailError("Email is required");
      setPasswordError("Password is required");
      return;
    }
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email (e.g. you@example.com)");
      return;
    }
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    if (password.length !== 6) {
      setPasswordError("Password must be exactly 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      login(res.data.access_token, res.data.email);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 border border-white/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-white/60 mt-1">Sign in to your account</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              placeholder="you@example.com"
              autoComplete="off"
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${emailError ? "border-red-500/70" : "border-white/20"}`}
            />
            {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Password <span className="text-white/40 text-xs">(exactly 6 characters)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  if (e.target.value.length <= 6) {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }
                }}
                placeholder="••••••"
                autoComplete="new-password"
                maxLength={6}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className={`w-full px-4 py-3 pr-12 bg-white/10 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${passwordError ? "border-red-500/70" : "border-white/20"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-white/30 text-xs mt-1">{password.length}/6 characters</p>
            {passwordError && <p className="text-red-400 text-xs mt-1">{passwordError}</p>}
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p className="text-center text-white/50 text-sm mt-6">
          Don't have an account?{" "}
          <button onClick={onSwitch} className="text-blue-400 hover:text-blue-300 font-medium">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;