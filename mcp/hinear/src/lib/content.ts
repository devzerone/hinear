export function toTextContent(value: unknown) {
  return [
    {
      type: "text" as const,
      text: JSON.stringify(value, null, 2),
    },
  ];
}
