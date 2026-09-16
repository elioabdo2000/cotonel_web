// Edit this file with your real details.

export const site = {
  name: "Cotonel",
  tagline: "Where comfort meets elegance",
  owner: "Samar Abdo",
  city: "Rait-Zahlé, Lebanon",
  instagram: "https://www.instagram.com/cotonel.lb",

  // Lebanese mobile number, international format, digits only (no +, spaces
  // or dashes).
  whatsappNumber: "9613446477",
};

// Builds a wa.me link that opens WhatsApp with a pre-filled message.
// WhatsApp's click-to-chat links can only pre-fill text, never attach a
// photo directly — that's a WhatsApp platform limit, not something this
// site can work around. Passing imageUrl appends the photo's direct link
// to the message instead, so WhatsApp typically renders it as a preview
// card once the customer hits Send.
export function whatsappLink(productName: string, imageUrl?: string) {
  const lines = [`Hi! I'm interested in the ${productName} — is it available?`];
  if (imageUrl) lines.push(imageUrl);
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(lines.join("\n\n"))}`;
}
