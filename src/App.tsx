import { useCallback, useEffect, useState } from "react";

function App() {
  const [availability, setAvailability] = useState<
    "unavailable" | "available" | "downloadable" | "downloading" | null
  >(null);
  const [writer, setWriter] = useState<any>(null);

  const [content, setContent] = useState();
  useEffect(() => {
    if (!("Writer" in self)) return;
    // availability() is async—wrap in IIFE
    (async () => {
      try {
        console.log("Writer supported");
        const a = await (self as any).Writer.availability();
        console.log("Writer.availability() status", a);

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
      sharedContext:
        "This is an email to acquaintances about an upcoming event.",
      tone: "casual",
      format: "plain-text",
      length: "medium",
    };

    try {
      let w;
      if (availability === "available") {
        console.log('if (availability === "available") {', availability);

        w = await (self as any).Writer.create(options);
        console.log("  w = await (self as any).Writer.create(options);", w);
      } else {
        console.log(); // downloadable / downloading — monitor progress;

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
      console.log(w);

      const result = await w.write(
        "An inquiry to my bank about how to enable wire transfers on my account.",
        {
          context: "I'm a longstanding customer",
        }
      );
      console.log("generateContent result", result);

      setContent(result);

      setWriter(w);
    } catch (err) {
      console.error("Failed to create Writer", err);
    }
  }, [availability]);

  useEffect(() => {
    return () => {
      // cleanup if you created a writer
      try {
        writer?.destroy?.();
      } catch {}
    };
  }, [writer]);

  // const generateContent = async () => {};

  return (
    <div>
      <p>Availability: {availability ?? "checking…"}</p>
      <button onClick={startWriter} disabled={availability === "unavailable"}>
        Start Writer
      </button>
      {/* <button
        onClick={generateContent}
        disabled={availability === "unavailable"}
      >
        generateContent
      </button> */}

      <p>{content}</p>
    </div>
  );
}

export default App;
