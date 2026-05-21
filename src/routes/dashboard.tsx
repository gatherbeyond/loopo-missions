import { createFileRoute, Link } from "@tanstack/react-router";
import { LoopoLogo } from "@/components/LoopoLogo";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <main className="min-h-screen px-5 py-6">
      <header className="mx-auto flex max-w-3xl items-center justify-between">
        <LoopoLogo className="h-10 w-auto" />
        <Link to="/" className="text-sm font-bold text-primary">Sign out</Link>
      </header>

      <section className="mx-auto mt-12 max-w-3xl text-center">
        <h1 className="text-4xl">Parent Dashboard</h1>
        <p className="mt-3 text-muted-foreground">
          Family setup complete. Mission creation and kid management coming next.
        </p>
      </section>
    </main>
  );
}
