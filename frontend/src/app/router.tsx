import { createBrowserRouter, Navigate } from "react-router"
import App from "../App"
import ErrorState from "../components/feedback/ErrorState"
import EmptyState from "../components/feedback/EmptyState"
import LoadingState from "../components/feedback/LoadingState"
import TodoState from "../components/feedback/TodoState"

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    ErrorBoundary: ErrorState,
    children: [
      { index: true, element: <Navigate to="/users" replace /> },
      {
        path: "users",
        lazy: {
          Component: () =>
            import("../features/users/UsersPage").then((m) => m.default),
        },
        HydrateFallback: LoadingState,
      },
      {
        path: "tools",
        lazy: {
          Component: () =>
            import("../features/tools/ToolsPage").then((m) => m.default),
        },
        HydrateFallback: LoadingState,
      },
      { path: "analytics", Component: () => <TodoState title={"Analytics"} /> },
      { path: "overview", Component: () => <TodoState title={"Overview"} /> },
      { path: "reports", Component: () => <TodoState title={"Reports"} /> },
      { path: "profile", Component: () => <TodoState title={"Profile"} /> },
      { path: "logout", Component: () => <TodoState title={"Logout"} /> },

      {
        path: "privacy",
        Component: () => <TodoState title={"Privacy Policy"} />,
      },
      {
        path: "terms",
        Component: () => <TodoState title={"Terms of Service"} />,
      },
      { path: "*", Component: EmptyState },
    ],
  },
])

export default router
