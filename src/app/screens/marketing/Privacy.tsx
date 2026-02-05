import { Header } from "../../components/marketing/Header";
import { Footer } from "../../components/marketing/Footer";

export function Privacy() {
    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
            <Header />
            <main className="pt-20 pb-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose dark:prose-invert">
                    <p className="mb-4">Last updated: February 4, 2026</p>
                    <p className="mb-4">
                        Progress Inc. ("us", "we", or "our") operates the Progress website and mobile application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of Personal Information when you use our Service.
                    </p>
                    <h2 className="text-xl font-bold mt-8 mb-4">Information Collection And Use</h2>
                    <p className="mb-4">
                        We collect information that you provide directly to us when you create an account, create a loan record, or communicate with us. This may include your name, phone number, email address, and details about the loans you record (amounts, dates, names of other parties).
                    </p>
                    <h2 className="text-xl font-bold mt-8 mb-4">Data Security</h2>
                    <p className="mb-4">
                        The security of your Personal Information is important to us. We use bank-level 256-bit encryption to protect your data at rest and in transit. However, remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure.
                    </p>
                    <h2 className="text-xl font-bold mt-8 mb-4">Information Sharing</h2>
                    <p className="mb-4">
                        We do not sell your personal information. We only share your information with the specific other party you choose to share a loan record with, and with third-party service providers who help us operate our Service (e.g., SMS notification providers).
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
