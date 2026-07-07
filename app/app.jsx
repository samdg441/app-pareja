import { useState } from 'react';

const pixelMap = [
  [' ', ' ', 'a', 'a', ' ', ' ', ' ', 'b', 'b', ' ', ' ', ' '],
  [' ', 'a', 'f', 'f', 'f', 'a', ' ', 'b', 'f', 'f', 'f', 'b'],
  ['a', 'f', 'e', 'f', 'f', 'a', 'b', 'f', 'e', 'f', 'f', 'b'],
  ['a', 'f', 'f', 'f', 'f', 'a', 'b', 'f', 'f', 'f', 'f', 'b'],
  [' ', 'a', 'f', 'f', 'a', ' ', ' ', 'b', 'f', 'f', 'b', ' '],
  [' ', ' ', 's', 's', ' ', ' ', ' ', 't', 't', ' ', ' ', ' '],
  [' ', 's', 's', 's', 's', ' ', 't', 't', 't', 't', 't', ' '],
  [' ', ' ', ' ', 'H', 'H', ' ', ' ', 'H', 'H', ' ', ' ', ' '],
  [' ', ' ', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', ' ', ' '],
  [' ', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', ' '],
];

const defaultHairColors = ['#3b2f2f', '#a64d79', '#2b6cb0', '#3a7d3a', '#a67522'];
const defaultShirtColors = ['#e63946', '#457b9d', '#f4a261', '#2a9d8f', '#8d99ae'];
const defaultHeartColors = ['#ff6b6b', '#f08a5d', '#9d4edd'];

const resolvePixelColor = (code, leftHair, rightHair, leftShirt, rightShirt, heartColor) => {
  switch (code) {
    case 'a':
      return leftHair;
    case 'b':
      return rightHair;
    case 'f':
      return '#ffd8b1';
    case 'e':
      return '#1f1f1f';
    case 's':
      return leftShirt;
    case 't':
      return rightShirt;
    case 'H':
      return heartColor;
    default:
      return 'transparent';
  }
};

const App = () => {
  const [leftName, setLeftName] = useState('Alex');
  const [rightName, setRightName] = useState('Rae');
  const [leftHair, setLeftHair] = useState(defaultHairColors[0]);
  const [rightHair, setRightHair] = useState(defaultHairColors[2]);
  const [leftShirt, setLeftShirt] = useState(defaultShirtColors[0]);
  const [rightShirt, setRightShirt] = useState(defaultShirtColors[1]);
  const [heartColor, setHeartColor] = useState(defaultHeartColors[0]);

  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      minHeight: '100vh',
      margin: 0,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(180deg, #f8f0ff 0%, #fff1f6 100%)',
      color: '#2a2a2a'
    }}>
      <h1 style={{ margin: 0, fontSize: 32 }}>Pixel Couple</h1>
      <p style={{ maxWidth: 540, textAlign: 'center', margin: '12px 0 24px', lineHeight: 1.5 }}>
        Build a small pixel portrait for the two of you, then customize hair, shirts, and the heart color.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 24px)',
        gap: 2,
        marginBottom: 24,
        padding: 16,
        borderRadius: 24,
        background: 'rgba(255,255,255,0.9)',
        boxShadow: '0 16px 40px rgba(79, 40, 120, 0.12)'
      }}>
        {pixelMap.flatMap((row, rowIndex) =>
          row.map((cell, columnIndex) => (
            <div
              key={`${rowIndex}-${columnIndex}`}
              style={{
                width: 24,
                height: 24,
                background: resolvePixelColor(cell, leftHair, rightHair, leftShirt, rightShirt, heartColor),
                borderRadius: cell === ' ' ? 0 : 6,
                border: cell === ' ' ? 'none' : '1px solid rgba(0,0,0,0.08)'
              }}
            />
          ))
        )}
      </div>

      <div style={{
        width: '100%',
        maxWidth: 760,
        display: 'grid',
        gap: 20,
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'start'
      }}>
        <div style={{
          padding: 18,
          borderRadius: 20,
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.06)'
        }}>
          <h2 style={{ marginTop: 0, fontSize: 20 }}>Partner One</h2>
          <label style={{ display: 'block', marginBottom: 14 }}>
            Name
            <input
              value={leftName}
              onChange={(e) => setLeftName(e.target.value)}
              placeholder="Name"
              style={{
                width: '100%',
                marginTop: 8,
                padding: 10,
                borderRadius: 12,
                border: '1px solid #d9d9d9',
                fontSize: 16
              }}
            />
          </label>

          <div>
            <strong>Hair color</strong>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {defaultHairColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setLeftHair(color)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    border: leftHair === color ? '3px solid #2a2a2a' : '2px solid rgba(0,0,0,0.12)',
                    background: color,
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <strong>Shirt color</strong>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {defaultShirtColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setLeftShirt(color)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    border: leftShirt === color ? '3px solid #2a2a2a' : '2px solid rgba(0,0,0,0.12)',
                    background: color,
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{
          padding: 18,
          borderRadius: 20,
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.06)'
        }}>
          <h2 style={{ marginTop: 0, fontSize: 20 }}>Partner Two</h2>
          <label style={{ display: 'block', marginBottom: 14 }}>
            Name
            <input
              value={rightName}
              onChange={(e) => setRightName(e.target.value)}
              placeholder="Name"
              style={{
                width: '100%',
                marginTop: 8,
                padding: 10,
                borderRadius: 12,
                border: '1px solid #d9d9d9',
                fontSize: 16
              }}
            />
          </label>

          <div>
            <strong>Hair color</strong>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {defaultHairColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setRightHair(color)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    border: rightHair === color ? '3px solid #2a2a2a' : '2px solid rgba(0,0,0,0.12)',
                    background: color,
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <strong>Shirt color</strong>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {defaultShirtColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setRightShirt(color)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    border: rightShirt === color ? '3px solid #2a2a2a' : '2px solid rgba(0,0,0,0.12)',
                    background: color,
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <strong>Heart color</strong>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {defaultHeartColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setHeartColor(color)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    border: heartColor === color ? '3px solid #2a2a2a' : '2px solid rgba(0,0,0,0.12)',
                    background: color,
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 24,
        padding: '16px 20px',
        borderRadius: 18,
        background: 'rgba(255,255,255,0.95)',
        textAlign: 'center',
        maxWidth: 660
      }}>
        <strong>{leftName}</strong> + <strong>{rightName}</strong> = pixel-perfect together.
      </div>
    </div>
  );
};

export default App;
