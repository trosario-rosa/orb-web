import { AppBar, Toolbar } from "@mui/material"
import MobileNavigation from "./MobileNavigation"
import DesktopNavigation from "./DesktopNavigation"
import UserMenu from "./UserMenu"
import Logo from "./Logo"

export default function TopBar() {
  return (
    <AppBar position="static" className="bg-[#ebebebc0] text-[#707070]">
      <Toolbar disableGutters className="relative mx-auto w-full px-2 min-h-13">
        <Logo className="hidden md:block mr-1" />
        <MobileNavigation />
        <DesktopNavigation />
        <Logo className="flex flex-1 justify-center md:hidden" />
        <UserMenu />
      </Toolbar>
    </AppBar>
  )
}
