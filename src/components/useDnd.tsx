import {
  createContext,
  PropsWithChildren,
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  addDndContextAtom,
  addDndItemAtom,
  cleanUpDndItemsAtom,
  dndStoreAtom,
  setActiveItemAtom,
  updateOrderAtom,
  updateSavedItemsAtom,
} from '../store/dnd.store';
import { useAtomValue, useSetAtom } from 'jotai';
import { motion, PanInfo } from 'framer-motion';
import { useDndCollisions } from './useDndCollisions';
import { IdType } from '../types/types';

type DndContextType = {
  contextId: string;
  keepItems?: boolean;
};

export const DndContext = createContext<DndContextType | null>(null);

export function useDnd({ id }: { id: string }) {
  const dndStore = useAtomValue(dndStoreAtom);
  const savedItems = useMemo(() => (
    dndStore.contexts[id]?.savedItems || []
  ), [dndStore.contexts[id]?.savedItems]);

  return {
    DndProvider,
    ItemWrapper,
    savedItems,
  };
}

interface DndProviderProps<T extends IdType> extends PropsWithChildren {
  id: string;
  listRef: RefObject<HTMLDivElement>;
  items: T[];
  setItems: (items: T[]) => void;
  connectedContexts?: string[];
  keepItems?: boolean;
}

function DndProvider<T extends IdType>({
  children,
  id,
  listRef,
  items,
  setItems,
  connectedContexts,
  keepItems,
}: DndProviderProps<T>) {
  const dndStore = useAtomValue(dndStoreAtom);

  const addDndContext = useSetAtom(addDndContextAtom);
  const updateOrder = useSetAtom(updateOrderAtom);
  const cleanUpDndItems = useSetAtom(cleanUpDndItemsAtom);

  const context = { contextId: id, keepItems };

  useEffect(() => {
    addDndContext({
      id,
      ref: listRef.current,
      items: {},
      itemsOrder: [],
      connectedContexts,
      setItems: setItems as (items: IdType[]) => void,
      savedItems: items,
    });
  }, []);

  useEffect(() => {
    // change store order after items change
    if (!dndStore.contexts[id]) return;
    const contextItemsOrder = dndStore.contexts[id].itemsOrder;

    let isSameOrder = contextItemsOrder.length === items.length;
    items.forEach((item, index) => {
      if (item.id !== contextItemsOrder[index]) {
        isSameOrder = false;
      }
    });

    if (!isSameOrder) {
      updateOrder({ contextId: id, itemsOrder: items.map((item) => String(item.id)) });
    }
  }, [items, dndStore.contexts[id]]);

  useEffect(() => {
    if (!dndStore.activeItem) {
      cleanUpDndItems();
    }
  }, [dndStore.activeItem]);

  return (
    <DndContext.Provider value={context}>
      {children}
    </DndContext.Provider>
  );
}

interface ItemWrapperProps<T extends IdType> extends PropsWithChildren {
  item: T;
}

function ItemWrapper<T extends IdType>({ children, item }: ItemWrapperProps<T>) {
  const itemRef = useRef<HTMLDivElement>(null);
  const itemId = String(item.id);
  const dndContext = useContext(DndContext);
  const contextId = dndContext?.contextId || '';
  const keepItems = dndContext?.keepItems;

  const dndStore = useAtomValue(dndStoreAtom);
  const currDndContext = dndStore?.contexts?.[contextId];
  const currDndItem = useAtomValue(dndStoreAtom)?.contexts?.[contextId]?.items[itemId];

  const addDndItem = useSetAtom(addDndItemAtom);
  const setActiveItem = useSetAtom(setActiveItemAtom);
  const updateSavedItems = useSetAtom(updateSavedItemsAtom);

  const {
    collisionWithOwnContainer,
    collisionWithConnectedContainers,
    handleDragOutOfContainers,
    detectDuplicate,
  } = useDndCollisions({ id: itemId, contextId });

  const isFakeItem = itemId.startsWith('fake-');

  useEffect(() => {
    if (itemRef.current && !currDndItem?.ref && contextId) {
      addDndItem({ contextId, item: { id: itemId, ref: itemRef.current, item } });
    }
  }, [itemRef.current, currDndItem, contextId]);

  const handleDragStart = () => {
    setActiveItem(itemId);
  };

  const handleDragItem = (event: MouseEvent, info: PanInfo) => {
    if (!currDndContext || !currDndItem) return;
    if (collisionWithOwnContainer(info)) return;
    if (collisionWithConnectedContainers(info)) return;
    handleDragOutOfContainers();
  };

  const handleDragEnd = (event: MouseEvent, info: PanInfo) => {
    const hoveredContext = collisionWithConnectedContainers(info);
    const hoveredContextItems = Object.values(hoveredContext?.items || {});
    if (!hoveredContext || detectDuplicate(hoveredContextItems, itemId)) {
      updateItemsSortMutation();
      return;
    }

    const itemsOrder = hoveredContext.itemsOrder;
    const items = hoveredContext.items;
    const ownItemsOrder = currDndContext.itemsOrder;
    const ownItems = currDndContext.items;
  
    const hoveredSetItems = hoveredContext.setItems;
    const ownSetItems = currDndContext.setItems;
    const ownItemIndex = ownItemsOrder.indexOf(itemId);

    if (ownItemIndex === -1) return;
    
    // replace fake item with real item
    const newItemsOrder = itemsOrder.map((item) => {
      if (item.startsWith('fake-')) return item.replace('fake-', ''); 
      return item;
    });

    const newOwnItemsOrder = [...ownItemsOrder];
    const copyItemId = `copy-${itemId}`;

    if (keepItems) {
      newOwnItemsOrder[ownItemIndex] = copyItemId;
    } else {
      newOwnItemsOrder.splice(ownItemIndex, 1);
    }

    // for new item in hovered context we take the item from props
    // since there is no new item in hoveredContext.items
    const newHoveredItems = newItemsOrder.map((id) => items[id]?.item || item);
    updateSavedItems({ contextId: hoveredContext.id, items: newHoveredItems });

    // if keepItems is true we add a copy of the item to the ownItems
    const newOwnItems = newOwnItemsOrder.map((id) => ownItems[id]?.item || { ...item, id: copyItemId });
    updateSavedItems({ contextId: currDndContext.id, items: newOwnItems });

    hoveredSetItems(newHoveredItems);
    ownSetItems(newOwnItems);
    setActiveItem(null);
  };

  const updateItemsSortMutation  = () => {
    // update saved items if items have different order

    const savedItems = dndStore.contexts[contextId].savedItems;
    const itemsOrder = dndStore.contexts[contextId].itemsOrder;
    if (!savedItems || !itemsOrder) return;

    let isSameOrder: boolean = true;

    savedItems.forEach((item, index) => {
      if (item.id !== itemsOrder[index]) {
        isSameOrder = false;
      }
    })

    if (!isSameOrder) {
      const sortedItems = itemsOrder.map((id) => savedItems.find((item) => item.id === id) as T);
      updateSavedItems({ contextId, items: sortedItems });
    }

  }

  return (
    <div ref={itemRef} style={{ opacity: isFakeItem ? 0 : 1 }}>
      <motion.div
        layoutId={itemId}
        drag
        dragElastic={1}
        dragMomentum={false}
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        onDrag={handleDragItem}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}
