import Link from "next/link";
import { LayoutDashboard, BookOpen, LogOut } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
                <h1 className="text-xl font-bold mb-8 flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6" />
                    Admin Panel
                </h1>

                <nav className="flex-1 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                        <BookOpen className="w-5 h-5" />
                        <span>Dashboard</span>
                    </Link>
                </nav>

                <Link href="/" className="mt-auto flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span>Exit to App</span>
                </Link>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
