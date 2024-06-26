"use client"
import { pokemonList } from "@/components/pokemon/pokemons-list"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Loader2Icon, Search } from "lucide-react"
import useSWR from "swr";
import Link from "next/link"
import { baseUrl } from "@/api/lib/axios"


function Page() {
    const [pokemonQuery, setPokemonQuery] = useState('')
    const searchParams = useSearchParams()
    const pageIndex = Number(searchParams.get('pageIndex'))
    const query = searchParams.get('query')
    const router = useRouter()
    const currentPage = pageIndex ? pageIndex : 0


    const { data, error, isLoading, } = useSWR(['/pokedex', pageIndex, query], async () => {
        const results = await baseUrl.get(`/pokemons?pageIndex=${pageIndex ? pageIndex : 0}` + (query ? `&query=${query}` : ''))
        return results.data
    }, { shouldRetryOnError: false, revalidateOnFocus: false })

    if (isLoading) return (
        <div className="flex justify-center items-center h-52 gap-4"><Loader2Icon className="animate-spin" />Loading...</div>
    )
    if (error) return (
        <div className="flex justify-center items-center gap-4">
            <h1>No pokemons were found</h1>
            <Button asChild><Link href={'/pokedex'}>Go back</Link></Button>
        </div>)

    return (
        <>
            <div className="flex flex-col items-center justify-center space-y-8 m-2 rounded-md">
                <form className="flex flex-row items-center justify-center my-4" onSubmit={(e) => {
                    e.preventDefault()
                    router.push(`/pokedex?query=${pokemonQuery}`)
                }}>
                    <div className="flex flex-row gap-4 max-w-[1/2]">
                        <Input value={pokemonQuery} onChange={(e) => setPokemonQuery(e.target.value)} placeholder="search for a pokemon" />
                        <Button type="submit"><Search /></Button>
                    </div>
                </form>
                <div  className="flex flex-row justify-center items-center flex-wrap gap-4">
                    {data && pokemonList(data.pokemons)}
                </div>
                <Pagination className=" scale-75 md:scale-100">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" onClick={() => router.push(`/pokedex?pageIndex=${currentPage > 0 ? currentPage - 1 : currentPage}${pokemonQuery ? '&query=' + pokemonQuery : ''}`)} />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">{currentPage - 1}</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" isActive>
                                {currentPage}
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">{currentPage + 1}</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" onClick={() => {
                                if (currentPage >= data.maxPages) return
                                router.push(`/pokedex?pageIndex=${currentPage + 1}${pokemonQuery ? '&query=' + pokemonQuery : ''}`)
                            }
                            } />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </>
    )
}

export default function SuspenseWrapper() {
    return (
        <Suspense fallback={<div className="flex flex-row justify-center items-center gap-4"><Loader2 className="animate-spin" />Loading ...</div>}>
            <Page />
        </Suspense>
    )
}