import { useState } from 'react';
import { useDnd } from './useDnd';

const IDS = ['Home-v', 'About-v', 'Services-v', 'Contact-v', 'Profile-v'];

import '../styles/VerticalList.css';

function VerticalListDnd() {
  const { Container, ItemWrapper } = useDnd();

  const [items, setItems] = useState(IDS);
  // console.log('items', items);

  return (
      <Container
        id="vertical-list"
        listItems={items}
        setListItems={setItems}
        className="vertical-list"
      >
        {items.map((item) => (
          <ItemWrapper
            key={`vertical&${item}`}
            id={item}
            containerId="vertical-list"
          >
            <div className="nav-item">
              <div className="nav-item-point" />
              {item}
            </div>
          </ItemWrapper>
        ))}
      </Container>
  );
}

export default VerticalListDnd;
