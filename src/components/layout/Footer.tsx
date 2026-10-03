import { Typography, Link } from "@mui/material"

interface FooterLinkProps {
  label: string
  href: string
  prefix?: string
  suffix?: string
}

function FooterLink({ label, href, prefix, suffix }: FooterLinkProps) {
  return (
    <Typography
      variant="body2"
      sx={{
        color: "text.secondary",
      }}
    >
      {prefix}
      <Link color="inherit" href={href}>
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
        href={"#site"}
        prefix={"Copyright © "}
        suffix={`${new Date().getFullYear()}.`}
      />
      <FooterLink label={"Privacy Policy"} href={"#privacy"} />
      <FooterLink label={"Terms of Service"} href={"#terms"} />
    </div>
  )
}
