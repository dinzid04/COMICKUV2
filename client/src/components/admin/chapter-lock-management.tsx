import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { doc, setDoc, getDoc, collection, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Save, Search, Trash2, Coins } from "lucide-react";
import { extractChapterId } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LockedChapter {
  id: string;
  price: number;
  isLocked: boolean;
  manhwaId?: string;
  manhwaSlug?: string;
}

const ChapterLockManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [chapterIdInput, setChapterIdInput] = useState("");
  const [manhwaIdInput, setManhwaIdInput] = useState("");
  const [currentChapter, setCurrentChapter] = useState<LockedChapter | null>(null);
  const [lockedList, setLockedList] = useState<LockedChapter[]>([]);
  const { toast } = useToast();

  // Fetch all locked chapters on mount
  useEffect(() => {
    fetchLockedChapters();
  }, []);

  const fetchLockedChapters = async () => {
    try {
      const q = query(collection(db, "locked_chapters"), where("isLocked", "==", true));
      const querySnapshot = await getDocs(q);
      const list: LockedChapter[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as LockedChapter);
      });
      setLockedList(list);
    } catch (error) {
      console.error("Error fetching locked list", error);
    }
  };

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
         const data = lockSnap.data() as LockedChapter;
         setCurrentChapter({
             id: cleanId,
             ...data
         });
         if (data.manhwaId) setManhwaIdInput(data.manhwaId);
      } else {
         // Default state for new lock
         setCurrentChapter({
             id: cleanId,
             price: 0,
             isLocked: false,
             manhwaId: ''
         });
         setManhwaIdInput('');
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

      const dataToSave = {
        price: currentChapter.price,
        isLocked: currentChapter.isLocked,
        manhwaId: manhwaIdInput || ''
      };

      await setDoc(lockRef, dataToSave);

      toast({
        title: "Success",
        description: `Chapter ${currentChapter.id} updated.`,
      });
      fetchLockedChapters();
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

  const handleUnlock = async (id: string) => {
      if(!confirm("Are you sure you want to unlock (delete lock) this chapter?")) return;
      try {
          await deleteDoc(doc(db, "locked_chapters", id));
          toast({ title: "Unlocked", description: "Lock removed." });
          fetchLockedChapters();
      } catch (error) {
          console.error("Error deleting lock:", error);
      }
  };

  return (
    <div className="space-y-8">
    <Card>
      <CardHeader>
        <CardTitle>Lock New Chapter</CardTitle>
        <CardDescription>
          Lock specific chapters and set a Coin price.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
             <Label htmlFor="chapterId" className="sr-only">Chapter ID / Slug</Label>
             <Input
                id="chapterId"
                placeholder="Enter Chapter Slug/ID (e.g. chapter-10)"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                     <Label>Manhwa ID (Optional)</Label>
                     <Input
                        placeholder="e.g. solo-leveling"
                        value={manhwaIdInput}
                        onChange={(e) => setManhwaIdInput(e.target.value)}
                     />
                     <p className="text-xs text-muted-foreground">Used for filtering and detail page icons.</p>
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
              </div>

              <div className="flex items-center justify-between pt-2">
                 <div className="flex items-center space-x-2">
                    <Switch
                        checked={currentChapter.isLocked}
                        onCheckedChange={(checked) => setCurrentChapter({...currentChapter, isLocked: checked})}
                        id="lock-switch"
                    />
                    <Label htmlFor="lock-switch">Locked</Label>
                 </div>
                 <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Saving...
                        </>
                    ) : (
                        <>
                           <Save className="mr-2 h-4 w-4" />
                           Save Lock
                        </>
                    )}
                 </Button>
              </div>
           </div>
        )}
      </CardContent>
    </Card>

    <Card>
        <CardHeader>
            <CardTitle>Locked Chapters List</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Chapter ID</TableHead>
                        <TableHead>Manhwa ID</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lockedList.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-mono text-xs">{item.id}</TableCell>
                            <TableCell>{item.manhwaId || '-'}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    <Coins className="h-3 w-3 text-yellow-500" />
                                    {item.price}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleUnlock(item.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {lockedList.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No locked chapters found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
    </div>
  );
};

export default ChapterLockManagement;
