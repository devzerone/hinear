import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CountBadge } from "@/components/atoms/CountBadge";

const meta = {
  component: CountBadge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    count: 2,
  },
} satisfies Meta<typeof CountBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DoubleDigit: Story = {
  args: {
    count: 12,
  },
};

export const LargeCount: Story = {
  args: {
    count: 124,
  },
};
