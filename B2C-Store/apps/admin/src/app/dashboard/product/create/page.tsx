'use client';

import { trpc } from '@/app/_trpc/client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from '@/app/SidebarContext';
import ComponentCard from '@/components/ui/ComponentCard';
import { useState, useRef } from 'react';
import Alert from '@/components/ui/Alert';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Brand = { id: string; name: string };
type Category = { id: string; name: string };

export default function CreateProduct() {
    const router = useRouter();
    const { isOpen } = useSidebar();
    const [form, setForm] = useState({ name: '', price: '', description: '', imageUrl: '' });
    const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "warning" | "error" } | null>(null);
    const createProduct = trpc.crud.createProduct.useMutation();
    const uploadProductImage = trpc.s3.uploadProductImage?.useMutation();
    const updateProduct = trpc.crud.updateProduct.useMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [tempImageUrl, setTempImageUrl] = useState<string>('');
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

    // Brand and Category selection logic
    const { data: brands = [] } = trpc.crud.getBrands?.useQuery?.() || { data: [] };
    const { data: categories = [] } = trpc.crud.getCategories?.useQuery?.() || { data: [] };
    const [brandId, setBrandId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [stock, setStock] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadError(null);
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setTempImageUrl(URL.createObjectURL(file));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.price) {
            setAlert({ message: 'Name and price are required.', type: 'warning' });
            return;
        }
        if (isNaN(Number(form.price)) || Number(form.price) < 0) {
            setAlert({ message: 'Price must be a non-negative number.', type: 'warning' });
            return;
        }
        if (!brandId || !categoryId) {
            setAlert({ message: 'Brand and category are required.', type: 'warning' });
            return;
        }
        // 1. Create product first (without image)
        let createdProductId: string | null = null;
        let uploadedImgUrl = '';
        try {
            const product = await createProduct.mutateAsync({
                name: form.name,
                price: Number(form.price),
                description: form.description,
                imageUrl: '', // Don't set image yet
                stock,
                categoryId,
                brandId,
            });
            createdProductId = product.id;
        } catch (error) {
            let msg = '';
            if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
                msg = (error as { message: string }).message;
            }
            setAlert({ message: msg || 'Failed to create product', type: 'error' });
            return;
        }
        // 2. If image selected, upload to S3 and update product
        if (selectedFile && createdProductId && uploadProductImage) {
            setUploading(true);
            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                uploadedImgUrl = await uploadProductImage.mutateAsync({
                    productId: createdProductId,
                    filename: selectedFile.name,
                    body: Array.from(uint8Array),
                    contentType: selectedFile.type,
                });
                setUploadedImageUrl(uploadedImgUrl);
                await updateProduct.mutateAsync({
                    id: createdProductId,
                    data: { imageUrl: uploadedImgUrl },
                });
            } catch (err) {
                setUploading(false);
                if (err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string") {
                    setUploadError((err as { message: string }).message);
                } else {
                    setUploadError("Failed to upload image");
                }
                return;
            }
            setUploading(false);
        } else {
            setUploadedImageUrl('');
        }
        setAlert(null);
        setUploadError(null);
        setAlert({ message: 'Product created successfully!', type: 'success' });
        setForm({ name: '', price: '', description: '', imageUrl: '' });
        setTempImageUrl('');
        setSelectedFile(null);
        setUploadedImageUrl('');
        router.push('/dashboard/product');
    };

    return (
        <ComponentCard
            className={`${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
            title={`Create Product`}
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {" > "}
                    <Link href="/dashboard/product" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">product</Link>
                    {" > "}
                    <span className="text-blue-500">create</span>
                </>
            }
        >
            <div className='main-section p-4'>
                {alert && (
                    <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto mt-8">
                    <label className="font-semibold">
                        Name
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                            required
                        />
                    </label>
                    <label className="font-semibold">
                        Price
                        <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                            min="0"
                            step="0.01"
                            required
                        />
                    </label>
                    <label className="font-semibold">
                        Description
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                            rows={3}
                        />
                    </label>
                    <label className="font-semibold">
                        Category
                        <select
                            name="categoryId"
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            className="mt-2 bg-[var(--select-bg)] text-[var(--select-text)] border border-[var(--select-border)] text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-[var(--select-bg)] dark:text-[var(--select-text)] dark:border-[var(--select-border)]"
                            required
                        >
                            <option value="" disabled>Select category</option>
                            {categories.map((cat: Category) => (
                                <option key={cat.id} value={cat.id} className="bg-[var(--select-bg)] text-[var(--select-text)]">{cat.name}</option>
                            ))}
                        </select>
                    </label>
                    <label className="font-semibold">
                        Brand
                        <select
                            name="brandId"
                            value={brandId}
                            onChange={e => setBrandId(e.target.value)}
                            className="mt-2 bg-[var(--select-bg)] text-[var(--select-text)] border border-[var(--select-border)] text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-[var(--select-bg)] dark:text-[var(--select-text)] dark:border-[var(--select-border)]"
                            required
                        >
                            <option value="" disabled>Select brand</option>
                            {brands.map((brand: Brand) => (
                                <option key={brand.id} value={brand.id} className="bg-[var(--select-bg)] text-[var(--select-text)]">{brand.name}</option>
                            ))}
                        </select>
                    </label>
                    <label className="font-semibold">
                        Stock
                        <input
                            type="number"
                            name="stock"
                            value={stock}
                            onChange={e => setStock(Number(e.target.value))}
                            className="border rounded px-3 py-2 w-full mt-1"
                            min="0"
                            required
                        />
                    </label>
                    <label
                        htmlFor="product-image-upload"
                        className={`inline-block px-5 py-2 mt-2 mb-2 rounded font-semibold cursor-pointer transition-colors bg-blue-500 text-white shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        tabIndex={0}
                        style={{ width: 'fit-content', margin: '0 auto', display: 'block' }}
                    >
                        {uploading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-5 w-5 text-white" />
                                Uploading...
                            </span>
                        ) : (
                            <span>Add Product Image</span>
                        )}
                        <input
                            id="product-image-upload"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="hidden"
                            aria-label="Upload product image"
                        />
                    </label>
                    {uploadError && <span className="text-red-500 ml-2 block text-center">{uploadError}</span>}
                    {(tempImageUrl || uploadedImageUrl || form.imageUrl) && (
                        <div className="mt-4 flex justify-center">
                            <Image
                                src={tempImageUrl || uploadedImageUrl || form.imageUrl}
                                alt="Product"
                                width={300}
                                height={300}
                                className="border object-contain"
                                style={{ aspectRatio: '1 / 1', borderRadius: 8, display: 'block' }}
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        className="bg-blue-500 text-white cursor-pointer px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={createProduct.isPending || uploading}
                    >
                        {(createProduct.isPending || uploading) ? <Loader2 className="animate-spin w-5 h-5 inline-block" /> : 'Create Product'}
                    </button>
                </form>
                <button onClick={() => router.push('/dashboard/product')} className="block mx-auto mt-4 text-center w-fit h-fit cursor-pointer text-red-500 hover:underline">Cancel</button>
            </div>
        </ComponentCard>
    );
}
