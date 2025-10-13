import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../lib/api.js';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard.jsx';

export default function Ministers() {
  const [ministers, setMinisters] = useState([]);
  const [q, setQ] = useState('');
  const [ministry, setMinistry] = useState('');
  const [party, setParty] = useState('');
  const [sort, setSort] = useState('name');
  useEffect(() => {
    apiGet('/api/ministers').then(setMinisters).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    let list = ministers.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));
    if (ministry) list = list.filter(m => (m.ministry || '').toLowerCase().includes(ministry.toLowerCase()));
    if (party) list = list.filter(m => (m.party || '').toLowerCase().includes(party.toLowerCase()));
    // placeholder: sort by name; later by performance when metrics available
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [ministers, q, ministry, party, sort]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Search ministers..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input className="border rounded px-3 py-2" placeholder="Filter by ministry" value={ministry} onChange={e => setMinistry(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Filter by party" value={party} onChange={e => setParty(e.target.value)} />
        <select className="border rounded px-3 py-2" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="name">Sort: Name</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <p>No ministers found</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => (
            <Link key={m._id} to={`/ministers/${m._id}`}>
              <GlassCard className="p-4 flex items-center gap-4">
                {m.photoUrl ? (
                  <img src={m.photoUrl} alt={m.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 font-semibold">
                    {(m.name || '?').charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-black dark:text-slate-100">{m.name}</div>
                  <div className="text-sm text-slate-900 dark:text-slate-300">{m.ministry}{m.party ? ` (${m.party})` : ''}</div>
                  {m.bio ? (
                    <div className="text-xs text-slate-900 dark:text-slate-400 mt-1 line-clamp-2">{m.bio}</div>
                  ) : (
                    <div className="text-xs text-slate-900 dark:text-slate-400 mt-1 italic">Bio not available</div>
                  )}
                  <div className="mt-2 flex gap-2">
                    {/* Simple badges; can be enhanced with real metrics */}
                    {m.ministry && <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{m.ministry}</span>}
                    {m.party && <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">{m.party}</span>}
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}