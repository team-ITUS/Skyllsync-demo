import React from 'react'

function CustomAction({action, onClickFunc, title, icon}) {
  return (
    <>
        <div onClick={onClickFunc} className="col-2 d-flex align-items-center">
            <img src={icon} alt={title} /> {action}
        </div>
    </>
  )
}

export default CustomAction