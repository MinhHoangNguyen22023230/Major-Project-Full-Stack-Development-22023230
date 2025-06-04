"use client";
import { useSession } from "@/app/clientLayout";
import { trpc } from "@/app/_trpc/client";
import { useState, useMemo } from "react";
import { GoHeart } from "react-icons/go";
import { GoHeartFill } from "react-icons/go";


// Define types to avoid 'any'
type WishListItem = {
    id: string;
    productId: string;
    wishListId: string;
};

type WishList = {
    id: string;
    userId: string;
    wishListItems: WishListItem[];
};

// Define the expected structure for wishlist data from the server
type RawWishListItem = {
    id: string;
    productId: string;
    wishListId: string | null;
};

type RawWishList = {
    id: string;
    userId: string;
    wishListItems?: RawWishListItem[];
};

export default function AddToWishlist({ productId }: { productId: string }) {
    const session = useSession();
    const userId = session.userId;
    const [loading, setLoading] = useState(false);

    // Get all wishlists (to find or create user's wishlist)
    const wishListsQuery = trpc.crud.getWishLists.useQuery();
    const createWishList = trpc.crud.createWishList.useMutation();
    const createWishListItem = trpc.crud.createWishListItem.useMutation();
    const deleteWishListItem = trpc.crud.deleteWishListItem.useMutation();

    // Local state to reflect UI immediately
    const [localWishlisted, setLocalWishlisted] = useState<boolean | null>(null);
    const [localWishListItemId, setLocalWishListItemId] = useState<string | null>(null);

    // Find user's wishlist and wishlist items, filtering out any with null wishListId
    const wishList = useMemo(() => {
        const lists = (wishListsQuery.data as RawWishList[] | undefined)?.map((w) => ({
            ...w,
            wishListItems: (w.wishListItems ?? [])
                .filter((item: RawWishListItem) => typeof item.wishListId === "string" && item.wishListId)
                .map((item: RawWishListItem) => ({
                    id: item.id,
                    productId: item.productId,
                    wishListId: item.wishListId as string,
                })),
        })) as WishList[] | undefined;
        return lists?.find((w) => w.userId === userId);
    }, [wishListsQuery.data, userId]);

    const wishListItems: WishListItem[] = wishList?.wishListItems ?? [];

    // Find the wishlist item for this product
    const wishListItem = wishListItems.find((item) => item.productId === productId);

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
                const created = await createWishList.mutateAsync({ userId });
                // Defensive: ensure created is not undefined and has id
                if (!created || !created.id) throw new Error("Wishlist creation failed");
                currentWishList = {
                    id: created.id,
                    userId: created.userId,
                    wishListItems: [],
                };
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
        } catch {
            alert("Failed to update wishlist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className="font-semibold px-4 py-2 h-10 rounded cursor-pointer transition flex items-center justify-center"
            onClick={handleToggleWishlist}
            disabled={loading}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
            <span
                className={`transition-transform duration-300 ${loading ? 'scale-125' : 'scale-100'}`}
                style={{ display: 'flex', alignItems: 'center' }}
            >
                {isWishlisted ? (
                    <GoHeartFill size={30} color="#ec4899" />
                ) : (
                    <GoHeart size={30} color="#ec4899" />
                )}
            </span>
        </button>
    );
}