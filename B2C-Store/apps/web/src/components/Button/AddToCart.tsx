import { useCurrentUser } from "@/hooks/useCurrentUser";
import { trpc } from "@/app/_trpc/client";
import { useState } from "react";

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

export default function AddToCartButton({ productId, productPrice }: { productId: string, productPrice: number }) {
    const userId = useCurrentUser();
    const [loading, setLoading] = useState(false);

    const createCartMutation = trpc.crud.createCart.useMutation();
    const createCartItemMutation = trpc.crud.createCartItem.useMutation();
    const updateCartItemMutation = trpc.crud.updateCartItem.useMutation();
    const updateCartMutation = trpc.crud.updateCart.useMutation();
    const findCartByUserId = trpc.crud.getCarts.useQuery(undefined, { staleTime: 1000 * 60 });
    const getCartItemsQuery = trpc.crud.getCartItems.useQuery();
    const utils = trpc.useUtils();

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
                // 4. If exists, update quantity and totalPrice
                const newQuantity = cartItem.quantity + 1;
                const newTotalPrice = productPrice * newQuantity;
                await updateCartItemMutation.mutateAsync({
                    id: cartItem.id,
                    data: {
                        quantity: newQuantity,
                        totalPrice: newTotalPrice,
                    },
                });
            } else {
                // 5. If not exists, create new cart item
                await createCartItemMutation.mutateAsync({
                    cartId: cart.id,
                    productId,
                    quantity: 1,
                    totalPrice: productPrice * 1,
                });
            }

            const { data: freshCartItems } = await getCartItemsQuery.refetch();
            const allCartItems: CartItem[] = freshCartItems
                ? freshCartItems.filter((item: CartItem) => item.cartId === cart!.id)
                : [];

            // Always calculate total using cart item totalPrice
            const totalPrice = allCartItems.reduce(
                (sum: number, item: CartItem) => sum + (item.totalPrice || 0),
                0
            );

            await updateCartMutation.mutateAsync({
                id: cart.id,
                data: { totalPrice },
            });

            // Invalidate user and carts queries so NavBar rerenders with updated cart
            await Promise.all([
                utils.crud.findUserById.invalidate({ id: userId }),
                utils.crud.getCarts.invalidate(),
                utils.crud.getCartItems.invalidate(),
            ]);

            alert("Product added to cart!");
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Failed to add product to cart.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded cursor-pointer transition"
            onClick={handleAddToCart}
            disabled={loading}
        >
            {loading ? "Adding..." : "Add to Cart"}
        </button>
    );
}