import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import MilestoneCard from '@/components/molecules/MilestoneCard';
import MilestoneModal from '@/components/organisms/MilestoneModal';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import { milestoneService } from '@/services/api/milestoneService';

const MilestonesView = ({ projectId }) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, milestone: null });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadMilestones();
  }, [projectId]);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const [milestonesData, statsData] = await Promise.all([
        milestoneService.getByProjectId(projectId),
        milestoneService.getProjectStats(projectId)
      ]);
      setMilestones(milestonesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading milestones:', error);
      toast.error('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMilestone = () => {
    setModal({ isOpen: true, milestone: null });
  };

  const handleEditMilestone = (milestone) => {
    setModal({ isOpen: true, milestone });
  };

  const handleSaveMilestone = async (milestoneData) => {
    try {
      if (modal.milestone) {
        await milestoneService.update(modal.milestone.Id, milestoneData);
        toast.success('Milestone updated successfully');
      } else {
        await milestoneService.create(milestoneData);
        toast.success('Milestone created successfully');
      }
      loadMilestones();
    } catch (error) {
      console.error('Error saving milestone:', error);
      toast.error('Failed to save milestone');
      throw error;
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) {
      return;
    }

    try {
      await milestoneService.remove(milestoneId);
      toast.success('Milestone deleted successfully');
      loadMilestones();
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast.error('Failed to delete milestone');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Milestones</h2>
          <p className="text-gray-600">Track key deliverables and project progress</p>
        </div>
        <Button onClick={handleCreateMilestone} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={16} />
          Add Milestone
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>
      )}

      {/* Milestones Grid */}
      {milestones.length === 0 ? (
        <Empty
          icon="Target"
          title="No milestones yet"
          description="Create your first milestone to start tracking project progress"
          action={{
            label: "Add Milestone",
            onClick: handleCreateMilestone
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {milestones.map(milestone => (
            <MilestoneCard
              key={milestone.Id}
              milestone={milestone}
              onEdit={handleEditMilestone}
              onDelete={handleDeleteMilestone}
            />
          ))}
        </div>
      )}

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, milestone: null })}
        milestone={modal.milestone}
        onSave={handleSaveMilestone}
        projectId={projectId}
      />
    </div>
  );
};

export default MilestonesView;