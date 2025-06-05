"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { trpc } from "@/app/_trpc/client";
import { useSidebar } from "@/app/SidebarContext";
import ComponentCard from "@/components/ui/ComponentCard";
import Alert from "@/components/ui/Alert";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function EditBrand() {
    const { brandId } = useParams<{ brandId: string }>() as { brandId: string };
    const router = useRouter();
    const { isOpen } = useSidebar();
    const { data } = trpc.crud.findBrandById.useQuery({ id: brandId || '' });
    const updateBrand = trpc.crud.updateBrand.useMutation();
    const uploadBrandImage = trpc.s3.uploadBrandImage?.useMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "warning" | "error" } | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [tempImageUrl, setTempImageUrl] = useState<string>('');
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

    useEffect(() => {
        if (data) {
            setForm({
                name: data.name || '',
                description: data.description || ''
            });
            setUploadedImageUrl(data.imageUrl || '');
        }
    }, [data]);

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
        let uploadedImgUrl = uploadedImageUrl;
        if (selectedFile && uploadBrandImage) {
            setUploading(true);
            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                uploadedImgUrl = await uploadBrandImage.mutateAsync({
                    brandId: brandId,
                    filename: selectedFile.name,
                    body: Array.from(uint8Array),
                    contentType: selectedFile.type,
                });
                setUploadedImageUrl(uploadedImgUrl);
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
        }
        try {
            await updateBrand.mutateAsync({
                id: brandId,
                data: {
                    name: form.name,
                    description: form.description,
                    imageUrl: uploadedImgUrl,
                }
            });
            setAlert({ message: 'Brand updated successfully!', type: 'success' });
            setTimeout(() => router.push('/dashboard/brand'), 1000);
        } catch (error) {
            let msg = '';
            if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
                msg = (error as { message: string }).message;
            }
            setAlert({ message: msg || 'Failed to update brand', type: 'error' });
        }
    };

    return (
        <ComponentCard
            className={`${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
            title={`Edit Brand`}
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {" > "}
                    <Link href="/dashboard/brand" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">brand</Link>
                    {" > "}
                    <span className="text-blue-500">edit</span>
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
                        {uploading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-5 w-5 text-white" />
                                Uploading...
                            </span>
                        ) : (
                            <span>Change Brand Image</span>
                        )}
                    </label>
                    {uploadError && <span className="text-red-500 ml-2 block text-center">{uploadError}</span>}
                    {(tempImageUrl || uploadedImageUrl) && (
                        <div className="mt-4 flex justify-center">
                            <Image
                                src={tempImageUrl || uploadedImageUrl}
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
                        className="bg-blue-500 text-white px-4 cursor-pointer py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={updateBrand.isPending}
                    >
                        {updateBrand.isPending ? <Loader2 className="animate-spin w-5 h-5 inline-block" /> : 'Update Brand'}
                    </button>
                </form>
                <button onClick={() => router.push('/dashboard/brand')} className="block mx-auto mt-4 text-center w-fit h-fit cursor-pointer text-red-500 hover:underline">Cancel</button>
            </div>
        </ComponentCard>
    );
}
