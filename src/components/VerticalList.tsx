import React from 'react';
import '../styles/VerticalList.css';

const VerticalList: React.FC = () => {
  const listItems = ['Home', 'About', 'Services', 'Contact', 'Profile'];

  return (
    <div className="vertical-list">
      <ul>
        {listItems.map((item, index) => (
          <li key={index} className="nav-item">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VerticalList;