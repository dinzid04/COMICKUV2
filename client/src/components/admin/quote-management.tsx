import React, { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Edit } from 'lucide-react';
import { EditQuoteDialog } from '@/components/edit-quote-dialog';
import { BorderSelectionDialog } from '@/components/border-selection-dialog';

export interface Quote {
  id: string;
  text: string;
  author: string;
  avatar: string;
  border: string;
  fontStyle: 'normal' | 'italic' | 'bold';
}

const QuoteManagement: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [newQuote, setNewQuote] = useState<Omit<Quote, 'id'>>({ text: '', author: '', avatar: '', border: '', fontStyle: 'italic' });
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddBorderDialogOpen, setIsAddBorderDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const quotesCollectionRef = collection(db, "quotes");

  const getQuotes = async () => {
    setLoading(true);
    const data = await getDocs(quotesCollectionRef);
    setQuotes(data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Quote)));
    setLoading(false);
  };

  useEffect(() => {
    getQuotes();
  }, []);

  const handleAddQuote = async () => {
    if (!newQuote.text || !newQuote.author || !newQuote.avatar) return;
    setLoading(true);
    await addDoc(quotesCollectionRef, newQuote);
    setNewQuote({ text: '', author: '', avatar: '', border: '', fontStyle: 'italic' });
    getQuotes();
  };

  const handleDeleteQuote = async (id: string) => {
    const quoteDoc = doc(db, "quotes", id);
    await deleteDoc(quoteDoc);
    getQuotes();
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setIsEditDialogOpen(true);
  };

  const handleSaveQuote = async (quote: Quote) => {
    if (!quote) return;
    setLoading(true);
    const quoteDoc = doc(db, "quotes", quote.id);
    await updateDoc(quoteDoc, {
      text: quote.text,
      author: quote.author,
      avatar: quote.avatar,
      border: quote.border,
      fontStyle: quote.fontStyle,
    });
    setIsEditDialogOpen(false);
    getQuotes();
  };

  const handleSelectNewBorder = (borderUrl: string) => {
    setNewQuote({ ...newQuote, border: borderUrl });
    setIsAddBorderDialogOpen(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Add New Quote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Quote text"
              value={newQuote.text}
              onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
            />
            <Input
              placeholder="Author"
              value={newQuote.author}
              onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
            />
            <Input
              placeholder="Avatar URL"
              value={newQuote.avatar}
              onChange={(e) => setNewQuote({ ...newQuote, avatar: e.target.value })}
            />
            <div className="flex flex-col gap-2">
              <label htmlFor="fontStyle" className="text-sm font-medium">Font Style</label>
              <select
                id="fontStyle"
                value={newQuote.fontStyle}
                onChange={(e) => setNewQuote({ ...newQuote, fontStyle: e.target.value as 'normal' | 'italic' | 'bold' })}
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
                value={newQuote.border}
                onChange={(e) => setNewQuote({ ...newQuote, border: e.target.value })}
              />
              <Button variant="outline" onClick={() => setIsAddBorderDialogOpen(true)}>
                Choose
              </Button>
            </div>
            <Button onClick={handleAddQuote} className="w-full" disabled={loading || !newQuote.text || !newQuote.author || !newQuote.avatar}>
              {loading ? 'Adding...' : 'Add Quote'}
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Manage Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Quote</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div
                        className="relative h-12 w-12"
                        style={{
                          backgroundImage: `url(${quote.border || ''})`,
                          backgroundSize: 'cover',
                        }}
                      >
                        <Avatar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10">
                          <AvatarImage src={quote.avatar} alt={quote.author} />
                          <AvatarFallback>{quote.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{quote.text}</TableCell>
                    <TableCell>{quote.author}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditQuote(quote)} aria-label="Edit quote">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteQuote(quote.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <EditQuoteDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        quote={editingQuote}
        onSave={handleSaveQuote}
      />
      <BorderSelectionDialog
        isOpen={isAddBorderDialogOpen}
        onClose={() => setIsAddBorderDialogOpen(false)}
        onSelectBorder={handleSelectNewBorder}
        avatarUrl={newQuote.avatar}
        currentBorder={newQuote.border}
      />
    </div>
  );
};

export default QuoteManagement;
