export default function Loading() {
  return (
    <main className="mx-container pt-5 pb-16">
      <div className="mx-panel p-5">
        <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-10 w-full animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-10 w-[86%] animate-pulse rounded bg-white/10" />
        <div className="mt-6 aspect-[16/9] w-full animate-pulse rounded-2xl bg-white/10" />
      </div>
    </main>
  );
}

