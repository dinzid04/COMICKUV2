import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/seo';
import { Loader2, AlertCircle, LogOut, Save } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '@/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  nickname: z.string().min(3, 'Nickname must be at least 3 characters').max(20, 'Nickname must be at most 20 characters'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [nickname, setNickname] = React.useState(user?.displayName || '');

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      const fetchNickname = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().nickname) {
          const fetchedNickname = docSnap.data().nickname;
          setNickname(fetchedNickname);
          setValue('nickname', fetchedNickname);
        } else if (user.displayName) {
          setNickname(user.displayName);
          setValue('nickname', user.displayName);
        }
      };
      fetchNickname();
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, { nickname: data.nickname }, { merge: true });
      setNickname(data.nickname);
      toast({ title: 'Success', description: 'Nickname updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update nickname.', variant: 'destructive' });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
        <p className="text-muted-foreground">Kamu harus login untuk melihat halaman profil.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <SEO title="Profil Saya" description="Kelola informasi profil dan preferensi kamu." />
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={user.photoURL || undefined} alt={nickname || 'User'} />
          <AvatarFallback>{nickname?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold mb-2">{nickname || 'Pengguna'}</h1>
        <p className="text-muted-foreground mb-8">{user.email}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
          <div>
            <Input
              {...register('nickname')}
              placeholder="Enter your nickname"
              className="text-center"
            />
            {errors.nickname && <p className="text-destructive text-sm mt-2">{errors.nickname.message}</p>}
          </div>
          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Simpan Nickname</span>
          </Button>
        </form>

        <Button onClick={logout} variant="destructive" className="gap-2 mt-8">
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
