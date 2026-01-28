/**
 * Forsati Platform - Search Service
 * خدمة البحث لمنصة فرصتي
 *
 * Features:
 * - Full-text search via Typesense
 * - Faceted filtering
 * - Geosearch (location-based)
 * - Autocomplete suggestions
 * - Search analytics
 */

import { z } from "zod";

// ============================================
// Types & Schemas | الأنواع والمخططات
// ============================================

export const SearchIndexSchema = z.enum([
  "opportunities",
  "profiles",
  "courses",
  "scholarships",
  "companies",
  "articles",
]);

export type SearchIndex = z.infer<typeof SearchIndexSchema>;

export interface SearchFilters {
  // Job filters
  jobType?: (
    | "full_time"
    | "part_time"
    | "contract"
    | "internship"
    | "remote"
  )[];
  experienceLevel?: ("entry" | "mid" | "senior" | "executive")[];
  salary?: { min?: number; max?: number };

  // Location filters
  location?: string[];
  country?: string[];
  city?: string[];
  remote?: boolean;

  // Industry/Category filters
  industry?: string[];
  category?: string[];
  skills?: string[];

  // Date filters
  postedAfter?: Date;
  postedBefore?: Date;
  deadlineBefore?: Date;

  // Company filters
  companySize?: ("startup" | "small" | "medium" | "large" | "enterprise")[];
  companyType?: ("private" | "public" | "ngo" | "government")[];

  // Profile-specific filters
  employmentStatus?: string[];
  education?: string[];
  yearsOfExperience?: { min?: number; max?: number };

  // Scholarship-specific filters
  fundingType?: ("full" | "partial" | "tuition" | "living")[];
  degree?: ("bachelor" | "master" | "phd" | "other")[];
}

export interface SearchOptions {
  query: string;
  index: SearchIndex;
  filters?: SearchFilters;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  facets?: string[];
  highlightFields?: string[];
  locale?: "en" | "ar";
}

export interface SearchResult<T = unknown> {
  hits: Array<{
    document: T;
    highlights?: Record<string, { snippet: string; value: string }>;
    score: number;
  }>;
  found: number;
  page: number;
  totalPages: number;
  facetCounts?: Record<string, Array<{ value: string; count: number }>>;
  searchTime: number;
}

export interface AutocompleteResult {
  suggestions: Array<{
    text: string;
    type: "query" | "job" | "company" | "skill" | "location";
    metadata?: Record<string, unknown>;
  }>;
}

// ============================================
// Typesense Client Configuration
// ============================================

interface TypesenseConfig {
  host: string;
  port: number;
  protocol: "http" | "https";
  apiKey: string;
}

const defaultConfig: TypesenseConfig = {
  host: process.env.NEXT_PUBLIC_TYPESENSE_HOST || "localhost",
  port: parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT || "8108", 10),
  protocol:
    (process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL as "http" | "https") || "http",
  apiKey: process.env.NEXT_PUBLIC_TYPESENSE_API_KEY || "typesense_api_key",
};

// ============================================
// Search Service Class
// ============================================

class SearchService {
  private config: TypesenseConfig;
  private baseUrl: string;

  constructor(config: TypesenseConfig = defaultConfig) {
    this.config = config;
    this.baseUrl = `${config.protocol}://${config.host}:${config.port}`;
  }

  /**
   * Perform search query
   * تنفيذ استعلام البحث
   */
  async search<T = unknown>(options: SearchOptions): Promise<SearchResult<T>> {
    const {
      query,
      index,
      filters,
      page = 1,
      perPage = 20,
      sortBy,
      sortOrder = "desc",
      facets,
      highlightFields,
      locale = "en",
    } = options;

    try {
      const searchParams = new URLSearchParams({
        q: query || "*",
        query_by: this.getQueryFields(index, locale),
        page: page.toString(),
        per_page: perPage.toString(),
        highlight_full_fields: (
          highlightFields || this.getHighlightFields(index)
        ).join(","),
      });

      // Add filters
      if (filters) {
        const filterString = this.buildFilterString(filters);
        if (filterString) {
          searchParams.set("filter_by", filterString);
        }
      }

      // Add sorting
      if (sortBy) {
        searchParams.set("sort_by", `${sortBy}:${sortOrder}`);
      }

      // Add facets
      if (facets && facets.length > 0) {
        searchParams.set("facet_by", facets.join(","));
      }

      const response = await fetch(
        `${this.baseUrl}/collections/${index}/documents/search?${searchParams}`,
        {
          headers: {
            "X-TYPESENSE-API-KEY": this.config.apiKey,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        hits: data.hits.map(
          (hit: {
            document: T;
            highlight?: Record<string, { snippet: string }>;
            text_match: number;
          }) => ({
            document: hit.document,
            highlights: hit.highlight,
            score: hit.text_match,
          }),
        ),
        found: data.found,
        page: data.page,
        totalPages: Math.ceil(data.found / perPage),
        facetCounts: data.facet_counts?.reduce(
          (
            acc: Record<string, Array<{ value: string; count: number }>>,
            facet: {
              field_name: string;
              counts: Array<{ value: string; count: number }>;
            },
          ) => {
            acc[facet.field_name] = facet.counts;
            return acc;
          },
          {},
        ),
        searchTime: data.search_time_ms,
      };
    } catch (error) {
      console.error("Search error:", error);
      return {
        hits: [],
        found: 0,
        page: 1,
        totalPages: 0,
        searchTime: 0,
      };
    }
  }

  /**
   * Get autocomplete suggestions
   * الحصول على اقتراحات الإكمال التلقائي
   */
  async autocomplete(
    query: string,
    index: SearchIndex,
    limit: number = 5,
  ): Promise<AutocompleteResult> {
    try {
      const searchParams = new URLSearchParams({
        q: query,
        query_by: this.getQueryFields(index, "en"),
        per_page: limit.toString(),
        prefix: "true",
      });

      const response = await fetch(
        `${this.baseUrl}/collections/${index}/documents/search?${searchParams}`,
        {
          headers: {
            "X-TYPESENSE-API-KEY": this.config.apiKey,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Autocomplete failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        suggestions: data.hits.map(
          (hit: { document: Record<string, unknown> }) => ({
            text: this.getSuggestionText(hit.document, index),
            type: this.getSuggestionType(index),
            metadata: hit.document,
          }),
        ),
      };
    } catch (error) {
      console.error("Autocomplete error:", error);
      return { suggestions: [] };
    }
  }

  /**
   * Multi-search across multiple collections
   * بحث متعدد عبر مجموعات متعددة
   */
  async multiSearch(
    searches: Array<{
      index: SearchIndex;
      query: string;
      limit?: number;
    }>,
  ): Promise<Record<SearchIndex, SearchResult>> {
    try {
      const searchRequests = searches.map((s) => ({
        collection: s.index,
        q: s.query || "*",
        query_by: this.getQueryFields(s.index, "en"),
        per_page: s.limit || 5,
      }));

      const response = await fetch(`${this.baseUrl}/multi_search`, {
        method: "POST",
        headers: {
          "X-TYPESENSE-API-KEY": this.config.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searches: searchRequests }),
      });

      if (!response.ok) {
        throw new Error(`Multi-search failed: ${response.statusText}`);
      }

      const data = await response.json();

      const results: Record<string, SearchResult> = {};
      searches.forEach((s, i) => {
        const result = data.results[i];
        results[s.index] = {
          hits: result.hits.map(
            (hit: { document: unknown; text_match: number }) => ({
              document: hit.document,
              score: hit.text_match,
            }),
          ),
          found: result.found,
          page: 1,
          totalPages: 1,
          searchTime: result.search_time_ms,
        };
      });

      return results as Record<SearchIndex, SearchResult>;
    } catch (error) {
      console.error("Multi-search error:", error);
      return {} as Record<SearchIndex, SearchResult>;
    }
  }

  /**
   * Get popular/trending searches
   * الحصول على عمليات البحث الشائعة
   */
  async getTrendingSearches(
    index: SearchIndex,
    limit: number = 10,
  ): Promise<string[]> {
    // In a real implementation, this would query analytics data
    // For now, return mock trending searches
    const trendingByIndex: Record<SearchIndex, string[]> = {
      opportunities: [
        "software engineer",
        "marketing manager",
        "data analyst",
        "remote work",
        "internship",
      ],
      profiles: ["developers", "designers", "engineers"],
      courses: ["python", "javascript", "machine learning", "data science"],
      scholarships: ["full scholarship", "masters degree", "USA", "UK"],
      companies: ["tech companies", "startups", "remote first"],
      articles: ["career tips", "interview preparation", "resume writing"],
    };

    return (trendingByIndex[index] || []).slice(0, limit);
  }

  /**
   * Index a document
   * فهرسة مستند
   */
  async indexDocument(
    index: SearchIndex,
    document: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/collections/${index}/documents`,
        {
          method: "POST",
          headers: {
            "X-TYPESENSE-API-KEY": this.config.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(document),
        },
      );

      return response.ok;
    } catch (error) {
      console.error("Index document error:", error);
      return false;
    }
  }

  /**
   * Update a document
   * تحديث مستند
   */
  async updateDocument(
    index: SearchIndex,
    id: string,
    document: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/collections/${index}/documents/${id}`,
        {
          method: "PATCH",
          headers: {
            "X-TYPESENSE-API-KEY": this.config.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(document),
        },
      );

      return response.ok;
    } catch (error) {
      console.error("Update document error:", error);
      return false;
    }
  }

  /**
   * Delete a document
   * حذف مستند
   */
  async deleteDocument(index: SearchIndex, id: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/collections/${index}/documents/${id}`,
        {
          method: "DELETE",
          headers: {
            "X-TYPESENSE-API-KEY": this.config.apiKey,
          },
        },
      );

      return response.ok;
    } catch (error) {
      console.error("Delete document error:", error);
      return false;
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private getQueryFields(index: SearchIndex, locale: string): string {
    const fieldsByIndex: Record<SearchIndex, Record<string, string[]>> = {
      opportunities: {
        en: ["title", "description", "company_name", "skills", "location"],
        ar: [
          "title_ar",
          "description_ar",
          "company_name",
          "skills",
          "location_ar",
        ],
      },
      profiles: {
        en: ["full_name", "headline", "skills", "bio", "location"],
        ar: ["full_name", "headline_ar", "skills", "bio_ar", "location_ar"],
      },
      courses: {
        en: ["title", "description", "provider", "skills"],
        ar: ["title_ar", "description_ar", "provider", "skills"],
      },
      scholarships: {
        en: ["title", "description", "institution", "country", "fields"],
        ar: [
          "title_ar",
          "description_ar",
          "institution",
          "country_ar",
          "fields",
        ],
      },
      companies: {
        en: ["name", "description", "industry", "location"],
        ar: ["name", "description_ar", "industry_ar", "location_ar"],
      },
      articles: {
        en: ["title", "content", "tags", "author"],
        ar: ["title_ar", "content_ar", "tags", "author"],
      },
    };

    return (
      fieldsByIndex[index]?.[locale] ||
      fieldsByIndex[index]?.["en"] || ["*"]
    ).join(",");
  }

  private getHighlightFields(index: SearchIndex): string[] {
    const highlightByIndex: Record<SearchIndex, string[]> = {
      opportunities: ["title", "description", "company_name"],
      profiles: ["full_name", "headline", "bio"],
      courses: ["title", "description"],
      scholarships: ["title", "description"],
      companies: ["name", "description"],
      articles: ["title", "content"],
    };

    return highlightByIndex[index] || [];
  }

  private buildFilterString(filters: SearchFilters): string {
    const filterParts: string[] = [];

    // Job type filter
    if (filters.jobType && filters.jobType.length > 0) {
      filterParts.push(`job_type:[${filters.jobType.join(",")}]`);
    }

    // Experience level filter
    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
      filterParts.push(
        `experience_level:[${filters.experienceLevel.join(",")}]`,
      );
    }

    // Salary range filter
    if (filters.salary) {
      if (filters.salary.min !== undefined) {
        filterParts.push(`salary_min:>=${filters.salary.min}`);
      }
      if (filters.salary.max !== undefined) {
        filterParts.push(`salary_max:<=${filters.salary.max}`);
      }
    }

    // Location filters
    if (filters.location && filters.location.length > 0) {
      filterParts.push(`location:[${filters.location.join(",")}]`);
    }

    if (filters.country && filters.country.length > 0) {
      filterParts.push(`country:[${filters.country.join(",")}]`);
    }

    if (filters.city && filters.city.length > 0) {
      filterParts.push(`city:[${filters.city.join(",")}]`);
    }

    if (filters.remote !== undefined) {
      filterParts.push(`remote:=${filters.remote}`);
    }

    // Industry/Category filters
    if (filters.industry && filters.industry.length > 0) {
      filterParts.push(`industry:[${filters.industry.join(",")}]`);
    }

    if (filters.category && filters.category.length > 0) {
      filterParts.push(`category:[${filters.category.join(",")}]`);
    }

    if (filters.skills && filters.skills.length > 0) {
      filterParts.push(`skills:[${filters.skills.join(",")}]`);
    }

    // Date filters
    if (filters.postedAfter) {
      filterParts.push(
        `posted_at:>=${Math.floor(filters.postedAfter.getTime() / 1000)}`,
      );
    }

    if (filters.postedBefore) {
      filterParts.push(
        `posted_at:<=${Math.floor(filters.postedBefore.getTime() / 1000)}`,
      );
    }

    if (filters.deadlineBefore) {
      filterParts.push(
        `deadline:<=${Math.floor(filters.deadlineBefore.getTime() / 1000)}`,
      );
    }

    // Company filters
    if (filters.companySize && filters.companySize.length > 0) {
      filterParts.push(`company_size:[${filters.companySize.join(",")}]`);
    }

    if (filters.companyType && filters.companyType.length > 0) {
      filterParts.push(`company_type:[${filters.companyType.join(",")}]`);
    }

    // Profile-specific filters
    if (filters.employmentStatus && filters.employmentStatus.length > 0) {
      filterParts.push(
        `employment_status:[${filters.employmentStatus.join(",")}]`,
      );
    }

    if (filters.yearsOfExperience) {
      if (filters.yearsOfExperience.min !== undefined) {
        filterParts.push(
          `years_of_experience:>=${filters.yearsOfExperience.min}`,
        );
      }
      if (filters.yearsOfExperience.max !== undefined) {
        filterParts.push(
          `years_of_experience:<=${filters.yearsOfExperience.max}`,
        );
      }
    }

    // Scholarship-specific filters
    if (filters.fundingType && filters.fundingType.length > 0) {
      filterParts.push(`funding_type:[${filters.fundingType.join(",")}]`);
    }

    if (filters.degree && filters.degree.length > 0) {
      filterParts.push(`degree:[${filters.degree.join(",")}]`);
    }

    return filterParts.join(" && ");
  }

  private getSuggestionText(
    document: Record<string, unknown>,
    index: SearchIndex,
  ): string {
    const textFieldByIndex: Record<SearchIndex, string> = {
      opportunities: "title",
      profiles: "full_name",
      courses: "title",
      scholarships: "title",
      companies: "name",
      articles: "title",
    };

    const field = textFieldByIndex[index];
    return (document[field] as string) || "";
  }

  private getSuggestionType(
    index: SearchIndex,
  ): "query" | "job" | "company" | "skill" | "location" {
    const typeByIndex: Record<
      SearchIndex,
      "query" | "job" | "company" | "skill" | "location"
    > = {
      opportunities: "job",
      profiles: "query",
      courses: "query",
      scholarships: "query",
      companies: "company",
      articles: "query",
    };

    return typeByIndex[index] || "query";
  }
}

// ============================================
// Exports
// ============================================

export const searchService = new SearchService();
export { SearchService };

// Helper hooks for React
export function useSearch<T = unknown>() {
  return {
    search: (options: SearchOptions) => searchService.search<T>(options),
    autocomplete: (query: string, index: SearchIndex) =>
      searchService.autocomplete(query, index),
    multiSearch: (
      searches: Array<{ index: SearchIndex; query: string; limit?: number }>,
    ) => searchService.multiSearch(searches),
    getTrending: (index: SearchIndex) =>
      searchService.getTrendingSearches(index),
  };
}
