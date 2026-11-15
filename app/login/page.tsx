import LoginForm from "@/components/LoginForm";

export default function Login() {
  return (
    <LoginForm
      title="Sign in or sign up"
      next="/doctors"
      note="Enter your email and we will send you a code. New here? The same step creates your account."
    />
  );
}
