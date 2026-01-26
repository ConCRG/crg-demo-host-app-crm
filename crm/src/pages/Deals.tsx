import { useState, useEffect, useCallback } from 'react';
import { Plus, DollarSign, TrendingUp } from 'lucide-react';
import { Button, Modal } from '../components';
import DealModal, { type DealFormData } from '../components/DealModal';
import {
  getDeals,
  createDeal,
  updateDeal,
  moveDeal,
  DEAL_STAGES,
  type Deal,
} from '../api/deals';

// Stage configuration with colors
const STAGE_CONFIG: Record<
  Deal['stage'],
  { label: string; bgColor: string; borderColor: string; headerBg: string }
> = {
  lead: {
    label: 'Lead',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    headerBg: 'bg-gray-100',
  },
  qualified: {
    label: 'Qualified',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    headerBg: 'bg-blue-100',
  },
  proposal: {
    label: 'Proposal',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    headerBg: 'bg-yellow-100',
  },
  negotiation: {
    label: 'Negotiation',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    headerBg: 'bg-orange-100',
  },
  'closed-won': {
    label: 'Closed Won',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    headerBg: 'bg-green-100',
  },
  'closed-lost': {
    label: 'Closed Lost',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    headerBg: 'bg-red-100',
  },
};

// Mock companies and contacts for the modal dropdowns
const MOCK_COMPANIES = [
  { value: 'comp-001', label: 'Acme Corporation' },
  { value: 'comp-002', label: 'TechStart Inc' },
  { value: 'comp-003', label: 'Global Industries' },
  { value: 'comp-004', label: 'Creative Solutions Ltd' },
  { value: 'comp-005', label: 'DataDriven Co' },
  { value: 'comp-006', label: 'SecureNet Systems' },
  { value: 'comp-007', label: 'PeopleFirst HR' },
  { value: 'comp-008', label: 'ShopSmart Online' },
  { value: 'comp-009', label: 'AppVenture Labs' },
  { value: 'comp-010', label: 'Insight Analytics' },
];

const MOCK_CONTACTS = [
  { value: 'cont-001', label: 'John Smith' },
  { value: 'cont-002', label: 'Sarah Johnson' },
  { value: 'cont-003', label: 'Michael Chen' },
  { value: 'cont-004', label: 'Emily Davis' },
  { value: 'cont-005', label: 'Robert Wilson' },
  { value: 'cont-006', label: 'Amanda Martinez' },
  { value: 'cont-007', label: 'David Brown' },
  { value: 'cont-008', label: 'Lisa Anderson' },
  { value: 'cont-009', label: 'James Taylor' },
  { value: 'cont-010', label: 'Patricia White' },
];

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Deal Card Component
interface DealCardProps {
  deal: Deal;
  onDragStart: (e: React.DragEvent, deal: Deal) => void;
  onClick: (deal: Deal) => void;
}

function DealCard({ deal, onDragStart, onClick }: DealCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal)}
      onClick={() => onClick(deal)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-pointer
                 hover:shadow-md hover:border-gray-300 transition-all duration-200"
    >
      <h4 className="font-medium text-gray-900 text-sm truncate">{deal.name}</h4>
      <p className="text-xs text-gray-500 mt-1 truncate">{deal.companyName}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
        <span className="text-xs text-gray-500">{formatDate(deal.expectedCloseDate)}</span>
      </div>

      {/* Probability bar */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Probability</span>
          <span>{deal.probability}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              deal.probability >= 75
                ? 'bg-green-500'
                : deal.probability >= 50
                  ? 'bg-yellow-500'
                  : deal.probability >= 25
                    ? 'bg-orange-500'
                    : 'bg-red-500'
            }`}
            style={{ width: `${deal.probability}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Stage Column Component
interface StageColumnProps {
  stage: Deal['stage'];
  deals: Deal[];
  onDragStart: (e: React.DragEvent, deal: Deal) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stage: Deal['stage']) => void;
  onDealClick: (deal: Deal) => void;
}

function StageColumn({
  stage,
  deals,
  onDragStart,
  onDragOver,
  onDrop,
  onDealClick,
}: StageColumnProps) {
  const config = STAGE_CONFIG[stage];
  const stageDeals = deals.filter((d) => d.stage === stage);
  const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      className={`flex-shrink-0 w-72 flex flex-col rounded-lg border-2 ${config.borderColor} ${config.bgColor}`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage)}
    >
      {/* Column Header */}
      <div className={`p-3 rounded-t-md ${config.headerBg}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{config.label}</h3>
          <span className="text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded-full">
            {stageDeals.length}
          </span>
        </div>
        <div className="text-sm text-gray-600 mt-1">{formatCurrency(totalValue)}</div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] max-h-[calc(100vh-320px)]">
        {stageDeals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onDragStart={onDragStart}
            onClick={onDealClick}
          />
        ))}
        {stageDeals.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">Drop deals here</div>
        )}
      </div>
    </div>
  );
}

// Main Deals Page Component
export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // Confirmation modal for closed stages
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    deal: Deal | null;
    targetStage: Deal['stage'] | null;
  }>({ isOpen: false, deal: null, targetStage: null });

  // Load deals on mount
  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    const data = await getDeals();
    setDeals(data);
    setLoading(false);
  };

  // Calculate total pipeline value (excluding closed-lost)
  const totalPipelineValue = deals
    .filter((d) => d.stage !== 'closed-lost')
    .reduce((sum, d) => sum + d.value, 0);

  // Weighted pipeline value
  const weightedPipelineValue = deals
    .filter((d) => d.stage !== 'closed-lost' && d.stage !== 'closed-won')
    .reduce((sum, d) => sum + d.value * (d.probability / 100), 0);

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', deal.id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetStage: Deal['stage']) => {
      e.preventDefault();

      if (!draggedDeal || draggedDeal.stage === targetStage) {
        setDraggedDeal(null);
        return;
      }

      // Show confirmation for closed stages
      if (targetStage === 'closed-won' || targetStage === 'closed-lost') {
        setConfirmModal({
          isOpen: true,
          deal: draggedDeal,
          targetStage,
        });
        return;
      }

      // Move deal directly for other stages
      await performMove(draggedDeal.id, targetStage);
      setDraggedDeal(null);
    },
    [draggedDeal]
  );

  const performMove = async (dealId: string, targetStage: Deal['stage']) => {
    const updatedDeal = await moveDeal(dealId, targetStage);
    if (updatedDeal) {
      setDeals((prev) => prev.map((d) => (d.id === dealId ? updatedDeal : d)));
    }
  };

  const handleConfirmMove = async () => {
    if (confirmModal.deal && confirmModal.targetStage) {
      await performMove(confirmModal.deal.id, confirmModal.targetStage);
    }
    setConfirmModal({ isOpen: false, deal: null, targetStage: null });
    setDraggedDeal(null);
  };

  const handleCancelMove = () => {
    setConfirmModal({ isOpen: false, deal: null, targetStage: null });
    setDraggedDeal(null);
  };

  // Modal handlers
  const handleAddDeal = () => {
    setSelectedDeal(null);
    setIsModalOpen(true);
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  const handleSaveDeal = async (formData: DealFormData) => {
    if (formData.id) {
      // Update existing deal
      const updatedDeal = await updateDeal(formData.id, formData);
      if (updatedDeal) {
        setDeals((prev) => prev.map((d) => (d.id === formData.id ? updatedDeal : d)));
      }
    } else {
      // Create new deal
      const newDeal = await createDeal(formData);
      if (newDeal) {
        setDeals((prev) => [...prev, newDeal]);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals Pipeline</h1>
          <p className="mt-1 text-gray-600">
            Drag and drop deals between stages to update their progress.
          </p>
        </div>
        <Button onClick={handleAddDeal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Pipeline Value</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalPipelineValue)}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Weighted Pipeline</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(weightedPipelineValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 pb-4 min-w-max">
          {DEAL_STAGES.map((stage) => (
            <StageColumn
              key={stage.value}
              stage={stage.value}
              deals={deals}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDealClick={handleDealClick}
            />
          ))}
        </div>
      </div>

      {/* Deal Modal */}
      <DealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDeal}
        deal={selectedDeal}
        companies={MOCK_COMPANIES}
        contacts={MOCK_CONTACTS}
      />

      {/* Confirmation Modal for Closed Stages */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={handleCancelMove}
        title={
          confirmModal.targetStage === 'closed-won'
            ? 'Mark as Won?'
            : 'Mark as Lost?'
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {confirmModal.targetStage === 'closed-won' ? (
              <>
                Are you sure you want to mark{' '}
                <span className="font-medium text-gray-900">{confirmModal.deal?.name}</span> as{' '}
                <span className="text-green-600 font-medium">Closed Won</span>?
              </>
            ) : (
              <>
                Are you sure you want to mark{' '}
                <span className="font-medium text-gray-900">{confirmModal.deal?.name}</span> as{' '}
                <span className="text-red-600 font-medium">Closed Lost</span>?
              </>
            )}
          </p>
          {confirmModal.deal && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Deal Value:</span>
                <span className="font-medium">{formatCurrency(confirmModal.deal.value)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Company:</span>
                <span className="font-medium">{confirmModal.deal.companyName}</span>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleCancelMove}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmMove}
              className={
                confirmModal.targetStage === 'closed-won'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {confirmModal.targetStage === 'closed-won' ? 'Mark as Won' : 'Mark as Lost'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
