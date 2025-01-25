exports.setAdmin = functions.https.onCall(async (data, context) => {
  // Проверяем, что запрос от существующего пользователя
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Требуется аутентификация'
    );
  }

  const uid = data.uid || context.auth.uid;
  
  try {
    await admin.auth().setCustomUserClaims(uid, {
      admin: true
    });
    
    return {
      result: `Права администратора успешно установлены для пользователя ${uid}`
    };
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Ошибка при установке прав администратора'
    );
  }
}); 