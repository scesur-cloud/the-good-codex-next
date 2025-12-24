import Link from 'next/link';
import {
    LayoutDashboard,
    Folder,
    Calendar,
    Users,
    ListTodo,
    Shield,
    HelpCircle,
    Clock,
    Settings
} from 'lucide-react';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const mainNav = [
        { name: 'Genel Bakış', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Projeler', href: '/projects', icon: Folder },
        { name: 'Planlayıcı', href: '/planner', icon: Calendar },
        { name: 'RACI Matrisi', href: '/raci', icon: Users },
        { name: 'İş Listesi', href: '/todo', icon: ListTodo },
        { name: 'Rol Tanımları', href: '/roles', icon: Shield },
        { name: 'Zaman Çizelgesi', href: '/timeline', icon: Clock },
        { name: 'SSS', href: '/faq', icon: HelpCircle },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white shadow-sm">
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center border-b border-slate-200 px-6">
                        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900">
                            <div className="h-6 w-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                                <LayoutDashboard className="h-4 w-4" />
                            </div>
                            <span>Agent Squad</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3 py-4">
                        {mainNav.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${item.href === '/dashboard' || item.href === '/projects'
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon className={`h-4 w-4 group-hover:text-indigo-600 transition-colors ${item.href === '/dashboard' || item.href === '/projects' ? 'text-indigo-600' : 'text-slate-400'
                                    }`} />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-slate-200 p-4">
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                                <div>
                                    <div className="text-sm font-medium text-slate-900">Admin User</div>
                                    <div className="text-xs text-slate-500">v0.9.0 Stable</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 pl-64">
                <div className="min-h-full p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
