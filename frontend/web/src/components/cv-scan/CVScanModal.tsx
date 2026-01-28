// © 2026 Forsati. All rights reserved.
"use client";

import * as React from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Mic,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Camera,
  Download,
  Save,
  Send,
  FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalTrigger,
} from "@/components/ui/Modal";
import { ConsentCheckbox } from "./ConsentCheckbox";
import { ParsedResumePreview, ParsedResumeData } from "./ParsedResumePreview";
import { useCVUpload } from "@/hooks/useCVUpload";

interface CVScanModalProps {
  locale: "ar" | "en";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: {
    file?: File;
    audioUrl?: string;
    parsedData?: ParsedResumeData;
    consentToAI?: boolean;
  }) => void;
  onQuickApply?: (parsedData: ParsedResumeData) => void;
  children?: React.ReactNode;
}

type UploadStatus =
  | "idle"
  | "uploading"
  | "parsing"
  | "parsed"
  | "analyzing"
  | "success"
  | "error";
type ViewMode = "upload" | "preview" | "analysis";

const translations = {
  ar: {
    title: "افحص سيرتك الذاتية",
    description: "حمّل سيرتك الذاتية واحصل على تحليل مدعوم بالذكاء الاصطناعي",
    dropzoneLabel: "اسحب وأفلت ملف السيرة الذاتية هنا",
    dropzoneAlt: "أو انقر لاختيار ملف",
    supportedFormats: "PDF, DOC, DOCX - الحد الأقصى 10MB",
    orSeparator: "أو",
    voiceTitle: "سجّل بصوتك",
    voiceDescription: "أخبرنا عن نفسك وخبراتك بصوتك",
    startRecording: "ابدأ التسجيل",
    stopRecording: "أوقف التسجيل",
    analyzing: "جاري التحليل...",
    parsing: "جاري قراءة السيرة الذاتية...",
    uploadSuccess: "تم رفع الملف بنجاح!",
    uploadError: "حدث خطأ أثناء رفع الملف",
    invalidFile: "نوع الملف غير مدعوم",
    fileTooLarge: "حجم الملف كبير جداً",
    scanNow: "افحص الآن",
    cancel: "إلغاء",
    tryAgain: "حاول مرة أخرى",
    features: [
      "تحليل المهارات والخبرات",
      "اقتراحات للتحسين",
      "مطابقة مع الفرص المناسبة",
    ],
    photoTitle: "صورة السيرة",
    photoDescription: "التقط صورة لسيرتك الذاتية المطبوعة",
    // New consent translations
    consent: {
      title: "موافقة على التحليل بالذكاء الاصطناعي",
      description:
        "للحصول على تحليل متقدم واقتراحات مخصصة، نحتاج موافقتك على معالجة بياناتك بالذكاء الاصطناعي.",
      checkbox: "أوافق على تحليل سيرتي الذاتية بالذكاء الاصطناعي",
      privacy: "بياناتك محمية ولن تُشارك مع أي طرف ثالث دون إذنك.",
      redactPII: "إخفاء المعلومات الشخصية",
      redactPIIDescription: "إزالة الاسم والبريد والهاتف قبل التحليل",
      privacyNotice:
        "بياناتك تُعالج بشكل آمن ولا تُشارك أبداً دون إذنك الصريح.",
      noConsentWarning:
        "بدون الموافقة، سيتم إجراء تحليل أساسي فقط. لن تتوفر الاقتراحات المدعومة بالذكاء الاصطناعي.",
    },
    // Actions
    quickApply: "تقديم سريع",
    generateCover: "إنشاء رسالة تغطية",
    saveProfile: "حفظ في الملف الشخصي",
    downloadPDF: "تحميل PDF محسّن",
    analyzeWithAI: "تحليل بالذكاء الاصطناعي",
    backToUpload: "رفع ملف آخر",
    // Analysis
    analysisTitle: "نتائج التحليل",
    score: "النتيجة",
    suggestions: "اقتراحات للتحسين",
    keywords: "كلمات مفتاحية",
  },
  en: {
    title: "Scan Your CV",
    description: "Upload your CV and get AI-powered analysis",
    dropzoneLabel: "Drag and drop your CV file here",
    dropzoneAlt: "or click to select a file",
    supportedFormats: "PDF, DOC, DOCX - Max 10MB",
    orSeparator: "or",
    voiceTitle: "Record Your Voice",
    voiceDescription: "Tell us about yourself and your experience",
    startRecording: "Start Recording",
    stopRecording: "Stop Recording",
    analyzing: "Analyzing...",
    parsing: "Reading your CV...",
    uploadSuccess: "File uploaded successfully!",
    uploadError: "Error uploading file",
    invalidFile: "Invalid file type",
    fileTooLarge: "File too large",
    scanNow: "Scan Now",
    cancel: "Cancel",
    tryAgain: "Try Again",
    features: [
      "Skills & experience analysis",
      "Improvement suggestions",
      "Match with suitable opportunities",
    ],
    photoTitle: "Photo CV",
    photoDescription: "Take a photo of your printed CV",
    // New consent translations
    consent: {
      title: "AI Analysis Consent",
      description:
        "For advanced analysis and personalized suggestions, we need your consent to process your data with AI.",
      checkbox: "I consent to AI analysis of my CV",
      privacy:
        "Your data is protected and will not be shared with third parties without your permission.",
      redactPII: "Redact personal information",
      redactPIIDescription: "Remove name, email, and phone before AI analysis",
      privacyNotice:
        "Your data is processed securely and never shared without your explicit permission.",
      noConsentWarning:
        "Without consent, only basic parsing will be performed. AI-powered suggestions will not be available.",
    },
    // Actions
    quickApply: "Quick Apply",
    generateCover: "Generate Cover Letter",
    saveProfile: "Save to Profile",
    downloadPDF: "Download Improved PDF",
    analyzeWithAI: "Analyze with AI",
    backToUpload: "Upload Another File",
    // Analysis
    analysisTitle: "Analysis Results",
    score: "Score",
    suggestions: "Improvement Suggestions",
    keywords: "Keywords",
  },
};

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function CVScanModal({
  locale,
  open,
  onOpenChange,
  onSubmit,
  onQuickApply,
  children,
}: CVScanModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [isRecording, setIsRecording] = React.useState(false);
  const [uploadMode, setUploadMode] = React.useState<
    "file" | "voice" | "photo"
  >("file");
  const [viewMode, setViewMode] = React.useState<ViewMode>("upload");

  // Consent state
  const [consentToAI, setConsentToAI] = React.useState(false);
  const [redactPII, setRedactPII] = React.useState(false);

  // CV Upload hook
  const {
    isUploading,
    isPolling,
    isParsing,
    isAnalyzing,
    progress,
    parsedResume,
    analysis,
    error: uploadError,
    upload,
    analyzeResume,
    reset: resetUpload,
  } = useCVUpload();

  // Editable parsed data
  const [editedData, setEditedData] = React.useState<ParsedResumeData | null>(
    null,
  );

  const t = translations[locale];
  const isRTL = locale === "ar";

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setErrorMessage(t.fileTooLarge);
        } else {
          setErrorMessage(t.invalidFile);
        }
        setStatus("error");
        return;
      }

      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setStatus("idle");
        setErrorMessage("");
      }
    },
    [t],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const handleSubmit = async () => {
    if (!file) return;

    setStatus("uploading");

    try {
      await upload(file, {
        mode: consentToAI ? "analyze" : "parse",
        consentToAI,
        redactPII,
      });

      // Status will be updated by the hook
    } catch (error) {
      setStatus("error");
      setErrorMessage(t.uploadError);
    }
  };

  // Sync status from hook
  React.useEffect(() => {
    if (isUploading) setStatus("uploading");
    else if (isPolling || isParsing) setStatus("parsing");
    else if (isAnalyzing) setStatus("analyzing");
    else if (parsedResume) {
      setStatus("parsed");
      setViewMode("preview");
      setEditedData(parsedResume as ParsedResumeData);
    }
    if (uploadError) {
      setStatus("error");
      setErrorMessage(uploadError);
    }
  }, [
    isUploading,
    isPolling,
    isParsing,
    isAnalyzing,
    parsedResume,
    uploadError,
  ]);

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setErrorMessage("");
    setViewMode("upload");
    setEditedData(null);
    setConsentToAI(false);
    setRedactPII(false);
    resetUpload();
  };

  const handleQuickApply = () => {
    if (editedData && onQuickApply) {
      onQuickApply(editedData);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (editedData && !consentToAI) {
      // Show consent required error
      setErrorMessage(t.consent.noConsentWarning);
      return;
    }

    if (editedData?.id) {
      setStatus("analyzing");
      try {
        await analyzeResume(editedData.id);
        setViewMode("analysis");
      } catch (error) {
        setStatus("error");
        setErrorMessage(t.uploadError);
      }
    }
  };

  const handleStartRecording = async () => {
    // Implement voice recording logic
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Process recording
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {children && <ModalTrigger asChild>{children}</ModalTrigger>}
      <ModalContent size="lg" dir={isRTL ? "rtl" : "ltr"}>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
              <Sparkles className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <ModalTitle>{t.title}</ModalTitle>
              <ModalDescription>{t.description}</ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* Upload Mode Tabs */}
          <div className="flex gap-2 p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setUploadMode("file")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                uploadMode === "file"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              <FileText className="h-4 w-4" />
              {isRTL ? "ملف" : "File"}
            </button>
            <button
              onClick={() => setUploadMode("voice")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                uploadMode === "voice"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              <Mic className="h-4 w-4" />
              {isRTL ? "صوتي" : "Voice"}
            </button>
            <button
              onClick={() => setUploadMode("photo")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                uploadMode === "photo"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              <Camera className="h-4 w-4" />
              {isRTL ? "صورة" : "Photo"}
            </button>
          </div>

          {/* File Upload Mode */}
          <AnimatePresence mode="wait">
            {uploadMode === "file" && (
              <motion.div
                key="file"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                    isDragActive
                      ? "border-primary-500 bg-primary-50"
                      : "border-border hover:border-primary-300 hover:bg-primary-50/50",
                    status === "success" && "border-success-500 bg-success-50",
                    status === "error" && "border-danger-500 bg-danger-50",
                  )}
                >
                  <input {...getInputProps()} />

                  {status === "uploading" ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-12 w-12 text-primary-500 animate-spin" />
                      <p className="text-sm text-muted">{t.analyzing}</p>{" "}
                      {progress > 0 && (
                        <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ) : status === "parsing" ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-12 w-12 text-primary-500 animate-spin" />
                      <p className="text-sm text-muted">{t.parsing}</p>
                      {progress > 0 && (
                        <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}{" "}
                    </div>
                  ) : status === "success" ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle className="h-12 w-12 text-success-500" />
                      <p className="text-sm text-success-600">
                        {t.uploadSuccess}
                      </p>
                    </div>
                  ) : status === "error" ? (
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="h-12 w-12 text-danger-500" />
                      <p className="text-sm text-danger-600">{errorMessage}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset();
                        }}
                      >
                        {t.tryAgain}
                      </Button>
                    </div>
                  ) : file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-border">
                        <FileText className="h-8 w-8 text-primary-500" />
                        <div className="text-start">
                          <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReset();
                          }}
                          className="p-1 text-muted hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {t.dropzoneLabel}
                        </p>
                        <p className="text-sm text-muted mt-1">
                          {t.dropzoneAlt}
                        </p>
                      </div>
                      <p className="text-xs text-muted">{t.supportedFormats}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Voice Recording Mode */}
            {uploadMode === "voice" && (
              <motion.div
                key="voice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-8"
              >
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={cn(
                      "h-24 w-24 rounded-full flex items-center justify-center transition-all",
                      isRecording
                        ? "bg-danger-100 animate-pulse"
                        : "bg-primary-100",
                    )}
                  >
                    <Mic
                      className={cn(
                        "h-12 w-12",
                        isRecording ? "text-danger-600" : "text-primary-600",
                      )}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {t.voiceTitle}
                    </h4>
                    <p className="text-sm text-muted mt-1">
                      {t.voiceDescription}
                    </p>
                  </div>
                  <Button
                    variant={isRecording ? "danger" : "primary"}
                    onClick={
                      isRecording ? handleStopRecording : handleStartRecording
                    }
                  >
                    {isRecording ? t.stopRecording : t.startRecording}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Photo Capture Mode */}
            {uploadMode === "photo" && (
              <motion.div
                key="photo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-8"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="h-24 w-24 rounded-full bg-secondary-100 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-secondary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {t.photoTitle}
                    </h4>
                    <p className="text-sm text-muted mt-1">
                      {t.photoDescription}
                    </p>
                  </div>
                  <Button variant="secondary">
                    <Camera className="h-4 w-4" />
                    {isRTL ? "التقط صورة" : "Take Photo"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features List */}
          {viewMode === "upload" && (
            <>
              {/* AI Consent Section */}
              <ConsentCheckbox
                checked={consentToAI}
                onChange={setConsentToAI}
                showRedactionOption={true}
                redactPII={redactPII}
                onRedactPIIChange={setRedactPII}
                disabled={status === "uploading" || status === "parsing"}
              />

              <div className="bg-neutral-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-3">
                  {isRTL ? "ماذا ستحصل؟" : "What you'll get:"}
                </h4>
                <ul className="space-y-2">
                  {t.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted"
                    >
                      <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Parsed Resume Preview */}
          {viewMode === "preview" && editedData && (
            <div className="space-y-4">
              <ParsedResumePreview
                data={editedData}
                onChange={setEditedData}
                isEditable={true}
              />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="primary"
                  onClick={handleQuickApply}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {t.quickApply}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAnalyzeWithAI}
                  disabled={!consentToAI || isAnalyzing}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {t.analyzeWithAI}
                </Button>
                <Button variant="ghost" className="flex items-center gap-2">
                  <FileEdit className="h-4 w-4" />
                  {t.generateCover}
                </Button>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {t.saveProfile}
                </Button>
              </div>
            </div>
          )}

          {/* AI Analysis Results */}
          {viewMode === "analysis" && analysis && (
            <div className="space-y-4">
              {/* Score */}
              <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl">
                <p className="text-sm text-muted mb-2">{t.score}</p>
                <div className="text-5xl font-bold text-primary-600">
                  {analysis.score}
                  <span className="text-2xl text-muted">/100</span>
                </div>
              </div>

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">
                    {t.suggestions}
                  </h4>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-muted p-2 bg-amber-50 rounded-lg"
                      >
                        <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keywords */}
              {analysis.keywords.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">{t.keywords}</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Download improved PDF */}
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t.downloadPDF}
              </Button>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {viewMode === "upload" ? (
            <>
              <Button variant="ghost" onClick={() => onOpenChange?.(false)}>
                {t.cancel}
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={
                  !file || status === "uploading" || status === "parsing"
                }
                loading={status === "uploading" || status === "parsing"}
              >
                <Sparkles className="h-4 w-4" />
                {t.scanNow}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleReset}>
                {t.backToUpload}
              </Button>
              <Button variant="primary" onClick={handleQuickApply}>
                <Send className="h-4 w-4" />
                {t.quickApply}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CVScanModal;
