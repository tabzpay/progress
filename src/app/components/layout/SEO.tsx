import { useEffect } from "react";

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: "website" | "article";
}

export function SEO({
    title,
    description = "Progress: Informal Lending, Reimagined. Track loans, build credit, and maintain healthy financial relationships.",
    keywords = "lending, loans, credit score, debt tracker, informal lending, shared ledger",
    ogImage = "https://progress-app.vercel.app/og-image.png",
    ogType = "website"
}: SEOProps) {
    useEffect(() => {
        // Update Title
        const baseTitle = "Progress";
        document.title = title === "Home" ? `${baseTitle} | Informal Lending` : `${title} | ${baseTitle}`;

        // Update Description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", description);
        } else {
            const head = document.getElementsByTagName('head')[0];
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = description;
            head.appendChild(meta);
        }

        // Update Keywords
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.setAttribute("content", keywords);
        }

        // Update OpenGraph Tags (for social sharing cards)
        const updateOG = (property: string, content: string) => {
            let meta = document.querySelector(`meta[property="${property}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('property', property);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        updateOG('og:title', title);
        updateOG('og:description', description);
        updateOG('og:image', ogImage);
        updateOG('og:type', ogType);
        updateOG('twitter:card', 'summary_large_image');
        updateOG('twitter:title', title);
        updateOG('twitter:description', description);

    }, [title, description, keywords, ogImage, ogType]);

    return null; // This component handles side effects, no UI to render
}
