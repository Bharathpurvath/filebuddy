
import { useEffect, useState } from "react";
import "./App.css";

const DB_NAME = "FileBuddyDB";
const STORE_NAME = "files";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveFile(fileRecord) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(fileRecord);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

async function getSavedFiles() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

async function deleteSavedFile(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

function App() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFiles() {
      try {
        const savedFiles = await getSavedFiles();

        if (active) {
          setFiles(
            savedFiles.map((item) => ({
              ...item,
              url: URL.createObjectURL(item.file),
            }))
          );
        }
      } catch (error) {
        console.error("Could not load saved files:", error);
        if (active) setMessage("Unable to load saved files in this browser");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFiles();

    return () => {
      active = false;
    };
  }, []);

  async function addFiles(selectedFiles) {
    const incomingFiles = Array.from(selectedFiles);

    for (const file of incomingFiles) {
      const record = {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        addedAt: Date.now(),
      };

      try {
        await saveFile(record);

        setFiles((previous) => [
          ...previous,
          {
            ...record,
            url: URL.createObjectURL(file),
          },
        ]);

        setMessage("");
      } catch (error) {
        console.error("Could not save file:", error);
        setMessage(
          `Could not save ${file.name}. Browser storage may be full or unavailable.`
        );
      }
    }
  }

  async function removeFile(id) {
    const selected = files.find((item) => item.id === id);

    try {
      await deleteSavedFile(id);

      if (selected) URL.revokeObjectURL(selected.url);

      setFiles((previous) => previous.filter((item) => item.id !== id));
      setMessage("");
    } catch (error) {
      console.error("Could not remove file:", error);
      setMessage("Could not remove this file from browser storage");
    }
  }

  const filteredFiles = files.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <main className="app">
      <header className="navbar">
        <a className="logo" href="#">
          File<span>Buddy</span>
        </a>
        <span className="status">Your files, your control</span>
      </header>

      <section className="hero">
        <p className="eyebrow">SIMPLE FILE MANAGEMENT</p>
        <h1>
          All your files
          <br />
          <span>in one place</span>
        </h1>
        <p className="subtitle">
          Upload, preview, search and download your files with ease
        </p>
      </section>

      <section className="workspace">
        <div
          className={`dropzone ${dragging ? "dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
        >
          <div className="upload-icon">↑</div>
          <h2>Drop your files here</h2>
          <p>or choose files from your device</p>

          <label className="upload-button">
            Choose files
            <input
              type="file"
              multiple
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
              hidden
            />
          </label>

          <small>Files are saved in this browser on this device</small>
        </div>

        <div className="file-section">
          <div className="section-heading">
            <div>
              <h2>Your files</h2>
              <p>{files.length} files added</p>
            </div>

            <input
              className="search"
              type="search"
              placeholder="Search files..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {message && (
            <p role="status" aria-live="polite">
              {message}
            </p>
          )}

          {loading ? (
            <div className="empty-state">
              <h3>Loading your files...</h3>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">▤</div>
              <h3>{search ? "No matching files" : "No files yet"}</h3>
              <p>
                {search
                  ? "Try another search term"
                  : "Upload your first file to get started"}
              </p>
            </div>
          ) : (
            <div className="file-grid">
              {filteredFiles.map((item) => (
                <article className="file-card" key={item.id}>
                  <div className="file-icon">
                    {item.type.startsWith("image/")
                      ? "IMG"
                      : item.type.startsWith("video/")
                        ? "VID"
                        : item.type.includes("pdf")
                          ? "PDF"
                          : "FILE"}
                  </div>

                  <h3 title={item.name}>{item.name}</h3>
                  <p>{formatSize(item.size)}</p>

                  <div className="file-actions">
                    {item.type.startsWith("image/") && (
                      <a href={item.url} target="_blank" rel="noreferrer">
                        Preview
                      </a>
                    )}

                    <a href={item.url} download={item.name}>
                      Download
                    </a>

                    <button
                      className="delete-button"
                      onClick={() => removeFile(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer>
        <span>FileBuddy</span>
        <span>Simple tools for everyday work</span>
      </footer>
    </main>
  );
}

export default App;
