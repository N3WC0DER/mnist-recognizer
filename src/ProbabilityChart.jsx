const ProbabilityChart = ({ probabilities }) => {
  // Находим индекс цифры с максимальной вероятностью для подсветки [2]
  const maxProb = Math.max(...probabilities);
  
  return (
    <div className="chart-section">
      <h3>Результаты распознавания</h3>
      {probabilities.map((prob, index) => {
        // Условие для активации подсветки (подсвечиваем, если это максимум и вероятность > 10%)
        const isActive = prob === maxProb && prob > 0.1;
        
        return (
          <div key={index} className="chart-row">
            {/* Метка цифры (от 0 до 9) [2] */}
            <span className="digit-label">{index}</span>
            
            {/* Контейнер и динамическая полоска вероятности [1, 2] */}
            <div className="bar-container">
              <div 
                className={`bar ${isActive ? 'active' : ''}`}
                style={{ width: `${(prob * 100).toFixed(2)}%` }}
              ></div>
            </div>
            
            {/* Текстовое значение вероятности в процентах */}
            <span className="prob-value">
              {Math.round(prob * 100)}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ProbabilityChart;
