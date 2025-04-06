'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Heart, ListPlus, Star } from 'lucide-react'
import Image from 'next/image'

type MovieCardProps = {
	id: string
	title: string
	poster: string
	year: number
	rating: number
	className?: string
	onClick: () => void
	onFavoriteClick: () => void
	onListClick: () => void
}

const MovieCard = ({
	id,
	title,
	poster,
	year,
	rating,
	className,
	onClick,
	onFavoriteClick,
	onListClick,
}: MovieCardProps) => {
	return (
		<Card
			className={cn(
				'overflow-hidden transition-all bg-transparent p-0 border-none pb-4 gap-3',
				className
			)}
		>
			<div
				className="relative aspect-[2/3] overflow-hidden rounded-xl cursor-pointer"
				onClick={onClick}
			>
				<Image
					src={poster}
					alt={`${title} poster`}
					className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
					fill
				/>
			</div>
			<div className="gap-2 flex flex-col">
				<h3
					className="font-semibold text-white cursor-pointer"
					onClick={onClick}
				>
					{title}
				</h3>
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground font-semibold">{year}</p>
					<div className="flex items-center gap-6">
						<Heart
							size={20}
							fill="#6a7282"
							className="cursor-pointer text-transparent"
							onClick={onFavoriteClick}
						/>
						<ListPlus
							size={20}
							className="cursor-pointer text-gray-500"
							onClick={onListClick}
						/>
						<div className="flex items-center gap-1">
							<Star size={20} fill="#efb100" className="text-transparent" />
							<p className="text-yellow-500 font-semibold">{rating}</p>
						</div>
					</div>
				</div>
			</div>
		</Card>
	)
}

export default MovieCard
