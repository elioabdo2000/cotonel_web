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
export function whatsappLink(productName: string) {
  const message = `Hi! I'm interested in the ${productName} — is it available?`;
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
