import webpush from "web-push";
import type { PushSubscription } from "@/features/notifications/types";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";

webpush.setVapidDetails(
  "mailto:notifications@hinear.local",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// 구독 정보 저장 (간단한 메모리 저장 - 실제로는 DB에 저장)
const subscriptions: Map<string, PushSubscription> = new Map();

export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    // 구독 정보 저장
    const subscriptionKey = JSON.stringify(subscription);
    subscriptions.set(subscriptionKey, subscription);

    return Response.json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscription error:", error);
    return Response.json(
      { success: false, error: "Failed to subscribe" },
      { status: 400 }
    );
  }
}
