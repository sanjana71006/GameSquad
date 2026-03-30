import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import Navbar from '../../components/Navbar';
import { Target, Clock, Trophy, Play } from 'lucide-react';

const GAMES = [
  { id: 'arrow-path', name: 'Arrow Path Puzzle', desc: 'Navigate the grid based on logic and direction.', color: 'var(--accent-blue)' },
  { id: 'memory-grid', name: 'Memory Grid Game', desc: 'Remember the positions of the activated squares.', color: 'var(--accent-purple)' },
  { id: 'arithmetic-speed', name: 'Arithmetic Speed', desc: 'Calculate operations as fast as you can.', color: 'var(--accent-green)' },
  { id: 'number-series', name: 'Number Series', desc: 'Find the missing number in the patterns.', color: 'var(--accent-red)' },
  { id: 'logic-decision', name: 'Logic Decision', desc: 'Choose the correct outcome based on logical rules.', color: '#ffea00' },
  { id: 'crunch-match', name: 'Crunch — Mental Math', desc: 'Tap bubbles in order — by value, not by looks.', color: '#00D1FF' }
];

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (!analytics) return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Loading Dashboard...</div>;

  const chartData = {
    labels: ['Wins', 'Losses'],
    datasets: [{
      data: [analytics.wins, analytics.losses],
      backgroundColor: ['rgba(57, 255, 20, 0.8)', 'rgba(255, 51, 102, 0.8)'],
      borderColor: ['var(--bg-dark)', 'var(--bg-dark)'],
      borderWidth: 2
    }]
  };

  const winRatio = analytics.winRatio.toFixed(1);

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '40px 20px' }}>
        
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <motion.div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }} whileHover={{ y: -5 }}>
            <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '15px', borderRadius: '50%' }}>
              <Trophy color="var(--accent-blue)" size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Win Ratio</p>
              <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{winRatio}%</h3>
            </div>
          </motion.div>

          <motion.div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }} whileHover={{ y: -5 }}>
            <div style={{ background: 'rgba(176, 38, 255, 0.1)', padding: '15px', borderRadius: '50%' }}>
              <Target color="var(--accent-purple)" size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Accuracy</p>
              <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{analytics.avgAccuracy.toFixed(1)}%</h3>
            </div>
          </motion.div>

          <motion.div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }} whileHover={{ y: -5 }}>
            <div style={{ background: 'rgba(57, 255, 20, 0.1)', padding: '15px', borderRadius: '50%' }}>
              <Clock color="var(--accent-green)" size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Games Played</p>
              <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{analytics.totalGames}</h3>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
          
          {/* Games List */}
          <div>
            <h2 className="text-gradient" style={{ marginBottom: '20px' }}>Game Arena</h2>
            <div style={{ display: 'grid', gap: '20px' }}>
              {GAMES.map((game, i) => {
                const currentLevel = analytics.progress[game.id] || 1;
                return (
                  <motion.div 
                    key={game.id}
                    className="glass-panel"
                    style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${game.color}` }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: game.color }}>{game.name}</h3>
                      <p style={{ color: 'var(--text-secondary)', margin: '0 0 10px 0', fontSize: '0.9rem' }}>{game.desc}</p>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>
                          Current Level: {currentLevel}/5
                        </span>
                      </div>
                    </div>
                    <button 
                      className="btn-primary" 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      onClick={() => navigate(`/game/${game.id}`)}
                    >
                      <Play size={16} /> Play
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Charts */}
          <div>
            <h2 className="text-gradient" style={{ marginBottom: '20px' }}>Performance</h2>
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Win / Loss</h4>
              {analytics.totalGames > 0 ? (
                <div style={{ width: '200px', margin: '0 auto' }}>
                  <Pie data={chartData} options={{ plugins: { legend: { position: 'bottom', labels: { color: 'white' } } } }} />
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No games played yet.</p>
              )}
            </div>
            
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Roadmap</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {GAMES.map(g => (
                  <div key={g.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{g.name}</span>
                      <span>Lvl {(analytics.progress[g.id] || 1)}/5</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                      <div style={{ width: `${((analytics.progress[g.id] || 1)/5)*100}%`, height: '100%', background: g.color, borderRadius: '3px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
};

export default Dashboard;
