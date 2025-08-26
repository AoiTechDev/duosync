"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboardingStore } from "@/store/onboarding-store";
import { User, Globe, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const regions = [
  { value: "NA1", label: "North America", flag: "🇺🇸" },
  { value: "EUW1", label: "Europe West", flag: "🇪🇺" },
  { value: "EUN1", label: "Europe Nordic & East", flag: "🇪🇺" },
  { value: "KR", label: "Korea", flag: "🇰🇷" },
  { value: "BR1", label: "Brazil", flag: "🇧🇷" },
  { value: "LA1", label: "Latin America North", flag: "🇲🇽" },
  { value: "LA2", label: "Latin America South", flag: "🇦🇷" },
  { value: "OC1", label: "Oceania", flag: "🇦🇺" },
  { value: "RU", label: "Russia", flag: "🇷🇺" },
  { value: "TR1", label: "Turkey", flag: "🇹🇷" },
  { value: "JP1", label: "Japan", flag: "🇯🇵" },
];

export default function BasicInfoStep() {
  const { data, updateData, nextStep } = useOnboardingStore();
  const [username, setUsername] = useState(data.username || "");
  const [region, setRegion] = useState(data.region || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setError("");
    setUsernameStatus("idle");
  };

  const checkUsername = async (username: string) => {
    if (username.length < 3) return;

    setUsernameStatus("checking");
    try {
      const response = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const result = await response.json();
      setUsernameStatus(result.available ? "available" : "taken");
    } catch (error) {
      setUsernameStatus("idle");
    }
  };

  const handleNext = async () => {
    setIsLoading(true);
    setError("");

    try {
      await checkUsername(username);

      if (usernameStatus === "taken") {
        setError("Username is already taken");
        setIsLoading(false);
        return;
      }

      updateData({ username, region });
      nextStep(); // Only use nextStep() for smooth navigation
    } catch (error) {
      setError("Failed to check username availability");
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = username.length >= 3 && region && usernameStatus !== "taken";

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="space-y-6">
        {/* Username Field */}
        <div className="space-y-3">
          <Label
            htmlFor="username"
            className="text-base font-semibold flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Username
          </Label>
          <div className="relative">
            <Input
              id="username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              onBlur={() => username.length >= 3 && checkUsername(username)}
              placeholder="Enter your unique username"
              className={`
                text-base h-12 pr-12 transition-all duration-200
                ${
                  error || usernameStatus === "taken"
                    ? "border-destructive focus:border-destructive"
                    : usernameStatus === "available"
                    ? "border-green-500 focus:border-green-500"
                    : "border-border focus:border-accent"
                }
              `}
            />

            {/* Status Icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameStatus === "checking" && (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              )}
              {usernameStatus === "available" && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
              {usernameStatus === "taken" && (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
            </div>
          </div>

          {/* Username Helper Text */}
          <div className="space-y-1">
            {error && (
              <p className="text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
            {usernameStatus === "available" && (
              <p className="text-green-500 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Username is available!
              </p>
            )}
            {!error && usernameStatus !== "available" && (
              <p className="text-muted-foreground text-sm">
                This will be visible to other players when looking for duo
                partners
              </p>
            )}
          </div>
        </div>

        {/* Region Field */}
        <div className="space-y-3">
          <Label
            htmlFor="region"
            className="text-base font-semibold flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Region
          </Label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Select your League of Legends region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r.value} value={r.value} className="text-base">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{r.flag}</span>
                    <span>{r.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-sm">
            Choose the region where you play League of Legends
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-4">
        <Button
          onClick={handleNext}
          disabled={!isValid || isLoading}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all cursor-pointer duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Checking username...
            </>
          ) : (
            "Continue to Riot Account"
          )}
        </Button>
      </div>
    </div>
  );
} 