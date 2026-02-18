import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Trophy, 
  Fuel, 
  Award, 
  Medal,
  Gift,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface PointEntry {
  label: string;
  points: number;
  icon: React.ReactNode;
  earned: boolean;
}

const REWARDS = [
  { id: 'incentive', name: 'Monthly Incentive', icon: <Trophy className="w-5 h-5" />, threshold: 50, description: 'Cash bonus for top contributors' },
  { id: 'fuel', name: 'Fuel Voucher', icon: <Fuel className="w-5 h-5" />, threshold: 35, description: '₹500 fuel voucher' },
  { id: 'certificate', name: 'Digital Certificate', icon: <Award className="w-5 h-5" />, threshold: 20, description: 'Verified emergency responder certificate' },
  { id: 'badge', name: 'Recognition Badge', icon: <Medal className="w-5 h-5" />, threshold: 10, description: 'Community hero badge on profile' },
];

interface RewardsPanelProps {
  totalPoints: number;
  pointsLog: PointEntry[];
  onClaimReward?: (rewardId: string) => void;
}

const RewardsPanel = ({ totalPoints, pointsLog, onClaimReward }: RewardsPanelProps) => {
  const [claimedReward, setClaimedReward] = useState<string | null>(null);

  const handleClaim = (rewardId: string) => {
    setClaimedReward(rewardId);
    onClaimReward?.(rewardId);
  };

  // Find the best reward the user can claim
  const claimableRewards = REWARDS.filter(r => totalPoints >= r.threshold);

  return (
    <div className="space-y-4">
      {/* Points Summary */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Reward Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-primary">{totalPoints}</span>
            <span className="text-sm text-muted-foreground mb-1">pts earned</span>
          </div>

          {/* Points breakdown */}
          <div className="space-y-2">
            {pointsLog.map((entry, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {entry.icon}
                  <span className={entry.earned ? 'text-foreground' : 'text-muted-foreground'}>
                    {entry.label}
                  </span>
                </div>
                <Badge 
                  variant={entry.earned ? 'default' : 'outline'} 
                  className={entry.earned ? 'bg-green-600 hover:bg-green-600' : ''}
                >
                  {entry.earned ? `+${entry.points}` : `+${entry.points}`}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Claimable Rewards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            Available Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {REWARDS.map(reward => {
            const canClaim = totalPoints >= reward.threshold;
            const isClaimed = claimedReward === reward.id;
            const progressPct = Math.min(100, (totalPoints / reward.threshold) * 100);

            return (
              <div
                key={reward.id}
                className={`p-3 rounded-lg border transition-colors ${
                  isClaimed 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : canClaim 
                      ? 'border-primary/30 bg-primary/5' 
                      : 'border-border bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${canClaim ? 'text-primary' : 'text-muted-foreground'}`}>
                    {reward.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!canClaim && 'text-muted-foreground'}`}>
                      {reward.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{reward.description}</p>
                    {!canClaim && (
                      <div className="mt-1.5">
                        <Progress value={progressPct} className="h-1.5" />
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {totalPoints}/{reward.threshold} pts
                        </p>
                      </div>
                    )}
                  </div>
                  {isClaimed ? (
                    <Badge className="bg-green-600 hover:bg-green-600 shrink-0">
                      <CheckCircle className="w-3 h-3 mr-1" /> Claimed
                    </Badge>
                  ) : canClaim ? (
                    <Button size="sm" variant="default" onClick={() => handleClaim(reward.id)} className="shrink-0">
                      Claim
                    </Button>
                  ) : (
                    <Badge variant="outline" className="shrink-0 text-muted-foreground">
                      Locked
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Points Guide */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            How to Earn Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Accept emergency request</span>
              <Badge variant="secondary">+10 pts</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">On-time hospital arrival</span>
              <Badge variant="secondary">+20 pts</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Safe driving record</span>
              <Badge variant="secondary">+5 pts</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsPanel;
