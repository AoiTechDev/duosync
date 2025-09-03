"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";
import {
  ROLES,
  GOALS,
  PLAYSTYLE_TAGS,
  COMMUNICATION_PREFERENCES,
} from "@/data/preferences";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import { TagButton } from "@/components/common/TagButton";

interface PreferencesState {
  mainRole: string;
  secondaryRole: string;
  goals: string[];
  playstyleTags: string[];
  communication: string[];
}

export default function PreferencesStep() {
  const { data, updateData, prevStep, completeOnboarding } =
    useOnboardingStore();
  const [preferences, setPreferences] = useState<PreferencesState>({
    mainRole: data.mainRole || "",
    secondaryRole: data.secondaryRole || "",
    goals: data.goals || [],
    playstyleTags: data.playstyleTags || [],
    communication: data.communication || [],
  });
  const [errors, setErrors] = useState<string[]>([]);

  const updatePreference = <K extends keyof PreferencesState>(
    key: K,
    value: PreferencesState[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayPreference = <K extends keyof PreferencesState>(
    key: K,
    value: string
  ) => {
    const currentArray = preferences[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updatePreference(key, newArray as PreferencesState[K]);
  };

  const validatePreferences = (): boolean => {
    const newErrors: string[] = [];

    if (!preferences.mainRole) {
      newErrors.push("Please select a primary role");
    }
    if (preferences.goals.length === 0) {
      newErrors.push("Please select at least one goal");
    }
    if (preferences.communication.length === 0) {
      newErrors.push("Please select at least one communication preference");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleContinue = async () => {
    if (validatePreferences()) {
      updateData(preferences);
      await completeOnboarding();
    }
  };

  const isValid =
    preferences.mainRole &&
    preferences.goals.length > 0 &&
    preferences.communication.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Game Preferences</h2>
        <p className="text-gray-600">
          Select your preferences to find the perfect duo partner
        </p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium text-red-900 mb-1">
                Please complete the following:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Primary Role - Required */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Primary Role
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
            Required
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <TagButton
              key={role.id}
              selected={preferences.mainRole === role.id}
              onClick={() => updatePreference("mainRole", role.id)}
              icon={role.icon}
              label={role.name}
            />
          ))}
        </div>
      </div>

      {/* Goals - Required */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Goals
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
            Required
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((goal) => (
            <TagButton
              key={goal.id}
              selected={preferences.goals.includes(goal.id)}
              onClick={() => toggleArrayPreference("goals", goal.id)}
              label={goal.name}
            />
          ))}
        </div>
      </div>

      {/* Communication - Required */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Communication
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
            Required
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {COMMUNICATION_PREFERENCES.map((pref) => (
            <TagButton
              key={pref.id}
              selected={preferences.communication.includes(pref.id)}
              onClick={() => toggleArrayPreference("communication", pref.id)}
              label={pref.name}
            />
          ))}
        </div>
      </div>

      {/* Secondary Role - Optional */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Secondary Role</h3>
        <div className="flex flex-wrap gap-2">
          <TagButton
            selected={preferences.secondaryRole === ""}
            onClick={() => updatePreference("secondaryRole", "")}
            label="No preference"
          />
          {ROLES.filter((role) => role.id !== preferences.mainRole).map(
            (role) => (
              <TagButton
                key={role.id}
                selected={preferences.secondaryRole === role.id}
                onClick={() => updatePreference("secondaryRole", role.id)}
                icon={role.icon}
                label={role.name}
              />
            )
          )}
        </div>
      </div>

      {/* Playstyle Tags - Optional */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">
          Playstyle Tags
          {preferences.playstyleTags.length > 0 && (
            <span className="text-sm text-gray-600 font-normal ml-2">
              ({preferences.playstyleTags.length} selected)
            </span>
          )}
        </h3>
        <div className="flex flex-wrap gap-2">
          {PLAYSTYLE_TAGS.map((tag) => {
            const isSelected = preferences.playstyleTags.includes(tag.id);
            const isDisabled =
              !isSelected && preferences.playstyleTags.length >= 8;

            return (
              <TagButton
                key={tag.id}
                selected={isSelected}
                disabled={isDisabled}
                onClick={() =>
                  !isDisabled && toggleArrayPreference("playstyleTags", tag.id)
                }
                label={tag.name}
              />
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={prevStep} className="px-6">
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!isValid}
          className="px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );
}
