import { useEffect, useRef, useState } from "react";

interface UseTypewriterOptions {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
}

export function useTypewriter({
  phrases,
  typingSpeed = 80,
  deletingSpeed = 50,
  pauseDuration = 2000,
  loop = true,
}: UseTypewriterOptions) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Guard against undefined or out-of-bounds phrase
    if (!phrases || phrases.length === 0 || phraseIndex >= phrases.length) {
      return;
    }

    const currentPhrase = phrases[phraseIndex];

    // Ensure currentPhrase is a valid string
    if (typeof currentPhrase !== "string") {
      return;
    }

    if (!isDeleting && displayedText === currentPhrase) {
      // Pause at complete phrase
      timeoutRef.current = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }

    if (isDeleting && displayedText === "") {
      // Move to next phrase
      setIsDeleting(false);
      setPhraseIndex((prev) => (loop ? (prev + 1) % phrases.length : prev + 1));
      return;
    }

    const speed = isDeleting ? deletingSpeed : typingSpeed;
    timeoutRef.current = setTimeout(() => {
      setDisplayedText((prev) => {
        if (isDeleting) {
          return currentPhrase.substring(0, prev.length - 1);
        } else {
          return currentPhrase.substring(0, prev.length + 1);
        }
      });
    }, speed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    displayedText,
    isDeleting,
    phraseIndex,
    phrases,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    loop,
  ]);

  return { displayedText, isDeleting };
}
