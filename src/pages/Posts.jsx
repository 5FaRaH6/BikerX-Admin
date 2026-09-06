import { useEffect, useState } from 'react';

import Sidebar from '../components/Sidebar';
import { API_URL } from '../services/api';
import { handleUnauthorized } from '../services/auth';

import '../styles/Posts.css';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getPosts();
  }, []);

  async function getPosts() {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/Admin/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setError('Could not load posts.');
        return;
      }

      setPosts(data);
    }
    catch (error) {
      console.log(error);
      setError('Could not connect to the server.');
    }
  }

  async function deletePost(postId) {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this post?'
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/Admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Could not delete post.');
        return;
      }

      setPosts(posts.filter(post => post.postId !== postId));
    }
    catch (error) {
      console.log(error);
      setError('Could not connect to the server.');
    }
  }

  const filteredPosts = posts.filter(post => {
    const value = search.toLowerCase();

    return (
      post.about?.toLowerCase().includes(value) ||
      post.description?.toLowerCase().includes(value) ||
      post.address?.toLowerCase().includes(value)
    );
  });

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="posts-content">
        <div className="posts-header">
          <div>
            <h1>Posts</h1>
            <p>Manage posts shared on BikerX</p>
          </div>

          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <p className="posts-error">{error}</p>}

        <div className="posts-grid">
          {filteredPosts.map(post => (
            <div className="post-card" key={post.postId}>

              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="post-image"
                />
              )}

              <div className="post-info">
                <h3>{post.about}</h3>

                {post.description && (
                  <p className="post-description">
                    {post.description}
                  </p>
                )}

                {post.address && (
                  <p className="post-detail">
                    Location: {post.address}
                  </p>
                )}

                <p className="post-date">
                  {new Date(post.createdAt).toLocaleString()}
                </p>

                <button
                  className="delete-post-button"
                  onClick={() => deletePost(post.postId)}
                >
                  Delete Post
                </button>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Posts;