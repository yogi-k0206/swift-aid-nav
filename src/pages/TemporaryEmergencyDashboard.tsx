import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import DashboardHeader from '@/components/layout/DashboardHeader';
import EmergencyMap from '@/components/map/EmergencyMap';
import EnhancedSOSButton from '@/components/sos/EnhancedSOSButton';
import { emergencyReasons, getHospitalById, calculateDistance, estimateETA } from '@/data/demoData';
import { findUserByEmail, DemoUser } from '@/data/demoUsers';
import { TemporaryEmergencyVehicle } from '@/data/types';
import { toast } from '@/hooks/use-toast';
// RewardsPanel removed - now on separate /rewards page
import { 
  Clock, 
  MapPin, 
  CheckCircle,
  Lock,
  Zap,
  AlertTriangle,
  Shield,
  XCircle,
  Navigation,
  Mail,
  Loader2,
  User,
  Star
} from 'lucide-react';

type ViewMode = 'request' | 'approving' | 'active';

const TemporaryEmergencyDashboard = () => {
  const navigate = useNavigate();
  const { hospitals, tempVehicles, addTempVehicle, updateTempVehicle } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('request');
  const [activeVehicle, setActiveVehicle] = useState<TemporaryEmergencyVehicle | null>(
    tempVehicles.length > 0 ? tempVehicles[0] : null
  );
  const [countdown, setCountdown] = useState<number>(0);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [earnedSteps, setEarnedSteps] = useState<string[]>([]);
  const [pointsLog, setPointsLog] = useState<Array<{ label: string; points: number; icon: React.ReactNode; earned: boolean }>>([
    { label: 'Accept request', points: 10, icon: <CheckCircle className="w-3.5 h-3.5 text-muted-foreground" />, earned: false },
    { label: 'On-time arrival', points: 20, icon: <Clock className="w-3.5 h-3.5 text-muted-foreground" />, earned: false },
    { label: 'Safe driving', points: 5, icon: <Shield className="w-3.5 h-3.5 text-muted-foreground" />, earned: false },
  ]);
  
  // Email lookup state
  const [email, setEmail] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [userFound, setUserFound] = useState<DemoUser | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    vehicleRegistration: '',
    vehicleType: 'Auto-rickshaw',
    driverName: '',
    driverContact: '',
    reason: '',
    nearestHospitalId: '',
  });

  // Email lookup handler
  const handleEmailLookup = () => {
    if (!email.trim()) {
      toast({
        title: "Enter email",
        description: "Please enter your registered email address",
        variant: "destructive",
      });
      return;
    }

    setIsLookingUp(true);
    
    // Simulate API lookup
    setTimeout(() => {
      const user = findUserByEmail(email);
      setIsLookingUp(false);
      
      if (user) {
        setUserFound(user);
        setFormData({
          ...formData,
          vehicleRegistration: user.vehicleRegistration,
          vehicleType: user.vehicleType,
          driverName: user.fullName,
          driverContact: user.phone,
        });
        toast({
          title: "✓ Details Found",
          description: `Welcome back, ${user.fullName}!`,
        });
      } else {
        toast({
          title: "User not found",
          description: "Please enter details manually or try a different email",
          variant: "destructive",
        });
      }
    }, 1500);
  };

  // Find nearest hospitals based on a fixed current location (Koramangala)
  const currentLat = 12.9352;
  const currentLng = 77.6245;
  
  const nearestHospitals = hospitals
    .map(h => ({
      ...h,
      distance: calculateDistance(currentLat, currentLng, h.lat, h.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  // Countdown timer for active emergency
  useEffect(() => {
    if (!activeVehicle?.expiresAt) return;
    
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((activeVehicle.expiresAt!.getTime() - Date.now()) / 1000));
      setCountdown(remaining);
      
      if (remaining === 0) {
        setViewMode('request');
        setActiveVehicle(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeVehicle]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setViewMode('approving');

    // Simulate police approval after 2-3 seconds
    setTimeout(() => {
      const selectedHospital = getHospitalById(formData.nearestHospitalId);
      if (!selectedHospital) return;

      const newVehicle: TemporaryEmergencyVehicle = {
        id: `t${Date.now()}`,
        registrationNumber: formData.vehicleRegistration,
        vehicleType: formData.vehicleType,
        driverName: formData.driverName,
        driverContact: formData.driverContact,
        reason: formData.reason,
        status: 'active',
        currentLat,
        currentLng,
        destinationHospitalId: formData.nearestHospitalId,
        approvedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        eta: estimateETA(calculateDistance(currentLat, currentLng, selectedHospital.lat, selectedHospital.lng)),
      };

      addTempVehicle(newVehicle);
      setActiveVehicle(newVehicle);
      setViewMode('active');
      
      // Award +10 points for accepting request
      setRewardPoints(prev => prev + 10);
      setEarnedSteps(prev => [...prev, 'accept']);
      setPointsLog(prev => prev.map(p => 
        p.label === 'Accept request' ? { ...p, earned: true, icon: <CheckCircle className="w-3.5 h-3.5 text-green-500" /> } : p
      ));
      toast({ title: "🌟 +10 Points!", description: "Earned for accepting emergency request" });
    }, 2500);
  };

  const handleEndEmergency = () => {
    if (activeVehicle) {
      updateTempVehicle(activeVehicle.id, { status: 'completed' });
      
      // Award +20 for on-time arrival and +5 for safe driving
      setRewardPoints(prev => prev + 25);
      setEarnedSteps(prev => [...prev, 'arrival', 'safe']);
      setPointsLog(prev => prev.map(p => {
        if (p.label === 'On-time arrival') return { ...p, earned: true, icon: <Clock className="w-3.5 h-3.5 text-green-500" /> };
        if (p.label === 'Safe driving') return { ...p, earned: true, icon: <Shield className="w-3.5 h-3.5 text-green-500" /> };
        return p;
      }));
      toast({ title: "🏆 +25 Points!", description: "On-time arrival (+20) & Safe driving (+5)" });
    }
    setActiveVehicle(null);
    setViewMode('request');
    setFormData({
      vehicleRegistration: '',
      vehicleType: 'Auto-rickshaw',
      driverName: '',
      driverContact: '',
      reason: '',
      nearestHospitalId: '',
    });
  };

  const destinationHospital = activeVehicle?.destinationHospitalId 
    ? getHospitalById(activeVehicle.destinationHospitalId) 
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader 
        title="Temporary Emergency Mode"
        subtitle="Emergency Vehicle Authorization"
      />

      {/* Approving Animation */}
      {viewMode === 'approving' && (
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4 text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <h2 className="text-xl font-bold mb-2">Requesting Police Approval</h2>
              <p className="text-muted-foreground mb-4">
                Contacting Police Control Room...
              </p>
              <div className="flex justify-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Request Form */}
      {viewMode === 'request' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Request Emergency Authorization
                </CardTitle>
                <CardDescription>
                  Use this when an ambulance is unavailable. Your vehicle will receive temporary emergency privileges.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Lookup Section */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <Mail className="w-4 h-4" />
                      Quick Registration via Email
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        onClick={handleEmailLookup}
                        disabled={isLookingUp}
                        variant="secondary"
                      >
                        {isLookingUp ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Lookup'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Demo emails: ravi.kumar@gmail.com, priya.sharma@gmail.com
                    </p>
                  </div>

                  {/* User Found Badge */}
                  {userFound && (
                    <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                      <User className="w-4 h-4 text-success" />
                      <span className="text-sm">
                        <strong>{userFound.fullName}</strong> • {userFound.vehicleRegistration}
                      </span>
                      <Badge variant="outline" className="ml-auto text-success border-success">
                        Verified
                      </Badge>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleReg">Vehicle Registration</Label>
                      <Input
                        id="vehicleReg"
                        placeholder="KA-XX-XX-XXXX"
                        value={formData.vehicleRegistration}
                        onChange={e => setFormData({ ...formData, vehicleRegistration: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleType">Vehicle Type</Label>
                      <Select 
                        value={formData.vehicleType} 
                        onValueChange={v => setFormData({ ...formData, vehicleType: v })}
                      >
                        <SelectTrigger id="vehicleType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Auto-rickshaw">Auto-rickshaw</SelectItem>
                          <SelectItem value="Car">Car</SelectItem>
                          <SelectItem value="Two-wheeler">Two-wheeler</SelectItem>
                          <SelectItem value="Van">Van</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="driverName">Driver Name</Label>
                      <Input
                        id="driverName"
                        placeholder="Full name"
                        value={formData.driverName}
                        onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driverContact">Driver Contact</Label>
                      <Input
                        id="driverContact"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.driverContact}
                        onChange={e => setFormData({ ...formData, driverContact: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Emergency</Label>
                    <Select 
                      value={formData.reason} 
                      onValueChange={v => setFormData({ ...formData, reason: v })}
                    >
                      <SelectTrigger id="reason">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {emergencyReasons.map(reason => (
                          <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Destination Hospital (Nearest Only)</Label>
                    <div className="grid gap-2">
                      {nearestHospitals.map(hospital => (
                        <div
                          key={hospital.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            formData.nearestHospitalId === hospital.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setFormData({ ...formData, nearestHospitalId: hospital.id })}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{hospital.name}</p>
                              <p className="text-xs text-muted-foreground">{hospital.address}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{hospital.distance.toFixed(1)} km</p>
                              <Badge variant={
                                hospital.availability === 'available' ? 'default' :
                                hospital.availability === 'busy' ? 'secondary' : 'destructive'
                              } className="text-xs">
                                {hospital.beds} beds
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Destination is locked to verified hospitals only
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
                    disabled={!formData.vehicleRegistration || !formData.driverName || !formData.reason || !formData.nearestHospitalId}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Request Emergency Authorization
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Active Emergency Mode */}
      {viewMode === 'active' && activeVehicle && destinationHospital && (
        <>
          {/* Emergency Banner */}
          <div className="bg-emergency text-emergency-foreground px-4 py-3 flex items-center justify-between emergency-flash">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="font-bold">EMERGENCY MODE ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formatCountdown(countdown)}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Left Panel */}
            <div className="lg:w-96 p-4 space-y-4 overflow-y-auto">
              {/* Vehicle Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registration</span>
                    <span className="font-medium">{activeVehicle.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>{activeVehicle.vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Driver</span>
                    <span>{activeVehicle.driverName}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Destination */}
              <Card className="border-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Locked Destination
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">{destinationHospital.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{destinationHospital.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary">{activeVehicle.eta} min ETA</span>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Emergency Permissions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span>Signal bypass authorized</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span>Emergency speed permitted</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>Destination locked to hospital</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Time-limited (30 min max)</span>
                  </div>
                </CardContent>
               </Card>

            </div>

            {/* Map + Rewards Button */}
            <div className="flex-1 p-4 min-h-[400px] lg:min-h-0 flex flex-col">
              {/* Rewards button above map */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-sm">{rewardPoints} pts earned</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate(`/rewards?points=${rewardPoints}&earned=${earnedSteps.join(',')}`)}
                >
                  <Star className="w-4 h-4 text-yellow-500" />
                  View Rewards
                </Button>
              </div>
              <div className="flex-1 rounded-lg overflow-hidden border border-border">
                <EmergencyMap
                  hospitals={hospitals}
                  tempVehicles={[activeVehicle]}
                  centerOn={{ lat: activeVehicle.currentLat, lng: activeVehicle.currentLng }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-card border-t border-border p-4 flex flex-wrap items-center gap-3">
            {/* Enhanced SOS Button for Traffic Clearance */}
            <EnhancedSOSButton
              vehicleId={activeVehicle.id}
              vehicleRegistration={activeVehicle.registrationNumber}
              vehicleType="temporary"
              currentLocation={{ lat: activeVehicle.currentLat, lng: activeVehicle.currentLng }}
              variant="large"
              className="flex-1 sm:flex-none"
            />
            
            <Button 
              className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Start Navigation
            </Button>
            
            <Button 
              variant="destructive"
              className="flex-1 sm:flex-none"
              onClick={handleEndEmergency}
            >
              <XCircle className="w-4 h-4 mr-2" />
              End Emergency Mode
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TemporaryEmergencyDashboard;
