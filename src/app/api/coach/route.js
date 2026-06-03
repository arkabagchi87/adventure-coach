// Gemini API route — server-side only. API key never exposed to frontend.
export async function POST(request) {
  return Response.json({ message: 'Coach API — coming in Step 8' }, { status: 200 })
}
