import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface DayReward {
  type: 'xp' | 'coin';
  amount: number;
}

interface GamificationSettings {
  days: DayReward[];
}

const DEFAULT_DAYS: DayReward[] = Array(7).fill({ type: 'xp', amount: 50 });

const GamificationSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GamificationSettings>({
    days: DEFAULT_DAYS
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "gamification");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Handle migration from old single-value format to array
          if (data.days) {
             setSettings(data as GamificationSettings);
          } else {
             // Migrate old format (rewardType/rewardAmount) to all days or just reset
             // Let's just reset to default for cleanliness or map old val to all days
             const oldType = data.rewardType || 'xp';
             const oldAmount = data.rewardAmount || 50;
             setSettings({
                 days: Array(7).fill({ type: oldType, amount: oldAmount })
             });
          }
        } else {
          // Initialize default if not exists
          await setDoc(docRef, {
            days: DEFAULT_DAYS
          });
          setSettings({ days: DEFAULT_DAYS });
        }
      } catch (error) {
        console.error("Error fetching gamification settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "settings", "gamification");
      await setDoc(docRef, settings);
      toast({
        title: "Success",
        description: "Gamification settings updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const updateDay = (index: number, field: keyof DayReward, value: any) => {
      const newDays = [...settings.days];
      newDays[index] = { ...newDays[index], [field]: value };
      setSettings({ days: newDays });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Streak Rewards (7 Days Cycle)</CardTitle>
        <CardDescription>
          Configure the reward type and amount for each day of the streak.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            {settings.days.map((day, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
                    <div className="w-16 font-bold text-sm">Day {index + 1}</div>

                    <div className="flex-1 space-y-2">
                        <Label className="text-xs">Type</Label>
                        <RadioGroup
                            value={day.type}
                            onValueChange={(val) => updateDay(index, 'type', val)}
                            className="flex gap-4"
                        >
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="xp" id={`xp-${index}`} />
                                <Label htmlFor={`xp-${index}`}>XP</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="coin" id={`coin-${index}`} />
                                <Label htmlFor={`coin-${index}`}>Coin</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="w-32 space-y-2">
                        <Label className="text-xs">Amount</Label>
                        <Input
                            type="number"
                            min="1"
                            value={day.amount}
                            onChange={(e) => updateDay(index, 'amount', parseInt(e.target.value) || 0)}
                        />
                    </div>
                </div>
            ))}
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GamificationSettings;
