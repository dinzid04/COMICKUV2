import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

const quoteSectionSchema = z.object({
  quote: z.string().min(1, "Kutipan tidak boleh kosong"),
  author: z.string().min(1, "Nama author tidak boleh kosong"),
  authorImageUrl: z.string().url("URL gambar author tidak valid"),
});

type QuoteSectionFormData = z.infer<typeof quoteSectionSchema>;

const AdminDashboard = () => {
  const { user, loading, isAdmin, needsSetup, recheckAdminStatus } = useAuth();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteSectionFormData>({
    resolver: zodResolver(quoteSectionSchema),
  });

  const fetchQuoteData = useCallback(async () => {
    try {
      setIsDataLoading(true);
      const settingsDocRef = doc(db, "dashboard", "settings");
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists() && docSnap.data()?.quoteSection) {
        reset(docSnap.data().quoteSection);
      }
    } catch (error) {
      console.error("Error fetching quote data:", error);
    } finally {
      setIsDataLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    const initializeSettings = async () => {
      if (needsSetup && user) {
        setIsSettingUp(true);
        const settingsDocRef = doc(db, "dashboard", "settings");
        const defaultSettings = {
          admins: [user.uid],
          quoteSection: {
            quote: "Persahabatan itu adalah tempat saling berbagi rasa sakit.",
            author: "Yoimiya",
            authorImageUrl: "https://cdn.nefyu.my.id/030i.jpeg",
          },
        };

        try {
          await setDoc(settingsDocRef, defaultSettings);
          await recheckAdminStatus();
          await fetchQuoteData();
        } catch (error) {
          console.error("Error initializing settings:", error);
        } finally {
          setIsSettingUp(false);
        }
      }
    };

    initializeSettings();
  }, [needsSetup, user, recheckAdminStatus, fetchQuoteData]);

  useEffect(() => {
    if (isAdmin) {
      fetchQuoteData();
    } else {
      setIsDataLoading(false);
    }
  }, [isAdmin, fetchQuoteData]);

  const onSubmit = async (data: QuoteSectionFormData) => {
    try {
      const settingsDocRef = doc(db, "dashboard", "settings");
      await setDoc(settingsDocRef, { quoteSection: data }, { merge: true });
      toast({
        title: "Sukses",
        description: "Bagian kutipan berhasil diperbarui.",
      });
    } catch (error) {
      console.error("Error updating quote section:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui kutipan. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  if (loading || isDataLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (isSettingUp || (needsSetup && user)) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Spinner size="large" />
        <p className="mt-4 text-lg text-muted-foreground">
          Melakukan pengaturan awal, mohon tunggu...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Pengguna akan diarahkan oleh komponen AdminRoute
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <h2 className="text-lg font-semibold mb-6">Atur Bagian Kutipan</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <Label htmlFor="quote">Kutipan (Quote)</Label>
          <Input id="quote" {...register("quote")} />
          {errors.quote && <p className="text-red-500 text-sm mt-1">{errors.quote.message}</p>}
        </div>
        <div>
          <Label htmlFor="author">Author</Label>
          <Input id="author" {...register("author")} />
          {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>}
        </div>
        <div>
          <Label htmlFor="authorImageUrl">URL Gambar Author</Label>
          <Input id="authorImageUrl" {...register("authorImageUrl")} />
          {errors.authorImageUrl && <p className="text-red-500 text-sm mt-1">{errors.authorImageUrl.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="small" /> : "Simpan Perubahan"}
        </Button>
      </form>
    </div>
  );
};

export default AdminDashboard;
