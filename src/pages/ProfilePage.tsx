import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/layout/DashboardHeader';
import {
  User,
  ArrowLeft,
  Trophy,
  Fuel,
  Award,
  Medal,
  CheckCircle,
  Star,
  Calendar,
} from 'lucide-react';

const REWARDS_MAP: Record<string, { name: string; icon: React.ElementType; description: string; color: string }> = {
  badge: { name: 'Recognition Badge', icon: Medal, description: 'Community hero badge on profile', color: 'text-amber-600' },
  certificate: { name: 'Digital Certificate', icon: Award, description: 'Verified emergency responder certificate', color: 'text-blue-500' },
  fuel: { name: 'Fuel Voucher', icon: Fuel, description: '₹500 fuel voucher', color: 'text-green-500' },
  incentive: { name: 'Monthly Incentive', icon: Trophy, description: 'Cash bonus for top contributors', color: 'text-yellow-500' },
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('claimedRewards');
    if (stored) setClaimedRewards(JSON.parse(stored));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader
        title="My Profile"
        subtitle="Your emergency responder profile"
      />

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/temporary')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Emergency Mode
          </Button>

          {/* User Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Emergency Responder</h2>
                  <p className="text-sm text-muted-foreground">Temporary Emergency Vehicle Driver</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{claimedRewards.length} rewards claimed</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claimed Rewards List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Claimed Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              {claimedRewards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No rewards claimed yet</p>
                  <p className="text-xs mt-1">Complete emergency trips to earn points and claim rewards</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {claimedRewards.map((rewardId, index) => {
                    const reward = REWARDS_MAP[rewardId];
                    if (!reward) return null;
                    const RewardIcon = reward.icon;

                    return (
                      <div
                        key={`${rewardId}-${index}`}
                        className="flex items-center gap-4 p-4 rounded-lg border border-green-500/20 bg-green-500/5"
                      >
                        <div className="p-2.5 rounded-full bg-green-500/10">
                          <RewardIcon className={`w-6 h-6 ${reward.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{reward.name}</p>
                          <p className="text-xs text-muted-foreground">{reward.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-600 hover:bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" /> Claimed
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                            <Calendar className="w-3 h-3" />
                            Today
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
