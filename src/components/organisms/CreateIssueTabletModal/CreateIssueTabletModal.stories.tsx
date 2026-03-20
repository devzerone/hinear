import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CreateIssueTabletModal } from "@/components/organisms/CreateIssueTabletModal";

const meta = {
  component: CreateIssueTabletModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-start justify-center bg-[rgba(15,23,42,0.32)] p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CreateIssueTabletModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultTitle: "Create Issue Modal에서 이슈 생성",
    defaultLabels: "auth, backend",
  },
};

export const Empty: Story = {
  args: {
    defaultDescription: "",
    defaultLabels: "",
    defaultTitle: "",
  },
};
