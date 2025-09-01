// RSS feed has been removed; respond with 410 Gone
export async function GET() {
  return new Response("RSS feed has been removed", {
    status: 410,
    headers: { "Content-Type": "text/plain" },
  });
}


