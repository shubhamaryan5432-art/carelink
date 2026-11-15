import LoginForm from "@/components/LoginForm";

export default function AdminLogin() {
  return <LoginForm title="Admin sign in" next="/admin" note="For administrators only." />;
}
