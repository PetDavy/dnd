import { atom } from 'jotai';


export const itemsRefsAtom = atom<Record<string, HTMLDivElement | null>>({});

export const addItemRefAtom = atom(null, (get, set, { ref, id }: { ref: HTMLDivElement, id: string }) => {
  const refs = get(itemsRefsAtom);
  set(itemsRefsAtom, { ...refs, [id]: ref });
});