/**
 * ==============================================================================
 * ASIVO LMS — BANNER APPEARANCE & READABILITY UTILITY
 * Standard: Quiet Atelier & WCAG 2.1 Contrast Governance
 * ==============================================================================
 */

export const DEFAULT_BANNER_APPEARANCE = {
  overlayType: "GRADIENT",        // 'NONE' | 'SOLID' | 'GRADIENT'
  overlayColor: "#070709",       // Hex color code
  overlayOpacity: 80,             // 0 to 90
  gradientDirection: "LEFT_TO_RIGHT", // 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT' | 'TOP_TO_BOTTOM' | 'BOTTOM_TO_TOP'
  headingColor: "#FFFEFA",       // Ivory
  descriptionColor: "#EAE5DC",   // Stone
  textShadowEnabled: true,
  contentAlignment: "LEFT",       // 'LEFT' | 'CENTER' | 'RIGHT'
  verticalAlignment: "CENTER",    // 'TOP' | 'CENTER' | 'BOTTOM'
};

/**
 * Safely converts hex color code to RGBA string with bounded opacity.
 */
export function hexToRgba(hex = "#070709", opacityPercent = 80) {
  if (!hex || typeof hex !== "string") hex = "#070709";
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length < 6) clean = "070709";

  const num = parseInt(clean.slice(0, 6), 16) || 0;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  const rawAlpha = Number(opacityPercent) || 0;
  const alpha = Math.max(0, Math.min(0.9, rawAlpha / 100));

  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

/**
 * Generates dynamic CSS style object for overlay mask.
 */
export function getOverlayStyle(banner = {}) {
  const overlayType = (banner.overlayType || DEFAULT_BANNER_APPEARANCE.overlayType).toUpperCase();
  const overlayColor = banner.overlayColor || DEFAULT_BANNER_APPEARANCE.overlayColor;
  const overlayOpacity = banner.overlayOpacity !== undefined && banner.overlayOpacity !== null
    ? Number(banner.overlayOpacity)
    : DEFAULT_BANNER_APPEARANCE.overlayOpacity;
  const gradientDirection = (banner.gradientDirection || DEFAULT_BANNER_APPEARANCE.gradientDirection).toUpperCase();

  if (overlayType === "NONE") {
    return { display: "none" };
  }

  const baseRgba = hexToRgba(overlayColor, overlayOpacity);

  if (overlayType === "SOLID") {
    return {
      backgroundColor: baseRgba,
    };
  }

  // GRADIENT
  const dirMap = {
    LEFT_TO_RIGHT: "to right",
    RIGHT_TO_LEFT: "to left",
    TOP_TO_BOTTOM: "to bottom",
    BOTTOM_TO_TOP: "to top",
  };
  const cssDirection = dirMap[gradientDirection] || "to right";
  const midRgba = hexToRgba(overlayColor, overlayOpacity * 0.75);
  const transparentRgba = hexToRgba(overlayColor, 0);

  return {
    backgroundImage: `linear-gradient(${cssDirection}, ${baseRgba} 0%, ${midRgba} 60%, ${transparentRgba} 100%)`,
  };
}

/**
 * Returns Tailwind flex/alignment classes for horizontal content position.
 */
export function getContentAlignmentClasses(contentAlignment = "LEFT") {
  const align = (contentAlignment || "LEFT").toUpperCase();
  switch (align) {
    case "CENTER":
      return "items-center text-center mx-auto";
    case "RIGHT":
      return "items-end text-right ml-auto";
    case "LEFT":
    default:
      return "items-start text-left mr-auto";
  }
}

/**
 * Returns Tailwind flex/alignment classes for vertical positioning.
 */
export function getVerticalAlignmentClasses(verticalAlignment = "CENTER") {
  const align = (verticalAlignment || "CENTER").toUpperCase();
  switch (align) {
    case "TOP":
      return "justify-start pt-10 sm:pt-14";
    case "BOTTOM":
      return "justify-end pb-12 sm:pb-16";
    case "CENTER":
    default:
      return "justify-center";
  }
}

/**
 * Returns text-shadow style object when enabled.
 */
export function getTextShadowStyle(textShadowEnabled = true) {
  return textShadowEnabled
    ? { textShadow: "0 2px 12px rgba(0, 0, 0, 0.75), 0 1px 3px rgba(0, 0, 0, 0.9)" }
    : { textShadow: "none" };
}

/**
 * Relative luminance formula per WCAG 2.1 specification.
 */
export function getRelativeLuminance(hex = "#FFFFFF") {
  if (!hex || typeof hex !== "string") return 1;
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) clean = clean.split("").map((c) => c + c).join("");
  if (clean.length < 6) clean = "FFFFFF";

  const num = parseInt(clean.slice(0, 6), 16) || 0;
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const [rl, gl, bl] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/**
 * Calculates contrast ratio between text and effective overlay backdrop.
 */
export function calculateContrast(
  textHex = "#FFFEFA",
  overlayHex = "#070709",
  opacityPercent = 80,
  overlayType = "GRADIENT"
) {
  if (overlayType === "NONE") {
    return {
      ratio: 2.5,
      rating: "FAIL",
      isAccessible: false,
      recommendation: "Without an overlay, text readability depends entirely on unpredictable photo backgrounds. Select Solid or Gradient overlay for guaranteed accessibility.",
    };
  }

  const textLum = getRelativeLuminance(textHex);
  const overlayLum = getRelativeLuminance(overlayHex);
  const alpha = Math.max(0, Math.min(0.9, (Number(opacityPercent) || 80) / 100));

  // Blend overlay color over typical mid-tone photo base (~0.18 luminance)
  const effectiveBgLum = overlayLum * alpha + 0.18 * (1 - alpha);

  const l1 = Math.max(textLum, effectiveBgLum);
  const l2 = Math.min(textLum, effectiveBgLum);
  const ratio = Number(((l1 + 0.05) / (l2 + 0.05)).toFixed(2));

  let rating = "FAIL";
  let isAccessible = false;
  let recommendation = null;

  if (ratio >= 7.0) {
    rating = "AAA";
    isAccessible = true;
  } else if (ratio >= 4.5) {
    rating = "AA";
    isAccessible = true;
  } else {
    rating = "FAIL";
    isAccessible = false;
    if (alpha < 0.6) {
      recommendation = `Contrast ratio is ${ratio}:1 (below 4.5:1). Recommended: Increase overlay opacity to at least 60% or adjust text/overlay colors.`;
    } else {
      recommendation = `Contrast ratio is ${ratio}:1. Recommended: Select a darker overlay color or a lighter text color for clear legibility.`;
    }
  }

  return { ratio, rating, isAccessible, recommendation };
}

