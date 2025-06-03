"use client";

import ComponentCard from '@/components/ui/ComponentCard';
import Link from 'next/link';
import { useSidebar } from '@/app/SidebarContext';

export default function Dashboard() {
  const { isOpen } = useSidebar();

  return (
        <ComponentCard
            className={`main-section ${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
            title="Admin Dashboard"
        >
          <div>
            
          </div>
        </ComponentCard>
  );
}