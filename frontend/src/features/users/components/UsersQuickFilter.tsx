import CancelIcon from "@mui/icons-material/Cancel"
import SearchIcon from "@mui/icons-material/Search"
import { InputAdornment, TextField, Tooltip } from "@mui/material"
import { styled } from "@mui/material/styles"
import { MAX_SEARCH_LENGTH } from "../userFilters"
import {
  QuickFilter,
  QuickFilterClear,
  QuickFilterControl,
  QuickFilterTrigger,
  ToolbarButton,
} from "@mui/x-data-grid"

type OwnerState = {
  expanded: boolean
}

const StyledQuickFilter = styled(QuickFilter)({
  display: "grid",
  alignItems: "center",
})

const StyledToolbarButton = styled(ToolbarButton)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: "1 / 1",
    width: "min-content",
    height: "min-content",
    zIndex: 1,
    opacity: ownerState.expanded ? 0 : 1,
    pointerEvents: ownerState.expanded ? "none" : "auto",
    transition: theme.transitions.create(["opacity"]),
  })
)

const StyledTextField = styled(TextField)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: "1 / 1",
    overflowX: "clip",
    width: ownerState.expanded ? 260 : "var(--trigger-width)",
    opacity: ownerState.expanded ? 1 : 0,
    transition: theme.transitions.create(["width", "opacity"]),
  })
)

const parseSearch = (input: string) => (input.trim() ? [input.trim()] : [])
const formatSearch = (values: (string | number)[]) => String(values[0] ?? "")

export default function UsersQuickFilter() {
  return (
    <StyledQuickFilter
      parser={parseSearch}
      formatter={formatSearch}
      debounceMs={400}
    >
      <QuickFilterTrigger
        render={(triggerProps, state) => (
          <Tooltip title="Search" enterDelay={0}>
            <StyledToolbarButton
              {...triggerProps}
              ownerState={{ expanded: state.expanded }}
              color="default"
              aria-label="Search"
              aria-disabled={state.expanded}
            >
              <SearchIcon fontSize="small" />
            </StyledToolbarButton>
          </Tooltip>
        )}
      />
      <QuickFilterControl
        render={({ ref, ...controlProps }, state) => (
          <StyledTextField
            {...controlProps}
            ownerState={{ expanded: state.expanded }}
            inputRef={ref}
            placeholder="Search users…"
            size="small"
            slotProps={{
              ...controlProps.slotProps,
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: state.value ? (
                  <InputAdornment position="end">
                    <QuickFilterClear
                      edge="end"
                      size="small"
                      aria-label="Clear search"
                      style={{ marginRight: -6 }}
                    >
                      <CancelIcon fontSize="small" />
                    </QuickFilterClear>
                  </InputAdornment>
                ) : null,
                ...controlProps.slotProps?.input,
              },
              htmlInput: {
                "aria-label": "Search users by name or email",
                maxLength: MAX_SEARCH_LENGTH,
                ...controlProps.slotProps?.htmlInput,
              },
            }}
          />
        )}
      />
    </StyledQuickFilter>
  )
}
