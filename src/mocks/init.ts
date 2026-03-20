if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_API_MOCKING === "enabled"
) {
  import("./browser").then(({ worker }) => {
    worker.start({
      onUnhandledRequest: "bypass",
    });
  });
}
