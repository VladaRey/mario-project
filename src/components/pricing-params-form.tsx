"use client";

import { type FC } from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export interface PricingParamsFormValue {
  courts: number;
  hours: number;
  pricePerHour: number;
  fameTotal: number;
  medicoverOwners: number;
  medicoverLightOwners: number;
  msOwners: number;
  msClassicOwners: number;
  noCardOwners: number;
}

interface PricingParamsFormProps {
  value: PricingParamsFormValue;
  onChange: (value: PricingParamsFormValue) => void;
}

const Row: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4 flex gap-x-4">{children}</div>
);

const Label: FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-sm font-medium">{children}</h2>
);

const Column: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-1 flex-col justify-between gap-y-2">{children}</div>
);

export function PricingParamsForm({ value, onChange }: PricingParamsFormProps) {
  const courtsStr = String(value.courts);
  const hoursStr = String(value.hours);
  const pricePerHourStr = String(value.pricePerHour);
  const fameTotalStr = value.fameTotal === 0 ? "" : String(value.fameTotal);

  return (
    <div>
      <Row>
        <Column>
          <Label>Courts</Label>
          <Select
            value={courtsStr}
            onValueChange={(v) =>
              onChange({ ...value, courts: Number(v) || 0 })
            }
          >
            <SelectTrigger className="w-full border-[#241e2f]">
              <SelectValue defaultValue="1" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Column>
        <Column>
          <Label>Hours</Label>
          <Select
            value={hoursStr}
            onValueChange={(v) =>
              onChange({ ...value, hours: Number(v) || 0 })
            }
          >
            <SelectTrigger className="min-w-full border-[#241e2f]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="1.5">1.5</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="2.5">2.5</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="3.5">3.5</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Column>
      </Row>

      <Row>
        <Column>
          <Label>Price per 1h</Label>
          <Input
            className="border-[#241e2f]"
            value={pricePerHourStr}
            onChange={(e) =>
              onChange({
                ...value,
                pricePerHour: Number(e.target.value) || 0,
              })
            }
          />
        </Column>
        <Column>
          <Label>FAME total</Label>
          <Input
            className="border-[#241e2f]"
            value={fameTotalStr}
            onChange={(e) =>
              onChange({
                ...value,
                fameTotal: Number(e.target.value) || 0,
              })
            }
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <Label>Medicover owners</Label>
          <Input
            className="border-[#241e2f]"
            value={String(value.medicoverOwners)}
            onChange={(e) =>
              onChange({
                ...value,
                medicoverOwners: Number(e.target.value) || 0,
              })
            }
          />
        </Column>
        <Column>
          <Label>Medicover Light owners</Label>
          <Input
            className="border-[#241e2f]"
            value={String(value.medicoverLightOwners)}
            onChange={(e) =>
              onChange({
                ...value,
                medicoverLightOwners: Number(e.target.value) || 0,
              })
            }
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <Label>MS+ owners</Label>
          <Input
            className="border-[#241e2f]"
            value={String(value.msOwners)}
            onChange={(e) =>
              onChange({
                ...value,
                msOwners: Number(e.target.value) || 0,
              })
            }
          />
        </Column>
        <Column>
          <Label>MS Classic owners</Label>
          <Input
            className="border-[#241e2f]"
            value={String(value.msClassicOwners)}
            onChange={(e) =>
              onChange({
                ...value,
                msClassicOwners: Number(e.target.value) || 0,
              })
            }
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <Label>No card</Label>
          <Input
            className="border-[#241e2f]"
            value={String(value.noCardOwners)}
            onChange={(e) =>
              onChange({
                ...value,
                noCardOwners: Number(e.target.value) || 0,
              })
            }
          />
        </Column>
        <Column>
          <span></span>
        </Column>
      </Row>
    </div>
  );
}
