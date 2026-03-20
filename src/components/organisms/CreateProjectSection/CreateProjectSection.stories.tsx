import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CreateProjectSection } from "@/components/organisms/CreateProjectSection";

const meta = {
  component: CreateProjectSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-[var(--app-color-white)] p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CreateProjectSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Team: Story = {};

export const Personal: Story = {
  args: {
    defaultType: "personal",
  },
};
