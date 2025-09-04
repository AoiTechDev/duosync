"use client";
import { ROLES } from "@/data/preferences";
import { TagButton } from "@/components/common/TagButton";
import type { Role } from "@/types/create-post-type";
import { useFieldError } from "@/context/FormErrorContext";

const SelectRole = ({
  role,
  onChange,
}: {
  role: Role | null;
  onChange: ({ id, name }: Role) => void;
}) => {
  const error = useFieldError("role");

  return (
    <div className="space-y-2">
      <label
        htmlFor="role"
        className="text-base font-semibold flex items-center gap-2"
      >
        What role you are looking for?
      </label>
      <div className="flex flex-wrap gap-2" id="role">
        {ROLES.map((r) => (
          <TagButton
            key={r.id}
            selected={r.id === role?.id}
            onClick={() => onChange({ id: r.id, name: r.name })}
            icon={r.icon}
            label={r.name}
          />
        ))}
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default SelectRole;
