export default function CategoriesNavBar() {
    return (
        <div className="w-full h-10 flex bg-gray-200">
            <ul className="flex w-full">
                <div className="flex-1 flex justify-center items-center bg-orange-500 hover:bg-gray-500 cursor-pointer">
                    <li className="font-semibold hover:text-blue-500">Category 1</li>
                </div>
                <div className="flex-1 flex justify-center items-center bg-orange-500 hover:bg-gray-500 cursor-pointer">
                    <li className="font-semibold hover:text-blue-500">Category 2</li>
                </div>
                <div className="flex-1 flex justify-center items-center bg-orange-500 hover:bg-gray-500 cursor-pointer">
                    <li className="font-semibold hover:text-blue-500">Category 3</li>
                </div>
                <div className="flex-1 flex justify-center items-center bg-orange-500 hover:bg-gray-500 cursor-pointer">
                    <li className="font-semibold hover:text-blue-500">Category 4</li>
                </div>
                <div className="flex-1 flex justify-center items-center bg-orange-500 hover:bg-gray-500 cursor-pointer">
                    <li className="font-semibold hover:text-blue-500">Category 5</li>
                </div>
            </ul>
        </div>
    );
}