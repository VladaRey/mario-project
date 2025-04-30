"use client";

import { useState, useEffect, PropsWithChildren, FC } from "react";
import { calculateStatistics } from "~/services/calculation-service";
import { transformState } from "~/utils/util";
import { Input } from "~/components/ui/input";
import { ResultsPanel } from "./ResultsPanel.component";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { type Statistics } from "~/services/calculation-service";

interface FfpFormProps {
  mc: number;
  ms: number;
  msc: number;
  nc: number;
  onCalculate: (stats: Statistics) => void;
  theme: "light" | "dark";
}

export function FfpForm({ mc, ms, msc, nc, onCalculate, theme }: FfpFormProps) {
  const playersCount = mc + ms + msc + nc;
  const courtCount = Math.ceil(playersCount / 4);

  const defaultMedicoverUsage = mc * 2;
  const allowedMsUsage = courtCount * 2 * 2;
  const possibleMSUsage = ms * 2 + msc;
  const realMSUsage = Math.min(allowedMsUsage, possibleMSUsage);

  const [courts, setCourts] = useState(String(courtCount));
  const [hours, setHours] = useState("2");
  const [pricePerHour, setPricePerHour] = useState("55");
  const [fameTotal, setFameTotal] = useState("");
  const [mCoverOwners, setMCoverOwners] = useState(String(mc));
  const [msOwners, setMSOwners] = useState(String(ms));
  const [msClassicOwners, setMSClassicOwners] = useState(String(msc));
  const [noCard, setNoCard] = useState(String(nc));
  const [mCoverUsage, setMCoverUsage] = useState(String(defaultMedicoverUsage));
  const [msUsage, setMSUsage] = useState(String(realMSUsage));

  const statistics = calculateStatistics(
    transformState({
      courts,
      hours,
      pricePerHour,
      fameTotal,
      mCoverOwners,
      msOwners,
      msClassicOwners,
      noCard,
      mCoverUsage,
      msUsage,
    }),
  );

  useEffect(() => {
    onCalculate(statistics);
  }, [
    statistics.medicover,
    statistics.MS,
    statistics.msClassic,
    statistics.noMs,
    statistics.totalPrice,
  ]);

  return (
    <div>
      <Row>
        <Column>
          <Label>Courts</Label>
          <Select value={courts} onValueChange={setCourts}>
            <SelectTrigger className={`w-full ${theme === "light" ? "border-[#241e2f]" : ""}`}>
              <SelectValue defaultValue={"1"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"1"}>1</SelectItem>
                <SelectItem value={"2"}>2</SelectItem>
                <SelectItem value={"3"}>3</SelectItem>
                <SelectItem value={"4"}>4</SelectItem>
                <SelectItem value={"5"}>5</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Column>
        <Column>
          <Label>Hours</Label>
          <Select value={hours} onValueChange={setHours}>
            <SelectTrigger className={`min-w-full ${theme === "light" ? "border-[#241e2f]" : ""}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"1"}>1</SelectItem>
                <SelectItem value={"1.5"}>1.5</SelectItem>
                <SelectItem value={"2"}>2</SelectItem>
                <SelectItem value={"2.5"}>2.5</SelectItem>
                <SelectItem value={"3"}>3</SelectItem>
                <SelectItem value={"3.5"}>3.5</SelectItem>
                <SelectItem value={"4"}>4</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Column>
      </Row>

      <Row>
        <Column>
          <Label>Price per 1h</Label>
          <Input
            className={theme === "light" ? "border-[#241e2f]" : ""}
            value={pricePerHour}
            onChange={(e) => setPricePerHour(e.target.value)}
          />
        </Column>
        <Column>
          <Label>FAME total</Label>
          <Input
            className={theme === "light" ? "border-[#241e2f]" : ""}
            value={fameTotal}
            onChange={(e) => setFameTotal(e.target.value)}
          />
        </Column>
      </Row>
      <Row>
        <Column>
          <Label>Medicover owners</Label>
          <Input
            className={theme === "light" ? "border-[#241e2f]" : ""}
            value={mCoverOwners}
            onChange={(e) => setMCoverOwners(e.target.value)}
          />
        </Column>
        <Column>
          <Label>Medicover usage</Label>
          <Input
            className={theme === "light" ? "border-[#241e2f]" : ""}
            value={mCoverUsage}
            onChange={(e) => setMCoverUsage(e.target.value)}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <Label>MS+ owners</Label>
          <Input
            className={theme === "light" ? "border-[#241e2f]" : ""}
            value={msOwners}
            onChange={(e) => setMSOwners(e.target.value)}
          />
        </Column>
        <Column>
          <Label>Multisport usage</Label>
          <Input
            className={theme === "light" ? "border-[#241e2f]" : ""}
            value={msUsage}
            onChange={(e) => setMSUsage(e.target.value)}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <Label>MS Classic owners</Label>
          <Input
            className={theme === "light" ? "border-[#241e2f]" : ""}
            value={msClassicOwners}
            onChange={(e) => setMSClassicOwners(e.target.value)}
          />
        </Column>
        <Column>
          <Label>No card</Label>
          <Input className={theme === "light" ? "border-[#241e2f]" : ""} value={noCard} onChange={(e) => setNoCard(e.target.value)} />
        </Column>
      </Row>

      <img className={"mb-4 mt-2"} src="/divider.png" alt="divider" />

      <ResultsPanel statistics={statistics} theme={theme} />
    </div>
  );
}

const Row: FC<PropsWithChildren> = ({ children }) => {
  return <div className={"mb-4 flex gap-x-4"}>{children}</div>;
};

const Label: FC<PropsWithChildren> = ({ children }) => {
  return <h2 className={"text-sm font-medium"}>{children}</h2>;
};

const Column: FC<PropsWithChildren> = ({ children }) => {
  return <div className={"flex flex-1 flex-col gap-y-2"}>{children}</div>;
};
