'use client'

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { PlayCircle, Plus } from 'lucide-react'
import Image from 'next/image'

interface Movie {
  id: number
  title: string
  description: string
  year: number
  seasons?: number
  rating: number
  imageUrl: string
}

const featuredMovies: Movie[] = [
  {
    id: 1,
    title: 'LOST IN SPACE',
    description: 'After crash-landing on an alien planet, the Robinson family fight against all odds to survive and escape, but they\'re surrounded by hidden dangers.',
    year: 2018,
    seasons: 2,
    rating: 7.5,
    imageUrl: 'https://images.unsplash.com/photo-1581822261290-991b38693d1b?q=80&w=1920&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'STRANGER THINGS',
    description: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
    year: 2016,
    seasons: 4,
    rating: 8.7,
    imageUrl: 'https://images.unsplash.com/photo-1506512681167-c0c660bb362a?q=80&w=1920&auto=format&fit=crop'
  }
]

export function Hero() {
  return (
    <section className="relative">
      <Carousel className="w-full">
        <CarouselContent>
          {featuredMovies.map((movie) => (
            <CarouselItem key={movie.id}>
              <div className="relative h-[600px] w-full">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <div className="relative h-full w-full">
                    <Image 
                      src={movie.imageUrl} 
                      alt={movie.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-end h-full pb-28 px-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-yellow-500 px-2 py-1 text-xs font-bold rounded">
                      {movie.rating.toFixed(1)}
                    </div>
                    <span className="text-white/90">{movie.year}</span>
                    {movie.seasons && (
                      <>
                        <span className="text-white/50">•</span>
                        <span className="text-white/90">{movie.seasons} Seasons</span>
                      </>
                    )}
                  </div>
                  
                  <h1 className="text-5xl font-bold tracking-wider text-white space-x-5 mb-4">
                    {movie.title.split('').map((char, i) => (
                      <span key={`${movie.id}-char-${i}-${char}`}>{char}</span>
                    ))}
                  </h1>
                  
                  <p className="text-white/70 max-w-xl mb-8">
                    {movie.description}
                  </p>
                  
                  <div className="flex gap-4">
                    <Button className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                      <PlayCircle size={18} />
                      WATCH
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 flex items-center gap-2">
                      <Plus size={18} />
                      ADD TO LIST
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      <div className="absolute bottom-12 left-0 w-full">
        <div className="flex justify-center space-x-2">
          <ul className="flex gap-4">
            <li className="bg-red-600 h-[3px] w-16 rounded-full" />
            <li className="bg-white/20 h-[3px] w-16 rounded-full" />
          </ul>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full">
        <div className="flex overflow-x-auto space-x-2 p-4">
          <Button variant="ghost" className="text-white bg-zinc-800/50 hover:bg-zinc-800/80 rounded-full px-6">
            Action
          </Button>
          <Button variant="ghost" className="text-white bg-zinc-800/50 hover:bg-zinc-800/80 rounded-full px-6">
            Adventure
          </Button>
          <Button variant="ghost" className="text-white bg-zinc-800/50 hover:bg-zinc-800/80 rounded-full px-6">
            Anim
          </Button>
          <Button variant="ghost" className="text-white bg-zinc-800/50 hover:bg-zinc-800/80 rounded-full px-6">
            Biography
          </Button>
          <Button variant="ghost" className="text-white bg-zinc-800/50 hover:bg-zinc-800/80 rounded-full px-6">
            Crime
          </Button>
          <Button variant="ghost" className="text-white bg-zinc-800/50 hover:bg-zinc-800/80 rounded-full px-6">
            Comedy
          </Button>
          <Button variant="ghost" className="text-white bg-zinc-800/50 hover:bg-zinc-800/80 rounded-full px-6">
            Documentary
          </Button>
          <Button variant="ghost" className="text-white bg-zinc-800/50 hover:bg-zinc-800/80 rounded-full px-6">
            Drama
          </Button>
        </div>
      </div>
    </section>
  )
}
