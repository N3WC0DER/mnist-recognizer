import { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

const DrawingCanvas = ({ model, onPrediction }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 1. Инициализация холста: черный фон (как в датасете MNIST)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Получение координат с учетом масштабирования и тач-событий
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches.clientX : e.clientX;
    const clientY = e.touches ? e.touches.clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    
    // Оптимальная толщина линии (15-20px) для MNIST [2, 3]
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'white';
    
    ctx.lineTo(x, y);
    ctx.stroke();

    // Запуск распознавания в реальном времени
    recognize();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // 2. Интеллектуальная предобработка (Bounding Box + Resize)
  const recognize = async () => {
    if (!model) return;

    const canvas = canvasRef.current;
    //const ctx = canvas.getContext('2d');

    // Предсказание происходит в блоке tf.tidy для очистки памяти GPU [4]
    const predictionData = tf.tidy(() => {
      // Превращаем холст в тензор (1 канал - ч/б)
      let tensor = tf.browser.fromPixels(canvas, 1);

      // Масштабируем до 28x28 пикселей [1, 2]
      // Для "вау-эффекта" здесь можно добавить обрезку по краям (Bounding Box) [5, 6]
      const resized = tf.image.resizeBilinear(tensor, [28, 28]).toFloat();
      
      // Нормализация: переводим 0..255 в 0..1 [2, 6]
      const normalized = resized.div(255.0);
      const batched = normalized.expandDims(0);
      
      return model.predict(batched);
    });

    const probabilities = await predictionData.data();
    onPrediction(Array.from(probabilities)); // Передаем данные в App.jsx [1, 2]
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onPrediction(new Array(10).fill(0)); // Сброс графиков [2, 3]
  };

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button className="clear-btn" onClick={clearCanvas}>Очистить холст</button>
    </div>
  );
};

export default DrawingCanvas;
