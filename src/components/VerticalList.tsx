import React, { useEffect, useRef, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { addItemRefAtom, itemsRefsAtom } from '../store';
import { useAtomValue, useSetAtom } from 'jotai';

import '../styles/VerticalList.css';

const IDS = ['Home', 'About', 'Services', 'Contact', 'Profile'];

const VerticalList: React.FC = () => {
  const [listItems, setListItems] = useState(IDS);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [initSnapshot, setInitSnapshot] = useState<string[]>([]);

  const itemsRefs = useAtomValue(itemsRefsAtom);

  const handleDragStart = (item: string) => {
    setActiveItem(item);
    setInitSnapshot([...listItems]);
  }

  const handleDragItem = (event: MouseEvent, info: PanInfo) => {
    let collision = false;
    Object.entries(itemsRefs).forEach(([id, ref]) => {
      if (ref && containsPoint(ref, info.point.x, info.point.y)) {
        collision = true;
        const hoveredIndex = listItems.indexOf(id);
        const activeIndex = listItems.indexOf(activeItem!);
        
        if (hoveredIndex < 0 || activeIndex < 0 || hoveredIndex === activeIndex || !activeItem) return;
        
        const reorderedItems = [...listItems];
        reorderedItems.splice(activeIndex, 1);
        reorderedItems.splice(hoveredIndex, 0, activeItem);
        
        setListItems(reorderedItems);
      }
    }) 

    if (!collision) {
      setListItems(initSnapshot);
    }
  }

  const handleDragEnd = () => {
    setActiveItem(null);
    setInitSnapshot(listItems);
  }

  return (
    <div className="vertical-list">
        <motion.ul>
          {listItems.map((item) => (
            <Item
              key={item}
              item={item}
              handleDragItem={handleDragItem}
              onDragStart={() => handleDragStart(item)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </motion.ul>
    </div>
  );
};

interface ItemProps {
  item: string;
  handleDragItem: (event: MouseEvent, info: PanInfo) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function Item({ item, handleDragItem, onDragStart, onDragEnd }: ItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const addItemRef = useSetAtom(addItemRefAtom);

  useEffect(() => {
    if (itemRef.current) {
      addItemRef({ ref: itemRef.current, id: item});
    }
  }, [itemRef])

  return (
    <div ref={itemRef}>
      <motion.li
        layoutId={item}
        drag
        dragElastic={1}
        dragMomentum={false}
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        className="nav-item"
        onDrag={handleDragItem}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {item}
      </motion.li>
    </div>
  );
}

export default VerticalList;

function containsPoint(element: HTMLElement, x: number, y: number) {
  const rect = element.getBoundingClientRect();

  return rect.top <= y && y <= rect.bottom && rect.left <= x && x <= rect.right;
}