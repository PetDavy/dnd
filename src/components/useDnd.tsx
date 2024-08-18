import { motion, PanInfo } from 'framer-motion';
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

type DndContextType = {
  activeItem: string | null;
  setActiveItem: (id: string | null) => void;
  itemsRefs: Record<string, HTMLDivElement | null>;
  containersRefs: Record<string, HTMLDivElement | null>;
  addItemRef: (ref: HTMLDivElement, id: string) => void;
  addContainerRef: (ref: HTMLDivElement, id: string) => void;

  containers: Record<string, string[]>;
  setContainers: (containers: Record<string, string[]>) => void;
};

export const DndContext = createContext<DndContextType | null>(null);

export function useDnd() {
  return {
    DndProvider,
    ItemWrapper,
  };
}

function DndProvider({ children }: PropsWithChildren) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [itemsRefs, setItemsRefs] = useState<Record<string, HTMLDivElement | null>>({});
  const [containers, setContainers] = useState<Record<string, string[]>>({});
  const [containersRefs, setContainersRefs] = useState<Record<string, HTMLDivElement | null>>({});

  const addItemRef = (ref: HTMLDivElement, id: string) => {
    setItemsRefs({ ...itemsRefs, [id]: ref });
  };

  const addContainerRef = (ref: HTMLDivElement, id: string) => {
    setContainersRefs({ ...containersRefs, [id]: ref });
  };

  const context = {
    activeItem,
    setActiveItem,
    itemsRefs,
    addItemRef,
    containers,
    setContainers,
    containersRefs,
    addContainerRef,
  };

  return (
    <DndContext.Provider value={context}>
      {children}
    </DndContext.Provider>
  );
}

interface ContainerProps extends PropsWithChildren {
  id: string;
  listItems: string[];
  setListItems: (items: string[]) => void;
}

function Container({ children, id, listItems, setListItems }: ContainerProps) {
  const context = useContext(DndContext);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!context) {
      console.error('Container must be used inside DndProvider');
      return;
    }

    if (containerRef.current) {
      context.addContainerRef(containerRef.current, id);
    }
  }, [containerRef]);

  useEffect(() => {
    if (!context) return;

    context.setContainers({
      ...context.containers,
      [id]: listItems,
    });
  }, [listItems]);

  const handleDragStart = (item: string) => {
    if (!context) return;
    context.setActiveItem(item);
  }

  return <div ref={containerRef}>{children}</div>;
}

interface ItemWrapperProps extends PropsWithChildren {
  id: string;
  handleDragItem: (event: MouseEvent, info: PanInfo) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function ItemWrapper({
  children,
  id,
  handleDragItem,
  onDragStart,
  onDragEnd,
}: ItemWrapperProps) {
  const context = useContext(DndContext);

  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!context) {
      console.error('ItemWrapper must be used inside DndProvider');
      return;
    }

    if (itemRef.current) {
      context.addItemRef(itemRef.current, id);
    }
  }, [itemRef]);

  return (
    <div ref={itemRef}>
      <motion.div
        layoutId={id}
        drag
        dragElastic={1}
        dragMomentum={false}
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        className="nav-item"
        onDrag={handleDragItem}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}
