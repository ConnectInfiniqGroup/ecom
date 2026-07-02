import React, { useEffect } from "react";

const CheckoutCard = ({ id, title, address, selected, onChange }) => {
  useEffect (() => {
    // console.log("Selected Address Updated:", selected);
  }, [selected]);
  return (
    <div className="col-md-6 mb-3">
      <div 
        className={`bg-white p-4 h-100 ${selected ? 'shadow-md border-primary' : 'shadow-sm border-light'} hover-lift`} 
        style={{ borderRadius: 'var(--radius-md)', border: '2px solid transparent', transition: 'all var(--ease-normal)', cursor: 'pointer' }}
        onClick={() => onChange({ target: { id, checked: true } })}
      >
        <div className="form-check d-flex align-items-center mb-0">
          <input
            type="radio"
            className="form-check-input mt-0 me-3"
            style={{ width: '20px', height: '20px' }}
            id={id}
            name="checkoutAddress"
            checked={selected}
            onChange={onChange}
          />
          <label className="form-check-label w-100" htmlFor={id} style={{ cursor: 'pointer' }}>
            <strong className="d-block fs-6 mb-1 text-dark">{title}</strong>
            <p className="mb-0 text-muted lh-base">{address}</p>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCard;
