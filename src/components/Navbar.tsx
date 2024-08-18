import React, { useState } from 'react';
import { useDnd } from './useDnd';
import '../styles/Navbar.css';
// const IDS = ['Home', 'About', 'Services', 'Contact', 'Profile'];
const IDS = ['Home', 'About'];

const Navbar: React.FC = () => {
  const { Container, ItemWrapper } = useDnd();

  const [items, setItems] = useState(IDS);

  return (
    <Container
      id="navbar"
      className="navbar"
      listItems={items}
      setListItems={setItems}
    >
      {items.map((item) => (
        <ItemWrapper
          key={`navbar&${item}`}
          id={item}
          containerId="navbar"
          className="navbar-item"
        >
          <div className="nav-item">
            <div className="nav-item-point" />
            {item}
          </div>
        </ItemWrapper>
      ))}
    </Container>
  );
};

export default Navbar;
