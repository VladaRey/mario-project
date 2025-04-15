import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Users } from "lucide-react";
import { FfpSheet } from "~/components/ffp-sheet.component";
import { useEffect, useState } from "react";
import { type CardType, eventOperations, type Event } from "~/lib/db";

const cardTypeOrder: CardType[] = [
  "Medicover",
  "Multisport",
  "Classic",
  "No card",
];


interface CurrentEventProps {
    id: string;
}

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
const FAME_PASSWORD = process.env.NEXT_PUBLIC_FAME_PASSWORD;

export function CurrentEvent({id}: CurrentEventProps) {
  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }
  
    function getCardTypeColor(cardType: CardType) {
    switch (cardType) {
      case "Medicover":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900";
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

  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

    const adminPassword = localStorage.getItem("admin-password");
    const famePassword = localStorage.getItem("fame-password");

    if (adminPassword === ADMIN_PASSWORD || famePassword === FAME_PASSWORD) {
      setIsAuthenticated(true);
    }
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
    return <div>Loading...</div>;
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
  const ms = cardTypeCounts["Multisport"] || 0;
  const msc = cardTypeCounts["Classic"] || 0;
  const nc = cardTypeCounts["No card"] || 0;

  return (
    <div className="space-y-8">
      <div className="rounded-lg bg-gradient-to-r from-[#2E2A5D] to-[#7B3C7D] p-6 text-white shadow-lg">
        <div className="mb-4 flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <h1 className="mb-2 text-3xl font-bold sm:mb-0 sm:text-4xl">
            {event.name}
          </h1>
          <div className="hidden sm:flex">
            <FfpSheet
              mc={mc}
              ms={ms}
              msc={msc}
              nc={nc}
              onRefresh={refreshPaymentAmounts}
              eventId={event.id}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            <span>{event.players.length} Players</span>
          </div>
          {sortedCardTypeCounts.map(({ type, count }) => (
            <Badge key={type} className={`${getCardTypeColor(type)} text-xs`}>
              {type}: {count}
            </Badge>
          ))}
        </div>

        <div className="mt-4 sm:hidden">
          <FfpSheet
            mc={mc}
            ms={ms}
            msc={msc}
            nc={nc}
            onRefresh={refreshPaymentAmounts}
            eventId={event.id}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(sortedPlayers || []).map((player) => {
            return player ? (
              <Card key={player.id} className="transition-colors duration-200">
                <CardContent className="flex items-center p-4">
                  <Avatar className="mr-4 h-10 w-10">
                    <AvatarFallback className="bg-[#7B3C7D] text-white">
                      {getInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-grow flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#2E2A5D]">
                        {player.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${paymentStatus[player.id] ? "text-green-600" : "text-orange-400"}`}
                        >
                          {paymentStatus[player.id] ? "Paid" : "Unpaid"}
                        </span>
                        {isAuthenticated && (
                          <Switch
                            className="data-[state=checked]:bg-[#2E2A5D]"
                            checked={paymentStatus[player.id]}
                            onCheckedChange={(checked) =>
                              handlePaymentChange(player.id, checked)
                            }
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        className={`mt-1 ${getCardTypeColor(player.cardType)}`}
                      >
                        {player.cardType}
                      </Badge>
                      {playerPaymentAmount[player.id] != null && (
                        <span className="text-sm font-bold text-gray-600">
                          {playerPaymentAmount[player.id]} PLN
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}
