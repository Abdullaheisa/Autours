"use client";

// This route now delegates to the EditBlog component via the main dashboard.
// Keeping this file to avoid broken routes.
// The dashboard handles blog creation inline via state.

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateArticleRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard blogs section
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <span className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin inline-block mb-4" />
        <p className="text-gray-500 text-sm font-medium">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
