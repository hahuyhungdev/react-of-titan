import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { AppProviders } from "./app/providers";
import "@/styles/tokens.css";
import "@/styles/typography.css";
import "@/styles/global.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return (
    <div
      className="spa-loading"
      style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}
    >
      <p style={{ fontFamily: "sans-serif", color: "#666" }}>Loading application...</p>
    </div>
  );
}
