import LoginForm from "@/components/LoginForm";

export default function DoctorLogin() {
  return (
    <LoginForm
      title="Doctor sign in / sign up"
      next="/doctor/start"
      note="Enter your email and we will send you a code. New doctors: sign up here, then send your registration details for approval."
    />
  );
}
