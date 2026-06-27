import { RouterProvider } from "react-router";
import { router } from "./router";
import { AppProviders } from "./providers";

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
