import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { auth } from '@/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  getAdditionalUserInfo,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FaGoogle, FaGithub, FaEnvelope } from "react-icons/fa";
import { Turnstile } from '@marsidev/react-turnstile';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  React.useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let emailForSignIn = window.localStorage.getItem('emailForSignIn');

        if (!emailForSignIn) {
          emailForSignIn = window.prompt('Please provide your email for confirmation');
        }

        if (emailForSignIn) {
          try {
            const result = await signInWithEmailLink(auth, emailForSignIn, window.location.href);
            window.localStorage.removeItem('emailForSignIn');

            const user = result.user;
            const additionalInfo = getAdditionalUserInfo(result);

            if (additionalInfo?.isNewUser) {
              const userDocRef = doc(db, "users", user.uid);
              const leaderboardDocRef = doc(db, "leaderboard", user.uid);

              const newUser = {
                uid: user.uid,
                email: user.email!,
                nickname: user.displayName || 'New User',
                photoUrl: user.photoURL || '',
                chaptersRead: 0
              };

              await setDoc(userDocRef, newUser);
              await setDoc(leaderboardDocRef, {
                uid: user.uid,
                nickname: newUser.nickname,
                photoUrl: newUser.photoUrl,
                chaptersRead: 0
              });
            }

            toast({ title: 'Success', description: 'Signed in successfully with email link!' });
            setLocation('/');
          } catch (error: any) {
             toast({ title: 'Error', description: error.message, variant: 'destructive' });
             // Some error occurred, you can inspect the code: error.code
             // Common errors could be invalid email and invalid or expired OTPs.
          }
        }
      }
    };

    handleEmailLinkSignIn();
  }, [setLocation, toast]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCaptchaVerified) {
        toast({ title: "Error", description: "Please complete the captcha verification.", variant: "destructive" });
        return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({ title: 'Success', description: 'Account created successfully!' });
      setLocation('/');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleOAuthSignIn = async (provider: GoogleAuthProvider | GithubAuthProvider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);

      if (additionalInfo?.isNewUser) {
        const userDocRef = doc(db, "users", user.uid);
        const leaderboardDocRef = doc(db, "leaderboard", user.uid);

        const newUser = {
          uid: user.uid,
          email: user.email!,
          nickname: user.displayName || 'New User',
          photoUrl: user.photoURL || '',
          chaptersRead: 0
        };

        await setDoc(userDocRef, newUser);
        await setDoc(leaderboardDocRef, {
          uid: user.uid,
          nickname: newUser.nickname,
          photoUrl: newUser.photoUrl,
          chaptersRead: 0
        });
      }

      toast({ title: 'Success', description: 'Signed in successfully!' });
      setLocation('/');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Success', description: 'Signed in successfully!' });
      setLocation('/');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="flex flex-col items-center">
        <img src="/images/header-logo.png" alt="COMIC KU" className="h-16 mb-8" />
        <Tabs defaultValue="signin" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card>
              <form onSubmit={handleSignIn}>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Welcome back! Sign in to access your favorites and history.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full">Sign In</Button>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn(new GoogleAuthProvider())}><FaGoogle className="mr-2 h-4 w-4" /> Google</Button>
                  <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn(new GithubAuthProvider())}><FaGithub className="mr-2 h-4 w-4" /> GitHub</Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <form onSubmit={handleSignUp}>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create an account to save your reading history and favorites.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="flex justify-center w-full min-h-[65px]">
                    <Turnstile
                        siteKey="0x4AAAAAACFfejFFljemif4u"
                        onSuccess={() => setIsCaptchaVerified(true)}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={!isCaptchaVerified}>
                    Sign Up
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn(new GoogleAuthProvider())}><FaGoogle className="mr-2 h-4 w-4" /> Google</Button>
                  <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn(new GithubAuthProvider())}><FaGithub className="mr-2 h-4 w-4" /> GitHub</Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
};

export default AuthPage;
