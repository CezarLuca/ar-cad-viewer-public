import CompleteRegistrationForm from "@/components/auth/CompleteRegForm";

const CompleteRegistrationPage = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-500">
            <div className="bg-gray-700 shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-3xl">
                <h2 className="text-2xl text-gray-700 font-bold mb-4">
                    Complete Registration
                </h2>
                <CompleteRegistrationForm />
            </div>
        </div>
    );
};

export default CompleteRegistrationPage;
