import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export function SEO({ title, description, image, url }: SEOProps) {
  useEffect(() => {
    // Update title
    document.title = `${title} | COMIC KU`;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute("content", content);
    };

    // Standard meta tags
    updateMetaTag("description", description);

    // Open Graph tags
    updateMetaTag("og:title", `${title} | COMIC KU`, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", "website", true);
    
    if (image) {
      updateMetaTag("og:image", image, true);
    }
    
    if (url) {
      updateMetaTag("og:url", url, true);
    }

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", `${title} | COMIC KU`);
    updateMetaTag("twitter:description", description);
    
    if (image) {
      updateMetaTag("twitter:image", image);
    }
  }, [title, description, image, url]);

  return null;
}
