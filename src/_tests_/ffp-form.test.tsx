import { fireEvent, screen } from "@testing-library/react";
import { renderWithI18n } from "./test-utils";
import { FfpForm } from "~/components/ffp-form.component";
import { calculateStatistics } from "~/services/calculation-service";
import { transformState } from "~/utils/util";

const set = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

test("restyled FFP form produces exactly calculateStatistics output", () => {
  renderWithI18n(<FfpForm />);
  for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole("button", { name: "Increase Courts" }));
  set("Price per 1h", "77");
  set("Medicover owners", "3"); set("Medicover usage", "2");
  set("Medicover Light owners", "2"); set("Medicover Light usage", "1");
  set("MS+ owners", "3"); set("Multisport usage", "2");
  set("MS Classic owners", "2"); set("No card", "4");

  const expected = calculateStatistics(transformState({
    courts: "3", hours: "2", pricePerHour: "77", fameTotal: "",
    medicoverLightOwners: "2", mCoverOwners: "3", msOwners: "3", msClassicOwners: "2", noCard: "4",
    medicoverLightUsage: "1", mCoverUsage: "2", msUsage: "2",
  }));
  const show = (v?: string) => (v ? `${v} PLN` : "—");
  expect(screen.getByTestId("ffp-medicover")).toHaveTextContent(show(expected.medicover));
  expect(screen.getByTestId("ffp-medicoverLight")).toHaveTextContent(show(expected.medicoverLight));
  expect(screen.getByTestId("ffp-MS")).toHaveTextContent(show(expected.MS));
  expect(screen.getByTestId("ffp-msClassic")).toHaveTextContent(show(expected.msClassic));
  expect(screen.getByTestId("ffp-noMs")).toHaveTextContent(show(expected.noMs));
  expect(screen.getByTestId("ffp-totalPrice")).toHaveTextContent(show(expected.totalPrice));
  expect(screen.getByTestId("ffp-discount")).toHaveTextContent(show(expected.discount));
  expect(screen.getByTestId("ffp-fameDiscount")).toHaveTextContent(show(expected.fameDiscount));
  expect(screen.getByTestId("ffp-priceAfterDiscount")).toHaveTextContent(show(expected.priceAfterDiscount));
});

test("hours stepper moves in 0.5 steps within 1..4", () => {
  renderWithI18n(<FfpForm />);
  fireEvent.click(screen.getByRole("button", { name: "Increase Hours" }));
  expect(screen.getByRole("group", { name: "Hours" })).toHaveTextContent("2.5");
});
