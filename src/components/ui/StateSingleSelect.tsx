import React, { useMemo, useState, useEffect, useRef } from "react";
import SearchDropdown from "./SearchDropdown";
import { useInfiniteSelectSingle } from "../../utils/useInfiniteSelectSingle";
import { useAppSelector } from "../../redux/hooks";
import { selectStatesData, selectStatesMeta } from "../../redux/selectors/global";
import { useGetStatesQuery } from "../../redux/services/global";

interface StateSingleSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceHolder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  limit?: number;
  disabled?: boolean;
  countryId: string;
  initialLabel?: string;
  required?: boolean;
}

export const StateSingleSelect: React.FC<StateSingleSelectProps> = ({
  label = "State/Region",
  placeholder = "Select State",
  searchPlaceHolder = "Search state...",
  value,
  onChange,
  error,
  limit = 15,
  disabled = false,
  countryId,
  initialLabel = "",
  required = false,
}) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedName, setSelectedName] = useState(initialLabel);

  const query = useMemo(
    () => ({
      country: countryId,
      page,
      limit,
      search: searchTerm || undefined,
    }),
    [countryId, page, limit, searchTerm],
  );

  const { isFetching: isLoading } = useGetStatesQuery(query, { skip: !countryId });
  const currentPageItems = useAppSelector(selectStatesData(query));
  const meta = useAppSelector(selectStatesMeta(query));

  const { accumulatedItems, handleLoadMore, handleSearch, resetState } =
    useInfiniteSelectSingle({
      currentPageItems,
      page,
      searchTerm,
      isLoading,
      hasMore: meta ? meta.page < meta.totalPages : false,
      meta,
      getId: (state: any) => state.id,
      entityName: "state",
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
  const currentItem = accumulatedItems.find((s: any) => s.id === value);
  useEffect(() => {
    if (currentItem) {
      setSelectedName(currentItem.name);
    }
  }, [value, currentItem]);

  const prevCountryIdRef = useRef(countryId);

  // Reset local items list whenever selected countryId changes
  useEffect(() => {
    if (prevCountryIdRef.current !== countryId) {
      resetState();
      setSelectedName(""); // Clear selected name on country change
      prevCountryIdRef.current = countryId;
    }
  }, [countryId, resetState]);

  return (
    <SearchDropdown
      label={label}
      required={required}
      items={accumulatedItems}
      value={value}
      onChange={onChange}
      getValue={(s) => s.id}
      getLabel={(s) => s.name}
      searchMode="server"
      onSearch={handleSearch}
      searchPlaceHolder={searchPlaceHolder}
      placeholder={placeholder}
      isLoading={isLoading}
      hasMore={meta ? meta.page < meta.totalPages : false}
      onLoadMore={handleLoadMore}
      error={error}
      disabled={disabled || !countryId}
      selectedLabel={selectedName}
    />
  );
};

export default StateSingleSelect;
