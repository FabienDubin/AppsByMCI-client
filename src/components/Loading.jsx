import { useState, useEffect } from "react";

import { Progress } from "@/components/ui/progress";

const Loading = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progressive animation that simulates loading
    const intervals = [
      { delay: 100, value: 15 },
      { delay: 300, value: 35 },
      { delay: 600, value: 55 },
      { delay: 1000, value: 70 },
      { delay: 2000, value: 80 },
      { delay: 4000, value: 90 },
    ];

    const timers = intervals.map(({ delay, value }) =>
      setTimeout(() => setProgress(value), delay)
    );

    // Slow progression after 4s to show it's still working
    const slowTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + 1;
      });
    }, 500);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(slowTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] w-full gap-4">
      <Progress value={progress} className="w-[60%]" />
      <p className="text-sm text-muted-foreground">Chargement...</p>
    </div>
  );
};

export default Loading;
