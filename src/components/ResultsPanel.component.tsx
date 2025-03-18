import { FC } from "react";
import { Statistics } from "~/services/calculation-service";

interface ResultsPanelProps {
  statistics: Statistics;
  theme: "light" | "dark";
}

export const ResultsPanel: FC<ResultsPanelProps> = ({ statistics, theme }) => {
  return (
    <>
      <ResultRow title={"Medicover:"} value={statistics.medicover} theme={theme} />
      <ResultRow title={"MS+:"} value={statistics.MS} theme={theme} />
      <ResultRow title={"MS classic:"} value={statistics.msClassic} theme={theme} />
      <ResultRow title={"No card:"} value={statistics.noMs} theme={theme} />
      <ResultRow title={"Total w/o discount:"} value={statistics.totalPrice} theme={theme} />
      <ResultRow title={"Card discount:"} value={statistics.discount} theme={theme} />
      <ResultRow title={"Fame discount:"} value={statistics.fameDiscount} theme={theme} />
      <ResultRow title={"To be paid:"} value={statistics.priceAfterDiscount} theme={theme} />
    </>
  );
};

const ResultRow = ({
  title,
  value,
  theme
}: {
  title: string;
  value: undefined | string;
  theme: "light" | "dark";
}) => {
  const textColor = theme === "light" ? "text-[#241e2f]" : "text-[#E0E1E4]";
  return (
    <div className={"mb-3 flex flex-row justify-between"}>
      <p className={`text-xs font-semibold ${textColor}`}>{title}</p>
      <p className={`text-xs font-semibold ${textColor}`}>
        {value ? value + " PLN" : "—"}
      </p>
    </div>
  );
};
