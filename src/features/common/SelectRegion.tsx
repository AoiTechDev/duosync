"use client";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";
import { Select } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { Region } from "@/db/schema";
import { useFieldError } from "@/context/FormErrorContext";
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

const SelectRegion = ({
  region,
  onChange,
}: {
  region: Region | undefined | null;
  onChange: (region: Region) => void;
}) => {
  const error = useFieldError("region");
  return (
    <div className="space-y-2">
      <Label htmlFor="region" className="text-base font-semibold flex items-center gap-2">
        <Globe className="w-4 h-4" />
        Region
      </Label>
      <Select value={region ?? ""} onValueChange={(value) => onChange(value as Region)}>
        <SelectTrigger className="h-12 text-base">
          <SelectValue placeholder="Select your region" />
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
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default SelectRegion;
