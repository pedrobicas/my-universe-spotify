import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  X, 
  Music, 
  Users, 
  Clock, 
  Star,
  TrendingUp,
  Calendar,
  Heart,
  Globe,
  Lock,
  ChevronDown,
  Sliders
} from 'lucide-react'

const PlaylistFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFiltersChange,
  onClearFilters 
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearAllFilters = () => {
    onSearchChange('')
    onFiltersChange({
      type: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
      minTracks: '',
      maxTracks: '',
      dateRange: 'all',
      collaborative: 'all',
      liked: 'all'
    })
  }

  const hasActiveFilters = searchTerm || 
    filters.type !== 'all' || 
    filters.sortBy !== 'name' || 
    filters.sortOrder !== 'asc' ||
    filters.minTracks || 
    filters.maxTracks || 
    filters.dateRange !== 'all' ||
    filters.collaborative !== 'all' ||
    filters.liked !== 'all'

  const CustomSelect = ({ value, onChange, options, placeholder, icon: Icon, className = '' }) => (
    <div className={`relative group ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className="appearance-none w-full px-4 py-3 pl-12 pr-10 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm text-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-900 text-white">
            {option.label}
          </option>
        ))}
      </select>
      
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-300 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      )}
      
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
        <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Busca Principal */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-300 transition-colors w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar playlists por nome, descrição ou artista..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-16 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm text-lg transition-all duration-300 hover:bg-white/10 hover:border-white/20"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtros Básicos */}
      <div className="flex flex-wrap gap-4">
        {/* Tipo de Playlist */}
        <CustomSelect
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          options={[
            { value: 'all', label: 'Todas as Playlists' },
            { value: 'public', label: 'Públicas' },
            { value: 'private', label: 'Privadas' },
            { value: 'collaborative', label: 'Colaborativas' }
          ]}
          icon={Globe}
          className="min-w-[200px]"
        />

        {/* Ordenação */}
        <CustomSelect
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          options={[
            { value: 'name', label: 'Nome' },
            { value: 'tracks', label: 'Número de Tracks' },
            { value: 'recent', label: 'Data de Criação' },
            { value: 'updated', label: 'Última Atualização' },
            { value: 'followers', label: 'Seguidores' },
            { value: 'duration', label: 'Duração Total' }
          ]}
          icon={TrendingUp}
          className="min-w-[200px]"
        />

        {/* Ordem */}
        <CustomSelect
          value={filters.sortOrder}
          onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          options={[
            { value: 'asc', label: 'Crescente' },
            { value: 'desc', label: 'Decrescente' }
          ]}
          icon={Clock}
          className="min-w-[160px]"
        />

        {/* Botão de Filtros Avançados */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-6 py-3 rounded-2xl transition-all duration-300 flex items-center space-x-3 font-medium ${
            showAdvancedFilters 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-lg shadow-green-500/10' 
              : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20'
          } backdrop-blur-sm`}
        >
          <Sliders className={`w-4 h-4 transition-transform duration-300 ${showAdvancedFilters ? 'rotate-90' : ''}`} />
          <span>Filtros Avançados</span>
        </button>

        {/* Limpar Filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-2xl transition-all duration-300 border border-red-500/20 hover:border-red-500/40 backdrop-blur-sm font-medium flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>

      {/* Filtros Avançados */}
      {showAdvancedFilters && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-8 animate-in slide-in-from-top-2 duration-300">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-3">
            <Filter className="w-6 h-6 text-green-400" />
            <span>Filtros Avançados</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Número de Tracks */}
            <div className="space-y-4">
              <label className="block text-gray-300 text-sm font-medium">
                Número de Tracks
              </label>
              <div className="flex space-x-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minTracks}
                  onChange={(e) => handleFilterChange('minTracks', e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                />
                <span className="text-gray-400 self-center text-lg">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxTracks}
                  onChange={(e) => handleFilterChange('maxTracks', e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                />
              </div>
            </div>

            {/* Faixa de Data */}
            <div className="space-y-4">
              <label className="block text-gray-300 text-sm font-medium">
                Período de Criação
              </label>
              <CustomSelect
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                options={[
                  { value: 'all', label: 'Qualquer período' },
                  { value: 'today', label: 'Hoje' },
                  { value: 'week', label: 'Esta semana' },
                  { value: 'month', label: 'Este mês' },
                  { value: 'year', label: 'Este ano' },
                  { value: 'custom', label: 'Personalizado' }
                ]}
                icon={Calendar}
              />
            </div>

            {/* Tipo de Colaboração */}
            <div className="space-y-4">
              <label className="block text-gray-300 text-sm font-medium">
                Tipo de Colaboração
              </label>
              <CustomSelect
                value={filters.collaborative}
                onChange={(e) => handleFilterChange('collaborative', e.target.value)}
                options={[
                  { value: 'all', label: 'Todas' },
                  { value: 'true', label: 'Colaborativas' },
                  { value: 'false', label: 'Não colaborativas' }
                ]}
                icon={Users}
              />
            </div>

            {/* Status de Like */}
            <div className="space-y-4">
              <label className="block text-gray-300 text-sm font-medium">
                Status de Like
              </label>
              <CustomSelect
                value={filters.liked}
                onChange={(e) => handleFilterChange('liked', e.target.value)}
                options={[
                  { value: 'all', label: 'Todas' },
                  { value: 'true', label: 'Curtidas' },
                  { value: 'false', label: 'Não curtidas' }
                ]}
                icon={Heart}
              />
            </div>

            {/* Duração */}
            <div className="space-y-4">
              <label className="block text-gray-300 text-sm font-medium">
                Duração Total
              </label>
              <CustomSelect
                value={filters.duration}
                onChange={(e) => handleFilterChange('duration', e.target.value)}
                options={[
                  { value: 'all', label: 'Qualquer duração' },
                  { value: 'short', label: 'Curta (< 30 min)' },
                  { value: 'medium', label: 'Média (30 min - 2h)' },
                  { value: 'long', label: 'Longa (> 2h)' }
                ]}
                icon={Clock}
              />
            </div>

            {/* Popularidade */}
            <div className="space-y-4">
              <label className="block text-gray-300 text-sm font-medium">
                Popularidade
              </label>
              <CustomSelect
                value={filters.popularity}
                onChange={(e) => handleFilterChange('popularity', e.target.value)}
                options={[
                  { value: 'all', label: 'Qualquer popularidade' },
                  { value: 'high', label: 'Alta (> 100 seguidores)' },
                  { value: 'medium', label: 'Média (10-100 seguidores)' },
                  { value: 'low', label: 'Baixa (< 10 seguidores)' }
                ]}
                icon={Star}
              />
            </div>
          </div>

          {/* Tags de Filtros Ativos */}
          {hasActiveFilters && (
            <div className="pt-6 border-t border-white/10">
              <h4 className="text-sm font-medium text-gray-300 mb-4">Filtros Ativos:</h4>
              <div className="flex flex-wrap gap-3">
                {searchTerm && (
                  <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-2xl text-sm border border-green-500/30 backdrop-blur-sm">
                    Busca: "{searchTerm}"
                  </span>
                )}
                {filters.type !== 'all' && (
                  <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-2xl text-sm border border-blue-500/30 backdrop-blur-sm">
                    Tipo: {filters.type === 'public' ? 'Públicas' : filters.type === 'private' ? 'Privadas' : 'Colaborativas'}
                  </span>
                )}
                {filters.minTracks && (
                  <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-2xl text-sm border border-purple-500/30 backdrop-blur-sm">
                    Min tracks: {filters.minTracks}
                  </span>
                )}
                {filters.maxTracks && (
                  <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-2xl text-sm border border-purple-500/30 backdrop-blur-sm">
                    Max tracks: {filters.maxTracks}
                  </span>
                )}
                {filters.dateRange !== 'all' && (
                  <span className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-2xl text-sm border border-orange-500/30 backdrop-blur-sm">
                    Período: {filters.dateRange}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PlaylistFilters
