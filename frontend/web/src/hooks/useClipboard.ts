// © 2026 Forsati. All rights reserved.
// Clipboard hook with toast feedback

"use client";

import { useCallback, useState } from "react";
import { useToast } from "./useToast";

interface UseClipboardOptions {
  timeout?: number;
  successMessage?: string;
  errorMessage?: string;
}

interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  error: Error | null;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const {
    timeout = 2000,
    successMessage = "Copied to clipboard",
    errorMessage = "Failed to copy",
  } = options;

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { success, error: showError } = useToast();

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        const err = new Error("Clipboard not supported");
        setError(err);
        showError(errorMessage);
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(null);
        success(successMessage);

        // Reset copied state after timeout
        setTimeout(() => {
          setCopied(false);
        }, timeout);

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Copy failed");
        setError(error);
        setCopied(false);
        showError(errorMessage);
        return false;
      }
    },
    [timeout, successMessage, errorMessage, success, showError]
  );

  return { copy, copied, error };
}

/**
 * Copy job link with preview toast
 */
export function useCopyJobLink() {
  const { success } = useToast();
  const { copy } = useClipboard({ successMessage: "" }); // We'll show custom toast

  const copyJobLink = useCallback(
    async (job: {
      id: string;
      title: string;
      company?: string;
      canonical?: string;
    }) => {
      const url = job.canonical || `${window.location.origin}/jobs/${job.id}`;
      const copied = await copy(url);

      if (copied) {
        success("Link copied!", {
          message: job.title + (job.company ? ` - ${job.company}` : ""),
          actions: [
            {
              label: "Share",
              onClick: () => {
                if (navigator.share) {
                  navigator.share({
                    title: job.title,
                    url,
                  });
                }
              },
            },
          ],
        });
      }

      return copied;
    },
    [copy, success]
  );

  return { copyJobLink };
}

export default useClipboard;
