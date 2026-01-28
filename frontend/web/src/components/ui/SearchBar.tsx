// © 2026 Forsati. All rights reserved.
"use client";

import * as React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn, debounce } from "@/lib/utils";

interface SearchBarProps {
  locale: "ar" | "en";
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  loading?: boolean;
}

const placeholders = {
  ar: "ابحث عن وظائف، شركات، أو مهارات...",
  en: "Search jobs, companies, or skills...",
};

export function SearchBar({
  locale,
  onSearch,
  placeholder,
  autoFocus = false,
  className,
  loading = false,
}: SearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isRTL = locale === "ar";

  // Debounced search
  const debouncedSearch = React.useMemo(
    () => debounce((value: string) => onSearch(value), 300),
    [onSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative w-full", className)}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className={cn(
          "relative flex items-center rounded-lg border bg-white transition-all duration-200",
          isFocused
            ? "border-primary-500 ring-2 ring-primary-100"
            : "border-border hover:border-neutral-300"
        )}
      >
        {/* Search Icon */}
        <div
          className={cn(
            "absolute flex items-center justify-center w-10 h-full text-muted",
            isRTL ? "right-0" : "left-0"
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || placeholders[locale]}
          autoFocus={autoFocus}
          className={cn(
            "flex-1 h-10 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none",
            isRTL ? "pr-10 pl-10" : "pl-10 pr-10"
          )}
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "absolute flex items-center justify-center w-10 h-full text-muted hover:text-foreground transition-colors",
              isRTL ? "left-0" : "right-0"
            )}
            aria-label={isRTL ? "مسح" : "Clear"}
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Keyboard Shortcut Hint */}
        {!query && !isFocused && (
          <div
            className={cn(
              "absolute hidden sm:flex items-center gap-1 text-xs text-muted",
              isRTL ? "left-3" : "right-3"
            )}
          >
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 border border-border font-mono">
              /
            </kbd>
          </div>
        )}
      </div>
    </form>
  );
}

export default SearchBar;
