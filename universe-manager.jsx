/* TarixiTimeline — Universe Manager
   CRUD operations for universes with localStorage persistence
*/

const { useState, useCallback } = React;

// Storage key for custom universes
const STORAGE_KEY = 'tarixi-timeline-universes';

// ============================================================
// LocalStorage Persistence Functions
// ============================================================

/**
 * Load custom universes from localStorage
 * @returns {Array} Array of custom universe objects
 */
function loadCustomUniverse() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[UniverseManager] Failed to load custom universes:', err);
    return [];
  }
}

/**
 * Save custom universes to localStorage
 * @param {Array} customUniverse - Array of custom universe objects
 */
function saveCustomUniverse(customUniverse) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customUniverse));
    console.log('[UniverseManager] Saved custom universes:', customUniverse.length);
  } catch (err) {
    console.error('[UniverseManager] Failed to save custom universes:', err);
  }
}

/**
 * Get all universes (default + custom)
 * @returns {Array} Combined array of all universes
 */
function getAllUniverse() {
  const custom = loadCustomUniverse();
  const all = [window.DEFAULT_UNIVERSE, ...custom];
  return all;
}

/**
 * Create a new custom universe
 * @param {Object} universe - Universe object with id, name, description, color, icon
 * @returns {Object} Created universe with generated id
 */
function createUniverse(universe) {
  const custom = loadCustomUniverse();
  const newUniverse = {
    ...universe,
    id: 'custom-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  custom.push(newUniverse);
  saveCustomUniverse(custom);
  
  // Update UNIVERSE_MAP
  window.UNIVERSE_MAP[newUniverse.id] = newUniverse;
  window.UNIVERSE_META = getAllUniverse();
  
  console.log('[UniverseManager] Created universe:', newUniverse);
  return newUniverse;
}

/**
 * Update an existing custom universe
 * @param {string} universeId - ID of universe to update
 * @param {Object} updates - Object with properties to update
 * @returns {Object|null} Updated universe or null if not found/protected
 */
function updateUniverse(universeId, updates) {
  // Cannot update default universe
  if (universeId === window.DEFAULT_UNIVERSE.id) {
    console.warn('[UniverseManager] Cannot update default universe');
    return null;
  }
  
  const custom = loadCustomUniverse();
  const index = custom.findIndex(u => u.id === universeId);
  if (index === -1) {
    console.warn('[UniverseManager] Universe not found:', universeId);
    return null;
  }
  
  const updated = { ...custom[index], ...updates, updatedAt: new Date().toISOString() };
  custom[index] = updated;
  saveCustomUniverse(custom);
  
  // Update UNIVERSE_MAP
  window.UNIVERSE_MAP[universeId] = updated;
  window.UNIVERSE_META = getAllUniverse();
  
  console.log('[UniverseManager] Updated universe:', updated);
  return updated;
}

/**
 * Delete a custom universe and all its items
 * @param {string} universeId - ID of universe to delete
 * @param {Array} allItems - All items in the application
 * @returns {Object} Result with success status and deleted items count
 */
function deleteUniverse(universeId, allItems) {
  // Cannot delete default universe
  if (universeId === window.DEFAULT_UNIVERSE.id) {
    console.warn('[UniverseManager] Cannot delete default universe');
    return { success: false, error: 'Cannot delete default universe' };
  }
  
  const custom = loadCustomUniverse();
  const index = custom.findIndex(u => u.id === universeId);
  if (index === -1) {
    console.warn('[UniverseManager] Universe not found:', universeId);
    return { success: false, error: 'Universe not found' };
  }
  
  // Count items that will be deleted
  const itemsToDelete = allItems.filter(item => item.universe === universeId).length;
  
  // Remove universe
  const deleted = custom.splice(index, 1)[0];
  saveCustomUniverse(custom);
  
  // Remove from UNIVERSE_MAP
  delete window.UNIVERSE_MAP[universeId];
  window.UNIVERSE_META = getAllUniverse();
  
  console.log('[UniverseManager] Deleted universe:', deleted, 'Items:', itemsToDelete);
  return { success: true, deletedUniverse: deleted, itemsCount: itemsToDelete };
}

/**
 * Move items from one universe to another
 * @param {Array} itemIds - IDs of items to move
 * @param {string} targetUniverseId - Target universe ID
 * @param {Array} allItems - All items in the application
 * @returns {Array} Updated items array
 */
function moveItemsToUniverse(itemIds, targetUniverseId, allItems) {
  const updated = allItems.map(item => {
    if (itemIds.includes(item.id)) {
      return { ...item, universe: targetUniverseId };
    }
    return item;
  });
  
  console.log('[UniverseManager] Moved items to universe:', targetUniverseId, 'Count:', itemIds.length);
  return updated;
}

/**
 * Get universe statistics
 * @param {Array} items - Items in the universe
 * @returns {Object} Statistics object
 */
function getUniverseStats(items) {
  const stats = {
    total: items.length,
    byKind: {
      event: 0,
      subject: 0,
      era: 0,
    },
    bySubkind: {},
    byDomain: {},
    byPlace: {},
  };
  
  items.forEach(item => {
    // Count by kind
    if (stats.byKind[item.kind] !== undefined) {
      stats.byKind[item.kind]++;
    }
    
    // Count by subkind
    if (item.kind === 'subject') {
      const sk = item.subkind || 'person';
      stats.bySubkind[sk] = (stats.bySubkind[sk] || 0) + 1;
    }
    
    // Count by tags
    item.tags.forEach(tagId => {
      const tag = window.TAG_MAP[tagId];
      if (!tag) return;
      
      if (tag.facet === 'domain') {
        stats.byDomain[tagId] = (stats.byDomain[tagId] || 0) + 1;
      } else if (tag.facet === 'place') {
        stats.byPlace[tagId] = (stats.byPlace[tagId] || 0) + 1;
      }
    });
  });
  
  return stats;
}

// ============================================================
// Emoji Picker Data
// ============================================================

const EMOJI_OPTIONS = {
  'default': ['🌍', '🌎', '🌏'],
  'fiction': ['📚', '🎬', '🎮', '🎭', '📖'],
  'alt-history': ['🌀', '⏳', '🔮', '🕰️', '✨'],
  'science': ['🔬', '🧪', '🔭', '🚀', '🌌'],
  'nature': ['🌿', '🌲', '🌸', '🍃', '🌺'],
  'animals': ['🦁', '🐺', '🦅', '🐉', '🦄'],
  'people': ['👤', '👥', '👨‍👩‍👧‍👦', '🎭', '🎪'],
  'places': ['🏛️', '🏰', '🗼', '🏝️', '🏔️'],
  'events': ['⚔️', '🎉', '💥', '🔥', '⭐'],
  'custom': ['💫', '🌟', '✨', '💎', '🎨', '🎯', '🎪', '🎢'],
};

const COLOR_OPTIONS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#6366f1', '#a855f7', '#d946ef',
];

// ============================================================
// Create/Edit Universe Modal
// ============================================================

function UniverseEditModal({ universe, onSave, onClose, isEdit = false }) {
  const [name, setName] = useState(universe?.name || '');
  const [description, setDescription] = useState(universe?.description || '');
  const [icon, setIcon] = useState(universe?.icon || '🌍');
  const [color, setColor] = useState(universe?.color || '#3b82f6');
  const [selectedCategory, setSelectedCategory] = useState('default');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      id: universe?.id,
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const allEmojis = [...EMOJI_OPTIONS[selectedCategory], ...EMOJI_OPTIONS.custom];

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm universe-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="cm-head">
          <span>{isEdit ? 'Редактировать вселенную' : 'Создать вселенную'}</span>
          <button className="cm-close" onClick={onClose}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="cm-body" onKeyDown={handleKeyDown}>
          {/* Preview */}
          <div className="universe-preview">
            <div 
              className="universe-preview-icon"
              style={{ background: color }}
            >
              {icon}
            </div>
            <div className="universe-preview-info">
              <div className="universe-preview-name">{name || 'Название вселенной'}</div>
              <div className="universe-preview-desc">{description || 'Описание'}</div>
            </div>
          </div>

          {/* Name */}
          <div className="cm-field">
            <label className="cm-label">Название *</label>
            <input 
              className="cm-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Например: Моя вселенная"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="cm-field">
            <label className="cm-label">Описание</label>
            <textarea 
              className="cm-textarea" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={2} 
              placeholder="Краткое описание вселенной..."
            />
          </div>

          {/* Icon Selector */}
          <div className="cm-field">
            <label className="cm-label">Иконка</label>
            <div className="icon-selector">
              <button 
                className="icon-selector-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <span className="icon-selector-current">{icon}</span>
                <span className="icon-selector-arrow">▼</span>
              </button>
              
              {showEmojiPicker && (
                <div className="emoji-picker">
                  <div className="emoji-picker-categories">
                    {Object.keys(EMOJI_OPTIONS).map(cat => (
                      <button
                        key={cat}
                        className={`emoji-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat === 'default' ? '🌍' : cat === 'alt-history' ? '🌀' : 
                         cat === 'fiction' ? '📚' : cat === 'science' ? '🔬' :
                         cat === 'nature' ? '🌿' : cat === 'animals' ? '🦁' :
                         cat === 'people' ? '👤' : cat === 'places' ? '🏛️' :
                         cat === 'events' ? '⚔️' : '💫'}
                      </button>
                    ))}
                  </div>
                  <div className="emoji-picker-grid">
                    {allEmojis.map(emoji => (
                      <button
                        key={emoji}
                        className={`emoji-btn ${icon === emoji ? 'active' : ''}`}
                        onClick={() => { setIcon(emoji); setShowEmojiPicker(false); }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Color Picker */}
          <div className="cm-field">
            <label className="cm-label">Цвет темы</label>
            <div className="color-picker">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  className={`color-btn ${color === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="color-custom"
                title="Выбрать свой цвет"
              />
            </div>
          </div>
        </div>

        <div className="cm-foot">
          <button className="cm-btn ghost" onClick={onClose}>Отмена</button>
          <button 
            className="cm-btn primary" 
            onClick={handleSave} 
            disabled={!name.trim()}
          >
            {isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Delete Confirmation Modal
// ============================================================

function UniverseDeleteConfirm({ universe, itemsCount, onConfirm, onClose }) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm universe-delete-modal" onClick={e => e.stopPropagation()}>
        <div className="cm-head">
          <span style={{ color: '#ef4444' }}>Удалить вселенную</span>
          <button className="cm-close" onClick={onClose}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="cm-body">
          <div className="delete-warning">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>Вы уверены?</h3>
            <p>
              Вселенная <strong>"{universe.name}"</strong> будет удалена безвозвратно.
            </p>
            {itemsCount > 0 && (
              <p className="delete-items-warning">
                Также будут удалены <strong>{itemsCount} объектов</strong>, которые принадлежат этой вселенной.
              </p>
            )}
          </div>
        </div>

        <div className="cm-foot">
          <button className="cm-btn ghost" onClick={onClose}>Отмена</button>
          <button 
            className="cm-btn" 
            style={{ background: '#ef4444', color: 'white' }}
            onClick={handleConfirm}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Universe Management Panel (dropdown extension)
// ============================================================

function UniverseManagerPanel({ 
  currentUniverse, 
  universes, 
  items,
  onCreate, 
  onEdit, 
  onDelete,
  onSwitch,
}) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingUniverse, setEditingUniverse] = useState(null);
  const [deletingUniverse, setDeletingUniverse] = useState(null);
  const [deleteItemsCount, setDeleteItemsCount] = useState(0);

  const handleEditClick = (universe, e) => {
    e.stopPropagation();
    setEditingUniverse(universe);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (universe, e) => {
    e.stopPropagation();
    const itemsInUniverse = items.filter(item => item.universe === universe.id).length;
    setDeletingUniverse(universe);
    setDeleteItemsCount(itemsInUniverse);
    setDeleteModalOpen(true);
  };

  const handleSaveUniverse = (universeData) => {
    if (editingUniverse) {
      onEdit(editingUniverse.id, universeData);
    } else {
      onCreate(universeData);
    }
    setEditModalOpen(false);
    setEditingUniverse(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingUniverse) {
      onDelete(deletingUniverse.id);
      setDeleteModalOpen(false);
      setDeletingUniverse(null);
      
      // Switch to main universe if current was deleted
      if (currentUniverse === deletingUniverse.id) {
        onSwitch(window.DEFAULT_UNIVERSE.id);
      }
    }
  };

  const isMainUniverse = (id) => id === window.DEFAULT_UNIVERSE.id;

  return (
    <>
      {/* Universe list with management options */}
      <div className="universe-dropdown-header">Вселенные</div>
      
      {universes.map(u => {
        const isProtected = isMainUniverse(u.id);
        const itemCount = items.filter(item => item.universe === u.id || (!item.universe && u.id === 'main')).length;
        
        return (
          <div key={u.id} className="universe-option-wrapper">
            <button
              className="universe-option"
              data-active={u.id === currentUniverse}
              onClick={() => { onSwitch(u.id); }}
            >
              <span className="universe-option-icon">{u.icon}</span>
              <div className="universe-option-body">
                <div className="universe-option-name">
                  {u.name}
                  {isProtected && <span className="universe-protected-badge">основная</span>}
                </div>
                <div className="universe-option-desc">{u.description}</div>
              </div>
              <div className="universe-option-meta">
                <span className="universe-item-count">{itemCount}</span>
                {u.id === currentUniverse && (
                  <svg className="universe-option-check" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13 4L6 11l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </button>
            
            {/* Management buttons */}
            {!isProtected && (
              <div className="universe-manage-actions">
                <button
                  className="universe-manage-btn edit"
                  onClick={e => handleEditClick(u, e)}
                  title="Редактировать"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M10.5 1.5L12.5 3.5L4 12H2V10L10.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  className="universe-manage-btn delete"
                  onClick={e => handleDeleteClick(u, e)}
                  title="Удалить"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 3.5L3.5 12.5h7L12 3.5M5 3.5V2a1 1 0 011-1h2a1 1 0 011 1v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Create new universe button */}
      <button 
        className="universe-create-btn"
        onClick={() => { setEditingUniverse(null); setEditModalOpen(true); }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Создать вселенную
      </button>

      {/* Edit/Create Modal */}
      {editModalOpen && (
        <UniverseEditModal
          universe={editingUniverse}
          onSave={handleSaveUniverse}
          onClose={() => { setEditModalOpen(false); setEditingUniverse(null); }}
          isEdit={!!editingUniverse}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deletingUniverse && (
        <UniverseDeleteConfirm
          universe={deletingUniverse}
          itemsCount={deleteItemsCount}
          onConfirm={handleDeleteConfirm}
          onClose={() => { setDeleteModalOpen(false); setDeletingUniverse(null); }}
        />
      )}
    </>
  );
}

// ============================================================
// Exports
// ============================================================

window.UniverseManager = {
  loadCustomUniverse,
  saveCustomUniverse,
  getAllUniverse,
  createUniverse,
  updateUniverse,
  deleteUniverse,
  moveItemsToUniverse,
  getUniverseStats,
};

window.UniverseEditModal = UniverseEditModal;
window.UniverseDeleteConfirm = UniverseDeleteConfirm;
window.UniverseManagerPanel = UniverseManagerPanel;
window.EMOJI_OPTIONS = EMOJI_OPTIONS;
window.COLOR_OPTIONS = COLOR_OPTIONS;
