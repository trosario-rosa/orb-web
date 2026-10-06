type NavigationItem = { label: string; to: string }

export const PAGES: NavigationItem[] = [
  { label: "Overview", to: "/overview" },
  { label: "User Management", to: "/users" },
  { label: "Analytics", to: "/analytics" },
  { label: "Reports", to: "/reports" },
]

export const SETTINGS: NavigationItem[] = [
  { label: "Profile", to: "/profile" },
  { label: "Tools", to: "/tools" },
  { label: "Logout", to: "/logout" },
]
