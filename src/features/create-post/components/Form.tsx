"use client";
import { useState, useActionState, useEffect } from "react";

import SelectRole from "@/features/common/SelectRole";
import SelectRegion from "@/features/common/SelectRegion";
import SelectRank from "@/features/common/SelectRank";
import { createPost } from "@/app/(dashboard)/posts/actions";
import { User } from "@/db/schema";
import { CreatePostFormData } from "@/types/create-post-type";
import SubmitButton from "@/features/common/SubmitButton";
import { FormErrorProvider } from "@/context/FormErrorContext";
import Description from "@/features/common/Description";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFormStore } from "@/store/create-post-store";
const Form = ({ user }: { user: User }) => {
  const [customFormData, setCustomFormData] = useState<CreatePostFormData>({
    description: null,
    role: null,
    region: user.region,
    rank: null,
  });
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, formAction] = useActionState(createPost, undefined);
  const { setShouldOpenCreateDialog } = useFormStore();
  
  useEffect(() => {
    if (state?.success) {
      // Close dialog first to prevent UI flicker
      setShouldOpenCreateDialog(false);
      // Then invalidate queries to refresh the posts list
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      // router.push("/posts");
    }
  }, [state?.success, queryClient, setShouldOpenCreateDialog, router]);

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
          onChange={(role) => setCustomFormData({ ...customFormData, role })}
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

        <input type="hidden" name="role" value={customFormData.role || ""} />
        <input
          type="hidden"
          name="region"
          value={customFormData.region || ""}
        />
        <input type="hidden" name="rank" value={customFormData.rank || ""} />

        <SubmitButton />
        {state?.errors && (
          <p className="text-red-500">{state.errors.database}</p>
        )}
      </form>
    </FormErrorProvider>
  );
};

export default Form;
