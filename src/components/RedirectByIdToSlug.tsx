import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "./LoadingSpinner";

interface RedirectByIdToSlugProps {
  basePath: string;
}

const RedirectByIdToSlug = ({ basePath }: RedirectByIdToSlugProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToSlug = async () => {
      if (!id) {
        navigate("/", { replace: true });
        return;
      }

      // Check if it's a UUID format (old ID-based URL)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(id)) {
        // Fetch the post by ID to get the slug
        const { data: post } = await supabase
          .from("posts")
          .select("slug")
          .eq("id", id)
          .maybeSingle();

        if (post?.slug) {
          navigate(`${basePath}/${post.slug}`, { replace: true });
          return;
        }
      }

      // If not a UUID or post not found, redirect to home
      navigate("/", { replace: true });
    };

    redirectToSlug();
  }, [id, navigate, basePath]);

  return <LoadingSpinner />;
};

export default RedirectByIdToSlug;
