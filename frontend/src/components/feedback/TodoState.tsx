import { Typography } from "@mui/material"

type TodoStateProps = {
  title: string
}

export default function TodoState({ title }: TodoStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <Typography>{title} Page Unimplemented</Typography>
    </div>
  )
}
