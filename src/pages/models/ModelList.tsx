import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';
import { useModels, useDeleteModel, useWorldCities } from './modelsHooks';
import { RBCModel, FilterParams } from './mockDb';
import { useAppAbility } from '../../context/AbilityContext';
import Button from '../../components/ui/Button';
import SearchDropdown from '../../components/ui/SearchDropdown';
import NestedDrawer from '../../components/ui/NestedDrawer';
import ModelForm from './components/ModelForm';
import { DataTable } from '../../components/ui/data-table';
import { getModelColumns } from './components/table-column/columns';
import { Search, Plus } from 'lucide-react';

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
  const columns = getModelColumns({
    onOpenDetails: handleOpenDetails,
    onOpenEdit: handleOpenEditDirect,
    onDelete: handleDelete,
    ability
  });

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
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
            
            {ability.can('create', 'models') && (
              <Button
                onClick={handleOpenAddDirect}
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
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
      <DataTable
        table={table}
        showPagination={true}
        isLoading={isLoading}
        noResultMessage="No talent matching the active filters was found"
        minHeight="350px"
      />

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
