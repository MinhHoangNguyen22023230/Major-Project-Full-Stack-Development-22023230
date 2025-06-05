import { redirect } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import React from "react";
import { Loader2 } from "lucide-react";

export function LogoutButton({ children, className }: { children?: React.ReactNode; className?: string }) {
  const deleteSession = trpc.adminSession.deleteAdminSession.useMutation();

  const handleLogout = async () => {
    await deleteSession.mutateAsync();
    redirect("/");
  };

  return (
    <button onClick={handleLogout} disabled={deleteSession.status === 'pending'} className={className}>
      {children || (deleteSession.status === 'pending' ? <Loader2 className="animate-spin" /> : "Logout")}
    </button>
  );
}
