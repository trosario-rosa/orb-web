import { Typography, Link } from "@mui/material"
import { Link as RouterLink } from "react-router"

interface FooterLinkProps {
  label: string
  to: string
  prefix?: string
  suffix?: string
}

function FooterLink({ label, to, prefix, suffix }: FooterLinkProps) {
  return (
    <Typography variant="body2" color="textSecondary">
      {prefix}
      <Link component={RouterLink} to={to} color="inherit">
        {label}
      </Link>{" "}
      {suffix}
    </Typography>
  )
}

export default function Footer() {
  return (
    <div className="flex items-center justify-center gap-6 py-1">
      <FooterLink
        label={"Orb"}
        to={"/"}
        prefix={"Copyright © "}
        suffix={`${new Date().getFullYear()}.`}
      />
      {/* Below would be better served as MUI Dialogs */}
      <FooterLink label={"Privacy Policy"} to={"/privacy"} />
      <FooterLink label={"Terms of Service"} to={"/terms"} />
    </div>
  )
}
