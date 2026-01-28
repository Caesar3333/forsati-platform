#!/usr/bin/env python3
# © 2026 Forsati. All rights reserved.
"""
Manifest Validator for Forsati Platform
Validates feature manifests against schema requirements
"""

import json
import sys
import os
from pathlib import Path
from typing import Dict, List, Any, Tuple

REQUIRED_FIELDS = [
    "feature",
    "description",
    "markets",
    "market_defaults",
    "frontend",
    "backend",
    "dashboards",
    "required_roles",
    "i18n_keys",
    "seo",
    "audit"
]

REQUIRED_LANGUAGES = ["en", "ar"]
VALID_MARKETS = ["jo", "sa", "ae", "kw", "bh", "om", "qa", "eg", "lb", "ps"]


def validate_manifest(manifest_path: Path) -> Tuple[bool, List[str]]:
    """
    Validate a single manifest file
    Returns (is_valid, list_of_errors)
    """
    errors = []
    
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    except json.JSONDecodeError as e:
        return False, [f"Invalid JSON: {e}"]
    except Exception as e:
        return False, [f"Error reading file: {e}"]
    
    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in manifest:
            errors.append(f"Missing required field: {field}")
    
    # Validate description (bilingual)
    if "description" in manifest:
        desc = manifest["description"]
        if not isinstance(desc, dict):
            errors.append("'description' must be an object with 'en' and 'ar' keys")
        else:
            for lang in REQUIRED_LANGUAGES:
                if lang not in desc:
                    errors.append(f"Missing '{lang}' in description")
    
    # Validate markets
    if "markets" in manifest:
        markets = manifest["markets"]
        if not isinstance(markets, list):
            errors.append("'markets' must be an array")
        else:
            for market in markets:
                if market not in VALID_MARKETS:
                    errors.append(f"Invalid market: {market}")
    
    # Validate market_defaults
    if "market_defaults" in manifest and "markets" in manifest:
        defaults = manifest["market_defaults"]
        markets = manifest["markets"]
        
        # Check jo (Jordan) is present if in markets
        if "jo" in markets:
            if "jo" not in defaults:
                errors.append("Jordan (jo) market must have defaults defined")
            else:
                jo_defaults = defaults["jo"]
                required_jo_fields = ["currency", "timezone", "phone_examples"]
                for field in required_jo_fields:
                    if field not in jo_defaults:
                        errors.append(f"Missing '{field}' in jo market_defaults")
    
    # Validate i18n_keys
    if "i18n_keys" in manifest:
        i18n = manifest["i18n_keys"]
        if not isinstance(i18n, dict):
            errors.append("'i18n_keys' must be an object")
        else:
            for lang in REQUIRED_LANGUAGES:
                if lang not in i18n:
                    errors.append(f"Missing '{lang}' in i18n_keys")
    
    # Validate required_roles
    if "required_roles" in manifest:
        roles = manifest["required_roles"]
        if not isinstance(roles, list):
            errors.append("'required_roles' must be an array")
    
    # Validate audit
    if "audit" in manifest:
        audit = manifest["audit"]
        if "audit_events" not in audit:
            errors.append("Missing 'audit_events' in audit")
        if "log_collection" not in audit:
            errors.append("Missing 'log_collection' in audit")
    
    return len(errors) == 0, errors


def find_manifests(base_path: Path) -> List[Path]:
    """Find all manifest.json files in features directory"""
    features_dir = base_path / "features"
    if not features_dir.exists():
        return []
    
    return list(features_dir.glob("*/manifest.json"))


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Validate Forsati feature manifests")
    parser.add_argument("--base", default=".", help="Base repository path")
    parser.add_argument("--head", default="HEAD", help="Git ref (unused, for CI compatibility)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    base_path = Path(args.base).resolve()
    
    print("=" * 50)
    print("🔍 Forsati Manifest Validator")
    print("=" * 50)
    print(f"📁 Base path: {base_path}")
    print()
    
    manifests = find_manifests(base_path)
    
    if not manifests:
        print("⚠️  No manifest files found in features/")
        print("   Expected path: features/<feature-name>/manifest.json")
        sys.exit(0)
    
    print(f"📋 Found {len(manifests)} manifest(s)")
    print()
    
    all_valid = True
    results = []
    
    for manifest_path in manifests:
        feature_name = manifest_path.parent.name
        is_valid, errors = validate_manifest(manifest_path)
        results.append((feature_name, is_valid, errors))
        
        if is_valid:
            print(f"✅ {feature_name}: VALID")
        else:
            print(f"❌ {feature_name}: INVALID")
            all_valid = False
            for error in errors:
                print(f"   - {error}")
        
        if args.verbose and is_valid:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
            print(f"   Markets: {manifest.get('markets', [])}")
            print(f"   Roles: {manifest.get('required_roles', [])}")
    
    print()
    print("=" * 50)
    
    if all_valid:
        print("✅ All manifests are valid | جميع الملفات صالحة")
        sys.exit(0)
    else:
        print("❌ Some manifests have errors | بعض الملفات بها أخطاء")
        sys.exit(1)


if __name__ == "__main__":
    main()
