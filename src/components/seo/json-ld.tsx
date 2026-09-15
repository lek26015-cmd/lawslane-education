/**
 * JSON-LD Structured Data สำหรับ SEO
 * ช่วยให้ Google เข้าใจโครงสร้างเว็บไซต์
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://education.lawslane.com';

export function OrganizationJsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'Lawslane Wittaya',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        description: 'แหล่งรวมข้อสอบกฎหมายย้อนหลังทุกชั้นปี หนังสือเตรียมสอบตั๋วทนาย พร้อม AI ช่วยตรวจอัตนัย',
        sameAs: [
            'https://lawslane.com',
            'https://www.facebook.com/lawslane',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            url: 'https://lin.ee/CZzSmHr',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export function WebsiteJsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Lawslane Wittaya',
        url: SITE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/exams?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export function ExamCollectionJsonLd({ totalExams }: { totalExams: number }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'คลังข้อสอบกฎหมาย — Lawslane Wittaya',
        description: `รวมข้อสอบกฎหมายกว่า ${totalExams} ชุด ครบทุกชั้นปีและตั๋วทนายความ`,
        url: `${SITE_URL}/exams`,
        isPartOf: {
            '@type': 'WebSite',
            name: 'Lawslane Wittaya',
            url: SITE_URL,
        },
        provider: {
            '@type': 'EducationalOrganization',
            name: 'Lawslane Wittaya',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export function BookJsonLd({ title, description, price, author }: {
    title: string;
    description: string;
    price: number;
    author: string;
}) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Book',
        name: title,
        description,
        author: { '@type': 'Person', name: author },
        offers: {
            '@type': 'Offer',
            price,
            priceCurrency: 'THB',
            availability: 'https://schema.org/InStock',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export function ArticleJsonLd({ title, description, author, publishedAt, url }: {
    title: string;
    description: string;
    author: string;
    publishedAt: string;
    url: string;
}) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        author: { '@type': 'Person', name: author },
        datePublished: publishedAt,
        publisher: {
            '@type': 'Organization',
            name: 'Lawslane Wittaya',
            url: SITE_URL,
        },
        mainEntityOfPage: url,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
