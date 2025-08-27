import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { Swords, Users, Mic2 } from "lucide-react";

const LoginPage = () => {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Brand / Visual panel */}
      <div className="relative hidden md:flex items-center justify-center bg-background p-8 overflow-hidden">
        {/* Subtle gradient orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 w-full max-w-md space-y-6 text-center">
          <div className="w-full">
            <Image
              src="/logo.jpeg"
              alt="DuoSync Logo"
              width={800}
              height={800}
              className="w-full h-auto rounded-lg object-contain shadow"
              priority
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight">
              Queue smarter. Find your perfect duo.
            </h2>
            <p className="text-muted-foreground">
              Match by rank, role, and playstyle. Duo up for ranked, normals, or
              clash without the solo-queue tilt.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-left">
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2 text-sm">
                <Swords className="h-4 w-4 text-violet-500" />
                <span className="font-medium">Role synergy</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Line + champion preferences
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-indigo-500" />
                <span className="font-medium">Rank filters</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                From Iron to Challenger
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2 text-sm">
                <Mic2 className="h-4 w-4 text-fuchsia-500" />
                <span className="font-medium">Voice-ready</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Discord-native matching
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Login panel */}
      <div className="relative flex items-center justify-center p-6">
        {/* Header */}

        <Card className="w-full max-w-md backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in with your preferred provider to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <AuthButtons />
              
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
