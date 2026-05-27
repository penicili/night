export const prerender = false;
import type { APIRoute } from 'astro';
import { db } from '../../../../lib/db';

export const DELETE: APIRoute = async ({ params }) => {
  await db`DELETE FROM guide_sections WHERE id = ${params.id}`;
  return new Response(null, { status: 204 });
};
