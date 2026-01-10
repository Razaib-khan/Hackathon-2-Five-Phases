'use client';

import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Submission } from '../../lib/types';

interface SubmissionFormProps {
  hackathonId: string;
  teamId: string;
}

// Define the ProgressEvent type for file uploads
interface ProgressEvent extends Event {
  lengthComputable: boolean;
  loaded: number;
  total: number;
}

export default function SubmissionForm({ hackathonId, teamId }: SubmissionFormProps) {
  const { api } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [repoLink, setRepoLink] = useState('');
  const [category, setCategory] = useState('general');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'innovation', label: 'Most Innovative' },
    { value: 'technical', label: 'Best Technical Implementation' },
    { value: 'design', label: 'Best Design' },
    { value: 'social-impact', label: 'Social Impact' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (submissionId: string) => {
    if (files.length === 0) return [];

    const uploadedFiles = [];
    setUploading(true);
    setProgress(0);

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        const response = await api.postFile(`/submissions/${submissionId}/files`, formData, (progressEvent: ProgressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          const overallProgress = Math.round(((i / files.length) * 100) + (percentCompleted / files.length));
          setProgress(overallProgress);
        });

        uploadedFiles.push(response);
      } catch (error) {
        console.error(`Error uploading file ${files[i].name}:`, error);
        throw error;
      }
    }

    setUploading(false);
    setProgress(null);
    return uploadedFiles;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Create the submission
      const submissionData = {
        team_id: teamId,
        hackathon_id: hackathonId,
        title,
        description,
        demo_link: demoLink,
        repo_link: repoLink,
        category,
      };

      const response = await api.post<Submission>('/submissions', submissionData);
      const submissionId = response.id;

      // Upload files if any
      if (files.length > 0) {
        await uploadFiles(submissionId);
      }

      setSuccessMessage('Submission created successfully!');
      // Reset form
      setTitle('');
      setDescription('');
      setDemoLink('');
      setRepoLink('');
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error creating submission:', error);
      setErrorMessage('Failed to create submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Submit Project</h2>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Project Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter project title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your project, its purpose, and key features"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="demoLink" className="block text-sm font-medium text-gray-700 mb-1">
              Demo Link
            </label>
            <input
              type="url"
              id="demoLink"
              value={demoLink}
              onChange={(e) => setDemoLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/demo"
            />
          </div>

          <div>
            <label htmlFor="repoLink" className="block text-sm font-medium text-gray-700 mb-1">
              Repository Link
            </label>
            <input
              type="url"
              id="repoLink"
              value={repoLink}
              onChange={(e) => setRepoLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://github.com/username/repo"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Files
          </label>
          <div className="flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-l-md cursor-pointer hover:bg-gray-200"
            >
              Choose Files
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
            >
              Browse
            </button>
          </div>

          {files.length > 0 && (
            <div className="mt-2 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
              <ul className="space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="flex justify-between items-center text-sm text-gray-600">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {uploading && progress !== null && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Uploading files... {progress}%</p>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting || uploading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              submitting || uploading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Project'}
          </button>
        </div>
      </form>
    </div>
  );
}