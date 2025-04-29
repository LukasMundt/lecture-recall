"use client";
import { useSidebar } from "@/components/ui/sidebar"
import {Button} from "@/components/ui/button";
import {Menu} from "lucide-react";

export function CustomTrigger() {
    const { toggleSidebar } = useSidebar()

    return <Button variant="ghost" onClick={toggleSidebar} size="icon"><Menu/></Button>
}