import React, { useMemo, useState } from "react";
import SearchDropdown from "./SearchDropdown";
import { useAppSelector } from "../../redux/hooks";
import { useInfiniteSelectSingle } from "../../utils/useInfiniteSelectSingle";
import { RoleEntityResponse } from "../../interface/role";
import { useGetRolesQuery } from "../../redux/services/roles";
import { selectCurrentPageRoles, selectRolesMeta } from "../../redux/selectors/roles";

interface RoleSingleSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceHolder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  limit?: number;
  disabled?: boolean;
}

const RoleSingleSelect: React.FC<RoleSingleSelectProps> = ({
  label = "Role",
  placeholder = "Select role",
  searchPlaceHolder = "Search role...",
  value,
  onChange,
  error,
  helperText,
  limit = 15,
  disabled = false,
}) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const query = useMemo(
    () => ({
      page,
      limit,
      search: searchTerm || undefined,
    }),
    [page, limit, searchTerm],
  );

  const { isFetching: isLoading } = useGetRolesQuery(query);
  const currentPageItems = useAppSelector(selectCurrentPageRoles(query));
  const meta = useAppSelector(selectRolesMeta(query));

  const { accumulatedItems, handleLoadMore, handleSearch } =
    useInfiniteSelectSingle({
      currentPageItems,
      page,
      searchTerm,
      isLoading,
      hasMore: meta ? meta.page < meta.totalPages : false,
      meta,
      getId: (role: RoleEntityResponse) => role.id,
      entityName: "role",
      onPageChange: setPage,
      onSearchChange: setSearchTerm,
    });

  return (
    <SearchDropdown
      label={label}
      items={accumulatedItems}
      value={value}
      onChange={onChange}
      getValue={(role) => role.id}
      getLabel={(role) => role.name}
      searchMode="server"
      onSearch={handleSearch}
      searchPlaceHolder={searchPlaceHolder}
      placeholder={placeholder}
      isLoading={isLoading}
      hasMore={meta ? meta.page < meta.totalPages : false}
      onLoadMore={handleLoadMore}
      error={error ? helperText || "Error" : undefined}
      disabled={disabled}
    />
  );
};

export default RoleSingleSelect;
