"use client";

import { Plus } from "lucide-react";
import { ReservationList } from "~/components/reservation-list";
import { AddReservationSheet } from "~/components/add-reservation-sheet";
import { withAdminLayout } from "~/components/with-admin-layout";
import { ScreenHeader } from "~/components/shell/screen-header";
import { PageBody } from "~/components/ds/page-body";
import { Button } from "~/components/ui/button";
import { useT } from "~/i18n/i18n-provider";
import { useState } from "react";
import type { SaveReservationData } from "~/components/reservation-list";
import { reservationOperations } from "~/lib/db";

function ReservationsPage() {
  const t = useT();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddReservation = async (data: SaveReservationData) => {
    await reservationOperations.addReservationList(data.name, data.players);
    setRefreshTrigger((prev) => prev + 1);
  };

  const addSheet = (label: string) => (
    <AddReservationSheet
      onSave={handleAddReservation}
      trigger={<Button size="sm" className="md:h-11"><Plus />{label}</Button>}
    />
  );

  return (
    <>
      <ScreenHeader
        title={t("res.title")}
        adminSection="reservations"
        actions={addSheet(t("res.newReservation"))}
        mobileTitleAside={addSheet(t("res.new"))}
      />
      <PageBody><ReservationList refreshTrigger={refreshTrigger} /></PageBody>
    </>
  );
}

export default withAdminLayout(ReservationsPage);
