import type { NotificationData } from "@/features/notifications/types";

/**
 * 이슈 할당 알림 전송
 */
export async function triggerIssueAssignedNotification(data: {
  issueId: string;
  issueIdentifier: string;
  projectId: string;
  actor: { id: string; name: string };
}): Promise<void> {
  const notificationData: NotificationData = {
    type: "issue_assigned",
    issueId: data.issueId,
    issueIdentifier: data.issueIdentifier,
    projectId: data.projectId,
    actor: data.actor,
  };

  await sendNotification(notificationData);
}

/**
 * 이슈 상태 변경 알림 전송
 */
export async function triggerIssueStatusChangedNotification(data: {
  issueId: string;
  issueIdentifier: string;
  projectId: string;
  previousStatus: string;
  newStatus: string;
  actor?: { id: string; name: string };
}): Promise<void> {
  const notificationData: NotificationData = {
    type: "issue_status_changed",
    issueId: data.issueId,
    issueIdentifier: data.issueIdentifier,
    projectId: data.projectId,
    actor: data.actor,
    data: {
      previousStatus: data.previousStatus,
      newStatus: data.newStatus,
    },
  };

  await sendNotification(notificationData);
}

/**
 * 댓글 추가 알림 전송
 */
export async function triggerCommentAddedNotification(data: {
  issueId: string;
  issueIdentifier: string;
  projectId: string;
  commentId: string;
  commentAuthor: string;
  commentPreview: string;
  actor: { id: string; name: string };
}): Promise<void> {
  const notificationData: NotificationData = {
    type: "comment_added",
    issueId: data.issueId,
    issueIdentifier: data.issueIdentifier,
    projectId: data.projectId,
    actor: data.actor,
    data: {
      commentId: data.commentId,
      commentAuthor: data.commentAuthor,
      commentPreview: data.commentPreview,
    },
  };

  await sendNotification(notificationData);
}

/**
 * 프로젝트 초대 알림 전송
 */
export async function triggerProjectInvitedNotification(data: {
  projectId: string;
  projectName: string;
  invitedBy: string;
  role: "owner" | "member";
}): Promise<void> {
  const notificationData: NotificationData = {
    type: "project_invited",
    projectId: data.projectId,
    projectName: data.projectName,
    data: {
      invitedBy: data.invitedBy,
      role: data.role,
    },
  };

  await sendNotification(notificationData);
}

/**
 * 알림 API 호출
 */
async function sendNotification(data: NotificationData): Promise<void> {
  try {
    const response = await fetch("/api/notifications/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error("Failed to send notification:", await response.text());
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}
