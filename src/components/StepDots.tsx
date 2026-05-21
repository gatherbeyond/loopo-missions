export function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      <p className="text-sm text-muted-foreground">
        Step {current} of {total}
      </p>
      <div className="flex gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i < current ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
