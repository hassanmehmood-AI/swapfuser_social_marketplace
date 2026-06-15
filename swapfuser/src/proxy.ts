import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Session protection is handled client-side via useAuth + Supabase RLS policies.
// This proxy is a lightweight pass-through; extend it later with createServerClient
// if server-side route guards are needed.
export function proxy(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
