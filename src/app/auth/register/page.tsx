import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-500">
            <div className="bg-gray-100 shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg">
                <h2 className="text-2xl text-gray-700 font-bold mb-4">
                    Register
                </h2>
                <RegisterForm />
            </div>
        </div>
    );
}
