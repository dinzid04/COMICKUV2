import React from 'react';
import { Shield, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  verification: 'admin' | 'verified' | null | undefined;
  className?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ verification, className }) => {
  if (!verification) return null;

  const badge = {
    admin: {
      icon: <Shield className="h-4 w-4 text-white" />,
      tooltip: "Admin",
      className: "bg-red-500 rounded-full p-0.5",
    },
    verified: {
      icon: <Check className="h-4 w-4 text-white" />,
      tooltip: "Verified",
      className: "bg-blue-500 rounded-full p-0.5",
    },
  };

  const currentBadge = badge[verification];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`${currentBadge.className} ${className}`}>
            {currentBadge.icon}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{currentBadge.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerificationBadge;
