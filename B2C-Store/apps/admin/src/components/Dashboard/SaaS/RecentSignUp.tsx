import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";

export default function RecentSignup() {
    const { data: users = [], isLoading } = trpc.crud.getUsers.useQuery();
    // Sort users by createdAt descending and take the 5 most recent
    const recent = users
        .filter(u => u.createdAt)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return (
        <div className="main-section p-4">
            <h2 className="mb-4 font-bold">Recent Signups</h2>
            {isLoading ? (
                <div className="flex justify-center items-center h-20">
                    <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
                </div>
            ) : (
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-gray-500 text-sm">
                            <th className="px-2 py-1">Username</th>
                            <th className="px-2 py-1">Email</th>
                            <th className="px-2 py-1">Signup Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recent.map(u => (
                            <tr key={u.id} className="bg-white hover:bg-gray-50 rounded shadow-sm">
                                <td className="px-2 py-1 font-medium">{u.username || "-"}</td>
                                <td className="px-2 py-1">{u.email || "-"}</td>
                                <td className="px-2 py-1 text-xs text-gray-600">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
