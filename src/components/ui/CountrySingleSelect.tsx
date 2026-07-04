import React, { useMemo, useState, useEffect } from "react";
import SearchDropdown from "./SearchDropdown";
import { useInfiniteSelectSingle } from "../../utils/useInfiniteSelectSingle";
import { useAppSelector } from "../../redux/hooks";
import { selectCountriesData, selectCountriesMeta } from "../../redux/selectors/global";
import { useGetCountriesQuery } from "../../redux/services/global";

interface CountrySingleSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceHolder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  limit?: number;
  disabled?: boolean;
  initialLabel?: string;
}

export const CountrySingleSelect: React.FC<CountrySingleSelectProps> = ({
  label = "Country",
  placeholder = "Select Country",
  searchPlaceHolder = "Search country...",
  value,
  onChange,
  error,
  limit = 15,
  disabled = false,
  initialLabel = "",
}) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedName, setSelectedName] = useState(initialLabel);

  const query = useMemo(
    () => ({
      page,
      limit,
      search: searchTerm || undefined,
    }),
    [page, limit, searchTerm],
  );

  const { isFetching: isLoading } = useGetCountriesQuery(query);
  const currentPageItems = useAppSelector(selectCountriesData(query));
  const meta = useAppSelector(selectCountriesMeta(query));

  const { accumulatedItems, handleLoadMore, handleSearch } =
    useInfiniteSelectSingle({
      currentPageItems,
      page,
      searchTerm,
      isLoading,
      hasMore: meta ? meta.page < meta.totalPages : false,
      meta,
      getId: (country: any) => country.id,
      entityName: "country",
      onPageChange: setPage,
      onSearchChange: setSearchTerm,
    });

  // Sync selectedName with initialLabel if it changes
  useEffect(() => {
    if (initialLabel) {
      setSelectedName(initialLabel);
    }
  }, [initialLabel]);

  // Sync selectedName with selected value if it is loaded in current infinite items list
  const currentItem = accumulatedItems.find((c: any) => c.id === value);
  useEffect(() => {
    if (currentItem) {
      setSelectedName(currentItem.name);
    }
  }, [value, currentItem]);

  return (
    <SearchDropdown
      label={label}
      items={accumulatedItems}
      value={value}
      onChange={onChange}
      getValue={(c) => c.id}
      getLabel={(c) => c.name}
      searchMode="server"
      onSearch={handleSearch}
      searchPlaceHolder={searchPlaceHolder}
      placeholder={placeholder}
      isLoading={isLoading}
      hasMore={meta ? meta.page < meta.totalPages : false}
      onLoadMore={handleLoadMore}
      error={error}
      disabled={disabled}
      selectedLabel={selectedName}
    />
  );
};

export default CountrySingleSelect;
