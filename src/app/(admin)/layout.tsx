import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
      <Footer />
    </>
  );
}
