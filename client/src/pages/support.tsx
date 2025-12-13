import React, { useState, useEffect } from 'react';
import { SEO } from '@/components/seo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { checkDailyStreak, updateStreakWithConfig } from '@/lib/daily-streak';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Trophy, CheckCircle, Calendar, DollarSign, ExternalLink, Coins } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Donation {
  id: string;
  donator_name: string;
  amount: number;
  message: string;
  created_at: any;
}

// Default Rewards if not configured, or placeholders
const DEFAULT_REWARDS = [150, 250, 350, 450, 550, 700, 1000]; // 7 Days

const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [streak, setStreak] = useState(0);
  const [claimedToday, setClaimedToday] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [rewardConfig, setRewardConfig] = useState<{days: {type: 'xp'|'coin', amount: number}[]}>({
      days: Array(7).fill({ type: 'xp', amount: 50 })
  });

  // Fetch Streak Info & Reward Config
  useEffect(() => {
    // Fetch Reward Config
    const fetchConfig = async () => {
        try {
            const configRef = doc(db, "settings", "gamification");
            const configSnap = await getDoc(configRef);
            if (configSnap.exists()) {
                const data = configSnap.data();
                if (data.days) {
                    setRewardConfig(data as any);
                }
            }
        } catch (e) {
            console.error("Failed to load reward config", e);
        }
    };
    fetchConfig();

    if (!user) return;
    const fetchUserData = async () => {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setStreak(data.streak || 0);

        // Check if claimed today
        // Use lastStreakClaim if available (new logic), otherwise fall back to lastLoginDate (migration)
        const claimDate = data.lastStreakClaim ? data.lastStreakClaim.toDate() : data.lastLoginDate?.toDate();

        if (claimDate) {
          const today = new Date();
          if (claimDate.toDateString() === today.toDateString()) {
             // If using legacy lastLoginDate, we must ensure it's actually a claim.
             // But since we just switched logic, users might have lastLoginDate from presence update.
             // So, strictly speaking, if they haven't claimed with new logic (lastStreakClaim),
             // we should probably let them claim.
             // However, to prevent double claiming if they just claimed before the code update...
             // Safest: Only trust lastStreakClaim if it exists. If not, assume not claimed (or let them claim once).
             if (data.lastStreakClaim) {
                 setClaimedToday(true);
             }
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
        // Use the new update function that reads config
        const result = await updateStreakWithConfig(user);
        if (result.success) {
            setStreak(result.newStreak);
            setClaimedToday(true);
            const rewardText = result.rewardType === 'coin' ? 'Coins' : 'XP';
            toast({ title: "Check-in Successful!", description: `You earned ${result.rewardAmount} ${rewardText}!` });
        } else {
            toast({ title: "Already Checked In", description: "Come back tomorrow!" });
        }
    } catch (e) {
        console.error(e);
        toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
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
                 {rewardConfig.days.map((config, index) => {
                    const day = index + 1;
                    // Visualize streak. If streak > 7, we just mod 7 for cycle, but for "Day 1..7" grid,
                    // we show if streak >= day (for first week) OR if user is in that day of cycle.
                    // Simplified: Just highlight current day of cycle.
                    const cycleDay = (streak % 7);
                    // Note: streak 1 = index 0. streak 0 = no active.
                    // If streak is 8, it's index 0 again.
                    // If cycleDay matches index, it's next/current target.

                    const isCompleted = streak > 0 && (streak % 7) > index; // Completed in current cycle
                    const isCurrent = (streak % 7) === index; // Next to claim

                    // Actually, simpler logic:
                    // Just show the 7 days plan. Highlight the one that corresponds to (streak % 7).
                    const isActive = (streak % 7) === index;

                    return (
                        <div key={index} className={`
                            flex flex-col items-center justify-center p-2 rounded-lg border
                            ${isActive ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2' : 'border-border bg-muted/50'}
                            ${isCompleted && !isActive ? 'opacity-50' : ''}
                        `}>
                            <span className="text-xs font-bold text-muted-foreground">Day {day}</span>
                            <span className="text-lg font-bold text-primary flex items-center gap-1">
                                +{config.amount}
                                {config.type === 'coin' && <Coins className="h-3 w-3" />}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase">{config.type}</span>
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

                <DirectDonationDialog user={user} />

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                    <a href="https://saweria.co/gadingkencana" target="_blank" rel="noopener noreferrer">
                        Open Saweria Page <ExternalLink className="ml-2 h-4 w-4" />
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

const DirectDonationDialog = ({ user }: { user: any }) => {
    const [amount, setAmount] = useState("5000");
    const [message, setMessage] = useState("Support Comicku");
    const [qrString, setQrString] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [step, setStep] = useState<'input' | 'payment' | 'success'>('input');
    const [loading, setLoading] = useState(false);

    // Poll for status
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 'payment' && transactionId) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/saweria/status/${transactionId}`);
                    const data = await res.json();
                    if (data.paid) {
                        setStep('success');
                        clearInterval(interval);
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [step, transactionId]);

    const handleGenerate = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch("/api/saweria/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseInt(amount),
                    sender: user.displayName || user.nickname || "Anonymous",
                    email: user.email,
                    message: message
                })
            });
            const data = await res.json();

            if (data.qr_string) {
                setQrString(data.qr_string);
                setTransactionId(data.id);
                setStep('payment');
            } else {
                alert("Failed to generate QR: " + data.error);
            }
        } catch (e) {
            alert("Error generating QR");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                    Donate Direct (QRIS) <DollarSign className="ml-2 h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Donate via QRIS</DialogTitle>
                    <DialogDescription>Scan the QR code with any e-wallet (GoPay, OVO, Dana, etc).</DialogDescription>
                </DialogHeader>

                {step === 'input' && (
                    <div className="space-y-6 py-4">
                        <div className="space-y-3">
                            <Label>Select Amount</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[1000, 2000, 3000, 5000].map((val) => (
                                    <Button
                                        key={val}
                                        variant={parseInt(amount) === val ? "default" : "outline"}
                                        onClick={() => setAmount(val.toString())}
                                        className={parseInt(amount) === val ? "bg-yellow-500 hover:bg-yellow-600 text-black border-transparent" : ""}
                                    >
                                        {val / 1000}k
                                    </Button>
                                ))}
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min={1000}
                                    className="pl-9"
                                    placeholder="Custom amount"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                maxLength={200}
                                placeholder="Your message..."
                            />
                        </div>
                        <Button
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                            onClick={handleGenerate}
                            disabled={loading || !user || parseInt(amount) < 1000}
                        >
                            {loading ? "Generating..." : "Continue to Pay"}
                        </Button>
                        {!user && <p className="text-red-500 text-xs text-center">Please login to donate</p>}
                    </div>
                )}

                {step === 'payment' && (
                    <div className="flex flex-col items-center justify-center space-y-4 py-4">
                        <div className="p-4 bg-white rounded-lg">
                            <QRCode value={qrString} size={200} />
                        </div>
                        <p className="text-sm text-center text-muted-foreground">
                            Waiting for payment... <br/>
                            <span className="animate-pulse font-bold text-yellow-600">Checking status</span>
                        </p>
                        <p className="text-xs text-center text-muted-foreground">
                            ID: {transactionId}
                        </p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <h3 className="text-xl font-bold">Thank You!</h3>
                        <p className="text-center">Your donation has been received.</p>
                        <Button onClick={() => setStep('input')} variant="outline">Donate Again</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SupportPage;
