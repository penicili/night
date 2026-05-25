import { defineMiddleware } from 'astro:middleware';
import { verifySessionToken } from './lib/auth';

const PUBLIC_ADMIN_PATHS = ['/admin/login'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.includes(pathname)) {
    const token = context.cookies.get('admin_session')?.value;

    const valid = token ? await verifySessionToken(token) : false;

    if (!valid) {
      return context.redirect('/admin/login');
    }
  }

  return next();
});
