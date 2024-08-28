import { useRef, useState } from 'react';
import { useDnd } from './useDnd';
import { AnimatePresence, motion } from 'framer-motion';

const IDS = ['Home-v', 'About-v', 'Services-v', 'Contact-v', 'Profile-v'];

import '../styles/VerticalList.css';

function VerticalListDnd() {
  const { DndProvider, ItemWrapper } = useDnd();
  const [items, setItems] = useState(IDS);

  const listRef = useRef<HTMLDivElement>(null);

  return (
    <DndProvider
      id="vertical-list"
      listRef={listRef}
      items={items}
      setItems={setItems}
      connectedContexts={['navbar']}
    >
      <div
        id="vertical-list"
        className="vertical-list"
        ref={listRef}
      >
        {items.map((item) => (
          <ItemWrapper key={item} id={item}>
            <AnimatePresence>
              <motion.div
                className="nav-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="nav-item-point" />
                {item}
              </motion.div>
            </AnimatePresence>
          </ItemWrapper>
        ))}
      </div>
    </DndProvider>
  );
}

export default VerticalListDnd;
