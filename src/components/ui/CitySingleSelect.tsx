import React, { useMemo, useState, useEffect } from "react";
import SearchDropdown from "./SearchDropdown";
import { useInfiniteSelectSingle } from "../../utils/useInfiniteSelectSingle";
import { useAppSelector } from "../../redux/hooks";
import { selectCitiesData, selectCitiesMeta } from "../../redux/selectors/global";
import { useGetCitiesQuery } from "../../redux/services/global";

interface CitySingleSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceHolder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  limit?: number;
  disabled?: boolean;
  stateId: string;
  initialLabel?: string;
  required?: boolean;
}

export const CitySingleSelect: React.FC<CitySingleSelectProps> = ({
  label = "City",
  placeholder = "Select City",
  searchPlaceHolder = "Search city...",
  value,
  onChange,
  error,
  limit = 15,
  disabled = false,
  stateId,
  initialLabel = "",
  required = false,
}) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedName, setSelectedName] = useState(initialLabel);

  const query = useMemo(
    () => ({
      state: stateId,
      page,
      limit,
      search: searchTerm || undefined,
    }),
    [stateId, page, limit, searchTerm],
  );

  const { isFetching: isLoading } = useGetCitiesQuery(query, { skip: !stateId });
  const currentPageItems = useAppSelector(selectCitiesData(query));
  const meta = useAppSelector(selectCitiesMeta(query));

  const { accumulatedItems, handleLoadMore, handleSearch, resetState } =
    useInfiniteSelectSingle({
      currentPageItems,
      page,
      searchTerm,
      isLoading,
      hasMore: meta ? meta.page < meta.totalPages : false,
      meta,
      getId: (city: any) => city.id,
      entityName: "city",
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

  // Reset local items list whenever selected stateId changes
  useEffect(() => {
    resetState();
    setSelectedName(""); // Clear selected name on state change
  }, [stateId, resetState]);

  return (
    <SearchDropdown
      label={label}
      required={required}
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
      disabled={disabled || !stateId}
      selectedLabel={selectedName}
    />
  );
};

export default CitySingleSelect;
