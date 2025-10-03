import { useCallback, useEffect, useState } from "react";

export function UseWriterDemo() {
  const [availability, setAvailability] = useState<"unavailable" | "available" | "downloadable" | "downloading" | null>(null);
  const [writer, setWriter] = useState<any>(null);

  useEffect(() => {
    if (!("Writer" in self)) return;
    // availability() is async—wrap in IIFE
    (async () => {
      try {
        console.log("Writer supported");
        const a = await (self as any).Writer.availability();
        setAvailability(a);
      } catch (err) {
        console.error("Failed to check Writer availability", err);
        setAvailability("unavailable");
      }
    })();
  }, []);

  const startWriter = useCallback(async () => {
    if (!("Writer" in self)) return;
    if (availability === "unavailable" || availability == null) return;

    const options = {
      sharedContext: "This is an email to acquaintances about an upcoming event.",
      tone: "casual",
      format: "plain-text",
      length: "medium",
    };

    try {
      let w;
      if (availability === "available") {
        w = await (self as any).Writer.create(options);
      } else {
        // downloadable / downloading — monitor progress
        w = await (self as any).Writer.create({
          ...options,
          monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
              const pct = Math.round((e.loaded ?? 0) * 100);
              console.log(`Downloaded ${pct}%`);
            });
          },
        });
      }
      setWriter(w);
    } catch (err) {
      console.error("Failed to create Writer", err);
    }
  }, [availability]);

  useEffect(() => {
    return () => {
      // cleanup if you created a writer
      try { writer?.destroy?.(); } catch {}
    };
  }, [writer]);

  return (
    <div>
      <p>Availability: {availability ?? "checking…"}</p>
      <button onClick={startWriter} disabled={availability === "unavailable"}>
        Start Writer
      </button>
    </div>
  );
}
