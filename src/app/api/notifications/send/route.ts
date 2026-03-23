import { revalidatePath } from "next/cache";
import webpush from "web-push";
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

// 구독 정보 저장 (간단한 메모리 저장 - 실제로는 DB에 저장)
const subscriptions: Map<string, PushSubscription> = new Map();

export async function POST(request: Request) {
  try {
    const notificationData: NotificationData = await request.json();

    // 알림 페이로드 생성
    const payload = createNotificationPayload(notificationData);

    // 모든 구독자에게 알림 전송 (실제로는 대상 필터링 필요)
    let successCount = 0;
    let failCount = 0;

    for (const [key, subscription] of subscriptions.entries()) {
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

        // 실패한 구독은 제거
        subscriptions.delete(key);
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
