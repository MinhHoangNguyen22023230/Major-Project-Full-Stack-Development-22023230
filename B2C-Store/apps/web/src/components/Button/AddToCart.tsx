import { useSession } from "@/app/clientLayout";
import { trpc } from "@/app/_trpc/client";
import { useState, useEffect } from "react";
import { BsCartPlus } from "react-icons/bs";
import { BsFillCartCheckFill } from "react-icons/bs";
import Alert from "@repo/ui/Alert";

// Match the backend Cart type, allowing totalPrice to be number | null
type Cart = {
    id: string;
    userId: string;
    totalPrice: number | null;
    // other fields if needed
};

type CartItem = {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    totalPrice: number;
};

export default function AddToCartButton({ productId }: { productId: string }) {
    const session = useSession();
    const userId = session.userId;
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "warning" | "error" } | null>(null);

    const createCartMutation = trpc.crud.createCart.useMutation();
    const createCartItemMutation = trpc.crud.createCartItem.useMutation();
    const updateCartItemMutation = trpc.crud.updateCartItem.useMutation();
    const findCartByUserId = trpc.crud.getCarts.useQuery(undefined, { staleTime: 1000 * 60 });
    const getCartItemsQuery = trpc.crud.getCartItems.useQuery();
    const utils = trpc.useUtils();

    useEffect(() => {
        if (alert) {
            // Show alert for 2 seconds, then fade out
            const timeout = setTimeout(() => {
                setAlert(null);
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [alert]);

    const handleAddToCart = async () => {
        if (!userId) {
            window.location.href = "/login?message=login_required";
            return;
        }
        setLoading(true);
        try {
            // 1. Find user's cart (if exists)
            let cart = findCartByUserId.data?.find((c: Cart) => c.userId === userId);

            // 2. If no cart, create one and refetch carts to get the latest cart object
            if (!cart) {
                await createCartMutation.mutateAsync({ userId });
                const { data: cartsAfterCreate } = await findCartByUserId.refetch();
                cart = cartsAfterCreate?.find((c: Cart) => c.userId === userId);
                if (!cart) {
                    throw new Error("Cart creation failed. Please try again.");
                }
            }

            // 3. Refetch cart items to ensure latest data
            await getCartItemsQuery.refetch();
            const cartItems: CartItem[] = getCartItemsQuery.data ?? [];
            const cartItem = cartItems.find((item: CartItem) => item.cartId === cart!.id && item.productId === productId);

            if (cartItem) {
                // 4. If exists, just update quantity (totalPrice and cart total handled in backend)
                await updateCartItemMutation.mutateAsync({
                    id: cartItem.id,
                    data: {
                        quantity: cartItem.quantity + 1,
                    },
                });
            } else {
                // 5. If not exists, create new cart item (totalPrice and cart total handled in backend)
                await createCartItemMutation.mutateAsync({
                    cartId: cart.id,
                    productId,
                    quantity: 1,
                });
            }

            // Invalidate user and carts queries so NavBar rerenders with updated cart
            await Promise.all([
                utils.crud.findUserById.invalidate({ id: userId }),
                utils.crud.getCarts.invalidate(),
                utils.crud.getCartItems.invalidate(),
            ]);

            setAlert({ message: "Product added to cart!", type: "success" });
        } catch (error) {
            console.error("Error adding to cart:", error);
            setAlert({ message: "Failed to add product to cart.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {alert && (
                <Alert
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                />
            )}
            <button
                className="bg-blue-600 h-10 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded cursor-pointer transition flex items-center justify-center"
                onClick={handleAddToCart}
                disabled={loading}
                aria-label="Add to cart"
            >
                <span
                    className={`transition-transform duration-300 ${loading ? 'scale-125' : 'scale-100'}`}
                    style={{ display: 'flex', alignItems: 'center' }}
                >
                    {loading ? (
                        <BsFillCartCheckFill size={30} />
                    ) : (
                        <BsCartPlus size={30} />
                    )}
                </span>
            </button>
        </>
    );
}