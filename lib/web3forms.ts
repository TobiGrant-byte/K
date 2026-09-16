const WEB3FORMS_ACCESS_KEY = "491e7ee9-f5a0-4295-9665-23a72925f4ab";

export type Web3FormsPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  botcheck?: boolean;
};

export async function submitWeb3Form(payload: Web3FormsPayload): Promise<void> {
  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: payload.subject || "New message to Dr. Okafor ",
      from_name: "Dr. Sunday Okafor Website Form Submission",
      name: payload.name,
      email: payload.email,
      message: payload.message,
      botcheck: payload.botcheck ? true : false,
    }),
  });

  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
  };

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to send your message right now.");
  }
}

/** Build post-reply mail fields, filling gaps with anonymous placeholders. */
export function buildPostReplyMail(input: {
  postTitle: string;
  name?: string;
  email?: string;
  message: string;
  anonymous?: boolean;
}): Web3FormsPayload {
  const anonymous = Boolean(input.anonymous) || !input.name?.trim();
  const name = anonymous
    ? "Anonymous Anonymous"
    : input.name!.trim();
  const email = input.email?.trim() || "no email";
  const prefix = `You are receiving this email as a reply based on your post: ${input.postTitle}`;
  return {
    name,
    email,
    subject: `Reply to your post: ${input.postTitle}`,
    message: `${prefix}\n\n${input.message.trim()}`,
  };
}
