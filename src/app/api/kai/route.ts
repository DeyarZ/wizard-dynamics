import { NextRequest, NextResponse } from "next/server";

/**
 * Mocked Kai endpoint.
 *
 * Returns canned replies matching Kai's voice (blunt, lowercase, operator-tone).
 * Swap the body of `replyFor()` for a real LLM call whenever you're ready.
 */

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_REPLIES = [
  "we build apps, grow them, automate the boring parts. 100+ shipped. munich.",
  "no meetings. pitch in one email. we ship in 3 weeks or refund you.",
  "two founders + me. i handle ops so deyar + manuel can build.",
  "agencies sell you decks. we send receipts. $240k arr says enough.",
  "honest? the pace isn't for everyone. we move fast, break things, fix them before anyone notices.",
  "pricing's typically $15k–$80k, 3–8 weeks. depends what you're building.",
  "we don't do discovery calls. one email, yes or no same day.",
];

const INTAKE_STEPS = [
  "what are you building? one line.",
  "is it live yet, an mvp, or still an idea?",
  "when do you need it shipped?",
  "ballpark budget? be honest, i won't flinch.",
  "drop your email — i'll route this to the founders.",
  "got it. routed to deyar + manuel. expect a reply within 24h.",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function chatReply(messages: Msg[]): string {
  const last = messages[messages.length - 1]?.content.toLowerCase() ?? "";
  if (/price|cost|how much|budget|charge/.test(last)) {
    return "typical projects land between $15k–$80k, 3–8 weeks. depends what you need.";
  }
  if (/meeting|call|schedule|discovery/.test(last)) {
    return "we don't do calls. pitch in one email, i reply same day.";
  }
  if (/fast|ship|speed|quick/.test(last)) {
    return "no meetings, no retainers, no kickoffs. just shipping.";
  }
  if (/hire|agency|why/.test(last)) {
    return "agencies sell process. we sell shipped product. pick which one you actually need.";
  }
  if (/honest|truth|really/.test(last)) {
    return "the pace isn't for everyone. but if you want to ship, this is the place.";
  }
  return pick(CHAT_REPLIES, messages.length);
}

function intakeReply(messages: Msg[]): string {
  const userTurns = messages.filter((m) => m.role === "user").length;
  const idx = Math.min(userTurns, INTAKE_STEPS.length - 1);
  return INTAKE_STEPS[idx];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: Msg[] = body.messages ?? [];
    const mode: "chat" | "intake" = body.mode ?? "chat";
    const reply = mode === "intake" ? intakeReply(messages) : chatReply(messages);
    // small artificial latency for realism
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: "network blip. try again." }, { status: 200 });
  }
}
