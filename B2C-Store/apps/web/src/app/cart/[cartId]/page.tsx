"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import LeftSide from "@/components/Cart/LeftSide";
import RightSide from "@/components/Cart/RightSide";

export default function Cart() {
    const params = useParams();
    const cartId = params.cartId as string;

    // Fetch cart details using tRPC
    const { data: cart, isLoading, error } = trpc.crud.findCartById.useQuery({ id: cartId });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <span className="text-xl font-semibold">Loading cart...</span>
            </div>
        );
    }

    // If no cart exists, hide the cart page
    if (error || !cart) {
        return null;
    }

    // Patch: convert totalPrice null to 0 for type safety
    const safeCart = {
        ...cart,
        totalPrice: cart.totalPrice === null || cart.totalPrice === undefined ? 0 : cart.totalPrice,
    } as Omit<typeof cart, 'totalPrice'> & { totalPrice: number };

    return (
        <div className="w-[80%] mx-auto h-full bg-white shadow-lg pt-10 pr-8 pl-8 pb-10">
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <LeftSide cart={safeCart} />
                <RightSide cart={safeCart} />
            </div>
        </div>
    );
}