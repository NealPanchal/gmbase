interface MiniAppManifest {
  name: string;
  subtitle: string;
  description: string;
  primaryCategory: string;
  homeUrl: string;
  iconUrl: string;
  coverImageUrl: string;
  tags: string[];
  version: string;
  accountAssociation: {
    header: string;
    payload: string;
    signature: string;
  };
}

const config: MiniAppManifest = {
  name: "GM Base",
  subtitle: "Say GM every day on Base",
  description: "Daily GM streak tracker on Base blockchain. Say GM once per day and build your streak! Send GMs to frens and track your daily consistency.",
  primaryCategory: "social",
  homeUrl: process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000",
  iconUrl: `${process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000"}/icon.jpg`,
  coverImageUrl: `${process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000"}/base-og-image.jpg`,
  tags: ["social", "daily", "gm", "streak", "base", "blockchain", "web3"],
  version: "1.0.0",
  // Account association will be generated after deployment via Base Build tool
  // Visit: https://build.base.org (or equivalent tool) after deploying
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  }
};

export default config;
