import React from 'react'

const ServerError: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '50vh'
    }}>
      <h1>500 - 服务器错误</h1>
      <p>服务器遇到了问题，请稍后重试</p>
    </div>
  )
}

export default ServerError