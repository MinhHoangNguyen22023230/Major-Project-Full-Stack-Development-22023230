// Edit Order Page: Edit order fields and order items, with error handling and UI feedback
'use client';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/app/_trpc/client';
import { useSidebar } from '@/app/SidebarContext';
import ComponentCard from '@/components/ui/ComponentCard';
import Alert from '@/components/ui/Alert';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

type OrderItem = {
    id: string;
    productId: string;
    quantity: number;
    price: number;
};

export default function EditOrder() {
    const { orderId } = useParams<{ orderId: string }>();
    const { isOpen } = useSidebar();
    const router = useRouter();
    const { data, isLoading, isError } = trpc.crud.findOrderById.useQuery({ id: orderId || '' });
    const updateOrder = trpc.crud.updateOrder.useMutation();
    const updateOrderItem = trpc.crud.updateOrderItem.useMutation();
    const [form, setForm] = useState({ status: '' });
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [originalOrderItems, setOriginalOrderItems] = useState<OrderItem[]>([]);
    const [alert, setAlert] = useState<{ message: string; type?: 'info' | 'success' | 'warning' | 'error' } | null>(null);

    useEffect(() => {
        if (data) {
            setForm({
                status: data.status || '',
            });
            // Use totalPrice from backend as price in local state
            const items = (data.orderItems || []).map((item) => ({
                id: item.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.totalPrice ?? 0,
            }));
            setOrderItems(items);
            setOriginalOrderItems(items);
        }
    }, [data]);

    if (!orderId) {
        return <div className='flex justify-center items-center text-center w-full min-h-screen'>Order ID not found</div>;
    }
    if (isLoading) {
        return <div className='flex justify-center items-center text-center w-full min-h-screen text-blue-500'><Loader2 className='w-10 h-10 animate-spin' /></div>;
    }
    if (isError) {
        return <div className='flex justify-center items-center text-center w-full min-h-screen text-3xl text-red-500'>Error loading order</div>;
    }
    if (!data) {
        return <div className='flex justify-center items-center text-center w-full min-h-screen text-3xl text-yellow-500'>Order data not found</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleOrderItemChange = (idx: number, field: string, value: string | number) => {
        setOrderItems(items => {
            // Always use the original per-item price for correct calculation
            return items.map((item, i) => {
                if (i !== idx) return item;
                if (field === 'quantity') {
                    // Find the original item for this id
                    const original = originalOrderItems.find(oi => oi.id === item.id);
                    if (!original || original.quantity === 0) return item;
                    // Always use original price/original quantity for per-item price
                    const perItemPrice = original.price / original.quantity;
                    const newQuantity = Number(value);
                    return {
                        ...item,
                        quantity: newQuantity,
                        price: perItemPrice * newQuantity,
                    };
                }
                return { ...item, [field]: value };
            });
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Update each order item quantity if changed
            await Promise.all(orderItems.map(async (item) => {
                const original = originalOrderItems.find(oi => oi.id === item.id);
                if (original && item.quantity !== original.quantity) {
                    await updateOrderItem.mutateAsync({
                        id: item.id,
                        data: {
                            quantity: item.quantity,
                            totalPrice: item.price,
                        },
                    });
                }
            }));
            // Update order status (and optionally totalPrice/itemsCount if needed)
            await updateOrder.mutateAsync({
                id: orderId,
                data: {
                    status: form.status,
                    // Optionally update totalPrice/itemsCount here if needed
                },
            });
            setAlert({ message: 'Order updated successfully!', type: 'success' });
            setTimeout(() => router.push('/dashboard/order'), 1000);
        } catch (error) {
            let msg = '';
            if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
                msg = (error as { message: string }).message;
            }
            setAlert({ message: msg || 'Failed to update order', type: 'error' });
        }
    };

    return (
        <ComponentCard
            className={`${isOpen ? 'sm:w-[calc(90vw-280px)]' : 'w-[90vw]'}`}
            title={`Edit Order`}
            breadcrumb={
                <>
                    <Link href="/dashboard" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">home</Link>
                    {' > '}
                    <Link href="/dashboard/order" className="cursor-pointer hover:text-blue-500 transition-colors duration-100">order</Link>
                    {' > '}
                    <span className="text-blue-500">edit</span>
                </>
            }
        >
            <div className='main-section p-4'>
                {alert && (
                    <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl mx-auto mt-8">
                    <label className="font-semibold">
                        Status
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full mt-1"
                            required
                        >
                            <option value="">Select status</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </label>
                    <div className="mt-6">
                        <h2 className="font-bold text-lg mb-2">Order Items</h2>
                        <div className="flex flex-col gap-2">
                            {orderItems.map((item, idx) => (
                                <div key={item.id || idx} className="border rounded p-3 flex flex-col gap-2 bg-gray-50">
                                    <div className="flex gap-4">
                                        <span className="font-semibold">Product ID:</span>
                                        <span>{item.productId}</span>
                                    </div>
                                    <label className="font-semibold">
                                        Quantity
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            min="1"
                                            onChange={e => handleOrderItemChange(idx, 'quantity', Number(e.target.value))}
                                            className="border rounded px-3 py-2 w-full mt-1"
                                            required
                                        />
                                    </label>
                                    <div className="font-semibold">
                                        Price: <span className="font-normal">${item.price.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 font-bold text-right">
                            Total: ${orderItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 cursor-pointer py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={updateOrder.isPending}
                    >
                        {updateOrder.isPending ? <Loader2 className="animate-spin w-5 h-5 inline-block" /> : 'Update Order'}
                    </button>
                </form>
                <button onClick={() => router.push('/dashboard/order')} className="block mx-auto mt-4 text-center w-fit h-fit cursor-pointer text-red-500 hover:underline">Cancel</button>
            </div>
        </ComponentCard>
    );
}