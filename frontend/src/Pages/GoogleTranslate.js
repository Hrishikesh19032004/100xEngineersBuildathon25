import React, { useEffect, useState } from "react";
import { FaGlobe } from "react-icons/fa"; // optional icon

function GoogleTranslate() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized || window.google?.translate?.TranslateElement) return;

    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () => {
      console.error("Google Translate script failed to load");
    };

    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,ta,te,ml,bn,mr,gu,pa,kn",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
        setIsInitialized(true);
      } catch (err) {
        console.error("Google Translate init failed:", err);
      }
    };

    document.body.appendChild(script);
  }, [isInitialized]);

  return (
    <div className="flex items-center gap-2">
      <FaGlobe className="text-blue-600 dark:text-blue-400" />
      <div
        id="google_translate_element"
        className="text-sm text-gray-700 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1 shadow-sm hover:shadow-md transition-all duration-200"
      ></div>
    </div>
  );
}

export default GoogleTranslate;
