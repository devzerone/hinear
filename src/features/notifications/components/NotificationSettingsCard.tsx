"use client";

import { useCallback, useEffect, useState } from "react";
import type { NotificationPreferences } from "@/features/notifications/repositories/supabase-notification-preferences-repository";
import { NotificationPermissionButton } from "./NotificationPermissionButton";

interface NotificationToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function NotificationToggle({
  label,
  description,
  enabled,
  onChange,
}: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-[var(--app-color-ink-900)]">
          {label}
        </span>
        <span className="text-xs text-[var(--app-color-gray-600)]">
          {description}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--app-color-primary-500)] focus:ring-offset-2 ${
          enabled
            ? "bg-[var(--app-color-primary-500)]"
            : "bg-[var(--app-color-gray-200)]"
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function NotificationSettingsCard() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPreferences = useCallback(async () => {
    try {
      // TODO: 실제 API 호출로 대체
      // const response = await fetch("/api/notifications/preferences");
      // const data = await response.json();
      // setPreferences(data);

      // 임시 mock 데이터
      setPreferences({
        user_id: "",
        issue_assigned: true,
        issue_status_changed: true,
        comment_added: true,
        project_invited: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreference = useCallback(
    async (key: keyof NotificationPreferences, value: boolean) => {
      if (!preferences) return;

      const updated = { ...preferences, [key]: value };
      setPreferences(updated);
      setSaving(true);

      try {
        // TODO: 실제 API 호출로 대체
        // await fetch("/api/notifications/preferences", {
        //   method: "PATCH",
        //   body: JSON.stringify({ [key]: value }),
        // });

        // 임시 지연
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Failed to update preference:", error);
        // 실패 시 롤백
        setPreferences(preferences);
      } finally {
        setSaving(false);
      }
    },
    [preferences]
  );

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 rounded-[16px] border border-[#E6E8EC] p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-[16px] font-semibold text-[#111318]">
            알림 설정
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-[var(--app-color-gray-600)]">
            로딩 중...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[#E6E8EC] p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-[16px] font-semibold text-[#111318]">알림 설정</h2>
        <p className="text-[13px] text-[#6B7280]">
          이슈 변경, 댓글, 프로젝트 초대 등의 알림을 실시간으로 받아보세요.
          {saving && " 저장 중..."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <NotificationPermissionButton />

        <div className="flex flex-col gap-3 rounded-lg border border-[var(--app-color-border-soft)] bg-[var(--app-color-surface-50)] p-4">
          {preferences && (
            <>
              <NotificationToggle
                label="이슈 할당 알림"
                description="다른 사용자가 이슈를 할당했을 때"
                enabled={preferences.issue_assigned}
                onChange={(enabled) =>
                  updatePreference("issue_assigned", enabled)
                }
              />
              <NotificationToggle
                label="상태 변경 알림"
                description="이슈 상태가 변경되었을 때"
                enabled={preferences.issue_status_changed}
                onChange={(enabled) =>
                  updatePreference("issue_status_changed", enabled)
                }
              />
              <NotificationToggle
                label="댓글 알림"
                description="새 댓글이 추가되었을 때"
                enabled={preferences.comment_added}
                onChange={(enabled) =>
                  updatePreference("comment_added", enabled)
                }
              />
              <NotificationToggle
                label="프로젝트 초대 알림"
                description="새 프로젝트에 초대되었을 때"
                enabled={preferences.project_invited}
                onChange={(enabled) =>
                  updatePreference("project_invited", enabled)
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
