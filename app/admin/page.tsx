import type { Metadata } from "next";
import content from "@/content/site.json";
import catalogue from "@/content/products.json";
import materials from "@/content/materials.json";
import { isAdminConfigured, isSignedIn } from "@/lib/admin-auth";
import SignIn from "@/components/admin/SignIn";
import AdminPanel from "@/components/admin/AdminPanel";
import type {
  MaterialsContent,
  ProductsContent,
  SiteContent,
} from "@/lib/content-schema";

/* Rendered per request — it depends on the sign-in cookie, so it must never be
   cached or prerendered. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  // Keep it out of Google. It's password-gated anyway, but there's no reason
  // for it to be listed.
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const signedIn = await isSignedIn();

  return (
    <div className="container-page py-12 lg:py-16">
      {signedIn ? (
        <>
          <div className="mb-8 flex flex-col gap-2">
            <p className="eyebrow">Admin</p>
            <h1 className="text-4xl">Edit the site</h1>
            <p className="max-w-prose text-sm text-cream-2">
              Everything the website says lives here. Design and layout are
              fixed — this is the words.
            </p>
          </div>
          <AdminPanel
            initial={content as unknown as SiteContent}
            initialProducts={catalogue as unknown as ProductsContent}
            initialMaterials={materials as unknown as MaterialsContent}
          />
        </>
      ) : (
        <SignIn configured={isAdminConfigured()} />
      )}
    </div>
  );
}
