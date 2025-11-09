import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from '@/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

interface Quote {
  id: string;
  text: string;
  author: string;
  avatar: string;
  border: string;
  fontStyle: 'normal' | 'italic' | 'bold';
}

export function WelcomeSlider() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    const getQuotes = async () => {
      const quotesCollectionRef = collection(db, "quotes");
      const data = await getDocs(quotesCollectionRef);
      setQuotes(data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Quote)));
    };
    getQuotes();
  }, []);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {quotes.map((quote, index) => (
          <div className={`flex-[0_0_100%] min-w-0 ${index > 0 ? 'ml-4' : ''}`} key={quote.id}>
            <div className="bg-muted/50 p-4 rounded-lg flex items-center gap-4 h-24 overflow-y-auto">
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
              <div>
                <p
                  className={`text-sm font-medium ${
                    quote.fontStyle === 'italic' ? 'italic' :
                    quote.fontStyle === 'bold' ? 'font-bold' : 'font-normal'
                  }`}
                >
                  "{quote.text}"
                </p>
                <p className="text-xs text-muted-foreground">- {quote.author}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
