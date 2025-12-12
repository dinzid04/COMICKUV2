import React, { useState, useEffect } from 'react';
import { SEO } from '@/components/seo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { checkDailyStreak } from '@/lib/daily-streak';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Trophy, CheckCircle, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Donation {
  id: string;
  donator_name: string;
  amount: number;
  message: string;
  created_at: any;
}

const REWARDS = [150, 250, 350, 450, 550, 700, 1000]; // 7 Days

const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [streak, setStreak] = useState(0);
  const [claimedToday, setClaimedToday] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Streak Info
  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setStreak(data.streak || 0);

        // Check if claimed today
        if (data.lastLoginDate) {
          const lastDate = data.lastLoginDate.toDate();
          const today = new Date();
          if (lastDate.toDateString() === today.toDateString()) {
            setClaimedToday(true);
          }
        }
      }
    };
    fetchUserData();
  }, [user]);

  // Fetch Donations
  useEffect(() => {
    const q = query(collection(db, 'donations'), orderBy('amount', 'desc'), limit(10));
    const unsub = onSnapshot(q, (snapshot) => {
       const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
       setDonations(data);
    });
    return () => unsub();
  }, []);

  const handleCheckIn = async () => {
    if (!user) {
        toast({ title: "Login Required", variant: "destructive" });
        return;
    }
    setLoading(true);
    try {
        const result = await checkDailyStreak(user);
        if (result.success) {
            setStreak(result.newStreak);
            setClaimedToday(true);
            toast({ title: "Check-in Successful!", description: `You earned ${result.xpBonus} XP!` });
        } else {
            toast({ title: "Already Checked In", description: "Come back tomorrow!" });
        }
    } catch (e) {
        console.error(e);
        toast({ title: "Error", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <SEO title="Support Us & Rewards" description="Daily check-in rewards and donation leaderboard." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Daily Check-in Section */}
        <div className="space-y-6">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Daily Check-in
              </CardTitle>
              <CardDescription>Claim XP rewards daily to level up faster!</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
                 {REWARDS.map((reward, index) => {
                    const day = index + 1;
                    const isCompleted = streak >= day; // Simple logic, ideally based on current cycle
                    // Complex cycle logic: (streak % 7) == day_index... simplification for UI
                    const isActive = (streak % 7) === index;

                    return (
                        <div key={index} className={`
                            flex flex-col items-center justify-center p-2 rounded-lg border
                            ${isActive ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2' : 'border-border bg-muted/50'}
                            ${isCompleted && !isActive ? 'opacity-50' : ''}
                        `}>
                            <span className="text-xs font-bold text-muted-foreground">Day {day}</span>
                            <span className="text-lg font-bold text-primary">+{reward}</span>
                            <span className="text-[10px] text-muted-foreground">XP</span>
                        </div>
                    );
                 })}
               </div>

               <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">{streak} Day Streak 🔥</h3>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={handleCheckIn}
                    disabled={claimedToday || loading}
                  >
                    {loading ? "Checking in..." : claimedToday ? "Claimed Today ✅" : "Check In Now"}
                  </Button>
               </div>
            </CardContent>
          </Card>

          {/* Donation Info */}
          <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-green-500" />
                    Support Server
                </CardTitle>
                <CardDescription>
                    Help us keep the servers running. Top supporters get featured!
                </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    You can donate via Saweria (GoPay, OVO, Dana, LinkAja, QRIS).
                    Your name will automatically appear on the leaderboard below.
                </p>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold" asChild>
                    <a href="https://saweria.co/YOUR_USERNAME" target="_blank" rel="noopener noreferrer">
                        Donate via Saweria <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                </Button>
             </CardContent>
          </Card>
        </div>

        {/* Leaderboard Section */}
        <div>
           <Card className="h-full">
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Top Supporters
                </CardTitle>
                <CardDescription>Thank you to our heroes!</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="space-y-4">
                    {donations.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No donations yet. Be the first!
                        </div>
                    ) : (
                        donations.map((d, i) => (
                            <div key={d.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                                <div className={`
                                    flex items-center justify-center w-8 h-8 rounded-full font-bold text-white
                                    ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-700' : 'bg-primary/50'}
                                `}>
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-lg">{d.donator_name}</span>
                                        <span className="font-mono text-green-600 dark:text-green-400 font-bold">
                                            Rp {d.amount.toLocaleString()}
                                        </span>
                                    </div>
                                    {d.message && (
                                        <p className="text-sm text-muted-foreground italic">"{d.message}"</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
             </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
};

export default SupportPage;
