import { NextRequest } from "next/server";
export function GET(request: NextRequest) {
    return new Response("Warden Weather Test: OK");
}
