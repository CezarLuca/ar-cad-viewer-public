export default function Footer() {
    return (
        <footer className="w-full bg-gray-100/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-800 py-4 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <p>
                    &copy; {new Date().getFullYear()} AR CAD Viewer. All rights
                    reserved.
                </p>
                <div className="flex space-x-4 mt-2 sm:mt-0">
                    <a
                        href="#"
                        className="hover:text-gray-800 dark:hover:text-gray-200"
                    >
                        Privacy Policy
                    </a>
                    <a
                        href="#"
                        className="hover:text-gray-800 dark:hover:text-gray-200"
                    >
                        Terms of Service
                    </a>
                </div>
            </div>
        </footer>
    );
}
