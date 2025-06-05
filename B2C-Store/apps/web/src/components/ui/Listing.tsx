import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/Button/AddToCart";
import AddToWishlistButton from "@/components/Button/AddToWishilist";

export type ListingProduct = {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    category?: { name?: string };
    brand?: { name?: string; imageUrl?: string };
};

type ListingProps = {
    products: ListingProduct[];
    isLoading?: boolean;
    error?: unknown; // Accept any error type
    title?: string;
};

export default function Listing({ products, isLoading, error, title = "Our Products" }: ListingProps) {
    if (isLoading) return (
        <div className="shadow-md rounded-lg overflow-hidden">
            <div className="p-4 flex items-center gap-2">
                <span className="animate-spin inline-block"><svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg></span>
                <h2 className="text-xl font-bold mb-2">Loading...</h2>
            </div>
        </div>
    );
    if (error) {
        // Try to get a message from the error, fallback to string
        const message = (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string')
            ? (error as { message: string }).message
            : String(error);
        return <p>Error: {message}</p>;
    }
    if (!products || products.length === 0) {
        return <div className="text-center text-gray-500 w-full h-200 flex justify-center items-center"><h1 className="text-2xl block">New Products Comming Soon!</h1></div>;
    }

    return (
        <div className="bg-white w-full h-full pb-10 pt-10 shadow-md flex flex-row justify-center pr-4 pl-4">
            <div className="w-fit">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-2 lg:gap-x-4 gap-y-10">
                    {products?.map((product) => (
                        <div key={product.id} className="w-full pl-6 pr-6 shadow-md sm:w-74 xl:w-84 lg:w-76">
                            <Link href={`/products/${product.id}`} className="cursor-pointer block hover:opacity-80 transition-opacity duration-300">
                                <div className="h-fit w-full sm:h-70 sm:w-70 lg:w-72 lg:h-72 xl:w-80 xl:h-80 flex items-center">
                                    <Image
                                        alt={product.name}
                                        src={product.imageUrl || "/no-product-image.png"}
                                        className="aspect-square rounded-md bg-gray-200 object-fit lg:aspect-auto w-full h-full sm:h-70 sm:w-70 lg:w-72 lg:h-72 xl:w-80 xl:h-80"
                                        width={500}
                                        height={500}
                                    />
                                </div>
                            </Link>
                            <div className="mt-2 flex flex-row w-full justify-between">

                                <div className="flex flex-col">
                                    <Link href={`/products/${product.id}`} className="cursor-pointer block">
                                        <h3 className="text-sm sm:h-20 text-gray-700">
                                            <p className="font-bold line-clamp-4">
                                                {product.name}
                                            </p>
                                        </h3>
                                    </Link>
                                    <div>
                                        <p className="mt-1 text-sm text-gray-500 line-clamp-3" title={product.category?.name}>{product.category?.name || "Unknown"}</p>
                                        <p className="mt-1 h-5 text-sm text-gray-500 flex items-center">
                                            {product.brand?.imageUrl && (
                                                <Image
                                                    src={product.brand.imageUrl}
                                                    alt={product.brand.name + ' logo'}
                                                    width={20}
                                                    height={20}
                                                    className="inline-block mr-2 rounded-full bg-gray-100 object-contain"
                                                />
                                            )}
                                            {product.brand?.name || "Unknown"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-sm font-medium text-[var(--yukon-gold)]">${product.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex items-center mt-5 justify-between mb-3">
                                <AddToWishlistButton productId={product.id} />
                                <AddToCartButton productId={product.id} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
