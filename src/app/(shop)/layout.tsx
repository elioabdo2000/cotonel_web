import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import ProductModalProvider from "@/components/ProductModalContext";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProductModalProvider>
      <Nav />
      <main>{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </ProductModalProvider>
  );
}
