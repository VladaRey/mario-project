import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { CardType, Player } from "~/lib/db";
import { useGetRole } from "~/hooks/use-get-role";

interface PlayerPaymentCardProps {
    player: Player;
    paymentStatus: Record<string, boolean>;
    handlePaymentChange: (playerId: string, checked: boolean) => void;
    playerPaymentAmount: Record<string, number>;
    getCardTypeColor: (cardType: CardType) => string;
}

export function PlayerPaymentCard({player, paymentStatus, handlePaymentChange, playerPaymentAmount, getCardTypeColor}: PlayerPaymentCardProps) {
    const role = useGetRole();

    function getInitials(name: string) {
      return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    }

    return (
      <div>
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
              </div>
              <div className="flex items-center justify-between">
                <Badge className={`mt-1 ${getCardTypeColor(player.cardType)}`}>
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
      </div>
    );
}
