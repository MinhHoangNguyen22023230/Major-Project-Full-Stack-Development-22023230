'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import { useSidebar } from '@/app/SidebarContext';
import Alert from '@/components/ui/Alert';
import ComponentCard from '@/components/ui/ComponentCard';

export default function CreateBrand() {
    const router = useRouter();
    const { isOpen } = useSidebar();
    const [form, setForm] = useState({ name: '', description: '', imageUrl: '' });
    const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "warning" | "error" } | null>(null);
    const createBrand = trpc.crud.createBrand.useMutation();
    const uploadBrandImage = trpc.s3.uploadBrandImage?.useMutation();
    const updateBrand = trpc.crud.updateBrand.useMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [tempImageUrl, setTempImageUrl] = useState<string>('');
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

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
        if (!form.name) {
            setAlert({ message: 'Name is required.', type: 'warning' });
            return;
        }
        // 1. Create brand first (without image)
        let createdBrandId: string | null = null;
        let uploadedImgUrl = '';
        try {
            const brand = await createBrand.mutateAsync({
                name: form.name,
                description: form.description,
                imageUrl: '', // Don't set image yet
            });
            createdBrandId = brand.id;
        } catch (error) {
            let msg = '';
            if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
                msg = (error as { message: string }).message;
            }
            setAlert({ message: msg || 'Failed to create brand', type: 'error' });
            return;
        }
        // 2. If image selected, upload to S3 and update brand
        if (selectedFile && createdBrandId && uploadBrandImage) {
            setUploading(true);
            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                uploadedImgUrl = await uploadBrandImage.mutateAsync({
                    brandId: createdBrandId,
                    filename: selectedFile.name,
                    body: Array.from(uint8Array),
                    contentType: selectedFile.type,
                });
                setUploadedImageUrl(uploadedImgUrl);
                await updateBrand.mutateAsync({
                    id: createdBrandId,
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
        setAlert({ message: 'Brand created successfully!', type: 'success' });
        setForm({ name: '', description: '', imageUrl: '' });
        setTempImageUrl('');
        setSelectedFile(null);
        setUploadedImageUrl('');
        router.push('/dashboard/brand');
    };

    return (
        <ComponentCard
            className={`${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
            title={`Create Brand`}
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {" > "}
                    <Link href="/dashboard/brand" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">brand</Link>
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
                        Description
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                            rows={3}
                        />
                    </label>
                    <label
                        htmlFor="brand-image-upload"
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
                            <span>Add Brand Image</span>
                        )}
                        <input
                            id="brand-image-upload"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="hidden"
                            aria-label="Upload brand image"
                        />
                    </label>
                    {uploadError && <span className="text-red-500 ml-2 block text-center">{uploadError}</span>}
                    {(tempImageUrl || uploadedImageUrl || form.imageUrl) && (
                        <div className="mt-4 flex justify-center">
                            <Image
                                src={tempImageUrl || uploadedImageUrl || form.imageUrl}
                                alt="Brand"
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
                        disabled={createBrand.isPending || uploading}
                    >
                        {(createBrand.isPending || uploading) ? <Loader2 className="animate-spin w-5 h-5 inline-block" /> : 'Create Brand'}
                    </button>
                </form>
                <button onClick={() => router.push('/dashboard/brand')} className="block mx-auto mt-4 text-center w-fit h-fit cursor-pointer text-red-500 hover:underline">Cancel</button>
            </div>
        </ComponentCard>
    );
}
