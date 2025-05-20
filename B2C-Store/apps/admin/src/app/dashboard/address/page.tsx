"use client";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";

export default function AddressPage() {
    const { data: addresses, isLoading, error } = trpc.crud.getAddresses.useQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">Error: {error.message}</div>;
    if (!addresses || addresses.length === 0) return <div className="p-8">No addresses found.</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Addresses</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">User ID</th>
                            <th className="px-4 py-2 border">Address</th>
                            <th className="px-4 py-2 border">City</th>
                            <th className="px-4 py-2 border">State</th>
                            <th className="px-4 py-2 border">Country</th>
                            <th className="px-4 py-2 border">Zip Code</th>
                            <th className="px-4 py-2 border">Is Default</th>
                            <th className="px-4 py-2 border">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {addresses?.map((address) => (
                            <tr key={address.id} className="even:bg-gray-50">
                                <td className="px-4 py-2 border">{address.id}</td>
                                <td className="px-4 py-2 border">{address.userId}</td>
                                <td className="px-4 py-2 border">{address.address}</td>
                                <td className="px-4 py-2 border">{address.city}</td>
                                <td className="px-4 py-2 border">{address.state}</td>
                                <td className="px-4 py-2 border">{address.country}</td>
                                <td className="px-4 py-2 border">{address.zipCode}</td>
                                {/* <td className="px-4 py-2 border">{address.isDefault ? "Yes" : "No"}</td> */}
                                <td className="px-4 py-2 border">
                                    <Link href={`/address/${address.id}`} className="text-blue-600 underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}