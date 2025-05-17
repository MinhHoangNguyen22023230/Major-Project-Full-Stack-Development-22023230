// User model
export interface User {
    userId: string;
    username: string;
    email: string;
    password: string; // Store hashed passwords only
    address: Address[];
    phoneNumber: string;
    createdAt: Date;
    updatedAt: Date;
    role: "admin" | "user"; // Role can be either admin or user
    profilePictureUrl?: string; // Optional URL to the user's profile picture
    wishlist: string[]; // Array of product IDs
    orders: string[]; // Array of order IDs
    cartId: string; // Reference to the user's cart
    reviews: string[]; // Array of review IDs
}

// Address model
export interface Address {
    addressId: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean; // Indicates if this is the default address
}

// Product model
export interface Product {
    productId: string;
    name: string;
    description: string;
    price: number;
    categoryId: string; // Reference to the category
    brandId: string; // Reference to the brand
    stock: number;
    createdAt: Date;
    updatedAt: Date;
    imageUrl: string; // URL to the product image
    ratings: number; // Average rating
    reviews: string[]; // Array of review IDs
}

// Order model
export interface Order {
    orderId: string;
    userId: string; // Reference to the user
    orderItems: OrderItem[];
    shippingAddress: Address; // Embedded shipping address
    totalAmount: number;
    orderDate: Date;
    orderStatus: "Pending" | "Shipped" | "Delivered" | "Cancelled";
}

// OrderItem model
export interface OrderItem {
    productId: string; // Reference to the product
    quantity: number;
    priceAtPurchase: number; // Price at the time of purchase
}

// Cart model
export interface Cart {
    cartId: string;
    userId: string; // Reference to the user
    items: CartItem[];
    createdAt: Date;
    updatedAt: Date;
}

// CartItem model
export interface CartItem {
    productId: string; // Reference to the product
    quantity: number;
}

// Brand model
export interface Brand {
    brandId: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    products: string[]; // Array of product IDs
}

// Category model
export interface Category {
    categoryId: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    products: string[]; // Array of product IDs
}

// Review model
export interface Review {
    reviewId: string;
    productId: string; // Reference to the product
    userId: string; // Reference to the user
    rating: number; // Rating out of 5
    comment: string;
    createdAt: Date;
    updatedAt: Date;
    replies: ReviewReply[]; // Array of replies
}

// ReviewReply model
export interface ReviewReply {
    replyId: string;
    reviewId: string; // Reference to the review
    userId: string; // Reference to the user
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

// Wishlist model
export interface Wishlist {
    wishlistId: string;
    userId: string; // Reference to the user
    products: string[]; // Array of product IDs
    createdAt: Date;
    updatedAt: Date;
}