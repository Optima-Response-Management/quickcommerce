import { useMemo } from "react";
import { useGetLocationsQuery } from "./dashboardApi";

const uniqueSorted = (items: string[]) =>
  [...new Set(items.filter(Boolean))].sort((a, b) => a.localeCompare(b));

export function useGridFilterOptions(
  platform: string,
  state: string,
  city: string,
  brand: string,
  product: string
) {
  const { data: locations = [] } = useGetLocationsQuery();

  return useMemo(() => {
    // Only the locations that belong to the selected platform
    const forPlatform =
      platform === "all" ? locations : locations.filter((l) => l.platform === platform.toLowerCase());

    const states = uniqueSorted(forPlatform.map((l) => l.state));

    // Cities of the selected state (or all of them)
    const inState = forPlatform.filter((l) => state === "all" || l.state === state);
    const cities = uniqueSorted(inState.map((l) => l.city));

    // Brands and products come from the locations in the chosen state and city
    const inScope = inState.filter((l) => city === "all" || l.city === city);
    const productsByBrand = new Map<string, Set<string>>();
    inScope.forEach((l) =>
      l.brands.forEach((b) => {
        const set = productsByBrand.get(b.name) ?? new Set<string>();
        b.products.forEach((p) => set.add(p));
        productsByBrand.set(b.name, set);
      })
    );

    // Picking a product narrows the brands, and picking a brand narrows the products
    const brands = uniqueSorted(
      [...productsByBrand.entries()]
        .filter(([, set]) => product === "all" || set.has(product))
        .map(([name]) => name)
    );

    const products = uniqueSorted(
      brand === "all"
        ? [...productsByBrand.values()].flatMap((s) => [...s])
        : [...(productsByBrand.get(brand) ?? [])]
    );

    return { states, cities, brands, products };
  }, [locations, platform, state, city, brand, product]);
}