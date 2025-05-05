import { FC } from "react";
import { Statistics } from "~/services/calculation-service";

interface ResultsPanelProps {
  statistics: Statistics;
}

export const ResultsPanel: FC<ResultsPanelProps> = ({ statistics }) => {
  return (
    <>
      <ResultRow title={"Medicover:"} value={statistics.medicover} />
      <ResultRow title={"MS+:"} value={statistics.MS} />
      <ResultRow title={"MS classic:"} value={statistics.msClassic} />
      <ResultRow title={"No card:"} value={statistics.noMs} />
      <ResultRow title={"Total w/o discount:"} value={statistics.totalPrice} />
      <ResultRow title={"Card discount:"} value={statistics.discount} />
      <ResultRow title={"Fame discount:"} value={statistics.fameDiscount} />
      <ResultRow title={"To be paid:"} value={statistics.priceAfterDiscount} />
    </>
  );
};

const ResultRow = ({
  title,
  value,
}: {
  title: string;
  value: undefined | string;
}) => {
  return (
    <div className={"mb-3 flex flex-row justify-between"}>
      <p className="text-xs font-semibold text-[#241e2f]">{title}</p>
      <p className="text-xs font-semibold text-[#241e2f]">
        {value ? value + " PLN" : "—"}
      </p>
    </div>
  );
};
