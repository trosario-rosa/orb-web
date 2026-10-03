import web from "../../assets/web.svg"

type LogoProps = {
  className?: string
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <img
      src={web}
      alt="Orb Web Logo"
      className={`size-10 ${className}`.trim()}
    />
  )
}
