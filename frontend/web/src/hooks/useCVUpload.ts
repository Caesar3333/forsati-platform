// © 2026 Forsati. All rights reserved.
"use client";

/**
 * useCVUpload Hook
 * Hook for CV upload with polling, consent management, and status tracking
 *
 * هوك لرفع السيرة الذاتية مع الاستعلام الدوري وإدارة الموافقة وتتبع الحالة
 */

import { useState, useCallback, useRef, useEffect } from "react";

// Types
export interface UploadOptions {
  mode: "parse" | "analyze";
  context?: string;
  consentToAI: boolean;
  redactPII?: boolean;
}

export interface ParsedResume {
  id: string;
  filename: string;
  file_url?: string;
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: Array<{
    title?: string;
    company?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  }>;
  education: Array<{
    degree?: string;
    institution?: string;
    year?: string;
    field?: string;
  }>;
  total_experience_years?: number;
  language?: string;
  raw_text?: string;
}

export interface JobStatus {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  parsedId?: string;
  error?: string;
}

export interface AIAnalysis {
  analysisId: string;
  score: number;
  breakdown: {
    skills_match?: number;
    experience_relevance?: number;
    education_fit?: number;
    overall_quality?: number;
  };
  suggestions: string[];
  keywords: string[];
}

export interface UseCVUploadReturn {
  // State
  isUploading: boolean;
  isPolling: boolean;
  isParsing: boolean;
  isAnalyzing: boolean;
  progress: number;
  status: JobStatus["status"] | null;
  parsedResume: ParsedResume | null;
  analysis: AIAnalysis | null;
  error: string | null;

  // Actions
  upload: (file: File, options: UploadOptions) => Promise<void>;
  checkStatus: (jobId: string) => Promise<JobStatus>;
  getParsedResume: (parsedId: string) => Promise<ParsedResume>;
  analyzeResume: (parsedId: string) => Promise<AIAnalysis>;
  reset: () => void;
  cancel: () => void;
}

// Constants
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_ATTEMPTS = 60; // 2 minutes max
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function useCVUpload(): UseCVUploadReturn {
  // State
  const [isUploading, setIsUploading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<JobStatus["status"] | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollAttemptsRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setIsUploading(false);
    setIsPolling(false);
    setIsParsing(false);
    setIsAnalyzing(false);
    setProgress(0);
    setStatus(null);
    setParsedResume(null);
    setAnalysis(null);
    setError(null);
    pollAttemptsRef.current = 0;

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  /**
   * Cancel ongoing operations
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsUploading(false);
    setIsPolling(false);
    setIsParsing(false);
    setIsAnalyzing(false);
  }, []);

  /**
   * Check job status
   */
  const checkStatus = useCallback(async (jobId: string): Promise<JobStatus> => {
    const response = await fetch(`${API_BASE}/api/ingest/status/${jobId}`, {
      signal: abortControllerRef.current?.signal,
    });

    if (!response.ok) {
      throw new Error("Failed to check status");
    }

    const data = await response.json();
    return {
      jobId: data.job_id,
      status: data.status,
      progress: data.progress,
      parsedId: data.result?.id,
      error: data.error,
    };
  }, []);

  /**
   * Get parsed resume data
   */
  const getParsedResume = useCallback(
    async (parsedId: string): Promise<ParsedResume> => {
      const response = await fetch(
        `${API_BASE}/api/resume-records/${parsedId}`,
        {
          signal: abortControllerRef.current?.signal,
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch parsed resume");
      }

      const data = await response.json();
      return data.data || data;
    },
    [],
  );

  /**
   * Analyze resume with AI (requires consent)
   */
  const analyzeResume = useCallback(
    async (parsedId: string): Promise<AIAnalysis> => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE}/api/ingest/analyze/${parsedId}`,
          {
            method: "POST",
            signal: abortControllerRef.current?.signal,
            credentials: "include",
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Authentication required for AI analysis");
          }
          if (response.status === 403) {
            throw new Error("Consent required for AI analysis");
          }
          throw new Error("Failed to analyze resume");
        }

        const data = await response.json();
        const analysisResult: AIAnalysis = {
          analysisId: data.parsed_id,
          score: data.score || 0,
          breakdown: data.analysis || {},
          suggestions: data.recommendations || [],
          keywords: data.keywords || [],
        };

        setAnalysis(analysisResult);
        return analysisResult;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Analysis failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [],
  );

  /**
   * Start polling for job status
   */
  const startPolling = useCallback(
    (jobId: string, consentToAI: boolean) => {
      setIsPolling(true);
      pollAttemptsRef.current = 0;

      const poll = async () => {
        try {
          pollAttemptsRef.current += 1;

          if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
            throw new Error("Processing timeout - please try again");
          }

          const jobStatus = await checkStatus(jobId);
          setStatus(jobStatus.status);
          setProgress(jobStatus.progress);

          if (jobStatus.status === "completed" && jobStatus.parsedId) {
            // Stop polling
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setIsPolling(false);
            setIsParsing(true);

            // Fetch parsed resume
            const parsed = await getParsedResume(jobStatus.parsedId);
            setParsedResume(parsed);
            setIsParsing(false);

            // Auto-analyze if consent was given
            if (consentToAI) {
              await analyzeResume(jobStatus.parsedId);
            }
          } else if (jobStatus.status === "failed") {
            throw new Error(jobStatus.error || "Processing failed");
          }
        } catch (err) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setIsPolling(false);
          setIsParsing(false);
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          setError(errorMessage);
        }
      };

      // Initial check
      poll();

      // Start interval
      pollIntervalRef.current = setInterval(poll, POLL_INTERVAL);
    },
    [checkStatus, getParsedResume, analyzeResume],
  );

  /**
   * Upload CV file
   */
  const upload = useCallback(
    async (file: File, options: UploadOptions) => {
      // Reset state
      reset();

      // Create abort controller
      abortControllerRef.current = new AbortController();

      // Validate file
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file format. Please upload PDF, DOCX, DOC, or TXT.");
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError("File too large. Maximum size is 10MB.");
        return;
      }

      setIsUploading(true);
      setStatus("pending");
      setError(null);

      try {
        // Prepare form data
        const formData = new FormData();
        formData.append("file", file);

        // Upload file
        const response = await fetch(`${API_BASE}/api/ingest/upload`, {
          method: "POST",
          body: formData,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message_en ||
              errorData.detail?.message_en ||
              "Upload failed",
          );
        }

        const data = await response.json();
        setIsUploading(false);
        setProgress(10);

        // Check if already completed (synchronous processing)
        if (data.data && data.success) {
          setStatus("completed");
          setProgress(100);
          setParsedResume(data.data);

          // Auto-analyze if consent was given
          if (options.consentToAI && data.data.id) {
            await analyzeResume(data.data.id);
          }
        } else if (data.job_id) {
          // Start polling for async processing
          startPolling(data.job_id, options.consentToAI);
        }
      } catch (err) {
        setIsUploading(false);

        if (err instanceof Error && err.name === "AbortError") {
          setError("Upload cancelled");
        } else {
          const errorMessage =
            err instanceof Error ? err.message : "Upload failed";
          setError(errorMessage);
        }
      }
    },
    [reset, startPolling, analyzeResume],
  );

  return {
    // State
    isUploading,
    isPolling,
    isParsing,
    isAnalyzing,
    progress,
    status,
    parsedResume,
    analysis,
    error,

    // Actions
    upload,
    checkStatus,
    getParsedResume,
    analyzeResume,
    reset,
    cancel,
  };
}

export default useCVUpload;
