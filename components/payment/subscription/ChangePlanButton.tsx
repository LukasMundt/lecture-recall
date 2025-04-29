import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ChangePlan({planId}: { readonly planId: number }) {
    return (
        <Button size="sm" variant="outline" asChild>
            <Link href={`/billing/change-plans/${planId}`}>
                Plan ändern
            </Link>
        </Button>
    );
}