/**
 * Farcaster Frame & Base Mini App Metadata Helpers
 */

/**
 * Base Mini App embed metadata configuration
 */
export interface MiniAppEmbedConfig {
  version: "1";
  imageUrl: string;
  button: {
    title: string;
    action: {
      type: "launch_frame";
      url: string;
    };
  };
}

/**
 * Generate Base Mini App embed metadata for fc:miniapp meta tag
 *
 * @param imageUrl - Preview image URL (3:2 aspect ratio, 1200x800)
 * @param baseUrl - Base URL of the app
 * @returns JSON string for fc:miniapp meta tag content
 */
export function getMiniAppMetadata(
  imageUrl: string,
  baseUrl: string = process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000"
): string {
  const config: MiniAppEmbedConfig = {
    version: "1",
    imageUrl,
    button: {
      title: "Say GM",
      action: {
        type: "launch_frame",
        url: baseUrl,
      },
    },
  };

  return JSON.stringify(config);
}

/**
 * Frame button action types
 */
export type FrameButtonAction = "post" | "post_redirect" | "link" | "mint";

/**
 * Frame button configuration
 */
export interface FrameButton {
  label: string;
  action: FrameButtonAction;
  target?: string;
}

/**
 * Frame metadata configuration
 */
export interface FrameMetadataConfig {
  version: "vNext";
  image: string;
  aspectRatio?: "1.91:1" | "1:1";
  buttons: FrameButton[];
  postUrl?: string;
}

/**
 * Generate Farcaster Frame metadata object for Next.js Metadata API
 */
export function generateFrameMetadata(config: FrameMetadataConfig): Record<string, string> {
  const metadata: Record<string, string> = {
    "fc:frame": config.version,
    "fc:frame:image": config.image,
  };

  if (config.aspectRatio) {
    metadata["fc:frame:image:aspect_ratio"] = config.aspectRatio;
  }

  config.buttons.slice(0, 4).forEach((button, index) => {
    const buttonIndex = index + 1;
    metadata[`fc:frame:button:${buttonIndex}`] = button.label;
    metadata[`fc:frame:button:${buttonIndex}:action`] = button.action;

    if (button.target) {
      metadata[`fc:frame:button:${buttonIndex}:target`] = button.target;
    }
  });

  if (config.postUrl) {
    metadata["fc:frame:post_url"] = config.postUrl;
  }

  return metadata;
}

/**
 * Get Frame metadata for main app page
 */
export function getMainPageFrameMetadata(
  imageUrl: string,
  baseUrl: string = process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000"
): Record<string, string> {
  return generateFrameMetadata({
    version: "vNext",
    image: imageUrl,
    aspectRatio: "1.91:1",
    buttons: [
      {
        label: "Say GM",
        action: "link",
        target: baseUrl,
      },
    ],
    postUrl: `${baseUrl}/api/frame`,
  });
}
