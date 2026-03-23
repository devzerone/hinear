import { Skeleton } from "@/components/atoms/Skeleton";

export default function InviteLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[720px] items-center px-4 py-10">
      <section className="flex w-full flex-col gap-4 rounded-[28px] border border-[#E6E8EC] bg-white p-7 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-10 w-72 rounded-[16px]" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-full rounded-[12px]" />
          <Skeleton className="h-5 w-[84%] rounded-[12px]" />
        </div>
        <div className="rounded-[18px] border border-[#E6E8EC] bg-[#FCFCFD] p-[18px]">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-40 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-44 rounded-full" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 flex-1 rounded-[12px]" />
          <Skeleton className="h-11 w-[140px] rounded-[12px]" />
        </div>
      </section>
    </main>
  );
}
