import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Save, Search } from "lucide-react";
import { api, extractChapterId, extractManhwaId } from "@/lib/api";

const ChapterLockManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [chapterIdInput, setChapterIdInput] = useState("");
  const [currentChapter, setCurrentChapter] = useState<{id: string, price: number, isLocked: boolean} | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!chapterIdInput) return;
    setSearchLoading(true);
    setCurrentChapter(null);

    try {
      // 1. Check if chapter exists in our lock DB
      const cleanId = extractChapterId(chapterIdInput);
      const lockRef = doc(db, "locked_chapters", cleanId);
      const lockSnap = await getDoc(lockRef);

      if (lockSnap.exists()) {
         setCurrentChapter({
             id: cleanId,
             ...lockSnap.data() as any
         });
      } else {
         // Default state for new lock
         setCurrentChapter({
             id: cleanId,
             price: 0,
             isLocked: false
         });
      }
    } catch (error) {
      console.error("Error finding chapter lock info:", error);
      toast({
        title: "Error",
        description: "Failed to fetch chapter info.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentChapter) return;
    setLoading(true);
    try {
      const lockRef = doc(db, "locked_chapters", currentChapter.id);

      // If unlocking and price is 0, maybe we should delete the doc?
      // User requirement: "admin dapat mengkunci... admin dapat memasukan jumlah coin"
      // If isLocked is false, effectively it's not locked.

      await setDoc(lockRef, {
        price: currentChapter.price,
        isLocked: currentChapter.isLocked
      });

      toast({
        title: "Success",
        description: `Chapter ${currentChapter.id} updated.`,
      });
    } catch (error) {
      console.error("Error saving lock info:", error);
      toast({
        title: "Error",
        description: "Failed to save lock settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chapter Locking</CardTitle>
        <CardDescription>
          Lock specific chapters and set a Coin price for users to unlock them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
             <Label htmlFor="chapterId" className="sr-only">Chapter ID / Slug</Label>
             <Input
                id="chapterId"
                placeholder="Enter Chapter Slug or ID (e.g., chapter-100)"
                value={chapterIdInput}
                onChange={(e) => setChapterIdInput(e.target.value)}
             />
          </div>
          <Button onClick={handleSearch} disabled={searchLoading || !chapterIdInput}>
            {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {currentChapter && (
           <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
              <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                    <Label className="text-base">Lock Status</Label>
                    <p className="text-sm text-muted-foreground">
                       Enable to prevent users from reading without paying.
                    </p>
                 </div>
                 <Switch
                    checked={currentChapter.isLocked}
                    onCheckedChange={(checked) => setCurrentChapter({...currentChapter, isLocked: checked})}
                 />
              </div>

              <div className="space-y-2">
                 <Label>Price (Coins)</Label>
                 <Input
                    type="number"
                    min="0"
                    value={currentChapter.price}
                    onChange={(e) => setCurrentChapter({...currentChapter, price: parseInt(e.target.value) || 0})}
                 />
              </div>

              <div className="pt-2">
                 <Button onClick={handleSave} disabled={loading} className="w-full">
                    {loading ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Saving...
                        </>
                    ) : (
                        <>
                           <Save className="mr-2 h-4 w-4" />
                           Update Chapter Lock
                        </>
                    )}
                 </Button>
              </div>
           </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChapterLockManagement;
