import type { SupabaseClient } from "@supabase/supabase-js";

export interface NotificationPreferences {
  user_id: string;
  issue_assigned: boolean;
  issue_status_changed: boolean;
  comment_added: boolean;
  project_invited: boolean;
  created_at: string;
  updated_at: string;
}

export class SupabaseNotificationPreferencesRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * 사용자의 알림 설정을 조회합니다 (없으면 기본값 생성)
   */
  async getPreferences(
    userId: string
  ): Promise<NotificationPreferences | null> {
    // RPC 함수 호출로 get_or_create_notification_preferences 사용
    const { data, error } = await this.supabase.rpc(
      "get_or_create_notification_preferences",
      {
        p_user_id: userId,
      }
    );

    if (error) {
      console.error("Failed to get preferences:", error);
      return null;
    }

    return data;
  }

  /**
   * 사용자의 알림 설정을 업데이트합니다
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<
      Pick<
        NotificationPreferences,
        | "issue_assigned"
        | "issue_status_changed"
        | "comment_added"
        | "project_invited"
      >
    >
  ): Promise<NotificationPreferences | null> {
    const { data, error } = await this.supabase
      .from("notification_preferences")
      .update({
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Failed to update preferences:", error);
      return null;
    }

    return data;
  }
}
