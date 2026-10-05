import { Link } from "@mui/material"
import { Link as RouterLink } from "react-router"
import web from "../../assets/web.svg"

export default function Logo() {
  return (
    <Link component={RouterLink} color="inherit" to={"/"}>
      <img src={web} alt="Orb Web Logo" className="size-10" />
    </Link>
  )
}
