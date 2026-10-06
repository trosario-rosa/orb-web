import { useState, useCallback } from "react"

/** Anchor state for MUI `Menu`: where it's attached, whether it's open, and open/close handlers. */
export function useMenuAnchor() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const open = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])
  const close = useCallback(() => setAnchorEl(null), [])

  return { anchorEl, isOpen: anchorEl !== null, open, close }
}
