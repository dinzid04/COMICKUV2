import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/seo';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { useLocation, Link, useRoute } from 'wouter';
import { Loader2, AlertCircle, LogOut, Save, Edit, Camera, Link as LinkIcon, BookOpen, Star, UserPlus, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, setDoc, getDoc, collection, getDocs, query, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { User, MyFavorite } from 'shared/types';
import { MessageSquare, Github, Instagram, Music } from 'lucide-react';
import VerificationBadge from '@/components/ui/verification-badge';
import { getUserProfile, followUser, unfollowUser } from '@/lib/api';

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

// Helper function to remove undefined values from an object
const  cleanObject = (obj: any) => {
  const newObj: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};

const ProfilePage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/profile/:userId");
  const userId = params?.userId || currentUser?.uid;

  const [userData, setUserData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [favorites, setFavorites] = useState<MyFavorite[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  const isOwnProfile = !params?.userId || params?.userId === currentUser?.uid;

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      try {
        const profileData = await getUserProfile(userId);
        setUserData(profileData);
        setFavorites(profileData.favorites || []);
        if (isOwnProfile) {
          setValue('nickname', profileData.nickname);
          setValue('bio', profileData.bio);
          setValue('socialLinks', profileData.socialLinks);
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch user profile.', variant: 'destructive' });
      }
    };

    fetchProfileData();

    // Check if current user is following this profile
    if (currentUser && !isOwnProfile) {
      const followingRef = doc(db, 'users', currentUser.uid, 'following', userId);
      const unsubscribe = onSnapshot(followingRef, (doc) => {
        setIsFollowing(doc.exists());
      });
      return () => unsubscribe();
    }
  }, [userId, isOwnProfile, currentUser, setValue, toast]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!currentUser || !isOwnProfile) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const leaderboardDocRef = doc(db, 'leaderboard', currentUser.uid);
    try {
      const updatedUserData = cleanObject({ ...userData, ...data });
      await setDoc(userDocRef, updatedUserData, { merge: true });

      const leaderboardData = cleanObject({
        uid: currentUser.uid,
        nickname: updatedUserData.nickname,
        photoUrl: updatedUserData.photoUrl,
        chaptersRead: updatedUserData.chaptersRead || 0,
      });
      await setDoc(leaderboardDocRef, leaderboardData, { merge: true });

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
    if (!currentUser || !isOwnProfile) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://swagger-nextjs-one.vercel.app/api/cdn/dinzid', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.status) {
        const imageUrl = result.data.url;
        const userDocRef = doc(db, 'users', currentUser.uid);
        const leaderboardDocRef = doc(db, 'leaderboard', currentUser.uid);
        const fieldToUpdate = cleanObject(type === 'photo' ? { photoUrl: imageUrl } : { bannerUrl: imageUrl });
        await setDoc(userDocRef, fieldToUpdate, { merge: true });
        if (type === 'photo') {
          await setDoc(leaderboardDocRef, cleanObject({ photoUrl: imageUrl }), { merge: true });
        }
        setUserData(prev => ({ ...prev!, ...fieldToUpdate }));
        toast({ title: 'Success', description: `${type === 'photo' ? 'Profile picture' : 'Banner'} updated.` });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({ title: 'Error', description: `Failed to upload ${type}.`, variant: 'destructive' });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !userId || isOwnProfile) return;

    setIsLoadingFollow(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId, currentUser.uid);
        toast({ title: 'Unfollowed', description: `You have unfollowed ${userData?.nickname}.` });
      } else {
        await followUser(userId, currentUser.uid);
        toast({ title: 'Followed', description: `You are now following ${userData?.nickname}.` });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred.', variant: 'destructive' });
    } finally {
      setIsLoadingFollow(false);
    }
  };

  if (!userId) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You must be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <SEO title={userData?.nickname || 'User Profile'} description={`View the profile of ${userData?.nickname}.`} />

      {/* Banner */}
      <div className="relative h-48 bg-muted group">
        <img src={userData?.bannerUrl || 'https://via.placeholder.com/1500x500'} alt="Banner" className="w-full h-full object-cover" />
        {isOwnProfile && (
          <label htmlFor="banner-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-8 w-8 text-white" />
            <input id="banner-upload" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'banner')} />
          </label>
        )}
      </div>

      <div className="container mx-auto max-w-4xl px-4 pb-12 -mt-16">
        <div className="flex items-end mb-8">
          {/* Profile Picture */}
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={userData?.photoUrl || undefined} alt={userData?.nickname || 'User'} />
              <AvatarFallback>{userData?.nickname?.charAt(0) || userData?.email?.charAt(0)}</AvatarFallback>
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
              <h1 className="text-3xl font-bold">{userData?.nickname || 'User'}</h1>
              <VerificationBadge verification={userData?.verification} />
            </div>
            <p className="text-muted-foreground">{userData?.email}</p>
          </div>
          {isOwnProfile ? (
            <Button variant="outline" size="icon" className="ml-auto" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant={isFollowing ? 'secondary' : 'default'} className="ml-auto gap-2" onClick={handleFollowToggle} disabled={isLoadingFollow}>
              {isLoadingFollow ? <Loader2 className="h-4 w-4 animate-spin" /> : (isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />)}
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        {isEditing && isOwnProfile ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Form fields remain the same */}
          </form>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">Bio</h2>
              <p className="text-muted-foreground">{userData?.bio || 'No bio yet.'}</p>
            </div>

            <div className="flex items-center space-x-4">
              {userData?.socialLinks?.whatsapp && <a href={userData.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer"><MessageSquare /></a>}
              {userData?.socialLinks?.github && <a href={userData.socialLinks.github} target="_blank" rel="noopener noreferrer"><Github /></a>}
              {userData?.socialLinks?.instagram && <a href={userData.socialLinks.instagram} target="_blank" rel="noopener noreferrer"><Instagram /></a>}
              {userData?.socialLinks?.tiktok && <a href={userData.socialLinks.tiktok} target="_blank" rel="noopener noreferrer"><Music /></a>}
              {userData?.socialLinks?.other && <a href={userData.socialLinks.other} target="_blank" rel="noopener noreferrer"><LinkIcon /></a>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-muted p-4 rounded-lg">
                <BookOpen className="h-6 w-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{userData?.chaptersRead || 0}</p>
                <p className="text-sm text-muted-foreground">Chapters Read</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <Star className="h-6 w-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{favorites.length}</p>
                <p className="text-sm text-muted-foreground">Favorites</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-2xl font-bold">{userData?.followersCount || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-2xl font-bold">{userData?.followingCount || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Favorites</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {favorites.map(fav => (
                  <Link key={fav.comicSlug} to={`/manhwa/${fav.comicSlug}`}>
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
