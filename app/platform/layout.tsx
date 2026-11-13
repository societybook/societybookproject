import { PlatformSidebar } from "@/components/platform/PlatformSidebar";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex antialiased selection:bg-zinc-800">
      <PlatformSidebar />
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
