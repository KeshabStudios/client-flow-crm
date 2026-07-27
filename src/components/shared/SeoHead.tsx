import { useEffect } from "react";

interface SeoHeadProps {
  title: string;
  description?: string;
}

const APP_NAME = "ClientFlow CRM";

export function SeoHead({ title, description }: SeoHeadProps) {
  useEffect(() => {
    document.title = `${title} | ${APP_NAME}`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (description && metaDesc) {
      metaDesc.setAttribute("content", description);
    }
  }, [title, description]);

  return null;
}
