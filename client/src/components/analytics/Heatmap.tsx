import { useMemo } from "react";
import { eachDayOfInterval, endOfWeek, format, startOfWeek, subDays } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatMinutes } from "@/lib/utils";
import type { HeatmapDay } from "@/types/analytics";
import { cn } from "@/lib/utils";

const LEVEL_CLASS = [
  "bg-muted/50",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function Heatmap({ data, onSelectDay, days = 365 }: { data: HeatmapDay[]; onSelectDay?: (date: string) => void; days?: number }) {
  const byDate = useMemo(() => new Map(data.map((d) => [d.date, d])), [data]);

  const weeks = useMemo(() => {
    const end = endOfWeek(new Date(), { weekStartsOn: 0 });
    const start = startOfWeek(subDays(new Date(), days), { weekStartsOn: 0 });
    const allDays = eachDayOfInterval({ start, end });
    const cols: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) cols.push(allDays.slice(i, i + 7));
    return cols;
  }, [days]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1.5">
          {/* Month labels */}
          <div className="flex gap-[3px] pl-8 text-[10px] text-muted-foreground">
            {weeks.map((week, i) => {
              const first = week[0];
              const showMonth = first.getDate() <= 7;
              return (
                <div key={i} className="w-[13px] shrink-0">
                  {showMonth ? MONTHS[first.getMonth()] : ""}
                </div>
              );
            })}
          </div>

          <div className="flex gap-[3px]">
            {/* Weekday labels */}
            <div className="flex w-6 flex-col gap-[3px] pr-1 text-[9px] text-muted-foreground">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <div key={i} className="h-[13px] leading-[13px]">
                  {d}
                </div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const entry = byDate.get(key);
                  const level = entry?.count ?? 0;
                  const future = day > new Date();
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <button
                          disabled={future}
                          onClick={() => onSelectDay?.(key)}
                          className={cn(
                            "h-[13px] w-[13px] rounded-[3px] transition-transform hover:scale-125 hover:ring-1 hover:ring-primary",
                            future ? "bg-transparent" : LEVEL_CLASS[level]
                          )}
                        />
                      </TooltipTrigger>
                      {!future && (
                        <TooltipContent>
                          <p className="font-medium">{format(day, "MMM d, yyyy")}</p>
                          <p className="text-muted-foreground">
                            {entry ? `${formatMinutes(entry.minutes)} · ${entry.tasks} tasks` : "No activity"}
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1.5 pt-1 text-[10px] text-muted-foreground">
            Less
            {LEVEL_CLASS.map((c, i) => (
              <span key={i} className={cn("h-[11px] w-[11px] rounded-[3px]", c)} />
            ))}
            More
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
