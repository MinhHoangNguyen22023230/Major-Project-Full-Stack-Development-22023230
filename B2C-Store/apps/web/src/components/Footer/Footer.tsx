import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-[var(--supernova)] text-[var(--rangoon-green)] py-6">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={170}
                            height={30}
                            className="cursor-pointer"
                        />
                    </Link>
                    <p className="text-sm">&copy; {new Date().getFullYear()} B2C Store. All rights reserved.</p>
                </div>
                <ul className="flex space-x-6 mt-4 md:mt-0">
                    <li>
                        <Link href="/about" className="hover:text-[var(--gallery)] transition-color">
                            About
                        </Link>
                    </li>
                    <li>
                        <Link href="/contact" className="hover:text-[var(--gallery)] transition-color">
                            Contact
                        </Link>
                    </li>
                    <li>
                        <Link href="/privacy" className="hover:text-[var(--gallery)] transition-color">
                            Privacy Policy
                        </Link>
                    </li>
                    <li>
                        <Link href="/terms" className="hover:text-[var(--gallery)] transition-color">
                            Terms of Service
                        </Link>
                    </li>
                </ul>
            </div>
        </footer>
    );
}