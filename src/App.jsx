import { useState, useEffect } from 'react';
import DrawingCanvas from './DrawingCanvas';
import ProbabilityChart from './ProbabilityChart';
import './App.css';

const App = () => {
  const [probabilities, setProbabilities] = useState(new Array(10).fill(0));
  // Заменяем useRef на useState для модели
  const [model, setModel] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const tf = await import('@tensorflow/tfjs');
        await tf.setBackend('webgl');
        await tf.ready();
        const loadedModel = await tf.loadLayersModel('/model.json');
        // Сохраняем модель в стейтnpm 
        setModel(loadedModel);
        setIsModelLoaded(true);
        console.log("Нейросеть MNIST успешно загружена!");
      } catch (error) {
        console.error("Ошибка при загрузке модели:", error);
      }
    };
    loadModel();
  }, []);

  const handlePrediction = (newProbabilities) => {
    setProbabilities(newProbabilities);
  };

  return (
    <div className="app-container">
      <h1>Распознаватель рукописных цифр</h1>
      
      {!isModelLoaded ? (
        <div className="status-loading">Загрузка интеллектуальной системы...</div>
      ) : (
        <div className="main-layout">
          {/* Теперь мы передаем model из стейта, это безопасно для рендеринга */}
          <DrawingCanvas 
            model={model} 
            onPrediction={handlePrediction} 
          />
          <ProbabilityChart probabilities={probabilities} />
        </div>
      )}
      
      <p className="description">
        Нарисуйте цифру на холсте, и нейросеть распознает её в реальном времени.
      </p>
    </div>
  );
};

export default App;
