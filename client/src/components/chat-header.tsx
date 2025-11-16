import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home, User, Swords } from 'lucide-react';

const ChatHeader: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
      <Link href="/">
        <div className="flex items-center gap-2 cursor-pointer">
          <Swords className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold font-display">COMICKU</h1>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default ChatHeader;
