"use client";
import { useState, useActionState, useEffect } from "react";

import SelectRole from "@/features/common/SelectRole";
import SelectRegion from "@/features/common/SelectRegion";
import SelectRank from "@/features/common/SelectRank";
import { editPost } from "@/app/(dashboard)/posts/actions";
import { CreatePostFormData } from "@/types/create-post-type";
import SubmitButton from "@/features/common/SubmitButton";
import { FormErrorProvider } from "@/context/FormErrorContext";
import Description from "@/features/common/Description";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormStore } from "@/store/create-post-store";
const EditForm = ({ postId }: { postId: string }) => {
  const { data } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetch(`/api/get-post/${postId}`).then((res) => res.json()),
  });
  const [customFormData, setCustomFormData] = useState<CreatePostFormData>(
    () => ({
      description: "",
      role: null,
      region: null,
      rank: null,
    })
  );

  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, formAction] = useActionState(editPost, undefined);
  const { setShouldOpenEditDialog } = useFormStore();

  useEffect(() => {
    if (data && data.rank) {
      setCustomFormData({
        description: data.description || "",
        role: data.role || null,
        region: data.region || null,
        rank: data.rank || null,
      });
    }
  }, [data]);

  useEffect(() => {
    if (state?.success) {
      if (typeof window !== "undefined") {
        const active = document.activeElement as HTMLElement | null;
        active?.blur();
      }
      setShouldOpenEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  }, [state?.success, queryClient, setShouldOpenEditDialog, router]);

  return (
    <FormErrorProvider errors={state?.errors}>
      <form action={formAction} className="space-y-4" key={data?.id}>
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
          key={`role-${data?.id || "new"}`}
          role={customFormData.role}
          onChange={(role) => {
            if (role) {
              setCustomFormData({ ...customFormData, role });
            }
          }}
        />
        <SelectRegion
          key={`region-${data?.id || "new"}`}
          region={customFormData.region}
          onChange={(region) => {
            if (region) {
              setCustomFormData({ ...customFormData, region: region });
            }
          }}
        />
        <SelectRank
          key={`rank-${data?.id || "new"}`}
          rank={customFormData.rank}
          onChange={(rank) => {
            if (rank) {
              setCustomFormData({ ...customFormData, rank: rank });
            }
          }}
        />

        <input
          type="hidden"
          name="description"
          aria-hidden
          value={customFormData.description || ""}
        />
        <input
          type="hidden"
          aria-hidden
          name="role"
          value={customFormData.role || ""}
        />
        <input
          aria-hidden
          type="hidden"
          name="region"
          value={customFormData.region || ""}
        />
        <input
          aria-hidden
          type="hidden"
          name="rank"
          value={customFormData.rank || ""}
        />
        {/* <input type="hidden" name="postId" value={postId} /> */}

        <SubmitButton />
        {state?.errors && (
          <p className="text-red-500">{state.errors.database}</p>
        )}
      </form>
    </FormErrorProvider>
  );
};

export default EditForm;
