import { syncPlans } from "@/actions/lemonsqueezy";


type Job = {
    name: string,
    func: () => Promise<void>,
}

export const jobs: Job[] = [
    {
        name: "syncPlans",
        func: async () => {
            await syncPlans();
        }
    }
]