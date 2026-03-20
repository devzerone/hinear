import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AuthForm } from "@/components/organisms/AuthForm";

const meta = {
  component: AuthForm,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    subtitle: "Welcome back! Please enter your details.",
    title: "Sign in to your account",
    variant: "desktop",
  },
  decorators: [
    (Story) => (
      <div className="rounded-[28px] bg-[var(--app-color-surface-0)] p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AuthForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};

export const Tablet: Story = {
  args: {
    variant: "tablet",
  },
};

export const Mobile: Story = {
  args: {
    variant: "mobile",
  },
};
