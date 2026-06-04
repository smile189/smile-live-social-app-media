import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get("room");
  const username = searchParams.get("username");
  const avatarUrl = searchParams.get("avatar_url") ?? ""; // ← nou

  if (!room || !username) {
    return NextResponse.json({ error: "Lipsesc parametrii 'room' sau 'username'" }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "Configurare server incorectă" }, { status: 500 });
  }

  const isViewer = username.startsWith("viewer-");

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    name: username,                                        // ← nou: apare ca p.name
    metadata: JSON.stringify({ avatar_url: avatarUrl }),   // ← nou: apare ca p.metadata
  });
  at.addGrant({
    roomJoin: true,
    room,
    canPublish: !isViewer,
    canSubscribe: true,
    canPublishData: !isViewer,
  });

  return NextResponse.json({ token: await at.toJwt() });
}