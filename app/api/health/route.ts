export async function GET() {
  return Response.json({
    status: "ok",
    service: "societybook",
    timestamp: new Date().toISOString(),
  });
}

