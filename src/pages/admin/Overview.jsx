import React, { useState, useEffect, useRef } from 'react';
import { Card, Avatar, Button, Input, Spin, Typography, Upload, Modal } from 'antd';
import { LikeOutlined, LikeFilled, CommentOutlined, PictureOutlined, BoldOutlined, ItalicOutlined, LinkOutlined } from '@ant-design/icons';
import { db, auth, storage } from '../../config/firebase';
import { collection, query, orderBy, limit, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const { TextArea } = Input;
const { Title } = Typography;

const Overview = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [imageUrl, setImageUrl] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const textAreaRef = useRef(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(postsQuery);
      const postsData = await Promise.all(snapshot.docs.map(async (doc) => {
        const post = { id: doc.id, ...doc.data() };
        
        // Загружаем комментарии для каждого поста
        const commentsQuery = query(
          collection(db, `posts/${doc.id}/comments`),
          orderBy('createdAt', 'desc')
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        post.comments = commentsSnapshot.docs.map(commentDoc => ({
          id: commentDoc.id,
          ...commentDoc.data()
        }));
        
        return post;
      }));
      
      setPosts(postsData);
    } catch (error) {
      console.error('Ошибка при загрузке постов:', error);
      toast.error('Не удалось загрузить посты');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setUploadLoading(true);
      const storageRef = ref(storage, `posts/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
      
      // Добавляем markdown-ссылку на изображение в текст поста
      const imageMarkdown = `![${file.name}](${url})\n`;
      setNewPost(prev => prev + imageMarkdown);
      
      toast.success('Изображение загружено');
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      toast.error('Не удалось загрузить изображение');
    } finally {
      setUploadLoading(false);
    }
  };

  const insertMarkdown = (type) => {
    const textarea = textAreaRef.current?.resizableTextArea?.textArea;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = newPost;
    let insertion = '';
    let newCursorPos = start;

    switch (type) {
      case 'bold':
        insertion = '**текст**';
        newCursorPos = start + 2;
        break;
      case 'italic':
        insertion = '_текст_';
        newCursorPos = start + 1;
        break;
      case 'link':
        insertion = '[текст](url)';
        newCursorPos = start + 1;
        break;
      default:
        return;
    }

    const newText = text.substring(0, start) + insertion + text.substring(end);
    setNewPost(newText);
    
    // Устанавливаем фокус и позицию курсора после обновления
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos + 4);
    }, 0);
  };

  const createPost = async () => {
    if (!newPost.trim()) return;
    
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'posts'), {
        content: newPost,
        authorId: user.uid,
        authorName: user.displayName || 'Аноним',
        authorAvatar: user.photoURL,
        likes: [],
        createdAt: serverTimestamp(),
        hasImage: imageUrl !== ''
      });
      
      setNewPost('');
      setImageUrl('');
      toast.success('Пост создан');
      loadPosts();
    } catch (error) {
      console.error('Ошибка при создании поста:', error);
      toast.error('Не удалось создать пост');
    }
  };

  const toggleLike = async (postId) => {
    try {
      const user = auth.currentUser;
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      
      const likes = post.likes || [];
      const newLikes = likes.includes(user.uid)
        ? likes.filter(id => id !== user.uid)
        : [...likes, user.uid];
      
      await updateDoc(postRef, { likes: newLikes });
      loadPosts();
    } catch (error) {
      console.error('Ошибка при обновлении лайка:', error);
      toast.error('Не удалось обновить лайк');
    }
  };

  const addComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, `posts/${postId}/comments`), {
        content: commentText[postId],
        authorId: user.uid,
        authorName: user.displayName || 'Аноним',
        authorAvatar: user.photoURL,
        createdAt: serverTimestamp()
      });
      
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      loadPosts();
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
      toast.error('Не удалось добавить комментарий');
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spin size="large" /></div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Title level={2} className="mb-6">Новости и обсуждения</Title>
      
      {/* Форма создания поста */}
      <Card className="mb-6">
        <div className="mb-2 flex gap-2">
          <Button icon={<BoldOutlined />} onClick={() => insertMarkdown('bold')} />
          <Button icon={<ItalicOutlined />} onClick={() => insertMarkdown('italic')} />
          <Button icon={<LinkOutlined />} onClick={() => insertMarkdown('link')} />
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              handleImageUpload(file);
              return false;
            }}
          >
            <Button icon={<PictureOutlined />} loading={uploadLoading}>
              Добавить изображение
            </Button>
          </Upload>
        </div>
        
        <TextArea
          ref={textAreaRef}
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Что нового? Поддерживается markdown форматирование"
          autoSize={{ minRows: 3, maxRows: 6 }}
          className="mb-4"
        />
        
        {imageUrl && (
          <div className="mb-4">
            <img 
              src={imageUrl} 
              alt="Preview" 
              style={{ maxHeight: 200, cursor: 'pointer' }}
              onClick={() => setPreviewVisible(true)}
            />
          </div>
        )}
        
        <Button type="primary" onClick={createPost}>
          Опубликовать
        </Button>
      </Card>

      {/* Модальное окно для предпросмотра изображения */}
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="Preview" style={{ width: '100%' }} src={imageUrl} />
      </Modal>

      {/* Лента постов */}
      {posts.map(post => (
        <Card 
          key={post.id} 
          className="mb-4"
          actions={[
            <Button 
              type="text" 
              icon={post.likes?.includes(auth.currentUser?.uid) ? <LikeFilled /> : <LikeOutlined />}
              onClick={() => toggleLike(post.id)}
            >
              {post.likes?.length || 0}
            </Button>,
            <Button 
              type="text" 
              icon={<CommentOutlined />}
              onClick={() => toggleComments(post.id)}
            >
              {post.comments?.length || 0}
            </Button>
          ]}
        >
          <Card.Meta
            avatar={<Avatar src={post.authorAvatar} />}
            title={post.authorName}
            description={
              <div>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                  </ReactMarkdown>
                </div>
                <small className="text-gray-500">
                  {post.createdAt?.toDate().toLocaleString()}
                </small>
              </div>
            }
          />
          
          {/* Секция комментариев */}
          {showComments[post.id] && (
            <div className="mt-4">
              <div className="mb-4">
                <Input.Group compact>
                  <Input
                    style={{ width: 'calc(100% - 100px)' }}
                    value={commentText[post.id] || ''}
                    onChange={(e) => setCommentText(prev => ({
                      ...prev,
                      [post.id]: e.target.value
                    }))}
                    placeholder="Написать комментарий..."
                  />
                  <Button type="primary" onClick={() => addComment(post.id)}>
                    Отправить
                  </Button>
                </Input.Group>
              </div>
              
              {post.comments?.map(comment => (
                <Card key={comment.id} size="small" className="mb-2">
                  <Card.Meta
                    avatar={<Avatar src={comment.authorAvatar} size="small" />}
                    title={comment.authorName}
                    description={
                      <div>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {comment.content}
                        </ReactMarkdown>
                        <small className="text-gray-500">
                          {comment.createdAt?.toDate().toLocaleString()}
                        </small>
                      </div>
                    }
                  />
                </Card>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default Overview; 