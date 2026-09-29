import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  description,
  align = "left",
  className,
  id,
}: {
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <h2
        id={id}
        className="font-display text-balance text-2xl leading-[1.2] font-medium tracking-tight text-[#1d2b21] sm:text-3xl sm:leading-[1.18] lg:text-4xl lg:leading-[1.15]"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-2.5 text-sm leading-relaxed text-[#6b7a6e] sm:mt-3 sm:text-[15px]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
