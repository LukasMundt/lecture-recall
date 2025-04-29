import {Plans} from "@/components/payment/plans/Plans";

export const dynamic = "force-dynamic";

export default function Pricing() {
    return <div className="justify-center w-full">
        <Plans action={"signIn"}/>
    </div>
}