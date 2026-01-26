import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Select, Badge, DataTable } from '../components';
import ContactModal from '../components/ContactModal';
import {
  getContacts,
  type ContactWithDetails,
  type ContactFilters,
  type PaginatedResponse,
} from '../api/contacts';

// Avatar initials component
function Avatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  return (
    <div className="flex items-center">
      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-3">
        {initials}
      </div>
      <span className="font-medium">
        {firstName} {lastName}
      </span>
    </div>
  );
}

// Status badge colors
const statusColors: Record<string, 'green' | 'yellow' | 'gray'> = {
  active: 'green',
  lead: 'yellow',
  inactive: 'gray',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  lead: 'Lead',
  inactive: 'Inactive',
};

// Format date for display
function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Contacts() {
  const [contacts, setContacts] = useState<ContactWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<ContactWithDetails>, 'data'>>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactWithDetails | null>(null);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ContactFilters = {};
      if (statusFilter) filters.status = statusFilter as ContactFilters['status'];
      if (searchTerm) filters.search = searchTerm;

      const response = await getContacts(filters, page, 10);
      setContacts(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, page]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  // Handle row click
  const handleRowClick = (contact: ContactWithDetails) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  // Handle add contact
  const handleAddContact = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  // Handle modal save
  const handleSave = () => {
    setIsModalOpen(false);
    setEditingContact(null);
    fetchContacts();
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  // Table columns
  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (contact: ContactWithDetails) => (
        <Avatar firstName={contact.firstName} lastName={contact.lastName} />
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (contact: ContactWithDetails) => (
        <span className="text-gray-600">{contact.email}</span>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (contact: ContactWithDetails) => (
        <span className="text-gray-600">{contact.company || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (contact: ContactWithDetails) => (
        <Badge color={statusColors[contact.status]}>
          {statusLabels[contact.status]}
        </Badge>
      ),
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      render: (contact: ContactWithDetails) => (
        <span className="text-gray-500">{formatDate(contact.lastActivity)}</span>
      ),
    },
  ];

  // Filter options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'lead', label: 'Lead' },
    { value: 'inactive', label: 'Inactive' },
  ];

  // Pagination range info
  const startRecord = (pagination.page - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your contacts and track their activities.
          </p>
        </div>
        <Button onClick={handleAddContact}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-500">Loading contacts...</span>
          </div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Search className="h-12 w-12" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No contacts found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm || statusFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first contact.'}
            </p>
            {!searchTerm && !statusFilter && (
              <div className="mt-6">
                <Button onClick={handleAddContact}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <DataTable
              columns={columns}
              data={contacts}
              keyField="id"
              onRowClick={handleRowClick}
            />
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {startRecord} to {endRecord} of {pagination.total} contacts
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        contact={editingContact}
      />
    </div>
  );
}
