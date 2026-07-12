import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';
import { useGetModelsQuery, useDeleteModelMutation } from '../../redux/services/models';
import { useGetCountriesQuery, useGetStatesQuery, useGetCitiesQuery } from '../../redux/services/global';
import { selectCountriesData, selectStatesData, selectCitiesData } from '../../redux/selectors/global';
import { modelsSelectors, selectModelsMeta } from '../../redux/selectors/models';
import { useAppSelector } from '../../redux/hooks';
import { RootState } from '../../redux/store';
import { useAppAbility } from '../../context/AbilityContext';
import Button from '../../components/ui/Button';
import SearchDropdown from '../../components/ui/SearchDropdown';
import { DataTable } from '../../components/ui/data-table';
import { getModelColumns } from './components/table-column/columns';
import { Search, Plus } from 'lucide-react';
import { PaginationQuery } from '../../interface/common';
import { IModel } from '../../interface/model';
import { formatInchesToFeetInches } from '../../utils/helperfunction';
import { useConfirmDelete } from '../../utils/useConfirmDelete';

export const ModelList: React.FC = () => {
  const ability = useAppAbility();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    modelType: '',
  });

  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const [ageRange, setAgeRange] = useState<[number, number]>([0, 60]);
  const [heightRange, setHeightRange] = useState<[number, number]>([0, 120]); // Default 0 to 120 inches (0 to 10 ft)
  const [isAgeFiltered, setIsAgeFiltered] = useState(false);
  const [isHeightFiltered, setIsHeightFiltered] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>(`pageIndex` in { pageIndex: 0 } ? { pageIndex: 0, pageSize: 5 } : { pageIndex: 0, pageSize: 5 });

  const query: PaginationQuery = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      orderBy: sorting[0]?.id || undefined,
      order: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
      search: search || undefined,
      gender: filters.gender || undefined,
      modelType: filters.modelType || undefined,
      country: selectedCountry || undefined,
      state: selectedState || undefined,
      city: selectedCity || undefined,
      minAge: isAgeFiltered ? ageRange[0] : undefined,
      maxAge: isAgeFiltered ? ageRange[1] : undefined,
      minHeight: isHeightFiltered ? Math.round(heightRange[0] * 2.54) : undefined,
      maxHeight: isHeightFiltered ? Math.round(heightRange[1] * 2.54) : undefined,
    }),
    [pagination.pageIndex, pagination.pageSize, sorting, search, filters, selectedCountry, selectedState, selectedCity, ageRange, heightRange, isAgeFiltered, isHeightFiltered]
  );

  const { isFetching, isLoading } = useGetModelsQuery(query);
  const [deleteModel] = useDeleteModelMutation();
  const { confirmDelete } = useConfirmDelete<any>(async (item) => {
    await deleteModel(item.id).unwrap();
  });

  const { selectAll: selectAllModels } = modelsSelectors(query);
  const modelsList = useAppSelector((state: RootState) => selectAllModels(state));
  const meta = useAppSelector(selectModelsMeta(query));

  // Dynamic Location Dropdowns
  const countriesQuery = useMemo(() => ({ limit: 100 }), []);
  useGetCountriesQuery(countriesQuery);
  const countriesList = useAppSelector(selectCountriesData(countriesQuery));

  const statesQuery = useMemo(() => ({ country: selectedCountry, limit: 100 }), [selectedCountry]);
  useGetStatesQuery(statesQuery, { skip: !selectedCountry });
  const statesList = useAppSelector(selectStatesData(statesQuery));

  const citiesQuery = useMemo(() => ({ state: selectedState, limit: 100 }), [selectedState]);
  useGetCitiesQuery(citiesQuery, { skip: !selectedState });
  const citiesList = useAppSelector(selectCitiesData(citiesQuery));

  useEffect(() => {
    if (meta?.limit) {
      setPagination(prev => ({
        ...prev,
        pageSize: meta.limit,
      }));
    }
  }, [meta?.limit]);

  const handleResetFilters = () => {
    setSearch('');
    setFilters({
      gender: '',
      modelType: '',
    });
    setSelectedCountry('');
    setSelectedState('');
    setSelectedCity('');
    setAgeRange([0, 60]);
    setHeightRange([0, 120]);
    setIsAgeFiltered(false);
    setIsHeightFiltered(false);
  };

  const handleDelete = useCallback((id: string, name: string) => {
    confirmDelete({ id }, `the profile of ${name}`);
  }, [confirmDelete]);

  const handleOpenDetails = useCallback((model: IModel) => {
    navigate(`/models/${model.id}`);
  }, [navigate]);

  const handleOpenEditDirect = useCallback((model: IModel) => {
    navigate(`/models/${model.id}/edit`);
  }, [navigate]);

  const handleOpenAddDirect = () => {
    navigate('/models/new');
  };

  // Table Columns Definition
  const columns = useMemo(() => getModelColumns({
    onOpenDetails: handleOpenDetails,
    onOpenEdit: handleOpenEditDirect,
    onDelete: handleDelete,
    ability
  }), [ability, handleOpenDetails, handleOpenEditDirect, handleDelete]);

  // TanStack Table Instance
  const table = useReactTable({
    data: modelsList as any[],
    columns,
    pageCount: meta?.totalPages || 0,
    manualPagination: true,
    manualSorting: true,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Search and Filters Header Card */}
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-border pb-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Smart Filtering</h2>
            <p className="text-xs text-slate-405 dark:text-slate-500">Search and segment models in real-time</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64 md:w-72">
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <SearchDropdown
            label="Gender"
            value={filters.gender}
            onChange={val => { setFilters(prev => ({ ...prev, gender: val })); setPagination(p => ({ ...p, pageIndex: 0 })); }}
            options={[
              { value: '', label: 'All Genders' },
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' }
            ]}
          />

          <SearchDropdown
            label="Model Type"
            value={filters.modelType}
            onChange={val => { setFilters(prev => ({ ...prev, modelType: val })); setPagination(p => ({ ...p, pageIndex: 0 })); }}
            options={[
              { value: '', label: 'All Model Types' },
              { value: 'Fresher', label: 'Fresher' },
              { value: 'Experienced', label: 'Experienced' },
              { value: 'Professional', label: 'Professional' },
              { value: 'Influencer', label: 'Influencer' }
            ]}
          />

          <SearchDropdown
            label="Country"
            value={selectedCountry}
            onChange={val => {
              setSelectedCountry(val);
              setSelectedState('');
              setSelectedCity('');
            }}
            options={[
              { value: '', label: 'All Countries' },
              ...countriesList.map(c => ({ value: c.id, label: c.name }))
            ]}
          />

          <SearchDropdown
            label="State"
            value={selectedState}
            onChange={val => {
              setSelectedState(val);
              setSelectedCity('');
            }}
            options={[
              { value: '', label: 'All States' },
              ...statesList.map(s => ({ value: s.id, label: s.name }))
            ]}
            placeholder="Select State"
            className={!selectedCountry ? 'opacity-65 pointer-events-none' : ''}
          />

          <SearchDropdown
            label="City"
            value={selectedCity}
            onChange={setSelectedCity}
            options={[
              { value: '', label: 'All Cities' },
              ...citiesList.map(c => ({ value: c.id, label: c.name }))
            ]}
            placeholder="Select City"
            className={!selectedState ? 'opacity-65 pointer-events-none' : ''}
          />
        </div>

        {/* Range Sliders Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-slate-100 dark:border-navy-border pt-4">
          {/* Age range */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Age Range</span>
              <span className="text-accent-600 dark:text-accent-400 font-bold">{ageRange[0]} - {ageRange[1]} yrs</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="60"
                value={ageRange[0]}
                onChange={e => {
                  const val = Number(e.target.value);
                  setAgeRange([val, ageRange[1]]);
                  setIsAgeFiltered(true);
                  setPagination(p => ({ ...p, pageIndex: 0 }));
                }}
                className="w-full bg-slate-200 dark:bg-navy-950 accent-accent-500 rounded-lg cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="60"
                value={ageRange[1]}
                onChange={e => {
                  const val = Math.max(Number(e.target.value), ageRange[0]);
                  setAgeRange([ageRange[0], val]);
                  setIsAgeFiltered(true);
                  setPagination(p => ({ ...p, pageIndex: 0 }));
                }}
                className="w-full bg-slate-200 dark:bg-navy-950 accent-accent-500 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Height range */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Height Range</span>
              <span className="text-accent-600 dark:text-accent-400 font-bold">
                {formatInchesToFeetInches(heightRange[0])} - {formatInchesToFeetInches(heightRange[1])}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="120"
                value={heightRange[0]}
                onChange={e => {
                  const val = Number(e.target.value);
                  setHeightRange([val, heightRange[1]]);
                  setIsHeightFiltered(true);
                  setPagination(p => ({ ...p, pageIndex: 0 }));
                }}
                className="w-full bg-slate-200 dark:bg-navy-950 accent-accent-500 rounded-lg cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="120"
                value={heightRange[1]}
                onChange={e => {
                  const val = Math.max(Number(e.target.value), heightRange[0]);
                  setHeightRange([heightRange[0], val]);
                  setIsHeightFiltered(true);
                  setPagination(p => ({ ...p, pageIndex: 0 }));
                }}
                className="w-full bg-slate-200 dark:bg-navy-950 accent-accent-500 rounded-lg cursor-pointer"
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
        isLoading={isLoading || isFetching}
        noResultMessage="No talent matching the active filters was found"
        minHeight="350px"
      />
    </div>
  );
};

export default ModelList;
