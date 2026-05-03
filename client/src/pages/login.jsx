import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Examination Portal
        </h1>
        <p className="text-slate-600 mt-2">
          Secure access for educators and students.
        </p>
      </div>

      <div className="w-full max-w-md flex justify-center">
        <SignIn 
          routing="path" 
          path="/login" 
          signUpUrl="/signup"
          appearance={{
            elements: {
              // Customizing Clerk to match a professional Tailwind aesthetic
              card: "shadow-lg border border-slate-200 rounded-xl bg-white",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
              headerTitle: "hidden", 
              headerSubtitle: "hidden",
              footerActionLink: "text-blue-600 hover:text-blue-700 font-semibold"
            }
          }}
        />
      </div>

    </div>
  );
};

export default Login;