import Image from "next/image";

type LeftSideProps = {
  imageUrl?: string;
  name: string;
};

export default function LeftSide({ imageUrl, name }: LeftSideProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Image
        src={imageUrl || "/no-product-image.png"}
        alt={name}
        width={400}
        height={400}
        className="rounded-lg object-cover border"
      />
    </div>
  );
}