'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, House, TrendUp, UsersThree, List, GridFour, MagnifyingGlass, X, FolderOpen, CheckCircle, CircleHalf } from '@phosphor-icons/react/dist/ssr';
import { formatMontant } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectOption } from '@/components/ui/select';
import { PropertyCard } from '@/components/logements/PropertyCard';
import { PropertyRow } from '@/components/logements/PropertyRow';
import { cn } from '@/lib/utils';
import { Logement } from '@/lib/types';

type ViewMode = 'grid' | 'list';
type SortBy = 'nom' | 'loyer' | 'surface';

interface FiltersState {
  search: string;
  immeuble: string;
  statut: '' | 'occupe' | 'vacant';
  amenities: string[];
}

export default function LogementsPage() {
  const [logements, setLogements] = useState<Logement[]>([]);
  const [immeubles, setImmeubles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('nom');
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    immeuble: '',
    statut: '',
    amenities: [],
  });
  const [error, setError] = useState('');

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch immeubles
        const immeublesRes = await fetch('/api/immeubles?limit=100');
        if (immeublesRes.ok) {
          const immeublesData = await immeublesRes.json();
          setImmeubles(immeublesData.immeubles || []);
        }

        // Fetch logements with filters
        const params = new URLSearchParams();
        if (filters.immeuble) params.append('immeuble_id', filters.immeuble);
        if (filters.statut) params.append('statut', filters.statut);
        if (filters.amenities.length > 0) {
          params.append('amenities', JSON.stringify(filters.amenities));
        }

        const logementsRes = await fetch(`/api/logements?${params.toString()}`);
        if (logementsRes.ok) {
          const logementsData = await logementsRes.json();
          setLogements(logementsData.logements || []);
        }

        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des logements');
        setLoading(false);
      }
    }

    fetchData();
  }, [filters]);

  // Filter and sort logements
  const filteredLogements = logements
    .filter((l) => {
      // Search filter
      if (
        filters.search &&
        !l.nom?.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'nom') {
        return (a.nom || '').localeCompare(b.nom || '');
      }
      if (sortBy === 'loyer') {
        return a.loyer_mensuel - b.loyer_mensuel;
      }
      if (sortBy === 'surface') {
        return (a.surface_m2 || 0) - (b.surface_m2 || 0);
      }
      return 0;
    });

  const nbOccupes = filteredLogements.filter((l) => l.statut === 'occupe').length;
  const loyerTotal = filteredLogements.reduce((sum, l) => sum + l.loyer_mensuel, 0);

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
      {/* Action Button Only */}
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/logements/new">
            <Plus size={16} weight="bold" />
            Ajouter un logement
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
              <House size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total logements</p>
              <p className="text-lg font-semibold text-neutral-900">{filteredLogements.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-accent-50 p-2.5 text-accent-600">
              <UsersThree size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Occupés</p>
              <p className="text-lg font-semibold text-neutral-900">{nbOccupes}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-success-50 p-2.5 text-success-600">
              <TrendUp size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Loyer potentiel</p>
              <p className="text-lg font-semibold text-neutral-900">{formatMontant(loyerTotal)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Controls - Redesigned */}
      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="p-5 space-y-4">
          {/* Search Bar - Clean design */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm w-full">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Chercher par nom..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
              />
            </div>

            {/* View Mode Toggle - Redesigned */}
            <div className="flex items-center gap-1.5 bg-neutral-100 rounded-lg p-1.5 border border-neutral-200">
              <button
                onClick={() => setViewMode('grid')}
                title="Vue grille"
                className={cn(
                  'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                  viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-sm border border-neutral-200'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                <GridFour size={16} weight={viewMode === 'grid' ? 'fill' : 'regular'} />
                <span className="hidden sm:inline">Grille</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="Vue liste"
                className={cn(
                  'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                  viewMode === 'list'
                    ? 'bg-white text-primary-600 shadow-sm border border-neutral-200'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                <List size={16} weight={viewMode === 'list' ? 'fill' : 'regular'} />
                <span className="hidden sm:inline">Liste</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters - Custom Selects */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Immeuble Filter */}
            <Select
              value={filters.immeuble}
              onChange={(value) => setFilters({ ...filters, immeuble: value as string })}
              options={[
                { value: '', label: 'Tous les immeubles' },
                ...immeubles.map((i) => ({ value: i.id, label: i.nom, icon: <FolderOpen size={16} weight="fill" /> })),
              ]}
              label="Immeuble"
              clearable={Boolean(filters.immeuble)}
              icon={<FolderOpen size={16} />}
            />

            {/* Status Filter */}
            <Select
              value={filters.statut}
              onChange={(value) => setFilters({ ...filters, statut: value as any })}
              options={[
                { value: '', label: 'Tous les statuts' },
                { value: 'occupe', label: 'Occupé', icon: <CheckCircle size={16} weight="fill" /> },
                { value: 'vacant', label: 'Vacant', icon: <CircleHalf size={16} /> },
              ]}
              label="Statut"
              clearable={Boolean(filters.statut)}
            />

            {/* Sort Dropdown */}
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value as SortBy)}
              options={[
                { value: 'nom', label: 'Trier par nom' },
                { value: 'loyer', label: 'Loyer (croissant)' },
                { value: 'surface', label: 'Surface (croissante)' },
              ]}
              label="Trier par"
            />

            {/* Reset Button */}
            {(filters.search || filters.immeuble || filters.statut) && (
              <div className="flex flex-col justify-end">
                <button
                  onClick={() => setFilters({ search: '', immeuble: '', statut: '', amenities: [] })}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-200"
                  title="Réinitialiser les filtres"
                >
                  <X size={16} weight="bold" />
                  <span className="hidden sm:inline">Réinitialiser</span>
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-neutral-500">Chargement...</p>
        </div>
      ) : error ? (
        <Card className="border-danger-200 bg-danger-50">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-danger-700">{error}</p>
          </CardContent>
        </Card>
      ) : filteredLogements.length === 0 ? (
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-neutral-500">
              {filters.search || filters.immeuble || filters.statut
                ? 'Aucun logement ne correspond à vos critères.'
                : 'Aucun logement enregistré pour le moment.'}
            </p>
            {!filters.search && !filters.immeuble && !filters.statut && (
              <Link
                href="/logements/new"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 mt-2 inline-block"
              >
                Ajouter votre premier logement →
              </Link>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredLogements.map((logement) => (
            <PropertyCard
              key={logement.id}
              logement={logement}
              immeubleName={immeubles.find((i) => i.id === logement.immeuble_id)?.nom}
            />
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-3">
          {filteredLogements.map((logement) => (
            <PropertyRow
              key={logement.id}
              logement={logement}
              immeubleName={immeubles.find((i) => i.id === logement.immeuble_id)?.nom}
              onEdit={(id) => {
                // Handle edit if needed
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
