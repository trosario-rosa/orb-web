import { Link } from "@mui/material"
import { Link as RouterLink } from "react-router"
import web from "../../assets/web.svg"

type LogoProps = {
  className?: string
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <Link component={RouterLink} color="inherit" to={"/"}>
      <img
        src={web}
        alt="Orb Web Logo"
        className={`size-10 ${className}`.trim()}
      />
    </Link>
  )
}
