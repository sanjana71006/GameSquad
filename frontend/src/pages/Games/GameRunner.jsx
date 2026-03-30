import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ArrowPathPuzzle from './ArrowPathPuzzle/ArrowPathPuzzle';
import MemoryGridGame from './MemoryGridGame/MemoryGridGame';
import ArithmeticSpeedGame from './ArithmeticSpeedGame/ArithmeticSpeedGame';
import NumberSeriesGame from './NumberSeriesGame/NumberSeriesGame';
import LogicDecisionGame from './LogicDecisionGame/LogicDecisionGame';
import CrunchMatch from './CrunchMatch/CrunchMatch';
import { ArrowLeft } from 'lucide-react';

const GameRunner = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const renderGame = () => {
    switch(gameId) {
      case 'arrow-path': return <ArrowPathPuzzle />;
      case 'memory-grid': return <MemoryGridGame />;
      case 'arithmetic-speed': return <ArithmeticSpeedGame />;
      case 'number-series': return <NumberSeriesGame />;
      case 'logic-decision': return <LogicDecisionGame />;
      case 'crunch-match': return <CrunchMatch />;
      default: return <div style={{color:'var(--text-primary)', textAlign:'center', marginTop:'50px'}}>Game not found</div>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="container" style={{ flexGrow: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn-outline" 
          style={{ alignSelf: 'flex-start', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        
        <div className="glass-panel" style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
          {renderGame()}
        </div>
      </div>
    </div>
  );
};

export default GameRunner;
