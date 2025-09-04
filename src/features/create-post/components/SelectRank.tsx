"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import Image from "next/image";
import { Rank } from "@/types/create-post-type";
import { useFormStore } from "@/store/create-post-store";
import { useFieldError } from "@/context/FormErrorContext";
const ranks = [
  { value: "IRON", label: "Iron", image: "/ranks/IRON.png" },
  { value: "BRONZE", label: "Bronze", image: "/ranks/BRONZE.png" },
  { value: "SILVER", label: "Silver", image: "/ranks/SILVER.png" },
  { value: "GOLD", label: "Gold", image: "/ranks/GOLD.png" },
  { value: "PLATINUM", label: "Platinum", image: "/ranks/PLATINUM.png" },
  { value: "EMERALD", label: "Emerald", image: "/ranks/EMERALD.png" },
  { value: "DIAMOND", label: "Diamond", image: "/ranks/DIAMOND.png" },
  { value: "MASTER", label: "Master", image: "/ranks/MASTER.png" },
  {
    value: "GRANDMASTER",
    label: "Grandmaster",
    image: "/ranks/GRANDMASTER.png",
  },
  { value: "CHALLENGER", label: "Challenger", image: "/ranks/CHALLANGER.png" },
];

const SelectRank = ({
  rank,
  onChange,
}: {
  rank: Rank | null;
  onChange: (rank: Rank) => void;
}) => {
  const error = useFieldError("rank");
  return (
    <div className="space-y-2">
      <Label
        htmlFor="rank"
        className="text-base font-semibold flex items-center gap-2"
      >
        What rank you are looking for?
      </Label>
      <Select
        value={rank || undefined}
        onValueChange={(value) => onChange(value as Rank)}
      >
        <SelectTrigger className="h-12 text-base">
          <SelectValue placeholder="Select rank" />
        </SelectTrigger>
        <SelectContent>
          {ranks.map((rank) => (
            <SelectItem
              key={rank.value}
              value={rank.value}
              className="text-base"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={rank.image}
                  alt={rank.label}
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
                <span>{rank.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default SelectRank;
