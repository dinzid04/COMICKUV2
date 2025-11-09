import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const borders = [
  "https://cdn.dinzid.biz.id/7QoU.png",
  "https://cdn.dinzid.biz.id/giUX.png",
  "https://cdn.dinzid.biz.id/jCNk.png",
  "https://cdn.dinzid.biz.id/N7vK.png",
  "https://cdn.dinzid.biz.id/0LbV.png",
  "https://cdn.dinzid.biz.id/fbiW.png"
];

interface BorderSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBorder: (borderUrl: string) => void;
  avatarUrl?: string;
  currentBorder?: string;
}

export function BorderSelectionDialog({ isOpen, onClose, onSelectBorder, avatarUrl, currentBorder }: BorderSelectionDialogProps) {
  const [selectedBorder, setSelectedBorder] = useState(currentBorder || '');
  const [customBorder, setCustomBorder] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedBorder(currentBorder || '');
    }
  }, [isOpen, currentBorder]);

  const handleSave = () => {
    onSelectBorder(selectedBorder);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose a Border</DialogTitle>
        </DialogHeader>

        {avatarUrl && (
          <div className="flex justify-center items-center my-4 p-4 border rounded-md">
            <div
              className="relative h-24 w-24 flex items-center justify-center"
              style={{
                backgroundImage: `url(${selectedBorder})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt="Avatar Preview" />
                <AvatarFallback>AV</AvatarFallback>
              </Avatar>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 py-4">
          {borders.map((border, index) => (
            <div
              key={border}
              className={`cursor-pointer rounded-md overflow-hidden border-2 ${selectedBorder === border ? 'border-primary' : 'border-transparent'}`}
              onClick={() => setSelectedBorder(border)}
            >
              <img
                src={border}
                alt={`Border ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Or enter a custom border URL"
            value={customBorder}
            onChange={(e) => setCustomBorder(e.target.value)}
          />
          <Button onClick={() => setSelectedBorder(customBorder)}>Preview</Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
