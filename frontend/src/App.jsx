import { useEffect, useMemo, useState } from "react";
import { createItem, deleteItem, fetchItems, updateItem } from "./api";
import "./App.css";

const emptyForm = { title: "", description: "", completed: false };

function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description || "",
      completed: item.completed,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      if (isEditing) {
        const updated = await updateItem(editingId, form);
        setItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
      } else {
        const created = await createItem(form);
        setItems((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setLoading(true);
    setError("");
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header>
        <h1>FastAPI + React CRUD</h1>
        <p>Simple list manager.</p>
      </header>

      <section className="card">
        <form onSubmit={handleSubmit} className="form">
          <div className="row">
            <label>
              Title
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Task title"
                required
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                name="completed"
                checked={form.completed}
                onChange={handleChange}
              />
              Completed
            </label>
          </div>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Details (optional)"
              rows={3}
            />
          </label>
          <div className="actions">
            <button type="submit" disabled={loading}>
              {isEditing ? "Update" : "Create"}
            </button>
            {isEditing && (
              <button
                type="button"
                className="secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      </section>

      <section className="card">
        <div className="list-header">
          <h2>Items</h2>
          <button onClick={loadItems} disabled={loading}>
            Refresh
          </button>
        </div>
        {loading && <p>Loading...</p>}
        {!loading && items.length === 0 && <p>No items yet.</p>}
        <ul className="items">
          {items.map((item) => (
            <li key={item.id} className="item">
              <div>
                <p className="title">
                  {item.completed ? "✅" : "⬜"} {item.title}
                </p>
                {item.description && (
                  <p className="description">{item.description}</p>
                )}
              </div>
              <div className="item-actions">
                <button
                  className="secondary"
                  onClick={() => startEdit(item)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  className="danger"
                  onClick={() => handleDelete(item.id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
