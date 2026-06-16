import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  PaginationState,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { useModels, useDeleteModel, useWorldCities } from './modelsHooks';
import { RBCModel, FilterParams } from './mockDb';
import { useAppAbility } from '../../context/AbilityContext';
import Button from '../../components/Button';
import SearchDropdown from '../../components/SearchDropdown';
import NestedDrawer from '../../components/NestedDrawer';
import ModelForm from './ModelForm';
import Pagination from '../../components/Pagination';

const columnHelper = createColumnHelper<RBCModel>();

export const ModelList: React.FC = () => {
  const ability = useAppAbility();
  const deleteMutation = useDeleteModel();
  const navigate = useNavigate();

  // Filters State
  const [filters, setFilters] = useState<FilterParams>({
    search: '',
    minAge: 18,
    maxAge: 60,
    minHeight: 150,
    maxHeight: 220,
    gender: '',
    status: '',
    category: '',
    country: '',
    state: '',
    city: ''
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });

  const handlePaginationChange = (updater: React.SetStateAction<PaginationState>) => {
    setPagination(prev => {
      const next = typeof updater === 'function' ? (updater as Function)(prev) : updater;
      if (next.pageIndex === prev.pageIndex && next.pageSize === prev.pageSize) {
        return prev;
      }
      return next;
    });
  };

  // Querying models (filtered list for table)
  const { data: models = [], isLoading } = useModels(filters);

  // Fetch full model roster for extracting distinct country/city filters
  const { data: allModels = [] } = useModels();
  const { data: worldCities = [] } = useWorldCities();

  const countries = React.useMemo(() => {
    return Array.from(new Set(worldCities.map(c => c.country))).sort();
  }, [worldCities]);

  const states = React.useMemo(() => {
    if (!filters.country) return [];
    return Array.from(
      new Set(
        worldCities
          .filter(c => c.country === filters.country && c.subcountry)
          .map(c => c.subcountry)
      )
    ).sort();
  }, [worldCities, filters.country]);

  const cities = React.useMemo(() => {
    if (filters.state) {
      return Array.from(
        new Set(
          worldCities
            .filter(c => c.subcountry === filters.state && c.country === filters.country)
            .map(c => c.name)
        )
      ).sort();
    }
    return Array.from(new Set(allModels.map(m => m.city).filter(Boolean))).sort();
  }, [worldCities, filters.state, filters.country, allModels]);

  const updateFilter = (updater: (prev: FilterParams) => FilterParams) => {
    setFilters(prev => {
      const next = updater(prev);
      if (next.country !== prev.country) {
        return { ...next, state: '', city: '' };
      }
      if (next.state !== prev.state) {
        return { ...next, city: '' };
      }
      return next;
    });
    handlePaginationChange(p => ({ ...p, pageIndex: 0 }));
  };

  // Drawer Form State
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleResetFilters = () => {
    updateFilter(() => ({
      search: '',
      minAge: 18,
      maxAge: 60,
      minHeight: 150,
      maxHeight: 220,
      gender: '',
      status: '',
      category: '',
      country: '',
      state: '',
      city: ''
    }));
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the profile of ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenDetails = (model: RBCModel) => {
    navigate(`/models/${model.id}`);
  };

  const handleOpenEditDirect = (model: RBCModel) => {
    setEditingModelId(model.id);
    setIsFormOpen(true);
  };

  const handleOpenAddDirect = () => {
    setEditingModelId(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingModelId(null);
  };

  // Table Columns Definition
  const columns = [
    columnHelper.accessor('name', {
      header: 'Model',
      cell: info => {
        const model = info.row.original;
        return (
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleOpenDetails(model)}>
            <img
              src={model.imageUrl}
              alt={model.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-navy-border shrink-0 shadow-sm"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-accent-600 transition-colors truncate">
                {model.name}
              </span>
              <span className="text-[10px] text-slate-405 dark:text-slate-500 truncate font-medium">{model.email}</span>
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor('gender', {
      header: 'Gender',
      cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue()}</span>
    }),
    columnHelper.accessor('age', {
      header: 'Age',
      cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{info.getValue()} yrs</span>
    }),
    columnHelper.accessor('height', {
      header: 'Height',
      cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{info.getValue()} cm</span>
    }),
    columnHelper.accessor('weight', {
      header: 'Weight',
      cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue()} kg</span>
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: info => (
        <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-border rounded-md">
          {info.getValue()}
        </span>
      )
    }),
    columnHelper.accessor('country', {
      header: 'Country',
      cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue()}</span>
    }),
    columnHelper.accessor('state', {
      header: 'State',
      cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue()}</span>
    }),
    columnHelper.accessor('city', {
      header: 'City',
      cell: info => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{info.getValue()}</span>
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const val = info.getValue();
        return (
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              val === 'Active'
                ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30'
                : val === 'On-Leave'
                ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30'
                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-405 border border-slate-200 dark:border-slate-800/30'
            }`}
          >
            {val}
          </span>
        );
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => {
        const model = info.row.original;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleOpenDetails(model)}
              title="View Profile"
              className="p-1.5 rounded bg-slate-100 dark:bg-[#0f1422] hover:bg-slate-205 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors border border-slate-200 dark:border-navy-border cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            {ability.can('update', 'Model') && (
              <button
                onClick={() => handleOpenEditDirect(model)}
                title="Edit Details"
                className="p-1.5 rounded bg-slate-100 dark:bg-[#0f1422] hover:bg-accent-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-400 transition-colors border border-slate-200 dark:border-navy-border cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {ability.can('delete', 'Model') && (
              <button
                onClick={() => handleDelete(model.id, model.name)}
                title="Delete Profile"
                className="p-1.5 rounded bg-slate-100 dark:bg-[#0f1422] hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-650 dark:text-slate-350 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-navy-border cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        );
      }
    })
  ];

  // TanStack Table Instance
  const table = useReactTable({
    data: models,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false
  });

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Search and Filters Header Card */}
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-border pb-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Smart Filtering</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Search and segment the roster in real-time</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64 md:w-72">
              <input
                type="text"
                placeholder="Search name or email..."
                value={filters.search}
                onChange={e => updateFilter(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-navy-border rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20 outline-none transition-all"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {ability.can('create', 'Model') && (
              <Button
                onClick={handleOpenAddDirect}
                variant="primary"
                size="sm"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Add Model
              </Button>
            )}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

          <SearchDropdown
            label="Gender"
            value={filters.gender || ''}
            onChange={val => updateFilter(prev => ({ ...prev, gender: val }))}
            options={[
              { value: '', label: 'All Genders' },
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Non-Binary', label: 'Non-Binary' }
            ]}
          />

          <SearchDropdown
            label="Category"
            value={filters.category || ''}
            onChange={val => updateFilter(prev => ({ ...prev, category: val }))}
            options={[
              { value: '', label: 'All Categories' },
              { value: 'Fashion', label: 'Fashion' },
              { value: 'Commercial', label: 'Commercial' },
              { value: 'Runway', label: 'Runway' },
              { value: 'Fitness', label: 'Fitness' }
            ]}
          />

          <SearchDropdown
            label="Status"
            value={filters.status || ''}
            onChange={val => updateFilter(prev => ({ ...prev, status: val }))}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
              { value: 'On-Leave', label: 'On-Leave' }
            ]}
          />

          <SearchDropdown
            label="Country"
            value={filters.country || ''}
            onChange={val => updateFilter(prev => ({ ...prev, country: val }))}
            options={[
              { value: '', label: 'All Countries' },
              ...countries.map(c => ({ value: c, label: c }))
            ]}
          />

          <SearchDropdown
            label="State"
            value={filters.state || ''}
            onChange={val => updateFilter(prev => ({ ...prev, state: val }))}
            options={[
              { value: '', label: 'All States' },
              ...states.map(s => ({ value: s, label: s }))
            ]}
            placeholder="Select State"
            className={!filters.country ? 'opacity-65 pointer-events-none' : ''}
          />

          <SearchDropdown
            label="City"
            value={filters.city || ''}
            onChange={val => updateFilter(prev => ({ ...prev, city: val }))}
            options={[
              { value: '', label: 'All Cities' },
              ...cities.map(c => ({ value: c, label: c }))
            ]}
            placeholder="Select City"
            className={!filters.state ? 'opacity-65 pointer-events-none' : ''}
          />
        </div>

        {/* Range sliders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-slate-100 dark:border-navy-border pt-4">
          {/* Age range */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Age Range</span>
              <span className="text-accent-600 dark:text-accent-400 font-bold">{filters.minAge} - {filters.maxAge} yrs</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="18"
                max="60"
                value={filters.minAge}
                onChange={e => updateFilter(prev => ({ ...prev, minAge: Number(e.target.value) }))}
                className="w-full"
              />
              <input
                type="range"
                min="18"
                max="60"
                value={filters.maxAge}
                onChange={e => updateFilter(prev => ({ ...prev, maxAge: Math.max(Number(e.target.value), prev.minAge || 18) }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Height range */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Height Range</span>
              <span className="text-accent-600 dark:text-accent-400 font-bold">{filters.minHeight} - {filters.maxHeight} cm</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="140"
                max="230"
                value={filters.minHeight}
                onChange={e => updateFilter(prev => ({ ...prev, minHeight: Number(e.target.value) }))}
                className="w-full"
              />
              <input
                type="range"
                min="140"
                max="230"
                value={filters.maxHeight}
                onChange={e => updateFilter(prev => ({ ...prev, maxHeight: Math.max(Number(e.target.value), prev.minHeight || 140) }))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="flex justify-end border-t border-slate-100 dark:border-navy-border pt-3">
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* TanStack Table Container */}
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col items-center gap-3">
            <svg className="animate-spin w-8 h-8 text-accent-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Retrieving talent profiles...</span>
          </div>
        ) : models.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[1150px]">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="border-b border-slate-200 dark:border-navy-border bg-slate-50 dark:bg-navy-950/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="py-4 px-6 select-none font-bold">
                        {header.isPlaceholder ? null : (
                          <div
                            onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                            className={`flex items-center gap-1.5 ${header.column.getCanSort() ? 'cursor-pointer hover:text-slate-900 dark:hover:text-slate-200' : ''}`}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === 'asc' && ' ↑'}
                            {header.column.getIsSorted() === 'desc' && ' ↓'}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-border text-slate-700 dark:text-slate-300">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-4 px-6">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
            No talent matching the active filters was found
          </div>
        )}
        <Pagination
          pageIndex={table.getState().pagination.pageIndex}
          pageCount={table.getPageCount()}
          pageSize={table.getState().pagination.pageSize}
          totalRows={models.length}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          onFirstPage={() => table.setPageIndex(0)}
          onPreviousPage={() => table.previousPage()}
          onNextPage={() => table.nextPage()}
          onLastPage={() => table.setPageIndex(table.getPageCount() - 1)}
          onPageSizeChange={size => { handlePaginationChange(p => ({ ...p, pageSize: size, pageIndex: 0 })); }}
          onPageChange={index => handlePaginationChange(p => ({ ...p, pageIndex: index }))}
        />
      </div>

      {/* Drawer: Add Form (Direct Edit) */}
      <NestedDrawer
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingModelId(null);
        }}
        title={editingModelId ? 'Edit Model Profile' : 'Register New Talent'}
        stackIndex={0}
        size="lg"
      >
        <ModelForm
          modelId={editingModelId || undefined}
          initialValues={editingModelId ? models.find(m => m.id === editingModelId) : undefined}
          onSuccess={handleFormSuccess}
        />
      </NestedDrawer>
    </div>
  );
};

export default ModelList;
