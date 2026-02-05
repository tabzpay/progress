import { Header } from "../../components/marketing/Header";
import { Footer } from "../../components/marketing/Footer";

export function Terms() {
    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
            <Header />
            <main className="pt-20 pb-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
                <div className="prose dark:prose-invert">
                    <p className="mb-4">Last updated: February 4, 2026</p>
                    <p className="mb-4">
                        Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Progress website and mobile application (the "Service") operated by Progress Inc. ("us", "we", or "our").
                    </p>
                    <h2 className="text-xl font-bold mt-8 mb-4">1. Accounts</h2>
                    <p className="mb-4">
                        When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                    </p>
                    <h2 className="text-xl font-bold mt-8 mb-4">2. Loan Agreements</h2>
                    <p className="mb-4">
                        Progress provides a platform for recording informal loan agreements between parties. We are not a lender, bank, or financial institution. The loan agreements created on our platform are records of mutual understanding between users.
                    </p>
                    <p className="mb-4">
                        We do not guarantee the repayment of any loan recorded on our platform. Users are solely responsible for all financial transactions and risks associated with lending or borrowing money.
                    </p>
                    <h2 className="text-xl font-bold mt-8 mb-4">3. Termination</h2>
                    <p className="mb-4">
                        We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
