export type ChatMsg = { role: "user" | "assistant"; content: string };

export async function askKai(messages: ChatMsg[], mode: "chat" | "intake" = "chat"): Promise<string> {
  try {
    const res = await fetch("/api/kai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, mode }),
    });
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();
    return data.reply as string;
  } catch {
    return "network blip. try again.";
  }
}
