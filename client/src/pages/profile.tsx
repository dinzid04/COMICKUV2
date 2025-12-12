import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/seo';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { useLocation, Link, useRoute } from 'wouter';
import { Loader2, AlertCircle, LogOut, Save, Edit, Camera, Link as LinkIcon, Star, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, setDoc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Github, Instagram, Music, BookOpen, Library, Trophy, Crown } from 'lucide-react';
import VerificationBadge from '@/components/ui/verification-badge';
import { User } from '@shared/types';
import { calculateLevel, calculateProgress, getEarnedBadges, Badge } from '@/lib/gamification';
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

// Helper function to crop image to square (1:1)
const cropToSquare = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;

      ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob failed'));
        }
      }, file.type);
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { data: currentUserProfile, updateProfileCache, invalidateProfile } = useUserProfile();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/user/:uid");
  const targetUid = match ? params?.uid : user?.uid;
  const isOwnProfile = user && targetUid === user.uid;

  const [targetUserProfile, setTargetUserProfile] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Decide which data to display
  const displayProfile = isOwnProfile ? currentUserProfile : targetUserProfile;

  // Initialize form with current user data if viewing own profile
  useEffect(() => {
    if (isOwnProfile && currentUserProfile) {
      setValue('nickname', currentUserProfile.nickname);
      setValue('bio', currentUserProfile.bio);
      setValue('socialLinks', currentUserProfile.socialLinks);
    }
  }, [isOwnProfile, currentUserProfile, setValue]);

  // Fetch target user data if not own profile
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!targetUid) return;

      setLoading(true);
      try {
        if (isOwnProfile) {
           // Wait for hook to load
           if (currentUserProfile) setLoading(false);
        } else {
            const userDocRef = doc(db, 'users', targetUid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                setTargetUserProfile({ uid: targetUid, ...userSnap.data() } as User);
            } else {
                setTargetUserProfile(null);
            }
            setLoading(false);
        }

        // Fetch Favorites (allowed for both own and public now)
        const favoritesRef = collection(db, 'users', targetUid, 'favorites');
        const q = query(favoritesRef);
        const querySnapshot = await getDocs(q);
        const favs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFavorites(favs);

      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({ title: 'Error', description: 'Failed to load profile data.', variant: 'destructive' });
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetUid, isOwnProfile, currentUserProfile]);


  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !isOwnProfile) return;
    const userDocRef = doc(db, 'users', user.uid);
    const leaderboardDocRef = doc(db, 'leaderboard', user.uid);
    try {
      const updatedUserData = cleanObject({ ...currentUserProfile, ...data });

      // Optimistic Update
      updateProfileCache(updatedUserData);

      await setDoc(userDocRef, updatedUserData, { merge: true });

      const leaderboardData = cleanObject({
        uid: user.uid,
        nickname: updatedUserData.nickname,
        photoUrl: updatedUserData.photoUrl,
        chaptersRead: updatedUserData.chaptersRead || 0,
      });
      await setDoc(leaderboardDocRef, leaderboardData, { merge: true });

      // Re-validate to ensure consistency
      invalidateProfile();

      toast({ title: 'Success', description: 'Profile updated successfully.' });
      setIsEditing(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
      invalidateProfile(); // Revert on error
    }
  };

  const handleImageUpload = async (file: File, type: 'photo' | 'banner') => {
    if (!user || !currentUserProfile) return;

    let fileToUpload = file;

    // Automatic 1:1 crop for profile photos
    if (type === 'photo') {
      try {
        const croppedBlob = await cropToSquare(file);
        fileToUpload = new File([croppedBlob], file.name, { type: file.type });
        toast({ title: 'Cropped', description: 'Image automatically cropped to square.' });
      } catch (error) {
        console.error("Cropping failed, using original", error);
        // Fallback to original
      }
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const response = await fetch('https://swagger-nextjs-one.vercel.app/api/cdn/dinzid', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.status) {
        const imageUrl = result.data.url;
        const userDocRef = doc(db, 'users', user.uid);
        const leaderboardDocRef = doc(db, 'leaderboard', user.uid);
        const fieldToUpdate = cleanObject(type === 'photo' ? { photoUrl: imageUrl } : { bannerUrl: imageUrl });

        // Optimistic update
        updateProfileCache(fieldToUpdate);

        await setDoc(userDocRef, fieldToUpdate, { merge: true });
        if (type === 'photo') {
          await setDoc(leaderboardDocRef, cleanObject({ photoUrl: imageUrl }), { merge: true });
        }

        toast({ title: 'Success', description: `${type === 'photo' ? 'Profile picture' : 'Banner'} updated.` });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({ title: 'Error', description: `Failed to upload ${type}.`, variant: 'destructive' });
      invalidateProfile();
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleSendMessage = async () => {
      if (!user || !displayProfile) return;

      try {
          const participants = [user.uid, displayProfile.uid].sort();
          const chatId = participants.join('_');
          const chatRef = doc(db, 'private_chats', chatId);

          await setDoc(chatRef, {
            participants: participants,
            createdAt: serverTimestamp(),
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            unreadCounts: { [user.uid]: 0, [displayProfile.uid]: 0 }
          }, { merge: true });

          toast({ title: "Chat Started", description: "Navigating to messages..." });
          navigate('/messages');

      } catch (error) {
          console.error("Failed to start chat", error);
          toast({ title: "Error", description: "Failed to start chat" });
      }
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }

  if (!displayProfile) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
        <p className="text-muted-foreground">The user you are looking for does not exist.</p>
        <Button onClick={() => navigate('/')} className="mt-4">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <SEO title={displayProfile.nickname || "Profile"} description={`View ${displayProfile.nickname}'s profile.`} />

      {/* Banner */}
      <div className="relative h-48 bg-muted group">
        <img src={displayProfile.bannerUrl || 'https://via.placeholder.com/1500x500'} alt="Banner" className="w-full h-full object-cover" />
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
              <AvatarImage src={displayProfile.photoUrl || undefined} alt={displayProfile.nickname || 'User'} />
              <AvatarFallback>{displayProfile.nickname?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            {isOwnProfile && (
                <label htmlFor="photo-upload" className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
                <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'photo')} />
                </label>
            )}
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{displayProfile.nickname || 'User'}</h1>
              <VerificationBadge verification={displayProfile.verification} />
            </div>
            {isOwnProfile && <p className="text-muted-foreground">{user?.email}</p>}
          </div>

          <div className="flex gap-2">
            {!isOwnProfile && user && (
                <Button onClick={handleSendMessage} className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Message
                </Button>
            )}
            {isOwnProfile && (
                <Button variant="outline" size="icon" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4" />
                </Button>
            )}
          </div>
        </div>

        {isEditing && isOwnProfile ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium mb-1">Nickname</label>
              <Input id="nickname" {...register('nickname')} />
              {errors.nickname && <p className="text-destructive text-sm mt-1">{errors.nickname.message}</p>}
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
              <Textarea id="bio" {...register('bio')} />
              {errors.bio && <p className="text-destructive text-sm mt-1">{errors.bio.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium mb-1">WhatsApp</label>
                <Input id="whatsapp" {...register('socialLinks.whatsapp')} placeholder="https://wa.me/..." />
              </div>
              <div>
                <label htmlFor="github" className="block text-sm font-medium mb-1">GitHub</label>
                <Input id="github" {...register('socialLinks.github')} placeholder="https://github.com/..." />
              </div>
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium mb-1">Instagram</label>
                <Input id="instagram" {...register('socialLinks.instagram')} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label htmlFor="tiktok" className="block text-sm font-medium mb-1">TikTok</label>
                <Input id="tiktok" {...register('socialLinks.tiktok')} placeholder="https://tiktok.com/..." />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="other" className="block text-sm font-medium mb-1">Other Link</label>
                <Input id="other" {...register('socialLinks.other')} placeholder="https://..." />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </form>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">Bio</h2>
              <p className="text-muted-foreground">{displayProfile.bio || 'No bio yet.'}</p>
            </div>

            <div className="flex items-center space-x-4">
              {displayProfile.socialLinks?.whatsapp && <a href={displayProfile.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer"><MessageSquare /></a>}
              {displayProfile.socialLinks?.github && <a href={displayProfile.socialLinks.github} target="_blank" rel="noopener noreferrer"><Github /></a>}
              {displayProfile.socialLinks?.instagram && <a href={displayProfile.socialLinks.instagram} target="_blank" rel="noopener noreferrer"><Instagram /></a>}
              {displayProfile.socialLinks?.tiktok && <a href={displayProfile.socialLinks.tiktok} target="_blank" rel="noopener noreferrer"><Music /></a>}
              {displayProfile.socialLinks?.other && <a href={displayProfile.socialLinks.other} target="_blank" rel="noopener noreferrer"><LinkIcon /></a>}
            </div>

            {/* Gamification Stats */}
            <div className="space-y-4 bg-muted/50 p-6 rounded-xl border border-border">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                           Level {calculateLevel(displayProfile.xp || 0)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                           {displayProfile.xp || 0} XP Total
                        </p>
                    </div>
                    <Trophy className="text-yellow-500 h-8 w-8" />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress to Level {calculateLevel(displayProfile.xp || 0) + 1}</span>
                        <span>{Math.round(calculateProgress(displayProfile.xp || 0, calculateLevel(displayProfile.xp || 0)))}%</span>
                    </div>
                    <Progress value={calculateProgress(displayProfile.xp || 0, calculateLevel(displayProfile.xp || 0))} className="h-2" />
                </div>

                <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        Badges Earned
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {getEarnedBadges(displayProfile).map((badge) => {
                             // Dynamic icon rendering based on string name
                             const IconComponent = {
                                'BookOpen': BookOpen,
                                'Library': Library,
                                'Trophy': Trophy,
                                'Crown': Crown
                             }[badge.icon] || Trophy;

                             return (
                                <TooltipProvider key={badge.id}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                <IconComponent className="h-5 w-5" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-bold">{badge.name}</p>
                                            <p className="text-xs">{badge.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                             );
                        })}
                        {getEarnedBadges(displayProfile).length === 0 && (
                            <p className="text-xs text-muted-foreground italic">No badges earned yet. Keep reading!</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-muted p-4 rounded-lg">
                <BookOpen className="h-6 w-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{displayProfile.chaptersRead || 0}</p>
                <p className="text-sm text-muted-foreground">Chapters Read</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <Star className="h-6 w-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{favorites.length}</p>
                <p className="text-sm text-muted-foreground">Favorites</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Favorites</h2>
              {favorites.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {favorites.map(fav => (
                    <Link key={fav.id} href={`/manhwa/${fav.slug}`}>
                        <div className="group cursor-pointer">
                        <img src={fav.imageSrc} alt={fav.title} className="w-full h-auto object-cover rounded-md mb-2 transition-transform duration-300 group-hover:scale-105" />
                        <p className="text-sm font-semibold truncate">{fav.title}</p>
                        </div>
                    </Link>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No favorites yet.</p>
              )}
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
