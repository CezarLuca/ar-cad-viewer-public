import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h2 className="text-2xl font-bold mb-4">Register</h2>
                <RegisterForm />
            </div>
        </div>
    );
}
