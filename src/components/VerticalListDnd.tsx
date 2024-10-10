import { useRef, useState } from 'react';
import { useDnd } from './useDnd';

const IDS = ['Home-v', 'About-v', 'Services-v', 'Contact-v', 'Profile-v'];

import '../styles/VerticalList.css';

function VerticalListDnd() {
  const { DndProvider, ItemWrapper } = useDnd({ id: 'vertical-list'});
  const [items, setItems] = useState(IDS.map((id) => ({ id })));

  const listRef = useRef<HTMLDivElement>(null);

  return (
    <DndProvider
      id="vertical-list"
      listRef={listRef}
      items={items}
      setItems={setItems}
      connectedContexts={['navbar']}
      // keepItems
    >
      <div
        id="vertical-list"
        className="vertical-list"
        ref={listRef}
      >
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
}

export default VerticalListDnd;
