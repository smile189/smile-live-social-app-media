"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Music,
  X,
  AlertTriangle,
  Link as LinkIcon,
  CheckCircle,
} from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleString("ro-RO") : "—";

export default function MusicRequestsDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("cereri_muzica")
      .select("*")
      .order("created_at", { ascending: false });

    setRequests(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filtered = requests.filter((r) =>
    r.nume_piesa?.toLowerCase().includes(search.toLowerCase())
  );

  const save = async () => {
    if (!active) return;
    setSaving(true);

    await supabase
      .from("cereri_muzica")
      .update({
        status: active.status,
        link_rezultat: active.link_rezultat,
        genre: active.genre,
        mood: active.mood,
        vocal_gender: active.vocal_gender,
        continut_text: active.continut_text,
        pret_total: active.pret_total,
        ultima_actualizare: new Date().toISOString(),
      })
      .eq("id", active.id);

    setSaving(false);
    setIsEditing(false);
    fetch();
  };

  const remove = async (id: string) => {
    await supabase.from("cereri_muzica").delete().eq("id", id);
    setRequests((p) => p.filter((r) => r.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen text-white p-6">

      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Music /> Music Requests
        </h1>

        <div className="relative">
          <Search className="absolute left-3 top-2 text-gray-400" size={14} />
          <input
            placeholder="search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-xl text-xs bg-gray-900 border border-gray-800"
          />
        </div>
      </header>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {loading
            ? [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-900 rounded-2xl animate-pulse"
                />
              ))
            : filtered.map((req) => (
                <motion.div
                  key={req.id}
                  layout
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
                >
                  {/* status bar */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        req.status === "finalise"
                          ? "bg-green-500"
                          : req.status === "workinprogress"
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-xs">{req.status}</span>
                  </div>

                  <h3 className="font-bold">{req.nume_piesa}</h3>

                  <div className="text-xs text-gray-400">
                    {req.email_client}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    created: {formatDate(req.created_at)}
                  </div>

                  <div className="text-xs text-gray-400 mt-2 line-clamp-2">
                    {req.continut_text || "—"}
                  </div>

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => {
                        setActive(req);
                        setIsEditing(true);
                      }}
                      className="text-xs text-indigo-400"
                    >
                      edit
                    </button>

                    <button
                      onClick={() => setDeleteId(req.id)}
                      className="text-red-400"
                    >
                      delete
                    </button>
                  </div>

                  {/* delete confirm */}
                  <AnimatePresence>
             {deleteId === req.id && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-black/80 flex items-center justify-center p-4"
  >
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-xs text-center">
      <AlertTriangle className="text-red-500 mx-auto" />

      <p className="text-xs mt-2 uppercase tracking-wide">
        delete request?
      </p>

      <div className="text-xs text-gray-400 mt-2">
        {req.nume_piesa}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => remove(req.id)}
          className="flex-1 py-2 bg-red-600 text-xs rounded-xl"
        >
          yes
        </button>

        <button
          onClick={() => setDeleteId(null)}
          className="flex-1 py-2 bg-gray-800 text-xs rounded-xl"
        >
          no
        </button>
      </div>
    </div>
  </motion.div>
)}
                  </AnimatePresence>
                </motion.div>
              ))}
        </AnimatePresence>
      </div>

      {/* DRAWER EDIT */}
      <AnimatePresence>
        {isEditing && active && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsEditing(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative w-full max-w-md bg-gray-900 p-6"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">edit request</h3>
                <button onClick={() => setIsEditing(false)}>
                  <X />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[70vh]">

                {/* status */}
                <div>
                  <label className="text-xs text-gray-400">status</label>
                  <select
                    value={active.status}
                    onChange={(e) =>
                      setActive({ ...active, status: e.target.value })
                    }
                    className="w-full bg-gray-800 p-2 rounded"
                  >
                    {["primita", "in_lucru", "finalizata", "anulata"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* genre */}
                <div>
                  <label className="text-xs text-gray-400">genre</label>
                  <input
                    value={active.genre || ""}
                    onChange={(e) =>
                      setActive({ ...active, genre: e.target.value })
                    }
                    className="w-full bg-gray-800 p-2 rounded"
                  />
                </div>

                {/* mood */}
                <div>
                  <label className="text-xs text-gray-400">mood</label>
                  <input
                    value={active.mood || ""}
                    onChange={(e) =>
                      setActive({ ...active, mood: e.target.value })
                    }
                    className="w-full bg-gray-800 p-2 rounded"
                  />
                </div>

                {/* voice */}
                <div>
                  <label className="text-xs text-gray-400">voice</label>
                  <input
                    value={active.vocal_gender || ""}
                    onChange={(e) =>
                      setActive({ ...active, vocal_gender: e.target.value })
                    }
                    className="w-full bg-gray-800 p-2 rounded"
                  />
                </div>

                {/* text */}
                <div>
                  <label className="text-xs text-gray-400">lyrics / text</label>
                  <textarea
                    rows={6}
                    value={active.continut_text || ""}
                    onChange={(e) =>
                      setActive({ ...active, continut_text: e.target.value })
                    }
                    className="w-full bg-gray-800 p-2 rounded"
                  />
                </div>

                {/* price */}
                <div>
                  <label className="text-xs text-gray-400">price</label>
                  <input
                    type="number"
                    value={active.pret_total || 0}
                    onChange={(e) =>
                      setActive({
                        ...active,
                        pret_total: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-gray-800 p-2 rounded"
                  />
                </div>

                {/* result link */}
                <div>
                  <label className="text-xs text-gray-400 flex items-center gap-1">
                    <LinkIcon size={12} /> result link
                  </label>
                  <input
                    value={active.link_rezultat || ""}
                    onChange={(e) =>
                      setActive({
                        ...active,
                        link_rezultat: e.target.value,
                      })
                    }
                    className="w-full bg-gray-800 p-2 rounded"
                  />
                </div>

                {/* dates */}
                <div className="text-xs text-gray-500">
                  created: {formatDate(active.created_at)}
                </div>
                <div className="text-xs text-gray-500">
                  updated: {formatDate(active.ultima_actualizare)}
                </div>
              </div>

              <button
                onClick={save}
                disabled={saving}
                className="mt-6 w-full py-2 bg-indigo-600 rounded"
              >
                {saving ? "saving..." : "save"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}