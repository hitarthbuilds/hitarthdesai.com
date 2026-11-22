import { Fragment, type ReactNode } from "react";

/**
 * Splits display text into masked words so a parent with data-reveal="words" can raise them
 * line by line. "\n" starts a new line; `tail` (e.g. the grey full stop) rides on the last word.
 */
export function Words({ text, tail, start = 0 }: { text: string; tail?: ReactNode; start?: number }) {
  const lines = text.split("\n");
  let i = start;
  return (
    <>
      {lines.map((line, li) => {
        const words = line.split(" ").filter(Boolean);
        return (
          <Fragment key={li}>
            {li > 0 && (
              <>
                {" "}
                <br />
              </>
            )}
            {words.map((w, wi) => {
              const last = li === lines.length - 1 && wi === words.length - 1;
              return (
                <Fragment key={wi}>
                  {wi > 0 && " "}
                  <span className="w">
                    <span className="wi" style={{ "--i": i++ } as React.CSSProperties}>
                      {w}
                      {last && tail}
                    </span>
                  </span>
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
    </>
  );
}
