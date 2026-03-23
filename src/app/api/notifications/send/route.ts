import { revalidatePath } from "next/cache";
import webpush from "web-push";
import { SupabaseNotificationPreferencesRepository } from "@/features/notifications/repositories/supabase-notification-preferences-repository";
import { SupabasePushSubscriptionsRepository } from "@/features/notifications/repositories/supabase-push-subscriptions-repository";
import type {
  NotificationData,
  PushSubscription,
} from "@/features/notifications/types";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const NOTIFICATION_PUBLIC_KEY = process.env.NOTIFICATION_PUBLIC_KEY ?? "";

webpush.setVapidDetails(
  "mailto:notifications@hinear.local",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export async function POST(request: Request) {
  try {
    const notificationData: NotificationData = await request.json();

    // 알림 페이로드 생성
    const payload = createNotificationPayload(notificationData);

    // 대상 사용자 ID 목록 추출
    const targetUserIds = extractTargetUserIds(notificationData);

    if (targetUserIds.length === 0) {
      return Response.json({
        success: true,
        sent: 0,
        failed: 0,
        message: "No target users",
      });
    }

    // Repository로부터 활성 구독 조회
    const subscriptionRepo = new SupabasePushSubscriptionsRepository();
    const subscriptions =
      await subscriptionRepo.getActiveSubscriptions(targetUserIds);

    // 알림 설정 확인 (선택적 - 여기서는 간단히 모두 전송)
    const preferencesRepo = new SupabaseNotificationPreferencesRepository();

    // 필터링된 구독자 목록 (알림 설정 고려)
    const filteredSubscriptions = await filterSubscriptionsByPreferences(
      subscriptions,
      targetUserIds,
      notificationData.type,
      preferencesRepo
    );

    // 알림 전송
    let successCount = 0;
    let failCount = 0;

    for (const subscription of filteredSubscriptions) {
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload), {
          vapidDetails: {
            subject: "mailto:notifications@hinear.local",
            publicKey: NOTIFICATION_PUBLIC_KEY,
            privateKey: VAPID_PRIVATE_KEY,
          },
          TTL: 3600,
        });
        successCount++;
      } catch (error) {
        console.error("Failed to send notification:", error);
        failCount++;
      }
    }

    // 관련 페이지 캐시 무효화
    if (notificationData.issueId) {
      revalidatePath(
        `/projects/${notificationData.projectId}/issues/${notificationData.issueId}`
      );
    }

    return Response.json({
      success: true,
      sent: successCount,
      failed: failCount,
    });
  } catch (error) {
    console.error("Notification error:", error);
    return Response.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

/**
 * 알림 데이터로부터 대상 사용자 ID 목록을 추출합니다
 */
function extractTargetUserIds(data: NotificationData): string[] {
  // 이슈 관련 알림: 이슈 담당자, 프로젝트 멤버 등
  // 프로젝트 초대: 초대받은 사용자
  // 실제 구현에서는 DB 조회가 필요할 수 있음
  // 지금은 간단히 data에 포함된 actor 등을 사용
  if (data.actor?.id) {
    return [data.actor.id];
  }

  // 프로젝트 초대의 경우 별도 처리 필요
  if (data.type === "project_invited") {
    // 초대받은 사용자 ID를 반환해야 함
    // 현재는 데이터 구조상 확인 필요
    return [];
  }

  return [];
}

/**
 * 알림 설정에 따라 구독을 필터링합니다
 */
async function filterSubscriptionsByPreferences(
  subscriptions: PushSubscription[],
  _userIds: string[],
  _notificationType: NotificationData["type"],
  _preferencesRepo: SupabaseNotificationPreferencesRepository
): Promise<PushSubscription[]> {
  // 간단한 구현: 모든 구독을 반환 (실제로는 사용자별 설정 확인)
  // TODO: 사용자별 알림 설정 확인 및 필터링
  return subscriptions;
}

function createNotificationPayload(data: NotificationData) {
  const { type, issueIdentifier, actor } = data;

  switch (type) {
    case "issue_assigned":
      return {
        title: "이슈 할당 알림",
        body: `${actor?.name || "사용자"}님이 ${issueIdentifier}를 당신에게 할당했습니다.`,
        icon: "/icon.svg",
        tag: `issue-${data.issueId}-assigned`,
        data,
      };

    case "issue_updated":
      return {
        title: "이슈 변경 알림",
        body: `${actor?.name || "사용자"}님이 ${issueIdentifier}를 변경했습니다.`,
        icon: "/icon.svg",
        tag: `issue-${data.issueId}-updated`,
        data,
      };

    case "issue_status_changed": {
      const { previousStatus, newStatus } = data.data as {
        previousStatus: string;
        newStatus: string;
      };
      return {
        title: "상태 변경 알림",
        body: `${issueIdentifier}가 '${previousStatus}'에서 '${newStatus}'(으)로 변경되었습니다.`,
        icon: "/icon.svg",
        tag: `issue-${data.issueId}-status`,
        data,
      };
    }

    case "comment_added":
      return {
        title: "댓글 알림",
        body: `${actor?.name || "사용자"}님이 ${issueIdentifier}에 댓글을 남겼습니다.`,
        icon: "/icon.svg",
        tag: `issue-${data.issueId}-comment`,
        data,
      };

    case "project_invited":
      return {
        title: "프로젝트 초대 알림",
        body: `${data.projectName} 프로젝트에 초대되었습니다.`,
        icon: "/icon.svg",
        tag: `project-${data.projectId}-invited`,
        data,
      };

    default:
      return {
        title: "Hinear 알림",
        body: "새로운 알림이 있습니다.",
        icon: "/icon.svg",
        data,
      };
  }
}
