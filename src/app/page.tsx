"use client";

import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { type CardType, eventOperations, type Event } from "~/lib/db";
import { Calculator, Users } from "lucide-react";
import { FfpSheet } from "~/components/ffp-sheet.component";

const inter = Inter({ subsets: ["latin"] });


const cardTypeOrder: CardType[] = [
  "Medicover",
  "Multisport",
  "Classic",
  "No card",
];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>(
    {},
  );
  const [playerPaymentAmount, setPlayerPaymentAmount] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    const loadInitialEvent = async () => {
      try {
        const lastEvent = await eventOperations.getLastEvent();
        setEvent(lastEvent);

        if (lastEvent) {
          // Load payment status from database
          const payments = await eventOperations.getEventPayments(lastEvent.id);
          setPaymentStatus(payments);

          const playerPayments = await eventOperations.getPlayerPaymentAmount(lastEvent.id);
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>No event found</div>;
  }

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
        return "bg-blue-100 text-blue-800";
      case "Multisport":
        return "bg-green-100 text-green-800";
      case "Classic":
        return "bg-yellow-100 text-yellow-800";
      case "No card":
        return "bg-orange-100 text-slate-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
    <div className="container mx-auto space-y-8 p-4">
      <div className="space-y-6">
        <div className="rounded-lg bg-gradient-to-r from-[#2E2A5D] to-[#7B3C7D] p-6 text-white shadow-lg">
          <div className="mb-4 flex flex-col items-start justify-between sm:flex-row sm:items-center">
            <h1 className="mb-2 text-3xl font-bold sm:mb-0 sm:text-4xl">
              {event.name}
            </h1>
            <div className="hidden sm:flex">
            <FfpSheet mc={mc} ms={ms} msc={msc} nc={nc} onRefresh={refreshPaymentAmounts} eventId={event.id}/>
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
          <FfpSheet mc={mc} ms={ms} msc={msc} nc={nc} onRefresh={refreshPaymentAmounts} eventId={event.id}/>
          </div>
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
                      <span
                        className={`font-medium ${paymentStatus[player.id] ? "text-green-600" : "text-orange-400"}`}
                      >
                        {paymentStatus[player.id] ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                    <Badge
                      className={`mt-1 ${getCardTypeColor(player.cardType)}`}
                    >
                      {player.cardType}
                    </Badge>
                    {playerPaymentAmount[player.id] != null && 
                    <span className="text-sm text-gray-600 font-bold">
                      {playerPaymentAmount[player.id]} PLN
                    </span>}
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
