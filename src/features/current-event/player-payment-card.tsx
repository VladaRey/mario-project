import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { PlayerCardUsage } from "~/components/player-card-usage";
import { CardType, Player } from "~/lib/db";
import { useGetRole } from "~/hooks/use-get-role";
import { getCardTypeDisplayLabel } from "~/utils/card-type-display";

interface PlayerPaymentCardProps {
  player: Player;
  paymentStatus: Record<string, boolean>;
  handlePaymentChange: (playerId: string, checked: boolean) => void;
  getCardTypeColor: (cardType: CardType) => string;
  displayAmount?: string;
  usage: number;
  onUsageChange: (playerId: string, usage: number) => void;
}

export function PlayerPaymentCard({
  player,
  paymentStatus,
  handlePaymentChange,
  getCardTypeColor,
  displayAmount,
  usage,
  onUsageChange,
}: PlayerPaymentCardProps) {
  const { role } = useGetRole();

  return (
    <div>
      <Card key={player.id} className="transition-colors duration-200">
        <CardContent className="flex min-h-[97px] items-center justify-between p-4">
          <div className="flex flex-col gap-2">
            <div className="block md:hidden">
              <Badge className={`${getCardTypeColor(player.cardType)}`}>
                {getCardTypeDisplayLabel(player.cardType)}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-[#2E2A5D] text-lg">{player.name}</span>
              <div className="hidden md:block">
              <Badge className={`${getCardTypeColor(player.cardType)}`}>
                {getCardTypeDisplayLabel(player.cardType)}
              </Badge>

              </div>
            </div>

            <div className="flex items-center justify-between">
              {displayAmount != null && displayAmount !== undefined && (
                <span className="text-sm font-bold text-gray-600">
                  {displayAmount} PLN
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center justify-end gap-2">
              <span
                className={`font-medium ${paymentStatus[player.id] ? "text-green-600" : "text-orange-400"}`}
              >
                {paymentStatus[player.id] ? "Paid" : "Unpaid"}
              </span>
              {(role === "admin" || role === "fame") && (
                <Switch
                  className="data-[state=checked]:bg-[#2E2A5D]"
                  checked={paymentStatus[player.id]}
                  onCheckedChange={(checked) =>
                    handlePaymentChange(player.id, checked)
                  }
                />
              )}
            </div>
            {player.cardType !== "No card" && (
              <PlayerCardUsage
                usage={usage}
                playerId={player.id}
                onUsageChange={onUsageChange}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
