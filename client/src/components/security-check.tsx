import React from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from 'lucide-react';

interface SecurityCheckProps {
  onVerify: () => void;
}

const SecurityCheck: React.FC<SecurityCheckProps> = ({ onVerify }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Security Check</CardTitle>
            <CardDescription>
              Please complete the verification to access Comicku
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pb-8">
          <Turnstile
            siteKey="0x4AAAAAACFfejFFljemif4u" // Using the same site key as seen in auth.tsx (or standard test key)
            onSuccess={onVerify}
            options={{
              theme: 'auto',
              size: 'normal',
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityCheck;
