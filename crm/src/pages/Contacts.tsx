import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ContactModal from '../components/ContactModal';
import {
  getContacts,
  type ContactWithDetails,
  type ContactFilters,
  type PaginatedResponse,
} from '../api/contacts';
import { Link } from 'react-router-dom';

const statusBadgeClass: Record<string, string> = {
  active: 'bg-muted text-foreground border-border hover:bg-muted',
  lead: 'bg-muted text-foreground border-border hover:bg-muted',
  inactive: 'bg-muted text-foreground border-border hover:bg-muted',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  lead: 'Lead',
  inactive: 'Inactive',
};

function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Contacts() {
  const [contacts, setContacts] = useState<ContactWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<ContactWithDetails>, 'data'>>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactWithDetails | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ContactFilters = {};
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter as ContactFilters['status'];
      if (searchTerm) filters.search = searchTerm;
      const response = await getContacts(filters, page, 10);
      setContacts(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
      });
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, page]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);
  useEffect(() => { setPage(1); }, [searchTerm, statusFilter]);

  const startRecord = (pagination.page - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your contacts and track their activities.</p>
        </div>
        <Button onClick={() => { setEditingContact(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-md border bg-card">
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
            Loading contacts...
          </div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-md border bg-card py-16 text-center">
          <Search className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No contacts found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Get started by adding your first contact.'}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => { setEditingContact(contact); setIsModalOpen(true); }}
                  >
                    <TableCell>
                      <Link
                        to={`/contacts/${contact.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {contact.firstName} {contact.lastName}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{contact.email}</TableCell>
                    <TableCell className="text-muted-foreground">{contact.company ?? '—'}</TableCell>
                    <TableCell>
                      <Badge className={statusBadgeClass[contact.status]}>
                        {statusLabels[contact.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(contact.lastActivity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startRecord}–{endRecord} of {pagination.total} contacts
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-1">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingContact(null); }}
        onSave={() => { setIsModalOpen(false); setEditingContact(null); fetchContacts(); }}
        contact={editingContact}
      />
    </div>
  );
}
