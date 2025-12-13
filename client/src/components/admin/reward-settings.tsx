import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useToast } from "@/hooks/use-toast";
import { Gift, Coins, Zap } from "lucide-react";

export default function RewardSettings() {
  const [rewardType, setRewardType] = useState<"xp" | "coin">("xp");
  const [rewardAmount, setRewardAmount] = useState<number>(150);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "rewards");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setRewardType(data.type || "xp");
          setRewardAmount(data.amount || 150);
        }
      } catch (e) {
        console.error("Failed to fetch reward settings", e);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "settings", "rewards"), {
        type: rewardType,
        amount: Number(rewardAmount)
      });
      toast({ title: "Settings Saved", description: "Daily streak reward updated." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Daily Streak Reward Configuration
        </CardTitle>
        <CardDescription>
          Choose what users receive when they check in daily.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Reward Type</Label>
          <RadioGroup
            value={rewardType}
            onValueChange={(val) => setRewardType(val as "xp" | "coin")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <RadioGroupItem value="xp" id="r-xp" />
              <Label htmlFor="r-xp" className="flex items-center gap-2 cursor-pointer">
                <Zap className="h-4 w-4 text-yellow-500" /> XP (Experience)
              </Label>
            </div>
            <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <RadioGroupItem value="coin" id="r-coin" />
              <Label htmlFor="r-coin" className="flex items-center gap-2 cursor-pointer">
                <Coins className="h-4 w-4 text-yellow-500" /> Coins
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2 max-w-xs">
          <Label>Base Reward Amount (Day 1)</Label>
          <div className="relative">
             <Input
                type="number"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(Number(e.target.value))}
             />
             <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {rewardType === 'xp' ? 'XP' : 'Coins'}
             </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Multipliers for subsequent days will be calculated based on this base amount.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Configuration"}
        </Button>
      </CardFooter>
    </Card>
  );
}
