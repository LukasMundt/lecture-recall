import {cn} from "@/lib/utils";
import {CircleCheck} from "lucide-react";

export default function Features({features, className}: {
    readonly features: { included: string[], excluded?: string[] },
    readonly className?: string
}) {
    return <ul className={cn("grid gap-2", className)}>
        {features.included.map((feature, index) => (
            <li key={`feature-${index}`} className="flex items-center gap-3"><CircleCheck
                className="fill-green-600 stroke-white"/>{feature}</li>
        ))}
        {features.excluded ? features.excluded?.map((feature, index) => (
            <li key={`feature-${index}`} className="flex items-center gap-3 text-muted-foreground"><CircleCheck
                className="fill-slate-500 stroke-white"/>{feature}</li>
        )) : ""}
    </ul>
}