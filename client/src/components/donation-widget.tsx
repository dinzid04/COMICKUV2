import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coffee } from 'lucide-react';

const DonationWidget: React.FC = () => {
  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="rounded-full h-12 w-12 shadow-lg bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-white animate-bounce">
            <Coffee className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <Coffee className="h-5 w-5 text-yellow-500" />
               Traktir Kopi
            </DialogTitle>
            <DialogDescription>
              Dukung pengembangan Comicku agar server tetap menyala! 🚀
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <a
                href="https://trakteer.id/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center p-4 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg font-bold transition-colors"
            >
                Trakteer.id
            </a>
            <a
                href="https://saweria.co/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center p-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 rounded-lg font-bold transition-colors"
            >
                Saweria
            </a>
            {/* PayPal or others */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DonationWidget;
