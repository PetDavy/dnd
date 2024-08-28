import React, { useRef, useState } from 'react';
import { useDnd } from './useDnd';
import '../styles/Navbar.css';
// const IDS = ['Home', 'About', 'Services', 'Contact', 'Profile'];
const IDS = ['Home', 'About'];

const Navbar: React.FC = () => {
  const { DndProvider, ItemWrapper } = useDnd();

  const [items, setItems] = useState(IDS);

  const listRef = useRef<HTMLDivElement>(null);

  return (
    <DndProvider
      id="navbar"
      items={items}
      listRef={listRef}
      setItems={setItems}
      connectedContexts={['vertical-list']}
    >
      <div className="navbar" ref={listRef}>
        {items.map((item) => (
          <ItemWrapper key={item} id={item}>
            <div className="nav-item">
              <div className="nav-item-point" />
              {item}
            </div>
          </ItemWrapper>
        ))}
      </div>

    </DndProvider>
  );
};

export default Navbar;
