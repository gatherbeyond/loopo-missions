import logo from "@/assets/loopo-logo.png";

export function LoopoLogo({ className = "h-10 w-auto" }: { className?: string }) {
  return <img src={logo} alt="Loopo" className={className} />;
}
