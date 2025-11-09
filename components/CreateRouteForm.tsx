import React, { useState, useEffect, useRef } from 'react';
import { Route } from '../types';
import useGeolocation from '../hooks/useGeolocation';
import { generateRouteDescription } from '../services/geminiService';
import XIcon from './icons/XIcon';
import SparklesIcon from './icons/SparklesIcon';

interface CreateRouteFormProps {
  onClose: () => void;
  onSave: (route: Omit<Route, 'id' | 'likes' | 'authorId'>) => void;
  onUpdate?: (updatedData: Partial<Route>) => void;
  editingRoute?: Route | null;
}

const CreateRouteForm: React.FC<CreateRouteFormProps> = ({ onClose, onSave, onUpdate, editingRoute }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [distance, setDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isRecording,
    startRecording,
    stopRecording,
    distance: recordedDistance,
    elapsedTime,
    path,
    steps,
    error,
  } = useGeolocation();

  useEffect(() => {
    if (editingRoute) {
      setName(editingRoute.name);
      setDescription(editingRoute.description);
      setTags(editingRoute.tags.join(', '));
      setIsPublic(editingRoute.isPublic);
      setImagePreview(editingRoute.imageUrl || null);
      setDistance(editingRoute.distance);
      setEstimatedTime(editingRoute.estimatedTime);
    } else {
        // Only update from GPS if not editing
        setDistance(recordedDistance);
        setEstimatedTime(Math.round(elapsedTime / 60));
    }
  }, [recordedDistance, elapsedTime, editingRoute]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please provide a name for the route.');
      return;
    }

    if (editingRoute) {
        if(onUpdate) {
            onUpdate({
                name,
                description,
                tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
                isPublic,
                imageUrl: imagePreview ?? undefined,
            });
        }
    } else {
        if (path.length < 2) {
            alert('Please record a route using GPS before saving.');
            return;
        }
        onSave({
            name,
            description,
            distance,
            estimatedTime,
            path,
            isPublic,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            imageUrl: imagePreview ?? undefined,
        });
    }
  };
  
  const handleGenerateDescription = async () => {
    if (!name) {
        alert("Please enter a route name first.");
        return;
    }
    setIsGenerating(true);
    try {
        const generatedDesc = await generateRouteDescription(name, distance, tags.split(',').map(t => t.trim()));
        setDescription(generatedDesc);
    } catch (e) {
        console.error("Failed to generate description:", e);
        alert("Sorry, we couldn't generate a description at this time.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const MILES_TO_FEET = 5280;
  const isEditing = !!editingRoute;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
            <h2 className="text-2xl font-bold text-slate-800">{isEditing ? 'Edit Route' : 'Record a New Route'}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><XIcon /></button>
        </div>

        <div className="flex-grow overflow-y-auto">
          <form id="create-route-form" onSubmit={handleSubmit}>
            <div className="p-6">
              {!isEditing && (
                <div className="text-center p-4 border rounded-lg bg-slate-50 mb-6">
                    {isRecording ? (
                        <>
                            <div className="text-4xl font-bold text-amber-500 animate-pulse">{(distance * MILES_TO_FEET).toFixed(0)} ft</div>
                            <div className="text-slate-500 mt-1">
                                {Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s elapsed
                                <span className="mx-2">·</span>
                                {steps.toFixed(0)} steps
                            </div>
                            <button type="button" onClick={stopRecording} className="mt-4 w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Stop Recording</button>
                        </>
                    ) : (
                        <>
                            <p className="text-slate-600 mb-4">Record your walk using your phone's GPS.</p>
                            <button type="button" onClick={startRecording} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">Start Recording</button>
                            {path.length > 0 && <p className="text-sm text-slate-500 mt-2">Last walk recorded: {distance.toFixed(2)} mi.</p>}
                        </>
                    )}
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
              )}
              
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700">Route Photo</label>
                      <div className="mt-1 flex justify-center items-center w-full h-48 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 relative">
                          {imagePreview ? (
                              <>
                                  <img src={imagePreview} alt="Route preview" className="w-full h-full object-cover rounded-lg" />
                                  <button 
                                      type="button" 
                                      onClick={() => {
                                          setImagePreview(null);
                                          if(fileInputRef.current) fileInputRef.current.value = '';
                                      }} 
                                      className="absolute top-2 right-2 bg-white bg-opacity-75 p-1 rounded-full text-slate-800 hover:bg-opacity-100"
                                      aria-label="Remove photo"
                                  >
                                      <XIcon className="w-5 h-5" />
                                  </button>
                              </>
                          ) : (
                              <div className="text-center">
                                  <button type="button" onClick={handleAddPhotoClick} className="bg-white text-amber-500 font-semibold py-2 px-4 border border-slate-300 rounded-lg hover:bg-slate-100">
                                      Add Photo from Album
                                  </button>
                                  <p className="text-xs text-slate-500 mt-2">Upload a picture for your route.</p>
                              </div>
                          )}
                      </div>
                      <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*"
                      />
                  </div>
                  <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700">Route Name</label>
                      <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" placeholder="e.g., Lakeside Morning Walk" required />
                  </div>
                  <div>
                      <div className="flex justify-between items-center">
                          <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                          <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="text-sm text-amber-500 hover:text-amber-700 font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                              <SparklesIcon className="w-4 h-4 mr-1" />
                              {isGenerating ? 'Generating...' : 'Generate with AI'}
                          </button>
                      </div>
                      <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" placeholder="A short, catchy description of your route."></textarea>
                  </div>
                  <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-slate-700">Tags (comma-separated)</label>
                      <input type="text" id="tags" value={tags} onChange={e => setTags(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" placeholder="e.g., nature, flat, scenic" />
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Visibility</span>
                      <div className="flex items-center gap-4">
                          <label className="flex items-center cursor-pointer">
                              <input type="radio" name="visibility" checked={isPublic} onChange={() => setIsPublic(true)} className="h-4 w-4 text-amber-500 border-gray-300 focus:ring-amber-500" />
                              <span className="ml-2 text-sm text-slate-600">Public</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                              <input type="radio" name="visibility" checked={!isPublic} onChange={() => setIsPublic(false)} className="h-4 w-4 text-amber-500 border-gray-300 focus:ring-amber-500" />
                              <span className="ml-2 text-sm text-slate-600">Private</span>
                          </label>
                      </div>
                  </div>
              </div>
            </div>
          </form>
        </div>
        <div className="p-6 bg-slate-50 border-t flex-shrink-0">
            <button type="submit" form="create-route-form" className="w-full bg-amber-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-amber-600 disabled:bg-slate-400 disabled:cursor-not-allowed" disabled={!isEditing && (isRecording || path.length < 2)}>{isEditing ? 'Save Changes' : 'Save Route'}</button>
        </div>
      </div>
    </div>
  );
};

export default CreateRouteForm;