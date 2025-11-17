import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/seo';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { useRoute, Link, useLocation } from 'wouter';
import { Loader2, AlertCircle, LogOut, Save, Edit, Camera, Link as LinkIcon, BookOpen, Star, UserPlus, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, setDoc, getDoc, collection, getDocs, query, writeBatch, increment, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { User } from 'shared/types';
import { MessageSquare, Github, Instagram, Music } from 'lucide-react';
import VerificationBadge from '@/components/ui/verification-badge';

const profileSchema = z.object({
  nickname: z.string().min(3, 'Nickname must be at least 3 characters').max(20, 'Nickname must be at most 20 characters'),
  bio: z.string().max(150, 'Bio must be at most 150 characters').optional(),
  socialLinks: z.object({
    whatsapp: z.string().url().or(z.literal("")).optional(),
    github: z.string().url().or(z.literal("")).optional(),
    instagram: z.string().url().or(z.literal("")).optional(),
    tiktok: z.string().url().or(z.literal("")).optional(),
    other: z.string().url().or(z.literal("")).optional(),
  }).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const cleanObject = (obj: any) => {
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
    return obj;
};

const ProfilePage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/profile/:userId?");
  const userId = params?.userId || currentUser?.uid;

  const [userData, setUserData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!userId) {
        setLoadingProfile(false);
        return;
    };

    const fetchUserData = async () => {
      setLoadingProfile(true);
      const userDocRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as User;
        setUserData(data);
        setValue('nickname', data.nickname);
        setValue('bio', data.bio);
        setValue('socialLinks', data.socialLinks);
      }
      setLoadingProfile(false);
    };

    const fetchFavorites = async () => {
      const favoritesRef = collection(db, 'users', userId, 'favorites');
      const q = query(favoritesRef);
      const querySnapshot = await getDocs(q);
      const favs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFavorites(favs);
    };

    const checkIfFollowing = async () => {
        if (!currentUser || currentUser.uid === userId) return;
        const followingRef = doc(db, 'users', currentUser.uid, 'following', userId);
        const docSnap = await getDoc(followingRef);
        setIsFollowing(docSnap.exists());
    };

    fetchUserData();
    fetchFavorites();
    checkIfFollowing();
  }, [userId, currentUser, setValue]);

  const handleFollowToggle = async () => {
    if (!currentUser || !userId || currentUser.uid === userId) return;

    const batch = writeBatch(db);
    const currentUserFollowingRef = doc(db, 'users', currentUser.uid, 'following', userId);
    const targetUserFollowersRef = doc(db, 'users', userId, 'followers', currentUser.uid);
    const currentUserRef = doc(db, 'users', currentUser.uid);
    const targetUserRef = doc(db, 'users', userId);

    if (isFollowing) {
        batch.delete(currentUserFollowingRef);
        batch.delete(targetUserFollowersRef);
        batch.update(currentUserRef, { followingCount: increment(-1) });
        batch.update(targetUserRef, { followerCount: increment(-1) });
        toast({ title: 'Unfollowed' });
    } else {
        batch.set(currentUserFollowingRef, { followedAt: new Date() });
        batch.set(targetUserFollowersRef, { followedAt: new Date() });
        batch.update(currentUserRef, { followingCount: increment(1) });
        batch.update(targetUserRef, { followerCount: increment(1) });
        toast({ title: 'Followed' });
    }

    await batch.commit();
    setIsFollowing(!isFollowing);

    const updatedUserDoc = await getDoc(doc(db, 'users', userId));
    if (updatedUserDoc.exists()) {
        setUserData(updatedUserDoc.data() as User);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!currentUser || currentUser.uid !== userId) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      const updatedUserData = cleanObject({ ...userData, ...data });
      await setDoc(userDocRef, updatedUserData, { merge: true });
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data() as User);
      }
      toast({ title: 'Success', description: 'Profile updated successfully.' });
      setIsEditing(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    }
  };

  const handleImageUpload = async (file: File, type: 'photo' | 'banner') => {
    if (!currentUser || currentUser.uid !== userId) return;
    // ... (rest of the image upload logic)
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (loadingProfile) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  if (!userData) {
    return <div className="container mx-auto max-w-7xl px-4 py-20 text-center">User not found.</div>;
  }

  const isOwnProfile = currentUser?.uid === userId;

  return (
    <div className="bg-background text-foreground">
      <SEO title={userData.nickname} description={userData.bio || `View the profile of ${userData.nickname}.`} />

      <div className="relative h-48 bg-muted group">
        <img src={userData.bannerUrl || 'https://via.placeholder.com/1500x500'} alt="Banner" className="w-full h-full object-cover" />
        {isOwnProfile && (
            <label htmlFor="banner-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-8 w-8 text-white" />
            <input id="banner-upload" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'banner')} />
          </label>
        )}
      </div>

      <div className="container mx-auto max-w-4xl px-4 pb-12 -mt-16">
        <div className="flex items-end mb-8">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={userData.photoUrl || undefined} alt={userData.nickname} />
              <AvatarFallback>{userData.nickname?.charAt(0)}</AvatarFallback>
            </Avatar>
            {isOwnProfile && (
                <label htmlFor="photo-upload" className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
                <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'photo')} />
              </label>
            )}
          </div>
          <div className="ml-4">
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{userData.nickname}</h1>
                <VerificationBadge verification={userData.verification} />
            </div>
            <p className="text-muted-foreground">{userData.email}</p>
            <div className="flex gap-4 mt-2">
                <p><span className="font-bold">{userData.followerCount || 0}</span> Followers</p>
                <p><span className="font-bold">{userData.followingCount || 0}</span> Following</p>
            </div>
          </div>
          <div className="ml-auto">
            {isOwnProfile ? (
                <Button variant="outline" size="icon" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4" />
                </Button>
            ) : currentUser ? (
                <Button onClick={handleFollowToggle}>
                {isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {isFollowing ? 'Following' : 'Follow'}
                </Button>
            ) : null}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ... (Edit form JSX from the old file) */}
          </form>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">Bio</h2>
              <p className="text-muted-foreground">{userData.bio || 'No bio yet.'}</p>
            </div>
            {/* ... (Social links and stats JSX) */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Favorites</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {favorites.map(fav => (
                  <Link key={fav.id} to={`/manhwa/${fav.slug}`}>
                    <div className="group">
                      <img src={fav.imageSrc} alt={fav.title} className="w-full h-auto object-cover rounded-md mb-2 transition-transform duration-300 group-hover:scale-105" />
                      <p className="text-sm font-semibold truncate">{fav.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {isOwnProfile && (
            <Button onClick={handleLogout} variant="destructive" className="gap-2 mt-8">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
            </Button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
