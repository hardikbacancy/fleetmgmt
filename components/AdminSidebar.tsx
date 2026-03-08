'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { logout } from '@/app/actions/auth'
import {
  HomeIcon, BuildingOfficeIcon, TruckIcon,
  Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'

const nav = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon, exact: true },
  { name: 'Fleet Owners', href: '/admin/fleet-owners', icon: BuildingOfficeIcon },
]

interface Props { userName: string }

export default function AdminSidebar({ userName }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <TruckIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">FleetMgmt</p>
            <p className="text-xs text-orange-400">Super Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.name} href={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-white truncate">{userName}</p>
          <p className="text-xs text-gray-400">Super Admin</p>
        </div>
        <form action={logout}>
          <button type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 rounded-lg text-white">
        <Bars3Icon className="w-5 h-5" />
      </button>
      {mobileOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <XMarkIcon className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>
      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 bg-gray-900 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  )
}
