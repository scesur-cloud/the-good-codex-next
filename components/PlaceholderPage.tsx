
import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <Construction className="h-10 w-10 text-slate-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                <p className="text-slate-400 mt-2 max-w-md">
                    Bu modül yapım aşamasındadır. v1.0 sürümü ile birlikte aktif edilecektir.
                </p>
            </div>
        </div>
    );
}
