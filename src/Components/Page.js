import React from 'react';

export default function Page() {
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '90vh',
      border:"4px solid #dddddd35"
    },
    text: {
      fontSize: '2em',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.text}>Select a Chat to start your conversation!</div>
    </div>
  );
}
