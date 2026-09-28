import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wittaya.lawslane.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/education-admin/',
                    '/profile/',
                    '/my-learning/',
                    '/my-progress/',
                    '/checkout/',
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
