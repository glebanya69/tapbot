import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [clicks, setClicks] = useState(0);
  const [energy, setEnergy] = useState(1000);
  const [userId, setUserId] = useState('local_user');
  const [webApp, setWebApp] = useState(null);
  const [isTelegram, setIsTelegram] = useState(false);

  // Инициализация (работает везде)
  useEffect(() => {
    // Проверяем, открыто ли приложение в Telegram
    const telegram = window.Telegram?.WebApp;
    
    if (telegram) {
      // Мы в Telegram!
      setIsTelegram(true);
      setWebApp(telegram);
      telegram.ready();
      telegram.expand();
      telegram.setHeaderColor('#667eea');
      
      // Получаем ID пользователя Telegram
      const user = telegram.initDataUnsafe?.user;
      if (user) {
        setUserId(`tg_${user.id}`);
      }
    } else {
      // Мы в браузере (для разработки)
      console.log('Работаем в браузере');
      setUserId('browser_user');
    }
  }, []);

  // Загружаем сохраненные клики
  useEffect(() => {
    const saved = localStorage.getItem(`clicks_${userId}`);
    if (saved) {
      setClicks(parseInt(saved));
    }
  }, [userId]);

  // Функция клика
  const handleTap = (e) => {
    if (energy > 0) {
      // Координаты для анимации
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Анимация +1
      const plusOne = document.createElement('div');
      plusOne.className = 'plus-one';
      plusOne.textContent = '+1';
      plusOne.style.left = x + 'px';
      plusOne.style.top = y + 'px';
      e.currentTarget.appendChild(plusOne);
      
      setTimeout(() => {
        plusOne.remove();
      }, 500);
      
      // Обновляем счет
      const newClicks = clicks + 1;
      const newEnergy = energy - 1;
      
      setClicks(newClicks);
      setEnergy(newEnergy);
      
      // Сохраняем
      localStorage.setItem(`clicks_${userId}`, newClicks);
    }
  };

  // Восстановление энергии
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(prev + 1, 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Отправка результата в Telegram
  const sendToBot = () => {
    if (isTelegram && webApp) {
      webApp.sendData(JSON.stringify({
        clicks: clicks,
        user_id: userId
      }));
      webApp.showPopup({
        title: 'Успех!',
        message: `Ты накликал ${clicks} очков!`,
        buttons: [{type: 'close'}]
      });
    } else {
      alert(`В Telegram ты бы отправил ${clicks} очков боту!`);
    }
  };

  return (
    <div className="App">
      <div className="stats">
        <div className="score">
          <span>💰 Очки:</span>
          <span className="value">{clicks}</span>
        </div>
        <div className="energy">
          <span>⚡️ Энергия:</span>
          <span className="value">{energy}/1000</span>
          <div className="energy-bar">
            <div 
              className="energy-fill" 
              style={{ width: `${(energy/1000)*100}%` }}
            />
          </div>
        </div>
        {!isTelegram && (
          <div style={{textAlign: 'center', marginTop: '10px', fontSize: '12px', opacity: 0.7}}>
            ⚡️ Режим разработки (не в Telegram)
          </div>
        )}
      </div>
      
      <div className="tap-container">
        <div className="tap-area" onClick={handleTap}>
          <div className={`coin ${energy <= 0 ? 'disabled' : ''}`}>
            <span>🪙</span>
          </div>
          <p className="tap-text">
            {energy > 0 ? 'Тапай по монете!' : 'Нет энергии ⏳'}
          </p>
        </div>
      </div>
      
      <div className="buttons">
        <button 
          className="save-btn"
          onClick={sendToBot}
        >
          📤 {isTelegram ? 'Сохранить' : 'Сохранить (тест)'}
        </button>
      </div>
    </div>
  );
}

export default App;