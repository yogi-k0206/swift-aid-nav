import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { toast } from '@/hooks/use-toast';
import {
  Star,
  Trophy,
  Fuel,
  Award,
  Medal,
  CheckCircle,
  ArrowLeft,
  Gift,
  Clock,
  Shield,
} from 'lucide-react';

const STEPS = [
  { key: 'accept', label: 'Accept Request', points: 10, icon: CheckCircle },
  { key: 'arrival', label: 'On-time Arrival', points: 20, icon: Clock },
  { key: 'safe', label: 'Safe Driving', points: 5, icon: Shield },
];

const REWARDS = [
  { id: 'badge', name: 'Recognition Badge', icon: Medal, threshold: 10, description: 'Community hero badge on profile', color: 'text-amber-600' },
  { id: 'certificate', name: 'Digital Certificate', icon: Award, threshold: 20, description: 'Verified emergency responder certificate', color: 'text-blue-500' },
  { id: 'fuel', name: 'Fuel Voucher', icon: Fuel, threshold: 35, description: '₹500 fuel voucher', color: 'text-green-500' },
  { id: 'incentive', name: 'Monthly Incentive', icon: Trophy, threshold: 50, description: 'Cash bonus for top contributors', color: 'text-yellow-500' },
];

const RewardsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const points = parseInt(searchParams.get('points') || '0', 10);
  const earnedSteps = (searchParams.get('earned') || '').split(',').filter(Boolean);

  const [claimedRewards, setClaimedRewards] = useState<string[]>(() => {
    const stored = localStorage.getItem('claimedRewards');
    return stored ? JSON.parse(stored) : [];
  });

  const handleClaim = (rewardId: string) => {
    const updated = [...claimedRewards, rewardId];
    setClaimedRewards(updated);
    localStorage.setItem('claimedRewards', JSON.stringify(updated));
    toast({ title: "🎁 Reward Claimed!", description: `You've successfully claimed your reward.` });
  };

  // Calculate completed step index for the progress bar
  const completedCount = earnedSteps.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader
        title="Rewards & Points"
        subtitle="Track your emergency response rewards"
      />

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back button */}
          <Button variant="ghost" size="sm" onClick={() => navigate('/temporary')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Emergency Mode
          </Button>

          {/* Points Summary */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Star className="w-8 h-8 text-yellow-500" />
                <span className="text-5xl font-bold text-primary">{points}</span>
                <span className="text-lg text-muted-foreground mt-2">points</span>
              </div>
            </CardContent>
          </Card>

          {/* Amazon-style Horizontal Progress Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Points Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Horizontal track */}
                <div className="flex items-center justify-between relative">
                  {STEPS.map((step, index) => {
                    const isCompleted = earnedSteps.includes(step.key);
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
                        {/* Connector line */}
                        {index > 0 && (
                          <div
                            className={`absolute top-5 right-1/2 w-full h-1 -z-10 ${
                              isCompleted ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                        )}
                        {/* Circle */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted
                              ? 'bg-primary border-primary text-primary-foreground scale-110'
                              : 'bg-background border-muted-foreground/30 text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <StepIcon className="w-5 h-5" />
                          )}
                        </div>
                        {/* Label */}
                        <p className={`text-xs mt-2 text-center font-medium ${
                          isCompleted ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          {step.label}
                        </p>
                        <Badge
                          variant={isCompleted ? 'default' : 'outline'}
                          className={`mt-1 text-xs ${isCompleted ? 'bg-green-600 hover:bg-green-600' : ''}`}
                        >
                          +{step.points} pts
                        </Badge>
                      </div>
                    );
                  })}
                </div>

                {/* Overall progress bar underneath */}
                <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(completedCount / STEPS.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {completedCount}/{STEPS.length} steps completed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Available Rewards - Horizontal Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Available Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REWARDS.map(reward => {
                  const canClaim = points >= reward.threshold;
                  const isClaimed = claimedRewards.includes(reward.id);
                  const RewardIcon = reward.icon;

                  return (
                    <div
                      key={reward.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isClaimed
                          ? 'border-green-500/50 bg-green-500/5'
                          : canClaim
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-border bg-muted/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${canClaim || isClaimed ? 'bg-primary/10' : 'bg-muted'}`}>
                          <RewardIcon className={`w-6 h-6 ${isClaimed ? 'text-green-500' : canClaim ? reward.color : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${!canClaim && !isClaimed && 'text-muted-foreground'}`}>
                            {reward.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{reward.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{reward.threshold} pts required</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        {isClaimed ? (
                          <Badge className="bg-green-600 hover:bg-green-600 w-full justify-center">
                            <CheckCircle className="w-3 h-3 mr-1" /> Claimed
                          </Badge>
                        ) : canClaim ? (
                          <Button size="sm" className="w-full" onClick={() => handleClaim(reward.id)}>
                            Claim Reward
                          </Button>
                        ) : (
                          <Badge variant="outline" className="w-full justify-center text-muted-foreground">
                            {points}/{reward.threshold} pts
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* View Profile Link */}
          <div className="text-center">
            <Button variant="outline" onClick={() => navigate('/profile')} className="gap-2">
              <Award className="w-4 h-4" />
              View Profile & Claimed Rewards
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
