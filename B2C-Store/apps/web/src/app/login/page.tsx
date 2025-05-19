import LoginForm from "@/components/Login/LoginForm";

export default function Login() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded shadow">
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
                <LoginForm />
            </div>
        </main>
    );
}