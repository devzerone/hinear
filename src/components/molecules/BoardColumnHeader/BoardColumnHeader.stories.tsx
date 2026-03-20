import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BoardColumnHeader } from "@/components/molecules/BoardColumnHeader";

const meta = {
  component: BoardColumnHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    count: 2,
    title: "Triage",
  },
  decorators: [
    (Story) => (
      <div className="w-[208px] rounded-[14px] border border-[var(--app-color-surface-150,#ECEEF2)] bg-[var(--app-color-surface-100,#F7F8FA)] p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BoardColumnHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LargerCount: Story = {
  args: {
    count: 12,
    title: "Backlog",
  },
};
