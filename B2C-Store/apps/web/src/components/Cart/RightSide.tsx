import Link from "next/link";

// Define explicit types for cart and cart items
type CartItem = {
    id: string;
    quantity: number;
    product?: {
        id: string;
        name: string;
        price: number;
    };
};

type Cart = {
    id: string;
    totalPrice?: number;
    itemsCount?: number;
    cartItems?: CartItem[];
};

export default function RightSide({ cart }: { cart: Cart }) {
    // Use cart.totalPrice and cart.itemsCount directly
    const total = typeof cart.totalPrice === "number" ? cart.totalPrice : 0;
    const totalItems = typeof cart.itemsCount === "number" ? cart.itemsCount : 0;

    return (
        <div className="bg-gray-50 p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
                <span>Items:</span>
                <span>{totalItems}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg mb-4">
                <span>Total:</span>
                <span>${total?.toFixed(2)}</span>
            </div>
            <Link
                href={`/checkout/${cart.id}`}
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
            >
                Continue to Checkout
            </Link>
        </div>
    );
}