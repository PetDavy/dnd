import {
  createContext,
  PropsWithChildren,
  RefObject,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {
  addDndContextAtom,
  addDndItemAtom,
  cleanUpDndItemsAtom,
  dndStoreAtom,
  setActiveItemAtom,
  updateOrderAtom,
} from '../store/dnd.store';
import { useAtomValue, useSetAtom } from 'jotai';
import { motion, PanInfo } from 'framer-motion';
import { useDndCollisions } from './useDndCollisions';

type DndContextType = {
  contextId: string;
};

export const DndContext = createContext<DndContextType | null>(null);

export function useDnd() {
  return {
    DndProvider,
    ItemWrapper,
  };
}

interface DndProviderProps extends PropsWithChildren {
  id: string;
  listRef: RefObject<HTMLDivElement>;
  items: string[];
  setItems: (items: string[]) => void;
  connectedContexts?: string[];
}

function DndProvider({
  children,
  id,
  listRef,
  items,
  setItems,
  connectedContexts,
}: DndProviderProps) {
  const dndStore = useAtomValue(dndStoreAtom);

  const addDndContext = useSetAtom(addDndContextAtom);
  const updateOrder = useSetAtom(updateOrderAtom);
  const cleanUpDndItems = useSetAtom(cleanUpDndItemsAtom);

  const context = { contextId: id };

  useEffect(() => {
    addDndContext({
      id,
      ref: listRef.current,
      items: {},
      itemsOrder: [],
      connectedContexts,
      setItems,
    });
  }, []);

  useEffect(() => {
    // change store order after items change
    if (!dndStore.contexts[id]) return;
    const contextItemsOrder = dndStore.contexts[id].itemsOrder;

    let isSameOrder = contextItemsOrder.length === items.length;
    items.forEach((item, index) => {
      if (item !== contextItemsOrder[index]) {
        isSameOrder = false;
      }
    });

    if (!isSameOrder) {
      updateOrder({ contextId: id, itemsOrder: items });
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

function ItemWrapper({ children, id }: PropsWithChildren & { id: string }) {
  const itemRef = useRef<HTMLDivElement>(null);
  const dndContext = useContext(DndContext);
  const contextId = dndContext?.contextId || '';

  const dndStore = useAtomValue(dndStoreAtom);
  const currDndContext = dndStore?.contexts?.[contextId];
  const currDndItem = useAtomValue(dndStoreAtom)?.contexts?.[contextId]?.items[id];

  const addDndItem = useSetAtom(addDndItemAtom);
  const setActiveItem = useSetAtom(setActiveItemAtom);

  const {
    collisionWithOwnContainer,
    collisionWithConnectedContainers,
    handleDragOutOfContainers
  } = useDndCollisions({ id, contextId });

  const isFakeItem = id.startsWith('fake-');

  useEffect(() => {
    if (itemRef.current && !currDndItem?.ref && contextId) {
      addDndItem({ contextId, item: { id, ref: itemRef.current } });
    }
  }, [itemRef.current, currDndItem, contextId]);

  const handleDragStart = () => {
    setActiveItem(id);
  };

  const handleDragItem = (event: MouseEvent, info: PanInfo) => {
    if (!currDndContext || !currDndItem) return;
    if (collisionWithOwnContainer(info)) return;
    if (collisionWithConnectedContainers(info)) return;
    handleDragOutOfContainers();
  };

  const handleDragEnd = (event: MouseEvent, info: PanInfo) => {
    const hoveredContext = collisionWithConnectedContainers(info);
    if (!hoveredContext) return;

    const itemsOrder = hoveredContext.itemsOrder;
    const ownItemsOrder = currDndContext.itemsOrder;
    const hoveredSetItems = hoveredContext.setItems;
    const ownSetItems = currDndContext.setItems;
    const ownItemIndex = ownItemsOrder.indexOf(id);

    if (ownItemIndex === -1) return;
    
    // replace fake item with real item
    const newItemsOrder = itemsOrder.map((item) => {
      if (item.startsWith('fake-')) return item.replace('fake-', ''); 
      return item;
    });
    const newOwnItemsOrder = [...ownItemsOrder];

    newOwnItemsOrder.splice(ownItemIndex, 1);

    hoveredSetItems(newItemsOrder);
    ownSetItems(newOwnItemsOrder);
    setActiveItem(null);
  };

  return (
    <div ref={itemRef} style={{ opacity: isFakeItem ? 0 : 1 }}>
      <motion.div
        layoutId={id}
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
