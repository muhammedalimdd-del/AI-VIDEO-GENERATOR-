import React, { useState } from 'react';
import { RequestFormData, SceneItem, DialogueLine } from '../../types/client.ts';
import { LANGUAGE_OPTIONS } from '../../data/styles.ts';
import { Clapperboard, Plus, Trash2, Camera, Sun, MessageSquare, Sparkles, HelpCircle, Volume2 } from 'lucide-react';

interface Step5Props {
  data: RequestFormData;
  updateData: (fields: Partial<RequestFormData>) => void;
}

export const Step5StoryScenes: React.FC<Step5Props> = ({ data, updateData }) => {
  const [showSceneBuilder, setShowSceneBuilder] = useState(data.scenes.length > 0);

  // Scene management
  const addScene = () => {
    const nextNum = data.scenes.length + 1;
    const newScene: SceneItem = {
      id: 'sc_' + Date.now(),
      sceneNumber: nextNum,
      location: '',
      timeOfDay: 'Daytime',
      charactersPresent: data.characters.map(c => c.name).join(', ') || 'Main Character',
      actions: '',
      dialogue: '',
      cameraMovement: 'Cinematic tracking shot',
      lightingAtmosphere: 'Natural high-contrast lighting',
      soundPreferences: '',
      estimatedDuration: '5s'
    };
    updateData({ scenes: [...data.scenes, newScene] });
  };

  const removeScene = (id: string) => {
    const remaining = data.scenes.filter(s => s.id !== id);
    const renumbered = remaining.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    updateData({ scenes: renumbered });
  };

  const updateScene = (id: string, patch: Partial<SceneItem>) => {
    updateData({
      scenes: data.scenes.map(s => (s.id === id ? { ...s, ...patch } : s))
    });
  };

  // Dialogue management
  const addDialogue = () => {
    const newLine: DialogueLine = {
      id: 'dl_' + Date.now(),
      character: data.characters[0]?.name || 'Narrator',
      text: '',
      language: 'English',
      pronunciationNotes: ''
    };
    updateData({ dialogueLines: [...data.dialogueLines, newLine] });
  };

  const removeDialogue = (id: string) => {
    updateData({ dialogueLines: data.dialogueLines.filter(d => d.id !== id) });
  };

  const updateDialogue = (id: string, patch: Partial<DialogueLine>) => {
    updateData({
      dialogueLines: data.dialogueLines.map(d => (d.id === id ? { ...d, ...patch } : d))
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Clapperboard className="w-5 h-5 text-indigo-400" />
          Step 5: Story, Scenes, and Dialogue
        </h3>
        <p className="text-sm text-slate-400">
          Guide the pacing, plot events, visual cinematography, and spoken lines for your video.
        </p>
      </div>

      {/* Main Story Prompt */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-200">
            Describe exactly how you want your AI video to look <span className="text-rose-400">*</span>
          </label>
        </div>

        {/* Helpful Prompts Box */}
        <div className="rounded-xl bg-[#0C1220] border border-slate-800 p-4 mb-3 text-xs text-slate-300 space-y-1.5">
          <div className="font-semibold text-indigo-400 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            Helpful prompts to consider:
          </div>
          <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1">
            <li><strong>Beginning:</strong> Where does the camera start? What is the opening shot?</li>
            <li><strong>Setting:</strong> Where does the story take place (e.g. misty rainforest, rooftop at dusk, futuristic train)?</li>
            <li><strong>Action:</strong> What do the characters do, what emotions do they show, what movement occurs?</li>
            <li><strong>Climax & Ending:</strong> How does the video conclude? A cliffhanger, dramatic revelation, or smooth fade-out?</li>
          </ul>
        </div>

        <textarea
          value={data.storyDescription}
          onChange={e => updateData({ storyDescription: e.target.value })}
          rows={6}
          placeholder="Write your story breakdown here in as much detail as you like..."
          className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all"
          required
        />
      </div>

      {/* Optional Scene-by-Scene Builder Toggle */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-400" />
              Detailed Scene-by-Scene Builder (Optional)
            </h4>
            <p className="text-xs text-slate-400">
              Break your video down into specific numbered camera shots, camera movement, and lighting cues.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!showSceneBuilder && data.scenes.length === 0) {
                addScene();
              }
              setShowSceneBuilder(!showSceneBuilder);
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0 transition-colors"
          >
            {showSceneBuilder ? 'Hide Scene Builder' : '+ Enable Scene Builder'}
          </button>
        </div>

        {showSceneBuilder && (
          <div className="space-y-5">
            {data.scenes.map(scene => (
              <div
                key={scene.id}
                className="rounded-xl bg-[#0C1220] border border-slate-800 p-5 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-bold text-sm text-indigo-300">
                    Scene #{scene.sceneNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeScene(scene.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Scene
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Location / Setting
                    </label>
                    <input
                      type="text"
                      value={scene.location}
                      onChange={e => updateScene(scene.id, { location: e.target.value })}
                      placeholder="e.g. Abandoned railway station"
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Time of Day
                    </label>
                    <input
                      type="text"
                      value={scene.timeOfDay}
                      onChange={e => updateScene(scene.id, { timeOfDay: e.target.value })}
                      placeholder="e.g. Golden hour, Midnight, Foggy dawn"
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      value={scene.estimatedDuration}
                      onChange={e => updateScene(scene.id, { estimatedDuration: e.target.value })}
                      placeholder="e.g. 5s, 8s"
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Characters Present
                    </label>
                    <input
                      type="text"
                      value={scene.charactersPresent}
                      onChange={e => updateScene(scene.id, { charactersPresent: e.target.value })}
                      placeholder="e.g. Detective Vance and Echo-09"
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Camera Movement
                    </label>
                    <input
                      type="text"
                      value={scene.cameraMovement}
                      onChange={e => updateScene(scene.id, { cameraMovement: e.target.value })}
                      placeholder="e.g. Slow push-in, Low-angle tracking dolly, FPV drone dive"
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Actions & Visual Events in this Scene
                  </label>
                  <input
                    type="text"
                    value={scene.actions}
                    onChange={e => updateScene(scene.id, { actions: e.target.value })}
                    placeholder="e.g. Vance raises his scanner, detects a pulse, and dashes down the iron staircase..."
                    className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Lighting & Atmosphere
                    </label>
                    <input
                      type="text"
                      value={scene.lightingAtmosphere}
                      onChange={e => updateScene(scene.id, { lightingAtmosphere: e.target.value })}
                      placeholder="e.g. Neon rain reflection, warm vintage candlelight"
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Sound Effects or Music Cues
                    </label>
                    <input
                      type="text"
                      value={scene.soundPreferences || ''}
                      onChange={e => updateScene(scene.id, { soundPreferences: e.target.value })}
                      placeholder="e.g. Thunderclap, synthetic heartbeat, muffled rain"
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addScene}
              className="w-full py-2.5 rounded-lg border border-dashed border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Scene</span>
            </button>
          </div>
        )}
      </div>

      {/* Dialogue Editor */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Dialogue & Voice Lines (Optional)
            </h4>
            <p className="text-xs text-slate-400">
              Provide exact lines spoken by characters or voiceover narration.
            </p>
          </div>
          <button
            type="button"
            onClick={addDialogue}
            className="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/80 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Spoken Line
          </button>
        </div>

        {data.dialogueLines.length > 0 && (
          <div className="space-y-3 mb-3">
            {data.dialogueLines.map(line => (
              <div
                key={line.id}
                className="rounded-xl bg-[#0C1220] border border-slate-800 p-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Speaking Character / Narrator
                    </label>
                    <input
                      type="text"
                      value={line.character}
                      onChange={e => updateDialogue(line.id, { character: e.target.value })}
                      placeholder="e.g. Vance or Narrator"
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Preferred Language
                    </label>
                    <select
                      value={line.language}
                      onChange={e => updateDialogue(line.id, { language: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {LANGUAGE_OPTIONS.map(lang => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      type="button"
                      onClick={() => removeDialogue(line.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 py-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Line
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Spoken Dialogue Text
                  </label>
                  <textarea
                    value={line.text}
                    onChange={e => updateDialogue(line.id, { text: e.target.value })}
                    rows={2}
                    placeholder="Enter the spoken line in the original language or translated script..."
                    className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Pronunciation or Tone Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={line.pronunciationNotes || ''}
                    onChange={e => updateDialogue(line.id, { pronunciationNotes: e.target.value })}
                    placeholder="e.g. Low gravelly whisper, Malayalam regional cadence, urgent shout"
                    className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Creative Instructions */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          Additional Creative Instructions
        </label>
        <textarea
          value={data.additionalInstructions}
          onChange={e => updateData({ additionalInstructions: e.target.value })}
          rows={3}
          placeholder="Any special instructions regarding color palette, historical accuracy, pacing, or specific elements to avoid..."
          className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all"
        />
      </div>
    </div>
  );
};
