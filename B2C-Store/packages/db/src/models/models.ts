// User model
export interface User {
    name: string;
    email: string;
    role: "admin" | "user";
    createdAt: Date;
}

// Product model
export interface Product {
    name: string;
    description: string;
    price: number;
    stock: number;
    createdAt: Date;
}

// Order model
export interface Order {
    userId: string;
    productIds: string[];
    totalAmount: number;
    createdAt: Date;
}