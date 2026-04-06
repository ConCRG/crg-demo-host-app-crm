import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, DollarSign, TrendingUp, Search, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import DealModal, { type DealFormData } from '../components/DealModal';
import {
  getDeals,
  createDeal,
  updateDeal,
  moveDeal,
  deleteDeal,
  DEAL_STAGES,
  type Deal,
} from '../api/deals';
import { useCanDelete } from '@/contexts/RoleContext';
import { Link } from 'react-router-dom';

const STAGE_CONFIG: Record<
  Deal['stage'],
  { label: string; headerClass: string; badgeClass: string }
> = {
  lead: {
    label: 'Lead',
    headerClass: 'bg-muted/50 border-b border-border',
    badgeClass: 'bg-muted text-foreground border-border hover:bg-muted',
  },
  qualified: {
    label: 'Qualified',
    headerClass: 'bg-muted/50 border-b border-border',
    badgeClass: 'bg-muted text-foreground border-border hover:bg-muted',
  },
  proposal: {
    label: 'Proposal',
    headerClass: 'bg-muted/50 border-b border-border',
    badgeClass: 'bg-muted text-foreground border-border hover:bg-muted',
  },
  negotiation: {
    label: 'Negotiation',
    headerClass: 'bg-muted/50 border-b border-border',
    badgeClass: 'bg-muted text-foreground border-border hover:bg-muted',
  },
  'closed-won': {
    label: 'Closed Won',
    headerClass: 'bg-muted/50 border-b border-border',
    badgeClass: 'bg-muted text-foreground border-border hover:bg-muted',
  },
  'closed-lost': {
    label: 'Closed Lost',
    headerClass: 'bg-muted/50 border-b border-border',
    badgeClass: 'bg-muted text-foreground border-border hover:bg-muted',
  },
};

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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface DealCardProps {
  deal: Deal;
  onDragStart: (e: React.DragEvent, deal: Deal) => void;
  onClick: (deal: Deal) => void;
  onDelete?: (deal: Deal) => void;
}

function DealCard({ deal, onDragStart, onClick, onDelete }: DealCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal)}
      className="bg-white rounded-lg border border-border p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/30 transition-all duration-150 select-none"
    >
      <div className="flex items-start justify-between gap-1">
        <Link
          to={`/deals/${deal.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block text-sm font-medium text-foreground truncate hover:underline mb-1 flex-1 min-w-0"
        >
          {deal.name}
        </Link>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onClick(deal); }}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Edit deal"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(deal); }}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
              title="Delete deal"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground truncate">{deal.companyName}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{formatCurrency(deal.value)}</span>
        <span className="text-xs text-muted-foreground">{formatDate(deal.expectedCloseDate)}</span>
      </div>

      <div className="mt-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Probability</span>
          <span>{deal.probability}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-300 bg-foreground"
            style={{ width: `${deal.probability}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface StageColumnProps {
  stage: Deal['stage'];
  deals: Deal[];
  onDragStart: (e: React.DragEvent, deal: Deal) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stage: Deal['stage']) => void;
  onDealClick: (deal: Deal) => void;
  onDealDelete?: (deal: Deal) => void;
}

function StageColumn({ stage, deals, onDragStart, onDragOver, onDrop, onDealClick, onDealDelete }: StageColumnProps) {
  const config = STAGE_CONFIG[stage];
  const stageDeals = deals.filter((d) => d.stage === stage);
  const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      className="flex-shrink-0 w-72 flex flex-col rounded-lg border border-border bg-muted/30 overflow-hidden"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage)}
    >
      <div className={`p-3 ${config.headerClass}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-foreground">{config.label}</span>
          <Badge className={config.badgeClass + ' text-xs px-1.5'}>{stageDeals.length}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{formatCurrency(totalValue)}</p>
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] max-h-[calc(100vh-320px)]">
        {stageDeals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onDragStart={onDragStart}
            onClick={onDealClick}
            onDelete={onDealDelete}
          />
        ))}
        {stageDeals.length === 0 && (
          <div className="text-center text-muted-foreground text-xs py-8">Drop deals here</div>
        )}
      </div>
    </div>
  );
}

export default function Deals() {
  const canDelete = useCanDelete();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    deal: Deal | null;
    targetStage: Deal['stage'] | null;
  }>({ isOpen: false, deal: null, targetStage: null });
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<Deal['stage'] | 'all'>('all');

  useEffect(() => { loadDeals(); }, []);

  const loadDeals = async () => {
    setLoading(true);
    const data = await getDeals();
    setDeals(data);
    setLoading(false);
  };

  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      const matchesSearch =
        !searchTerm ||
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage = stageFilter === 'all' || d.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [deals, searchTerm, stageFilter]);

  const totalPipelineValue = filteredDeals
    .filter((d) => d.stage !== 'closed-lost')
    .reduce((sum, d) => sum + d.value, 0);

  const weightedPipelineValue = filteredDeals
    .filter((d) => d.stage !== 'closed-lost' && d.stage !== 'closed-won')
    .reduce((sum, d) => sum + d.value * (d.probability / 100), 0);

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
      if (!draggedDeal || draggedDeal.stage === targetStage) { setDraggedDeal(null); return; }
      if (targetStage === 'closed-won' || targetStage === 'closed-lost') {
        setConfirmModal({ isOpen: true, deal: draggedDeal, targetStage });
        return;
      }
      await performMove(draggedDeal.id, targetStage);
      setDraggedDeal(null);
    },
    [draggedDeal]
  );

  const performMove = async (dealId: string, targetStage: Deal['stage']) => {
    const updatedDeal = await moveDeal(dealId, targetStage);
    if (updatedDeal) setDeals((prev) => prev.map((d) => (d.id === dealId ? updatedDeal : d)));
  };

  const handleConfirmMove = async () => {
    if (confirmModal.deal && confirmModal.targetStage) {
      await performMove(confirmModal.deal.id, confirmModal.targetStage);
    }
    setConfirmModal({ isOpen: false, deal: null, targetStage: null });
    setDraggedDeal(null);
  };

  const handleSaveDeal = async (formData: DealFormData) => {
    if (formData.id) {
      const updated = await updateDeal(formData.id, formData);
      if (updated) {
        setDeals((prev) => prev.map((d) => (d.id === formData.id ? updated : d)));
        toast.success('Deal updated');
      }
    } else {
      const newDeal = await createDeal(formData);
      if (newDeal) {
        setDeals((prev) => [...prev, newDeal]);
        toast.success('Deal created');
      }
    }
  };

  const handleDeleteDeal = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteDeal(deleteTarget.id);
      setDeals((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete deal');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Deals Pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag and drop deals between stages to update their progress.
          </p>
        </div>
        <Button id="btn-add-deal" onClick={() => { setSelectedDeal(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as Deal['stage'] | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {DEAL_STAGES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(searchTerm || stageFilter !== 'all') && (
          <span className="text-sm text-muted-foreground self-center">
            {filteredDeals.length} of {deals.length} deals
          </span>
        )}
      </div>

      {/* Pipeline stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Pipeline Value</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(totalPipelineValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 bg-muted rounded-lg">
              <TrendingUp className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Weighted Pipeline</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(weightedPipelineValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 pb-4 min-w-max">
          {DEAL_STAGES.map((stage) => (
            <StageColumn
              key={stage.value}
              stage={stage.value}
              deals={filteredDeals}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDealClick={(deal) => { setSelectedDeal(deal); setIsModalOpen(true); }}
              onDealDelete={canDelete ? (deal) => setDeleteTarget(deal) : undefined}
            />
          ))}
        </div>
      </div>

      <DealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDeal}
        deal={selectedDeal}
        companies={MOCK_COMPANIES}
        contacts={MOCK_CONTACTS}
      />

      {/* Delete deal dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Deal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">"{deleteTarget?.name}"</span>?{' '}
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteDeal} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm close dialog */}
      <Dialog
        open={confirmModal.isOpen}
        onOpenChange={(open) => {
          if (!open) setConfirmModal({ isOpen: false, deal: null, targetStage: null });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmModal.targetStage === 'closed-won' ? 'Mark as Won?' : 'Mark as Lost?'}
            </DialogTitle>
            <DialogDescription>
              {confirmModal.targetStage === 'closed-won'
                ? `Mark "${confirmModal.deal?.name}" as Closed Won?`
                : `Mark "${confirmModal.deal?.name}" as Closed Lost?`}
            </DialogDescription>
          </DialogHeader>
          {confirmModal.deal && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deal Value:</span>
                <span className="font-medium">{formatCurrency(confirmModal.deal.value)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Company:</span>
                <span className="font-medium">{confirmModal.deal.companyName}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmModal({ isOpen: false, deal: null, targetStage: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmMove}
              variant={confirmModal.targetStage === 'closed-won' ? 'default' : 'destructive'}
            >
              {confirmModal.targetStage === 'closed-won' ? 'Mark as Won' : 'Mark as Lost'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
