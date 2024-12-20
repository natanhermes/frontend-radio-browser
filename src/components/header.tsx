import { BoomBox } from 'lucide-react'

import { useSidebar } from '@/hooks/use-sidebar'

import { SidebarTrigger } from './ui/sidebar'

interface HeaderProps {
  icon: 'menu' | 'search'
}

export function Header({ icon }: HeaderProps) {
  const { state, isMobile } = useSidebar()

  const expanded = state === 'expanded'

  return (
    <div className="flex w-full">
      <div className="mx-auto mt-4 flex items-center gap-3 text-lg text-primary">
        <BoomBox className="h-5 w-5" />
        {expanded && <span className="font-semibold">radio browser</span>}
      </div>

      {isMobile && (
        <SidebarTrigger className="text-primary [&_svg]:size-6" icon={icon} />
      )}
    </div>
  )
}
