"use client";

import ComponentCard from '@/components/ui/ComponentCard';
import { useSidebar } from '@/app/SidebarContext';
import Welcome from '@/components/Dashboard/Welcome';

export default function Dashboard() {
  const { isOpen } = useSidebar();

  return (
    <ComponentCard
      className={` ${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
      title="Admin Dashboard"
    >
      <div className="mx-auto main-section">
        <Welcome />
      </div>
    </ComponentCard>
  );
}