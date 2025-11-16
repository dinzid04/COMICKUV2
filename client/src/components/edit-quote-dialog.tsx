import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Quote } from './admin/quote-management';
import { BorderSelectionDialog } from './border-selection-dialog';

interface EditQuoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
  onSave: (quote: Quote) => void;
}

export function EditQuoteDialog({ isOpen, onClose, quote, onSave }: EditQuoteDialogProps) {
  const [editedQuote, setEditedQuote] = React.useState<Quote | null>(quote);
  const [isBorderDialogOpen, setIsBorderDialogOpen] = React.useState(false);

  React.useEffect(() => {
    setEditedQuote(quote);
  }, [quote]);

  const handleSelectBorder = (borderUrl: string) => {
    if (editedQuote) {
      setEditedQuote({ ...editedQuote, border: borderUrl });
    }
    setIsBorderDialogOpen(false);
  };

  if (!editedQuote) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Quote</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Quote text"
            value={editedQuote.text}
            onChange={(e) => setEditedQuote({ ...editedQuote, text: e.target.value })}
          />
          <Input
            placeholder="Author"
            value={editedQuote.author}
            onChange={(e) => setEditedQuote({ ...editedQuote, author: e.target.value })}
          />
          <Input
            placeholder="Avatar URL"
            value={editedQuote.avatar}
            onChange={(e) => setEditedQuote({ ...editedQuote, avatar: e.target.value })}
          />
          <div className="flex flex-col gap-2">
            <label htmlFor="editFontStyle" className="text-sm font-medium">Font Style</label>
            <select
              id="editFontStyle"
              value={editedQuote.fontStyle || 'italic'}
              onChange={(e) => setEditedQuote({ ...editedQuote, fontStyle: e.target.value as 'normal' | 'italic' | 'bold' })}
              className="w-full p-2 border rounded-md"
            >
              <option value="normal">Normal</option>
              <option value="italic">Italic</option>
              <option value="bold">Bold</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Border URL (optional)"
              value={editedQuote.border}
              onChange={(e) => setEditedQuote({ ...editedQuote, border: e.target.value })}
            />
            <Button variant="outline" onClick={() => setIsBorderDialogOpen(true)}>
              Choose
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editedQuote)}>Save</Button>
        </DialogFooter>
      </DialogContent>
      <BorderSelectionDialog
        isOpen={isBorderDialogOpen}
        onClose={() => setIsBorderDialogOpen(false)}
        onSelectBorder={handleSelectBorder}
        avatarUrl={editedQuote.avatar}
        currentBorder={editedQuote.border}
      />
    </Dialog>
  );
}
