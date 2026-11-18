"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { DefaultAdminValuesOperations, type CardType } from "~/lib/db";
import { DISCOUNT_PER_USAGE } from "~/constants/event-pricing-defaults";
import { useT } from "~/i18n/i18n-provider";
import { type MessageKey } from "~/i18n/messages/en";
import { ScreenHeader } from "~/components/shell/screen-header";
import { PageBody } from "~/components/ds/page-body";
import { SectionLabel } from "~/components/ds/section-label";
import { CardTypeChip } from "~/components/ds/chip";
import { CARD_TYPE_STYLE } from "~/utils/getCardTypeColor";
import { cn } from "~/lib/utils";

const CARDS: { type: CardType; uses: MessageKey; text: MessageKey }[] = [
  { type: "Medicover", uses: "rules.medicoverUses", text: "rules.medicoverText" },
  { type: "Medicover Light", uses: "rules.mlUses", text: "rules.mlText" },
  { type: "Multisport", uses: "rules.msUses", text: "rules.msText" },
  { type: "Classic", uses: "rules.classicUses", text: "rules.classicText" },
  { type: "No card", uses: "rules.noCardUses", text: "rules.noCardText" },
];

const GENERAL: MessageKey[] = ["rules.general2", "rules.general3", "rules.general4"];

export default function RulesPage() {
  const t = useT();
  const [discount, setDiscount] = useState(DISCOUNT_PER_USAGE);

  useEffect(() => {
    DefaultAdminValuesOperations.getDefaultAdminValues()
      .then((v) => { if (typeof v.discount_per_usage === "number") setDiscount(v.discount_per_usage); })
      .catch(() => undefined);
  }, []);

  const explanation = (
    <section className="flex gap-3 rounded-2xl border border-[#E2D6F5] bg-brand-50 p-3.5 text-brand-900 md:flex-col md:p-5">
      <BookOpen className="mt-0.5 h-[22px] w-[22px] flex-none text-brand-700" aria-hidden="true" />
      <div className="flex flex-col gap-1.5 text-sm leading-relaxed">
        <h2 className="text-[15px] font-extrabold md:text-[17px]">{t("rules.howTitle")}</h2>
        <p>{t("rules.general1", { amount: discount })}</p>
        <ul className="flex list-disc flex-col gap-1.5 pl-4">
          {GENERAL.map((k) => <li key={k}>{t(k)}</li>)}
        </ul>
      </div>
    </section>
  );

  return (
    <>
      <ScreenHeader title={t("rules.title")} />
      <PageBody>
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-start md:gap-5">
          <div className="md:sticky md:top-24 md:flex-[1_1_360px]">{explanation}</div>
          <div className="flex flex-col gap-2 md:flex-[999_1_520px]">
            <SectionLabel>{t("rules.byCard")}</SectionLabel>
            <div className="divide-y divide-[#F0ECF7] rounded-2xl border border-line bg-white px-3 md:px-5">
              {CARDS.map((c) => (
                <article key={c.type} className="flex gap-3 py-3.5">
                  <span className={cn("mt-1.5 h-2.5 w-2.5 flex-none rounded-full", CARD_TYPE_STYLE[c.type].dot)} aria-hidden="true" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-extrabold">{t(`cardType.${c.type}`)}</h3>
                      <CardTypeChip cardType={c.type} short />
                    </div>
                    <div className="text-xs font-bold text-brand-700">{t(c.uses)}</div>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">{t(c.text, { amount: discount })}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}
