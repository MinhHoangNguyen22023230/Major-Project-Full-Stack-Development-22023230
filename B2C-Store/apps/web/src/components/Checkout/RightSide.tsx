// --- Types ---
type Product = {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    description?: string;
};

type CartItem = {
    id: string;
    productId: string;
    product?: Product;
    quantity: number;
    totalPrice?: number;
};

type Cart = {
    id: string;
    totalPrice?: number;
    cartItems: CartItem[];
};

export default function RightSide({ cart }: { cart: Cart }) {
    const total =
        typeof cart.totalPrice === "number"
            ? cart.totalPrice
            : cart.cartItems.reduce(
                (sum, item) => sum + (item.product?.price || 0) * item.quantity,
                0
            );
    const totalItems = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="bg-gray-50 p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
                <span>Items:</span>
                <span>{totalItems}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg mb-4">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
            </div>
        </div>
    );
}