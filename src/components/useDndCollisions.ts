import { PanInfo } from 'framer-motion';
import { dndStoreAtom, DndStoreContext } from '../store/dnd.store';
import { useAtomValue } from 'jotai';

interface UseDndCollisionsParams {
  id: string;
  contextId: string;
}

export function useDndCollisions({ id, contextId }: UseDndCollisionsParams) {
  const dndStore = useAtomValue(dndStoreAtom);
  // console.log('dndStore', dndStore)
  const currDndContext = dndStore?.contexts?.[contextId];
  const currDndItem = useAtomValue(dndStoreAtom)?.contexts?.[contextId]?.items[id];

  const collisionWithContainer = (info: PanInfo, container: HTMLDivElement|null) => {
    if (!container) return false;
    if (containsPoint(container, info.point.x, info.point.y)) {
      if (!collisionWithOwnItem(info)) {
        collisionWithNeighbors(info);
      }      

      return true;
    }

    return false;
  }

  const collisionWithOwnContainer = (info: PanInfo) => {
    const ownContainer = currDndContext.ref; 
    return collisionWithContainer(info, ownContainer);
  } 

  const collisionWithOwnItem = (info: PanInfo) => {
    const currItemRef = currDndItem.ref;
    return currItemRef && containsPoint(currItemRef, info.point.x, info.point.y);
  }

  const collisionWithNeighbors = (info: PanInfo) => {
    const neighbors = Object.values(currDndContext.items).filter((item) => item.id !== id);
    const itemsOrder = currDndContext.itemsOrder;
    const setItems = currDndContext.setItems;

    neighbors.forEach((neighbor) => {
      if (neighbor.ref && containsPoint(neighbor.ref, info.point.x, info.point.y)) {
        const neighborIndex = itemsOrder.indexOf(neighbor.id);
        const itemIndex = itemsOrder.indexOf(id);
        const newItemsOrder = [...itemsOrder];
        newItemsOrder.splice(itemIndex, 1);
        newItemsOrder.splice(neighborIndex, 0, id);
        setItems(newItemsOrder);
      }
    })
  }

  const collisionWithConnectedContainers = (info: PanInfo) => {
    if (!currDndContext.connectedContexts) return;
    const connectedContexts = currDndContext.connectedContexts
      .map((id) => dndStore.contexts[id])
      .filter(Boolean); 

    const hoveredContext = connectedContexts.find((context) => {
      return collisionWithContainer(info, context.ref);
    });

    if (hoveredContext) {
      collisionWithOtherContextItem(info, hoveredContext);
    }

    return hoveredContext;
  }

  const collisionWithOtherContextItem = (info: PanInfo, context: DndStoreContext) => {
    const items = Object.values(context.items);
    const itemsOrder = context.itemsOrder;
    const fakeItemIndex = itemsOrder.indexOf(`fake-${id}`);
    const otherSetItems = context.setItems;
    
    // prevent adding item to the same context 
    // if it already exists as original or as a new copy item
    if (items.some((item) => id === item.id || (id.startsWith('new-') && id.includes(item.id)))) return;
   
    items.forEach((item) => {
      if (!item.ref || item.id.startsWith('fake')) return;

      if (containsPoint(item.ref, info.point.x, info.point.y)) {
        const itemIndex = itemsOrder.indexOf(item.id);
        const newItemsOrder = [...itemsOrder];

        if (fakeItemIndex !== -1) {
          // remove fake item from old position
          newItemsOrder.splice(fakeItemIndex, 1);
        }

        newItemsOrder.splice(itemIndex, 0, `fake-${id}`);

        otherSetItems(newItemsOrder);
      }
    });
  }

  const handleDragOutOfContainers = () => {
    // remove all fake items from connected contexts
    if (!currDndContext.connectedContexts) return;    
    const connectedContexts = currDndContext.connectedContexts
      .map((id) => dndStore.contexts[id])
      .filter(Boolean); 

    connectedContexts.forEach((context) => {
      const itemsOrder = context.itemsOrder;
      const fakeItemIndex = itemsOrder.indexOf(`fake-${id}`);
      const setItems = context.setItems;

      if (fakeItemIndex !== -1) {
        const newItemsOrder = [...itemsOrder];
        newItemsOrder.splice(fakeItemIndex, 1);
        setItems(newItemsOrder);
      }
    })
  }

  return {
    collisionWithOwnContainer,
    collisionWithConnectedContainers,
    handleDragOutOfContainers,
  }
}

function containsPoint(element: HTMLElement, x: number, y: number) {
  const rect = element.getBoundingClientRect();

  return rect.top <= y && y <= rect.bottom && rect.left <= x && x <= rect.right;
}