export function AtmosphereBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cosmic-pulse/10 blur-[120px]" />
      <div className="absolute top-1/2 -left-48 h-96 w-96 rounded-full bg-cosmic-deep/20 blur-[120px]" />
      <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-cosmic-pulse/5 blur-[100px]" />
    </div>
  );
}
