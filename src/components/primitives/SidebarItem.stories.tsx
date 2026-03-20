import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Circle, Folder, Layers } from "lucide-react";

import { SidebarItem } from "@/components/primitives/SidebarItem";

function SidebarItemPreview() {
  return (
    <div className="flex w-[280px] flex-col gap-3 rounded-[16px] bg-[var(--color-ink-900)] p-6">
      <SidebarItem icon={<Layers className="h-4 w-4" />} label="Issues" />
      <SidebarItem
        active
        icon={<Circle className="h-4 w-4 fill-current stroke-none" />}
        label="Active"
      />
      <SidebarItem
        icon={<Folder className="h-4 w-4" />}
        kind="project"
        label="Mobile App"
      />
      <SidebarItem
        active
        icon={<Folder className="h-4 w-4" />}
        kind="project"
        label="Web App"
      />
    </div>
  );
}

const meta = {
  component: SidebarItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    icon: <Layers className="h-4 w-4" />,
    label: "Issues",
  },
} satisfies Meta<typeof SidebarItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NavDefault: Story = {};

export const NavActive: Story = {
  args: {
    active: true,
    icon: <Circle className="h-4 w-4 fill-current stroke-none" />,
    label: "Active",
  },
};

export const ProjectDefault: Story = {
  args: {
    icon: <Folder className="h-4 w-4" />,
    kind: "project",
    label: "Mobile App",
  },
};

export const ProjectActive: Story = {
  args: {
    active: true,
    icon: <Folder className="h-4 w-4" />,
    kind: "project",
    label: "Web App",
  },
};

export const PenPreview: StoryObj<typeof SidebarItemPreview> = {
  render: () => <SidebarItemPreview />,
  parameters: {
    controls: {
      disable: true,
    },
  },
};
