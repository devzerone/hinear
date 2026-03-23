// PWA Service Worker for push notifications
self.addEventListener("install", (_event) => {
  console.log("[Service Worker] Install");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activate");
  event.waitUntil(self.clients.claim());
});

// Push notification event
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received");

  let notificationData = {
    title: "Hinear 알림",
    body: "새로운 알림이 있습니다.",
    icon: "/icon.svg",
  };

  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (error) {
    console.error("[Service Worker] Error parsing push data:", error);
  }

  const options = {
    body: notificationData.body || "",
    icon: notificationData.icon || "/icon.svg",
    badge: "/icon.svg",
    tag: notificationData.tag,
    data: notificationData.data,
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification click received");

  event.notification.close();

  const data = event.notification.data;

  if (data) {
    // Navigate to relevant page based on notification type
    let url = "/";

    if (data.issueId && data.projectId) {
      url = `/projects/${data.projectId}/issues/${data.issueId}`;
    } else if (data.projectId) {
      url = `/projects/${data.projectId}`;
    }

    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // Open new window if no existing window
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
    );
  }
});
