import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Select from '@/components/atoms/Select';
import Label from '@/components/atoms/Label';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const MilestoneModal = ({ isOpen, onClose, milestone, onSave, projectId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'Pending',
    priority: 'Medium',
    progress: 0
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (milestone) {
      setFormData({
        title: milestone.title || '',
        description: milestone.description || '',
        dueDate: milestone.dueDate ? format(new Date(milestone.dueDate), 'yyyy-MM-dd') : '',
        status: milestone.status || 'Pending',
        priority: milestone.priority || 'Medium',
        progress: milestone.progress || 0
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        status: 'Pending',
        priority: 'Medium',
        progress: 0
      });
    }
    setErrors({});
  }, [milestone, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const milestoneData = {
        ...formData,
        projectId: projectId,
        dueDate: new Date(formData.dueDate).toISOString(),
        progress: parseInt(formData.progress)
      };

      await onSave(milestoneData);
      onClose();
    } catch (error) {
      console.error('Error saving milestone:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {milestone ? 'Edit Milestone' : 'Create New Milestone'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <ApperIcon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter milestone title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe this milestone..."
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className={errors.dueDate ? 'border-red-500' : ''}
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => handleInputChange('progress', e.target.value)}
                  className={errors.progress ? 'border-red-500' : ''}
                />
                {errors.progress && (
                  <p className="text-red-500 text-sm mt-1">{errors.progress}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-24"
            >
              {loading ? (
                <ApperIcon name="Loader2" size={16} className="animate-spin" />
              ) : (
                milestone ? 'Update' : 'Create'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestoneModal;