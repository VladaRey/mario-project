import { Users } from "lucide-react";
import { FfpSheet } from "~/components/ffp-sheet.component";
import { useEffect, useState } from "react";
import { type CardType, eventOperations, type Event } from "~/lib/db";
import { PlayerPaymentCard } from "./player-payment-card";
import FullSizeLoader from "~/components/full-size-loader";
import { Breadcrumbs } from "~/components/breadcrumbs.component";
import { Navbar } from "~/components/navbar";

const cardTypeOrder: CardType[] = [
  "Medicover",
  "Medicover Light",
  "Multisport",
  "Classic",
  "No card",
];

interface CurrentEventProps {
  id: string;
}

export function CurrentEvent({ id }: CurrentEventProps) {
  function getCardTypeColor(cardType: CardType) {
    switch (cardType) {
      case "Medicover":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900";
      case "Medicover Light":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200 hover:text-purple-900";
      case "Multisport":
        return "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900";
      case "Classic":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900";
      case "No card":
        return "bg-orange-100 text-slate-800 hover:bg-orange-200 hover:text-orange-900";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900";
    }
  }

  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>(
    {},
  );
  const [playerPaymentAmount, setPlayerPaymentAmount] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const loadInitialEvent = async () => {
      try {
        const currentEvent = await eventOperations.getEvent(id);
        setEvent(currentEvent);

        if (currentEvent) {
          const payments = Object.fromEntries(
            currentEvent.players.map((player) => [player.id, player.paid]),
          );
          setPaymentStatus(payments);

          const playerPayments = Object.fromEntries(
            currentEvent.players.map((player) => [player.id, player.amount]),
          );
          setPlayerPaymentAmount(playerPayments);
        }
      } catch (error) {
        console.error("Failed to load event:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialEvent();
  }, []);

  const refreshPaymentAmounts = async () => {
    if (event) {
      const playerPayments = await eventOperations.getPlayerPaymentAmount(
        event.id,
      );
      setPlayerPaymentAmount(playerPayments);
    }
  };

  const handlePaymentChange = async (playerId: string, paid: boolean) => {
    if (!event) return;

    try {
      await eventOperations.updatePlayerPayment(event.id, playerId, paid);
      setPaymentStatus((prev) => ({
        ...prev,
        [playerId]: paid,
      }));
    } catch (error) {
      console.error("Failed to update payment status:", error);
      // Optionally add error handling UI here
    }
  };

  if (isLoading) {
    return <FullSizeLoader />;
  }

  if (!event) {
    return <div>No event found</div>;
  }

  const cardTypeCounts = event.players.reduce(
    (acc, player) => {
      acc[player.cardType] = (acc[player.cardType] || 0) + 1;
      return acc;
    },
    {} as Record<CardType, number>,
  );

  const sortedCardTypeCounts = cardTypeOrder.map((type) => ({
    type,
    count: cardTypeCounts[type] || 0,
  }));

  const sortedPlayers = [...event.players].sort(
    (a, b) =>
      cardTypeOrder.indexOf(a.cardType) - cardTypeOrder.indexOf(b.cardType),
  );

  const mc = cardTypeCounts["Medicover"] || 0;
  const ml = cardTypeCounts["Medicover Light"] || 0;
  const ms = cardTypeCounts["Multisport"] || 0;
  const msc = cardTypeCounts["Classic"] || 0;
  const nc = cardTypeCounts["No card"] || 0;

  return (
    <div className="space-y-8">
      <div>
        <Navbar title={event.name}>
          <FfpSheet
            ml={ml}
            mc={mc}
            ms={ms}
            msc={msc}
            nc={nc}
            onRefresh={refreshPaymentAmounts}
            eventId={event.id}
          />
        </Navbar>
        <Breadcrumbs
          items={[
            { label: event?.name || "", href: `/admin/event/${event?.id}` },
          ]}
          className="ml-1 mt-4"
        />
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-[#2E2A5D] px-3 py-2 font-semibold text-white shadow-sm">
            <Users className="h-4 w-4" />
            <span>{event.players.length} Players</span>
          </div>
          <div className="h-6 w-px bg-gray-300" />
          {sortedCardTypeCounts.map(({ type, count }) => (
            <div
              key={type}
              className={`${getCardTypeColor(type)} flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium`}
            >
              <span>{type}:</span>
              <span className="font-bold">{count}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(sortedPlayers || []).map((player) => {
            return player ? (
              <PlayerPaymentCard
                key={player.id}
                player={player}
                paymentStatus={paymentStatus}
                handlePaymentChange={handlePaymentChange}
                playerPaymentAmount={playerPaymentAmount}
                getCardTypeColor={getCardTypeColor}
              />
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}
