'use client';
import { redirect, useParams } from 'next/navigation'
import { trpc } from '@/app/_trpc/client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from '@/app/SidebarContext';
import ComponentCard from '@/components/ui/ComponentCard';
import { useState, useEffect } from 'react';
import Alert from '@/components/ui/Alert';
import { useRouter } from 'next/navigation';

export default function User() {
    const userId = useParams<{ userId: string }>().userId;
    const { isOpen } = useSidebar();
    const { isLoading, isError, data } = trpc.crud.findUserById.useQuery({ id: userId || '' });
    const [form, setForm] = useState({ username: '', email: '', password: '', imgUrl: '' });
    const [alert, setAlert] = useState<{ message: string; type?: "info" | "success" | "warning" | "error" } | null>(null);
    const router = useRouter();
    const updateUser = trpc.crud.updateUser.useMutation({
        onSuccess: () => {
            setAlert({ message: 'User updated successfully!', type: 'success' });
            router.push('/dashboard/user');
        },
        onError: (error) => {
            // Custom error handling for duplicate email/username
            if (error.message && (error.message.includes('Unique constraint') || error.message.includes('unique') || error.message.includes('Unique constraint failed'))) {
                if (error.message.toLowerCase().includes('email')) {
                    setAlert({ message: 'Email is already in use.', type: 'error' });
                } else if (error.message.toLowerCase().includes('username')) {
                    setAlert({ message: 'Username is already in use.', type: 'error' });
                } else {
                    setAlert({ message: 'Username or email is already in use.', type: 'error' });
                }
            } else {
                setAlert({ message: error.message || 'Failed to update user', type: 'error' });
            }
        }
    });

    useEffect(() => {
        if (data) {
            setForm({
                username: data.username || '',
                email: data.email || '',
                password: '', // Do not prefill password
                imgUrl: data.imgUrl || ''
            });
        }
    }, [data]);

    if (!userId) {
        return <div className='flex justify-center items-center text-center w-full min-h-screen'>User ID not found</div>;
    }

    if (isLoading) {
        return <div className='flex justify-center items-center text-center w-full min-h-screen text-blue-500'><Loader2 className='w-10 h-10 animate-spin' /></div>;
    }

    if (isError) {
        return <div className='flex justify-center items-center text-center w-full min-h-screen text-3xl text-red-500'>Error loading user</div>;
    }

    if (!data) {
        return <div className='flex justify-center items-center text-center w-full min-h-screen text-3xl text-yellow-500'>User data not found</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.username || !form.email) {
            setAlert({ message: 'Username and email are required.', type: 'warning' });
            return;
        }
        if (form.password && form.password.length < 8) {
            setAlert({ message: 'Password must be at least 8 characters.', type: 'warning' });
            return;
        }
        updateUser.mutate({
            id: userId,
            data: {
                username: form.username,
                email: form.email,
                ...(form.password ? { hashedPassword: form.password } : {}),
                imgUrl: form.imgUrl
            }
        });
    };

    return (
        <ComponentCard
            className={`${isOpen ? "sm:w-[calc(90vw-280px)]" : "w-[90vw]"}`}
            title={`Edit User`}
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {" > "}
                    <Link href="/dashboard/user" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">user</Link>
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
                        Username
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                            required
                            placeholder={data.username}
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
                            placeholder={data.email}
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
                            placeholder="Leave blank to keep current password"
                        />
                    </label>
                    <label className="font-semibold">
                        Image URL
                        <input
                            type="text"
                            name="imgUrl"
                            value={form.imgUrl}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                            placeholder={data.imgUrl || 'Image URL'}
                        />
                    </label>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 cursor-pointer py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={updateUser.isPending}
                    >
                        {updateUser.isPending ? <Loader2 className="animate-spin w-5 h-5 inline-block" /> : 'Update User'}
                    </button>
                </form>
                <button onClick={() => router.push('/dashboard/user')} className="block mx-auto mt-4 text-center w-fit h-fit cursor-pointer text-red-500 hover:underline">Cancel</button>
            </div>
        </ComponentCard>
    );
}
