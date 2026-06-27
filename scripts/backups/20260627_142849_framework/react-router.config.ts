import type { Config } from "@react-router/dev/config";

export default {
  // Use the src folder instead of the default app/ directory
  appDirectory: "src",
  // Disable Server-Side Rendering to enable client-only SPA mode
  ssr: false,
} satisfies Config;
