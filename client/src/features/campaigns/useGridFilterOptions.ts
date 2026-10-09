import { useMemo } from "react";

import {
  useGetCampaignFilterOptionsQuery,
} from "./dashboardApi";

const uniqueSorted = (
  items: string[],
) =>
  [
    ...new Set(
      items.filter(Boolean),
    ),
  ].sort((a, b) =>
    a.localeCompare(b),
  );

export function useGridFilterOptions(
  platform: string,
  _state: string,
  _city: string,
  brand: string,
) {
  const {
    data,
    isLoading,
    isFetching,
  } =
    useGetCampaignFilterOptionsQuery(
      {
        platform:
          platform !== "all"
            ? platform
            : undefined,

        brand:
          brand !== "all"
            ? brand
            : undefined,
      },
    );

  const brands = useMemo(
    () =>
      uniqueSorted(
        data?.brands ?? [],
      ),
    [data?.brands],
  );

  const subBrands = useMemo(
    () =>
      uniqueSorted(
        data?.subBrands ?? [],
      ),
    [data?.subBrands],
  );

  return {
    /*
     * These remain available so the existing
     * FilterBar/DataGrid structure does not break.
     *
     * State/City/Product are not used for the
     * campaign API filtering yet.
     */
    states: [],

    cities: [],

    products: [],

    brands,

    subBrands,

    isLoading,

    isFetching,
  };
}