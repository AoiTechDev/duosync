import { Textarea } from "@/components/ui/textarea";
import { useFieldError } from "@/context/FormErrorContext";
import React from "react";

const Description = ({
  description,
  onChange,
}: {
  description: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => {
  const error = useFieldError("description");
  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Who you are looking for?"
        name="description"
        value={description || ""}
        onChange={(e) => onChange(e)}
      />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default Description;
