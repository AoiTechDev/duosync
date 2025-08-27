"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useOnboardingStore } from "@/store/onboarding-store";

interface RankData {
  summonerName: string;
  gameName: string;
  tagLine: string;
  soloRank?: string;
  flexRank?: string;
  level: number;
}

export default function RiotAccountStep() {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();
  const [gameName, setGameName] = useState(data.gameName || "");
  const [tagLine, setTagLine] = useState(data.tagLine || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [rankData, setRankData] = useState<RankData | null>(null);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!gameName.trim() || !tagLine.trim()) return;

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/verify-summoner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameName: gameName.trim(),
          tagLine: tagLine.trim(),
          region: data.region,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVerificationStatus("success");
        setRankData(result.data);
        updateData({
          summonerName: result.data.summonerName,
          gameName: gameName.trim(),
          tagLine: tagLine.trim(),
          riotVerified: true,
          soloRank: result.data.soloRank,
          flexRank: result.data.flexRank,
        });
      } else {
        setVerificationStatus("error");
        setError(result.message || "Account not found");
      }
    } catch (error) {
      setVerificationStatus("error");
      setError("Failed to verify account");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNext = () => {
    if (verificationStatus === "success") {
      nextStep();
    }
  };

  const handleSkip = () => {
    updateData({
      summonerName: "",
      gameName: "",
      tagLine: "",
      riotVerified: false,
      soloRank: undefined,
      flexRank: undefined,
    });
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Connect Riot Account</h2>
        <p className="text-gray-600">
          Link your League of Legends account to verify your rank and stats
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="gameName">Riot ID</Label>
          <div className="flex gap-2 flex-col sm:flex-row">
            <Input
              id="gameName"
              value={gameName}
              onChange={(e) => {
                setGameName(e.target.value);
                setVerificationStatus("idle");
                setError("");
              }}
              placeholder="Game Name"
              className={error ? "border-red-500" : ""}
            />
            <div className="flex items-center gap-2">
              <div className="flex items-center text-lg font-bold text-gray-400">
                #
              </div>
              <Input
                id="tagLine"
                value={tagLine}
                onChange={(e) => {
                  setTagLine(e.target.value);
                  setVerificationStatus("idle");
                  setError("");
                }}
                placeholder="Tag"
                className={`min-w-[150px] ${error ? "border-red-500" : ""}`}
                maxLength={5}
              />
              <Button
                onClick={handleVerify}
                disabled={!gameName.trim() || !tagLine.trim() || isVerifying}
                variant="outline"
                className="min-w-[100px]"
              >
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          {!error && (
            <p className="text-gray-500 text-sm mt-1">
              Enter your Riot ID (e.g., GameName#TAG1). You can find this in
              your Riot Games account.
            </p>
          )}
        </div>

        {verificationStatus === "error" && (
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">
                  Verification Failed
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button
            onClick={handleNext}
            disabled={verificationStatus !== "success"}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
