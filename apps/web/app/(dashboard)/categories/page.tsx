'use client';

import * as React from 'react';
import { useCategories, Category } from '@/hooks/useCategories';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth.store';
import { CATEGORY_ICONS, COLORS_PALETTE } from '@/lib/constants';
import { Plus, Pencil, Trash2, Tag, Check, ShieldAlert } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as Icons from 'lucide-react';

// Dynamic Icon Component helper
function CategoryIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
 const IconComponent = (Icons as any)[name] || Icons.Tag;
 return <IconComponent className={className} style={style} />;
}

// Zod Schema
const categoryFormSchema = z.object({
 name: z.string().min(2, 'Name must be at least 2 characters'),
 type: z.enum(['EXPENSE', 'INCOME']),
 color: z.string().min(1, 'Color is required'),
 icon: z.string().min(1, 'Icon is required'),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export default function CategoriesPage() {
 const user = useAuthStore((state) => state.user);
 const isAdmin = user?.role === 'ADMIN';

 const {
 categories,
 isLoading,
 createCategory,
 updateCategory,
 deleteCategory,
 } = useCategories();

 const [activeTab, setActiveTab] = React.useState<'EXPENSE' | 'INCOME'>('EXPENSE');
 const [isModalOpen, setIsModalOpen] = React.useState(false);
 const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
 const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

 const {
 register,
 handleSubmit,
 control,
 reset,
 setValue,
 watch,
 formState: { errors, isSubmitting },
 } = useForm<CategoryFormData>({
 resolver: zodResolver(categoryFormSchema),
 defaultValues: {
 name: '',
 type: 'EXPENSE',
 color: '#6366f1',
 icon: 'Tag',
 },
 });

 const selectedColor = watch('color');
 const selectedIcon = watch('icon');

 // Filter categories by type
 const filteredCategories = React.useMemo(() => {
 return categories.filter((cat) => cat.type === activeTab);
 }, [categories, activeTab]);

 // Open for create
 const handleCreateOpen = () => {
 setSelectedCategory(null);
 reset({
 name: '',
 type: activeTab,
 color: '#6366f1',
 icon: 'Tag',
 });
 setIsModalOpen(true);
 };

 // Open for edit
 const handleEditOpen = (cat: Category, e: React.MouseEvent) => {
 e.stopPropagation();
 setSelectedCategory(cat);
 reset({
 name: cat.name,
 type: cat.type,
 color: cat.color || '#6366f1',
 icon: cat.icon || 'Tag',
 });
 setIsModalOpen(true);
 };

 // Handle Submit
 const onSubmit = async (data: CategoryFormData) => {
 try {
 if (selectedCategory) {
 await updateCategory({
 id: selectedCategory.id,
 data: {
 name: data.name,
 color: data.color,
 icon: data.icon,
 },
 });
 } else {
 await createCategory(data);
 }
 setIsModalOpen(false);
 } catch {
 // toast is handled in the hook
 }
 };

 // Handle Delete Confirmation
 const handleDeleteClick = (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 setDeleteConfirmId(id);
 };

 const confirmDelete = async () => {
 if (!deleteConfirmId) return;
 try {
 await deleteCategory(deleteConfirmId);
 setDeleteConfirmId(null);
 } catch {
 // toast is handled in the hook
 }
 };

 return (
 <div className="space-y-6 pb-20">
 <PageHeader
 title="Category Management"
 description="Organize your cash flow. Customize your custom categories or manage default categories."
 action={
 <Button onClick={handleCreateOpen}>
 <Plus className="w-4 h-4 mr-2" /> Add Category
 </Button>
 }
 />

 {/* Tabs */}
 <div className="flex border-b border-slate-200 dark:border-slate-800">
 <button
 onClick={() => setActiveTab('EXPENSE')}
 className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
 activeTab === 'EXPENSE'
 ? 'border-primary-500 text-primary-400 font-bold'
 : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
 }`}
 >
 Expense Categories
 </button>
 <button
 onClick={() => setActiveTab('INCOME')}
 className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
 activeTab === 'INCOME'
 ? 'border-primary-500 text-primary-400 font-bold'
 : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
 }`}
 >
 Income Categories
 </button>
 </div>

 {isLoading ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
 {[1, 2, 3, 4, 5, 6].map((n) => (
 <Card key={n} className="h-24 animate-pulse bg-slate-50 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700" />
 ))}
 </div>
 ) : filteredCategories.length === 0 ? (
 <Card className="flex flex-col items-center justify-center p-12 text-center">
 <div className="p-4 rounded-full bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 mb-4">
 <Tag className="w-8 h-8" />
 </div>
 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No categories found</h3>
 <p className="text-sm text-slate-500 max-w-sm mt-1">
 Create custom categories to organize your expenses and income precisely.
 </p>
 </Card>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
 {filteredCategories.map((cat) => {
 const isSystem = cat.isSystem;
 const canModify = !isSystem || isAdmin;

 return (
 <Card
 key={cat.id}
 className="flex items-center justify-between p-4 bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:border-slate-700/60 backdrop-blur-md transition-all group"
 >
 <div className="flex items-center gap-3">
 {/* Category icon circle */}
 <div
 className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg"
 style={{ backgroundColor: cat.color || '#6366f1' }}
 >
 <CategoryIcon name={cat.icon || 'Tag'} className="w-5 h-5" />
 </div>
 <div>
 <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{cat.name}</h4>
 <div className="flex items-center gap-1.5 mt-0.5">
 {isSystem ? (
 <Badge variant="default" className="text-[9px] px-1 py-0 bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-750">
 System
 </Badge>
 ) : (
 <Badge variant="success" className="text-[9px] px-1 py-0 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
 Custom
 </Badge>
 )}
 </div>
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
 {canModify ? (
 <>
 <button
 onClick={(e) => handleEditOpen(cat, e)}
 className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-800 transition-all"
 title="Edit Category"
 >
 <Pencil className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={(e) => handleDeleteClick(cat.id, e)}
 className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
 title="Delete Category"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </>
 ) : (
 <span className="p-1.5 text-slate-600 cursor-not-allowed" title="System categories are read-only for standard users.">
 <Icons.Lock className="w-3.5 h-3.5" />
 </span>
 )}
 </div>
 </Card>
 );
 })}
 </div>
 )}

 {/* CREATE & EDIT MODAL */}
 {isModalOpen && (
 <Modal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 title={selectedCategory ? 'Edit Category' : 'Create Category'}
 >
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
 {selectedCategory && selectedCategory.isSystem && isAdmin && (
 <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs mb-2 leading-relaxed">
 <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
 <span>
 <strong>Warning:</strong> You are modifying a system default category. Changes will affect all users on the platform.
 </span>
 </div>
 )}

 <Input
 label="Category Name"
 placeholder="e.g. Pet Supplies, Gym Membership, Dividends"
 error={errors.name?.message}
 {...register('name')}
 />

 {!selectedCategory && (
 <Select
 label="Type"
 options={[
 { value: 'EXPENSE', label: 'Expense' },
 { value: 'INCOME', label: 'Income' },
 ]}
 error={errors.type?.message}
 {...register('type')}
 />
 )}

 {/* COLOR PICKER */}
 <div className="space-y-2">
 <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Theme Color</label>
 <div className="flex flex-wrap gap-2 p-3 bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl">
 {COLORS_PALETTE.map((c) => {
 const isChecked = selectedColor === c.value;
 return (
 <button
 key={c.value}
 type="button"
 onClick={() => setValue('color', c.value)}
 className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md relative"
 style={{ backgroundColor: c.value }}
 title={c.name}
 >
 {isChecked && <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />}
 </button>
 );
 })}
 </div>
 {errors.color && <p className="text-xs text-red-400 mt-1">{errors.color.message}</p>}
 </div>

 {/* ICON PICKER */}
 <div className="space-y-2">
 <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Category Icon</label>
 <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl max-h-48 overflow-y-auto custom-scrollbar">
 {Array.from(new Set(CATEGORY_ICONS.map((i) => i.icon))).map((iconName) => {
 const isSelected = selectedIcon === iconName;
 return (
 <button
 key={iconName}
 type="button"
 onClick={() => setValue('icon', iconName)}
 className={`h-9 rounded-lg flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all ${
 isSelected
 ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40'
 : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 border border-transparent'
 }`}
 title={iconName}
 >
 <CategoryIcon name={iconName} className="w-4 h-4" />
 </button>
 );
 })}
 </div>
 {errors.icon && <p className="text-xs text-red-400 mt-1">{errors.icon.message}</p>}
 </div>

 <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-850">
 <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
 Cancel
 </Button>
 <Button type="submit" isLoading={isSubmitting}>
 {selectedCategory ? 'Save Changes' : 'Create Category'}
 </Button>
 </div>
 </form>
 </Modal>
 )}

 {/* DELETE CONFIRMATION DIALOG */}
 {deleteConfirmId && (
 <Modal
 isOpen={!!deleteConfirmId}
 onClose={() => setDeleteConfirmId(null)}
 title="Delete Category"
 >
 <div className="space-y-4 pt-2">
 <p className="text-sm text-slate-600 dark:text-slate-300">
 Are you sure you want to delete this category? Any transaction, budget, or savings goal associated with this category will have its category set to undefined/none.
 </p>

 <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-850">
 <Button type="button" variant="outline" onClick={() => setDeleteConfirmId(null)}>
 Cancel
 </Button>
 <Button type="button" variant="destructive" onClick={confirmDelete}>
 Delete Category
 </Button>
 </div>
 </div>
 </Modal>
 )}
 </div>
 );
}
