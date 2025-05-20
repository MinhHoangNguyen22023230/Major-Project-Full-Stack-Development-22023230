"use client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { trpc } from "@/app/_trpc/client";
import { useState, useMemo } from "react";

export default function AddToWishlist({ productId }: { productId: string }) {
    const userId = useCurrentUser();
    const [loading, setLoading] = useState(false);

    // Get all wishlists (to find or create user's wishlist)
    const wishListsQuery = trpc.crud.getWishLists.useQuery();
    const createWishList = trpc.crud.createWishList.useMutation();
    const createWishListItem = trpc.crud.createWishListItem.useMutation();
    const deleteWishListItem = trpc.crud.deleteWishListItem.useMutation();

    // Local state to reflect UI immediately
    const [localWishlisted, setLocalWishlisted] = useState<boolean | null>(null);
    const [localWishListItemId, setLocalWishListItemId] = useState<string | null>(null);

    // Find user's wishlist and wishlist items
    const wishList = useMemo(
        () => wishListsQuery.data?.find((w: any) => w.userId === userId),
        [wishListsQuery.data, userId]
    );
    const wishListItems = wishList?.wishListItems ?? [];

    // Find the wishlist item for this product
    const wishListItem = wishListItems.find((item: any) => item.productId === productId);

    // Use local state if set, otherwise fallback to server state
    const isWishlisted = localWishlisted !== null ? localWishlisted : !!wishListItem;
    const wishListItemId = localWishListItemId !== null ? localWishListItemId : wishListItem?.id ?? null;

    const handleToggleWishlist = async () => {
        if (!userId) {
            window.location.href = "/login?message=login_required";
            return;
        }
        setLoading(true);
        try {
            let currentWishList = wishList;
            // If no wishlist, create one
            if (!currentWishList) {
                currentWishList = await createWishList.mutateAsync({ userId });
            }

            if (isWishlisted) {
                // Remove from wishlist
                if (wishListItemId) {
                    await deleteWishListItem.mutateAsync({ id: wishListItemId });
                    setLocalWishlisted(false);
                    setLocalWishListItemId(null);
                }
            } else {
                // Add product to wishlist
                const created = await createWishListItem.mutateAsync({
                    productId,
                    wishListId: currentWishList.id,
                });
                setLocalWishlisted(true);
                setLocalWishListItemId(created.id);
            }
        } catch (err) {
            alert("Failed to update wishlist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`font-semibold px-4 py-2 rounded cursor-pointer transition ${
                isWishlisted
                    ? "bg-green-400 text-white"
                    : "bg-red-400 hover:bg-yellow-500 text-gray-900"
            }`}
            onClick={handleToggleWishlist}
            disabled={loading}
        >
            {isWishlisted ? "Wishlisted" : loading ? "Adding..." : "Add to Wishlist"}
        </button>
    );
}