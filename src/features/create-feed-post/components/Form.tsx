"use client";
import { useState, useActionState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import SelectRole from "./SelectRole";
import SelectRegion from "./SelectRegion";
import SelectRank from "./SelectRank";
import { createFeedPost } from "@/app/(dashboard)/feed/actions";
import { User } from "@/db/schema";
import { CreatePostFormData } from "@/types/create-feed-post";
import SubmitButton from "./SubmitButton";
import { FormErrorProvider } from "@/context/FormErrorContext";
import Description from "./Description";

const Form = ({
  user,
  setShouldOpenDialog,
}: {
  user: User;
  setShouldOpenDialog: (shouldOpenDialog: boolean) => void;
}) => {
  const [customFormData, setCustomFormData] = useState<CreatePostFormData>({
    description: null,
    role: null,
    region: user.region,
    rank: null,
  });

  const [state, formAction] = useActionState(createFeedPost, undefined);

  useEffect(() => {
    if (state?.success) {
      setShouldOpenDialog(false);
    }
  }, [state?.success]);

  return (
    <FormErrorProvider errors={state?.errors}>
      <form action={formAction} className="space-y-4">
        <Description
          description={customFormData.description || ""}
          onChange={(e) =>
            setCustomFormData({
              ...customFormData,
              description: e.target.value,
            })
          }
        />
        <SelectRole
          role={customFormData.role}
          onChange={(role) =>
            setCustomFormData({ ...customFormData, role: role })
          }
        />
        <SelectRegion
          region={customFormData.region}
          onChange={(region) =>
            setCustomFormData({ ...customFormData, region: region })
          }
        />
        <SelectRank
          rank={customFormData.rank}
          onChange={(rank) =>
            setCustomFormData({ ...customFormData, rank: rank })
          }
        />

        {/* Hidden inputs to capture form data */}
        <input
          type="hidden"
          name="role"
          value={JSON.stringify(customFormData.role)}
        />
        <input
          type="hidden"
          name="region"
          value={customFormData.region || ""}
        />
        <input type="hidden" name="rank" value={customFormData.rank || ""} />

        <SubmitButton />
        {state?.errors && (
          <p className="text-red-500">{state.errors.database[0]}</p>
        )}
      </form>
    </FormErrorProvider>
  );
};

export default Form;
