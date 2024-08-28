import { atom } from 'jotai';
import { IdType } from '../types/types';

export type DndStore<T extends IdType> = {
  activeItem: string | null;
  contexts: Record<string, DndStoreContext<T>>;
}

export type DndStoreContext<T extends IdType> = {
  id: string;
  ref: HTMLDivElement | null;
  items: Record<string, DndItem<T>>;
  itemsOrder: string[];
  connectedContexts?: string[];
  setItems: (items: T[]) => void;
  savedItems: T[];
}

export type DndItem<T extends IdType> = {
  id: string;
  ref: HTMLDivElement | null;
  item: T; 
}

type ST = object; // default dnd store type;

export const dndStoreAtom = atom<DndStore<ST & IdType>>({
  activeItem: null,
  contexts: {},
});


export const setActiveItemAtom = atom(null, (get, set, id: string | null) => {
  set(dndStoreAtom, {
    ...get(dndStoreAtom),
    activeItem: id,
  });
});

export const updateSavedItemsAtom = atom(null, <T extends IdType>(get, set, { contextId, items }: { contextId: string, items: T[] }) => {
  const store = get(dndStoreAtom);

  const context = store.contexts[contextId];

  if (!context) return;

  set(dndStoreAtom, {
    ...store,
    contexts: {
      ...store.contexts,
      [contextId]: {
        ...context,
        savedItems: items,
      }
    }
  });
});

export const addDndContextAtom = atom(null, <T extends IdType>(get, set, context: DndStoreContext<T>) => {
  const store = get(dndStoreAtom);

  set(dndStoreAtom, {
    ...store,
    contexts: {
      ...store.contexts,
      [context.id]: context,
    }
  });
});

export const addDndItemAtom = atom(null, <T extends IdType>(get, set, { contextId, item }: { contextId: string, item: DndItem<T> }) => {
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
