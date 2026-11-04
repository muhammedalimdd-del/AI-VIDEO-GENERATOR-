import React, { useState } from 'react';
import { RequestFormData, CharacterItem } from '../../types/client.ts';
import { Users, Plus, Trash2, Upload, CheckCircle2, AlertCircle, Image as ImageIcon, Sparkles, ShieldAlert, X } from 'lucide-react';
import { safeResponseJson } from '../../services/apiClient.ts';

interface Step4Props {
  data: RequestFormData;
  updateData: (fields: Partial<RequestFormData>) => void;
}

export const Step4Characters: React.FC<Step4Props> = ({ data, updateData }) => {
  const [uploadingCharId, setUploadingCharId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const addCharacter = () => {
    const newChar: CharacterItem = {
      id: 'char_' + Date.now(),
      name: `Character ${data.characters.length + 1}`,
      role: 'Protagonist',
      ageRange: '',
      appearance: '',
      clothing: '',
      hairstyle: '',
      personality: '',
      dialogue: '',
      actions: '',
      sceneAppearances: 'All scenes',
      referencePhotoUrl: '',
      referencePhotoName: ''
    };
    updateData({ characters: [...data.characters, newChar] });
  };

  const removeCharacter = (id: string) => {
    updateData({ characters: data.characters.filter(c => c.id !== id) });
  };

  const updateCharacter = (id: string, patch: Partial<CharacterItem>) => {
    updateData({
      characters: data.characters.map(c => (c.id === id ? { ...c, ...patch } : c))
    });
  };

  const handleFileUpload = async (charId: string, file: File) => {
    setUploadError(null);
    setUploadingCharId(charId);

    // Validate size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image size exceeds 15MB. Please choose a smaller photo.');
      setUploadingCharId(null);
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Unsupported file format. Please upload JPG, PNG, or WebP.');
      setUploadingCharId(null);
      return;
    }

    try {
      let photoUrl: string | null = null;
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const parsed = await safeResponseJson<{ fileUrl?: string }>(res);
        if (parsed.ok && parsed.data?.fileUrl) {
          photoUrl = parsed.data.fileUrl;
        }
      } catch (netErr) {
        // Fallback for static hosting (GitHub Pages)
      }

      if (!photoUrl) {
        // Fallback: Read as base64 Data URL so user can still preview & attach photo
        photoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read image locally.'));
          reader.readAsDataURL(file);
        });
      }

      updateCharacter(charId, {
        referencePhotoUrl: photoUrl,
        referencePhotoName: file.name
      });
    } catch (e: any) {
      setUploadError(e.message || 'Error uploading reference photo. Please try again.');
    } finally {
      setUploadingCharId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          Step 4: Characters and Reference Photos
        </h3>
        <p className="text-sm text-slate-400">
          Define each character in your story. You can upload photos of real people or describe fictional personas in detail.
        </p>
      </div>

      {/* Character Mode Selection */}
      <div className="rounded-xl bg-[#0C1220] border border-slate-800 p-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
          Character Generation Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'both' as const,
              label: 'Both Photos & Descriptions',
              desc: 'Use uploaded face references while adapting clothing & style to your description.'
            },
            {
              id: 'photos_only' as const,
              label: 'Photos as Visual References',
              desc: 'Preserve facial geometry, features, and likeness from uploaded reference images.'
            },
            {
              id: 'fictional_only' as const,
              label: 'Original Fictional Characters',
              desc: 'Create original characters purely from your written descriptions and traits.'
            }
          ].map(mode => {
            const isSelected = data.characterMode === mode.id;
            return (
              <button
                type="button"
                key={mode.id}
                onClick={() => updateData({ characterMode: mode.id })}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : 'bg-[#090D16] border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs mb-1 text-white">{mode.label}</div>
                <div className="text-[11px] text-slate-400 leading-normal">{mode.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Character Cards List */}
      <div className="space-y-6">
        {data.characters.map((char, index) => (
          <div
            key={char.id}
            className="rounded-2xl bg-[#0C1220] border border-slate-800/90 p-5 sm:p-6 transition-all relative group"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-indigo-900/60 text-indigo-300 font-bold text-xs flex items-center justify-center">
                  #{index + 1}
                </span>
                <span className="font-bold text-white text-base">
                  {char.name || `Character ${index + 1}`}
                </span>
              </div>
              {data.characters.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCharacter(char.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2.5 py-1 rounded-md transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo Upload Column */}
              <div className="md:col-span-1 space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Reference Photo (Optional)
                </label>

                {char.referencePhotoUrl ? (
                  <div className="relative rounded-xl border border-slate-700 overflow-hidden bg-slate-950 p-2">
                    <img
                      src={char.referencePhotoUrl}
                      alt={char.name}
                      className="w-full h-44 object-cover rounded-lg"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateCharacter(char.id, { referencePhotoUrl: '', referencePhotoName: '' })}
                        className="p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400 truncate">
                      {char.referencePhotoName || 'reference-photo.jpg'}
                    </div>
                    <label className="mt-1 block text-center py-1 rounded bg-slate-900 hover:bg-slate-800 text-indigo-400 text-[11px] cursor-pointer font-medium">
                      Replace Photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) handleFileUpload(char.id, e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-[#090D16] hover:bg-indigo-950/20 cursor-pointer p-4 text-center transition-all">
                    {uploadingCharId === char.id ? (
                      <div className="flex flex-col items-center text-xs text-indigo-400">
                        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-2" />
                        <span>Uploading photo...</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-500 mb-2" />
                        <span className="text-xs font-semibold text-slate-300">
                          Upload Reference Photo
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">
                          JPG, PNG, or WebP up to 15MB
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files?.[0]) handleFileUpload(char.id, e.target.files[0]);
                      }}
                    />
                  </label>
                )}
                <p className="text-[11px] text-slate-500 leading-tight">
                  Reference photos are kept in private, encrypted storage and never published.
                </p>
              </div>

              {/* Character Details Column */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Character Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={char.name}
                      onChange={e => updateCharacter(char.id, { name: e.target.value })}
                      placeholder="e.g. Detective Sean Vance, Maya the Explorer"
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Role in Video
                    </label>
                    <input
                      type="text"
                      value={char.role}
                      onChange={e => updateCharacter(char.id, { role: e.target.value })}
                      placeholder="e.g. Protagonist, Antagonist, Mentor, Narrator"
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Age Range
                    </label>
                    <input
                      type="text"
                      value={char.ageRange || ''}
                      onChange={e => updateCharacter(char.id, { ageRange: e.target.value })}
                      placeholder="e.g. Mid 30s, Teenager, Elderly mentor"
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Hairstyle & Visual Details
                    </label>
                    <input
                      type="text"
                      value={char.hairstyle || ''}
                      onChange={e => updateCharacter(char.id, { hairstyle: e.target.value })}
                      placeholder="e.g. Slicked-back silver hair, Curly black afro"
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Appearance & Facial Features
                  </label>
                  <input
                    type="text"
                    value={char.appearance}
                    onChange={e => updateCharacter(char.id, { appearance: e.target.value })}
                    placeholder="e.g. Piercing hazel eyes, sharp jawline, warm smile, slight beard..."
                    className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Clothing & Accessories
                    </label>
                    <input
                      type="text"
                      value={char.clothing || ''}
                      onChange={e => updateCharacter(char.id, { clothing: e.target.value })}
                      placeholder="e.g. Charcoal trench coat, gold aviator sunglasses"
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Key Actions / Body Language
                    </label>
                    <input
                      type="text"
                      value={char.actions || ''}
                      onChange={e => updateCharacter(char.id, { actions: e.target.value })}
                      placeholder="e.g. Confident swagger, sprints through rain, stares into horizon"
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Character Button */}
      <button
        type="button"
        onClick={addCharacter}
        className="w-full py-3.5 rounded-xl border border-dashed border-indigo-500/60 hover:border-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/40 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Add Another Character</span>
      </button>

      {/* Consistency Note */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Character Appearance Consistency Instructions (Optional)
        </label>
        <textarea
          value={data.characterConsistencyNote}
          onChange={e => updateData({ characterConsistencyNote: e.target.value })}
          rows={2}
          placeholder="e.g. Keep both characters' faces, hairstyles, clothing, and accessories consistent across all scenes without sudden mutations."
          className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all"
        />
      </div>

      {/* Mandatory Photo Consent Checkbox */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.photoConsentConfirmed}
            onChange={e => updateData({ photoConsentConfirmed: e.target.checked })}
            className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-950"
          />
          <span className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Photo Rights & Likeness Confirmation:</strong> I confirm that I own or have obtained all necessary legal rights and explicit permissions for any photos, portraits, or personal likenesses submitted with this request. Uploads are strictly stored in private studio storage and used exclusively to produce this requested video.
          </span>
        </label>
      </div>
    </div>
  );
};
