"use client";

import {LifeBuoy} from "lucide-react";
import {Button} from "./ui/button";
import {useNextStep} from "nextstepjs";
import {useHover} from "@uidotdev/usehooks";
import {useRouter} from "next/navigation";

export default function StartTourButton({
  tourName,
  startUrl,
}: {
  readonly tourName: string;
  readonly startUrl?: string;
}) {
  const [ref, hovering] = useHover();
  const router = useRouter();
  const { startNextStep } = useNextStep();

  const onClickHandler = (tourName: string) => {
    if(startUrl != undefined) {
      router.push(startUrl);
    }
    startNextStep(tourName);
  };

  return (
    <Button
      size={hovering ? "default" : "icon"}
      className="rounded-r-none"
      variant="destructive"
      aria-label="Tour starten"
      title="Tour starten"
      data-umami-event={"start-tour-triggered-{"+tourName+"}"}
      onClick={() => onClickHandler(tourName)}
      ref={ref}
      type="button"
    >
      {hovering ? <span>Tour starten</span> : <LifeBuoy />}
    </Button>
  );
}
