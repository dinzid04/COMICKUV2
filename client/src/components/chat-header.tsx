import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, Search, Phone, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from '@shared/types';
import VerificationBadge from "@/components/ui/verification-badge";
import { useLocation } from "wouter";

interface ChatHeaderProps {
  chatUser?: User | null;
  onBack: () => void;
  isMobile?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatUser, onBack, isMobile }) => {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="h-16 px-4 border-b flex items-center justify-between bg-background sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleBack} className="md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {chatUser ? (
          <div className="flex items-center gap-3">
            <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={chatUser.photoUrl} alt={chatUser.nickname} />
                <AvatarFallback>{chatUser.nickname?.charAt(0)}</AvatarFallback>
                </Avatar>
                {/* Online indicator could go here if we passed it down */}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">{chatUser.nickname}</span>
                <VerificationBadge verification={chatUser.verification} size="sm" />
              </div>
              <span className="text-xs text-muted-foreground">
                 Click to view profile
              </span>
            </div>
          </div>
        ) : (
           <div className="flex items-center gap-3">
               <span className="font-semibold">Messages</span>
           </div>
        )}
      </div>

      <div className="flex items-center gap-2">
         {/* Placeholder for future features like call/search in chat */}
         {chatUser && (
             <>
                <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                </Button>
                 <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5 text-muted-foreground" />
                </Button>
             </>
         )}
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
