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
  initSnapshot: string[];
  setInitSnapshot: (snapshot: string[]) => void;

  containers: Record<string, string[]>;
  updateContainer: (items: string[], id: string) => void;
  containerSetItems: Record<string, (items: string[]) => void>;
  addContainerSetItems: (setItems: (items: string[]) => void, id: string) => void;
};

export const DndContext = createContext<DndContextType | null>(null);

export function useDnd() {
  return {
    DndProvider,
    ItemWrapper,
    Container,
  };
}

function DndProvider({ children }: PropsWithChildren) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [itemsRefs, setItemsRefs] = useState<Record<string, HTMLDivElement | null>>({});
  const [containers, setContainers] = useState<Record<string, string[]>>({});
  const [containersRefs, setContainersRefs] = useState<Record<string, HTMLDivElement | null>>({});
  const [containerSetItems, setContainerSetItems] = useState<Record<string, (items: string[]) => void>>({});
  const [initSnapshot, setInitSnapshot] = useState<string[]>([]);

  const addItemRef = (ref: HTMLDivElement, id: string) => {
    setItemsRefs((prev) => ({ ...prev,  [id]: ref }));
  };

  const addContainerRef = (ref: HTMLDivElement, id: string) => {
    setContainersRefs((prev) => ({ ...prev, [id]: ref }));
  };

  const addContainerSetItems = (setItems: (items: string[]) => void, id: string) => {
    setContainerSetItems((prev) => ({ ...prev, [id]: setItems }));
  }

  const updateContainer = (items: string[], id: string) => {
    setContainers((prev) => ({ ...prev, [id]: [...items] }));
  }

  const context = {
    activeItem,
    setActiveItem,
    itemsRefs,
    addItemRef,
    containers,
    updateContainer,
    containersRefs,
    addContainerRef,
    containerSetItems,
    addContainerSetItems,
    initSnapshot,
    setInitSnapshot,
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
  className?: string;
}

function Container({ children, id, listItems, setListItems, className }: ContainerProps) {
  const context = useContext(DndContext);
  // console.log('context', context);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!context) {
      console.error('Container must be used inside DndProvider');
      return;
    }

    if (containerRef.current) {
      context.addContainerRef(containerRef.current, id);
      context.addContainerSetItems(setListItems, id);
      context.updateContainer(listItems, id);
    }
  }, [containerRef]);

  useEffect(() => {
    if (!context) return;

    console.log('context.containers[id]', context.containers[id])
    setListItems(context.containers[id] || listItems);
  }, [context?.containers[id]]);

  return (
    <div
      ref={containerRef}
      className={className}
    >
        {children}
      </div>
  );
}

interface ItemWrapperProps extends PropsWithChildren {
  id: string;
  containerId: string;
  className?: string;
}

function ItemWrapper({
  children,
  id,
  containerId,
  className,
}: ItemWrapperProps) {
  const context = useContext(DndContext);

  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!context) {
      console.error('ItemWrapper must be used inside DndProvider');
      return;
    }

    if (itemRef.current) {
      context.addItemRef(itemRef.current, `${containerId}&${id}`);
    }
  }, [itemRef]);

  const handleDragStart = () => {
    if (!context) return;
    context.setActiveItem(id);
    context.setInitSnapshot(context.containers[containerId]);
  }

  const handleDragItem = (event: MouseEvent, info: PanInfo) => {
    if (!context) return;

    // let activeContainerId = containerId;
    // Object.entries(context.containersRefs).forEach(([id, ref]) => {
    //   if (ref && containsPoint(ref, info.point.x, info.point.y)) {
    //     activeContainerId = id;
    //   }
    // })

    let collision = false;
    Object.entries(context.itemsRefs).forEach(([id, ref]) => {
      const [hoverContainerId, itemId] = id.split('&');

      if (ref && containsPoint(ref, info.point.x, info.point.y)) {
        collision = true;
        const dragContainerItems = context.containers[containerId]; 
        const hoverContainerItems = context.containers[hoverContainerId];

        const hoveredIndex = hoverContainerItems.indexOf(itemId);
        const dragIndex = dragContainerItems.indexOf(context.activeItem!);
        
        if (hoveredIndex < 0 || dragIndex < 0 || hoveredIndex === dragIndex || !context.activeItem) return;
        
        const reorderedDragItems = [...dragContainerItems];
        const reorderedHoveredItems = [...hoverContainerItems];

        if (containerId === hoverContainerId) {
          reorderedDragItems.splice(dragIndex, 1);
          reorderedDragItems.splice(hoveredIndex, 0, context.activeItem);

          context.containerSetItems[containerId](reorderedDragItems);
        } else {
          reorderedDragItems.splice(dragIndex, 1);
          reorderedHoveredItems.splice(hoveredIndex, 0, context.activeItem);
          console.log('reorderedDragItems', reorderedDragItems);
          // console.log('reorderedHoveredItems', reorderedHoveredItems);
  
          // context.containerSetItems[containerId](reorderedDragItems);
          // context.containerSetItems[hoverContainerId](reorderedHoveredItems);
          context.updateContainer(reorderedDragItems, containerId);
          context.updateContainer(reorderedHoveredItems, hoverContainerId);
        }
      }
    }) 

    if (!collision) {
      context.containerSetItems[containerId](context.initSnapshot);
    }
  }

  const handleDragEnd = () => {
    if (!context) return;

    context.setActiveItem(null);
    // context.setInitSnapshot(context.containers[containerId]);
  }

  return (
    <div ref={itemRef}>
      <motion.div
        layoutId={id}
        drag
        dragElastic={1}
        dragMomentum={false}
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        onDrag={handleDragItem}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

function containsPoint(element: HTMLElement, x: number, y: number) {
  const rect = element.getBoundingClientRect();

  return rect.top <= y && y <= rect.bottom && rect.left <= x && x <= rect.right;
}