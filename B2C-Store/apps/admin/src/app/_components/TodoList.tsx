"use client";

import { trpc } from "../_trpc/client";

export default function TodoList() {
    const getBrands = trpc.getBrands.useQuery(); // Call the fixed procedure

    return (
        <div>
            {getBrands.isLoading && <p>Loading...</p>}
            {getBrands.error && <p>Error: {getBrands.error.message}</p>}
            {getBrands.data && (
                <ul>
                    {getBrands.data.map((brand) => (
                        <li key={brand.id}>{brand.name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}