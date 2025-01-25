import mysql from 'mysql2/promise'

// Создаем пул соединений
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'esaisaas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Проверяем соединение
pool.getConnection()
  .then(connection => {
    console.log('Успешное подключение к базе данных');
    connection.release();
  })
  .catch(error => {
    console.error('Ошибка подключения к базе данных:', error);
  });

export default pool; 