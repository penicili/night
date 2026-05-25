export const prerender = false;
import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;

  await db`DELETE FROM ranks WHERE id = ${id}`;

  return new Response(null, { status: 204 });
};
