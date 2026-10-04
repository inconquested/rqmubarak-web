import { Card } from "@/components/ui/card";

function Block({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} aria-hidden />;
}

export default function PortalLoading() {
  return (
    <div className="space-y-6" aria-label="Memuat…">
      <div className="space-y-2">
        <Block className="h-8 w-56" />
        <Block className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {["a", "b", "c", "d"].map((k) => (
          <Card key={k} className="space-y-2 p-4 sm:p-5">
            <Block className="h-3 w-20" />
            <Block className="h-8 w-24" />
            <Block className="h-3 w-28" />
          </Card>
        ))}
      </div>
      <Card className="space-y-2.5 p-4 sm:p-5">
        <Block className="h-4 w-44" />
        <Block className="h-2 w-full" />
        <Block className="h-2 w-5/6" />
        <Block className="h-2 w-4/6" />
      </Card>
    </div>
  );
}
