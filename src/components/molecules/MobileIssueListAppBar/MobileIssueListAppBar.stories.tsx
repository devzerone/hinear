import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MobileIssueListAppBar } from "@/components/molecules/MobileIssueListAppBar";

const meta = {
  component: MobileIssueListAppBar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    subtitle: "Issue board",
    title: "Web App",
  },
  decorators: [
    (Story) => (
      <div className="w-[361px] rounded-[24px] bg-[var(--app-color-surface-0)] p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MobileIssueListAppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
