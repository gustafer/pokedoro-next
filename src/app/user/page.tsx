'use client'
import useSWR from 'swr'
import { getCookie } from "cookies-next"
import { Loader2, Search } from 'lucide-react'
import { pokemonList } from '@/components/pokemon/pokemons-list'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'
import useSWRMutation from 'swr/mutation'
import { putRandomUserPoke } from '@/api/put-random-user-poke'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { returnTypeIcon } from '@/lib/utils/returnTypeIcon'
import { toast } from 'sonner'
import env from '@/lib/config.json'

export default function Page() {
    // pagination and query stuff
    const [pokemonQuery, setPokemonQuery] = useState('')
    const searchParams = useSearchParams()
    const pageIndex = Number(searchParams.get('pageIndex'))
    const query = searchParams.get('query')
    const router = useRouter()
    const currentPage = pageIndex ? pageIndex : 0

    const authToken = getCookie('auth')

    const { mutate, data, error, isLoading } = useSWR(['get/user/pokemon', pageIndex, query], async () => {
        const results = await fetch(`${env.API_BASE_URL}/user/pokemon?pageIndex=${pageIndex ? pageIndex : 0}${query ? `&query=${query}` : ''}`, {
            headers: new Headers({
                'Authorization': `Beaerer ${authToken}`
            }),
        },)
        return await results.json()
    }, { shouldRetryOnError: false, revalidateOnFocus: false })


    const { trigger, data: newPokeData, isMutating, reset } = useSWRMutation('put/user/pokemon', putRandomUserPoke, {
        onError: () => toast.error('could not add new pokemon')
    })

    if (isLoading) return (
        <div className='flex flex-row gap-4 justify-center items-center my-4'><Loader2 className='animate-spin' />Loading...</div>
    )

    return (
        <>
            <div className='my-4 flex flex-col justify-center items-center'>
                <Button disabled={isMutating} className='flex flex-row justify-center items-center gap-4' onClick={async () => {
                    trigger()
                    mutate()
                }}>
                    {/* change button to loading */}
                    {isMutating ? <><Loader2 className='animate-spin' />Getting a random pokemon...</> : <>Get me a random pokemon</>}
                </Button>
                {newPokeData && <Dialog onOpenChange={() => reset()} defaultOpen>
                    <DialogContent className='flex flex-col justify-center items-center'>
                        <div className='flex flex-row gap-4 items-center'>
                            {newPokeData.pokemon.typeList.map((type: string) => returnTypeIcon(type))}
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="w-auto h-48" src={`https://raw.githubusercontent.com/gustafer/pokedata/main/pokemon-gifs/poke_${newPokeData.pokemon.id}.gif`} />
                        <div>{newPokeData.pokemon.name}</div>
                    </DialogContent>
                </Dialog>}
            </div>
            <form className="flex flex-row items-center justify-center" onSubmit={(e) => {
                e.preventDefault()
                router.push(`/user?query=${pokemonQuery}`)
            }}>
                <div className="flex flex-row gap-4 max-w-[1/2]">
                    <Input value={pokemonQuery} onChange={(e) => setPokemonQuery(e.target.value)} placeholder="search for a pokemon" />
                    <Button type="submit"><Search /></Button>
                </div>
            </form>
            {error &&
                <div className='flex flex-col items-center justify-center my-4 gap-4'>
                    <h2>No pokemons named <strong>{pokemonQuery}</strong> were found in your bag.</h2>
                    <Button onClick={() => {
                        router.push('/user')
                        setPokemonQuery('')
                    }}>Go back.</Button>
                </div>
            }
            {data &&
                <div className='flex flex-col justify-center items-center my-4 space-y-4'>
                    <h1>{data.user}</h1>
                    <div className="flex flex-col space-y-8 my-4 items-center justify-center">
                        <div className="flex flex-row flex-wrap justify-center gap-4 p-4">{data && pokemonList(data.pokemons)}</div>
                    </div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" onClick={() => router.push(`/user?pageIndex=${currentPage > 0 ? currentPage - 1 : currentPage}${pokemonQuery ? '&query=' + pokemonQuery : ''}`)} />
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
                                    router.push(`/user?pageIndex=${currentPage + 1}${pokemonQuery ? '&query=' + pokemonQuery : ''}`)
                                }
                                } />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>}
        </>
    )
}