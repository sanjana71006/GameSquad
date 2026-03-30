import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { motion } from 'framer-motion';

// difficulty scaling: grid size, sequence length, time limit
const LEVELS = [
  { level: 1, gridSize: 3, seqLength: 4, time: 30 },
  { level: 2, gridSize: 4, seqLength: 6, time: 45 },
  { level: 3, gridSize: 5, seqLength: 8, time: 60 },
  { level: 4, gridSize: 6, seqLength: 10, time: 75 },
  { level: 5, gridSize: 7, seqLength: 12, time: 90 },
];

const ArrowPathPuzzle = () => {
  const { token, user } = useContext(AuthContext);
  const userProgress = user?.progress || {};
  const currentUnlocked = userProgress['arrow-path'] || 1;

  const [level, setLevel] = useState(currentUnlocked);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [playerPath, setPlayerPath] = useState([]);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // start corner
  
  const [timeLeft, setTimeLeft] = useState(LEVELS[level-1].time);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, playing, won, lost
  const [score, setScore] = useState(0);
  
  const config = LEVELS[level-1];

  const directions = [
    { label: '↑', dx: 0, dy: -1 },
    { label: '↓', dx: 0, dy: 1 },
    { label: '←', dx: -1, dy: 0 },
    { label: '→', dx: 1, dy: 0 }
  ];

  // Generator
  const generateSequence = () => {
    const seq = [];
    let curX = 0, curY = 0;
    for(let i=0; i<config.seqLength; i++) {
        // Find valid moves
        const valid = directions.filter(d => {
            const nx = curX + d.dx;
            const ny = curY + d.dy;
            return nx >= 0 && nx < config.gridSize && ny >= 0 && ny < config.gridSize;
        });
        const move = valid[Math.floor(Math.random() * valid.length)];
        seq.push(move.label);
        curX += move.dx;
        curY += move.dy;
    }
    return seq;
  };

  const startGame = () => {
    setSequence(generateSequence());
    setPlayerPath([]);
    setPosition({ x: 0, y: 0 });
    setTimeLeft(config.time);
    setIsPlaying(true);
    setGameStatus('playing');
    setScore(0);
  };

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isPlaying && timeLeft === 0) {
      endGame('loss');
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const handleMove = (dirLabel, dx, dy) => {
    if (!isPlaying) return;
    
    const nx = position.x + dx;
    const ny = position.y + dy;
    
    if (nx >= 0 && nx < config.gridSize && ny >= 0 && ny < config.gridSize) {
      setPosition({ x: nx, y: ny });
      const newPath = [...playerPath, dirLabel];
      setPlayerPath(newPath);

      // Check against sequence
      const isCorrectSoFar = newPath.every((step, i) => step === sequence[i]);
      if (!isCorrectSoFar) {
         endGame('loss');
      } else if (newPath.length === sequence.length) {
         setScore((config.time * 10) + (level * 100)); // calculate score
         endGame('win');
      }
    }
  };

  const endGame = async (result) => {
    setIsPlaying(false);
    setGameStatus(result);

    const finalScore = result === 'win' ? (timeLeft * 10) + (level * 100) : 0;
    
    // API Call
    try {
      const res = await fetch('/api/games/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          gameId: 'arrow-path',
          level,
          score: finalScore,
          timeToComplete: config.time - timeLeft,
          result,
          accuracy: result === 'win' ? 100 : Math.floor((playerPath.length / sequence.length)*100),
          moves: playerPath.length
        })
      });
      const data = await res.json();
      if (data.updatedLevel) {
        // Technically we should update user context, but local state manages for now
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px' }}>
      
      {/* Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 className="text-gradient">Arrow Path</h2>
          <select 
            className="form-input" 
            style={{ width: '150px', padding: '8px' }} 
            value={level} 
            onChange={(e) => setLevel(Number(e.target.value))}
            disabled={isPlaying}
          >
            {[1, 2, 3, 4, 5].map(l => (
              <option key={l} value={l} disabled={l > currentUnlocked && currentUnlocked < 5}>
                Level {l} {l > currentUnlocked ? '🔒' : ''}
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--accent-blue)', fontSize: '1.5rem', fontWeight: 'bold' }}>00:{timeLeft.toString().padStart(2, '0')}</div>
          {score > 0 && <div style={{ color: 'var(--accent-green)' }}>Score: {score}</div>}
        </div>
      </div>

      {gameStatus === 'idle' && (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <button className="btn-primary" style={{ padding: '15px 40px', fontSize: '1.2rem' }} onClick={startGame}>
            Start Level {level}
          </button>
        </motion.div>
      )}

      {/* Game Area */}
      {(isPlaying || gameStatus !== 'idle') && (
        <div style={{ display: 'flex', gap: '40px', marginTop: '20px', alignItems: 'flex-start' }}>
          
          {/* Target Sequence Display */}
          <div className="glass-panel" style={{ padding: '20px', width: '200px' }}>
            <h4 style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-secondary)' }}>Follow the Path</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {sequence.map((dir, i) => (
                <div key={i} style={{ 
                  width: '35px', height: '35px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i < playerPath.length ? 'rgba(57, 255, 20, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${i < playerPath.length ? 'var(--accent-green)' : 'var(--border-light)'}`,
                  borderRadius: '6px',
                  color: i < playerPath.length ? 'var(--accent-green)' : 'white'
                }}>
                  {dir}
                </div>
              ))}
            </div>
          </div>

          {/* Grid Area */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${config.gridSize}, 60px)`, 
            gap: '8px',
            background: 'rgba(0,0,0,0.3)',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--border-light)'
          }}>
            {Array.from({ length: config.gridSize * config.gridSize }).map((_, idx) => {
              const x = idx % config.gridSize;
              const y = Math.floor(idx / config.gridSize);
              const isActive = position.x === x && position.y === y;
              return (
                <motion.div 
                  key={idx}
                  style={{
                    width: '60px', height: '60px', borderRadius: '10px',
                    background: isActive ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                    boxShadow: isActive ? 'var(--glow-blue)' : 'none',
                    border: '1px solid var(--border-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isActive && <span style={{ color: 'black', fontWeight: 'bold' }}>P</span>}
                </motion.div>
              );
            })}
          </div>

        </div>
      )}

      {/* Controls */}
      {isPlaying && (
        <div style={{ marginTop: '30px', display: 'grid', gridTemplateAreas: '". up ." "left down right"', gap: '10px' }}>
            <button className="btn-outline" style={{ gridArea: 'up' }} onClick={() => handleMove('↑', 0, -1)}>↑</button>
            <button className="btn-outline" style={{ gridArea: 'left' }} onClick={() => handleMove('←', -1, 0)}>←</button>
            <button className="btn-outline" style={{ gridArea: 'down' }} onClick={() => handleMove('↓', 0, 1)}>↓</button>
            <button className="btn-outline" style={{ gridArea: 'right' }} onClick={() => handleMove('→', 1, 0)}>→</button>
        </div>
      )}

      {/* Status Overlay */}
      {gameStatus === 'win' && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ position: 'absolute', background: 'rgba(0,0,0,0.8)', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, backdropFilter: 'blur(10px)' }}
        >
            <h1 style={{ color: 'var(--accent-green)', fontSize: '4rem', textShadow: 'var(--glow-green)' }}>LEVEL CLEARED!</h1>
            <p>Score: {score}</p>
            <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => { setGameStatus('idle'); setIsPlaying(false); }}>Next Challenge</button>
        </motion.div>
      )}

      {gameStatus === 'loss' && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ position: 'absolute', background: 'rgba(50,0,0,0.8)', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, backdropFilter: 'blur(10px)' }}
        >
            <h1 style={{ color: 'var(--accent-red)', fontSize: '4rem' }}>MISSION FAILED</h1>
            <p>Incorrect path or ran out of time.</p>
            <button className="btn-outline" style={{ marginTop: '20px', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }} onClick={() => { setGameStatus('idle'); setIsPlaying(false); }}>Retry</button>
        </motion.div>
      )}

    </div>
  );
};

export default ArrowPathPuzzle;
