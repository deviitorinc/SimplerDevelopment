'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { pBtnPrimary, pCard, pInput } from '@/components/portal/portal-ui';

export default function SimpleEditorForm({ siteId, postId, initialBlocks }: { siteId: number, postId: number, initialBlocks: any[] }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [saving, setSaving] = useState(false);

  // Helper to update a block by type
  const updateBlock = (type: string, newValues: any) => {
    setBlocks(blocks.map(b => b.type === type ? { ...b, values: { ...b.values, ...newValues } } : b));
  };

  const getBlock = (type: string) => blocks.find(b => b.type === type)?.values || {};

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/portal/cms/websites/${siteId}/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: JSON.stringify(blocks) })
    });
    setSaving(false);
    if (res.ok) {
      alert('Website updated successfully!');
      router.refresh();
    } else {
      alert('Failed to save website');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Section */}
      <div className={`${pCard} p-6 space-y-4`}>
        <h2 className="text-lg font-bold border-b pb-2">Hero Section</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Headline</label>
          <input 
            type="text" 
            className={pInput + " w-full"} 
            value={getBlock('hero').title || ''} 
            onChange={e => updateBlock('hero', { title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subheadline</label>
          <input 
            type="text" 
            className={pInput + " w-full"} 
            value={getBlock('hero').subtitle || ''} 
            onChange={e => updateBlock('hero', { subtitle: e.target.value })}
          />
        </div>
      </div>

      {/* About Section */}
      <div className={`${pCard} p-6 space-y-4`}>
        <h2 className="text-lg font-bold border-b pb-2">About Us</h2>
        <div>
          <label className="block text-sm font-medium mb-1">About Text (HTML allowed)</label>
          <textarea 
            className={pInput + " w-full"} 
            rows={5}
            value={getBlock('text').content || ''} 
            onChange={e => updateBlock('text', { content: e.target.value })}
          />
        </div>
      </div>

      {/* Products Section */}
      <div className={`${pCard} p-6 space-y-4`}>
        <h2 className="text-lg font-bold border-b pb-2">Featured Products</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Section Title</label>
          <input 
            type="text" 
            className={pInput + " w-full"} 
            value={getBlock('featured-products').title || ''} 
            onChange={e => updateBlock('featured-products', { title: e.target.value })}
          />
        </div>
      </div>

      {/* Footer Section */}
      <div className={`${pCard} p-6 space-y-4`}>
        <h2 className="text-lg font-bold border-b pb-2">Footer</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Copyright Text</label>
          <input 
            type="text" 
            className={pInput + " w-full"} 
            value={getBlock('site-footer').copyright || ''} 
            onChange={e => updateBlock('site-footer', { copyright: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className={pBtnPrimary}
        >
          {saving ? 'Saving...' : 'Publish Changes'}
        </button>
      </div>

    </div>
  );
}
