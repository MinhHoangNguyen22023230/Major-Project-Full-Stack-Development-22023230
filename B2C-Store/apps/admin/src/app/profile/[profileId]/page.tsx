"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminProfile() {
    const { profileId } = useParams<{ profileId: string }>();
    const router = useRouter();
    const { data, isLoading, isError } = trpc.crud.findAdminById.useQuery({ id: profileId || '' });
    const updateAdmin = trpc.crud.updateAdmin.useMutation();
    const uploadAdminImage = trpc.s3.uploadAdminImage.useMutation();
    // Defensive fallback for admin fields
    type AdminWithOptional = typeof data & {
        firstName?: string;
        lastName?: string;
        role?: string;
        lastLogin?: string;
        phoneNumber?: string;
    };
    const admin = {
        username: (data as AdminWithOptional)?.username || '',
        email: (data as AdminWithOptional)?.email || '',
        imageUrl: (data as AdminWithOptional)?.imageUrl || '',
        firstName: (data as AdminWithOptional)?.firstName || '',
        lastName: (data as AdminWithOptional)?.lastName || '',
        role: (data as AdminWithOptional)?.role || '',
        lastLogin: (data as AdminWithOptional)?.lastLogin,
        phoneNumber: (data as AdminWithOptional)?.phoneNumber || '',
        createdAt: (data as AdminWithOptional)?.createdAt,
        id: (data as AdminWithOptional)?.id,
    };
    const [form, setForm] = useState({
        username: admin.username,
        email: admin.email,
        imgUrl: admin.imageUrl,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        phoneNumber: admin.phoneNumber,
    });
    const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "warning" | "error" } | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setForm({
            username: admin.username,
            email: admin.email,
            imgUrl: admin.imageUrl,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role,
            phoneNumber: admin.phoneNumber,
        });
        setUploadedImageUrl(admin.imageUrl);
    }, [admin.username, admin.email, admin.imageUrl, admin.firstName, admin.lastName, admin.role, admin.phoneNumber]);

    if (!profileId) {
        return <div className='flex justify-center items-center text-center w-full min-h-screen'>Profile ID not found</div>;
    }
    if (isLoading) {
        return <div className='flex justify-center items-center text-center w-full min-h-screen text-blue-500'><Loader2 className='w-10 h-10 animate-spin' /></div>;
    }
    if (isError) {
        return <div className='flex justify-center items-center text-center w-full min-h-screen text-3xl text-red-500'>Error loading profile</div>;
    }
    if (!data) {
        return <div className='flex justify-center items-center text-center w-full min-h-screen text-3xl text-yellow-500'>Profile data not found</div>;
    }

    // Determine if current admin is SuperAdmin
    const isSuperAdmin = (data as AdminWithOptional)?.role === 'SuperAdmin';

    const adminInfo = [
        { label: 'Username', value: admin.username },
        { label: 'First Name', value: admin.firstName || '-' },
        { label: 'Last Name', value: admin.lastName || '-' },
        { label: 'Role', value: admin.role || '-' },
        { label: 'Phone Number', value: admin.phoneNumber || '-' },
        { label: 'Email', value: admin.email },
        { label: 'Last Login', value: admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : '-' },
        { label: 'Created At', value: admin.createdAt ? new Date(admin.createdAt).toLocaleString() : '-' },
        { label: 'ID', value: admin.id },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadError(null);
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const imageUrl = await uploadAdminImage.mutateAsync({
                adminId: profileId,
                filename: file.name,
                body: Array.from(uint8Array),
                contentType: file.type,
            });
            setUploadedImageUrl(imageUrl);
            setForm((prev) => ({ ...prev, imgUrl: imageUrl }));
        } catch {
            setUploadError("Failed to upload image");
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.username || !form.email) {
            setAlert({ message: 'Username and email are required.', type: 'warning' });
            return;
        }
        const uploadedImgUrl = form.imgUrl;
        try {
            await updateAdmin.mutateAsync({
                id: profileId,
                data: {
                    username: form.username,
                    email: form.email,
                    imageUrl: uploadedImgUrl,
                    firstName: form.firstName,
                    lastName: form.lastName,
                    role: form.role,
                    phoneNumber: form.phoneNumber,
                },
            });
            setAlert({ message: 'Profile updated successfully!', type: 'success' });
            setTimeout(() => router.push('/dashboard'), 1000);
        } catch (error) {
            let msg = '';
            if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
                msg = (error as { message: string }).message;
            }
            setAlert({ message: msg || 'Failed to update profile', type: 'error' });
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4 py-8">
            <div className="w-full max-w-3xl mb-4">
                <Link href="/dashboard" className="inline-block text-[var(--button-primary)] hover:underline font-medium text-base">&larr; Back to Dashboard</Link>
            </div>
            <section className="w-full max-w-3xl rounded-xl shadow-lg bg-[var(--navbar-and-sidebar-bg)] border border-[var(--ui-border-color)] p-8 flex flex-col md:flex-row gap-10 items-start">
                {/* Profile Image and Upload */}
                <div className="flex flex-col items-center gap-4 min-w-[180px]">
                    <div className="relative w-36 h-36">
                        <Image
                            src={uploadedImageUrl || "/no product image.png"}
                            alt="Profile Image"
                            width={144}
                            height={144}
                            className="rounded-full object-cover border border-[var(--ui-border-color)] bg-[var(--gallery)] w-36 h-36"
                        />
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        id="profile-image-upload"
                    />
                    <label htmlFor="profile-image-upload" className="mt-2 px-4 py-2 bg-[var(--button-primary)] text-white rounded cursor-pointer hover:bg-[var(--button-primary-hover)]">
                        Upload Image
                    </label>
                    {uploadError && <div className="text-[var(--popover-text)] text-xs mt-1">{uploadError}</div>}
                </div>
                {/* Profile Info and Edit Form */}
                <div className="flex-1 w-full max-w-xl">
                    {alert && (
                        <div className={`mb-4 p-3 rounded text-center ${alert.type === 'success' ? 'bg-green-100 text-green-700' : alert.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{alert.message}</div>
                    )}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-[var(--card-title)]">Admin Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                            {adminInfo.map((info) => (
                                <div key={info.label} className="flex flex-col mb-2">
                                    <span className="text-xs text-[var(--popover-text)]">{info.label}</span>
                                    <span className="font-medium text-[var(--foreground)] break-all">{info.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[var(--popover-bg)] border border-[var(--popover-border)] rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-2 text-[var(--card-title)]">Edit Profile</h3>
                        <label className="font-semibold text-[var(--foreground)]">
                            Username
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                className="border border-[var(--ui-border-color)] rounded px-3 py-2 w-full mt-1 bg-[var(--background)] text-[var(--foreground)]"
                                required
                            />
                        </label>
                        <label className="font-semibold text-[var(--foreground)]">
                            First Name
                            <input
                                type="text"
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                className="border border-[var(--ui-border-color)] rounded px-3 py-2 w-full mt-1 bg-[var(--background)] text-[var(--foreground)]"
                            />
                        </label>
                        <label className="font-semibold text-[var(--foreground)]">
                            Last Name
                            <input
                                type="text"
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                className="border border-[var(--ui-border-color)] rounded px-3 py-2 w-full mt-1 bg-[var(--background)] text-[var(--foreground)]"
                            />
                        </label>
                        {/* Only show Role input if SuperAdmin */}
                        {isSuperAdmin && (
                            <label className="font-semibold text-[var(--foreground)]">
                                Role
                                <input
                                    type="text"
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className="border border-[var(--ui-border-color)] rounded px-3 py-2 w-full mt-1 bg-[var(--background)] text-[var(--foreground)]"
                                />
                            </label>
                        )}
                        <label className="font-semibold text-[var(--foreground)]">
                            Email
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="border border-[var(--ui-border-color)] rounded px-3 py-2 w-full mt-1 bg-[var(--background)] text-[var(--foreground)]"
                                required
                            />
                        </label>
                        <label className="font-semibold text-[var(--foreground)]">
                            Phone Number
                            <input
                                type="text"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                className="border border-[var(--ui-border-color)] rounded px-3 py-2 w-full mt-1 bg-[var(--background)] text-[var(--foreground)]"
                            />
                        </label>
                        <button type="submit" className="mt-4 px-4 py-2 bg-[var(--button-primary)] text-white rounded hover:bg-[var(--button-primary-hover)] disabled:opacity-50">
                            Save Changes
                        </button>
                    </form>
                    <button onClick={() => router.push('/dashboard')} className="block mx-auto mt-4 text-center w-fit h-fit cursor-pointer text-[var(--popover-text)] hover:underline">
                        Cancel
                    </button>
                </div>
            </section>
        </main>
    );
}
