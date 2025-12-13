import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
    // Get the Accept-Language header to detect user's preferred language
    const acceptLanguage = request.headers.get('accept-language') || '';

    // Get the pathname to check if locale is already specified
    const { pathname } = request.nextUrl;

    // If the path already has a locale prefix, don't override
    const pathnameHasLocale = routing.locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (!pathnameHasLocale && pathname === '/') {
        // Detect locale based on Accept-Language header
        let detectedLocale = routing.defaultLocale;

        // Check for Portuguese (Brazil)
        if (acceptLanguage.includes('pt-BR') || acceptLanguage.includes('pt')) {
            detectedLocale = 'pt';
        }
        // Check for Spanish (Latin America and Spain)
        else if (
            acceptLanguage.includes('es-MX') ||
            acceptLanguage.includes('es-AR') ||
            acceptLanguage.includes('es-CO') ||
            acceptLanguage.includes('es-CL') ||
            acceptLanguage.includes('es-PE') ||
            acceptLanguage.includes('es-VE') ||
            acceptLanguage.includes('es-EC') ||
            acceptLanguage.includes('es-GT') ||
            acceptLanguage.includes('es-CU') ||
            acceptLanguage.includes('es-BO') ||
            acceptLanguage.includes('es-DO') ||
            acceptLanguage.includes('es-HN') ||
            acceptLanguage.includes('es-PY') ||
            acceptLanguage.includes('es-SV') ||
            acceptLanguage.includes('es-NI') ||
            acceptLanguage.includes('es-CR') ||
            acceptLanguage.includes('es-PA') ||
            acceptLanguage.includes('es-UY') ||
            acceptLanguage.includes('es-ES') ||
            acceptLanguage.includes('es')
        ) {
            detectedLocale = 'es';
        }
        // Default to English for US, Europe, and others
        else {
            detectedLocale = 'en';
        }

        // Redirect to the detected locale
        const url = request.nextUrl.clone();
        url.pathname = `/${detectedLocale}${pathname}`;
        return Response.redirect(url);
    }

    return intlMiddleware(request);
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(en|es|pt)/:path*']
};
