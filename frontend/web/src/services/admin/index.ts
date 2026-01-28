/**
 * Forsati Platform - Admin Services Index
 * فهرس خدمات الإدارة
 */

// Gift Codes
export * from "./giftCodeService";
export { giftCodeService } from "./giftCodeService";

// Loyalty Points
export * from "./loyaltyPointsService";
export { loyaltyPointsService } from "./loyaltyPointsService";

// Feature Flags
export * from "./featureFlagsService";
export {
  featureFlagsService,
  FeatureKeys,
  useFeatureFlag,
  useFeatureFlags,
} from "./featureFlagsService";

// Quotas
export * from "./quotasService";
export { quotasService } from "./quotasService";
