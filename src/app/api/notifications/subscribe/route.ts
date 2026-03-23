import { createClient } from "@supabase/supabase-js";
import { SupabasePushSubscriptionsRepository } from "@/features/notifications/repositories/supabase-push-subscriptions-repository";
import type { PushSubscription } from "@/features/notifications/types";

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
    );

    // 인증된 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription: PushSubscription = await request.json();
    const repository = new SupabasePushSubscriptionsRepository();

    // DB에 구독 정보 저장
    const result = await repository.subscribe(user.id, subscription);

    if (!result) {
      return Response.json(
        { success: false, error: "Failed to save subscription" },
        { status: 500 }
      );
    }

    return Response.json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscription error:", error);
    return Response.json(
      { success: false, error: "Failed to subscribe" },
      { status: 400 }
    );
  }
}
