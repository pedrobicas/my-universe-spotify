import React, { useState } from 'react'
import { 
  Edit3,
  Trash2,
  Share2,
  Music, 
  Users, 
  Clock,
  Lock,
  Globe
} from 'lucide-react'
import Card from './Card'

const PlaylistCard = ({ 
  playlist, 
  onEdit, 
  onDelete, 
  onShare, 
  onSelect
}) => {
  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit?.(playlist)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    
    // Confirmação mais elegante
    if (window.confirm(`Tem certeza que deseja excluir a playlist "${playlist.name}"?\n\nEsta ação não pode ser desfeita.`)) {
      onDelete?.(playlist.id)
    }
  }

  const handleShare = (e) => {
    e.stopPropagation()
    onShare?.(playlist)
  }

  const formatDuration = (ms) => {
    if (!ms) return '0m'
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(minutes / 60)
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`
  }

  const getTotalDuration = () => {
    if (!playlist.tracks?.items) return '0m'
    
    const totalMs = playlist.tracks.items.reduce((acc, item) => {
      // Verificar diferentes estruturas possíveis
      const duration = item.track?.duration_ms || 
                      item.duration_ms || 
                      item.duration || 
                      0
      return acc + duration
    }, 0)
    
    return formatDuration(totalMs)
  }

  return (
    <Card 
      className="group cursor-pointer overflow-hidden"
      onClick={() => onSelect?.(playlist)}
      hover={true}
    >
      {/* Imagem da Playlist */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl">
        <img
          src={playlist.images?.[0]?.url || '/default-playlist.jpg'}
          alt={playlist.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Badge de tipo */}
        <div className={`absolute top-4 right-4 px-4 py-2 rounded-2xl text-xs font-medium backdrop-blur-md border ${
          playlist.public 
            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
            : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        }`}>
          {playlist.public ? (
            <div className="flex items-center space-x-2">
              <Globe className="w-3 h-3" />
              <span>Pública</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Lock className="w-3 h-3" />
              <span>Privada</span>
            </div>
          )}
        </div>

        {/* Indicador de colaboração */}
        {playlist.collaborative && (
          <div className="absolute top-4 left-4 px-4 py-2 rounded-2xl text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <Users className="w-3 h-3" />
              <span>Colaborativa</span>
            </div>
          </div>
        )}
      </div>

      {/* Informações da Playlist */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white text-lg leading-tight line-clamp-2 group-hover:text-green-400 transition-colors duration-300">
          {playlist.name}
        </h3>
        
        {playlist.description && (
          <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
            {playlist.description}
          </p>
        )}

        {/* Estatísticas */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <Music className="w-4 h-4" />
            <span>{playlist.tracks?.total || 0} tracks</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{getTotalDuration()}</span>
          </div>
        </div>

        {/* Owner e seguidores */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center space-x-3">
            {playlist.owner?.images?.[0]?.url && (
              <img
                src={playlist.owner.images[0].url}
                alt={playlist.owner.display_name || 'Owner'}
                className="w-7 h-7 rounded-full border-2 border-white/20"
              />
            )}
            <span className="text-gray-400 text-sm truncate">
              {playlist.owner?.display_name || 'Unknown'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span className="text-gray-400 text-sm">
              {playlist.followers?.total || 0}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex space-x-3">
            {/* Botão de Editar */}
            <button 
              onClick={handleEdit}
              className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-transparent hover:border-white/20"
              title="Editar playlist"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            
            {/* Botão de Compartilhar */}
            <button 
              onClick={handleShare}
              className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-transparent hover:border-white/20"
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Botão de Excluir */}
          <button 
            onClick={handleDelete}
            className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-transparent hover:border-red-500/20"
            title="Excluir playlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  )
}

export default PlaylistCard

