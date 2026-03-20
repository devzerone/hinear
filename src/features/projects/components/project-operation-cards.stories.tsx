import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  CreateProjectFormCard,
  CreateProjectNextStepsCard,
  InvitationAcceptCard,
  ProjectAccessCard,
} from "@/features/projects/components/project-operation-cards";

function ProjectOperationsShowcase() {
  return (
    <div className="flex w-[1540px] flex-col gap-6">
      <div className="grid justify-center gap-6 xl:grid-cols-[728px_392px]">
        <CreateProjectFormCard defaultType="team" />
        <CreateProjectNextStepsCard projectType="team" />
      </div>

      <div className="grid justify-center gap-6 xl:grid-cols-[920px_560px]">
        <ProjectAccessCard />
        <InvitationAcceptCard
          acceptHref="/projects/new"
          declineHref="/"
          expiresAt="Mar 27, 2026"
          invitedBy="Alex Kim"
          projectName="Hinear"
          projectType="team"
        />
      </div>
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
