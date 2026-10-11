import { useEffect, useState } from 'react';

import Sidebar from '../components/Sidebar';
import { API_URL } from '../services/api';
import { handleUnauthorized } from '../services/auth';

import '../styles/BikeModels.css';

function BikeModels() {
  const [models, setModels] = useState([]);

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [modelUrl, setModelUrl] = useState('');

  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getModels();
  }, []);

  async function getModels() {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(
        `${API_URL}/Admin/bike-models`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setError('Could not load 3D bike models.');
        return;
      }

      setModels(data);
    }
    catch (error) {
      console.log(error);
      setError('Could not connect to the server.');
    }
  }

  function clearForm() {
    setBrand('');
    setModel('');
    setYear('');
    setModelUrl('');
    setEditingId(null);
  }

  function startEdit(bike) {
    setEditingId(bike.model3DId);

    setBrand(bike.brand);
    setModel(bike.model);
    setYear(String(bike.year));
    setModelUrl(bike.modelUrl);

    setError('');
    setSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function saveModel(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (
      brand.trim() === '' ||
      model.trim() === '' ||
      year === '' ||
      modelUrl.trim() === ''
    ) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem('adminToken');

      const url = editingId
        ? `${API_URL}/Admin/bike-models/${editingId}`
        : `${API_URL}/Admin/bike-models`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          brand: brand.trim(),
          model: model.trim(),
          year: Number(year),
          modelUrl: modelUrl.trim(),
        }),
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.message ||
          'Could not save 3D bike model.'
        );
        return;
      }

      if (editingId) {
        setModels(currentModels =>
          currentModels.map(item =>
            item.model3DId === editingId
              ? data
              : item
          )
        );

        setSuccess(
          '3D bike model updated successfully.'
        );
      }
      else {
        setModels(currentModels => [
          ...currentModels,
          data,
        ]);

        setSuccess(
          '3D bike model added successfully.'
        );
      }

      clearForm();
    }
    catch (error) {
      console.log(error);
      setError('Could not connect to the server.');
    }
    finally {
      setLoading(false);
    }
  }

  async function deleteModel(bike) {
    const confirmed = window.confirm(
      `Delete ${bike.brand} ${bike.model}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      const token = localStorage.getItem('adminToken');

      const response = await fetch(
        `${API_URL}/Admin/bike-models/${bike.model3DId}`,
        {
          method: 'DELETE',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.message ||
          'Could not delete 3D bike model.'
        );
        return;
      }

      setModels(currentModels =>
        currentModels.filter(
          item =>
            item.model3DId !== bike.model3DId
        )
      );

      if (editingId === bike.model3DId) {
        clearForm();
      }

      setSuccess(
        '3D bike model deleted successfully.'
      );
    }
    catch (error) {
      console.log(error);

      setError(
        'Could not connect to the server.'
      );
    }
  }

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="bike-models-content">

        <div className="bike-models-header">
          <h1>3D Bikes</h1>

          <p>
            Manage the available 3D bike models
          </p>
        </div>

        <div className="bike-models-grid">

          <div className="bike-model-form-card">

            <h2>
              {editingId
                ? 'Edit 3D Bike'
                : 'Add 3D Bike'}
            </h2>

            <form onSubmit={saveModel}>

              <label>Brand</label>

              <input
                type="text"
                placeholder="Example: Yamaha"
                value={brand}
                onChange={event =>
                  setBrand(event.target.value)
                }
              />

              <label>Model</label>

              <input
                type="text"
                placeholder="Example: YZF-R3"
                value={model}
                onChange={event =>
                  setModel(event.target.value)
                }
              />

              <label>Year</label>

              <input
                type="number"
                placeholder="Example: 2019"
                value={year}
                onChange={event =>
                  setYear(event.target.value)
                }
              />

              <label>3D Model URL</label>

              <input
                type="text"
                placeholder="https://..."
                value={modelUrl}
                onChange={event =>
                  setModelUrl(event.target.value)
                }
              />

              {error && (
                <p className="bike-model-error">
                  {error}
                </p>
              )}

              {success && (
                <p className="bike-model-success">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Saving...'
                  : editingId
                    ? 'Save Changes'
                    : 'Add Bike Model'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-edit-button"
                  onClick={clearForm}
                >
                  Cancel Edit
                </button>
              )}

            </form>

          </div>

          <div className="bike-model-list-card">

            <h2>Available Models</h2>

            {models.length === 0 ? (
              <p className="no-models">
                No 3D bike models found.
              </p>
            ) : (
              <div className="bike-model-list">

                {models.map(bike => (
                  <div
                    className="bike-model-item"
                    key={bike.model3DId}
                  >

                    <div className="bike-model-info">
                      <h3>
                        {bike.brand} {bike.model}
                      </h3>

                      <p>{bike.year}</p>
                    </div>

                    <div className="bike-model-actions">

                      <span className="model-3d-badge">
                        3D
                      </span>

                      <button
                        className="edit-model-button"
                        onClick={() =>
                          startEdit(bike)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-model-button"
                        onClick={() =>
                          deleteModel(bike)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}

export default BikeModels;