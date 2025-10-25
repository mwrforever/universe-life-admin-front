import React from 'react'

const NotFound: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '50vh'
    }}>
      <h1>404 - 页面未找到</h1>
      <p>您访问的页面不存在</p>
    </div>
  )
}

export default NotFound