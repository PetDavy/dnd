import React, { useEffect, useRef, useState } from 'react';
import { useDnd } from './useDnd';
import '../styles/Navbar.css';
// const IDS = ['Home', 'About', 'Services', 'Contact', 'Profile'];
const IDS = ['Home', 'About'];

const Navbar: React.FC = () => {
  const { DndProvider, ItemWrapper, savedItems } = useDnd({ id: 'navbar'});

  const [items, setItems] = useState(IDS.map((id) => ({ id })));

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('savedItems', savedItems);
  }, [savedItems]);

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
          <ItemWrapper key={item.id} item={item}>
            <div className="nav-item">
              <div className="nav-item-point" />
              <span>{item.id}</span> 
            </div>
          </ItemWrapper>
        ))}
      </div>

    </DndProvider>
  );
};

export default Navbar;
