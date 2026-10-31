const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vyapar-sathi.vercel.app';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/features', '/about', '/documents', '/login', '/signUp'],
        disallow: [
          '/storeDashboard',
          '/storeDashboard/*',
          '/createStore',
          '/invite/*',
          '/profile',
          '/settings',
          '/api/*',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

