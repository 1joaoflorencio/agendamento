'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

interface SearchFilterProps {
    placeholder?: string
}

export default function SearchFilter({ placeholder = 'Buscar...' }: SearchFilterProps) {
    const [query, setQuery] = useState('')

    const handleChange = (value: string) => {
        setQuery(value)
        // Filter items with data-search attribute
        const items = document.querySelectorAll('[data-search]')
        items.forEach((item) => {
            const searchText = (item as HTMLElement).dataset.search?.toLowerCase() || ''
            const matches = searchText.includes(value.toLowerCase())
                ; (item as HTMLElement).style.display = matches ? '' : 'none'
        })
    }

    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-300" />
            </div>
            <Input
                type="text"
                placeholder={placeholder}
                className="pl-10 pr-9 h-11 rounded-xl border-2 border-slate-100 bg-white/80 backdrop-blur-sm focus:bg-white focus:border-indigo-400 transition-all font-bold text-slate-700 text-sm"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
            />
            {query && (
                <button
                    onClick={() => handleChange('')}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-slate-500"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}
