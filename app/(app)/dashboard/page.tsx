import {Skeleton} from "@/components/ui/skeleton";
import RegisterBreadcrumb from "@/components/breadcrumbs/RegisterBreadcrumb";

export default async function Dashboard() {
    return (
        <div className="flex flex-1 flex-col gap-4 w-full relative">
            <RegisterBreadcrumb newBreadcrumbs={[{title: "Home", url: "/"}]}/>
            <div className="grid gap-4 md:grid-cols-3 w-full">
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
                <Skeleton className="w-full aspect-video"/>
            </div>
            <div className="w-full absolute text-center h-dvh items-center">
                This is your personal dashboard.
            </div>
        </div>
    );


}