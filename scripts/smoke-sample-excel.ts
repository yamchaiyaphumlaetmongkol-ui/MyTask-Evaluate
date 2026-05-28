import { parseEvaluationTemplateExcel } from "@/lib/excel/parse-evaluation-template";
import { readEvaTemplateArrayBuffer } from "@/lib/excel/eva-template-file";

async function main() {
  const file = readEvaTemplateArrayBuffer();
  const r = await parseEvaluationTemplateExcel({
    file,
    selectedSheet: "66038",
    selectedPeriod: "H2",
  });
  if (!r.success) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          errors: r.diagnostics.filter((d) => d.severity === "error"),
        },
        null,
        2,
      ),
    );
    return;
  }
  const s = r.structure;
  console.log(
    JSON.stringify(
      {
        ok: true,
        suggestedName: s.suggestedName,
        heads: s.heads.length,
        subs: s.heads.reduce((n, h) => n + h.subs.length, 0),
        criteria: s.heads.reduce(
          (n, h) => n + h.subs.reduce((x, sub) => x + sub.details.length, 0),
          0,
        ),
        proportionTotal: s.heads.reduce((n, h) => n + h.proportion, 0),
        headTopics: s.heads.map((h) => `${h.headTopic} (${h.proportion}%)`),
      },
      null,
      2,
    ),
  );
}

void main();
