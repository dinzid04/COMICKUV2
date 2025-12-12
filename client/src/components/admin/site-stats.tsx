import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Activity, Globe, MousePointerClick } from 'lucide-react';

const SiteStats: React.FC = () => {
  const [visits, setVisits] = useState<number>(0);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "site_stats", "general"), (doc) => {
        if (doc.exists()) {
            setVisits(doc.data().visits || 0);
        }
    });
    return () => unsub();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Total Website Visits
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{visits.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                    Combined authenticated and anonymous sessions
                </p>
            </CardContent>
        </Card>

        {/* Placeholder for future stats */}
        <Card className="opacity-50">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Active Pages
                </CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                   Tracking coming soon
                </p>
            </CardContent>
        </Card>
    </div>
  );
};

export default SiteStats;
