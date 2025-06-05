// Create Admin Page: SuperAdmin only, all fields, S3 image upload, error handling
'use client';
import { useRouter } from 'next/navigation';
import { trpc } from '@/app/_trpc/client';
import { useSidebar } from '@/app/SidebarContext';
import ComponentCard from '@/components/ui/ComponentCard';
import Alert from '@/components/ui/Alert';
import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useAdminSession } from '@/app/clientLayout';
import Link from 'next/link';
import Image from 'next/image';

export default function CreateAdmin() {
    const { isOpen } = useSidebar();
    const router = useRouter();
    const { userId } = useAdminSession();
    const { data: sessionAdmin, isLoading: sessionLoading } = trpc.crud.findAdminById.useQuery({ id: userId || '' }, { enabled: !!userId });
    const isSuperAdmin = sessionAdmin?.role === 'SuperAdmin';
    const createAdmin = trpc.crud.createAdmin.useMutation({
        onSuccess: () => {
            setAlert({ message: 'Admin created successfully!', type: 'success' });
            setTimeout(() => router.push('/dashboard/admin'), 1000);
        },
        onError: (error) => {
            if (error.message && (error.message.includes('Unique constraint') || error.message.includes('unique'))) {
                if (error.message.toLowerCase().includes('email')) {
                    setAlert({ message: 'Email is already in use.', type: 'error' });
                } else if (error.message.toLowerCase().includes('username')) {
                    setAlert({ message: 'Username is already in use.', type: 'error' });
                } else {
                    setAlert({ message: 'Username or email is already in use.', type: 'error' });
                }
            } else {
                setAlert({ message: error.message || 'Failed to create admin', type: 'error' });
            }
        }
    });
    const uploadAdminImage = trpc.s3.uploadAdminImage.useMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [alert, setAlert] = useState<{ message: string; type?: 'info' | 'success' | 'warning' | 'error' } | null>(null);
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        imageUrl: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: '',
    });
    const [createdAdminId, setCreatedAdminId] = useState<string | null>(null);
    // Add state for selectedFile and tempImageUrl
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [tempImageUrl, setTempImageUrl] = useState<string>('');

    if (sessionLoading) {
        return <div className='flex justify-center items-center text-center w-full min-h-screen text-blue-500'><Loader2 className='w-10 h-10 animate-spin' /></div>;
    }
    if (!isSuperAdmin) {
        return <div className='flex justify-center items-center text-center w-full min-h-screen text-2xl text-red-500'>Access denied: SuperAdmin only</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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
        try {
            const admin = await createAdmin.mutateAsync({
                username: form.username,
                email: form.email,
                password: form.password,
                imageUrl: form.imageUrl,
                firstName: form.firstName,
                lastName: form.lastName,
                phoneNumber: form.phoneNumber,
                role: form.role || 'Admin',
            });
            setCreatedAdminId(admin.id);
            setAlert({ message: 'Admin created! You can now upload an image.', type: 'success' });
        } catch (error) {
            let msg = '';
            if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
                msg = (error as { message: string }).message;
            }
            setAlert({ message: msg || 'Failed to create admin', type: 'error' });
        }
    };

    return (
        <ComponentCard
            className={`${isOpen ? 'sm:w-[calc(90vw-280px)]' : 'w-[90vw]'}`}
            title={`Create Admin`}
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {' > '}
                    <Link href="/dashboard/admin" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">admin</Link>
                    {' > '}
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
                            placeholder="Username"
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
                            placeholder="Email"
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
                            placeholder="Password (min 8 chars)"
                        />
                    </label>
                    <label className="font-semibold">
                        First Name
                        <input
                            type="text"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                            placeholder="First Name"
                        />
                    </label>
                    <label className="font-semibold">
                        Last Name
                        <input
                            type="text"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                            placeholder="Last Name"
                        />
                    </label>
                    <label className="font-semibold">
                        Phone Number
                        <input
                            type="text"
                            name="phoneNumber"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                            placeholder="Phone Number"
                        />
                    </label>
                    <label className="font-semibold">
                        Role
                        <input
                            type="text"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                            placeholder="Role (e.g. SuperAdmin, Admin)"
                        />
                    </label>
                    <label
                        htmlFor="admin-image-upload"
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
                            id="admin-image-upload"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={e => {
                                setUploadError(null);
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setSelectedFile(file);
                                setTempImageUrl(URL.createObjectURL(file));
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            disabled={uploading}
                            className="hidden"
                            aria-label="Upload profile image"
                        />
                    </label>
                    {uploadError && <span className="text-red-500 ml-2 block text-center">{uploadError}</span>}
                    {(tempImageUrl || form.imageUrl) && (
                        <div className="mx-auto my-2 w-24 h-24 relative">
                            <Image src={tempImageUrl || form.imageUrl} alt="Profile Preview" fill className="rounded-full object-cover border" />
                        </div>
                    )}
                    {selectedFile && !uploading && (
                        <button
                            type="button"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mx-auto mb-2"
                            onClick={async () => {
                                setUploadError(null);
                                if (!selectedFile) return;
                                let adminId = createdAdminId;
                                if (!adminId) {
                                    if (!form.username || !form.email || !form.password) {
                                        setAlert({ message: 'Username, email, and password are required before uploading an image.', type: 'warning' });
                                        return;
                                    }
                                    if (form.password.length < 8) {
                                        setAlert({ message: 'Password must be at least 8 characters.', type: 'warning' });
                                        return;
                                    }
                                    try {
                                        const admin = await createAdmin.mutateAsync({
                                            username: form.username,
                                            email: form.email,
                                            password: form.password,
                                            imageUrl: '',
                                            firstName: form.firstName,
                                            lastName: form.lastName,
                                            phoneNumber: form.phoneNumber,
                                            role: form.role || 'Admin',
                                        });
                                        adminId = admin.id;
                                        setCreatedAdminId(adminId);
                                        setAlert({ message: 'Admin created! Now uploading image...', type: 'success' });
                                    } catch (error) {
                                        let msg = '';
                                        if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
                                            msg = (error as { message: string }).message;
                                        }
                                        setAlert({ message: msg || 'Failed to create admin', type: 'error' });
                                        return;
                                    }
                                }
                                setUploading(true);
                                try {
                                    const arrayBuffer = await selectedFile.arrayBuffer();
                                    const uint8Array = new Uint8Array(arrayBuffer);
                                    const imageUrl = await uploadAdminImage.mutateAsync({
                                        adminId,
                                        filename: selectedFile.name,
                                        body: Array.from(uint8Array),
                                        contentType: selectedFile.type,
                                    });
                                    setForm(f => ({ ...f, imageUrl }));
                                    setAlert({ message: 'Profile image uploaded successfully!', type: 'success' });
                                    setTempImageUrl('');
                                    setSelectedFile(null);
                                } catch (err) {
                                    if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: string }).message === 'string') {
                                        setUploadError((err as { message: string }).message);
                                    } else {
                                        setUploadError('Failed to upload image');
                                    }
                                } finally {
                                    setUploading(false);
                                }
                            }}
                        >
                            Upload Image
                        </button>
                    )}
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 cursor-pointer py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={createAdmin.isPending}
                    >
                        {createAdmin.isPending ? <Loader2 className="animate-spin w-5 h-5 inline-block" /> : 'Create Admin'}
                    </button>
                </form>
                <button onClick={() => router.push('/dashboard/admin')} className="block mx-auto mt-4 text-center w-fit h-fit cursor-pointer text-red-500 hover:underline">Cancel</button>
            </div>
        </ComponentCard>
    );
}