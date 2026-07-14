import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/data/types';
import { Ambulance, Car, Shield, Building2, Stethoscope } from 'lucide-react';

const roles: { role: UserRole; title: string; description: string; icon: React.ElementType; color: string }[] = [
  {
    role: 'ambulance',
    title: 'Ambulance Driver',
    description: 'Navigate to hospitals with real-time traffic updates and emergency routing',
    icon: Ambulance,
    color: 'text-emergency bg-emergency/10 hover:bg-emergency/20',
  },
  {
    role: 'temporary',
    title: 'Temporary Emergency Vehicle',
    description: 'Request emergency authorization when ambulance is unavailable',
    icon: Car,
    color: 'text-warning bg-warning/10 hover:bg-warning/20',
  },
  {
    role: 'police',
    title: 'Police Control Room',
    description: 'Monitor all active emergency vehicles in real-time',
    icon: Shield,
    color: 'text-primary bg-primary/10 hover:bg-primary/20',
  },
  {
    role: 'hospital',
    title: 'Hospital Staff',
    description: 'Track incoming emergencies and verify patient arrivals',
    icon: Building2,
    color: 'text-success bg-success/10 hover:bg-success/20',
  },
];

const RoleSelector = () => {
  const navigate = useNavigate();
  const { setRole } = useApp();

  const handleRoleSelect = (role: UserRole) => {
    // Navigate to login page for the selected role
    navigate(`/login/${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-medical/5 flex flex-col">
      {/* Header */}
      <header className="w-full p-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-emergency flex items-center justify-center emergency-pulse">
              <Ambulance className="w-7 h-7 text-emergency-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">RapidRescue</h1>
            <p className="text-sm text-muted-foreground">Smart Emergency Navigation</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Select Your Role
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Choose your role to access the appropriate dashboard and features
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full stagger-children">
          {roles.map(({ role, title, description, icon: Icon, color }) => (
            <Card
              key={role}
              className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-2 border-transparent hover:border-primary/20 ${color.split(' ').slice(1).join(' ')}`}
              onClick={() => handleRoleSelect(role)}
            >
              <CardHeader className="pb-2">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-2 ${color.split(' ').slice(0, 2).join(' ')}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Badge */}
        <div className="mt-10 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground animate-fade-in">
          🎯 Demo Mode • Pre-loaded with Bangalore data
        </div>
      </main>

      {/* Floating Medical Bot Button */}
      <button
        onClick={() => navigate('/medical-bot')}
        className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 px-4 py-3 rounded-full bg-medical text-medical-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105"
        aria-label="Open Medical Bot"
      >
        <Stethoscope className="w-5 h-5" />
        <span className="font-medium text-sm">Medical Bot</span>
      </button>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>RapidRescue Emergency Navigation System • Hackathon Demo</p>
      </footer>
    </div>
  );
};

export default RoleSelector;
