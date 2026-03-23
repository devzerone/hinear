"use client";

import { NotificationPermissionButton } from "./NotificationPermissionButton";

export function NotificationSettingsCard() {
  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[#E6E8EC] p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-[16px] font-semibold text-[#111318]">알림 설정</h2>
        <p className="text-[13px] text-[#6B7280]">
          이슈 변경, 댓글, 프로젝트 초대 등의 알림을 실시간으로 받아보세요.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <NotificationPermissionButton />

        <div className="flex flex-col gap-2 rounded-lg border border-[var(--app-color-border-soft)] bg-[var(--app-color-surface-50)] p-3">
          <p className="text-xs font-semibold text-[var(--app-color-ink-900)]">
            알림 종류
          </p>
          <ul className="flex flex-col gap-1 text-xs text-[var(--app-color-gray-600)]">
            <li>• 이슈 할당 알림</li>
            <li>• 이슈 상태 변경 알림</li>
            <li>• 댓글 추가 알림</li>
            <li>• 프로젝트 초대 알림</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
