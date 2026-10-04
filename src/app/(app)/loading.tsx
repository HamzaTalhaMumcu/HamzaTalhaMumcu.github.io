export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl animate-pulse px-6 py-10">
      <div className="h-5 w-28 rounded bg-[#e5e9e3]" />
      <div className="mt-8 h-36 rounded-[2rem] bg-[#dfe7df]" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => <div key={item} className="h-28 rounded-2xl bg-white shadow-sm" />)}
      </div>
      <div className="mt-8 h-14 rounded-xl bg-white shadow-sm" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => <div key={item} className="h-44 rounded-2xl bg-white shadow-sm" />)}
      </div>
    </main>
  );
}
