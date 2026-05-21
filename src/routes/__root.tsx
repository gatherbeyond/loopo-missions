import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-muted-foreground">This page doesn't exist.</p>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-full bg-primary px-5 py-2 text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Raise Kids Who Understand Money Early" },
      { name: "description", content: "Most kids learn to spend before they earn. Loopo helps parents build real money habits through tasks, saving, and daily decisions." },
      { property: "og:title", content: "Raise Kids Who Understand Money Early" },
      { name: "twitter:title", content: "Raise Kids Who Understand Money Early" },
      { property: "og:description", content: "Most kids learn to spend before they earn. Loopo helps parents build real money habits through tasks, saving, and daily decisions." },
      { name: "twitter:description", content: "Most kids learn to spend before they earn. Loopo helps parents build real money habits through tasks, saving, and daily decisions." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/MPsCWsDbpsbk9yxdgVfLBSMHiEV2/social-images/social-1779342077834-Screenshot_2026-05-21_at_1.41.09_PM.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/MPsCWsDbpsbk9yxdgVfLBSMHiEV2/social-images/social-1779342077834-Screenshot_2026-05-21_at_1.41.09_PM.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen lg:py-6 lg:bg-[radial-gradient(circle_at_top,#EDE4FF,#F5F3FF_60%,#FAFAFA)]">
        <div className="mx-auto bg-background min-h-screen lg:min-h-[calc(100vh-3rem)] lg:max-w-[460px] lg:rounded-[2.5rem] lg:shadow-[0_30px_80px_-20px_rgba(98,0,230,0.35)] lg:overflow-hidden relative">
          <Outlet />
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
