"use client";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

export default function UserPage() {
    const { data: users, isLoading, error } = trpc.crud.getUsers.useQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">Error: {error.message}</div>;
    if (!users || users.length === 0) return <div className="p-8">No users found.</div>;
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Users</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">Username</th>
                            <th className="px-4 py-2 border">Email</th>
                            <th className="px-4 py-2 border">Image</th>
                            <th className="px-4 py-2 border">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map((user) => (
                            <tr key={user.id} className="even:bg-gray-50">
                                <td className="px-4 py-2 border">{user.id}</td>
                                <td className="px-4 py-2 border">{user.username}</td>
                                <td className="px-4 py-2 border">{user.email}</td>
                                <td className="px-4 py-2 border">{user.imgUrl}</td>
                                <td className="px-4 py-2 border">
                                    <Link href={`/dashboard/user/${user.id}`} className="text-blue-600 underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}