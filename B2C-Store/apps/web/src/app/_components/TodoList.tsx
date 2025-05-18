"use client";

import { trpc } from "../_trpc/client";

export default function TodoList() {
    const getBrands = trpc.getBrands.useQuery(); // Fetch brands
    const getProducts = trpc.getProducts.useQuery(); // Fetch products
    const getUsers = trpc.getUsers.useQuery(); // Fetch users

    return (
        <div>
            <h2>Brands</h2>
            {getBrands.isLoading && <p>Loading...</p>}
            {getBrands.error && <p>Error: {getBrands.error.message}</p>}
            {getBrands.data && (
                <ul>
                    {getBrands.data.map((brand) => (
                        <li key={brand.id}>{brand.name}</li>
                    ))}
                </ul>
            )}

            <h2>Products</h2>
            {getProducts.isLoading && <p>Loading...</p>}
            {getProducts.error && <p>Error: {getProducts.error.message}</p>}
            {getProducts.data && (
                <ul>
                    {getProducts.data.map((product) => (
                        <li key={product.id}>{product.name}</li>
                    ))}
                </ul>
            )}

            <h2>Users</h2>
            {getUsers.isLoading && <p>Loading...</p>}
            {getUsers.error && <p>Error: {getUsers.error.message}</p>}
            {getUsers.data && (
                <ul>
                    {getUsers.data.map((user) => (
                        <li key={user.id}>{user.username}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}