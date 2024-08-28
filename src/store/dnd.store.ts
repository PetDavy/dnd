import { atom } from 'jotai';

export type DndStore = {
  activeItem: string | null;
  contexts: Record<string, DndStoreContext>;
}

export type DndStoreContext = {
  id: string;
  ref: HTMLDivElement | null;
  items: Record<string, DndItem>;
  itemsOrder: string[];
  connectedContexts?: string[];
  setItems: (items: string[]) => void;
}

export type DndItem = {
  id: string;
  ref: HTMLDivElement | null;
}

export const dndStoreAtom = atom<DndStore>({
  activeItem: null,
  contexts: {},
});


export const setActiveItemAtom = atom(null, (get, set, id: string | null) => {
  set(dndStoreAtom, {
    ...get(dndStoreAtom),
    activeItem: id,
  });
});

export const addDndContextAtom = atom(null, (get, set, context: DndStoreContext) => {
  const store = get(dndStoreAtom);

  set(dndStoreAtom, {
    ...store,
    contexts: {
      ...store.contexts,
      [context.id]: context,
    }
  });
});

export const addDndItemAtom = atom(null, (get, set, { contextId, item }: { contextId: string, item: DndItem }) => {
  const store = get(dndStoreAtom);

  const context = store.contexts[contextId];

  if (!context) return;

  set(dndStoreAtom, {
    ...store,
    contexts: {
      ...store.contexts,
      [contextId]: {
        ...context,
        items: {
          ...context.items,
          [item.id]: item,
        }
      }
    }
  });
});

export const updateOrderAtom = atom(null, (get, set, { contextId, itemsOrder }: { contextId: string, itemsOrder: string[] }) => {
  const store = get(dndStoreAtom);

  const context = store.contexts[contextId];

  if (!context) return;

  set(dndStoreAtom, {
    ...store,
    contexts: {
      ...store.contexts,
      [contextId]: {
        ...context,
        itemsOrder,
      }
    }
  });
});

export const cleanUpDndItemsAtom = atom(null, (get, set) => {
  // compare items with itemsOrder and remove items that are not in itemsOrder

  const store = get(dndStoreAtom);
  const contexts = store.contexts;
  const updatedContexts = Object.entries(contexts).map(([contextId, context]) => {
    const filteredItems = Object.entries(context.items).filter(([itemId]) => {
      return context.itemsOrder.includes(itemId);      
    });

    const updatedContext = {
      ...context,
      items: Object.fromEntries(filteredItems), 
    };

    return [contextId, updatedContext];
  }) 

  set(dndStoreAtom, {
    ...store,
    contexts: Object.fromEntries(updatedContexts),
  })
});
