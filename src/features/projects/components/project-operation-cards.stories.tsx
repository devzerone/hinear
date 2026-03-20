import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CreateProjectSection } from "@/components/organisms/CreateProjectSection";
import { ProjectOperationsSection } from "@/components/organisms/ProjectOperationsSection";

function ProjectOperationsShowcase() {
  return (
    <div className="flex w-[1540px] flex-col gap-6">
      <CreateProjectSection />
      <ProjectOperationsSection />
    </div>
  );
}

const meta = {
  component: ProjectOperationsShowcase,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      disable: true,
    },
  },
} satisfies Meta<typeof ProjectOperationsShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
