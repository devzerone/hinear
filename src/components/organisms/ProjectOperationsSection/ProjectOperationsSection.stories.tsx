import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ProjectOperationsSection } from "@/components/organisms/ProjectOperationsSection";

const meta = {
  component: ProjectOperationsSection,
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
} satisfies Meta<typeof ProjectOperationsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
