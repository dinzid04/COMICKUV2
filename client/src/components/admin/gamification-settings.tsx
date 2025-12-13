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

interface GamificationSettings {
  rewardType: 'xp' | 'coin';
  rewardAmount: number;
}

const GamificationSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GamificationSettings>({
    rewardType: 'xp',
    rewardAmount: 50
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "gamification");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSettings(docSnap.data() as GamificationSettings);
        } else {
          // Initialize default if not exists
          await setDoc(docRef, {
            rewardType: 'xp',
            rewardAmount: 50
          });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Streak Rewards</CardTitle>
        <CardDescription>
          Configure the reward type and amount for daily check-ins.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reward Type</Label>
            <RadioGroup
              value={settings.rewardType}
              onValueChange={(value) => setSettings({ ...settings, rewardType: value as 'xp' | 'coin' })}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xp" id="xp" />
                <Label htmlFor="xp">Experience Points (XP)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="coin" id="coin" />
                <Label htmlFor="coin">Coins</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Reward Amount</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={settings.rewardAmount}
              onChange={(e) => setSettings({ ...settings, rewardAmount: parseInt(e.target.value) || 0 })}
            />
            <p className="text-sm text-muted-foreground">
              The amount of XP or Coins a user receives for checking in.
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
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
