'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface BirdData {
  id: string
  name: string
  currentLat: number
  currentLng: number
  currentLocation: string
  speciesEmoji: string
  activity?: string
  species: {
    name: string
  }
  userName?: string
}

interface MapData {
  myBird: BirdData
  friendBirds: BirdData[]
}

// 创建自定义鸟类图标
function createBirdIcon(emoji: string, isMyBird: boolean = false) {
  return L.divIcon({
    html: `<div class="bird-marker ${isMyBird ? 'my-bird' : ''}" style="font-size: ${isMyBird ? '2.5rem' : '2rem'}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${emoji}</div>`,
    className: 'bird-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

// 地图中心控制组件
function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 4)
  }, [center, map])
  return null
}

interface WorldMapProps {
  userId: string
}

export default function WorldMap({ userId }: WorldMapProps) {
  const [mapData, setMapData] = useState<MapData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBirds()
  }, [])

  const fetchBirds = async () => {
    try {
      const res = await fetch('/api/birds')
      if (res.ok) {
        const data = await res.json()
        setMapData(data)
      }
    } catch (error) {
      console.error('Failed to fetch birds:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !mapData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">加载鸟类位置...</div>
      </div>
    )
  }

  const center: [number, number] = [mapData.myBird.currentLat, mapData.myBird.currentLng]

  return (
    <MapContainer
      center={center}
      zoom={4}
      className="w-full h-full"
      style={{ minHeight: '500px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController center={center} />

      {/* 我的鸟 */}
      <Marker
        position={[mapData.myBird.currentLat, mapData.myBird.currentLng]}
        icon={createBirdIcon(mapData.myBird.speciesEmoji, true)}
      >
        <Popup>
          <div className="text-center p-2">
            <div className="text-3xl mb-2">{mapData.myBird.speciesEmoji}</div>
            <div className="font-bold text-gray-800">{mapData.myBird.name}</div>
            <div className="text-sm text-gray-600">{mapData.myBird.species.name}</div>
            <div className="text-sm text-primary-600 mt-1">
              {mapData.myBird.currentLocation}
            </div>
            {mapData.myBird.activity && (
              <div className="text-xs text-gray-500 mt-1">
                正在{mapData.myBird.activity}
              </div>
            )}
            <div className="text-xs text-primary-500 mt-2 font-medium">这是你的鸟</div>
          </div>
        </Popup>
      </Marker>

      {/* 好友的鸟 */}
      {mapData.friendBirds.map((bird) => (
        <Marker
          key={bird.id}
          position={[bird.currentLat, bird.currentLng]}
          icon={createBirdIcon(bird.speciesEmoji)}
        >
          <Popup>
            <div className="text-center p-2">
              <div className="text-3xl mb-2">{bird.speciesEmoji}</div>
              <div className="font-bold text-gray-800">{bird.name}</div>
              <div className="text-sm text-gray-600">{bird.species.name}</div>
              <div className="text-sm text-primary-600 mt-1">
                {bird.currentLocation}
              </div>
              {bird.userName && (
                <div className="text-xs text-gray-500 mt-2">
                  主人: {bird.userName}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
