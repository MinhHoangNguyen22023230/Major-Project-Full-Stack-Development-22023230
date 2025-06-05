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

export default function CreateUser() {
    const router = useRouter();
    const { isOpen } = useSidebar();
    const [form, setForm] = useState({ username: '', email: '', password: '', imgUrl: '' });
    const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "warning" | "error" } | null>(null);
    const createUser = trpc.crud.createUser.useMutation();
    const uploadUserImage = trpc.s3.uploadUserImage.useMutation();
    const updateUser = trpc.crud.updateUser.useMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // New state for holding the selected file and its preview URL
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [tempImageUrl, setTempImageUrl] = useState<string>('');
    // Track uploaded image URL for preview after upload
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Only set preview, don't upload yet
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
        if (!form.username || !form.email || !form.password) {
            setAlert({ message: 'Username, email, and password are required.', type: 'warning' });
            return;
        }
        if (form.password.length < 8) {
            setAlert({ message: 'Password must be at least 8 characters.', type: 'warning' });
            return;
        }

        // 1. Create user first (without image)
        let createdUserId: string | null = null;
        let uploadedImgUrl = '';
        try {
            const user = await createUser.mutateAsync({
                username: form.username,
                email: form.email,
                password: form.password,
                imgUrl: '', // Don't set image yet
            });
            createdUserId = user.id;
        } catch (error) {
            // Handle unique constraint errors for username/email
            let msg = '';
            if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
                msg = (error as { message: string }).message;
            }
            if (msg.includes('Unique constraint') || msg.includes('unique') || msg.includes('Unique constraint failed')) {
                if (msg.toLowerCase().includes('email')) {
                    setAlert({ message: 'Email is already in use.', type: 'error' });
                } else if (msg.toLowerCase().includes('username')) {
                    setAlert({ message: 'Username is already in use.', type: 'error' });
                } else {
                    setAlert({ message: 'Username or email is already in use.', type: 'error' });
                }
            } else {
                setAlert({ message: msg || 'Failed to create user', type: 'error' });
            }
            return;
        }

        // 2. If image selected, upload to S3 and update user
        if (selectedFile && createdUserId) {
            setUploading(true);
            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                uploadedImgUrl = await uploadUserImage.mutateAsync({
                    userId: createdUserId,
                    filename: selectedFile.name,
                    body: Array.from(uint8Array),
                    contentType: selectedFile.type,
                });
                setUploadedImageUrl(uploadedImgUrl); // Save for preview
                // Update user with image URL
                await updateUser.mutateAsync({
                    id: createdUserId,
                    data: { imgUrl: uploadedImgUrl },
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
            setUploadedImageUrl(''); // Clear if no upload
        }

        // Clear any lingering error alerts
        setAlert(null);
        setUploadError(null);
        // Success: show alert, reset form, redirect
        setAlert({ message: 'User created successfully!', type: 'success' });
        setForm({ username: '', email: '', password: '', imgUrl: '' });
        setTempImageUrl('');
        setSelectedFile(null);
        setUploadedImageUrl('');
        router.push('/dashboard/user');
    };

    return (
        <ComponentCard
            className={`${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
            title={`Create User`}
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {" > "}
                    <Link href="/dashboard/user" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">user</Link>
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
                        Username
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                            required
                        />
                    </label>
                    <label className="font-semibold">
                        Email
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                            required
                        />
                    </label>
                    <label className="font-semibold">
                        Password
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                            required
                        />
                    </label>
                    {/* Remove Image URL text input, only use upload */}
                    {/* <label className="font-semibold">
                        Image URL
                        <input
                            type="text"
                            name="imgUrl"
                            value={form.imgUrl}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                        />
                    </label> */}
                    <label
                        htmlFor="profile-image-upload"
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
                            <span>Add Profile Image</span>
                        )}
                        <input
                            id="profile-image-upload"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="hidden"
                            aria-label="Upload profile image"
                        />
                    </label>
                    {uploadError && <span className="text-red-500 ml-2 block text-center">{uploadError}</span>}
                    {(tempImageUrl || uploadedImageUrl || form.imgUrl) && (
                        <div className="mt-4 flex justify-center">
                            <Image
                                src={tempImageUrl || uploadedImageUrl || form.imgUrl}
                                alt="Profile"
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
                        disabled={createUser.isPending || uploading}
                    >
                        {(createUser.isPending || uploading) ? <Loader2 className="animate-spin w-5 h-5 inline-block" /> : 'Create User'}
                    </button>
                </form>
                <button onClick={() => router.push('/dashboard/user')} className="block mx-auto mt-4 text-center w-fit h-fit cursor-pointer text-red-500 hover:underline">Cancel</button>
            </div>
        </ComponentCard>
    );
}