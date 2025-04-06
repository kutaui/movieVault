import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import MovieCard from '@/components/MovieCard'

export default function Home() {
	return (
		<main className="">
			<Header />
			<div className="-mt-21">
				<Hero />
				<div className="container mx-auto py-12">
					<h2 className="text-2xl font-bold mb-6">Popular Movies</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
						<MovieCard
							id="1"
							title="Black Panther"
							poster="https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg"
							year={2018}
							rating={9.5}
						/>
						<MovieCard
							id="2"
							title="Avengers: Endgame"
							poster="https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg"
							year={2019}
							rating={8.4}
						/>
						<MovieCard
							id="3"
							title="The Batman"
							poster="https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg"
							year={2022}
							rating={7.8}
						/>
						<MovieCard
							id="4"
							title="Dune"
							poster="https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg"
							year={2021}
							rating={8.1}
						/>
						<MovieCard
							id="5"
							title="Joker"
							poster="https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg"
							year={2019}
							rating={8.3}
						/>
						<MovieCard
							id="5"
							title="Joker"
							poster="https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg"
							year={2019}
							rating={8.3}
						/>
						<MovieCard
							id="5"
							title="Joker"
							poster="https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg"
							year={2019}
							rating={8.3}
						/>
						<MovieCard
							id="5"
							title="Joker"
							poster="https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg"
							year={2019}
							rating={8.3}
						/>
						<MovieCard
							id="5"
							title="Joker"
							poster="https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg"
							year={2019}
							rating={8.3}
						/>
					</div>
				</div>
			</div>
		</main>
	)
}
