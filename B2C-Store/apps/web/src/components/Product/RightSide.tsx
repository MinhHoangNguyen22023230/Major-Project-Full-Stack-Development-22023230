import Image from "next/image";
import AddToCartButton from "@/components/Button/AddToCart";
import AddToWishlistButton from "@/components/Button/AddToWishilist";

type RightSideProps = {
    id: string;
    name: string;
    brand?: { name: string; imageUrl?: string };
    rating?: number;
    price: number;
    salePrice?: number;
    stock?: number;
    description?: string;
};

export default function RightSide({
    id,
    name,
    brand,
    rating,
    price,
    salePrice,
    stock,
    description,
}: RightSideProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                {brand?.imageUrl && (
                    <Image
                        src={brand.imageUrl}
                        alt={brand.name}
                        width={48}
                        height={48}
                        className=""
                    />
                )}
                <span className="text-2xl font-bold">{brand?.name || "Unknown Brand"}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
            <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-lg">★</span>
                <span className="text-lg font-medium">{rating ?? "No rating"}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-blue-600">${price.toFixed(2)}</span>
                {salePrice && (
                    <span className="text-xl font-semibold text-red-500 line-through">
                        ${salePrice.toFixed(2)}
                    </span>
                )}
                {typeof stock === "number" && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        Stock: {stock}
                    </span>
                )}
            </div>
            <div className="flex gap-4 mt-2">
                <AddToCartButton productId={id} productPrice={price} />
                <AddToWishlistButton productId={id} />
            </div>
            <p className="text-lg text-gray-700 mt-2">{description}</p>
        </div>
    );
}