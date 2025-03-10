"use client";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { type FC, type PropsWithChildren, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Input } from "~/components/ui/ffp-input";
import { ResultsPanel } from "~/components/ResultsPanel.component";
import { calculateStatistics } from "~/services/calculation-service";
import { transformState } from "~/utils/util";

function toNumberOrZero(value: string | null) {
  if (!value || value === "") {
    return 0;
  }

  if (value == "undefined") {
    return 0;
  }

  return Number(value);
}

function fromUndefined(value: string | null) {
  if (!value || value == "undefined") {
    return "0";
  }

  return value;
}

function FfpPage() {
  const searchParams = useSearchParams();

  const medicoverQuery = fromUndefined(searchParams.get("mc"));
  const multisportQuery = fromUndefined(searchParams.get("ms"));
  const multisportClassicQuery = fromUndefined(searchParams.get("msc"));
  const noCardQuery = fromUndefined(searchParams.get("nc"));

  const [queryParams, setQueryParams] = useState({
    medicoverQuery,
    multisportQuery,
    multisportClassicQuery,
    noCardQuery,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQueryParams({
      medicoverQuery: fromUndefined(params.get("mc")),
      multisportQuery: fromUndefined(params.get("ms")),
      multisportClassicQuery: fromUndefined(params.get("msc")),
      noCardQuery: fromUndefined(params.get("nc")),
    });
  }, []);

  const playersCount =
    toNumberOrZero(medicoverQuery) +
    toNumberOrZero(multisportQuery) +
    toNumberOrZero(multisportClassicQuery) +
    toNumberOrZero(noCardQuery);

  const courtCount = Math.ceil(playersCount / 4);

  const defaultMedicoverUsage = toNumberOrZero(medicoverQuery) * 2;
  const allowedMsUsage = courtCount * 2 * 2;
  const possibleMSUsage =
    toNumberOrZero(multisportQuery) * 2 +
    toNumberOrZero(multisportClassicQuery);
  const realMSUsage = Math.min(allowedMsUsage, possibleMSUsage);

  const [courts, setCourts] = useState(String(courtCount));
  const [hours, setHours] = useState("2");
  const [pricePerHour, setPricePerHour] = useState("75");
  const [fameTotal, setFameTotal] = useState("");
  const [mCoverOwners, setMCoverOwners] = useState(medicoverQuery || "");
  const [msOwners, setMSOwners] = useState(multisportQuery || "");
  const [msClassicOwners, setMSClassicOwners] = useState(
    multisportClassicQuery || "",
  );
  const [noCard, setNoCard] = useState(noCardQuery || "");
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
  return (
    <div className={"flex min-h-[100vh] w-full justify-center bg-[#221d37]"}>
      <div
        className={
          "mx-auto min-h-[100vh] w-full min-w-80 max-w-[500px] p-4 outline outline-[#4D4D9F]"
        }
        style={{
          backgroundImage: "url(bg.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <Row>
          <Column>
            <Label>Courts</Label>
            <Select value={courts} onValueChange={setCourts}>
              <SelectTrigger className="w-full">
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
              <SelectTrigger className="min-w-full">
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
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
            />
          </Column>
          <Column>
            <Label>FAME total</Label>
            <Input
              value={fameTotal}
              onChange={(e) => setFameTotal(e.target.value)}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <Label>Medicover owners</Label>
            <Input
              value={mCoverOwners}
              onChange={(e) => setMCoverOwners(e.target.value)}
            />
          </Column>
          <Column>
            <Label>Medicover usage</Label>
            <Input
              value={mCoverUsage}
              onChange={(e) => setMCoverUsage(e.target.value)}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <Label>MS+ owners</Label>
            <Input
              value={msOwners}
              onChange={(e) => setMSOwners(e.target.value)}
            />
          </Column>
          <Column>
            <Label>Multisport usage</Label>
            <Input
              value={msUsage}
              onChange={(e) => setMSUsage(e.target.value)}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <Label>MS Classic owners</Label>
            <Input
              value={msClassicOwners}
              onChange={(e) => setMSClassicOwners(e.target.value)}
            />
          </Column>
          <Column>
            <Label>No card</Label>
            <Input value={noCard} onChange={(e) => setNoCard(e.target.value)} />
          </Column>
        </Row>

        <Image className={"mb-4 mt-2"} src="/divider.png" alt="divider" width={24} height={24} />

        <ResultsPanel statistics={statistics} />
      </div>
    </div>
  );
}

const Row: FC<PropsWithChildren> = ({ children }) => {
  return <div className={"mb-4 flex gap-x-4"}>{children}</div>;
};

const Label: FC<PropsWithChildren> = ({ children }) => {
  return <h2 className={"text-sm font-medium text-white"}>{children}</h2>;
};

const Column: FC<PropsWithChildren> = ({ children }) => {
  return <div className={"flex flex-1 flex-col gap-y-2"}>{children}</div>;
};


export default FfpPage;