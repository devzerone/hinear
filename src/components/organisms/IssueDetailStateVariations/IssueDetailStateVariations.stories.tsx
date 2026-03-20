import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { IssueDetailStateVariations } from "@/components/organisms/IssueDetailStateVariations";

const meta = {
  component: IssueDetailStateVariations,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof IssueDetailStateVariations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
