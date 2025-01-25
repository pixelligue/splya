import { getFunctions, httpsCallable } from 'firebase/functions';

const Auth = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const makeAdmin = async () => {
    try {
      setLoading(true);
      const functions = getFunctions();
      const setAdmin = httpsCallable(functions, 'setAdmin');
      const result = await setAdmin();
      message.success('Права администратора успешно установлены');
      // Перезагружаем страницу для обновления токена
      window.location.reload();
    } catch (error) {
      console.error('Error making admin:', error);
      message.error('Ошибка при установке прав администратора');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        {user ? (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Вы уже вошли в систему</h2>
              <p className="mt-2 text-gray-600">{user.email}</p>
            </div>
            <div className="flex flex-col gap-4">
              <Button 
                type="primary" 
                onClick={makeAdmin}
                loading={loading}
                className="w-full"
              >
                Установить права администратора
              </Button>
              <Button 
                onClick={() => getAuth().signOut()} 
                className="w-full"
              >
                Выйти
              </Button>
            </div>
          </div>
        ) : (
          // ... existing login buttons ...
        )}
      </div>
    </div>
  );
}; 