export default function OverviewSaaS() {
    return (
        <div className="main-section p-4">
            <h1 className="mb-5 font-bold">Overview</h1>
            <div className="grid grid-cols-2 grid-rows-2">
                <div key={1} className="p-4 four-by-four-border rounded-tl-lg">
                    <p>Total Revenue</p>
                    <h1 className="text-3xl font-bold">9,000 $</h1>
                </div>
                <div key={2} className="p-4 four-by-four-border rounded-tr-lg">
                    <p>Customer Lifetime Value</p>
                    <h1 className="text-3xl font-bold">3,000 $</h1>
                </div>
                <div key={3} className="p-4 four-by-four-border rounded-bl-lg">
                    <p>Current Users</p>
                    <h1 className="text-3xl font-bold">150</h1>
                </div>
                <div key={4} className="p-4 four-by-four-border rounded-br-lg">
                    <p>Customer Acquisition Focus</p>
                    <h1 className="text-3xl font-bold">70%</h1>
                </div>
            </div>
        </div>
    );
}