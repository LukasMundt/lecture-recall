import { cn } from "@/lib/utils";
import { Check, Loader } from "lucide-react";

export type SavingStatus = 'saving' | 'saved' | 'unsaved';

export default function SaveStatusIndicator({ status }: { status: SavingStatus }) {
    return (
        <div className="SaveStatusIndicator bg-white w-fit mt-3 rounded-md">
            <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md shadow-sm",
                status === 'saved' && "bg-green-500/10 opacity-100 text-green-500",
                status === 'saving' && "bg-blue-500/10 text-blue-500",
                status === 'unsaved' && "bg-yellow-500/10 text-yellow-500"
            )}>
                {status === 'saved' && <Check className="h-4 w-4" />}
                {status === 'saving' && <Loader className="h-4 w-4 animate-spin" />}
                <span>
                    {status === 'saved' && "Gespeichert"}
                    {status === 'saving' && "Wird gespeichert..."}
                    {status === 'unsaved' && "Nicht gespeichert"}
                </span>
            </div>
        </div>
    );
}
