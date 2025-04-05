'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Play, Plus } from 'lucide-react'
import { Button } from './ui/button'
import type { CarouselApi } from './ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel'

type Movie = {
	id: number
	title: string
	year: number
	rating: number
	seasons?: number
	description: string
	imagePath: string
}

const featuredMovies: Movie[] = [
	{
		id: 1,
		title: 'LOST IN SPACE',
		year: 2018,
		rating: 7.5,
		seasons: 2,
		description:
			"After crash-landing on an alien planet, the Robinson family fight against all odds to survive and escape, but they're surrounded by hidden dangers.",
		imagePath: '/gray-man-poster.jpg',
	},
	{
		id: 2,
		title: 'STRANGER THINGS',
		year: 2016,
		rating: 8.7,
		seasons: 4,
		description:
			'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
		imagePath: '/gray-man-poster.jpg',
	},
	{
		id: 3,
		title: 'THE GRAY MAN',
		year: 2022,
		rating: 6.5,
		description:
			"When a shadowy CIA agent uncovers damning agency secrets, he's hunted across the globe by a sociopathic rogue operative who's put a bounty on his head.",
		imagePath: '/gray-man-poster.jpg',
	},
]

export function Hero() {
	const [api, setApi] = useState<CarouselApi>()
	const [current, setCurrent] = useState(0)

	useEffect(() => {
		if (!api) return

		api.on('select', () => {
			setCurrent(api.selectedScrollSnap())
		})
	}, [api])

	return (
		<div className="z-0">
			<Carousel className="w-full" setApi={setApi}>
				<CarouselContent>
					{featuredMovies.map((movie) => (
						<CarouselItem key={movie.id}>
							<div className="relative w-full h-screen p-1">
								<Image
									src={movie.imagePath}
									alt={movie.title}
									fill
									priority={movie.id === 1}
									style={{ objectFit: 'cover', objectPosition: 'top' }}
								/>
								<div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent">
									<div className="flex flex-col h-full justify-center p-16 max-w-2xl gap-4">
										{movie.rating && (
											<div className="flex items-center gap-2">
												<span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
													{movie.rating.toFixed(1)}
												</span>
												<span className="text-white/80">•</span>
												<span className="text-white/80">{movie.year}</span>
												{movie.seasons && (
													<>
														<span className="text-white/80">•</span>
														<span className="text-white/80">
															{movie.seasons} Seasons
														</span>
													</>
												)}
											</div>
										)}
										<div className="flex justify-center py-4">
											<Image
												src={'/gray-man-logo.png'}
												alt={movie.title}
												priority={movie.id === 1}
												width={200}
												height={300}
											/>
										</div>
										<p className="text-white/80">{movie.description}</p>
										<div className="flex gap-4 mt-4">
											<Button
												size="lg"
												className="rounded-full"
												variant="destructive"
											>
												<Play className=" h-4 w-4" /> WATCH
											</Button>
											<Button
												size="lg"
												className="rounded-full"
												variant="secondary"
											>
												<Plus className=" h-4 w-4" /> ADD TO LIST
											</Button>
										</div>
									</div>
								</div>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
		</div>
	)
}
