import { useState } from "react"
import type { GridRowSelectionModel } from "@mui/x-data-grid"

export type RowSelectionState = {
  model: GridRowSelectionModel
  onModelChange: (model: GridRowSelectionModel) => void
  singleId: string | null
}

const EMPTY: GridRowSelectionModel = { type: "include", ids: new Set() }

export function useRowSelection(): RowSelectionState {
  const [model, setModel] = useState<GridRowSelectionModel>(EMPTY)

  const [first] = model.ids
  const singleId =
    model.type === "include" && model.ids.size === 1 && first !== undefined
      ? String(first)
      : null

  return { model, onModelChange: setModel, singleId }
}
