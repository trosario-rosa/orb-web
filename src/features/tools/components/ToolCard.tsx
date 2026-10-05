import type { ReactNode } from "react"
import { Card, CardActions, CardContent, CardHeader } from "@mui/material"

type ToolCardProps = {
  title: string
  description?: string
  children?: ReactNode
  actions: ReactNode
}

export default function ToolCard({
  title,
  description,
  children,
  actions,
}: ToolCardProps) {
  return (
    <Card
      component="section"
      aria-label={title}
      variant="outlined"
      className="flex flex-col"
    >
      <CardHeader
        title={title}
        subheader={description}
        slotProps={{ title: { component: "h2", variant: "h6" } }}
      />
      {children && (
        <CardContent className="flex-1 pt-0">{children}</CardContent>
      )}
      <CardActions className="mt-auto justify-end px-4 pb-4">
        {actions}
      </CardActions>
    </Card>
  )
}
