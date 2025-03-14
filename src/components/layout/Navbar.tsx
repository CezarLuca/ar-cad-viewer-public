import Link from "next/link";

interface NavbarProps {
    rightContent?: React.ReactNode;
}

export default function Navbar({ rightContent }: NavbarProps) {
    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 z-50">
            <div className="flex items-center">
                <Link href="/" className="text-xl font-bold">
                    AR CAD Viewer
                </Link>
            </div>

            <div className="flex items-center">{rightContent}</div>
        </header>
    );
}
