const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

/**
 * Pure-JS embedded database store.
 * Provides a 100% in-memory (with optional JSON persistence) store
 * implementing Mongoose-compatible query interfaces:
 * - find(filter).sort(sortObj).populate(...)
 * - distinct(field)
 * - findById(id).populate(...)
 * - create(data)
 * - findByIdAndUpdate(id, data, options).populate(...)
 * - findByIdAndDelete(id)
 * - countDocuments(filter)
 * - deleteMany(filter)
 * - insertMany(array)
 */

class MemoryStore {
  constructor() {
    this.opportunities = new Map();
    this.applications = new Map();
    this.initialized = false;
  }

  ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (_) {}
    }
  }

  save() {
    try {
      this.ensureDataDir();
      const payload = {
        opportunities: Array.from(this.opportunities.values()),
        applications: Array.from(this.applications.values()),
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
    } catch (_) {}
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.opportunities)) {
          for (const opp of parsed.opportunities) {
            this.opportunities.set(String(opp._id), opp);
          }
        }
        if (Array.isArray(parsed.applications)) {
          for (const app of parsed.applications) {
            this.applications.set(String(app._id), app);
          }
        }
      }
    } catch (_) {}
  }

  init() {
    if (this.initialized) return;
    this.load();
    this.initialized = true;
  }
}

const store = new MemoryStore();

function castId(id) {
  if (!id) return null;
  const str = String(id);
  if (!mongoose.Types.ObjectId.isValid(str)) {
    const err = new Error(`Cast to ObjectId failed for value "${str}"`);
    err.name = 'CastError';
    err.kind = 'ObjectId';
    err.value = str;
    throw err;
  }
  return str;
}

// Chainable query object supporting .sort() and .populate()
class QueryResult {
  constructor(items, storeRef, isSingle = false) {
    this._items = items;
    this._store = storeRef;
    this._isSingle = isSingle;
  }

  populate(pathField, selectFields) {
    const fields = typeof selectFields === 'string' ? selectFields.trim().split(/\s+/) : null;
    const list = this._isSingle ? (this._items ? [this._items] : []) : (this._items || []);

    const populated = list.map((item) => {
      if (!item) return item;
      const copy = { ...item };
      if (pathField === 'opportunity' && copy.opportunity) {
        const oppId = String(copy.opportunity._id || copy.opportunity);
        const opp = this._store.opportunities.get(oppId);
        if (opp) {
          if (fields && fields.length > 0) {
            const selected = { _id: opp._id };
            for (const f of fields) {
              if (f in opp) selected[f] = opp[f];
            }
            copy.opportunity = selected;
          } else {
            copy.opportunity = { ...opp };
          }
        } else {
          copy.opportunity = null;
        }
      }
      return copy;
    });

    this._items = this._isSingle ? (populated[0] || null) : populated;
    return this;
  }

  sort(sortObj) {
    if (this._isSingle || !Array.isArray(this._items) || !sortObj) return this;
    const [field, direction] = Object.entries(sortObj)[0] || ['createdAt', -1];
    const dir = direction === -1 || direction === 'desc' ? -1 : 1;

    this._items.sort((a, b) => {
      const valA = a[field] instanceof Date ? a[field].getTime() : (a[field] ?? '');
      const valB = b[field] instanceof Date ? b[field].getTime() : (b[field] ?? '');
      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
    return this;
  }

  // Makes QueryResult thenable (awaitable)
  then(resolve, reject) {
    return Promise.resolve(this._items).then(resolve, reject);
  }

  catch(reject) {
    return Promise.resolve(this._items).catch(reject);
  }
}

// Helper to filter documents
function matchesFilter(doc, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      const anyMatch = val.some((subFilter) => matchesFilter(doc, subFilter));
      if (!anyMatch) return false;
      continue;
    }

    if (key === 'opportunity') {
      const oppId = String(doc.opportunity?._id || doc.opportunity || '');
      if (oppId !== String(val)) return false;
      continue;
    }

    const docVal = doc[key];
    if (val && typeof val === 'object' && val.$regex) {
      const reg = new RegExp(val.$regex, val.$options || '');
      if (!reg.test(String(docVal || ''))) return false;
    } else if (val instanceof RegExp) {
      if (!val.test(String(docVal || ''))) return false;
    } else if (docVal !== val) {
      return false;
    }
  }

  return true;
}

// Memory Opportunity Model implementation
const MemoryOpportunity = {
  find(filter = {}) {
    store.init();
    const all = Array.from(store.opportunities.values());
    const matched = all.filter((doc) => matchesFilter(doc, filter));
    return new QueryResult(matched.map((d) => ({ ...d })), store, false);
  },

  async distinct(field) {
    store.init();
    const set = new Set();
    for (const doc of store.opportunities.values()) {
      if (doc[field] !== undefined && doc[field] !== null) {
        set.add(doc[field]);
      }
    }
    return Array.from(set);
  },

  findById(id) {
    store.init();
    const safeId = castId(id);
    const doc = store.opportunities.get(safeId);
    return new QueryResult(doc ? { ...doc } : null, store, true);
  },

  async create(data) {
    store.init();
    if (Array.isArray(data)) {
      const results = [];
      for (const item of data) {
        results.push(await this.create(item));
      }
      return results;
    }
    const OpportunityModel = mongoose.model('Opportunity');
    const doc = new OpportunityModel(data);
    await doc.validate();

    const plain = doc.toObject();
    plain._id = new mongoose.Types.ObjectId();
    plain.createdAt = new Date();
    plain.updatedAt = new Date();

    store.opportunities.set(String(plain._id), plain);
    store.save();
    return plain;
  },

  findByIdAndUpdate(id, data, options = {}) {
    store.init();
    const safeId = castId(id);
    const existing = store.opportunities.get(safeId);
    if (!existing) return new QueryResult(null, store, true);

    if (options.runValidators) {
      const OpportunityModel = mongoose.model('Opportunity');
      const doc = new OpportunityModel({ ...existing, ...data });
      const err = doc.validateSync();
      if (err) throw err;
    }

    const updated = {
      ...existing,
      ...data,
      _id: existing._id,
      updatedAt: new Date(),
    };

    store.opportunities.set(safeId, updated);
    store.save();
    return new QueryResult({ ...updated }, store, true);
  },

  async findByIdAndDelete(id) {
    store.init();
    const safeId = castId(id);
    const existing = store.opportunities.get(safeId);
    if (!existing) return null;

    store.opportunities.delete(safeId);
    // Cascade delete applications
    for (const [appId, app] of store.applications.entries()) {
      const oppRef = String(app.opportunity?._id || app.opportunity || '');
      if (oppRef === safeId) {
        store.applications.delete(appId);
      }
    }

    store.save();
    return existing;
  },

  async countDocuments(filter = {}) {
    store.init();
    const all = Array.from(store.opportunities.values());
    return all.filter((doc) => matchesFilter(doc, filter)).length;
  },

  async deleteMany(filter = {}) {
    store.init();
    if (!filter || Object.keys(filter).length === 0) {
      const count = store.opportunities.size;
      store.opportunities.clear();
      store.save();
      return { deletedCount: count };
    }
    let count = 0;
    for (const [id, doc] of Array.from(store.opportunities.entries())) {
      if (matchesFilter(doc, filter)) {
        store.opportunities.delete(id);
        count++;
      }
    }
    store.save();
    return { deletedCount: count };
  },

  async insertMany(docs) {
    store.init();
    const created = [];
    for (const item of docs) {
      const plain = {
        ...item,
        _id: item._id ? new mongoose.Types.ObjectId(item._id) : new mongoose.Types.ObjectId(),
        createdAt: item.createdAt || new Date(),
        updatedAt: item.updatedAt || new Date(),
      };
      store.opportunities.set(String(plain._id), plain);
      created.push(plain);
    }
    store.save();
    return created;
  },
};

// Memory Application Model implementation
const MemoryApplication = {
  find(filter = {}) {
    store.init();
    const all = Array.from(store.applications.values());
    const matched = all.filter((doc) => matchesFilter(doc, filter));
    return new QueryResult(matched.map((d) => ({ ...d })), store, false);
  },

  findById(id) {
    store.init();
    const safeId = castId(id);
    const doc = store.applications.get(safeId);
    return new QueryResult(doc ? { ...doc } : null, store, true);
  },

  async create(data) {
    store.init();
    if (Array.isArray(data)) {
      const results = [];
      for (const item of data) {
        results.push(await this.create(item));
      }
      return results;
    }
    const ApplicationModel = mongoose.model('Application');
    const doc = new ApplicationModel(data);
    await doc.validate();

    const plain = doc.toObject();
    plain._id = new mongoose.Types.ObjectId();
    plain.opportunity = new mongoose.Types.ObjectId(data.opportunity);
    plain.status = plain.status || 'Submitted';
    plain.createdAt = new Date();
    plain.updatedAt = new Date();

    store.applications.set(String(plain._id), plain);
    store.save();
    return plain;
  },

  findByIdAndUpdate(id, data, options = {}) {
    store.init();
    const safeId = castId(id);
    const existing = store.applications.get(safeId);
    if (!existing) return new QueryResult(null, store, true);

    if (options.runValidators) {
      const ApplicationModel = mongoose.model('Application');
      const doc = new ApplicationModel({ ...existing, ...data });
      const err = doc.validateSync();
      if (err) throw err;
    }

    const updated = {
      ...existing,
      ...data,
      _id: existing._id,
      updatedAt: new Date(),
    };

    store.applications.set(safeId, updated);
    store.save();
    return new QueryResult({ ...updated }, store, true);
  },

  async findByIdAndDelete(id) {
    store.init();
    const safeId = castId(id);
    const existing = store.applications.get(safeId);
    if (!existing) return null;

    store.applications.delete(safeId);
    store.save();
    return existing;
  },

  async countDocuments(filter = {}) {
    store.init();
    const all = Array.from(store.applications.values());
    return all.filter((doc) => matchesFilter(doc, filter)).length;
  },

  async deleteMany(filter = {}) {
    store.init();
    if (!filter || Object.keys(filter).length === 0) {
      const count = store.applications.size;
      store.applications.clear();
      store.save();
      return { deletedCount: count };
    }
    let count = 0;
    for (const [id, doc] of Array.from(store.applications.entries())) {
      if (matchesFilter(doc, filter)) {
        store.applications.delete(id);
        count++;
      }
    }
    store.save();
    return { deletedCount: count };
  },
};

module.exports = {
  store,
  MemoryOpportunity,
  MemoryApplication,
};
