import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { mockCampaignData, mockCityData } from "./mockData";
import { platformOptions as allPlatformOptions } from "./filterOptions";

const NONE: string[] = [];

export function useScopedData() {
  const user = useSelector((state: RootState) => state.auth.user);
  const platforms = user?.platforms ?? NONE;

  return useMemo(
    () => ({
      campaigns: mockCampaignData.filter((r) => platforms.includes(r.platform)),
      cities: mockCityData.filter((r) => platforms.includes(r.platform)),
      platformOptions: allPlatformOptions.filter((o) => o.value === "all" || platforms.includes(o.value)),
    }),
    [platforms]
  );
}