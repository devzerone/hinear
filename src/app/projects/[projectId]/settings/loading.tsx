import { Skeleton } from "@/components/atoms/Skeleton";

const SETTINGS_NAV_SKELETON_IDS = [
  "general",
  "access",
  "members",
  "danger",
] as const;
const NOTIFICATION_TOGGLE_SKELETON_IDS = [
  "issue-assigned",
  "status-changed",
  "comment-added",
  "project-invited",
] as const;

export default function ProjectSettingsLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="hidden md:flex md:min-h-screen">
        <aside className="w-[240px] shrink-0 border-r border-[#1C1F26] bg-[#111318] px-4 pt-6 pb-6">
          <div className="flex h-full flex-col gap-7">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-[#5E6AD2]" />
              <Skeleton className="h-4 w-20 bg-[#2A3140]" shimmer={false} />
            </div>
            <div className="space-y-2">
              <Skeleton
                className="h-10 w-full rounded-[12px] bg-[#1C1F26]"
                shimmer={false}
              />
              <Skeleton
                className="h-10 w-full rounded-[12px] bg-[#1C1F26]"
                shimmer={false}
              />
              <Skeleton
                className="h-10 w-full rounded-[12px] bg-[#232936]"
                shimmer={false}
              />
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 bg-[#FCFCFD] p-6">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
            <section className="flex flex-col gap-2">
              <Skeleton className="h-3 w-28 rounded-full" />
              <Skeleton className="h-10 w-[360px] max-w-full rounded-[16px]" />
              <Skeleton className="h-5 w-full max-w-[560px] rounded-[12px]" />
              <Skeleton className="h-5 w-[82%] max-w-[460px] rounded-[12px]" />
            </section>

            <div className="flex flex-col gap-6 xl:flex-row">
              <aside className="w-full shrink-0 rounded-[20px] border border-[#E6E8EC] bg-white p-4 xl:w-[240px]">
                <div className="flex flex-col gap-2">
                  {SETTINGS_NAV_SKELETON_IDS.map((sectionId) => (
                    <Skeleton
                      key={sectionId}
                      className="h-10 w-full rounded-[12px]"
                    />
                  ))}
                </div>
              </aside>

              <section className="flex min-w-0 flex-1 flex-col gap-5 rounded-[24px] border border-[#E6E8EC] bg-white p-6">
                <section className="rounded-[20px] border border-[var(--app-color-border-muted)] bg-white p-6">
                  <div className="flex flex-col gap-5">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-4 w-full max-w-[480px] rounded-full" />
                      <Skeleton className="h-4 w-[74%] max-w-[420px] rounded-full" />
                    </div>
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24 rounded-full" />
                          <Skeleton className="h-11 w-full rounded-[10px]" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-20 rounded-full" />
                          <Skeleton className="h-11 w-[180px] rounded-[10px]" />
                        </div>
                      </div>
                      <div className="rounded-[20px] border border-[#E6E8EC] bg-[#FAFBFD] p-4">
                        <div className="space-y-3">
                          <Skeleton className="h-[88px] w-full rounded-[16px]" />
                          <Skeleton className="h-[88px] w-full rounded-[16px]" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-[#E6E8EC] pt-4">
                      <Skeleton className="h-4 w-[260px] rounded-full" />
                      <Skeleton className="h-10 w-[160px] rounded-[12px]" />
                    </div>
                    <div className="rounded-[20px] border border-[#FECACA] bg-[#FFF7F7] p-5">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-28 rounded-full bg-[#FAD4D4]" />
                        <Skeleton className="h-4 w-full max-w-[420px] rounded-full bg-[#FCE4E4]" />
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <Skeleton className="h-20 w-full rounded-[16px] bg-white" />
                        <Skeleton className="h-20 w-full rounded-[16px] bg-white" />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-[18px] border border-[#E6E8EC] bg-white p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-[150px] w-full rounded-[16px]" />
                    <Skeleton className="h-12 w-full rounded-[12px]" />
                    <Skeleton className="h-[84px] w-full rounded-[14px]" />
                    <Skeleton className="h-11 w-full rounded-[12px]" />
                    <Skeleton className="h-[84px] w-full rounded-[14px]" />
                  </div>
                </section>

                <section className="rounded-[16px] border border-[#E6E8EC] p-5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-4 w-64 rounded-full" />
                    </div>
                    <Skeleton className="h-[52px] w-full rounded-[12px]" />
                    <div className="rounded-lg border border-[var(--app-color-border-soft)] bg-[var(--app-color-surface-50)] p-4">
                      <div className="space-y-3">
                        {NOTIFICATION_TOGGLE_SKELETON_IDS.map((toggleId) => (
                          <div
                            key={toggleId}
                            className="flex items-center justify-between"
                          >
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-28 rounded-full" />
                              <Skeleton className="h-3 w-44 rounded-full" />
                            </div>
                            <Skeleton className="h-6 w-11 rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
