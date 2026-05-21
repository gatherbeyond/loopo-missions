import mascot from "@/assets/loopo-hi.png";

export function Mascot({ size = 180 }: { size?: number }) {
  return (
    <img
      src={mascot}
      alt="Loopo mascot waving"
      width={size}
      height={size}
      className="object-contain drop-shadow-[0_10px_24px_rgba(98,0,230,0.25)]"
      style={{ width: size, height: size }}
    />
  );
}
