'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'

function Header() {
	const pathname = usePathname()
	const user = true

	const navItems = [
		{ name: 'Home', href: '/' },
		{ name: 'TV Shows', href: '/tv-shows' },
		{ name: 'Movies', href: '/movies' },
		{ name: 'Recently Added', href: '/recently-added' },
		{ name: 'Watchlists', href: '/watchlists' },
	]

	return (
		<header className="text-white font-semibold p-4 relative z-10  max-w-[1280px] mx-auto">
			<div className="flex gap-4 justify-between items-center pb-4">
				<h3 className="">MovieVault</h3>
				<nav className="gap-6 flex">
					{navItems.map((item) => {
						const isActive = pathname === item.href
						return (
							<Link
								key={item.name}
								href={item.href}
								className={`hover:text-white relative ${
									isActive ? 'text-white' : 'text-white/70'
								}`}
							>
								{item.name}
								{isActive && (
									<div className="absolute bottom-[-18px] left-0 w-full h-[2px] bg-red-600" />
								)}
							</Link>
						)
					})}
				</nav>
				{!user && (
					<div className="px-1.5">
						<Button variant="destructive" className="">
							Login
						</Button>
					</div>
				)}
				{user && (
					<div className="flex items-center gap-6 py-0.5">
						<Search className="hover:cursor-pointer" />
						<Avatar>
							<AvatarImage src="https://github.com/shadcn.png" />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
					</div>
				)}
			</div>
			<div className="absolute bottom-4.5 left-1/2 w-screen -translate-x-1/2 border-b border-white/20" />
		</header>
	)
}

export { Header }
