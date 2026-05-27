export const prerender = false;
import type { APIRoute } from 'astro';
import { db } from '../../../../lib/db';

export const PUT: APIRoute = async ({ params, request }) => {
  const { command, description } = await request.json();
  await db`UPDATE guide_commands SET command=${command}, description=${description} WHERE id = ${params.id}`;
  return new Response(null, { status: 204 });
};

export const DELETE: APIRoute = async ({ params }) => {
  await db`DELETE FROM guide_commands WHERE id = ${params.id}`;
  return new Response(null, { status: 204 });
};
