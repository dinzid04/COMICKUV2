import React from 'react';
import { Check, Shield, Award } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  verification: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  verification,
  size = 'md',
  showTooltip = true
}) => {
  if (!verification) return null;

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const getBadgeContent = () => {
    switch (verification) {
      case 'verified':
        return {
          icon: <Check className={`${sizeClasses[size]} text-white`} strokeWidth={4} />,
          bg: "bg-blue-500",
          label: "Verified User"
        };
      case 'admin':
        return {
          icon: <Shield className={`${sizeClasses[size]} text-white`} fill="currentColor" />,
          bg: "bg-red-500",
          label: "Administrator"
        };
      case 'premium': // Example extension
        return {
            icon: <Award className={`${sizeClasses[size]} text-white`} />,
            bg: "bg-yellow-500",
            label: "Premium Member"
        };
      default:
        return null;
    }
  };

  const content = getBadgeContent();
  if (!content) return null;

  const BadgeElement = (
    <span className={`inline-flex items-center justify-center rounded-full ${content.bg} p-0.5 ml-1`}>
      {content.icon}
    </span>
  );

  if (!showTooltip) return BadgeElement;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {BadgeElement}
        </TooltipTrigger>
        <TooltipContent>
          <p>{content.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerificationBadge;
