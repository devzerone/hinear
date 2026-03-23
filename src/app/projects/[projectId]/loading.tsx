import { Skeleton } from "@/components/atoms/Skeleton";

const BOARD_COLUMN_SKELETON_IDS = [
  "backlog",
  "todo",
  "in-progress",
  "done",
] as const;

export default function ProjectWorkspaceLoading() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <div className="hidden md:flex md:min-h-screen">
        <aside className="w-[240px] shrink-0 border-r border-[#1C1F26] bg-[#111318] px-4 pt-6 pb-6">
          <div className="flex h-full flex-col gap-7">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-[#5E6AD2]" />
              <Skeleton className="h-4 w-20 bg-[#2A3140]" shimmer={false} />
            </div>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-3 w-16 bg-[#2A3140]" shimmer={false} />
              <div className="space-y-2">
                <Skeleton
                  className="h-10 w-full rounded-[12px] bg-[#232936]"
                  shimmer={false}
                />
                <Skeleton
                  className="h-10 w-full rounded-[12px] bg-[#1C1F26]"
                  shimmer={false}
                />
                <Skeleton
                  className="h-10 w-full rounded-[12px] bg-[#1C1F26]"
                  shimmer={false}
                />
              </div>
            </div>
            <div className="mt-auto space-y-2 pt-4">
              <Skeleton
                className="h-9 w-full rounded-[10px] bg-[#232936]"
                shimmer={false}
              />
              <Skeleton
                className="h-10 w-full rounded-[12px] bg-[#1C1F26]"
                shimmer={false}
              />
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 bg-[#FCFCFD] p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 md:hidden">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[var(--app-color-brand-500)]" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-10 w-28 rounded-[12px]" />
            </div>

            <section className="rounded-[24px] border border-[#E6E8EC] bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-28 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-28 rounded-[12px]" />
                  <Skeleton className="h-10 w-28 rounded-[12px]" />
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.06)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-9 w-64 rounded-[16px]" />
                </div>
                <Skeleton className="hidden h-10 w-36 rounded-[12px] md:block" />
              </div>

              <div className="grid gap-4 xl:grid-cols-4">
                {BOARD_COLUMN_SKELETON_IDS.map((columnId) => (
                  <div
                    key={columnId}
                    className="rounded-[20px] border border-[#E6E8EC] bg-[#FAFBFD] p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <Skeleton className="h-5 w-28 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-[124px] w-full rounded-[18px]" />
                      <Skeleton className="h-[124px] w-full rounded-[18px]" />
                      <Skeleton className="h-11 w-full rounded-[14px]" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
