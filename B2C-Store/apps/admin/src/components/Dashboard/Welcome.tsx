export default function Welcome() {
    return (
        <div className="main-content p-4 pb-10 pt-10 flex flex-col items-center justify-center text-center gap-6 bg-[var(--background)] text-[var(--foreground)]">
            <h1 className="text-3xl font-bold text-[var(--welcome-title)]">
                Welcome to the B2C Store Admin Dashboard
            </h1>
            <p className="text-lg max-w-2xl text-[var(--welcome-desc)]">
                This is your central hub for managing users, orders, products, and more.
                Use the sidebar to navigate between different sections of the admin panel.
                Here you can:
            </p>
            <ul className="list-disc list-inside text-left text-base max-w-xl mx-auto text-[var(--welcome-list)]">
                <li>
                    <b>View and manage users:</b> Edit user details, reset passwords, and
                    review user activity.
                </li>
                <li>
                    <b>Manage orders:</b> Track, update, and fulfill customer orders
                    efficiently.
                </li>
                <li>
                    <b>Oversee products:</b> Add, update, or remove products from your
                    store catalog.
                </li>
                <li>
                    <b>Access analytics:</b> Monitor sales, user growth, and other key
                    metrics (coming soon).
                </li>
                <li>
                    <b>Configure settings:</b> Update store information, admin accounts,
                    and more.
                </li>
            </ul>
            <div className="mt-6 text-base text-[var(--welcome-tip)]">
                Need help? Visit the documentation or contact support.
                <br />
                <span className="font-semibold">Tip:</span> Use the search bar or
                sidebar for quick navigation.
            </div>
        </div>
    );
}