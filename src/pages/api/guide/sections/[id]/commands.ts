export const prerender = false;
import type { APIRoute } from 'astro';
import { db } from '../../../../../lib/db';

export const POST: APIRoute = async ({ params, request }) => {
  const { command, description } = await request.json();
  const sectionId = params.id;

  const [maxRow] = await db`SELECT COALESCE(MAX(sort_order), 0) AS max FROM guide_commands WHERE section_id = ${sectionId}`;
  const sort_order = (maxRow?.max ?? 0) + 1;

  const [cmd] = await db`
    INSERT INTO guide_commands (section_id, command, description, sort_order)
    VALUES (${sectionId}, ${command}, ${description}, ${sort_order})
    RETURNING id
  `;

  return new Response(JSON.stringify({ id: cmd.id }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
